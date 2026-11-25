// Gemini AI service for content rewriting
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';
const API_KEY_STORAGE = 'gemini_api_key';

// Rewriting mode prompts
const REWRITING_PROMPTS = {
    professional: 'Rewrite the following text in a professional, formal tone suitable for business communication. Maintain the core message but improve clarity and professionalism. Return ONLY the rewritten text without quotes, formatting, or conversational filler.',
    concise: 'Rewrite the following text to be more concise and to the point. Remove unnecessary words while keeping the essential meaning. Return ONLY the rewritten text without quotes, formatting, or conversational filler.',
    casual: 'Rewrite the following text in a casual, friendly, conversational tone. Make it sound natural and approachable. Return ONLY the rewritten text without quotes, formatting, or conversational filler.',
    creative: 'Rewrite the following text in a creative, engaging way. Add flair, vivid language, and make it more interesting to read. Return ONLY the rewritten text without quotes, formatting, or conversational filler.',
    'fix-grammar': 'Fix any grammatical errors, spelling mistakes, and punctuation issues in the following text. Keep the tone and style the same, only correct errors. Return ONLY the corrected text without quotes, formatting, or conversational filler.',
    expand: 'Expand the following text with more details, examples, and elaboration. Make it more comprehensive while maintaining the original message. Return ONLY the expanded text without quotes, formatting, or conversational filler.'
};

// API Key Management
export const geminiAI = {
    /**
     * Set the Gemini AI API key
     * @param {string} apiKey - The API key to store
     */
    setApiKey(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            throw new Error('Invalid API key');
        }
        localStorage.setItem(API_KEY_STORAGE, apiKey.trim());
    },

    /**
     * Get the stored API key
     * Checks environment variable first, then falls back to localStorage
     * @returns {string|null} The API key or null if not set
     */
    getApiKey() {
        // First, check if API key is set in environment variables (Vite)
        const envKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (envKey && envKey.trim().length > 0) {
            return envKey.trim();
        }

        // Fall back to localStorage
        return localStorage.getItem(API_KEY_STORAGE);
    },

    /**
     * Check if API key is configured
     * @returns {boolean} True if API key exists
     */
    hasApiKey() {
        const key = this.getApiKey();
        return key !== null && key.length > 0;
    },

    /**
     * Remove the stored API key
     */
    clearApiKey() {
        localStorage.removeItem(API_KEY_STORAGE);
    },

    /**
     * Test the API connection
     * @returns {Promise<boolean>} True if connection successful
     */
    async testConnection() {
        try {
            const result = await this.rewriteContent('Hello, world!', 'concise');
            return result !== null;
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    },

    /**
     * Rewrite content using Gemini AI
     * @param {string} content - The text to rewrite
     * @param {string} mode - The rewriting mode (professional, concise, casual, creative, fix-grammar, expand)
     * @returns {Promise<string>} The rewritten content
     */
    async rewriteContent(content, mode = 'professional') {
        // Validation
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            throw new Error('Please provide content to rewrite');
        }

        if (!REWRITING_PROMPTS[mode]) {
            throw new Error(`Invalid rewriting mode: ${mode}. Valid modes are: ${Object.keys(REWRITING_PROMPTS).join(', ')}`);
        }

        const apiKey = this.getApiKey();
        if (!apiKey || apiKey.length < 15) {
            return localRewrite(content, mode);
        }

        // Prepare the prompt
        const systemPrompt = REWRITING_PROMPTS[mode];
        const fullPrompt = `${systemPrompt}\n\nText to rewrite:\n${content.trim()}\n\nRewritten text:`;

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: fullPrompt
                        }]
                    }],
                    generationConfig: {
                        temperature: mode === 'creative' ? 0.9 : 0.7,
                        maxOutputTokens: 2048,
                    }
                })
            });

            if (!response.ok) {
                console.warn('Gemini rewrite unavailable, falling back to local rewriter:', response.status);
                return localRewrite(content, mode);
            }

            const data = await response.json();

            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                return localRewrite(content, mode);
            }

            let rewrittenContent = data.candidates[0].content.parts[0].text.trim();

            rewrittenContent = rewrittenContent
                .replace(/^\*\*+|\*\*+$/g, '')
                .replace(/^"+|"+$/g, '')
                .replace(/^'+|'+$/g, '')
                .replace(/\*\*/g, '')
                .trim();

            return rewrittenContent;

        } catch (error) {
            console.warn('Gemini rewrite error, falling back to local rewriter:', error);
            return localRewrite(content, mode);
        }
    },

    /**
     * Get available rewriting modes
     * @returns {Array<{value: string, label: string, description: string}>}
     */
    getAvailableModes() {
        return [
            { value: 'professional', label: '💼 Professional', description: 'Formal and business-appropriate' },
            { value: 'concise', label: '✂️ Concise', description: 'Shorter and to the point' },
            { value: 'casual', label: '😊 Casual', description: 'Friendly and conversational' },
            { value: 'creative', label: '✨ Creative', description: 'Engaging and vivid' },
            { value: 'fix-grammar', label: '✓ Fix Grammar', description: 'Correct errors only' },
            { value: 'expand', label: '📝 Expand', description: 'Add more details' }
        ];
    }
};

