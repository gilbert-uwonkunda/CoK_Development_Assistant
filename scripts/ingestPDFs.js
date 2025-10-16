// scripts/ingestPDFs.js
const fs = require('fs');
const pdf = require('pdf-parse');
const { pool } = require('../src/config/database');
require('dotenv').config();

// ============================================================================
// INGEST KIGALI MASTER PLAN 2050
// ============================================================================
async function ingestKigaliMasterPlan(pdfPath) {
    console.log('📖 Reading Kigali Master Plan PDF...');
    
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const pdfData = await pdf(dataBuffer);
        
        // Define zones to extract
        const zones = [
            'R1', 'R1A', 'R1B', 'R2', 'R3', 'R4', 
            'C1', 'C2', 'C3', 
            'I1', 'I2', 'I3', 
            'P1', 'P2', 'P3', 'P3A', 'P3B', 'P3C', 'P3D',
            'PF1', 'PF2', 'PF3', 'PF4', 'PF5',
            'PA', 'T', 'U', 
            'W', 'W2', 'W3', 'W4', 'W5', 'WB', 'WR',
            'A', 'A1',
            'O-C2', 'OC2'
        ];
        
        for (const zone of zones) {
            // Extract zone-specific content using regex
            const zoneRegex = new RegExp(`${zone}[\\s\\S]*?(?=(?:R\\d|C\\d|I\\d|P\\d|PF\\d|PA|T|U|W\\d|A\\d|O-C|$))`, 'i');
            const match = pdfData.text.match(zoneRegex);
            
            if (match) {
                const content = match[0].substring(0, 3000);
                
                await pool.query(`
                    INSERT INTO regulation_documents (zone_code, document_type, title, content, source_file)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT DO NOTHING
                `, [
                    zone,
                    'zoning_regulation',
                    `${zone} Zone Regulations`,
                    content,
                    'Kigali_Master_Plan_2050.pdf'
                ]);
                
                console.log(`  ✓ Ingested ${zone} zone regulations`);
            } else {
                console.log(`  ⚠ No content found for ${zone} zone`);
            }
        }
        
        console.log('✅ Kigali Master Plan ingestion complete\n');
        
    } catch (error) {
        console.error('❌ Error ingesting Kigali Master Plan:', error.message);
        throw error;
    }
}

// ============================================================================
// INGEST RFA TREE GUIDELINES 2025
// ============================================================================
async function ingestRFAGuidelines(pdfPath) {
    console.log('🌳 Reading RFA Tree Guidelines PDF...');
    
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const pdfData = await pdf(dataBuffer);
        
        // Extract different sections
        const sections = [
            { 
                name: 'Roadside Trees', 
                pattern: /2 ROADSIDE URBAN TREES[\s\S]{0,5000}/,
                maxChars: 5000
            },
            { 
                name: 'Residential Gardens R1-R4', 
                pattern: /3\.1\. Tree planting and gardening in Residential Zones[\s\S]{0,4000}/,
                maxChars: 4000
            },
            { 
                name: 'Commercial and Industrial Zones', 
                pattern: /3\.2\. Mixed use and commercial zones[\s\S]{0,3000}/,
                maxChars: 3000
            },
            { 
                name: 'Parks and Open Spaces', 
                pattern: /4 PARKS, AND OTHER OPEN SPACE ZONES[\s\S]{0,4000}/,
                maxChars: 4000
            },
            { 
                name: 'Tree Species Catalog', 
                pattern: /APPENDIXES: Recommended tree species[\s\S]*$/,
                maxChars: 20000  // Large - the appendix table is extensive
            }
        ];
        
        for (const section of sections) {
            const match = pdfData.text.match(section.pattern);
            
            if (match) {
                const content = match[0].substring(0, section.maxChars);
                
                await pool.query(`
                    INSERT INTO regulation_documents (zone_code, document_type, title, content, section_name, source_file)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, [
                    null, // General guidelines apply to all zones
                    'tree_guidelines',
                    'RFA Urban Tree Guidelines',
                    content,
                    section.name,
                    'RFA_Guidelines_2025.pdf'
                ]);
                
                console.log(`  ✓ Ingested ${section.name} (${content.length} chars)`);
            } else {
                console.log(`  ⚠ Section not found: ${section.name}`);
            }
        }
        
        console.log('✅ RFA Guidelines ingestion complete\n');
        
    } catch (error) {
        console.error('❌ Error ingesting RFA Guidelines:', error.message);
        throw error;
    }
}

// ============================================================================
// MAIN INGESTION RUNNER
// ============================================================================
async function runIngestion() {
    console.log('\n========================================');
    console.log('TERRANEBULAR PDF INGESTION');
    console.log('========================================\n');
    
    try {
        const kigaliPDF = './data/Kigali_Master_Plan_2050.pdf';
        const rfaPDF = './data/RFA_Guidelines_2025.pdf';
        
        if (!fs.existsSync(kigaliPDF)) {
            console.warn(`⚠ Warning: ${kigaliPDF} not found. Skipping Kigali Master Plan.`);
        } else {
            await ingestKigaliMasterPlan(kigaliPDF);
        }
        
        if (!fs.existsSync(rfaPDF)) {
            console.warn(`⚠ Warning: ${rfaPDF} not found. Skipping RFA Guidelines.`);
        } else {
            await ingestRFAGuidelines(rfaPDF);
        }
        
        // Verify ingestion
        const result = await pool.query('SELECT COUNT(*) as count FROM regulation_documents');
        const zoningCount = await pool.query('SELECT COUNT(*) as count FROM regulation_documents WHERE document_type = \'zoning_regulation\'');
        const treeCount = await pool.query('SELECT COUNT(*) as count FROM regulation_documents WHERE document_type = \'tree_guidelines\'');
        
        console.log(`📊 Database Summary:`);
        console.log(`   Total documents: ${result.rows[0].count}`);
        console.log(`   Zoning regulations: ${zoningCount.rows[0].count}`);
        console.log(`   Tree guidelines: ${treeCount.rows[0].count}`);
        
        console.log('\n========================================');
        console.log('✅ INGESTION COMPLETED SUCCESSFULLY');
        console.log('========================================\n');
        
        await pool.end();
        process.exit(0);
        
    } catch (error) {
        console.error('\n========================================');
        console.error('❌ INGESTION FAILED');
        console.error('========================================');
        console.error('Error:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Ensure PDFs are in ./data/ folder');
        console.error('2. Check database connection in .env file');
        console.error('3. Verify regulation_documents table exists');
        console.error('4. Check PDF file permissions');
        console.error('========================================\n');
        
        await pool.end();
        process.exit(1);
    }
}

// Run ingestion if this file is executed directly
if (require.main === module) {
    runIngestion();
}

// Export for use in other scripts
module.exports = { 
    ingestKigaliMasterPlan, 
    ingestRFAGuidelines,
    runIngestion
};