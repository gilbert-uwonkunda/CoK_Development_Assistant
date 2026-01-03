// src/services/claudeService.js
const crypto = require('crypto');
const { pool } = require('../config/database');

class ClaudeService {
    constructor() {
        this.apiKey = process.env.CLAUDE_API_KEY;
        this.apiUrl = 'https://api.anthropic.com/v1/messages';
        this.model = 'claude-sonnet-4-20250514';
        this.maxTokens = 2000;
    }

    // Generate cache key for questions
    generateCacheKey(question, lat, lng, zoneName) {
        const key = `${question}_${lat.toFixed(4)}_${lng.toFixed(4)}_${zoneName}`;
        return crypto.createHash('md5').update(key).digest('hex');
    }

    // Check for cached response
    async getCachedResponse(question, lat, lng, zoneName) {
        try {
            const cacheKey = this.generateCacheKey(question, lat, lng, zoneName);
            
            const result = await pool.query(`
                SELECT response, response_metadata, created_at
                FROM ai_responses 
                WHERE question_hash = $1 AND expires_at > NOW()
            `, [cacheKey]);
            
            if (result.rows.length > 0) {
                console.log('Found cached AI response');
                return {
                    response: result.rows[0].response,
                    metadata: result.rows[0].response_metadata,
                    cached: true,
                    cachedAt: result.rows[0].created_at
                };
            }
            
            return null;
        } catch (error) {
            console.error('Error checking cache:', error);
            return null;
        }
    }

    // Cache AI response
    async cacheResponse(question, lat, lng, zoneName, response, metadata) {
        try {
            const cacheKey = this.generateCacheKey(question, lat, lng, zoneName);
            
            await pool.query(`
                INSERT INTO ai_responses (question_hash, question, location, zone_name, response, response_metadata)
                VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6, $7)
                ON CONFLICT (question_hash) 
                DO UPDATE SET 
                    response = EXCLUDED.response,
                    response_metadata = EXCLUDED.response_metadata,
                    created_at = NOW(),
                    expires_at = NOW() + INTERVAL '24 hours'
            `, [cacheKey, question, lng, lat, zoneName, response, JSON.stringify(metadata)]);
            
        } catch (error) {
            console.error('Error caching response:', error);
        }
    }

    // Build comprehensive spatial prompt
    buildSpatialPrompt(question, spatialData) {
        const { location, zoneData, nearbyFeatures } = spatialData;
        
        return `SPATIAL INTELLIGENCE REQUEST - KIGALI, RWANDA

LOCATION CONTEXT:
- Coordinates: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}
- Zone: ${zoneData.zone_name}
- Zone Description: ${zoneData.regulations?.description || 'Development zone per master plan'}

ZONING REGULATIONS:
- Permitted Uses: ${zoneData.regulations?.permitted?.join(', ') || 'Check with authorities'}
- Prohibited Uses: ${zoneData.regulations?.prohibited?.join(', ') || 'Check with authorities'}
- Conditional Uses: ${zoneData.regulations?.conditional?.join(', ') || 'Check with authorities'}
- Maximum Height: ${zoneData.regulations?.maxHeight || 'Per city regulations'}
- Maximum Coverage: ${zoneData.regulations?.coverage || 'Per city regulations'}
- Minimum Lot Size: ${zoneData.regulations?.minLotSize || 'Per city regulations'}

SPATIAL CONTEXT:
- Zone Area: ${zoneData.area || 'N/A'} square meters
- Distance from Zone Center: ${zoneData.distance || 'N/A'} meters
${nearbyFeatures && nearbyFeatures.length > 0 ? `
NEARBY ZONES:
${nearbyFeatures.map(f => `- ${f.zone_name} (${Math.round(f.distance)}m away)`).join('\n')}` : ''}

CITIZEN QUESTION: "${question}"

As TerraNebular, an expert spatial intelligence assistant for Kigali development and zoning, provide a comprehensive response that includes:

1. Direct answer to the citizen's question
2. Specific zoning regulations and requirements for this location
3. Any permits or approvals needed
4. Contact information for next steps
5. Investment insights if relevant

Be specific, actionable, and reference the actual Kigali zoning data provided. End with relevant contact information.`;
    }

