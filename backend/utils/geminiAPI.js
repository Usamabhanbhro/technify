const { GoogleGenerativeAI } = require('@google/generative-ai');

// Validate API key
if (!process.env.GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is not set in .env file');
  throw new Error('GEMINI_API_KEY environment variable is required');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fallback mock questions for testing
const generateMockQuestions = (subject, numQuestions, difficulty) => {
  console.log('⚠️  Using mock questions (Gemini API unavailable). For production, set a valid GEMINI_API_KEY');
  
  const mockQuestions = {
    Mathematics: [
      {
        question: 'What is the square root of 144?',
        options: ['10', '12', '14', '16'],
        correctAnswer: '12',
      },
      {
        question: 'What is 15% of 200?',
        options: ['20', '25', '30', '35'],
        correctAnswer: '30',
      },
      {
        question: 'Solve: 2x + 5 = 13',
        options: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
        correctAnswer: 'x = 4',
      },
    ],
    Science: [
      {
        question: 'What is the chemical symbol for Gold?',
        options: ['Go', 'Gd', 'Au', 'Ag'],
        correctAnswer: 'Au',
      },
      {
        question: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        correctAnswer: 'Mars',
      },
      {
        question: 'What is the speed of light?',
        options: ['3 × 10^7 m/s', '3 × 10^8 m/s', '3 × 10^9 m/s', '3 × 10^10 m/s'],
        correctAnswer: '3 × 10^8 m/s',
      },
    ],
    History: [
      {
        question: 'In which year did World War II end?',
        options: ['1943', '1944', '1945', '1946'],
        correctAnswer: '1945',
      },
      {
        question: 'Who was the first President of the United States?',
        options: ['Thomas Jefferson', 'George Washington', 'Abraham Lincoln', 'John Adams'],
        correctAnswer: 'George Washington',
      },
      {
        question: 'What ancient wonder is located in Egypt?',
        options: ['Colossus of Rhodes', 'Great Pyramid of Giza', 'Hanging Gardens', 'Statue of Zeus'],
        correctAnswer: 'Great Pyramid of Giza',
      },
    ],
    English: [
      {
        question: 'Which of these is a noun?',
        options: ['Run', 'Beautiful', 'Chair', 'Quickly'],
        correctAnswer: 'Chair',
      },
      {
        question: 'What is the past tense of "go"?',
        options: ['Goed', 'Gone', 'Went', 'Goin'],
        correctAnswer: 'Went',
      },
      {
        question: 'Who wrote "Romeo and Juliet"?',
        options: ['Christopher Marlowe', 'William Shakespeare', 'Ben Jonson', 'John Milton'],
        correctAnswer: 'William Shakespeare',
      },
    ],
  };

  const subjectQuestions = mockQuestions[subject] || mockQuestions.Mathematics;
  const selected = [];
  
  for (let i = 0; i < numQuestions; i++) {
    selected.push(subjectQuestions[i % subjectQuestions.length]);
  }
  
  return selected;
};

const generateQuizQuestionsWithAI = async (subject, numQuestions, difficulty) => {
  try {
    // Try different model names in order of preference
    let model;
    const modelNames = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro', 'gemini-1.5-sonnet'];
    
    for (const modelName of modelNames) {
      try {
        model = genAI.getGenerativeModel({ model: modelName });
        console.log(`✅ Using model: ${modelName}`);
        break;
      } catch (err) {
        console.log(`Model ${modelName} not available, trying next...`);
        continue;
      }
    }

    if (!model) {
      throw new Error('No suitable Gemini model available.');
    }

    const difficultyLevel = {
      Easy: 'beginner level',
      Medium: 'intermediate level',
      Hard: 'advanced level',
    };

    const prompt = `Generate ${numQuestions} multiple choice questions for the subject "${subject}" at a ${difficultyLevel[difficulty]} difficulty.

    IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no explanations.
    
    Format each question exactly like this:
    {
      "question": "What is the capital of France?",
      "options": ["A. London", "B. Paris", "C. Berlin", "D. Madrid"],
      "correctAnswer": "B. Paris"
    }

    Return as a JSON array with ${numQuestions} question objects. No markdown code blocks, just pure JSON.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Remove markdown code blocks if present
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.substring(7);
    }
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.substring(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    }
    cleanedText = cleanedText.trim();

    const questions = JSON.parse(cleanedText);

    // Validate and format questions
    const formattedQuestions = questions.map((q) => ({
      question: q.question,
      options: Array.isArray(q.options)
        ? q.options.map((opt) => (typeof opt === 'string' ? opt : opt.toString()))
        : [q.options],
      correctAnswer: q.correctAnswer,
    }));

    return formattedQuestions;
  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('404')) {
      console.error('🔑 Model not found. API key may be invalid.');
    } else if (error.message.includes('401') || error.message.includes('UNAUTHENTICATED')) {
      console.error('🔑 API authentication failed. Check your GEMINI_API_KEY in .env');
    } else if (error.message.includes('429')) {
      console.error('⏱️ Rate limit exceeded. Wait a moment and try again.');
    }
    
    console.log('\n🔄 Falling back to mock questions for testing...');
    console.log('⚠️  To use real AI questions, update your GEMINI_API_KEY in .env');
    console.log('📌 Get key from: https://aistudio.google.com/app/apikey\n');
    
    // Use fallback mock questions instead of failing
    return generateMockQuestions(subject, numQuestions, difficulty);
  }
};

module.exports = {
  generateQuizQuestionsWithAI,
};
