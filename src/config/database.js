// src/config/database.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Log connection status
pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Database connection error:', err);
});

// Initialize database (only enable PostGIS extensions, don’t create tables)
async function initializeDatabase() {
    const client = await pool.connect();

    try {
        console.log('Initializing database...');

        // Enable PostGIS (safe to run even if already installed)
        await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
        await client.query('CREATE EXTENSION IF NOT EXISTS postgis_topology;');

        console.log('PostGIS extensions are ready ✅');

    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Cleanup expired AI responses
async function cleanupExpiredResponses() {
    try {
        const result = await pool.query(`
            DELETE FROM ai_responses 
            WHERE expires_at < NOW()
        `);

        if (result.rowCount > 0) {
            console.log(`Cleaned up ${result.rowCount} expired AI responses`);
        }
    } catch (error) {
        console.error('Error cleaning up expired responses:', error);
    }
}

// Run cleanup every hour
setInterval(cleanupExpiredResponses, 60 * 60 * 1000);

module.exports = {
    pool,
    initializeDatabase,
    cleanupExpiredResponses
};