    // Call Claude API with enhanced debugging
    async callClaudeAPI(prompt) {
        console.log('=== CLAUDE API DEBUG ===');
        console.log('API Key configured:', !!this.apiKey);
        console.log('API Key starts with:', this.apiKey ? this.apiKey.substring(0, 20) + '...' : 'null');
        console.log('API URL:', this.apiUrl);
        console.log('Model:', this.model);
        console.log('Prompt length:', prompt.length);
        
        if (!this.apiKey) {
            console.log('ERROR: Claude API key not configured');
            throw new Error('Claude API key not configured');
        }

        // Fixed request body format - system message as top-level parameter
        const requestBody = {
            model: this.model,
            max_tokens: this.maxTokens,
            system: 'You are TerraNebular, an expert spatial intelligence assistant for Kigali, Rwanda development and zoning. Provide specific, actionable advice based on official Kigali City regulations. Be concise but comprehensive.',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        };

        console.log('Request body prepared, making API call...');

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response received:');
            console.log('- Status:', response.status);
            console.log('- Status Text:', response.statusText);
            console.log('- Headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorData = await response.text();
                console.log('ERROR Response body:', errorData);
                
                // Parse error details if JSON
                try {
                    const errorJson = JSON.parse(errorData);
                    console.log('Parsed error:', errorJson);
                } catch (e) {
                    console.log('Error response is not JSON');
                }
                
                throw new Error(`Claude API error: ${response.status} - ${errorData}`);
            }

            const data = await response.json();
            console.log('SUCCESS! Response received');
            console.log('- Content length:', data.content[0].text.length);
            console.log('- Usage:', data.usage || 'No usage data');
            console.log('=== END CLAUDE API DEBUG ===');
            
            return data.content[0].text;

        } catch (error) {
            console.log('EXCEPTION in Claude API call:');
            console.log('- Error type:', error.constructor.name);
            console.log('- Error message:', error.message);
            console.log('- Stack:', error.stack);
            console.log('=== END CLAUDE API DEBUG ===');
            throw error;
        }
    }

    // Generate AI response with spatial context
    async generateSpatialResponse(question, spatialData) {
        const { location, zoneData } = spatialData;
        
        try {
            // Check cache first
            const cached = await this.getCachedResponse(
                question, 
                location.lat, 
                location.lng, 
                zoneData.zone_name
            );
            
            if (cached) {
                return cached;
            }

            // Build spatial prompt
            const prompt = this.buildSpatialPrompt(question, spatialData);
            
            // Call Claude API
            const aiResponse = await this.callClaudeAPI(prompt);
            
            // Add footer with location info
            const responseWithFooter = `${aiResponse}

📍 Location: ${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}°
📞 City of Kigali Planning: +250 788 000 000
🌐 More info: kigalicity.gov.rw`;

            // Cache the response
            const metadata = {
                model: this.model,
                tokens: aiResponse.length,
                spatialContext: true
            };
            
            await this.cacheResponse(
                question,
                location.lat,
                location.lng,
                zoneData.zone_name,
                responseWithFooter,
                metadata
            );

            return {
                response: responseWithFooter,
                metadata,
                cached: false
            };

        } catch (error) {
            console.error('Error generating spatial response:', error);
            
            // Fallback to basic response
            return {
                response: this.generateFallbackResponse(question, zoneData),
                metadata: { fallback: true, error: error.message },
                cached: false
            };
        }
    }

    // Fallback response when AI is unavailable
    generateFallbackResponse(question, zoneData) {
        return `OFFLINE MODE - Basic Analysis for ${zoneData.zone_name}

${zoneData.regulations?.description || 'Development zone per master plan'}

Key Regulations:
• Max Height: ${zoneData.regulations?.maxHeight || 'Check with authorities'}
• Max Coverage: ${zoneData.regulations?.coverage || 'Check with authorities'}
• Min Lot Size: ${zoneData.regulations?.minLotSize || 'Check with authorities'}

For detailed guidance on your question: "${question}"

Contact City of Kigali Planning Office:
📞 +250 788 000 000
🌐 kigalicity.gov.rw

Note: AI assistant is temporarily offline. This is basic information only.`;
    }

    // Log analytics
    async logAnalytics(sessionId, question, location, zoneName, responseType, responseLength, userAgent, ipAddress) {
        try {
            await pool.query(`
                INSERT INTO user_analytics 
                (session_id, question, location, zone_name, response_type, ai_response_length, user_agent, ip_address)
                VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6, $7, $8, $9)
            `, [
                sessionId,
                question,
                location.lng,
                location.lat,
                zoneName,
                responseType,
                responseLength,
                userAgent,
                ipAddress
            ]);
        } catch (error) {
            console.error('Error logging analytics:', error);
        }
    }
}

module.exports = new ClaudeService();
