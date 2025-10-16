// src/routes/admin.js
const express = require('express');
const multer = require('multer');
const { loadZoningDataFromGeoJSON } = require('../config/database');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/json' || 
            file.originalname.endsWith('.geojson') || 
            file.originalname.endsWith('.json')) {
            cb(null, true);
        } else {
            cb(new Error('Only JSON and GeoJSON files are allowed'));
        }
    }
});

// Upload zoning data endpoint
router.post('/upload-zoning', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded',
                message: 'Please upload a GeoJSON or JSON file'
            });
        }

        console.log('Processing uploaded zoning data...');
        console.log(`File: ${req.file.originalname} (${req.file.size} bytes)`);

        // Parse the uploaded JSON
        const geoJsonData = JSON.parse(req.file.buffer.toString('utf8'));

        if (!geoJsonData.features || !Array.isArray(geoJsonData.features)) {
            return res.status(400).json({
                error: 'Invalid GeoJSON format',
                message: 'File must contain a "features" array'
            });
        }

        if (geoJsonData.features.length === 0) {
            return res.status(400).json({
                error: 'Empty dataset',
                message: 'No features found in the uploaded file'
            });
        }

        // Load data into database
        const loadedCount = await loadZoningDataFromGeoJSON(geoJsonData);

        res.json({
            success: true,
            message: 'Zoning data uploaded successfully',
            data: {
                totalFeatures: geoJsonData.features.length,
                loadedFeatures: loadedCount,
                filename: req.file.originalname,
                uploadTime: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error uploading zoning data:', error);
        
        if (error instanceof SyntaxError) {
            return res.status(400).json({
                error: 'Invalid JSON format',
                message: 'Please ensure the file contains valid JSON/GeoJSON data'
            });
        }

        res.status(500).json({
            error: 'Upload failed',
            message: error.message
        });
    }
});

// Upload raw JSON data (for direct API calls)
router.post('/upload-zoning-json', express.json({ limit: '50mb' }), async (req, res) => {
    try {
        const geoJsonData = req.body;

        if (!geoJsonData || typeof geoJsonData !== 'object') {
            return res.status(400).json({
                error: 'Invalid request body',
                message: 'Request body must contain valid JSON data'
            });
        }

        if (!geoJsonData.features || !Array.isArray(geoJsonData.features)) {
            return res.status(400).json({
                error: 'Invalid GeoJSON format',
                message: 'Data must contain a "features" array'
            });
        }

        if (geoJsonData.features.length === 0) {
            return res.status(400).json({
                error: 'Empty dataset',
                message: 'No features found in the data'
            });
        }

        console.log(`Processing ${geoJsonData.features.length} features via JSON API...`);

        // Load data into database
        const loadedCount = await loadZoningDataFromGeoJSON(geoJsonData);

        res.json({
            success: true,
            message: 'Zoning data uploaded successfully',
            data: {
                totalFeatures: geoJsonData.features.length,
                loadedFeatures: loadedCount,
                uploadTime: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error uploading JSON zoning data:', error);

        res.status(500).json({
            error: 'Upload failed',
            message: error.message
        });
    }
});

// Clear all zoning data
router.delete('/clear-zoning', async (req, res) => {
    try {
        const { pool } = require('../config/database');
        
        const result = await pool.query('DELETE FROM zoning_data');
        
        res.json({
            success: true,
            message: 'All zoning data cleared',
            data: {
                deletedRows: result.rowCount,
                clearedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error clearing zoning data:', error);
        res.status(500).json({
            error: 'Clear operation failed',
            message: error.message
        });
    }
});

// Get database status
router.get('/status', async (req, res) => {
    try {
        const { pool } = require('../config/database');
        
        const countResult = await pool.query('SELECT COUNT(*) as count FROM zoning_data');
        const count = parseInt(countResult.rows[0].count);
        
        if (count === 0) {
            return res.json({
                success: true,
                data: {
                    hasData: false,
                    count: 0,
                    message: 'Database is empty - ready for data upload'
                }
            });
        }

        // Get zone breakdown
        const zonesResult = await pool.query(`
            SELECT new_zoning, COUNT(*) as feature_count 
            FROM zoning_data 
            GROUP BY new_zoning 
            ORDER BY feature_count DESC
        `);

        res.json({
            success: true,
            data: {
                hasData: true,
                totalFeatures: count,
                uniqueZones: zonesResult.rows.length,
                zones: zonesResult.rows,
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error getting database status:', error);
        res.status(500).json({
            error: 'Status check failed',
            message: error.message
        });
    }
});

module.exports = router;