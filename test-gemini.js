require('dotenv').config();
const axios = require('axios');

async function testGemini(retryCount = 0) {
    console.log('🔍 Testing Gemini API...');
    console.log('API Key present:', process.env.GEMINI_API_KEY ? '✅ Yes' : '❌ No');
    
    const models = [
        'gemini-1.5-flash',
        'gemini-2.0-flash-lite', 
        'gemini-2.5-flash-lite',
        'gemini-2.0-flash'
    ];
    
    for (const model of models) {
        try {
            console.log(`\n📡 Trying model: ${model}`);
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    contents: [{
                        parts: [{
                            text: "Generate 2 JavaScript interview questions"
                        }]
                    }]
                }
            );
            console.log(`✅ ${model} Success!`);
            console.log('📝 Questions:', response.data.candidates[0].content.parts[0].text);
            return;
        } catch (error) {
            if (error.response) {
                console.log(`❌ ${model} failed - Status: ${error.response.status}`);
                if (error.response.status === 429) {
                    console.log('   ⏳ Quota exceeded for this model');
                    if (model === models[models.length - 1] && retryCount < 3) {
                        console.log(`⏳ All models exhausted. Retry ${retryCount + 1}/3 in 60s...`);
                        await new Promise(r => setTimeout(r, 60000));
                        return testGemini(retryCount + 1);
                    }
                }
            }
        }
    }
    console.log('\n❌ All models failed! Get new API key from https://aistudio.google.com/');
}

testGemini();