import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StudentHeader from '../components/StudentHeader';
import StudentFooter from '../components/StudentFooter';
import QuizReviewModal from '../components/QuizReviewModal';
import AnimatedStarsBackground from '../components/AnimatedStarsBackground';
import styles from './StudentSmartQuiz.module.css';
import { FaRedo, FaCheckCircle, FaTimesCircle, FaBrain, FaClock, FaArrowRight, FaLightbulb, FaTrophy } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getToken as getAuthToken } from '../utils/auth';

// --- Enhanced dummy questions (now 35+ diverse questions for demo) ---
const dummyQuestions = [
  { type: 'mcq', question: 'What does JSX stand for?', options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript XHR'], answer: 0, difficulty: 'Easy', explanation: 'JSX stands for JavaScript XML.' },
  { type: 'mcq', question: 'Which hook is used to manage state in a functional React component?', options: ['useState', 'useEffect', 'useRef', 'useContext'], answer: 0, difficulty: 'Easy', explanation: 'useState is the hook for state management.' },
  { type: 'mcq', question: 'Which method is used to render React content to the DOM?', options: ['ReactDOM.render()', 'React.render()', 'renderDOM()', 'DOMReact()'], answer: 0, difficulty: 'Easy', explanation: 'ReactDOM.render() is used to render content.' },
  { type: 'mcq', question: 'How do you pass data from parent to child in React?', options: ['Props', 'State', 'Context', 'Refs'], answer: 0, difficulty: 'Easy', explanation: 'Props are used to pass data from parent to child.' },
  { type: 'mcq', question: 'Which hook is used for side effects?', options: ['useEffect', 'useState', 'useReducer', 'useMemo'], answer: 0, difficulty: 'Easy', explanation: 'useEffect is for side effects.' },
  { type: 'tf', question: 'React is a backend framework.', answer: false, difficulty: 'Easy', explanation: 'React is a frontend library.' },
  { type: 'tf', question: 'useEffect runs after every render by default.', answer: true, difficulty: 'Medium', explanation: 'By default, useEffect runs after every render.' },
  { type: 'tf', question: 'Keys help React identify which items have changed.', answer: true, difficulty: 'Easy', explanation: 'Keys are important for efficient list rendering.' },
  { type: 'fill', question: 'Fill in the blank: The virtual ______ in React improves performance.', answer: 'DOM', difficulty: 'Medium', explanation: 'The virtual DOM improves performance.' },
  { type: 'fill', question: 'Fill in the blank: useState returns a stateful value and a ______ function.', answer: 'setter', difficulty: 'Medium', explanation: 'useState returns a value and a setter.' },
  { type: 'short', question: 'Describe what a React component is.', answer: 'A reusable piece of UI defined by a function or class.', difficulty: 'Easy', explanation: 'A component is a reusable UI building block.' },
  { type: 'short', question: 'What is the main purpose of React Router?', answer: 'To enable navigation between views or pages in a React app.', difficulty: 'Medium', explanation: 'React Router enables navigation.' },
  { type: 'mcq', question: 'Which of these is NOT a React lifecycle method?', options: ['componentDidMount', 'componentWillUnmount', 'componentDidUpdate', 'componentWillCreate'], answer: 3, difficulty: 'Medium', explanation: 'componentWillCreate does not exist.' },
  { type: 'mcq', question: 'Which hook returns a mutable ref object?', options: ['useRef', 'useState', 'useMemo', 'useCallback'], answer: 0, difficulty: 'Medium', explanation: 'useRef returns a mutable ref.' },
  { type: 'mcq', question: 'Which company maintains React?', options: ['Google', 'Facebook', 'Microsoft', 'Amazon'], answer: 1, difficulty: 'Easy', explanation: 'Facebook (now Meta) maintains React.' },
  { type: 'mcq', question: 'How do you optimize expensive calculations in React?', options: ['useMemo', 'useEffect', 'useCallback', 'useReducer'], answer: 0, difficulty: 'Medium', explanation: 'useMemo optimizes expensive calculations.' },
  { type: 'tf', question: 'React supports two-way data binding by default.', answer: false, difficulty: 'Medium', explanation: 'React uses one-way data binding.' },
  { type: 'tf', question: 'useReducer is an alternative to useState.', answer: true, difficulty: 'Medium', explanation: 'useReducer can be used instead of useState.' },
  { type: 'fill', question: 'Fill in the blank: ______ is used to style React components.', answer: 'CSS', difficulty: 'Easy', explanation: 'CSS is used for styling.' },
  { type: 'fill', question: 'Fill in the blank: React apps are built using ______ and JSX.', answer: 'JavaScript', difficulty: 'Easy', explanation: 'React apps are built using JavaScript and JSX.' },
  { type: 'short', question: 'How do you lift state up in React?', answer: 'By moving the state to a common ancestor component.', difficulty: 'Medium', explanation: 'Lift state up by moving it to a parent.' },
  { type: 'short', question: 'What is a controlled component?', answer: 'A component whose value is controlled by React state.', difficulty: 'Medium', explanation: 'Controlled components have their value controlled by state.' },
  { type: 'mcq', question: 'Which hook should you use to memoize a callback?', options: ['useCallback', 'useMemo', 'useEffect', 'useRef'], answer: 0, difficulty: 'Medium', explanation: 'useCallback memoizes callbacks.' },
  { type: 'mcq', question: 'Which file extension is commonly used for React components?', options: ['.jsx', '.js', '.tsx', 'All of the above'], answer: 3, difficulty: 'Easy', explanation: 'All of these extensions can be used.' },
  { type: 'mcq', question: 'Which prop is required to uniquely identify items in a list?', options: ['key', 'id', 'name', 'value'], answer: 0, difficulty: 'Easy', explanation: 'The key prop uniquely identifies list items.' },
  // --- Additional questions for more than 30 ---
  { type: 'mcq', question: 'Which React hook lets you perform side effects?', options: ['useEffect', 'useState', 'useRef', 'useMemo'], answer: 0, difficulty: 'Easy', explanation: 'useEffect is for side effects.' },
  { type: 'mcq', question: 'Which hook is used to access context in a component?', options: ['useContext', 'useState', 'useReducer', 'useRef'], answer: 0, difficulty: 'Medium', explanation: 'useContext accesses context.' },
  { type: 'mcq', question: 'What is the default port for Create React App?', options: ['3000', '8000', '5000', '8080'], answer: 0, difficulty: 'Easy', explanation: 'Port 3000 is default.' },
  { type: 'mcq', question: 'Which of these is a valid way to create a React component?', options: ['Function', 'Class', 'Arrow Function', 'All of the above'], answer: 3, difficulty: 'Easy', explanation: 'All are valid.' },
  { type: 'tf', question: 'React can only be used with JavaScript.', answer: false, difficulty: 'Medium', explanation: 'React can be used with TypeScript too.' },
  { type: 'tf', question: 'useLayoutEffect fires synchronously after all DOM mutations.', answer: true, difficulty: 'Hard', explanation: 'useLayoutEffect runs synchronously.' },
  { type: 'fill', question: 'Fill in the blank: ______ is used to create portals in React.', answer: 'ReactDOM.createPortal', difficulty: 'Hard', explanation: 'ReactDOM.createPortal is used for portals.' },
  { type: 'fill', question: 'Fill in the blank: The ______ prop in React is used for conditional rendering.', answer: 'children', difficulty: 'Medium', explanation: 'children prop can be used for conditional rendering.' },
  { type: 'short', question: 'What is the difference between state and props?', answer: 'State is managed within the component, props are passed from parent.', difficulty: 'Medium', explanation: 'State is local, props are external.' },
  { type: 'short', question: 'How do you handle forms in React?', answer: 'Using controlled components and state.', difficulty: 'Medium', explanation: 'Use controlled components.' },
  { type: 'mcq', question: 'Which hook is best for memoizing expensive calculations?', options: ['useMemo', 'useEffect', 'useReducer', 'useCallback'], answer: 0, difficulty: 'Medium', explanation: 'useMemo memoizes calculations.' },
  { type: 'mcq', question: 'What is the parent element for rendering a React app?', options: ['root', 'app', 'main', 'container'], answer: 0, difficulty: 'Easy', explanation: 'root is the default.' },
  { type: 'mcq', question: 'Which React method is used to update state in a class component?', options: ['setState', 'updateState', 'changeState', 'modifyState'], answer: 0, difficulty: 'Medium', explanation: 'setState is used.' },
  { type: 'tf', question: 'React supports fragments using <> and </>.', answer: true, difficulty: 'Easy', explanation: 'Fragments can be written as <> </>.' },
  { type: 'tf', question: 'useRef can be used to persist values between renders.', answer: true, difficulty: 'Medium', explanation: 'useRef persists values.' },
  { type: 'fill', question: 'Fill in the blank: ______ is used to navigate programmatically in React Router.', answer: 'useNavigate', difficulty: 'Medium', explanation: 'useNavigate is for navigation.' },
  { type: 'fill', question: 'Fill in the blank: ______ is used to describe how a UI should look.', answer: 'JSX', difficulty: 'Easy', explanation: 'JSX describes UI.' },
  { type: 'short', question: 'What is a React key and why is it important?', answer: 'A unique identifier for list items, helps React optimize rendering.', difficulty: 'Medium', explanation: 'Keys help React track items.' },
  { type: 'short', question: 'How do you prevent re-renders in a React component?', answer: 'Use React.memo or useMemo/useCallback.', difficulty: 'Hard', explanation: 'Memoization prevents unnecessary re-renders.' },
];

// Fisher-Yates shuffle algorithm
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Component for 3D card animations
const CardAnimation = ({ children, delay = 0, onClick = null }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: 5 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      exit={{ opacity: 0, y: -20, rotateX: -5 }}
      transition={{ 
        duration: 0.6, 
        delay, 
        type: "spring", 
        stiffness: 80 
      }}
      onClick={onClick}
      className={styles['quiz-card-3d']}
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(67, 206, 162, 0.25)' }}
    >
      {children}
    </motion.div>
  );
};

