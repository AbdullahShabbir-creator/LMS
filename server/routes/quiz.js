const express = require('express');
const router = express.Router();
const ensureAuth = require('../middleware/ensureAuth');
const { OpenAI } = require('openai');

// Create a conditional OpenAI instance - only if API key is available
let openai = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('OpenAI API initialized successfully');
  } else {
    console.warn('OPENAI_API_KEY not set - AI quiz generation will use fallback mode');
  }
} catch (err) {
  console.error('Failed to initialize OpenAI client:', err.message);
}

// Generate mock quiz questions when OpenAI is unavailable
function generateMockQuestions(topic, difficulty, numQuestions, questionTypes) {
  const types = questionTypes || ['mcq', 'tf', 'fill', 'short'];
  const questions = [];
  
  // Generate the requested number of questions
  for (let i = 0; i < numQuestions; i++) {
    const type = types[i % types.length];
    
    let question = {
      type,
      difficulty: difficulty || 'Medium',
      explanation: `This is a sample explanation for ${topic}`
    };
    
    // Topic-based questions
    const lowerTopic = (topic || 'General Knowledge').toLowerCase();
    
    if (lowerTopic.includes('react') || lowerTopic.includes('javascript')) {
      if (type === 'mcq') {
        question.question = 'Which hook is used for side effects in React?';
        question.options = ['useEffect', 'useState', 'useContext', 'useReducer'];
        question.answer = 0;
      } else if (type === 'tf') {
        question.question = 'React is primarily a frontend library.';
        question.answer = true;
      } else if (type === 'fill') {
        question.question = 'In React, the virtual ____ improves performance.';
        question.answer = 'DOM';
      } else {
        question.question = 'Explain the concept of component lifecycle in React.';
        question.answer = 'It refers to the series of methods called during component mounting, updating, and unmounting.';
      }
    } else if (lowerTopic.includes('python')) {
      if (type === 'mcq') {
        question.question = 'Which is not a Python data type?';
        question.options = ['List', 'Dictionary', 'Array', 'Tuple'];
        question.answer = 2;
      } else if (type === 'tf') {
        question.question = 'Python is a compiled language.';
        question.answer = false;
      } else if (type === 'fill') {
        question.question = 'In Python, ____ are used to define functions.';
        question.answer = 'def';
      } else {
        question.question = 'Explain Python list comprehensions.';
        question.answer = 'Concise way to create lists using a single line of code with a for loop and optional conditions.';
      }
    } else {
      // Generic questions for any other topic
      if (type === 'mcq') {
        question.question = `Which is an important concept in ${topic}?`;
        question.options = ['Analysis', 'Application', 'Synthesis', 'All of the above'];
        question.answer = 3;
      } else if (type === 'tf') {
        question.question = `${topic} is an important field of study.`;
        question.answer = true;
      } else if (type === 'fill') {
        question.question = `${topic} requires ____ to master.`;
        question.answer = 'practice';
      } else {
        question.question = `Describe the importance of ${topic} in today's world.`;
        question.answer = 'It has significant relevance and applications in various domains.';
      }
    }
    
    questions.push(question);
  }
  
  return questions;
}

// POST /api/quiz/generate
router.post('/generate', ensureAuth, async (req, res) => {
  try {
    const { topic, difficulty, numQuestions = 10, questionTypes, context } = req.body;
    
    // Use fallback if OpenAI is not available
    if (!openai || !process.env.OPENAI_API_KEY) {
      console.log('Using fallback question generation for topic:', topic);
      const mockQuestions = generateMockQuestions(topic, difficulty, numQuestions, questionTypes);
      return res.json({ 
        questions: mockQuestions,
        source: 'fallback'
      });
    }
    
    // Otherwise use OpenAI
    const prompt = `Generate ${numQuestions} quiz questions about "${topic || 'React'}" at ${difficulty || 'mixed'} difficulty. Types: ${questionTypes?.join(', ') || 'MCQ, TF, Fill, Short'}. Format as a JSON array of objects with fields: type, question, options (for MCQ), answer, difficulty, explanation.` + (context ? ` Context: ${context}` : '');
    
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a quiz generator for a student learning platform.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1200
      });
      
      const text = completion.choices[0].message.content;
      let questions;
      try {
        questions = JSON.parse(text);
      } catch (e) {
        // Try to extract JSON from text
        const match = text.match(/\[.*\]/s);
        if (match) {
          questions = JSON.parse(match[0]);
        } else {
          throw new Error('Failed to parse questions from AI response.');
        }
      }
      res.json({ questions, source: 'openai' });
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError.message);
      // Fall back to mock questions if OpenAI fails
      const mockQuestions = generateMockQuestions(topic, difficulty, numQuestions, questionTypes);
      res.json({ 
        questions: mockQuestions,
        source: 'fallback',
        reason: 'openai_error'
      });
    }
  } catch (err) {
    console.error('Quiz generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate quiz questions.' });
  }
});

module.exports = router;
