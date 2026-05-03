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

    // Try Google Gemini first (free)
    const geminiApiKey = process.env.GEMINI_API_KEY;
    console.log('Gemini API key exists:', !!geminiApiKey);
    console.log('Gemini API key length:', geminiApiKey?.length);
    console.log('API key starts with:', geminiApiKey?.substring(0, 10));
    
    if (geminiApiKey && geminiApiKey.length > 10) {
      try {
        console.log('Making Gemini API request...');
        // First try to list models to see if API key works
        const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`);
        
        if (modelsResponse.ok) {
          const modelsData = await modelsResponse.json();
          console.log('Available models:', modelsData.models?.map(m => m.name).slice(0, 5));
          
          // Find a model that supports generateContent
          const supportedModel = modelsData.models?.find(m => 
            m.name.includes('gemini') && 
            m.supportedGenerationMethods?.includes('generateContent')
          );
          
          if (supportedModel) {
            console.log('Using model:', supportedModel.name);
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${supportedModel.name}:generateContent?key=${geminiApiKey}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                contents: messages.map(msg => ({
                  role: msg.role === 'user' ? 'user' : 'model',
                  parts: [{ text: msg.content }]
                })),
                generationConfig: {
                  maxOutputTokens: max_tokens,
                  temperature: 0.7
                }
              })
            });

            if (response.ok) {
              const data = await response.json();
              const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
              
              return res.json({
                success: true,
                content: content,
                provider: 'gemini'
              });
            } else {
              const errorData = await response.json().catch(() => ({}));
              console.error('Gemini API error response:', response.status, errorData);
              return res.status(500).json({
                success: false,
                message: 'Gemini API error',
                error: errorData,
                status: response.status
              });
            }
          } else {
            console.error('No Gemini model found');
            return res.status(500).json({
              success: false,
              message: 'No Gemini model available'
            });
          }
        } else {
          const errorData = await modelsResponse.json().catch(() => ({}));
          console.error('Models API error:', modelsResponse.status, errorData);
          return res.status(500).json({
            success: false,
            message: 'Failed to list Gemini models',
            error: errorData
          });
        }
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError);
        return res.status(500).json({
          success: false,
          message: 'Gemini API failed',
          error: geminiError.message
        });
      }
    }

    // Fallback to Anthropic if available
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicApiKey) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicApiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: max_tokens,
            messages: messages
          })
        });

        if (response.ok) {
          const data = await response.json();
          
          return res.json({
            success: true,
            content: data.content[0]?.text || '',
            provider: 'anthropic'
          });
        }
      } catch (anthropicError) {
        console.error('Anthropic API error:', anthropicError);
      }
    }

    // No API keys configured - return a helpful response
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
