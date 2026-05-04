const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// @route   POST /api/ai/chat
// @desc    Chat with AI (supports multiple providers)
// @access  Private
router.post('/chat', async (req, res) => {
  try {
    const { messages, max_tokens = 1000 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: 'Messages array is required'
      });
    }

    // Try to use Gemini API if available
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (geminiApiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: messages[messages.length - 1].content
              }]
            }],
            generationConfig: {
              maxOutputTokens: max_tokens,
              temperature: 0.7,
            }
          })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          const aiResponse = data.candidates[0].content.parts[0].text;
          return res.json({
            success: true,
            content: aiResponse,
            provider: 'gemini'
          });
        }
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError);
      }
    }

    // Fallback response if Gemini API fails or is not configured
    return res.json({
      success: true,
      content: "Hi! I'm FlowSpace AI assistant. Currently, the AI service is being configured. In the meantime, you can:\n\n• Create and manage tasks\n• Set up reminders and habits\n• Use the planner to organize your day\n• Track your productivity analytics\n\nThe AI chat feature will be available soon. Please check back later!",
      provider: 'fallback'
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI request'
    });
  }
});

module.exports = router;
