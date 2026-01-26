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
        if (!apiKey) {
            throw new Error('API key not configured. Please set your Gemini API key in settings.');
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
                const errorData = await response.json().catch(() => ({}));

                if (response.status === 400) {
                    throw new Error('Invalid API key or request. Please check your Gemini API key.');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again in a moment.');
                } else if (response.status === 500) {
                    throw new Error('Gemini AI service error. Please try again later.');
                } else {
                    throw new Error(errorData.error?.message || `API error: ${response.status}`);
                }
            }

            const data = await response.json();

            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Invalid response from Gemini AI');
            }

            let rewrittenContent = data.candidates[0].content.parts[0].text.trim();

            // Clean up the response: remove markdown bolding, quotes, etc.
            // Often models return **text** or "text"
            rewrittenContent = rewrittenContent
                .replace(/^\*\*+|\*\*+$/g, '') // Remove leading/trailing **
                .replace(/^"+|"+$/g, '')       // Remove leading/trailing double quotes
                .replace(/^'+|'+$/g, '')       // Remove leading/trailing single quotes
                .replace(/\*\*/g, '')          // Remove any remaining double asterisks
                .trim();

            return rewrittenContent;

        } catch (error) {
            // Network errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error. Please check your internet connection.');
            }

            // Re-throw other errors
            throw error;
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
