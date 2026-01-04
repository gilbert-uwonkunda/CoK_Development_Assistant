// src/services/claudeService.js
const crypto = require('crypto');
const { pool } = require('../config/database');

class ClaudeService {
    constructor() {
        this.apiKey = process.env.CLAUDE_API_KEY;
        this.apiUrl = 'https://api.anthropic.com/v1/messages';
        this.model = 'claude-sonnet-4-20250514';
        this.maxTokens = 2000;
        
        // Language configurations
        this.languages = {
            en: {
                name: 'English',
                instruction: 'Respond in English.',
                footer: {
                    location: 'Location',
                    contact: 'City of Kigali Planning',
                    moreInfo: 'More info'
                }
            },
            rw: {
                name: 'Kinyarwanda',
                instruction: 'Subiza mu Kinyarwanda gusa. Koresha amagambo yoroshye yumvikana.',
                footer: {
                    location: 'Aho hantu',
                    contact: 'Umujyi wa Kigali - Imiyoborere',
                    moreInfo: 'Amakuru yinyongera'
                }
            },
            fr: {
                name: 'Français',
                instruction: 'Répondez entièrement en français.',
                footer: {
                    location: 'Emplacement',
                    contact: 'Planification de la Ville de Kigali',
                    moreInfo: 'Plus d\'infos'
                }
            }
        };
    }

    // Generate cache key for questions
    generateCacheKey(question, lat, lng, zoneName, language) {
        const key = `${question}_${lat.toFixed(4)}_${lng.toFixed(4)}_${zoneName}_${language}`;
        return crypto.createHash('md5').update(key).digest('hex');
    }

    // Check for cached response
    async getCachedResponse(question, lat, lng, zoneName, language = 'en') {
        try {
            const cacheKey = this.generateCacheKey(question, lat, lng, zoneName, language);
            
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
    async cacheResponse(question, lat, lng, zoneName, language, response, metadata) {
        try {
            const cacheKey = this.generateCacheKey(question, lat, lng, zoneName, language);
            
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

    // Build comprehensive spatial prompt with language support
    buildSpatialPrompt(question, spatialData, language = 'en') {
        const { location, zoneData, nearbyFeatures } = spatialData;
        const langConfig = this.languages[language] || this.languages.en;
        
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

LANGUAGE INSTRUCTION: ${langConfig.instruction}

RESPONSE FORMAT RULES (CRITICAL - FOLLOW EXACTLY):
1. Keep response SHORT and CLEAR - maximum 200 words
2. Start with a ONE SENTENCE direct answer (YES/NO/CONDITIONAL + brief reason)
3. Use only 3-5 bullet points for key requirements
4. NO headers or markdown formatting (no ##, no **, no ###)
5. NO lengthy explanations - citizens need quick, actionable answers
6. End with ONE contact number and ONE website
7. Write like you're texting a friend - simple, direct, helpful

EXAMPLE FORMAT:
[Direct answer in one sentence]

Key points:
• [Most important requirement]
• [Second requirement]
• [Third requirement]

Next step: [Single clear action]

Contact: [Phone] | [Website]

NOW RESPOND TO THE CITIZEN'S QUESTION IN THE SPECIFIED LANGUAGE:`;
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

        const requestBody = {
            model: this.model,
            max_tokens: this.maxTokens,
            system: `You are TerraNebular, a friendly spatial intelligence assistant for Kigali, Rwanda. 

YOUR PERSONALITY:
- Speak like a helpful local expert, not a robot
- Be warm, concise, and practical
- Give clear YES/NO/MAYBE answers first
- Keep responses under 200 words
- Use simple language anyone can understand

You speak English, Kinyarwanda (Ikinyarwanda), and French fluently. Always respond in the language requested.`,
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

            if (!response.ok) {
                const errorData = await response.text();
                console.log('ERROR Response body:', errorData);
                throw new Error(`Claude API error: ${response.status} - ${errorData}`);
            }

            const data = await response.json();
            console.log('SUCCESS! Response received');
            console.log('- Content length:', data.content[0].text.length);
            console.log('=== END CLAUDE API DEBUG ===');
            
            return data.content[0].text;

        } catch (error) {
            console.log('EXCEPTION in Claude API call:');
            console.log('- Error message:', error.message);
            console.log('=== END CLAUDE API DEBUG ===');
            throw error;
        }
    }

    // Generate AI response with spatial context and language support
    async generateSpatialResponse(question, spatialData, language = 'en') {
        const { location, zoneData } = spatialData;
        const langConfig = this.languages[language] || this.languages.en;
        
        try {
            // Check cache first
            const cached = await this.getCachedResponse(
                question, 
                location.lat, 
                location.lng, 
                zoneData.zone_name,
                language
            );
            
            if (cached) {
                return cached;
            }

            // Build spatial prompt with language
            const prompt = this.buildSpatialPrompt(question, spatialData, language);
            
            // Call Claude API
            const aiResponse = await this.callClaudeAPI(prompt);
            
            // Add footer in appropriate language
            const footer = langConfig.footer;
            const responseWithFooter = `${aiResponse}

📍 ${footer.location}: ${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}°
📞 ${footer.contact}: +250 788 000 000
🌐 ${footer.moreInfo}: kigalicity.gov.rw`;

            // Cache the response
            const metadata = {
                model: this.model,
                language: language,
                tokens: aiResponse.length,
                spatialContext: true
            };
            
            await this.cacheResponse(
                question,
                location.lat,
                location.lng,
                zoneData.zone_name,
                language,
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
            
            // Fallback response in appropriate language
            return {
                response: this.generateFallbackResponse(question, zoneData, language),
                metadata: { fallback: true, error: error.message, language },
                cached: false
            };
        }
    }

    // Fallback response when AI is unavailable - multi-language
    generateFallbackResponse(question, zoneData, language = 'en') {
        const fallbacks = {
            en: `Apologies, TerraNebular AI is temporarily offline.

Your location: ${zoneData.zone_name}

For assistance with "${question}", please contact:
📞 City of Kigali: +250 788 000 000
🌐 kigalicity.gov.rw

We'll be back online shortly!`,
            
            rw: `Mbabarira, TerraNebular AI ntiriho ubu.

Aho uri: ${zoneData.zone_name}

Kubaza "${question}", hamagara:
📞 Umujyi wa Kigali: +250 788 000 000
🌐 kigalicity.gov.rw

Tugaruka vuba!`,
            
            fr: `Désolé, TerraNebular AI est temporairement hors ligne.

Votre zone: ${zoneData.zone_name}

Pour "${question}", contactez:
📞 Ville de Kigali: +250 788 000 000
🌐 kigalicity.gov.rw

Nous serons bientôt de retour!`
        };
        
        return fallbacks[language] || fallbacks.en;
    }

    // Log analytics
    async logAnalytics(sessionId, question, location, zoneName, responseType, responseLength, userAgent, ipAddress, language) {
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
