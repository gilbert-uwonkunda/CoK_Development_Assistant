// scripts/ingestStructuredZones.js

const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');
require('dotenv').config();

/**
 * Build full text description from structured zone data
 */
function buildFullTextDescription(zone) {
    let text = `${zone.zone_name} (${zone.zone_code})\n\n`;
    
    // Description
    if (zone.description) {
        text += `DESCRIPTION:\n${zone.description}\n\n`;
    }
    
    // Permitted Uses
    if (zone.permitted_uses && zone.permitted_uses.length > 0) {
        text += `PERMITTED USES:\n`;
        zone.permitted_uses.forEach(use => {
            text += `• ${use}\n`;
        });
        text += '\n';
    }
    
    // Prohibited Uses
    if (zone.prohibited_uses && zone.prohibited_uses.length > 0) {
        text += `PROHIBITED USES:\n`;
        zone.prohibited_uses.forEach(use => {
            text += `• ${use}\n`;
        });
        text += '\n';
    }
    
    // Conditional Uses
    if (zone.conditional_uses && zone.conditional_uses.length > 0) {
        text += `CONDITIONAL USES (Require CoK Approval):\n`;
        zone.conditional_uses.forEach(use => {
            text += `• ${use}\n`;
        });
        text += '\n';
    }
    
    // Coverage Requirements
    if (zone.coverage) {
        text += `COVERAGE REQUIREMENTS:\n`;
        if (zone.coverage.max_building_coverage) {
            text += `• Maximum Building Coverage: ${(zone.coverage.max_building_coverage * 100)}%\n`;
        }
        if (zone.coverage.min_landscape_coverage) {
            text += `• Minimum Landscape Coverage: ${(zone.coverage.min_landscape_coverage * 100)}%\n`;
        }
        if (zone.coverage.max_far) {
            text += `• Maximum FAR: ${zone.coverage.max_far}\n`;
        }
        text += '\n';
    }
    
    // Density (for residential zones)
    if (zone.density) {
        text += `DENSITY REQUIREMENTS:\n`;
        if (zone.density.single_use) {
            text += `• Single Use: ${zone.density.single_use.min}-${zone.density.single_use.max} ${zone.density.single_use.unit}\n`;
        }
        if (zone.density.mixed_use) {
            text += `• Mixed Use: ${zone.density.mixed_use.min}-${zone.density.mixed_use.max} ${zone.density.mixed_use.unit}\n`;
        }
        text += '\n';
    }
    
    // Building Requirements
    if (zone.building) {
        text += `BUILDING REQUIREMENTS:\n`;
        if (zone.building.max_floors) {
            text += `• Maximum Floors: ${zone.building.max_floors}\n`;
        }
        if (zone.building.building_forms && zone.building.building_forms.length > 0) {
            text += `• Building Forms: ${zone.building.building_forms.join(', ')}\n`;
        }
        if (zone.building.roof_restrictions) {
            text += `• Roof: ${zone.building.roof_restrictions}\n`;
        }
        text += '\n';
    }
    
    // Setbacks
    if (zone.setbacks) {
        text += `SETBACKS:\n`;
        if (zone.setbacks.front_principal_min !== undefined) {
            text += `• Front: ${zone.setbacks.front_principal_min}m minimum\n`;
        }
        if (zone.setbacks.side_min !== undefined) {
            text += `• Side: ${zone.setbacks.side_min}m minimum\n`;
        }
        if (zone.setbacks.rear_min !== undefined) {
            text += `• Rear: ${zone.setbacks.rear_min}m minimum\n`;
        }
        text += '\n';
    }
    
    // Lot Requirements
    if (zone.lot_requirements) {
        text += `LOT REQUIREMENTS:\n`;
        if (zone.lot_requirements.min_size_m2) {
            text += `• Minimum Size: ${zone.lot_requirements.min_size_m2} m²\n`;
        }
        if (zone.lot_requirements.max_size_m2) {
            text += `• Maximum Size: ${zone.lot_requirements.max_size_m2} m²\n`;
        }
        if (zone.lot_requirements.notes) {
            text += `• Notes: ${zone.lot_requirements.notes}\n`;
        }
        text += '\n';
    }
    
    // Parking
    if (zone.parking && zone.parking.notes) {
        text += `PARKING:\n`;
        text += `• ${zone.parking.notes}\n\n`;
    }
    
    // Special Notes
    if (zone.special_notes && zone.special_notes.length > 0) {
        text += `SPECIAL NOTES:\n`;
        zone.special_notes.forEach(note => {
            text += `• ${note}\n`;
        });
        text += '\n';
    }
    
    return text.trim();
}

/**
 * Ingest all structured zone JSON files
 */
