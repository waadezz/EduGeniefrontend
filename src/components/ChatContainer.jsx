import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import GenieImage from '../assets/Genie.png';

const ChatContainer = ({ 
  messages, 
  setMessages, 
  isDarkMode, 
  prefilledInput, 
  setPrefilledInput, 
  context = '', 
  showHeader = true,
  showTitle = true 
}) => {
  const [inputText, setInputText] = useState(prefilledInput || '');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [showThinkingIndicator, setShowThinkingIndicator] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isNewChat, setIsNewChat] = useState(true);
  const messagesEndRef = useRef(null);
  const typingIntervalRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle prefilled input
  useEffect(() => {
    if (prefilledInput) {
      setInputText(prefilledInput);
      setPrefilledInput('');
    }
  }, [prefilledInput, setPrefilledInput]);

  // Handle bot responses when pendingMessage changes
  useEffect(() => {
    if (isBotTyping && pendingMessage) {
      setShowThinkingIndicator(true);
      
      const fetchAndTypeResponse = async () => {
        const botMessageId = `bot-${Date.now()}`;
        
        try {
          // Get response from the bot
          const data = await getBotResponse(pendingMessage);
          
          // Hide the thinking indicator
          setShowThinkingIndicator(false);
          
          // Add the actual response message
          setMessages(prev => [...prev, { 
            id: botMessageId,
            text: '', 
            isUser: false,
            timestamp: new Date().toISOString() 
          }]);
          
          // Format the bot's response
          let botMessage = data;

          // Type out the response character by character
          let index = 0;
          typingIntervalRef.current = setInterval(() => {
            setMessages(prev => {
              const newMessages = [...prev];
              const messageIndex = newMessages.findIndex(msg => msg.id === botMessageId);
              
              if (messageIndex !== -1) {
                newMessages[messageIndex] = {
                  ...newMessages[messageIndex],
                  text: botMessage.slice(0, index + 1)
                };
              }
              
              return newMessages;
            });

            if (index >= botMessage.length) {
              clearInterval(typingIntervalRef.current);
              setIsBotTyping(false);
              setPendingMessage('');
            }
            index++;
          }, 20);
          
        } catch (error) {
          console.error('Error getting bot response:', error);
          setShowThinkingIndicator(false);
          
          // Add error message
          setMessages(prev => [...prev, {
            id: `error-${Date.now()}`,
            text: "Sorry, I'm having trouble connecting to the server.",
            isUser: false,
            timestamp: new Date().toISOString()
          }]);
          
          setIsBotTyping(false);
          setPendingMessage('');
        }
      };

      fetchAndTypeResponse();
    }

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [isBotTyping, pendingMessage, setMessages]);

  const API_URL = 'http://127.0.0.1:8000/api/v1/router/1';

  const getBotResponse = useCallback(async (userMessage) => {
    console.log('getBotResponse called with:', userMessage);
    
    try {
      console.log('Sending request to:', API_URL);
      console.log('Request payload:', {
        question: userMessage,
        new_chat: isNewChat,
        chat_hist: chatHistory
      });
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage,
          new_chat: isNewChat,
          chat_hist: chatHistory
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json().catch(error => {
        console.error('Error parsing JSON:', error);
        throw new Error('Invalid JSON response from server');
      });
      
      console.log('Response data:', responseData);
      
      if (!Array.isArray(responseData) || responseData.length !== 2) {
        console.error('Unexpected response format:', responseData);
        throw new Error('Unexpected response format from server');
      }
      
      const [result, updatedChatHistory] = responseData;
      console.log('Parsed result:', result, 'Updated history:', updatedChatHistory);
      
      // Update chat history with the one returned from the server
      if (Array.isArray(updatedChatHistory)) {
        setChatHistory(updatedChatHistory);
      } else {
        console.warn('Invalid chat history format from server:', updatedChatHistory);
        setChatHistory(prev => [...prev, 
          { role: 'user', content: userMessage },
          { role: 'assistant', content: result }
        ]);
      }
      
      // Mark as not a new chat after first message
      if (isNewChat) {
        setIsNewChat(false);
      }
      
      return result;
      
    } catch (error) {
      console.error('Error in getBotResponse:', error);
      // Return a user-friendly error message
      return `I'm sorry, I encountered an error: ${error.message}`;
    }
  }, [chatHistory, isNewChat]);

  const handleSendMessage = useCallback((message) => {
    if (!message.trim()) return;
    
    const userMessage = {
      id: `user-${Date.now()}`,
      text: message,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setPendingMessage(message);
    setIsBotTyping(true);
    setInputText('');
  }, [setMessages]);

  const handleFeatureAction = useCallback(async (messageId, featureType) => {
    if (!messageId || !featureType) return;
    
    try {
      setIsBotTyping(true);
      setActiveMessageId(messageId);
      
      const message = messages.find(msg => msg.id === messageId)?.text || '';
      const response = await fetch('http://127.0.0.1:8000/api/v1/process-feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, featureType, message })
      });

      if (!response.ok) throw new Error('Failed to process feature');
      
      const result = await response.json();
      
      if (featureType === 'visualization') {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, visualization: result.visualizationUrl }
            : msg
        ));
      } else if (featureType === 'speech' && result.audioUrl) {
        const audio = new Audio(result.audioUrl);
        await audio.play().catch(e => console.error('Audio playback failed:', e));
      }
      
    } catch (error) {
      console.error(`Error processing ${featureType}:`, error);
      // Optionally show an error message to the user
    } finally {
      setIsBotTyping(false);
      setActiveMessageId(null);
    }
  }, [messages, setMessages]);

  const handleImageUpload = useCallback(async (file) => {
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    const messageId = Date.now().toString();
    
    const newMessage = {
      id: messageId,
      text: '',
      imageUrl,
      isUser: true,
      isImage: true,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    try {
      setPendingMessage('Analyzing image...');
      setIsBotTyping(true);
      
      const data = await getBotResponse('Analyze this image');
      let botMessage = data.response || 'I see an image but I\'m not sure what to do with it yet.';
      
      setMessages(prev => [
        ...prev, 
        { 
          id: `bot-${Date.now()}`,
          text: botMessage, 
          isUser: false,
          isImage: false,
          timestamp: new Date().toISOString()
        }
      ]);
      
    } catch (error) {
      console.error('Error processing image:', error);
      setMessages(prev => [
        ...prev, 
        { 
          id: `error-${Date.now()}`,
          text: 'Sorry, I had trouble analyzing the image.', 
          isUser: false,
          isImage: false,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsBotTyping(false);
      setPendingMessage('');
    }
  }, [getBotResponse, setMessages]);

  // Memoize the header to prevent unnecessary re-renders
  const header = useMemo(() => {
    if (!showHeader) return null;
    
    return (
      <>
        {showTitle && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className={`text-4xl md:text-6xl font-bold tracking-normal ${
              isDarkMode ? 'text-[#a078c9]' : 'text-transparent bg-clip-text bg-gradient-to-r from-[#012060] to-[#7030a0]'
            }`}>
              EDU-<span className={`ml-2 ${
                isDarkMode ? 'text-[#4d7cff]' : 'text-transparent bg-clip-text bg-gradient-to-r from-[#7030a0] to-[#012060]'
              }`}>
                GENIE!
              </span>
            </h1>
            <img src={GenieImage} alt="Genie" className="w-12 h-12 md:w-16 md:h-16 object-contain animate-bounce" />
          </div>
        )}

        {context && (
          <div className={`mb-4 p-2 rounded-lg ${
            isDarkMode ? 'bg-[#4d4d4d] text-gray-300' : 'bg-[#d8d8d8] text-[#012060]'
          }`}>
            <p className="text-sm md:text-base">{context}</p>
          </div>
        )}
      </>
    );
  }, [showHeader, showTitle, isDarkMode, context]);

  return (
    <div className={`w-full ${showHeader ? 'h-screen p-4' : 'h-full p-2'} flex flex-col items-center ${
      isDarkMode ? 'bg-[#3d3d3d]' : 'bg-gradient-to-r from-[#f2f2f2] to-[#7030a0]'
    }`}>
      {header}

      <div
        className={`w-full ${showHeader ? 'max-w-4xl' : 'max-w-full'} rounded-2xl shadow-xl p-4 flex flex-col ${
          showHeader ? 'h-[80vh]' : 'h-full'
        } ${isDarkMode ? 'bg-[#4d4d4d]' : 'bg-[#d8d8d8]'}`}
      >
        <MessageList 
          messages={messages} 
          isDarkMode={isDarkMode}
          compactView={!showHeader}
          onVisualize={useCallback((id) => handleFeatureAction(id, 'visualization'), [handleFeatureAction])}
          onSpeak={useCallback((id) => handleFeatureAction(id, 'speech'), [handleFeatureAction])}
          activeMessageId={activeMessageId}
        />
        <div ref={messagesEndRef} />

        {showThinkingIndicator && (
          <div className={`text-sm md:text-lg italic mt-2 ${
            isDarkMode ? 'text-gray-300' : 'text-[#7030a0]'
          }`}>
            Genie is thinking...
          </div>
        )}

        <ChatInput
          value={inputText}
          onChange={setInputText}
          onSend={handleSendMessage}
          isDarkMode={isDarkMode}
          onImageUpload={handleImageUpload}
        />
      </div>
    </div>
  );
};

export default ChatContainer;
