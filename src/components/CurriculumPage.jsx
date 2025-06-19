import React, { useState, useEffect, useRef } from 'react';
import GenieImage from '../assets/Genie.png';
import { novelExercises } from '../excercises/novelExercises';
import { translationExercises } from '../excercises/translationExercises';
import { comprehensionExercises } from '../excercises/comprehensionExercises';
import { grammarQuestions, vocabularyQuestions } from '../excercises/mcqExercises';
import GrammarPDFPage from './GrammarPDFPage';

export default function CurriculumPage({ isDarkMode, onExitToWelcome, onAskQuestion }) {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapterText, setChapterText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showExercisesPage, setShowExercisesPage] = useState(false);
  const [exerciseType, setExerciseType] = useState(null);
  const [selectedExerciseChapter, setSelectedExerciseChapter] = useState(null);
  const [selectedExerciseQuestions, setSelectedExerciseQuestions] = useState([]);
  const [selectedComprehension, setSelectedComprehension] = useState(null);
  const [selectedMcqType, setSelectedMcqType] = useState(null); // "grammar" or "vocabulary"
  const [selectedGrammarUnit, setSelectedGrammarUnit] = useState(null);
  const [selectedVocabularyUnit, setSelectedVocabularyUnit] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Translation mode state
  const [selectedTranslationMode, setSelectedTranslationMode] = useState(null);

  // Sidebar chatbot state
  const [sidebarMessages, setSidebarMessages] = useState([
    { text: "Hello! Ask me anything about the curriculum 📚", isUser: false }
  ]);
  const [sidebarInput, setSidebarInput] = useState("");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const sidebarMessagesEndRef = useRef(null);

  const clearChat = () => {
    setSidebarMessages([
      { text: "Hello! Ask me anything about the curriculum 📚", isUser: false }
    ]);
  };

  useEffect(() => {
    if (sidebarMessagesEndRef.current) {
      sidebarMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sidebarMessages]);

  const handleChapterSelect = async (chapterNumber) => {
    setSelectedChapter(chapterNumber);
    setIsLoading(true);
    try {
      const response = await fetch(`/novel/great-expectations-txt/chapter${chapterNumber}.txt`);
      if (!response.ok) throw new Error('Failed to load chapter');
      const text = await response.text();
      setChapterText(text);
    } catch (error) {
      console.error(error);
      setChapterText("⚠️ Sorry, could not load this chapter.");
    }
    setIsLoading(false);
    window.scrollTo(0, 0);
  };

  const handleSidebarSend = () => {
    const trimmedInput = sidebarInput.trim();
    if (!trimmedInput) return;

    setSidebarMessages(prev => [...prev, { text: trimmedInput, isUser: true }]);
    setSidebarInput("");

    setTimeout(() => {
      setSidebarMessages(prev => [
        ...prev,
        { text: `You asked: "${trimmedInput}" — This is a sample reply.`, isUser: false }
      ]);
    }, 1000);
  };

  const handleExerciseQuestionClick = (question) => {
    setSidebarMessages(prev => [...prev, { text: question, isUser: true }]);
    let answer = "I'm sorry, I couldn't find an answer to that question.";
    if (selectedTopic === 'comprehension' && selectedComprehension !== null) {
      const currentExercise = comprehensionExercises[selectedComprehension];
      if (currentExercise && currentExercise.answers) {
        const questionIndex = currentExercise.questions.findIndex(q => q === question);
        if (questionIndex !== -1 && currentExercise.answers[questionIndex]) {
          answer = currentExercise.answers[questionIndex];
        }
      }
    }
    setTimeout(() => {
      setSidebarMessages(prev => [
        ...prev,
        { text: answer, isUser: false }
      ]);
    }, 1000);
  };

  const handleTranslationQuestionClick = (question) => {
    setSidebarInput(question);
    // Optionally, you can also send the question automatically by uncommenting the next line
    // handleSidebarSend(question);
  };

  const handleMCQQuestionClick = (mcq) => {
    const [question, ...options] = mcq.split('\n');
    const formattedQuestion = `${question}\n\n${options.map(opt => opt.trim()).filter(opt => opt).join('\n')}`;
    setSidebarInput(formattedQuestion);
  };

  // Dummy MCQ check handler (implement as needed)
  const handleCheckMCQ = (index, selectedOption) => {
    // Implement your MCQ answer checking logic here
    alert('Check Answer clicked! (implement logic)');
  };

  return (
    <div
      className={`min-h-screen transition-all duration-700 ease-in-out ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white'
          : 'bg-gradient-to-br from-[#e6e0f8] to-[#ffffff] text-[#012060]'
      }`}
    >
      {/* Exercises Page (Novel/Translation) */}
      {showExercisesPage && selectedTopic === 'novel' ? (
        <div className="flex h-screen">
          {/* Main Exercises Content */}
          <div className="flex-1 overflow-auto p-8 pl-[10%] pr-[380px] xl:pr-[420px]">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {!selectedExerciseChapter ? (
                <>
                  <div className="flex flex-col items-center mb-12">
                    <h2 className="text-3xl font-bold text-[#7030a0] mb-4">
                      Exercises 📚
                    </h2>
                    <p className="text-gray-600 text-center">Click any exercise to start practicing</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-12 max-w-5xl mx-auto">
                    {Array.from({ length: 12 }, (_, i) => {
                      const chapterKey = `chapter${i + 1}`;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setSelectedExerciseChapter(chapterKey);
                            setSelectedExerciseQuestions(novelExercises[chapterKey] || []);
                          }}
                          className="group relative overflow-hidden rounded-lg shadow-md transition-all duration-200 h-32 hover:shadow-lg"
                        >
                          <div className="bg-gradient-to-r from-[#7030a0] to-[#a678ff] p-4 h-full flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold">{i + 1}</div>
                            <div className="text-sm font-medium mt-1">Chapter {i + 1}</div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-[#512b81] to-[#7030a0] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        </button>
                      );
                    })}
                    <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 xl:col-span-6 flex justify-center">
                      <button
                        onClick={() => {
                          setSelectedExerciseChapter('general');
                          setSelectedExerciseQuestions(novelExercises['general'] || []);
                        }}
                        className="group relative overflow-hidden rounded-lg shadow-md transition-all duration-200 w-full max-w-xs h-32 hover:shadow-lg"
                      >
                        <div className="bg-gradient-to-r from-[#7030a0] to-[#a678ff] p-4 h-full flex flex-col items-center justify-center">
                          <div className="text-xl font-bold mb-1">General Questions</div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#512b81] to-[#7030a0] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => setShowExercisesPage(false)}
                      className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium shadow hover:shadow-md transition-all w-64 text-center hover:scale-[1.02]"
                    >
                      ← Back to Chapters
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-[#7030a0] mb-8 text-center">
                    {selectedExerciseChapter === 'general'
                      ? 'General Questions'
                      : `Chapter ${selectedExerciseChapter.replace('chapter', '')} Exercises`}
                  </h2>
                  <div className="space-y-4 mb-8 max-w-3xl mx-auto">
                    {selectedExerciseQuestions.map((q, idx) => (
                      <div 
                        key={idx} 
                        className="bg-white p-6 rounded-xl shadow-md cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleExerciseQuestionClick(q)}
                      >
                        <p className="font-medium text-gray-800">{q}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col items-center mt-10 space-y-4">
                    <button
                      onClick={() => {
                        setSelectedExerciseChapter(null);
                        setSelectedExerciseQuestions([]);
                      }}
                      className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-[#7030a0] to-[#a678ff] text-white rounded-lg font-medium shadow hover:shadow-md transition-all w-64 text-center hover:scale-[1.02]"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Back to Exercises
                    </button>
                    <button
                      onClick={() => {
                        setShowExercisesPage(false);
                        setSelectedExerciseChapter(null);
                        setSelectedExerciseQuestions([]);
                      }}
                      className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium shadow hover:shadow-md transition-all w-64 text-center hover:scale-[1.02]"
                    >
                      ← Back to Chapters
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Sidebar Chatbot */}
          <div 
            className={`lg:block fixed right-0 top-0 h-screen bg-white border-t-2 lg:border-t-0 lg:border-l-2 border-[#7030a0] p-4 overflow-y-auto rounded-r-3xl shadow-lg transition-all duration-300 ease-in-out flex flex-col
              ${isSidebarExpanded ? 'w-[600px] xl:w-[700px]' : 'w-[380px] xl:w-[420px]'}
            `}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#7030a0]">Edu-Genie Assistant</h2>
              <button 
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {isSidebarExpanded ? '⇦' : '⇨'}
              </button>
            </div>
            <div className="flex flex-col h-full">
              <div className="flex flex-col items-center mb-2">
                <img src={GenieImage} alt="Genie" className="w-12 h-12 object-contain" />
                <h2 className="text-lg font-bold text-[#7030a0] mt-1">Ask Genie</h2>
              </div>
              <div className="flex-1 overflow-y-auto mb-2 bg-[#f9f9f9] rounded-xl p-2 space-y-1">
                {sidebarMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg max-w-[95%] break-words text-sm ${
                      msg.isUser
                        ? 'bg-[#7030a0] text-white ml-auto'
                        : 'bg-white text-gray-800 mr-auto shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                <div ref={sidebarMessagesEndRef} />
              </div>
              <div className="mt-auto">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type your question..."
                    className="flex-1 rounded-lg p-2 border border-[#7030a0] focus:outline-none focus:ring-1 focus:ring-[#7030a0] text-gray-800 text-sm"
                    value={sidebarInput}
                    onChange={(e) => setSidebarInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSidebarSend()}
                  />
                  <button
                    className="px-3 py-2 bg-[#7030a0] hover:bg-[#512b81] text-white rounded-lg font-semibold transition-all text-sm"
                    onClick={handleSidebarSend}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : showExercisesPage && selectedTopic === 'translation' ? (
        // This block is now unused, as translation is handled below with the new menu
        <></>
      ) : (
        <>
          {/* Main Curriculum Page */}
          {!selectedTopic && (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 w-full max-w-5xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-center text-[#012060] mb-8">English Curriculum</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    onClick={() => setSelectedTopic('novel')}
                    className="border-2 border-[#7030a0] rounded-2xl p-6 hover:scale-[1.02] transition-transform cursor-pointer hover:shadow-md"
                  >
                    <h2 className="text-xl font-bold mb-2 text-[#012060]">Novel Study</h2>
                    <p className="text-gray-600">Analyze and discuss novels.</p>
                  </div>
                  <div
                    onClick={() => setSelectedTopic('translation')}
                    className="border-2 border-[#7030a0] rounded-2xl p-6 hover:scale-[1.02] transition-transform cursor-pointer hover:shadow-md"
                  >
                    <h2 className="text-xl font-bold mb-2 text-[#012060]">Translation</h2>
                    <p className="text-gray-600">Translate texts between languages.</p>
                  </div>
                  <div
                    onClick={() => {
                      setSelectedTopic('comprehension');
                      setSelectedComprehension(null);
                    }}
                    className="border-2 border-[#7030a0] rounded-2xl p-6 hover:scale-[1.02] transition-transform cursor-pointer hover:shadow-md"
                  >
                    <h2 className="text-xl font-bold mb-2 text-[#012060]">Comprehension</h2>
                    <p className="text-gray-600">Practice reading and understanding passages.</p>
                  </div>
                  <div
                    onClick={() => setSelectedTopic('mcq')}
                    className="border-2 border-[#7030a0] rounded-2xl p-6 hover:scale-[1.02] transition-transform cursor-pointer hover:shadow-md"
                  >
                    <h2 className="text-xl font-bold mb-2 text-[#012060]">MCQs</h2>
                    <p className="text-gray-600">Test your knowledge with quizzes.</p>
                  </div>
                </div>
                <div className="flex justify-center mt-10">
                  <button
                    onClick={onExitToWelcome}
                    className="px-6 py-2 bg-[#7030a0] hover:bg-[#512b81] text-white rounded-lg text-base font-semibold transition-all w-64 text-center hover:scale-[1.02]"
                  >
                    ← Exit to Welcome
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Novel Chapters */}
          {selectedTopic === 'novel' && !selectedChapter && (
            <div className="flex h-screen">
              {/* Main Content */}
              <div className="flex-1 overflow-auto py-8 px-4 sm:px-6 lg:px-8 pl-[10%] pr-[380px] xl:pr-[420px]">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-[#7030a0] mb-2">Select a Chapter</h2>
                    <p className="text-gray-600">Click any chapter to read or select exercises</p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8 max-w-5xl mx-auto">
                    {Array.from({ length: 12 }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => handleChapterSelect(i + 1)}
                        className="group relative overflow-hidden rounded-lg shadow-md transition-all duration-200 h-32 hover:shadow-lg"
                      >
                        <div className="bg-gradient-to-r from-[#7030a0] to-[#a678ff] p-4 h-full flex flex-col items-center justify-center">
                          <div className="text-2xl font-bold">{i + 1}</div>
                          <div className="text-sm font-medium mt-1">Chapter {i + 1}</div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#512b81] to-[#7030a0] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col items-center mt-10 space-y-4">
                    <button
                      onClick={() => {
                        setExerciseType('novel');
                        setShowExercisesPage(true);
                      }}
                      className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-[#7030a0] to-[#a678ff] text-white rounded-lg font-medium shadow hover:shadow-md transition-all w-64 text-center hover:scale-[1.02]"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Exercises
                    </button>
                    <button
                      onClick={() => setSelectedTopic(null)}
                      className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium shadow hover:shadow-md transition-all w-64 text-center hover:scale-[1.02]"
                    >
                      ← Back to Curriculum
                    </button>
                  </div>
                </div>
              </div>
              {/* Sidebar Chatbot */}
              <div 
                className={`lg:block fixed right-0 top-0 h-screen bg-white border-t-2 lg:border-t-0 lg:border-l-2 border-[#7030a0] p-4 overflow-y-auto rounded-r-3xl shadow-lg transition-all duration-300 ease-in-out flex flex-col
                  ${isSidebarExpanded ? 'w-[600px] xl:w-[700px]' : 'w-[380px] xl:w-[420px]'}
                `}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[#7030a0]">Edu-Genie Assistant</h2>
                  <button 
                    onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                  >
                    {isSidebarExpanded ? '⇦' : '⇨'}
                  </button>
                </div>
                <div className="flex flex-col h-full">
                  <div className="flex flex-col items-center mb-2">
                    <img src={GenieImage} alt="Genie" className="w-12 h-12 object-contain" />
                    <h2 className="text-lg font-bold text-[#7030a0] mt-1">Ask Genie</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto mb-2 bg-[#f9f9f9] rounded-xl p-2 space-y-1">
                    {sidebarMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg max-w-[95%] break-words text-sm ${
                          msg.isUser
                            ? 'bg-[#7030a0] text-white ml-auto'
                            : 'bg-white text-gray-800 mr-auto shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                    <div ref={sidebarMessagesEndRef} />
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Type your question..."
                        className="flex-1 rounded-lg p-2 border border-[#7030a0] focus:outline-none focus:ring-1 focus:ring-[#7030a0] text-gray-800 text-sm"
                        value={sidebarInput}
                        onChange={(e) => setSidebarInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSidebarSend()}
                      />
                      <button
                        className="px-3 py-2 bg-[#7030a0] hover:bg-[#512b81] text-white rounded-lg font-semibold transition-all text-sm"
                        onClick={handleSidebarSend}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Chapter Text */}
          {selectedTopic === 'novel' && selectedChapter && (
            <div className="flex h-screen">
              {/* Main Content */}
              <div className="flex-1 overflow-auto">
                <div className="container px-4 py-8 max-w-0xl pl-12">
                  <h2 className="text-3xl font-bold mb-6 text-[#7030a0] font-serif">
                    Chapter {selectedChapter}
                  </h2>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7030a0]"></div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center w-full">
                      <div className="bg-white rounded-2xl p-10 shadow-lg w-full max-w-5xl mx-auto">
                        {chapterText.split('\n\n').map((paragraph, index) => (
                          <p
                            key={index}
                            className="mb-6 text-lg md:text-xl lg:text-2xl leading-relaxed text-gray-800 text-justify"
                            style={{ lineHeight: '2.1rem', letterSpacing: '0.01em' }}
                          >
                            {index === 0 && (
                              <span className="float-left text-5xl md:text-7xl font-bold mr-4 -mt-2 text-[#7030a0] leading-none">
                                {paragraph.charAt(0)}
                              </span>
                            )}
                            {index === 0 ? paragraph.substring(1) : paragraph}
                          </p>
                        ))}
                      </div>
                      <div className="flex justify-center gap-4 mt-8 w-full">
                        <button
                          onClick={() => setSelectedChapter(null)}
                          className="px-6 py-2.5 bg-[#7030a0] hover:bg-[#5a2580] text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                          Back to Chapters
                        </button>
                        <button
                          onClick={() => setSelectedTopic(null)}
                          className="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-2 2h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Back to Curriculum
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Sidebar Chatbot */}
              <div 
                className={`lg:block fixed right-0 top-0 h-screen bg-white border-t-2 lg:border-t-0 lg:border-l-2 border-[#7030a0] p-4 overflow-y-auto rounded-r-3xl shadow-lg transition-all duration-300 ease-in-out flex flex-col
                  ${isSidebarExpanded ? 'w-[600px] xl:w-[700px]' : 'w-[380px] xl:w-[420px]'}
                `}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[#7030a0]">Edu-Genie Assistant</h2>
                  <button 
                    onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                  >
                    {isSidebarExpanded ? '⇦' : '⇨'}
                  </button>
                </div>
                <div className="flex flex-col h-full">
                  <div className="flex flex-col items-center mb-2">
                    <img src={GenieImage} alt="Genie" className="w-12 h-12 object-contain" />
                    <h2 className="text-lg font-bold text-[#7030a0] mt-1">Ask Genie</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto mb-2 bg-[#f9f9f9] rounded-xl p-2 space-y-1">
                    {sidebarMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg max-w-[95%] break-words text-sm ${
                          msg.isUser
                            ? 'bg-[#7030a0] text-white ml-auto'
                            : 'bg-white text-gray-800 mr-auto shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                    <div ref={sidebarMessagesEndRef} />
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Type your question..."
                        className="flex-1 rounded-lg p-2 border border-[#7030a0] focus:outline-none focus:ring-1 focus:ring-[#7030a0] text-gray-800 text-sm"
                        value={sidebarInput}
                        onChange={(e) => setSidebarInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSidebarSend()}
                      />
                      <button
                        className="px-3 py-2 bg-[#7030a0] hover:bg-[#512b81] text-white rounded-lg font-semibold transition-all text-sm"
                        onClick={handleSidebarSend}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Translation */}
          {selectedTopic === 'translation' && !selectedTranslationMode && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <h2 className="text-3xl font-bold text-center mb-8 text-[#7030a0]">Choose Translation Type</h2>
              <div className="flex flex-col sm:flex-row gap-6">
                <button
                  onClick={() => setSelectedTranslationMode('englishToArabic')}
                  className="px-6 py-4 bg-gradient-to-r from-[#7030a0] to-[#a678ff] text-white text-xl font-bold rounded-xl shadow-md hover:scale-105 transition-transform"
                >
                  English to Arabic
                </button>
                <button
                  onClick={() => setSelectedTranslationMode('arabicToEnglish')}
                  className="px-6 py-4 bg-gradient-to-r from-[#7030a0] to-[#a678ff] text-white text-xl font-bold rounded-xl shadow-md hover:scale-105 transition-transform"
                >
                  Arabic to English
                </button>
                <button
                  onClick={() => setSelectedTranslationMode('mcq')}
                  className="px-6 py-4 bg-gradient-to-r from-[#7030a0] to-[#a678ff] text-white text-xl font-bold rounded-xl shadow-md hover:scale-105 transition-transform"
                >
                  MCQ Questions
                </button>
              </div>
              <button
                onClick={() => setSelectedTopic(null)}
                className="mt-10 px-6 py-3 bg-[#7030a0] hover:bg-[#512b81] text-white rounded-lg font-semibold"
              >
                ← Back to Curriculum
              </button>
            </div>
          )}
          {/* Translation Questions Display */}
          {selectedTopic === 'translation' && selectedTranslationMode && (
            <div className="flex h-screen">
              {/* Main Content */}
              <div className="flex-1 overflow-auto p-8 pl-[10%] pr-[380px] xl:pr-[420px]">
                <h2 className="text-3xl font-bold text-center mb-8 text-[#7030a0]">
                  {selectedTranslationMode === 'englishToArabic' && 'English to Arabic'}
                  {selectedTranslationMode === 'arabicToEnglish' && 'Arabic to English'}
                  {selectedTranslationMode === 'mcq' && 'Translation MCQ'}
                </h2>
                {/* Questions List */}
                {selectedTranslationMode !== 'mcq' && (
                  <div className="space-y-4 mb-8 max-w-4xl mx-auto">
                    {(selectedTranslationMode === 'englishToArabic'
                      ? translationExercises.englishToArabic
                      : translationExercises.arabicToEnglish
                    ).map((question, idx) => (
                      <div 
                        key={idx} 
                        className="bg-white p-6 rounded-xl shadow-md cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleTranslationQuestionClick(question)}
                      >
                        <p className="font-medium text-gray-800">{question}</p>
                      </div>
                    ))}
                  </div>
                )}
                {/* MCQ List */}
                {selectedTranslationMode === 'mcq' && (
                  <div className="space-y-6 max-w-4xl mx-auto">
                    {translationExercises.mcq.map((mcq, index) => {
                      const [question, ...options] = mcq.split('\n');
                      return (
                        <div 
                          key={index} 
                          className="bg-white p-6 rounded-xl shadow-md cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => handleMCQQuestionClick(mcq)}
                        >
                          <p className="mb-4 font-medium">{question}</p>
                          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                            {options.map((option, i) => (
                              <div key={i} className="flex items-center">
                                <input 
                                  type="radio" 
                                  id={`mcq-${index}-${i}`}
                                  name={`mcq-${index}`}
                                  className="mr-2 h-4 w-4 text-[#7030a0] focus:ring-[#7030a0]"
                                />
                                <label htmlFor={`mcq-${index}-${i}`} className="text-gray-800 cursor-default">
                                  {option}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-8 flex justify-center gap-4">
                  <button
                    onClick={() => setSelectedTranslationMode(null)}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold shadow-md transition-colors"
                  >
                    ← Back to Translation Types
                  </button>
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="px-6 py-3 bg-[#7030a0] hover:bg-[#512b81] text-white rounded-lg font-semibold shadow-md transition-colors"
                  >
                    ← Back to Curriculum
                  </button>
                </div>
              </div>

              {/* Sidebar Chatbot */}
              <div 
                className={`lg:block fixed right-0 top-0 h-screen bg-white border-t-2 lg:border-t-0 lg:border-l-2 border-[#7030a0] p-4 overflow-y-auto rounded-r-3xl shadow-lg transition-all duration-300 ease-in-out flex flex-col
                  ${isSidebarExpanded ? 'w-[600px] xl:w-[700px]' : 'w-[380px] xl:w-[420px]'}
                `}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[#7030a0]">Edu-Genie Assistant</h2>
                  <button 
                    onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                  >
                    {isSidebarExpanded ? '⇦' : '⇨'}
                  </button>
                </div>
                <div className="flex flex-col h-full">
                  <div className="flex flex-col items-center mb-2">
                    <img src={GenieImage} alt="Genie" className="w-12 h-12 object-contain" />
                    <h2 className="text-lg font-bold text-[#7030a0] mt-1">Ask Genie</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto mb-2 bg-[#f9f9f9] rounded-xl p-2 space-y-1">
                    {sidebarMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg max-w-[95%] break-words text-sm ${
                          msg.isUser
                            ? 'bg-[#7030a0] text-white ml-auto'
                            : 'bg-white text-gray-800 mr-auto shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                    <div ref={sidebarMessagesEndRef} />
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Type your question..."
                        className="flex-1 rounded-lg p-2 border border-[#7030a0] focus:outline-none focus:ring-1 focus:ring-[#7030a0] text-gray-800 text-sm"
                        value={sidebarInput}
                        onChange={(e) => setSidebarInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSidebarSend()}
                      />
                      <button
                        className="px-3 py-2 bg-[#7030a0] hover:bg-[#512b81] text-white rounded-lg font-semibold transition-all text-sm"
                        onClick={handleSidebarSend}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Comprehension */}
          {selectedTopic === 'comprehension' && (
            <div className="flex h-screen">
              {/* Main Content */}
              <div className="flex-1 overflow-auto p-8 pl-[10%] pr-[380px] xl:pr-[420px]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  {selectedComprehension === null ? (
                    <>
                      <div className="flex flex-col items-center mb-12">
                        <h2 className="text-3xl font-bold text-[#7030a0] mb-4">
                          Comprehension Exercises
                        </h2>
                        <p className="text-gray-600 text-center">Click any exercise to start practicing</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-12 max-w-6xl mx-auto">
                        {comprehensionExercises.map((comp, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedComprehension(idx);
                              window.scrollTo(0, 0);
                            }}
                            className="relative group rounded-xl shadow-md bg-gradient-to-br from-[#7030a0] to-[#a678ff] h-32 w-full flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none"
                            style={{ minWidth: 0 }}
                          >
                            <div className="absolute top-2 right-2 opacity-30 group-hover:opacity-60 transition-opacity duration-200">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                            <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
                              <span className="text-3xl font-extrabold text-white mb-1">{idx + 1}</span>
                              <span className="text-xl font-semibold text-white">Comprehension</span>
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 group-hover:bg-white/50 transition-all duration-300"></div>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-center">
                        <button
                          onClick={() => setSelectedTopic(null)}
                          className="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Back to Curriculum
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-3xl font-bold text-center mb-8 text-[#7030a0]">
                        Comprehension {selectedComprehension + 1}
                      </h2>
                      <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                        <h3 className="text-xl font-semibold text-[#7030a0] mb-4">Reading Passage</h3>
                        <div className="prose max-w-none text-gray-700 leading-relaxed">
                          {comprehensionExercises[selectedComprehension].passage.split('\n\n').map((para, idx) => (
                            <p key={idx} className="mb-4">
                              {para}
                            </p>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4 mb-8">
                        <h3 className="text-xl font-semibold text-[#7030a0] mb-4">Questions</h3>
                        {comprehensionExercises[selectedComprehension].questions.map((q, idx) => (
                          <div 
                            key={idx}
                            onClick={() => handleExerciseQuestionClick(q)}
                            className="bg-white p-6 rounded-xl shadow-md cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <p className="font-medium text-gray-800">
                              <span className="font-bold text-[#7030a0] mr-2">{idx + 1}.</span>
                              {q}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => {
                            setSelectedComprehension(null);
                            window.scrollTo(0, 0);
                          }}
                          className="px-6 py-2.5 bg-[#7030a0] hover:bg-[#5a2580] text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                          Back to Exercises
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTopic(null);
                            setSelectedComprehension(null);
                          }}
                          className="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Back to Curriculum
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {/* Sidebar Chatbot */}
              <div 
                className={`lg:block fixed right-0 top-0 h-screen bg-white border-t-2 lg:border-t-0 lg:border-l-2 border-[#7030a0] p-4 overflow-y-auto rounded-r-3xl shadow-lg transition-all duration-300 ease-in-out flex flex-col
                  ${isSidebarExpanded ? 'w-[600px] xl:w-[700px]' : 'w-[380px] xl:w-[420px]'}
                `}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[#7030a0]">Edu-Genie Assistant</h2>
                  <button 
                    onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                  >
                    {isSidebarExpanded ? '⇦' : '⇨'}
                  </button>
                </div>
                <div className="flex flex-col h-full">
                  <div className="flex flex-col items-center mb-2">
                    <img src={GenieImage} alt="Genie" className="w-12 h-12 object-contain" />
                    <h2 className="text-lg font-bold text-[#7030a0] mt-1">Ask Genie</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto mb-2 bg-[#f9f9f9] rounded-xl p-2 space-y-1">
                    {sidebarMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg max-w-[95%] break-words text-sm ${
                          msg.isUser
                            ? 'bg-[#7030a0] text-white ml-auto'
                            : 'bg-white text-gray-800 mr-auto shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                    <div ref={sidebarMessagesEndRef} />
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Type your question..."
                        className="flex-1 rounded-lg p-2 border border-[#7030a0] focus:outline-none focus:ring-1 focus:ring-[#7030a0] text-gray-800 text-sm"
                        value={sidebarInput}
                        onChange={(e) => setSidebarInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSidebarSend()}
                      />
                      <button
                        className="px-3 py-2 bg-[#7030a0] hover:bg-[#512b81] text-white rounded-lg font-semibold transition-all text-sm"
                        onClick={handleSidebarSend}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* MCQ Type Selector */}
          {selectedTopic === 'mcq' && !selectedMcqType && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <h2 className="text-3xl font-bold mb-12 text-[#7030a0]">Choose MCQ Type</h2>
              <div className="flex flex-col sm:flex-row gap-8 w-full max-w-2xl px-4">
                <button
                  onClick={() => setSelectedMcqType('grammar')}
                  className="flex-1 px-8 py-6 bg-gradient-to-r from-[#7030a0] to-[#a678ff] text-white text-2xl font-bold rounded-2xl shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Grammar
                </button>
                <button
                  onClick={() => setSelectedMcqType('vocabulary')}
                  className="flex-1 px-8 py-6 bg-gradient-to-r from-[#7030a0] to-[#a678ff] text-white text-2xl font-bold rounded-2xl shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Vocabulary
                </button>
              </div>
              <button
                onClick={() => setSelectedTopic(null)}
                className="mt-12 px-8 py-3.5 bg-[#7030a0] hover:bg-[#5a2580] text-white rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Curriculum
              </button>
            </div>
          )}
          {/* Grammar Unit Selection */}
          {selectedTopic === 'mcq' && selectedMcqType === 'grammar' && !selectedGrammarUnit && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-10 text-[#7030a0] text-center">Choose a Grammar Unit</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl px-4">
                {Array.from({ length: 12 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedGrammarUnit(i + 1)}
                    className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 h-32"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#a678ff] to-[#7030a0] opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
                      <span className="text-4xl font-bold text-white mb-1">{i + 1}</span>
                      <span className="text-xl font-semibold text-white">Unit {i + 1}</span>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 group-hover:bg-white/50 transition-all duration-300"></div>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSelectedMcqType(null)}
                className="mt-12 px-8 py-3 bg-gradient-to-r from-[#a678ff] to-[#7030a0] hover:from-[#8a5cf5] hover:to-[#5a2580] text-white text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to MCQ Types
              </button>
            </div>
          )}
          {/* Grammar Unit PDF Display + Questions */}
          {selectedTopic === 'mcq' && selectedMcqType === 'grammar' && selectedGrammarUnit && (
            <div className="flex flex-col items-center h-screen overflow-auto">
              <div className="w-full max-w-7xl p-8 pl-[10%] pr-[380px] xl:pr-[420px]">
                <h2 className="text-3xl font-bold mb-6 text-center text-[#7030a0]">
                  Grammar - Unit {selectedGrammarUnit}
                </h2>

                <div className="w-full h-[75vh] shadow-lg rounded-lg overflow-hidden border-2 border-[#7030a0] mb-8">
                  <iframe
                    src={`/grammar_pdfs/Unit_${selectedGrammarUnit}_Grammar_PDF.pdf`}
                    title={`Unit ${selectedGrammarUnit} Grammar`}
                    className="w-full h-full"
                  />
                </div>

                {/* Show only one question at a time */}
                {grammarQuestions[selectedGrammarUnit] && grammarQuestions[selectedGrammarUnit].length > 0 && (
                  <div>
                    <div
                      className="bg-white p-6 rounded-xl shadow-md cursor-pointer hover:bg-gray-50 transition-colors mb-4"
                      onClick={() => {
                        const q = grammarQuestions[selectedGrammarUnit][currentQuestionIndex];
                        const formatted = `${q.question}\n\n${q.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}`;
                        setSidebarInput(formatted);
                      }}
                    >
                      <p className="text-lg font-semibold mb-3 text-[#7030a0]">
                        {grammarQuestions[selectedGrammarUnit][currentQuestionIndex].question}
                      </p>
                      <div className="space-y-2">
                        {grammarQuestions[selectedGrammarUnit][currentQuestionIndex].options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center space-x-3">
                            <span className="font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-center gap-4 mb-8">
                      <button
                        onClick={() => setCurrentQuestionIndex(i => Math.max(i - 1, 0))}
                        disabled={currentQuestionIndex === 0}
                        className={`px-4 py-2 rounded-full bg-[#7030a0] text-white font-bold text-xl shadow hover:bg-[#512b81] transition-all ${currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label="Previous Question"
                      >
                        &#8592;
                      </button>
                      <span className="self-center text-[#7030a0] font-semibold">
                        {currentQuestionIndex + 1} / {grammarQuestions[selectedGrammarUnit].length}
                      </span>
                      <button
                        onClick={() => setCurrentQuestionIndex(i => Math.min(i + 1, grammarQuestions[selectedGrammarUnit].length - 1))}
                        disabled={currentQuestionIndex === grammarQuestions[selectedGrammarUnit].length - 1}
                        className={`px-4 py-2 rounded-full bg-[#7030a0] text-white font-bold text-xl shadow hover:bg-[#512b81] transition-all ${currentQuestionIndex === grammarQuestions[selectedGrammarUnit].length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label="Next Question"
                      >
                        &#8594;
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-center mt-8 gap-4">
                  <button
                    onClick={() => {
                      setSelectedGrammarUnit(null);
                      setCurrentQuestionIndex(0);
                    }}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold"
                  >
                    ← Back to Units
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMcqType(null);
                      setSelectedGrammarUnit(null);
                      setCurrentQuestionIndex(0);
                    }}
                    className="px-6 py-3 bg-[#7030a0] hover:bg-[#512b81] text-white rounded-lg font-semibold"
                  >
                    ← Back to MCQ
                  </button>
                </div>
              </div>
              {/* Sidebar Chatbot */}
              <div 
                className={`lg:block fixed right-0 top-0 h-screen bg-white border-t-2 lg:border-t-0 lg:border-l-2 border-[#7030a0] p-4 overflow-y-auto rounded-r-3xl shadow-lg transition-all duration-300 ease-in-out flex flex-col
                  ${isSidebarExpanded ? 'w-[600px] xl:w-[700px]' : 'w-[380px] xl:w-[420px]'}
                `}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[#7030a0]">Edu-Genie Assistant</h2>
                  <button 
                    onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                  >
                    {isSidebarExpanded ? '⇦' : '⇨'}
                  </button>
                </div>
                <div className="flex flex-col h-full">
                  <div className="flex flex-col items-center mb-2">
                    <img src={GenieImage} alt="Genie" className="w-12 h-12 object-contain" />
                    <h2 className="text-lg font-bold text-[#7030a0] mt-1">Ask Genie</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto mb-2 bg-[#f9f9f9] rounded-xl p-2 space-y-1">
                    {sidebarMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg max-w-[95%] break-words text-sm ${
                          msg.isUser
                            ? 'bg-[#7030a0] text-white ml-auto'
                            : 'bg-white text-gray-800 mr-auto shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                    <div ref={sidebarMessagesEndRef} />
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Type your question..."
                        className="flex-1 rounded-lg p-2 border border-[#7030a0] focus:outline-none focus:ring-1 focus:ring-[#7030a0] text-gray-800 text-sm"
                        value={sidebarInput}
                        onChange={(e) => setSidebarInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSidebarSend()}
                      />
                      <button
                        className="px-3 py-2 bg-[#7030a0] hover:bg-[#512b81] text-white rounded-lg font-semibold transition-all text-sm"
                        onClick={handleSidebarSend}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Vocabulary Unit Selection */}
          {selectedTopic === 'mcq' && selectedMcqType === 'vocabulary' && !selectedVocabularyUnit && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-10 text-[#7030a0] text-center">Choose a Vocabulary Unit</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl px-4">
                {Array.from({ length: 12 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedVocabularyUnit(i + 1)}
                    className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 h-32"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#a678ff] to-[#7030a0] opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
                      <span className="text-4xl font-bold text-white mb-1">{i + 1}</span>
                      <span className="text-xl font-semibold text-white">Unit {i + 1}</span>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 group-hover:bg-white/50 transition-all duration-300"></div>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSelectedMcqType(null)}
                className="mt-12 px-8 py-3 bg-gradient-to-r from-[#a678ff] to-[#7030a0] hover:from-[#8a5cf5] hover:to-[#5a2580] text-white text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to MCQ Types
              </button>
            </div>
          )}
          {/* Vocabulary Unit PDF Display */}
          {selectedTopic === 'mcq' && selectedMcqType === 'vocabulary' && selectedVocabularyUnit && (
            <div className="flex flex-col items-center h-screen overflow-auto">
              <div className="w-full max-w-7xl p-8 pl-[10%] pr-[380px] xl:pr-[420px]">
                <h2 className="text-3xl font-bold mb-6 text-center text-[#7030a0]">
                  Vocabulary - Unit {selectedVocabularyUnit}
                </h2>

                {selectedVocabularyUnit <= 6 ? (
                  <div className="w-full h-[75vh] shadow-lg rounded-lg overflow-hidden border-2 border-[#7030a0] mb-8">
                    <iframe
                      src={`/vocabulary_pdfs/Unit_${selectedVocabularyUnit}_Vocabulary_PDF.pdf`}
                      title={`Unit ${selectedVocabularyUnit} Vocabulary`}
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-full h-[75vh] flex items-center justify-center bg-white rounded-lg shadow-lg border-2 border-[#7030a0] mb-8">
                    <p className="text-xl text-gray-500">Content coming soon for Unit {selectedVocabularyUnit}</p>
                  </div>
                )}
                {vocabularyQuestions[selectedVocabularyUnit] && vocabularyQuestions[selectedVocabularyUnit].length > 0 && (
                  <div>
                    <div
                      className="bg-white p-6 rounded-xl shadow-md cursor-pointer hover:bg-gray-50 transition-colors mb-4"
                      onClick={() => {
                        const q = vocabularyQuestions[selectedVocabularyUnit][currentQuestionIndex];
                        const formatted = `${q.question}\n\n${q.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}`;
                        setSidebarInput(formatted);
                      }}
                    >
                      <p className="text-lg font-semibold mb-3 text-[#7030a0]">
                        {vocabularyQuestions[selectedVocabularyUnit][currentQuestionIndex].question}
                      </p>
                      <div className="space-y-2">
                        {vocabularyQuestions[selectedVocabularyUnit][currentQuestionIndex].options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center space-x-3">
                            <span className="font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-center gap-4 mb-8">
                      <button
                        onClick={() => setCurrentQuestionIndex(i => Math.max(i - 1, 0))}
                        disabled={currentQuestionIndex === 0}
                        className={`px-4 py-2 rounded-full bg-[#7030a0] text-white font-bold text-xl shadow hover:bg-[#512b81] transition-all ${currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label="Previous Question"
                      >
                        &#8592;
                      </button>
                      <span className="self-center text-[#7030a0] font-semibold">
                        {currentQuestionIndex + 1} / {vocabularyQuestions[selectedVocabularyUnit].length}
                      </span>
                      <button
                        onClick={() => setCurrentQuestionIndex(i => Math.min(i + 1, vocabularyQuestions[selectedVocabularyUnit].length - 1))}
                        disabled={currentQuestionIndex === vocabularyQuestions[selectedVocabularyUnit].length - 1}
                        className={`px-4 py-2 rounded-full bg-[#7030a0] text-white font-bold text-xl shadow hover:bg-[#512b81] transition-all ${currentQuestionIndex === vocabularyQuestions[selectedVocabularyUnit].length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label="Next Question"
                      >
                        &#8594;
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-center mt-8 gap-4">
                  <button
                    onClick={() => {
                      setSelectedVocabularyUnit(null);
                      setCurrentQuestionIndex(0);
                    }}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold"
                  >
                    ← Back to Units
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMcqType(null);
                      setSelectedVocabularyUnit(null);
                      setCurrentQuestionIndex(0);
                    }}
                    className="px-6 py-3 bg-[#7030a0] hover:bg-[#512b81] text-white rounded-lg font-semibold"
                  >
                    ← Back to MCQ
                  </button>
                </div>
              </div>
              {/* Sidebar Chatbot */}
              <div 
                className={`lg:block fixed right-0 top-0 h-screen bg-white border-t-2 lg:border-t-0 lg:border-l-2 border-[#7030a0] p-4 overflow-y-auto rounded-r-3xl shadow-lg transition-all duration-300 ease-in-out flex flex-col
                  ${isSidebarExpanded ? 'w-[600px] xl:w-[700px]' : 'w-[380px] xl:w-[420px]'}
                `}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[#7030a0]">Edu-Genie Assistant</h2>
                  <button 
                    onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                  >
                    {isSidebarExpanded ? '⇦' : '⇨'}
                  </button>
                </div>
                <div className="flex flex-col h-full">
                  <div className="flex flex-col items-center mb-2">
                    <img src={GenieImage} alt="Genie" className="w-12 h-12 object-contain" />
                    <h2 className="text-lg font-bold text-[#7030a0] mt-1">Ask Genie</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto mb-2 bg-[#f9f9f9] rounded-xl p-2 space-y-1">
                    {sidebarMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg max-w-[95%] break-words text-sm ${
                          msg.isUser
                            ? 'bg-[#7030a0] text-white ml-auto'
                            : 'bg-white text-gray-800 mr-auto shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                    <div ref={sidebarMessagesEndRef} />
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Type your question..."
                        className="flex-1 rounded-lg p-2 border border-[#7030a0] focus:outline-none focus:ring-1 focus:ring-[#7030a0] text-gray-800 text-sm"
                        value={sidebarInput}
                        onChange={(e) => setSidebarInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSidebarSend()}
                      />
                      <button
                        className="px-3 py-2 bg-[#7030a0] hover:bg-[#512b81] text-white rounded-lg font-semibold transition-all text-sm"
                        onClick={handleSidebarSend}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}