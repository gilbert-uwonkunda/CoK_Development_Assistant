// =============================================================================
// IMPROVED CLAUDE SERVICE - AUTHORITATIVE ZONING RESPONSES
// Designed for "Zero Trips, Zero Paper" - World Bank Mission
// =============================================================================

const crypto = require('crypto');
const { pool } = require('../config/database');
const { ZONING_KNOWLEDGE_BASE, getZoneInfo, normalizeZoneName, isUsePermitted, getDevelopmentParams } = require('./kigaliZoningKnowledgeBase');

class ClaudeService {
    constructor() {
        this.apiKey = process.env.CLAUDE_API_KEY;
        this.apiUrl = 'https://api.anthropic.com/v1/messages';
        this.model = 'claude-sonnet-4-20250514';
        this.maxTokens = 2500;
        
        // Language configurations
        this.languages = {
            en: {
                name: 'English',
                instruction: 'Respond in English.',
                footer: {
                    location: 'Location',
                    contact: 'City of Kigali Planning',
                    moreInfo: 'More info',
                    source: 'Source'
                }
            },
            rw: {
                name: 'Kinyarwanda',
                instruction: 'Subiza mu Kinyarwanda gusa. Koresha amagambo yoroshye yumvikana.',
                footer: {
                    location: 'Aho hantu',
                    contact: 'Umujyi wa Kigali - Imiyoborere',
                    moreInfo: 'Amakuru yinyongera',
                    source: 'Ibyavuye'
                }
            },
            fr: {
                name: 'Français',
                instruction: 'Répondez entièrement en français.',
                footer: {
                    location: 'Emplacement',
                    contact: 'Planification de la Ville de Kigali',
                    moreInfo: 'Plus d\'infos',
                    source: 'Source'
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
                console.log('✅ Found cached AI response');
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

    // =============================================================================
    // CORE IMPROVEMENT: Build authoritative spatial prompt with REAL regulations
    // =============================================================================
    
    buildAuthoritativeSpatialPrompt(question, spatialData, language = 'en') {
        const { location, zoneData, nearbyFeatures } = spatialData;
        const langConfig = this.languages[language] || this.languages.en;
        
        // Get authoritative zone information from knowledge base
        const normalizedCode = normalizeZoneName(zoneData.zone_name);
        const authoritativeZone = getZoneInfo(normalizedCode);
        const devParams = getDevelopmentParams(normalizedCode);
        
        // Build comprehensive regulatory context
        let regulatoryContext = '';
        
        if (authoritativeZone) {
            regulatoryContext = `
AUTHORITATIVE ZONING REGULATIONS (Source: Kigali City Zoning Regulations, Effective August 28, 2020)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ZONE: ${authoritativeZone.fullName} (${authoritativeZone.code})
LEGAL REFERENCE: ${authoritativeZone.article}, ${authoritativeZone.table}

OFFICIAL DESCRIPTION:
${authoritativeZone.description}

PERMITTED USES (No additional approval required):
${authoritativeZone.uses?.permitted?.map(u => `• ${u}`).join('\n') || '• Check with OSC'}

CONDITIONAL USES (Requires OSC approval):
${authoritativeZone.uses?.conditional?.map(u => `• ${u}`).join('\n') || '• None specified'}

PROHIBITED USES (Not allowed):
${authoritativeZone.uses?.prohibited?.map(u => `• ${u}`).join('\n') || '• None specified'}

DEVELOPMENT PARAMETERS:
${devParams ? `
• Maximum Lot Size: ${devParams.lotSize?.max || devParams.lotSize?.min || 'As per UPC'}
• Maximum Building Coverage: ${devParams.coverage?.maxBuilding || 'Per regulations'}
• Minimum Landscaping: ${devParams.coverage?.minLandscaping || 'Per regulations'}
• Maximum FAR (Floor Area Ratio): ${devParams.far?.max || 'Per regulations'}
• Residential Density (Single Use): ${devParams.density?.singleUse || 'Per regulations'}
• Residential Density (Mixed Use): ${devParams.density?.mixedUse || 'Per regulations'}
• Maximum Building Height: ${devParams.maxFloors || 'Per regulations'}
• Allowed Building Forms: ${devParams.buildingForm?.join(', ') || 'Per regulations'}
` : '• Contact OSC for specific parameters'}

${authoritativeZone.developmentStrategy ? `
DEVELOPMENT STRATEGY OPTIONS:
${authoritativeZone.developmentStrategy.map(s => `• ${s}`).join('\n')}
` : ''}

${authoritativeZone.signage ? `
SIGNAGE REGULATIONS:
• ${authoritativeZone.signage.permitted || 'Per regulations'}
• Maximum Size: ${authoritativeZone.signage.maxSize || 'Per regulations'}
` : ''}
`;
        } else {
            regulatoryContext = `
ZONE: ${zoneData.zone_name}
Note: Detailed regulations for this specific zone should be verified with City of Kigali OSC.
`;
        }

        // Add general provisions that apply to all zones
        const generalProvisions = `
APPLICABLE GENERAL PROVISIONS (Article 4):

HOME OCCUPATION (Article 4.10):
• Allowed in all residential zones
• Maximum 25% of floor area for business use
• Maximum 1 non-resident worker
• Permitted: Professional offices, IT consultancy, teaching (not schools)
• Prohibited: Car trading, commercial schools, courier businesses

INCREMENTAL DEVELOPMENT (Article 4.6):
• Allowed to match financial capacity
• Requires conceptual final design with expected GFA
• Must include tentative phasing plan
• Building must not appear incomplete during phases

ACCESSORY RESIDENTIAL UNITS (Article 4.11):
• Allowed in R1, R1A, R2, R3 zones
• Maximum 3 units per dwelling
• Minimum 9m² single, 15m² double occupancy
• Requires separate entrance, kitchen, bathroom

PARKING REQUIREMENTS (Article 6.7):
• Residential: 1 space per unit (apartments <100m²)
• Office: 1 space per 50m² GFA
• Retail: 1 space per 30m² GFA
• Restaurant: 1 space per 15m² dining area
`;

        // Build the full prompt
        return `You are TerraNebular, an AUTHORITATIVE spatial intelligence assistant for Kigali, Rwanda.

YOUR MISSION: "Zero Trips, Zero Paper"
Provide definitive answers so citizens don't need to visit government offices. Every response must be legally accurate and citable.

LANGUAGE INSTRUCTION: ${langConfig.instruction}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOCATION CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Coordinates: ${location.lat.toFixed(6)}°, ${location.lng.toFixed(6)}°
• Zone Name: ${zoneData.zone_name}
${zoneData.phase ? `• Phase: ${zoneData.phase}` : ''}
${nearbyFeatures && nearbyFeatures.length > 0 ? `
• Nearby Zones: ${nearbyFeatures.slice(0, 3).map(f => `${f.zone_name} (${Math.round(f.distance)}m)`).join(', ')}
` : ''}

${regulatoryContext}

${generalProvisions}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CITIZEN'S QUESTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"${question}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSE REQUIREMENTS (CRITICAL - FOLLOW EXACTLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. DIRECT ANSWER FIRST
   - Start with YES, NO, or CONDITIONAL in first sentence
   - Give the specific answer immediately
   - Never be vague - if allowed, say "PERMITTED"; if needs approval, say "CONDITIONAL"

2. CITE YOUR SOURCES
   - Reference specific Articles and Tables (e.g., "Per Article 6.1, Table 6.4...")
   - Quote exact numbers (FAR, coverage %, floor limits)
   - This makes your answer verifiable and authoritative

3. PROVIDE SPECIFIC NUMBERS
   - Instead of "check with authorities" → give the actual regulation
   - Maximum building coverage: State the exact percentage
   - Maximum floors: State the exact limit (e.g., "G+2" or "G+4")
   - FAR: State the exact ratio

4. NEXT STEPS
   - If PERMITTED: List what documents are needed for permit application
   - If CONDITIONAL: Explain what OSC will evaluate
   - If PROHIBITED: Suggest alternatives or variance process

5. FORMAT
   - Maximum 250 words
   - No markdown formatting (no ##, **, etc.)
   - Use simple bullet points (•) for lists
   - End with legal source citation

EXAMPLE RESPONSE STRUCTURE:
━━━━━━━━━━━━━━━━━━━━━━━━━━
[YES/NO/CONDITIONAL] - [Direct answer in one sentence]

Per [Article X, Table Y], this zone allows/restricts [specific answer].

Key regulations:
• [Specific number/requirement with source]
• [Specific number/requirement with source]
• [Specific number/requirement with source]

Next steps:
[Single clear action with where to apply]

Legal basis: Kigali City Zoning Regulations (August 2020), [Article], [Table]
━━━━━━━━━━━━━━━━━━━━━━━━━━

NOW RESPOND TO THE CITIZEN'S QUESTION:`;
    }

    // Call Claude API
    async callClaudeAPI(prompt) {
        console.log('=== CLAUDE API CALL ===');
        console.log('API Key configured:', !!this.apiKey);
        console.log('Model:', this.model);
        
        if (!this.apiKey) {
            throw new Error('Claude API key not configured');
        }

        const requestBody = {
            model: this.model,
            max_tokens: this.maxTokens,
            system: `You are TerraNebular, an authoritative spatial intelligence assistant for Kigali, Rwanda.

YOUR CORE PRINCIPLES:
1. AUTHORITATIVE: Every answer cites specific Articles, Tables, and numbers from Kigali City Zoning Regulations (August 2020)
2. ACTIONABLE: Citizens should not need to visit government offices after reading your response
3. SPECIFIC: Never say "check with authorities" when you have the regulation in context
4. MULTILINGUAL: Respond fluently in English, Kinyarwanda, or French as requested

You have been provided with the complete, authoritative zoning regulations. Use them to give definitive answers.`,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        };

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

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Claude API error: ${response.status} - ${errorData}`);
            }

            const data = await response.json();
            console.log('✅ Claude API response received');
            
            return data.content[0].text;

        } catch (error) {
            console.error('❌ Claude API error:', error.message);
            throw error;
        }
    }

    // Generate AI response with authoritative spatial context
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

            // Build authoritative prompt with real regulations
            const prompt = this.buildAuthoritativeSpatialPrompt(question, spatialData, language);
            
            // Call Claude API
            const aiResponse = await this.callClaudeAPI(prompt);
            
            // Get zone info for footer
            const normalizedCode = normalizeZoneName(zoneData.zone_name);
            const authZone = getZoneInfo(normalizedCode);
            
            // Add authoritative footer
            const footer = langConfig.footer;
            const responseWithFooter = `${aiResponse}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 ${footer.location}: ${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}°
📋 ${footer.source}: Kigali City Zoning Regulations (August 2020)${authZone ? `, ${authZone.article}, ${authZone.table}` : ''}
📞 ${footer.contact}: +250 788 000 000
🌐 Kubaka: https://kubaka.gov.rw/| CoK: kigalicity.gov.rw`;

            // Cache the response
            const metadata = {
                model: this.model,
                language: language,
                tokens: aiResponse.length,
                spatialContext: true,
                zoneCode: normalizedCode,
                authoritative: true
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
            
            // Fallback response with real regulatory info when possible
            return {
                response: this.generateAuthoritativeFallback(question, zoneData, language),
                metadata: { fallback: true, error: error.message, language },
                cached: false
            };
        }
    }

    // Fallback response that still provides authoritative information
    generateAuthoritativeFallback(question, zoneData, language = 'en') {
        const normalizedCode = normalizeZoneName(zoneData.zone_name);
        const authZone = getZoneInfo(normalizedCode);
        const devParams = getDevelopmentParams(normalizedCode);
        
        let zoneInfo = '';
        if (authZone && devParams) {
            zoneInfo = `

Zone: ${authZone.fullName} (${authZone.code})
Reference: ${authZone.article}, ${authZone.table}

Key Parameters:
• Max Building Coverage: ${devParams.coverage?.maxBuilding || 'Per regulations'}
• Max FAR: ${devParams.far?.max || 'Per regulations'}
• Max Floors: ${devParams.maxFloors || 'Per regulations'}
• Min Landscaping: ${devParams.coverage?.minLandscaping || 'Per regulations'}

Permitted Uses: ${authZone.uses?.permitted?.slice(0, 3).join(', ') || 'Contact OSC'}`;
        }

        const fallbacks = {
            en: `TerraNebular is temporarily unable to generate a detailed response, but here is the regulatory information for your location:
${zoneInfo}

For your specific question about "${question}", please contact:
📞 City of Kigali OSC: +250 788 000 000
🌐 Online permits: https://kubaka.gov.rw/
📋 Source: Kigali City Zoning Regulations (August 2020)`,
            
            rw: `TerraNebular ntishobora gusubiza neza ubu, ariko dore amakuru y'amategeko aho uri:
${zoneInfo}

Kubaza ku "${question}", hamagara:
📞 Umujyi wa Kigali OSC: +250 788 000 000
🌐 Uruhushya kuri interineti: https://kubaka.gov.rw/`,
            
            fr: `TerraNebular ne peut pas générer une réponse détaillée pour le moment, mais voici les informations réglementaires pour votre emplacement:
${zoneInfo}

Pour votre question sur "${question}", contactez:
📞 Ville de Kigali OSC: +250 788 000 000
🌐 Permis en ligne:https://kubaka.gov.rw/`
        };
        
        return fallbacks[language] || fallbacks.en;
    }

    // Analytics logging
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