async function ingestStructuredZones() {
    console.log('\n========================================');
    console.log('STRUCTURED ZONE INGESTION');
    console.log('========================================\n');
    
    try {
        const zonesDir = './data/zones';
        
        // Check if directory exists
        if (!fs.existsSync(zonesDir)) {
            console.error(`Error: Directory ${zonesDir} does not exist`);
            console.log('Please create the directory and add zone JSON files.\n');
            await pool.end();
            process.exit(1);
        }
        
        // Get all JSON files
        const files = fs.readdirSync(zonesDir);
        const zoneFiles = files.filter(f => f.endsWith('.json'));
        
        if (zoneFiles.length === 0) {
            console.warn(`Warning: No JSON files found in ${zonesDir}`);
            console.log('Please add zone JSON files to this directory.\n');
            await pool.end();
            process.exit(0);
        }
        
        console.log(`Found ${zoneFiles.length} zone file(s)\n`);
        
        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        
        // Process each zone file
        for (const file of zoneFiles) {
            try {
                const filePath = path.join(zonesDir, file);
                const fileContent = fs.readFileSync(filePath, 'utf8');
                
                // Parse JSON
                let zoneData;
                try {
                    zoneData = JSON.parse(fileContent);
                } catch (parseError) {
                    throw new Error(`JSON parse error: ${parseError.message}`);
                }
                
                // Validate required fields
                if (!zoneData.zone_code) {
                    throw new Error('Missing required field: zone_code');
                }
                if (!zoneData.zone_name) {
                    throw new Error('Missing required field: zone_name');
                }
                
                // Build full text description
                const fullText = buildFullTextDescription(zoneData);
                
                // Insert or update in database
                await pool.query(`
                    INSERT INTO regulation_documents 
                    (zone_code, zone_name, regulation_data, content, document_type, 
                     source_file, last_verified_at, data_quality)
                    VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
                    ON CONFLICT (zone_code, document_type) 
                    DO UPDATE SET
                        zone_name = EXCLUDED.zone_name,
                        regulation_data = EXCLUDED.regulation_data,
                        content = EXCLUDED.content,
                        source_file = EXCLUDED.source_file,
                        last_verified_at = NOW(),
                        data_quality = EXCLUDED.data_quality
                `, [
                    zoneData.zone_code,
                    zoneData.zone_name,
                    JSON.stringify(zoneData),
                    fullText,
                    'zoning_regulation',
                    file,
                    'manual_verified'
                ]);
                
                console.log(`✓ Ingested ${zoneData.zone_code}: ${zoneData.zone_name}`);
                successCount++;
                
            } catch (error) {
                console.error(`✗ Failed to ingest ${file}: ${error.message}`);
                errors.push({ file, error: error.message });
                errorCount++;
            }
        }
        
        // Summary
        console.log('\n========================================');
        console.log('INGESTION SUMMARY');
        console.log('========================================');
        console.log(`Total files: ${zoneFiles.length}`);
        console.log(`Success: ${successCount}`);
        console.log(`Errors: ${errorCount}`);
        
        if (errors.length > 0) {
            console.log('\nErrors:');
            errors.forEach(err => {
                console.log(`  - ${err.file}: ${err.error}`);
            });
        }
        
        // Verify database state
        console.log('\n========================================');
        console.log('DATABASE VERIFICATION');
        console.log('========================================');
        
        const totalResult = await pool.query(
            'SELECT COUNT(*) as count FROM regulation_documents WHERE document_type = $1',
            ['zoning_regulation']
        );
        
        const zonesResult = await pool.query(`
            SELECT zone_code, zone_name, data_quality, last_verified_at 
            FROM regulation_documents 
            WHERE document_type = 'zoning_regulation'
            ORDER BY zone_code
        `);
        
        console.log(`Total zones in database: ${totalResult.rows[0].count}\n`);
        
        if (zonesResult.rows.length > 0) {
            console.log('Zones loaded:');
            zonesResult.rows.forEach(row => {
                const verifiedDate = new Date(row.last_verified_at).toLocaleDateString();
                console.log(`  • ${row.zone_code} - ${row.zone_name} (${row.data_quality}, verified: ${verifiedDate})`);
            });
        }
        
        console.log('\n========================================');
        if (errorCount === 0) {
            console.log('✅ INGESTION COMPLETED SUCCESSFULLY');
        } else {
            console.log('⚠️  INGESTION COMPLETED WITH ERRORS');
        }
        console.log('========================================\n');
        
        await pool.end();
        process.exit(errorCount === 0 ? 0 : 1);
        
    } catch (error) {
        console.error('\n========================================');
        console.error('❌ INGESTION FAILED');
        console.error('========================================');
        console.error('Error:', error.message);
        console.error('\nStack trace:');
        console.error(error.stack);
        console.error('\nTroubleshooting:');
        console.error('1. Ensure data/zones/ directory exists');
        console.error('2. Verify JSON files are valid (use jsonlint.com)');
        console.error('3. Check database connection in .env file');
        console.error('4. Verify regulation_documents table exists');
        console.error('========================================\n');
        
        await pool.end();
        process.exit(1);
    }
}

// Run ingestion if this file is executed directly
if (require.main === module) {
    ingestStructuredZones();
}

// Export for use in other scripts
module.exports = { 
    ingestStructuredZones,
    buildFullTextDescription
};