export default function StudentSmartQuiz() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth('student');
  const quizContainerRef = useRef(null);

  // --- State ---
  const [difficulty, setDifficulty] = useState('All');
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [shortAnswer, setShortAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [timer, setTimer] = useState(20); // seconds per question
  const [reviewMode, setReviewMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [intervalId, setIntervalId] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState('');
  const [topic, setTopic] = useState('React');
  const [numQuestions, setNumQuestions] = useState(10);
  const [useAI, setUseAI] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [animateScore, setAnimateScore] = useState(false);
  const [aiSuccess, setAiSuccess] = useState('');

  // Scroll to top when quiz starts
  useEffect(() => {
    if (quizStarted) {
      window.scrollTo(0, 0);
      if (quizContainerRef.current) {
        quizContainerRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [quizStarted]);

  // --- Prepare quiz on start ---
  function startQuiz() {
    const selectedQuestions = dummyQuestions.filter(q => difficulty === 'All' || q.difficulty === difficulty);
    const shuffled = shuffleArray(selectedQuestions).slice(0, numQuestions);
    setPendingQuestions(shuffled);
    setShowReview(true);
    setQuizStarted(true);
    setQuestions(shuffled);
    setCurrent(0);
    setSelected(null);
    setShortAnswer('');
    setShowFeedback(false);
    setScore(0);
    setCompleted(false);
    setReviewMode(false);
    setUserAnswers([]);
    setTimer(20);
  }

  async function fetchAIQuestions() {
    setLoadingAI(true);
    setAiError('');
    setAiSuccess('');
    
    try {
      // First show a loading message
      setAiSuccess('Generating personalized questions based on your topic...');
      
      // Get authentication token
      const token = getAuthToken();
      if (!token) {
        setAiError('Authentication required. Please login first to use AI features.');
        setLoadingAI(false);
        return;
      }
      
      // For demo purposes, generate mock AI questions locally in development
      // This will allow the feature to work even without a functioning backend
      if (process.env.NODE_ENV === 'development' || !process.env.REACT_APP_USE_REAL_API) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate appropriate questions based on the topic
        const generatedQuestions = generateMockQuestions(topic, difficulty, numQuestions);
        
        setPendingQuestions(generatedQuestions);
        setShowReview(true);
        setQuizStarted(true);
        setAiSuccess(`Successfully generated ${generatedQuestions.length} questions about ${topic}!`);
        
        // Initialize state for the quiz
        setQuestions(generatedQuestions);
        setCurrent(0);
        setSelected(null);
        setShortAnswer('');
        setShowFeedback(false);
        setScore(0);
        setCompleted(false);
        setReviewMode(false);
        setUserAnswers([]);
        setTimer(20);
        setLoadingAI(false);
        return;
      }
      
      // If we're using the real API
      try {
        // Make API request to generate questions
        const res = await axios.post(
          '/api/quiz/generate',
          {
            topic,
            difficulty,
            numQuestions,
            questionTypes: ['mcq', 'tf', 'fill', 'short']
          },
          { 
            headers: { Authorization: `Bearer ${token}` },
            timeout: 30000 // 30 second timeout
          }
        );
        
        // Check response validity
        if (!res.data || !Array.isArray(res.data.questions) || res.data.questions.length === 0) {
          setAiError('No questions returned from AI. Please try again with a different topic.');
          setPendingQuestions([]);
          setShowReview(false);
          setLoadingAI(false);
          setAiSuccess('');
          return;
        }
        
        // Process received questions
        const generatedQuestions = res.data.questions.map(q => ({
          ...q,
          // Ensure all question properties are properly formatted
          type: q.type || 'mcq',
          difficulty: q.difficulty || difficulty || 'Medium',
          options: q.options || [],
          answer: q.answer !== undefined ? q.answer : (q.type === 'tf' ? false : 0),
          explanation: q.explanation || `Answer: ${q.type === 'tf' ? (q.answer ? 'True' : 'False') : q.answer}`
        }));
        
        setPendingQuestions(generatedQuestions);
        setShowReview(true);
        setQuizStarted(true);
        setAiSuccess(`Successfully generated ${generatedQuestions.length} questions about ${topic}!`);
        
        // Initialize state for the quiz
        setQuestions(generatedQuestions);
        setCurrent(0);
        setSelected(null);
        setShortAnswer('');
        setShowFeedback(false);
        setScore(0);
        setCompleted(false);
        setReviewMode(false);
        setUserAnswers([]);
        setTimer(20);
      } catch (apiError) {
        console.error('API error generating questions:', apiError);
        
        // Handle authentication errors
        if (apiError.response?.status === 401) {
          setAiError('Your session has expired. Please login again to use AI features.');
          // Optionally refresh token or redirect to login
          try {
            // Clear any invalid tokens
            localStorage.removeItem('lms_token');
            sessionStorage.removeItem('lms_token');
          } catch (e) {
            console.error('Error clearing tokens:', e);
          }
        } else {
          setAiError(apiError.response?.data?.error || 'Failed to connect to AI service. Using built-in questions instead.');
          
          // Fall back to mock questions if API fails
          const fallbackQuestions = generateMockQuestions(topic, difficulty, numQuestions);
          setPendingQuestions(fallbackQuestions);
          setShowReview(true);
          setQuizStarted(true);
          setAiSuccess(`Using built-in questions about ${topic} (API unavailable)`);
          
          // Initialize state for the quiz
          setQuestions(fallbackQuestions);
          setCurrent(0);
          setSelected(null);
          setShortAnswer('');
          setShowFeedback(false);
          setScore(0);
          setCompleted(false);
          setReviewMode(false);
          setUserAnswers([]);
          setTimer(20);
        }
      }
    } catch (err) {
      console.error('General error generating questions:', err);
      setAiError('An unexpected error occurred. Using built-in questions instead.');
      
      // Fall back to local questions
      const fallbackQuestions = generateMockQuestions(topic, difficulty, numQuestions);
      setPendingQuestions(fallbackQuestions);
      setShowReview(true);
      setQuizStarted(true);
      setAiSuccess(`Using built-in questions about ${topic}`);
      
      // Initialize state for the quiz
      setQuestions(fallbackQuestions);
      setCurrent(0);
      setSelected(null);
      setShortAnswer('');
      setShowFeedback(false);
      setScore(0);
      setCompleted(false);
      setReviewMode(false);
      setUserAnswers([]);
      setTimer(20);
    }
    
    setLoadingAI(false);
  }

  // Function to generate mock AI questions based on topic
  function generateMockQuestions(topic, difficulty, count) {
    // Start with a base set of questions depending on the topic
    let baseQuestions = [];
    
    // Convert topic to lowercase for easier matching
    const lowerTopic = topic.toLowerCase();
    
    // Select questions from our dummy bank that match the topic, or generate new ones
    if (lowerTopic.includes('react') || lowerTopic.includes('javascript') || lowerTopic.includes('js')) {
      // Filter react-related questions from our dummy bank
      baseQuestions = dummyQuestions.filter(q => 
        q.question.toLowerCase().includes('react') || 
        q.question.toLowerCase().includes('component') ||
        q.question.toLowerCase().includes('jsx') ||
        q.question.toLowerCase().includes('hook')
      );
    } else if (lowerTopic.includes('python') || lowerTopic.includes('programming')) {
      // Generate some python questions
      baseQuestions = [
        { type: 'mcq', question: 'What is the correct way to create a function in Python?', options: ['def myFunc():', 'function myFunc():', 'create myFunc():', 'func myFunc():'], answer: 0, difficulty: 'Easy', explanation: 'In Python, functions are defined using the def keyword.' },
        { type: 'mcq', question: 'Which of these is not a Python data type?', options: ['List', 'Dictionary', 'Tuple', 'Array'], answer: 3, difficulty: 'Medium', explanation: 'Array is not a native Python data type - Python uses Lists instead.' },
        { type: 'tf', question: 'Python is a strongly typed language.', answer: true, difficulty: 'Medium', explanation: 'Python is strongly typed, meaning you cannot combine different types arbitrarily.' },
        { type: 'tf', question: 'In Python, indentation is optional.', answer: false, difficulty: 'Easy', explanation: 'Indentation is required in Python and determines code blocks.' },
        { type: 'fill', question: 'The ____ function in Python converts a string to an integer.', answer: 'int', difficulty: 'Easy', explanation: 'int() converts string to integer.' },
        { type: 'short', question: 'Explain the difference between a list and a tuple in Python.', answer: 'Lists are mutable, tuples are immutable', difficulty: 'Medium', explanation: 'Lists can be changed after creation, tuples cannot.' }
      ];
    } else if (lowerTopic.includes('history') || lowerTopic.includes('world')) {
      // Generate history questions
      baseQuestions = [
        { type: 'mcq', question: 'When did World War II end?', options: ['1943', '1945', '1947', '1950'], answer: 1, difficulty: 'Easy', explanation: 'World War II ended in 1945.' },
        { type: 'mcq', question: 'Who was the first president of the United States?', options: ['Thomas Jefferson', 'George Washington', 'Abraham Lincoln', 'John Adams'], answer: 1, difficulty: 'Easy', explanation: 'George Washington was the first president.' },
        { type: 'tf', question: 'The Roman Empire fell in 476 CE.', answer: true, difficulty: 'Medium', explanation: 'The Western Roman Empire fell in 476 CE.' },
        { type: 'fill', question: 'The ____ Revolution began in France in 1789.', answer: 'French', difficulty: 'Easy', explanation: 'The French Revolution began in 1789.' }
      ];
    } else {
      // For any other topic, generate generic questions
      baseQuestions = [
        { type: 'mcq', question: `What is a key concept in ${topic}?`, options: ['Analysis', 'Synthesis', 'Critical thinking', 'All of the above'], answer: 3, difficulty: 'Medium', explanation: 'All of these are important in most fields of study.' },
        { type: 'tf', question: `${topic} requires specialized knowledge to master.`, answer: true, difficulty: 'Easy', explanation: 'Most subjects require specialized knowledge.' },
        { type: 'fill', question: `In ${topic}, the process of learning requires ______.`, answer: 'practice', difficulty: 'Medium', explanation: 'Practice is essential for mastery in any field.' },
        { type: 'short', question: `Describe one major advancement in the field of ${topic} in recent years.`, answer: 'This requires domain knowledge', difficulty: 'Hard', explanation: 'This is a subjective question that would require expert assessment.' }
      ];
      
      // Add some dummy questions from our larger bank too
      baseQuestions = [...baseQuestions, ...dummyQuestions.slice(0, 15)];
    }
    
    // Filter by difficulty if not "All"
    if (difficulty !== 'All') {
      baseQuestions = baseQuestions.filter(q => q.difficulty === difficulty);
    }
    
    // If we don't have enough questions, generate more generic ones
    while (baseQuestions.length < count * 2) {
      baseQuestions.push({
        type: ['mcq', 'tf', 'fill', 'short'][Math.floor(Math.random() * 4)],
        question: `Question about ${topic} #${baseQuestions.length + 1}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: Math.floor(Math.random() * 4),
        difficulty: difficulty === 'All' ? ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)] : difficulty,
        explanation: `This would be an explanation about ${topic}`
      });
    }
    
    // Shuffle and limit to requested count
    return shuffleArray(baseQuestions).slice(0, count);
  }

  function handleApprove(questions) {
    setQuestions(questions);
    setQuizStarted(true);
    setCompleted(false);
    setShowFeedback(false);
    setSelected(null);
    setShortAnswer('');
    setUserAnswers([]);
    setReviewMode(false);
    setTimer(20);
    setShowReview(false);
  }

  function handleReviewEdit(updated) {
    setPendingQuestions(updated);
  }

  function handleReviewCancel() {
    setShowReview(false);
    setPendingQuestions([]);
  }

  // --- Timer logic ---
  useEffect(() => {
    if (!quizStarted || completed || reviewMode) return;
    if (timer === 0) {
      handleAutoSubmit();
      return;
    }
    const id = setTimeout(() => setTimer(timer - 1), 1000);
    setIntervalId(id);
    return () => clearTimeout(id);
  }, [timer, quizStarted, completed, reviewMode]);

  function handleAutoSubmit() {
    handleAnswer(null, true);
  }

  // --- Handle answer ---
  function handleAnswer(ans, auto = false) {
    if (showFeedback) return;
    
    let isCorrect = false;
    let correctAnswer;
    const q = questions[current];
    
    // Different handling based on question type
    if (q.type === 'mcq') {
      correctAnswer = q.options[q.answer] || q.answer;
      isCorrect = ans === q.answer || ans === correctAnswer;
    } else if (q.type === 'tf') {
      correctAnswer = q.answer;
      isCorrect = ans === q.answer;
    } else if (q.type === 'fill') {
      correctAnswer = q.answer;
      // Case-insensitive match for fill-in-the-blank
      isCorrect = (ans || '').trim().toLowerCase() === q.answer.trim().toLowerCase();
    } else if (q.type === 'short') {
      correctAnswer = q.answer;
      // For short answers, we consider non-empty answers as "correct" since they require manual grading
      isCorrect = (ans || '').trim().length > 0;
    }
    
    // Update state with feedback
    setShowFeedback(true);
    setSelected(ans);
    setUserAnswers(prev => [...prev, { 
      ans, 
      correct: isCorrect, 
      correctAnswer, 
      question: q,
      isAuto: auto
    }]);
    
    // Increment score if correct
    if (isCorrect) setScore(s => s + 1);
    
    // Clear timer
    if (intervalId) clearTimeout(intervalId);
    
    // Move to next question after delay
    setTimeout(() => {
      nextQuestion();
    }, 1800);
  }

  // --- Next question ---
  function nextQuestion() {
    setShowFeedback(false);
    setSelected(null);
    setShortAnswer('');
    setTimer(20);
    
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      setCompleted(true);
      setQuizStarted(false);
      setAnimateScore(true);
    }
  }

  // --- Progress bar ---
  const progress = quizStarted && questions.length ? ((current + (showFeedback ? 1 : 0)) / questions.length) * 100 : 0;

  // --- Review Mode ---
  function handleReview() {
    setReviewMode(true);
  }
  
  function handleRetry() {
    setQuizStarted(false);
    setCompleted(false);
    setReviewMode(false);
    setUserAnswers([]);
    setCurrent(0);
    setScore(0);
    setTimer(20);
    setAnimateScore(false);
  }

  // Render Setup UI
  const renderSetup = () => {
    return (
      <div className={styles['quiz-form-container']}>
        <motion.h1 
          className={styles['quiz-title']}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Smart Quiz Generator
        </motion.h1>
      
        <motion.div 
          className={styles['quiz-toggle-container']}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className={styles['quiz-toggle-label']}>
            <FaBrain style={{ marginRight: '10px', color: '#43cea2' }} />
            Use AI to generate quiz
          </div>
          <label className={styles['quiz-toggle']}>
            <input 
              type="checkbox" 
              checked={useAI} 
              onChange={e => setUseAI(e.target.checked)}
            />
            <span className={styles['quiz-toggle-slider']}></span>
          </label>
        </motion.div>
        
        {useAI ? (
          <CardAnimation delay={0.3}>
            <h2 className={styles['quiz-question']}>
              <FaLightbulb style={{ marginRight: '10px', color: '#43cea2' }} />
              Generate AI Quiz
            </h2>
            
            <form
              onSubmit={e => {
                e.preventDefault();
                fetchAIQuestions();
              }}
              style={{ width: '100%' }}
            >
              <label className={styles['quiz-form-label']}>Topic</label>
              <input
                className={styles['quiz-form-input']}
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g., React, Python, Machine Learning"
                required
              />
              
              <label className={styles['quiz-form-label']}>Difficulty</label>
              <select
                className={styles['quiz-form-select']}
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              
              <label className={styles['quiz-form-label']}>Number of Questions</label>
              <input
                className={styles['quiz-form-input']}
                type="number"
                value={numQuestions}
                onChange={e => setNumQuestions(Number(e.target.value))}
                min={1}
                max={20}
                required
                style={{ 
                  fontWeight: '600', 
                  fontSize: '1.1rem',
                  color: '#000',
                  textAlign: 'center'
                }}
              />
              
              <button
                type="submit"
                className={styles['quiz-btn']}
                disabled={loadingAI}
              >
                {loadingAI ? 'Generating...' : 'Generate Quiz'}
              </button>
              
              {aiError && <div className={styles['quiz-error']}>{aiError}</div>}
              {aiSuccess && <div className={styles['quiz-success']}>{aiSuccess}</div>}
            </form>
          </CardAnimation>
        ) : (
          <CardAnimation delay={0.3}>
            <h2 className={styles['quiz-question']}>Quiz Setup</h2>
            
            <div className={styles['quiz-difficulty']}>
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`${styles['quiz-diff-btn']} ${difficulty === 'All' ? styles.selected : ''}`}
                onClick={() => setDifficulty('All')}
              >
                All Levels
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`${styles['quiz-diff-btn']} ${difficulty === 'Easy' ? styles.selected : ''}`}
                onClick={() => setDifficulty('Easy')}
              >
                Easy
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`${styles['quiz-diff-btn']} ${difficulty === 'Medium' ? styles.selected : ''}`}
                onClick={() => setDifficulty('Medium')}
              >
                Medium
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`${styles['quiz-diff-btn']} ${difficulty === 'Hard' ? styles.selected : ''}`}
                onClick={() => setDifficulty('Hard')}
              >
                Hard
              </motion.button>
            </div>
            
            <label className={styles['quiz-form-label']}>Number of Questions</label>
            <input
              className={styles['quiz-form-input']}
              type="number"
              value={numQuestions}
              onChange={e => setNumQuestions(Number(e.target.value))}
              min={1}
              max={20}
              required
              style={{ 
                fontWeight: '600', 
                fontSize: '1.1rem',
                color: '#000',
                textAlign: 'center'
              }}
            />
            
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={styles['quiz-btn']}
              onClick={startQuiz}
            >
              Start Quiz
            </motion.button>
          </CardAnimation>
        )}
        
        {/* Button to show all dummy questions (for demo purposes) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ marginTop: '20px', textAlign: 'center' }}
        >
          <button
            className={styles['quiz-btn-secondary']}
            onClick={() => setShowAllQuestions(q => !q)}
            style={{ 
              background: showAllQuestions ? 'rgba(255, 91, 91, 0.3)' : 'rgba(255, 255, 255, 0.15)'
            }}
          >
            {showAllQuestions ? 'Hide All Demo Questions' : 'Show All Demo Questions'}
          </button>
        </motion.div>
      </div>
    );
  }

  // Render Question
  const renderQuestion = () => {
    const q = questions[current];
    if (!q) return null;
    
    return (
      <>
        <div className={styles['quiz-progress-container']}>
          <div className={styles['quiz-timer']}>
            <FaClock style={{ marginRight: '8px' }} />
            Time: <span className={timer <= 5 ? styles.warning : ''}>{timer}s</span>
          </div>
          <div className={styles['quiz-progress-bar']}>
            <motion.div 
              className={styles['quiz-progress-inner']} 
              style={{ width: `${progress}%` }}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        
        <CardAnimation>
          <h3 className={styles['quiz-question']}>
            Question {current + 1} of {questions.length}
            <div style={{ 
              fontSize: '0.8rem', 
              opacity: 0.8, 
              marginTop: '5px', 
              textTransform: 'uppercase' 
            }}>
              {q.type === 'mcq' && 'Multiple Choice'}
              {q.type === 'tf' && 'True/False'}
              {q.type === 'fill' && 'Fill in the Blank'}
              {q.type === 'short' && 'Short Answer'}
              {' - '}
              {q.difficulty}
            </div>
          </h3>
          
          <div style={{ fontSize: '1.2rem', marginBottom: '20px', textAlign: 'center', fontWeight: '500' }}>
            {q.question}
          </div>
          
          {/* Multiple Choice Questions */}
          {q.type === 'mcq' && (
            <div className={styles['quiz-options']}>
              {q.options.map((option, idx) => (
                <motion.button
                  key={idx}
                  className={`${styles['quiz-option-3d']} ${selected === idx ? styles.selected : ''}`}
                  onClick={() => !showFeedback && handleAnswer(idx)}
                  disabled={showFeedback}
                  whileHover={!showFeedback ? { scale: 1.03, y: -5 } : {}}
                  whileTap={!showFeedback ? { scale: 0.98 } : {}}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 + 0.2 }}
                >
                  <span>{option}</span>
                </motion.button>
              ))}
            </div>
          )}
          
          {/* True/False Questions */}
          {q.type === 'tf' && (
            <div className={styles['quiz-options']}>
              <motion.button
                className={`${styles['quiz-option-3d']} ${styles['quiz-tf-option']} ${selected === true ? styles.selected : ''}`}
                onClick={() => !showFeedback && handleAnswer(true)}
                disabled={showFeedback}
                whileHover={!showFeedback ? { scale: 1.05, y: -5 } : {}}
                whileTap={!showFeedback ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span>True</span>
              </motion.button>
              <motion.button
                className={`${styles['quiz-option-3d']} ${styles['quiz-tf-option']} ${selected === false ? styles.selected : ''}`}
                onClick={() => !showFeedback && handleAnswer(false)}
                disabled={showFeedback}
                whileHover={!showFeedback ? { scale: 1.05, y: -5 } : {}}
                whileTap={!showFeedback ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span>False</span>
              </motion.button>
            </div>
          )}
          
          {/* Fill in the Blank Questions */}
          {q.type === 'fill' && (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <motion.input
                type="text"
                value={shortAnswer}
                onChange={e => setShortAnswer(e.target.value)}
                placeholder="Type your answer..."
                disabled={showFeedback}
                className={styles['quiz-fill-input']}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              />
              <motion.button
                className={styles['quiz-btn']}
                onClick={() => !showFeedback && handleAnswer(shortAnswer)}
                disabled={showFeedback || !shortAnswer.trim()}
                whileHover={!showFeedback ? { scale: 1.05, y: -5 } : {}}
                whileTap={!showFeedback ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Submit Answer
              </motion.button>
            </div>
          )}
          
          {/* Short Answer Questions */}
          {q.type === 'short' && (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <motion.textarea
                value={shortAnswer}
                onChange={e => setShortAnswer(e.target.value)}
                placeholder="Type your answer..."
                disabled={showFeedback}
                className={styles['quiz-short-input']}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              />
              <motion.button
                className={styles['quiz-btn']}
                onClick={() => !showFeedback && handleAnswer(shortAnswer)}
                disabled={showFeedback || !shortAnswer.trim()}
                whileHover={!showFeedback ? { scale: 1.05, y: -5 } : {}}
                whileTap={!showFeedback ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Submit Answer
              </motion.button>
            </div>
          )}
          
          {/* Answer Feedback */}
          {showFeedback && (
            <motion.div 
              className={`${styles['quiz-feedback']} ${userAnswers[userAnswers.length - 1]?.correct ? styles.correct : styles.incorrect}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {userAnswers[userAnswers.length - 1]?.correct ? (
                <>
                  <FaCheckCircle style={{ marginRight: '8px' }} />
                  Correct!
                </>
              ) : (
                <>
                  <FaTimesCircle style={{ marginRight: '8px' }} />
                  {q.type === 'short' ? 'Answer submitted!' : 'Incorrect!'}
                </>
              )}
              
              {q.explanation && (
                <motion.div 
                  style={{ 
                    fontSize: '0.9rem',
                    opacity: 0.9,
                    marginTop: '10px',
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '10px',
                    color: '#333'
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {q.explanation}
                </motion.div>
              )}
              
              <motion.div
                style={{ marginTop: '15px', fontSize: '0.9rem', color: '#fff' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Next question in a moment...
              </motion.div>
            </motion.div>
          )}
        </CardAnimation>
      </>
    );
  }

  // Render Results
  const renderResults = () => {
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    
    return (
      <motion.div 
        className={styles['quiz-results']}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, type: 'spring', stiffness: 70 }}
      >
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <FaTrophy size={50} color="#43cea2" />
          <h2 className={styles['quiz-score']}>Your Score</h2>
        </motion.div>
        
        <motion.div
          className={styles['quiz-score-percent']}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ 
            scale: animateScore ? [0.8, 1.2, 1] : 1, 
            opacity: 1 
          }}
          transition={{ 
            duration: animateScore ? 0.8 : 0.5, 
            delay: 0.5,
            type: 'spring',
            stiffness: 80
          }}
        >
          {percentage}%
        </motion.div>
        
        <motion.div 
          className={styles['quiz-score-label']}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          You got {score} out of {questions.length} questions correct
        </motion.div>
        
        <div className={styles['quiz-action-btns']}>
          <motion.button 
            className={styles['quiz-btn']}
            onClick={handleReview}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            Review Answers
          </motion.button>
          
          <motion.button 
            className={`${styles['quiz-btn']} ${styles['quiz-btn-secondary']}`}
            onClick={handleRetry}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            Try Again
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // Render Review Mode
  const renderReview = () => {
    return (
      <div className={styles['quiz-review-section']}>
        <motion.div 
          className={styles['quiz-review-modal']}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 style={{ textAlign: 'center', color: '#000', marginBottom: '20px', textShadow: '0 2px 5px rgba(255, 255, 255, 0.3)' }}>
            Review Your Answers
          </h2>
          
          {userAnswers.map((ua, idx) => (
            <motion.div 
              key={idx}
              style={{ 
                marginBottom: '25px', 
                padding: '20px', 
                background: '#fff', 
                borderRadius: '16px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className={styles['quiz-review-q']}>
                Question {idx + 1}: {ua.question.question}
              </div>
              
              <div className={styles['quiz-review-ans']}>
                Your answer: 
                <span className={ua.correct ? styles['quiz-review-correct'] : styles['quiz-review-wrong']}>
                  {ua.question.type === 'mcq' 
                    ? (typeof ua.ans === 'number' ? ua.question.options[ua.ans] : 'No answer') 
                    : ua.question.type === 'tf' 
                      ? (ua.ans === true ? 'True' : ua.ans === false ? 'False' : 'No answer')
                      : ua.ans || 'No answer'}
                </span>
                {ua.isAuto && <span style={{ color: '#ff5b5b', fontSize: '0.8rem', marginLeft: '5px' }}>(Time ran out)</span>}
              </div>
              
              {!ua.correct && ua.question.type !== 'short' && (
                <div className={styles['quiz-review-ans']}>
                  Correct answer: 
                  <span className={styles['quiz-review-correct']}>
                    {ua.correctAnswer === true ? 'True' : ua.correctAnswer === false ? 'False' : ua.correctAnswer}
                  </span>
                </div>
              )}
              
              {ua.question.explanation && (
                <div className={styles['quiz-review-expl']}>
                  {ua.question.explanation}
                </div>
              )}
            </motion.div>
          ))}
          
          <div style={{ textAlign: 'center' }}>
            <motion.button 
              className={styles['quiz-btn']}
              onClick={() => setReviewMode(false)}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Results
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  };

  // Render All Demo Questions (for demo purposes)
  const renderAllDemoQuestions = () => {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        style={{ width: '100%', maxWidth: '800px', margin: '0 auto', marginBottom: '40px' }}
      >
        <h2 style={{ textAlign: 'center', color: '#000', marginBottom: '20px', textShadow: '0 2px 5px rgba(255, 255, 255, 0.3)' }}>
          All Demo Questions ({dummyQuestions.length})
        </h2>
        
        {dummyQuestions.map((q, idx) => (
          <motion.div
            key={idx}
            className={styles['quiz-card-3d']}
            style={{ margin: '15px 0', padding: '20px', textAlign: 'center' }}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
          >
            <h3 style={{ color: '#185a9d', fontWeight: '700', fontSize: '18px', marginBottom: '10px' }}>
              Q{idx + 1} ({q.type.toUpperCase()})
            </h3>
            
            <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '15px' }}>
              {q.question}
            </div>
            
            {q.type === 'mcq' && q.options && (
              <div style={{ marginTop: '10px', marginBottom: '15px' }}>
                <div style={{ fontWeight: '600', marginBottom: '5px', color: '#185a9d' }}>Options:</div>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {q.options.map((opt, i) => (
                    <li 
                      key={i} 
                      style={{ 
                        padding: '8px',
                        margin: '5px 0',
                        background: i === q.answer ? 'rgba(67, 206, 162, 0.1)' : 'transparent',
                        borderRadius: '5px',
                        fontWeight: i === q.answer ? '700' : '400',
                        color: i === q.answer ? '#43cea2' : 'inherit'
                      }}
                    >
                      {i === q.answer && '✓ '}{opt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', marginTop: '10px' }}>
              <div style={{ 
                padding: '5px 12px',
                borderRadius: '20px',
                background: 'rgba(24, 90, 157, 0.1)',
                fontSize: '14px',
                fontWeight: '600',
                color: '#185a9d',
                marginBottom: '10px'
              }}>
                Difficulty: {q.difficulty}
              </div>
              
              <div style={{ 
                padding: '5px 12px',
                borderRadius: '20px',
                background: 'rgba(67, 206, 162, 0.1)',
                fontSize: '14px',
                fontWeight: '600',
                color: '#43cea2',
                marginBottom: '10px'
              }}>
                Answer: {q.type === 'tf' ? (q.answer ? 'True' : 'False') : q.answer}
              </div>
            </div>
            
            {q.explanation && (
              <div style={{ 
                marginTop: '15px',
                padding: '10px',
                background: 'rgba(24, 90, 157, 0.05)',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#666'
              }}>
                {q.explanation}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    );
  };

  // --- Render Quiz Review Questions ---
  const renderQuizReview = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring', stiffness: 80 }}
        style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}
      >
        <h2 style={{ textAlign: 'center', color: '#000', marginBottom: '20px', textShadow: '0 2px 5px rgba(255, 255, 255, 0.3)' }}>
          Review Generated Questions
        </h2>
        
        {pendingQuestions.map((q, idx) => (
          <motion.div
            key={idx}
            className={styles['quiz-card-3d']}
            initial={{ scale: 0.95, rotateY: 10, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            style={{ margin: '20px auto', textAlign: 'center' }}
          >
            <h3 style={{ color: '#185a9d', fontWeight: '700', marginBottom: '10px' }}>
              Q{idx + 1} ({q.type.toUpperCase()})
            </h3>
            
            <div style={{ fontWeight: '600', fontSize: '18px', marginBottom: '15px' }}>
              {q.question}
            </div>
            
            {q.type === 'mcq' && q.options && (
              <div style={{ width: '100%', marginBottom: '15px' }}>
                {q.options.map((opt, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    style={{ 
                      margin: '8px 0',
                      padding: '10px 15px',
                      background: i === q.answer ? 'rgba(67, 206, 162, 0.1)' : 'rgba(24, 90, 157, 0.05)',
                      borderRadius: '8px',
                      fontWeight: i === q.answer ? '700' : '400'
                    }}
                  >
                    {opt} {i === q.answer && '✓'}
                  </motion.div>
                ))}
              </div>
            )}
            
            {(q.type === 'fill' || q.type === 'tf' || q.type === 'short') && (
              <div style={{ marginTop: '10px', marginBottom: '15px', fontWeight: '600' }}>
                Answer: <span style={{ color: '#43cea2' }}>
                  {q.type === 'tf' ? (q.answer ? 'True' : 'False') : q.answer}
                </span>
              </div>
            )}
            
            <div style={{ 
              marginTop: '15px',
              padding: '12px',
              background: 'rgba(24, 90, 157, 0.05)',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#666'
            }}>
              {q.explanation || `Answer: ${q.answer}`}
            </div>
            
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#888' }}>
              Difficulty: <b>{q.difficulty}</b>
            </div>
          </motion.div>
        ))}
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', margin: '30px 0' }}>
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className={styles['quiz-btn']}
            onClick={() => handleApprove(pendingQuestions)}
          >
            <FaArrowRight style={{ marginRight: '8px' }} />
            Start Quiz
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className={`${styles['quiz-btn']} ${styles['quiz-btn-secondary']}`}
            onClick={handleReviewCancel}
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // --- Main Render ---
  return (
    <div className={styles['quiz-root']} ref={quizContainerRef}>
      <StudentHeader showPrevious={true} minimal={false} />
      <AnimatedStarsBackground numStars={80} />
      
      <main className={styles['quiz-main']}>
        {/* Conditional Rendering based on Quiz State */}
        {!quizStarted && !completed && !showReview && renderSetup()}
        {quizStarted && !completed && renderQuestion()}
        {completed && !reviewMode && renderResults()}
        {reviewMode && renderReview()}
        {showReview && renderQuizReview()}
        
        {/* Show all demo questions if toggled */}
        {showAllQuestions && renderAllDemoQuestions()}
      </main>
      
      <StudentFooter />
    </div>
  );
}