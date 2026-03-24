const mongoose = require('mongoose');
require('dotenv').config();
const Interview = require('./models/Interview');

async function testSave() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
        
        // Create test interview
        const interview = await Interview.create({
            user: new mongoose.Types.ObjectId(), // Valid ObjectId
            type: 'direct',
            subject: 'technical',
            difficulty: 'beginner',
            questions: Array(15).fill('What is closure in JavaScript?'),
            status: 'in-progress',
            startedAt: new Date()
        });
        
        console.log('✅ Success! Saved', interview.questions.length, 'questions');
        console.log('📝 Interview ID:', interview._id);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
        process.exit();
    }
}

testSave();