const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Allow your React app to talk to this server
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// The secure route that your Chatbot will call
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    // Send the request to Groq using your hidden API key
    // Send the request to Groq using your hidden API key
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.7, // Adds natural creativity so it can handle random topics
        max_tokens: 800   // Gives the AI enough room to finish its thought
      })
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error('Groq rejected the request. Here is why:', errorDetails);
      throw new Error('Failed to communicate with Groq API');
    }

    const data = await response.json();
    
    // 1. Log Groq's exact response in your terminal to see what's happening
    console.log("Groq sent back:", data.choices[0].message);

    const replyContent = data.choices[0].message?.content || "";

    // 2. The Safety Net: If Groq sends an empty string, send a proper fallback
    if (replyContent.trim() === "") {
      console.warn("Warning: Groq returned an empty response.");
      return res.json({ reply: "I'm having a little trouble thinking of a response to that. Could you tell me a bit more?" });
    }
    
    // Send the AI's reply back to your React app
    res.json({ reply: replyContent });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

app.listen(port, () => {
  console.log(`Secure brain running on http://localhost:${port}`);
});