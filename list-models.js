const axios = require('axios');
require('dotenv').config();

async function listModels() {
    console.log('🔍 Fetching available Gemini models...');
    console.log('API Key:', process.env.GEMINI_API_KEY ? '✅ Present' : '❌ Missing');
    
    if (!process.env.GEMINI_API_KEY) {
        console.log('❌ API key missing! Add to .env file');
        return;
    }

    try {
        const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
        );
        
        console.log('\n✅ Available Gemini Models:');
        console.log('========================================');
        
        let geminiModels = response.data.models.filter(model => 
            model.name.includes('gemini')
        );
        
        geminiModels.forEach((model, index) => {
            console.log(`\n${index + 1}. ${model.name}`);
            console.log(`   Description: ${model.description || 'N/A'}`);
            console.log(`   Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
            console.log(`   Version: ${model.version || 'N/A'}`);
        });
        
        console.log('\n========================================');
        console.log(`Total Gemini models found: ${geminiModels.length}`);
        
        // Recommended model
        const recommended = geminiModels.find(m => m.name.includes('gemini-2.0-flash'));
        if (recommended) {
            console.log('\n✨ Recommended model:', recommended.name);
        }
        
    } catch (error) {
        console.log('\n❌ Failed to fetch models!');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
}

listModels();