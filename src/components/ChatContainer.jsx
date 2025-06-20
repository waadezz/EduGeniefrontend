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
  const [isImageUpload, setIsImageUpload] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
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
  }, [isBotTyping, pendingMessage, setMessages, isImageUpload]);

  const API_URL = 'http://127.0.0.1:8000/api/v1/router/1';

  const staticQAPairs = useMemo(() => ({
    'Why do Joe and Pip join the soldiers on the marshes, and how do they feel about finding the escaped convicts?': 'Joe and Pip join the soldiers because Joe, as a blacksmith, is needed to fix their broken handcuffs. The soldiers are searching for two escaped convicts hiding on the marshes. Pip feels nervous and guilty because he secretly helped one of the convicts earlier. Both he and Joe quietly hope the convicts won’t be found, showing they feel sorry for them rather than wanting them caught.',
    'Why is Pip sitting alone and crying in the graveyard at the beginning of the chapter?': 'Pip is crying in the graveyard on Christmas Eve because he is an orphan and feels lonely and sad. He visits the graves of his parents and siblings, whom he never knew, to feel closer to them. The graveyard’s cold, dark setting reflects his feelings of loss and isolation, showing how vulnerable he is as a child.',
    'What does Pip steal from the kitchen on Christmas morning, and why does he take it?': 'On Christmas morning, Pip secretly steals food (including cheese, apples, oranges, nuts, and a meat pie) and a blacksmith’s file from Joe’s workroom. He takes them because he had promised to help the escaped convict he met in the graveyard, who had threatened him the day before. The convict needed the file to remove his leg irons and escape, and Pip, though scared, felt sorry for him and wanted to keep his promise.',
    // Add more pairs here
  }), []);
  const handleVisualization = useCallback((messageId, question) => {
    // Set the active message ID to show loading state
    setActiveMessageId(messageId);

    // Normalize the question
    const normalizedQuestion = question.toLowerCase().trim().replace(/\s+/g, ' ');
    console.log('Visualization requested for:', normalizedQuestion);

    // Map questions to image paths
    const imageMap = {
      'why do joe and pip join the soldiers on the marshes, and how do they feel about finding the escaped convicts?': '1.jpg',
      'why is pip sitting alone and crying in the graveyard at the beginning of the chapter?': '2.jpg',
      'what does pip steal from the kitchen on christmas morning, and why does he take it?': '3.jpg',
    };

    // Find the matching question
    const matchingQuestion = Object.keys(imageMap).find(key =>
      key.toLowerCase().trim().replace(/\s+/g, ' ') === normalizedQuestion
    );

    if (matchingQuestion) {
      const imageName = imageMap[matchingQuestion];
      console.log('Found matching image:', imageName);

      // Add a delay before showing the image (5000ms = 5 seconds)
      setTimeout(() => {
        // Use the public URL for images in the public folder
        const imagePath = `${window.location.origin}/images/${imageName}`;
        console.log('Image path:', imagePath);

        // Add the image as a message from the bot
        setMessages(prev => [...prev, {
          id: `img-${Date.now()}`,
          text: '',
          isUser: false,
          isImage: true,
          imageUrl: imagePath,
          timestamp: new Date().toISOString()
        }]);

        setCurrentImage(imagePath);
        setShowImage(true);
        setActiveMessageId(null); // Clear the active message ID after showing the image
      }, 5000);

      return true;
    }

    console.log('No matching image found for question:', normalizedQuestion);
    setActiveMessageId(null); // Clear the active message ID if no match found
    return false;
  }, [setMessages]);





  const getBotResponse = async (userMessage) => {
    try {
      console.log('Sending:', userMessage);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userMessage }),
      });

      if (!response.ok) throw new Error('Failed to get response');
      const data = await response.json();
      console.log('Received response:', data);

      // Format comprehension answers
      if (data["Evaluating Questions and Answers"]) {
        const qaItems = data["Evaluating Questions and Answers"];
        return qaItems.map((item, i) => {
          let msg = `Question ${i + 1}: ${item.Q}\n\nAnswer: ${item["Correct Answer"]}`;
          if (item["Explanation of your answer"]) {
            msg += `\n\nExplanation: ${item["Explanation of your answer"]}`;
          }
          return msg;
        }).join("\n\n");
      }

      // Handle other types
      if (data.correct_answer) {
        return `Question: ${data.question || ''}\n\nCorrect Answer: ${data.correct_answer}`;
      }

      if (data.translated_text) {
        return `Translation: ${data.translated_text}`;
      }

      if (typeof data.response === 'string') {
        return data.response;
      }

      if (data.answer) {
        return data.answer;
      }

      if (typeof data === 'string') {
        return data;
      }

      // Fallback: stringify unknown object
      return JSON.stringify(data);

    } catch (error) {
      console.error('API Error:', error);
      return "Sorry, I couldn't connect to the server.";
    }
  };


  const handleSendMessage = useCallback((message) => {
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage = {
      id: `user-${Date.now()}`,
      text: message,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    // Check if this is a question with a static answer
    const normalizedMessage = message.toLowerCase().trim();
    const hasStaticAnswer = Object.keys(staticQAPairs).some(question =>
      question.toLowerCase().trim() === normalizedMessage
    );

    if (hasStaticAnswer) {
      // For static answers, show the answer
      const answer = staticQAPairs[Object.keys(staticQAPairs).find(q =>
        q.toLowerCase().trim() === normalizedMessage
      )];

      // Add a small delay to simulate processing
      setTimeout(() => {
        const botMessageId = `bot-${Date.now()}`;
        setMessages(prev => [...prev, {
          id: botMessageId,
          text: answer,
          isUser: false,
          timestamp: new Date().toISOString(),
          // Add a flag to indicate this message has a visualization available
          hasVisualization: true,
          originalQuestion: message // Store the original question for visualization
        }]);
      }, 500);
    } else {
      // For non-static messages, proceed with the normal flow
      setPendingMessage(message);
      setIsBotTyping(true);
    }

    setInputText('');
  }, [setMessages, staticQAPairs, setPendingMessage, setIsBotTyping, setInputText]);

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

      if (!response.ok) {
        console.error(`Failed to process ${featureType}`);
        return;
      }

      const result = await response.json();

      if (featureType === 'visualization' && result.visualizationUrl) {
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
      // Silently fail without showing error message to user
    } finally {
      setIsBotTyping(false);
      setActiveMessageId(null);
    }
  }, [messages]);

  const handleImageUpload = async (file) => {
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    const messageId = Date.now().toString();

    // 1. Show the image (user message with image only)
    setMessages((prev) => [...prev, {
      id: messageId,
      text: '',
      imageUrl,
      isUser: true,
      isImage: true,
      timestamp: new Date().toISOString()
    }]);

    try {
      setIsBotTyping(true);

      // 2. Upload image to OCR endpoint
      const formData = new FormData();
      formData.append('file', file, file.name);

      const response = await fetch('http://127.0.0.1:8000/ocr/question', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OCR failed: ${errText}`);
      }

      const data = await response.json();
      console.log('OCR response:', data);

      // 3. Extract the question from OCR response
      const rawExtract = data.extracted_question || '';
      const match = rawExtract.match(/"text"\s*:\s*"([^"]+)"/);
      const extractedText = match ? match[1] : rawExtract;
      const cleanedQuestion = extractedText.trim();

      // 4. Get the answer from the bot
      const botAnswer = await getBotResponse(cleanedQuestion);

      // 5. Format both into a single bot message
      //const combinedMessage = `Your question is:\n${cleanedQuestion}\n\nThe answer is:\n${botAnswer}`;
      const combinedMessage = `Your Question:\n\n\n${cleanedQuestion}\n\n The Answer:\n\n${botAnswer};`

      // 6. Display bot message
      setMessages((prev) => [...prev, {
        id: `bot-${Date.now()}`,
        text: combinedMessage,
        isUser: false,
        timestamp: new Date().toISOString()
      }]);

    } catch (error) {
      console.error('Image upload error:', error);
      setMessages((prev) => [...prev, {
        id: `error-${Date.now()}`,
        text: `Image upload failed: ${error.message}`,
        isUser: false,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsBotTyping(false);
    }
  };



  // Memoize the header to prevent unnecessary re-renders
  const header = useMemo(() => {
    if (!showHeader) return null;

    return (
      <>
        {showTitle && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className={`text-4xl md:text-6xl font-bold tracking-normal ${isDarkMode ? 'text-[#a078c9]' : 'text-transparent bg-clip-text bg-gradient-to-r from-[#012060] to-[#7030a0]'
              }`}>
              EDU-<span className={`ml-2 ${isDarkMode ? 'text-[#4d7cff]' : 'text-transparent bg-clip-text bg-gradient-to-r from-[#7030a0] to-[#012060]'
                }`}>
                GENIE!
              </span>
            </h1>
            <img src={GenieImage} alt="Genie" className="w-12 h-12 md:w-16 md:h-16 object-contain animate-bounce" />
          </div>
        )}

        {context && (
          <div className={`mb-4 p-2 rounded-lg ${isDarkMode ? 'bg-[#4d4d4d] text-gray-300' : 'bg-[#d8d8d8] text-[#012060]'
            }`}>
            <p className="text-sm md:text-base">{context}</p>
          </div>
        )}
      </>
    );
  }, [showHeader, showTitle, isDarkMode, context]);

  return (
    <div className={`w-full ${showHeader ? 'h-screen p-4' : 'h-full p-2'} flex flex-col items-center ${isDarkMode ? 'bg-[#3d3d3d]' : 'bg-gradient-to-r from-[#f2f2f2] to-[#7030a0]'
      }`}>
      {header}

      <div
        className={`w-full ${showHeader ? 'max-w-4xl' : 'max-w-full'} rounded-2xl shadow-xl p-4 flex flex-col ${showHeader ? 'h-[80vh]' : 'h-full'
          } ${isDarkMode ? 'bg-[#4d4d4d]' : 'bg-[#d8d8d8]'}`}
      >
        <MessageList
          messages={messages}
          isDarkMode={isDarkMode}
          compactView={!showHeader}
          onVisualize={(id, question) => {
            console.log('Visualize button clicked for message:', id, 'with question:', question);
            handleVisualization(id, question);
          }}
          onSpeak={(id) => handleFeatureAction(id, 'speech')}
          activeMessageId={activeMessageId}
        />
        <div ref={messagesEndRef} />

        {showThinkingIndicator && (
          <div className={`text-sm md:text-lg italic mt-2 ${isDarkMode ? 'text-gray-300' : 'text-[#7030a0]'
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

      {showImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowImage(false)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-lg p-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowImage(false);
              }}
              className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 text-2xl"
              aria-label="Close"
            >
              &times;
            </button>
            {currentImage ? (
              <div className="h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center overflow-auto">
                  <img
                    src={currentImage}
                    alt="Visualization"
                    className="max-w-full max-h-[calc(90vh-4rem)] object-contain"
                    onError={(e) => {
                      console.error('Failed to load image:', currentImage);
                      e.target.alt = 'Image not found or failed to load';
                      e.target.src = ''; // Clear the broken image
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="mt-2 text-center text-sm text-gray-500">
                  Click outside the image to close
                </div>
              </div>
            ) : (
              <div className="text-center p-8">
                <p className="text-lg font-medium text-gray-700">No image to display</p>
                <p className="text-sm text-gray-500 mt-2">
                  Failed to load image from: <br />
                  <code className="break-all">{currentImage || 'No path provided'}</code>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;