import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import GenieImage from '../assets/Genie.png';

const API_BASE_URL = 'https://182e-104-196-189-165.ngrok-free.app';

const getBotResponse = async (userMessage) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: userMessage }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from bot');
    }

    const data = await response.json();
    return data.response || "I'm not sure how to respond to that.";
  } catch (error) {
    console.error('Error getting bot response:', error);
    return "Sorry, I'm having trouble connecting to the server.";
  }
};

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
  const [visualizingMessageId, setVisualizingMessageId] = useState(null);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [showThinkingIndicator, setShowThinkingIndicator] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isNewChat, setIsNewChat] = useState(true);
  const [isImageUpload, setIsImageUpload] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const messagesEndRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const audioRef = useRef(null);

  // Fetch and type response function
  const fetchAndTypeResponse = useCallback(async () => {
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
        hasVisualization: true,
        originalQuestion: pendingMessage,
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
  }, [pendingMessage, setMessages, setShowThinkingIndicator, setIsBotTyping]);

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
      fetchAndTypeResponse();
    }
  }, [isBotTyping, pendingMessage, fetchAndTypeResponse]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const staticQAPairs = useMemo(() => ({
    'Why do Joe and Pip join the soldiers on the marshes, and how do they feel about finding the escaped convicts?': 'Joe and Pip join the soldiers because Joe, as a blacksmith, is needed to fix their broken handcuffs. The soldiers are searching for two escaped convicts hiding on the marshes. Pip feels nervous and guilty because he secretly helped one of the convicts earlier. Both he and Joe quietly hope the convicts won’t be found, showing they feel sorry for them rather than wanting them caught.',
    'Why is Pip sitting alone and crying in the graveyard at the beginning of the chapter?': 'Pip is crying in the graveyard on Christmas Eve because he is an orphan and feels lonely and sad. He visits the graves of his parents and siblings, whom he never knew, to feel closer to them. The graveyard’s cold, dark setting reflects his feelings of loss and isolation, showing how vulnerable he is as a child.',
    'What does Pip steal from the kitchen on Christmas morning, and why does he take it?': 'On Christmas morning, Pip secretly steals food (including cheese, apples, oranges, nuts, and a meat pie) and a blacksmith’s file from Joe’s workroom. He takes them because he had promised to help the escaped convict he met in the graveyard, who had threatened him the day before. The convict needed the file to remove his leg irons and escape, and Pip, though scared, felt sorry for him and wanted to keep his promise.',
    // Add more pairs here
  }), []);

  const handleVisualization = async (messageId, question) => {
    try {
      setVisualizingMessageId(messageId);
      setIsBotTyping(true);
      setShowThinkingIndicator(true);

      const message = messages.find(msg => msg.id === messageId);
      if (!message) {
        console.error('Message not found');
        return;
      }

      console.log('=== STARTING VISUALIZATION REQUEST ===');
      console.log('Question:', message.originalQuestion || message.text);

      const API_BASE_URL = 'https://fa61-34-71-15-16.ngrok-free.app';

      const requestBody = JSON.stringify({
        narrative_text: "We need a blacksmith to mend some handcuffs, please,' the first soldier said. 'We're looking for two convicts who broke their handcuffs and escaped. We think they are hiding out on the marshes, although they probably won't try to get away until tonight.' When he asked if we had seen them, everybody else said no. I did not speak. Joe mended the handcuffs for the soldiers, and they waited with us as he worked. When they were finished, Joe and I followed the soldiers out of the village and onto the marshes.",
        summary: "Joe and Pip were following soldiers onto the marshes to search for two escaped convicts. Joe had mended handcuffs for the soldiers before they all set out. They hoped not to find the convicts as they walked through the rainy and windy marshes."
      });

      const response = await fetch(`${API_BASE_URL}/generate-scene`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: requestBody
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.image_url) {
        const newMessage = {
          id: `img-${Date.now()}`,
          text: 'Here is the visualization:',
          isUser: false,
          isImage: true,
          imageUrl: result.image_url,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, newMessage]);
      } else {
        throw new Error('No image URL received from the server');
      }

    } catch (error) {
      console.error('Error generating visualization:', error);
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: `Failed to generate visualization: ${error.message}`,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsBotTyping(false);
      setShowThinkingIndicator(false);
      setVisualizingMessageId(null);
    }
  };

  const handleSpeak = async (messageId) => {
    console.log('--- Starting handleSpeak ---');
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setPlayingAudioId(null);
      }

      setSpeakingMessageId(messageId);
      const message = messages.find(msg => msg.id === messageId);
      if (!message) {
        console.error('Message not found for ID:', messageId);
        return;
      }
  
      // If we already have an audio URL, play it
      if (message.audioUrl) {
        try {
          await playAudio(message.audioUrl, messageId);
          return;
        } catch (error) {
          console.error('Error playing cached audio:', error);
        }
      }
  
      const NGROK_TUNNEL = 'https://d6a2-104-199-193-238.ngrok-free.app';
  
      const response = await fetch(`${NGROK_TUNNEL}/generate-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          text: message.text,
          speaker: "Ana Florence"
        })
      });
  
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errText}`);
      }
  
      const data = await response.json();
      const audioUrl = data.audio_url;
  
      if (!audioUrl) {
        throw new Error('No audio_url returned from backend');
      }
  
      // Update the message with the audio URL
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, audioUrl } : msg
        )
      );
  
      // Play the audio
      await playAudio(audioUrl, messageId);
  
    } catch (error) {
      console.error('Error in handleSpeak:', error);
    } finally {
      setSpeakingMessageId(null);
    }
  };

  const playAudio = (audioUrl, messageId) => {
    return new Promise((resolve, reject) => {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setPlayingAudioId(null);
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setPlayingAudioId(messageId);

      audio.onplay = () => {
        console.log('Audio started playing');
      };

      audio.onended = () => {
        console.log('Audio finished playing');
        setPlayingAudioId(null);
        audioRef.current = null;
        resolve();
      };

      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        setPlayingAudioId(null);
        audioRef.current = null;
        reject(error);
      };

      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Audio play failed:', error);
          setPlayingAudioId(null);
          audioRef.current = null;
          reject(error);
        });
      }
    });
  };

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
          hasVisualization: true,
          originalQuestion: message
        }]);
      }, 500);
    } else {
      // For non-static messages, proceed with the normal flow
      setPendingMessage(message);
      setIsBotTyping(true);
    }

    setInputText('');
  }, [setMessages, staticQAPairs, setPendingMessage, setIsBotTyping, setInputText]);

  return (
    <div className={`w-full ${showHeader ? 'min-h-screen p-2 sm:p-4' : 'h-full p-2'} flex flex-col items-center ${isDarkMode ? 'bg-[#3d3d3d]' : 'bg-gradient-to-r from-[#f2f2f2] to-[#7030a0]'}`}>
      {header}

      <div
        className={`w-full ${showHeader ? 'max-w-6xl' : 'max-w-full'} rounded-2xl shadow-xl p-2 sm:p-4 flex flex-col ${showHeader ? 'h-[85vh]' : 'h-full'}
          } ${isDarkMode ? 'bg-[#4d4d4d]' : 'bg-[#d8d8d8]'}`}
      >
        <div className="flex-1 overflow-y-auto mb-2">
          <MessageList
            messages={messages}
            isDarkMode={isDarkMode}
            onVisualize={handleVisualization}
            onSpeak={handleSpeak}
            visualizingMessageId={visualizingMessageId}
            speakingMessageId={speakingMessageId}
            playingAudioId={playingAudioId}
          />
          <div ref={messagesEndRef} />

          {showThinkingIndicator && (
            <div className={`text-sm md:text-lg italic mt-2 ${isDarkMode ? 'text-gray-300' : 'text-[#7030a0]'}`}>
              Genie is thinking...
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-inherit pt-2 pb-1">
          <ChatInput
            value={inputText}
            onChange={setInputText}
            onSend={handleSendMessage}
            isDarkMode={isDarkMode}
            onImageUpload={handleImageUpload}
          />
        </div>
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