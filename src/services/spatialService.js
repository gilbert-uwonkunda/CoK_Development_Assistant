// src/services/spatialService.js
const { pool } = require('../config/database');

class SpatialService {
    
    // Find zoning information at a specific location
    async findZoneAtLocation(lat, lng) {
        try {
            const query = `
                SELECT 
                    objectid_1,
                    new_zoning as zone_name,
                    phase,
                    year_of_implementation,
                    area_sqkm,
                    zone_code,
                    level_1,
                    level_2,
                    level_3,
                    globalid,
                    ST_Area(shape_column) as area,
                    ST_Distance(
                        shape_column, 
                        ST_SetSRID(ST_MakePoint($1, $2), 4326)
                    ) as distance
                FROM zoning_data 
                WHERE ST_Contains(
                    shape_column, 
                    ST_SetSRID(ST_MakePoint($1, $2), 4326)
                )
                ORDER BY distance
                LIMIT 1;
            `;
            
            const result = await pool.query(query, [lng, lat]);
            
            if (result.rows.length === 0) {
                return null; // No fallback - return null for points outside zones
            }
            
            return {
                ...result.rows[0],
                source: 'exact_match'
            };
            
        } catch (error) {
            console.error('Error finding zone at location:', error);
            throw error;
        }
    }
    
    // Get comprehensive spatial data for a location
    async getLocationSpatialData(lat, lng) {
        try {
            // Find the zone at this location
            const zoneData = await this.findZoneAtLocation(lat, lng);
            
            if (!zoneData) {
                return {
                    location: { lat, lng },
                    zoneData: null,
                    nearbyFeatures: [],
                    error: 'No zoning data found for this location'
                };
            }
            
            return {
                location: { lat, lng },
                zoneData,
                nearbyFeatures: [] // No nearby features needed
            };
            
        } catch (error) {
            console.error('Error getting spatial data:', error);
            throw error;
        }
    }
    
    // Get all zones (for frontend caching)
    async getAllZones() {
        try {
            const query = `
                SELECT 
                    new_zoning as zone_name,
                    phase,
                    level_1,
                    level_2,
                    COUNT(*) as feature_count
                FROM zoning_data 
                GROUP BY new_zoning, phase, level_1, level_2
                ORDER BY new_zoning;
            `;
            
            const result = await pool.query(query);
            return result.rows;
            
        } catch (error) {
            console.error('Error getting all zones:', error);
            throw error;
        }
    }
    
    // Get zone boundaries as GeoJSON (for map display)
    async getZoneBoundaries(zoneNames = null, bounds = null) {
        try {
            let query = `
                SELECT 
                    new_zoning as zone_name,
                    zone_code,
                    phase,
                    level_1,
                    level_2,
                    area_sqkm,
                    ST_AsGeoJSON(shape_column) as geometry
                FROM zoning_data
            `;
            
            const params = [];
            const conditions = [];
            
            if (zoneNames && zoneNames.length > 0) {
                conditions.push(`new_zoning = ANY($${params.length + 1})`);
                params.push(zoneNames);
            }
            
            if (bounds) {
                const { north, south, east, west } = bounds;
                conditions.push(`
                    ST_Intersects(
                        shape_column,
                        ST_MakeEnvelope($${params.length + 1}, $${params.length + 2}, $${params.length + 3}, $${params.length + 4}, 4326)
                    )
                `);
                params.push(west, south, east, north);
            }
            
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
            
            query += ' ORDER BY new_zoning;';
            
            const result = await pool.query(query, params);
            
            // Format as GeoJSON FeatureCollection
            const features = result.rows.map(row => ({
                type: 'Feature',
                properties: {
                    zone_name: row.zone_name,
                    zone_code: row.zone_code,
                    phase: row.phase,
                    level_1: row.level_1,
                    level_2: row.level_2,
                    area_sqkm: row.area_sqkm
                },
                geometry: JSON.parse(row.geometry)
            }));
            
            return {
                type: 'FeatureCollection',
                features
            };
            
        } catch (error) {
            console.error('Error getting zone boundaries:', error);
            throw error;
        }
    }
    
    // Search zones by name or type
    async searchZones(searchTerm) {
        try {
            const query = `
                SELECT DISTINCT
                    new_zoning as zone_name,
                    zone_code,
                    phase,
                    level_1,
                    level_2,
                    COUNT(*) as feature_count
                FROM zoning_data 
                WHERE new_zoning ILIKE $1 
                   OR zone_code ILIKE $1
                   OR level_1 ILIKE $1
                   OR level_2 ILIKE $1
                GROUP BY new_zoning, zone_code, phase, level_1, level_2
                ORDER BY new_zoning
                LIMIT 20;
            `;
            
            const result = await pool.query(query, [`%${searchTerm}%`]);
            return result.rows;
            
        } catch (error) {
            console.error('Error searching zones:', error);
            throw error;
        }
    }
    
    // Get database statistics
    async getDatabaseStats() {
        try {
            const queries = [
                'SELECT COUNT(*) as total_features FROM zoning_data',
                'SELECT COUNT(DISTINCT new_zoning) as unique_zones FROM zoning_data',
                'SELECT new_zoning as zone_name, COUNT(*) as count FROM zoning_data GROUP BY new_zoning ORDER BY count DESC LIMIT 10'
            ];
            
            const [totalResult, uniqueResult, topZonesResult] = await Promise.all([
                pool.query(queries[0]),
                pool.query(queries[1]),
                pool.query(queries[2])
            ]);
            
            return {
                totalFeatures: parseInt(totalResult.rows[0].total_features),
                uniqueZones: parseInt(uniqueResult.rows[0].unique_zones),
                topZones: topZonesResult.rows
            };
            
        } catch (error) {
            console.error('Error getting database stats:', error);
            throw error;
        }
    }
    
    // Get zones by phase (for implementation planning)
    async getZonesByPhase(phase = null) {
        try {
            let query = `
                SELECT 
                    phase,
                    year_of_implementation,
                    new_zoning as zone_name,
                    COUNT(*) as feature_count,
                    SUM(area_sqkm) as total_area
                FROM zoning_data
            `;
            
            if (phase) {
                query += ' WHERE phase = $1';
            }
            
            query += `
                GROUP BY phase, year_of_implementation, new_zoning
                ORDER BY phase, year_of_implementation, new_zoning;
            `;
            
            const result = await pool.query(query, phase ? [phase] : []);
            return result.rows;
            
        } catch (error) {
            console.error('Error getting zones by phase:', error);
            throw error;
        }
    }
}

module.exports = new SpatialService();