import { useState, useEffect } from 'react';
import WelcomePage from './components/WelcomePage';
import ChatContainer from './components/ChatContainer';
import AuthPage from './components/AuthPage';
import CurriculumPage from './components/CurriculumPage';
import './App.css';

function App() {
  const [appState, setAppState] = useState({
    isChatStarted: false,
    isTransitioning: false,
    showAuth: false,
    showCurriculum: false,
    intendedAction: null,
  });

  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [prefilledInput, setPrefilledInput] = useState('');

  // Local storage load/save based on user
  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`chatHistory_${currentUser.email}`);
      setChatHistory(saved ? JSON.parse(saved) : []);
    } else {
      setChatHistory([]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`chatHistory_${currentUser.email}`, JSON.stringify(chatHistory));
    }
  }, [chatHistory, currentUser]);

  const handleStartChatting = () => {
    if (currentUser) {
      setAppState({
        isChatStarted: true,
        isTransitioning: true,
        showAuth: false,
        showCurriculum: false,
      });
      setTimeout(() => setAppState((prev) => ({ ...prev, isTransitioning: false })), 500);
    } else {
      setAppState({
        isChatStarted: false,
        isTransitioning: true,
        showAuth: true,
        showCurriculum: false,
        intendedAction: 'chat',
      });
    }
  };

  const handleViewCurriculum = () => {
    if (currentUser) {
      setAppState({
        isChatStarted: false,
        isTransitioning: true,
        showAuth: false,
        showCurriculum: true,
      });
      setTimeout(() => setAppState((prev) => ({ ...prev, isTransitioning: false })), 500);
    } else {
      setAppState({
        isChatStarted: false,
        isTransitioning: true,
        showAuth: true,
        showCurriculum: false,
        intendedAction: 'curriculum',
      });
    }
  };

  const handleAuthenticate = (user) => {
    setCurrentUser(user);
    if (appState.intendedAction === 'chat') {
      handleStartChatting();
    } else if (appState.intendedAction === 'curriculum') {
      handleViewCurriculum();
    } else {
      setAppState({
        isChatStarted: false,
        isTransitioning: false,
        showAuth: false,
        showCurriculum: true,
        intendedAction: null,
      });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setMessages([]);
    setChatHistory([]);
    setAppState({
      isChatStarted: false,
      isTransitioning: false,
      showAuth: true,
      showCurriculum: false,
      intendedAction: null,
    });
  };

  const handleExitToWelcome = () => {
    setAppState({
      isChatStarted: false,
      isTransitioning: true,
      showAuth: false,
      showCurriculum: false,
      intendedAction: null,
    });
    setTimeout(() => setAppState((prev) => ({ ...prev, isTransitioning: false })), 500);
  };

  const handleNewChat = () => {
    if (messages.length > 0) {
      setChatHistory((prev) => [...prev, messages]);
    }
    setMessages([]);
  };

  const handleDeleteChat = (index) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      setChatHistory((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      setChatHistory([]);
      if (currentUser) {
        localStorage.removeItem(`chatHistory_${currentUser.email}`);
      }
    }
  };

  const handleLoadChat = (index) => {
    const selectedChat = chatHistory[index];
    if (selectedChat) {
      setMessages(selectedChat);
      setAppState({
        isChatStarted: true,
        isTransitioning: false,
        showAuth: false,
        showCurriculum: false,
        intendedAction: null,
      });
      setShowHistory(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleSendSidebarMessage = async (question) => {
    const fakeAnswer = `🤖 Answer to: "${question}"`; 
    return new Promise((resolve) => setTimeout(() => resolve(fakeAnswer), 800)); 
  };

  const handleAskQuestion = (question) => {
    setAppState({
      isChatStarted: true,
      isTransitioning: false,
      showAuth: false,
      showCurriculum: false,
      intendedAction: null,
    });
    setPrefilledInput(question);
  };

  return (
    <div className={`App ${isDarkMode ? 'dark' : 'light'}`}>

      {appState.showAuth && (
        <div className={`auth-page ${appState.isTransitioning ? 'fade-out' : 'fade-in'}`}>
          <AuthPage onAuthenticate={handleAuthenticate} isDarkMode={isDarkMode} />
        </div>
      )}

      {!appState.isChatStarted && !appState.showAuth && !appState.showCurriculum && (
        <div className={`welcome-page ${appState.isTransitioning ? 'fade-out' : 'fade-in'}`}>
          <WelcomePage
            onStartChatting={handleStartChatting}
            onViewCurriculum={handleViewCurriculum}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        </div>
      )}

      {appState.showCurriculum && (
        <div className={`curriculum-page ${appState.isTransitioning ? 'fade-out' : 'fade-in'}`}>
          <CurriculumPage
            isDarkMode={isDarkMode}
            onExitToWelcome={handleExitToWelcome}
            onSendSidebarMessage={handleSendSidebarMessage}
          />
        </div>
      )}

      {appState.isChatStarted && (
        <div className={`chat-page ${appState.isTransitioning ? 'scale-up' : 'scale-up'}`}>
          <div className="h-screen flex">

            {showHistory && (
              <div className={`w-1/4 p-2 overflow-y-auto ${isDarkMode ? 'bg-[#2d2d2d] text-[#f2f2f2]' : 'bg-white text-[#012060]'}`}>
                <h3 className="text-xl font-bold mb-4">Chat History</h3>
                {chatHistory.map((chat, index) => {
                  const firstUserMessage = chat.find(msg => msg.isUser)?.text || `Chat ${index + 1}`;
                  return (
                    <div key={index} className="mb-2 p-2 rounded-lg cursor-pointer hover:bg-gray-300 transition" onClick={() => handleLoadChat(index)}>
                      <div className="flex justify-between items-center">
                        <span className="text-md font-semibold truncate">{firstUserMessage}</span>
                        <button className="text-gray-500 hover:text-red-500 hover:scale-105" onClick={(e) => { e.stopPropagation(); handleDeleteChat(index); }}>✕</button>
                      </div>
                    </div>
                  );
                })}
                {chatHistory.length > 0 && (
                  <button className="w-full mt-6 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600" onClick={handleClearHistory}>
                    🗑️ Clear All
                  </button>
                )}
              </div>
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              <div className={`flex justify-between items-center ${isDarkMode ? 'bg-[#3d3d3d]' : 'bg-[#7030a0]'} p-4`}>
                <div className="flex gap-4">
                  <button onClick={handleNewChat} className={`px-4 py-2 rounded-xl ${isDarkMode ? 'bg-[#4d4d4d]' : 'bg-[#012060]'} text-white hover:scale-105`}>New Chat</button>
                  <button onClick={() => setShowHistory(!showHistory)} className={`px-4 py-2 rounded-xl ${isDarkMode ? 'bg-[#4d4d4d]' : 'bg-[#012060]'} text-white hover:scale-105`}>{showHistory ? 'Hide History' : 'Show History'}</button>
                  <button onClick={handleViewCurriculum} className={`px-4 py-2 rounded-xl ${isDarkMode ? 'bg-[#4d4d4d]' : 'bg-[#012060]'} text-white hover:scale-105`}>Curriculum</button>
                </div>
                <div className="flex gap-4 items-center">
                  {currentUser && (
                    <button onClick={handleLogout} className={`px-4 py-2 rounded-xl ${isDarkMode ? 'bg-[#4d4d4d]' : 'bg-[#012060]'} text-white hover:scale-105`}>
                      Logout
                    </button>
                  )}
                  <button onClick={toggleTheme} className="p-2 rounded-full bg-[#7030a0] hover:bg-[#512b81] text-white hover:scale-105">
                    {isDarkMode ? '💡' : '🪔'}
                  </button>
                </div>
              </div>

              <ChatContainer
                messages={messages}
                setMessages={setMessages}
                isDarkMode={isDarkMode}
                prefilledInput={prefilledInput}
                setPrefilledInput={setPrefilledInput}
              />
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default App;
