// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const multer = require('multer'); // ADDED THIS LINE
require('dotenv').config();

const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

const app = express();

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://js.arcgis.com"],
            scriptSrc: ["'self'", "https://js.arcgis.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https://api.anthropic.com"],
            fontSrc: ["'self'", "https://js.arcgis.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'http://localhost:3000',
            'http://localhost:5500', // Live Server default
            'http://127.0.0.1:5500',
            'http://localhost:8080'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '50mb' })); // INCREASED LIMIT FOR LARGE GEOJSON
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${req.method} ${req.path} - ${req.ip}`);
    next();
});

// Health check route
app.get('/', (req, res) => {
    res.json({
        service: 'TerraNebular Backend',
        status: 'running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/api/health',
            zoning: '/api/zoning/location?lat={lat}&lng={lng}',
            ai: '/api/ai/question (POST)',
            boundaries: '/api/zoning/boundaries',
            search: '/api/zoning/search?q={query}',
            stats: '/api/stats',
            admin: {
                upload: '/api/admin/upload-zoning (POST)',
                uploadJson: '/api/admin/upload-zoning-json (POST)',
                status: '/api/admin/status',
                clear: '/api/admin/clear-zoning (DELETE)'
            }
        }
    });
});

// API routes
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // CORS error
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            error: 'CORS policy violation',
            message: 'Origin not allowed'
        });
    }
    
    // Rate limiting error
    if (err.status === 429) {
        return res.status(429).json({
            error: 'Rate limit exceeded',
            message: err.message
        });
    }

    // Multer file upload errors
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large',
                message: 'File size exceeds 50MB limit'
            });
        }
        return res.status(400).json({
            error: 'File upload error',
            message: err.message
        });
    }

    // JSON payload too large error
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            error: 'Payload too large',
            message: 'Request body exceeds size limit'
        });
    }
    
    // Default error response
    res.status(err.status || 500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `${req.method} ${req.originalUrl} is not a valid endpoint`,
        availableEndpoints: [
            'GET /',
            'GET /api/health',
            'GET /api/zoning/location',
            'POST /api/ai/question',
            'GET /api/zoning/boundaries',
            'GET /api/zoning/search',
            'GET /api/stats',
            'POST /api/admin/upload-zoning',
            'POST /api/admin/upload-zoning-json',
            'GET /api/admin/status'
        ]
    });
});

module.exports = app;