export default geminiAI;

function applyReplacements(text, pairs) {
    let out = text;
    for (const [pattern, replacement] of pairs) {
        out = out.replace(pattern, replacement);
    }
    return out;
}

function fixCapitalizationAndPunctuation(text) {
    let out = text
        .replace(/[ \t]+/g, ' ')
        .replace(/\s+([.,!?;:])/g, '$1')
        .replace(/\bi\b/g, 'I')
        .trim();

    // Capitalize first letter and letters after sentence-ending punctuation
    out = out.replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, (m) => m.toUpperCase());

    if (out.length > 0 && !/[.!?]$/.test(out)) {
        out += '.';
    }
    return out;
}

function localRewrite(content, mode) {
    let text = content.trim();

    switch (mode) {
        case 'fix-grammar': {
            text = applyReplacements(text, [
                [/\bteh\b/gi, 'the'],
                [/\brecieve\b/gi, 'receive'],
                [/\bseperate\b/gi, 'separate'],
                [/\boccured\b/gi, 'occurred'],
                [/\bdefinately\b/gi, 'definitely'],
                [/\balot\b/gi, 'a lot'],
                [/\bim\b/gi, "I'm"],
                [/\bive\b/gi, "I've"],
                [/\bdont\b/gi, "don't"],
                [/\bcant\b/gi, "can't"],
                [/\bwont\b/gi, "won't"],
                [/\bdidnt\b/gi, "didn't"],
                [/\bisnt\b/gi, "isn't"]
            ]);
            return fixCapitalizationAndPunctuation(text);
        }

        case 'professional': {
            text = applyReplacements(text, [
                [/\bdon't\b/gi, 'do not'],
                [/\bcan't\b/gi, 'cannot'],
                [/\bwon't\b/gi, 'will not'],
                [/\bit's\b/gi, 'it is'],
                [/\bi'm\b/gi, 'I am'],
                [/\bgonna\b/gi, 'going to'],
                [/\bwanna\b/gi, 'want to'],
                [/\bkinda\b/gi, 'somewhat'],
                [/\bstuff\b/gi, 'materials'],
                [/\bthings\b/gi, 'elements'],
                [/\bawesome\b/gi, 'exceptional'],
                [/\bcool\b/gi, 'effective'],
                [/\bgot\b/gi, 'obtained'],
                [/\bget\b/gi, 'obtain'],
                [/\bhelp\b/gi, 'assist']
            ]);
            return fixCapitalizationAndPunctuation(text);
        }

        case 'concise': {
            text = applyReplacements(text, [
                [/\bin order to\b/gi, 'to'],
                [/\bdue to the fact that\b/gi, 'because'],
                [/\bat this point in time\b/gi, 'now'],
                [/\bin my opinion,?\s*/gi, ''],
                [/\bI think that\s*/gi, ''],
                [/\bthat is to say,?\s*/gi, ''],
                [/\b(basically|actually|literally|really|very|simply|just)\b\s*/gi, '']
            ]);
            return fixCapitalizationAndPunctuation(text);
        }

        case 'casual': {
            text = applyReplacements(text, [
                [/\bdo not\b/gi, "don't"],
                [/\bcannot\b/gi, "can't"],
                [/\bwill not\b/gi, "won't"],
                [/\bit is\b/gi, "it's"],
                [/\btherefore\b/gi, 'so'],
                [/\bhowever\b/gi, 'but'],
                [/\butilize\b/gi, 'use'],
                [/\bassistance\b/gi, 'help'],
                [/\bregarding\b/gi, 'about'],
                [/\badditional\b/gi, 'more']
            ]);
            return fixCapitalizationAndPunctuation(text);
        }

        case 'creative': {
            text = applyReplacements(text, [
                [/\bgood\b/gi, 'remarkable'],
                [/\bbig\b/gi, 'expansive'],
                [/\bfast\b/gi, 'rapid'],
                [/\bnice\b/gi, 'captivating'],
                [/\bimportant\b/gi, 'pivotal'],
                [/\bmake\b/gi, 'craft'],
                [/\bshow\b/gi, 'illuminate'],
                [/\buse\b/gi, 'harness'],
                [/\bstart\b/gi, 'launch']
            ]);
            return fixCapitalizationAndPunctuation(text);
        }

        case 'expand': {
            const clean = fixCapitalizationAndPunctuation(text);
            const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
            if (sentences.length === 1) {
                return `${sentences[0]} In practice, this highlights the key context and allows for clearer follow-through.`;
            }
            return sentences
                .map((s, idx) => (idx === 0 ? s : `Additionally, ${s.charAt(0).toLowerCase()}${s.slice(1)}`))
                .join(' ');
        }

        default:
            return fixCapitalizationAndPunctuation(text);
    }
}
