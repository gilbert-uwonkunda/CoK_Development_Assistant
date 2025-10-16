// src/server.js
require('dotenv').config();
console.log('Starting TerraNebular server...');

const app = require('./app');
const { initializeDatabase, pool } = require('./config/database');

const PORT = process.env.PORT || 3001;

// Variable to hold server instance
let server;

// Graceful shutdown handler
function gracefulShutdown(signal) {
    console.log(`Received ${signal}. Starting graceful shutdown...`);
    
    if (server) {
        server.close(async () => {
            try {
                // Close database connections
                await pool.end();
                console.log('Database connections closed');
            } catch (error) {
                console.error('Error closing database:', error);
            }
            console.log('HTTP server closed');
            process.exit(0);
        });
        
        // Force shutdown after 10 seconds
        setTimeout(() => {
            console.log('Force shutdown');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
}

// Check database data status
async function checkDatabaseStatus() {
    try {
        const result = await pool.query('SELECT COUNT(*) as count FROM zoning_data');
        const count = parseInt(result.rows[0].count);
        
        if (count === 0) {
            console.log('Database is empty. Zoning data can be uploaded via:');
            console.log(`POST http://localhost:${PORT}/api/admin/upload-zoning`);
            return { hasData: false, count: 0 };
        } else {
            console.log(`Database contains ${count} zoning features`);
            
            // Get zone summary
            const zoneResult = await pool.query(`
                SELECT new_zoning, COUNT(*) as feature_count 
                FROM zoning_data 
                GROUP BY new_zoning 
                ORDER BY feature_count DESC 
                LIMIT 1
            `);
            
            console.log('Top zones:');
            zoneResult.rows.forEach(row => {
                console.log(`  - ${row.new_zoning}: ${row.feature_count} features`);
            });
            
            return { hasData: true, count, zones: zoneResult.rows };
        }
    } catch (error) {
        console.warn('Could not check database status:', error.message);
        return { hasData: false, count: 0, error: error.message };
    }
}

// Start server
async function startServer() {
    try {
        console.log('Environment variables loaded:');
        console.log(`- PORT: ${PORT}`);
        console.log(`- DB_HOST: ${process.env.DB_HOST}`);
        console.log(`- DB_NAME: ${process.env.DB_NAME}`);
        console.log(`- DB_USER: ${process.env.DB_USER}`);
        console.log(`- CLAUDE_API_KEY: ${process.env.CLAUDE_API_KEY ? 'Configured' : 'Not configured'}`);
        
        // Initialize database
        console.log('Initializing database...');
        await initializeDatabase();
        console.log('Database initialized successfully');
        
        // Check existing data
        const dbStatus = await checkDatabaseStatus();
        
        // Start HTTP server
        server = app.listen(PORT, () => {
            console.log(`
TerraNebular Backend Server Started
==================================

Server: http://localhost:${PORT}
Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}
Claude API: ${process.env.CLAUDE_API_KEY ? 'Configured' : 'Not configured'}
Environment: ${process.env.NODE_ENV || 'development'}

Database Status: ${dbStatus.hasData ? `${dbStatus.count} features loaded` : 'Empty - awaiting data upload'}

API Endpoints:
${dbStatus.hasData ? '' : '   • Upload Data: POST /api/admin/upload-zoning'}
   • Health:      GET  /api/health
   • Stats:       GET  /api/stats
${dbStatus.hasData ? `   • Zoning:      GET  /api/zoning/location?lat={lat}&lng={lng}
   • AI Chat:     POST /api/ai/question
   • Boundaries:  GET  /api/zoning/boundaries
   • Search:      GET  /api/zoning/search?q={query}` : ''}

${dbStatus.hasData ? 'Ready to serve spatial intelligence!' : 'Upload zoning data to enable full functionality'}
            `);
            
            // Additional startup info
            if (!dbStatus.hasData) {
                console.log(`
To upload zoning data, use:
curl -X POST -F "file=@your-zoning-file.geojson" http://localhost:${PORT}/api/admin/upload-zoning
                `);
            }
        });
        
        // Setup graceful shutdown
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        
        return server;
        
    } catch (error) {
        console.error('Failed to start server:', error);
        console.error('Error details:', error.stack);
        
        // Check if it's a database connection error
        if (error.code === 'ECONNREFUSED') {
            console.error(`
Database Connection Failed:
- Make sure PostgreSQL is running
- Check your database credentials in .env file
- Ensure database '${process.env.DB_NAME}' exists
            `);
        }
        
        process.exit(1);
    }
}

// Cleanup function for expired cache entries
async function performMaintenance() {
    try {
        // Clean up expired AI responses
        const result = await pool.query(`
            DELETE FROM ai_responses 
            WHERE expires_at < NOW()
        `);
        
        if (result.rowCount > 0) {
            console.log(`Maintenance: Cleaned up ${result.rowCount} expired AI responses`);
        }
    } catch (error) {
        console.error('Maintenance error:', error);
    }
}

// Run maintenance every hour
setInterval(performMaintenance, 60 * 60 * 1000);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit immediately in development
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});

// Start the server
startServer().catch(error => {
    console.error('Server startup failed:', error);
    process.exit(1);
});

module.exports = { startServer };