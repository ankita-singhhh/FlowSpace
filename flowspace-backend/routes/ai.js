const express = require('express');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/chat', async (req, res) => {
  try {
    const { messages, max_tokens = 1000 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: 'Messages array is required'
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    console.log('🤖 AI Chat: Gemini API Key exists:', !!geminiApiKey);
    
    if (geminiApiKey) {
      try {
        console.log('🤖 AI Chat: Calling Gemini API...');
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
              topK: 1,
              topP: 1,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH", 
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          })
        });

        console.log('🤖 AI Chat: Gemini API response status:', response.status);
        const data = await response.json();
        console.log('🤖 AI Chat: Gemini API response data:', JSON.stringify(data, null, 2));
        
        // Check for successful response
        if (data.candidates && data.candidates.length > 0) {
          const candidate = data.candidates[0];
          if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
            const aiResponse = candidate.content.parts[0].text;
            console.log('🤖 AI Chat: Successfully got response from Gemini');
            return res.json({
              success: true,
              content: aiResponse,
              provider: 'gemini'
            });
          } else if (candidate.finishReason) {
            console.log('🤖 AI Chat: Gemini response finished due to:', candidate.finishReason);
            if (candidate.finishReason === 'SAFETY') {
              return res.json({
                success: true,
                content: "I'm sorry, but I can't respond to that request due to safety guidelines. Could you please rephrase your question?",
                provider: 'gemini'
              });
            }
          }
        }
        
        // Check for API errors
        if (data.error) {
          console.log('🤖 AI Chat: Gemini API error:', data.error);
          if (data.error.code === 429) {
            return res.json({
              success: true,
              content: "I'm experiencing high demand right now. Please try again in a moment.",
              provider: 'gemini'
            });
          }
        }
        
        console.log('🤖 AI Chat: Invalid response format from Gemini');
      } catch (geminiError) {
        console.error('🤖 AI Chat: Gemini API error:', geminiError);
        console.error('🤖 AI Chat: Error details:', geminiError.message);
      }
    } else {
      console.log('🤖 AI Chat: No Gemini API key found in environment');
    }

    // 🔁 fallback
    return res.json({
      success: true,
      content:
        "Hi! I'm FlowSpace AI assistant. Currently, the AI service is being configured.\n\nTry again later or check API setup.",
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