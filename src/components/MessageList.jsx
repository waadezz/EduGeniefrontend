import { memo } from 'react';
import Message from './Message';

const MessageList = memo(({ 
  messages, 
  isDarkMode, 
  compactView, 
  onVisualize, 
  onSpeak, 
  activeMessageId 
}) => {
  return (
    <div className={`flex-1 overflow-y-auto p-4 ${compactView ? 'pt-0' : ''}`}>
      <div className="space-y-3">
        {messages.map((msg) => (
          <div key={msg.id || msg.timestamp || Math.random()} className="message-container">
            <Message 
              {...msg} 
              isDarkMode={isDarkMode} 
            />
            
            {/* Feature buttons for bot messages */}
            {!msg.isUser && msg.text && !msg.isImage && (
              <div className={`flex justify-end gap-2 mt-1 mr-2 transition-opacity duration-200 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <button
                  onClick={() => onVisualize(msg.id)}
                  disabled={activeMessageId === msg.id}
                  className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-600 text-blue-300' 
                      : 'hover:bg-gray-200 text-blue-600'
                  } ${activeMessageId === msg.id ? 'opacity-50' : ''}`}
                  aria-label="Generate visualization"
                >
                  <span>🖼️</span>
                  <span className="hidden sm:inline">Visualize</span>
                </button>
                
                <button
                  onClick={() => onSpeak(msg.id)}
                  disabled={activeMessageId === msg.id}
                  className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-600 text-green-300' 
                      : 'hover:bg-gray-200 text-green-600'
                  } ${activeMessageId === msg.id ? 'opacity-50' : ''}`}
                  aria-label="Convert to speech"
                >
                  <span>🔊</span>
                  <span className="hidden sm:inline">Hear</span>
                </button>
              </div>
            )}
            
            {/* Visualization display */}
            {msg.visualization && (
              <div className="mt-2 ml-12 transition-all duration-300 transform hover:scale-[1.01]">
                <img 
                  src={msg.visualization} 
                  alt="Visualization" 
                  className="max-w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

// Add display name for better debugging
MessageList.displayName = 'MessageList';

export default MessageList;