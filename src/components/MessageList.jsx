import React, { memo } from 'react';

const MessageList = memo(({
  messages,
  isDarkMode,
  compactView = false,
  onVisualize,
  onSpeak,
  activeMessageId,
}) => {
  return (
    <div className="flex-1 overflow-y-auto px-2 pb-2">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`mb-3 flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`rounded-xl px-4 py-2 max-w-[75%] break-words shadow ${
              msg.isUser
                ? isDarkMode
                  ? 'bg-[#7030a0] text-white'  // Dark mode user message (purple)
                  : 'bg-[#7030a0] text-white'  // Light mode user message (purple)
                : isDarkMode
                ? 'bg-[#333] text-gray-100'    // Dark mode bot message
                : 'bg-white text-[#012060]'     // Light mode bot message
            } ${activeMessageId === msg.id ? 'ring-2 ring-[#a078c9]' : ''}`}
          >
            {msg.isImage && msg.imageUrl ? (
              <img
                src={msg.imageUrl}
                alt="Uploaded"
                className="max-w-xs max-h-60 rounded-lg mb-2"
              />
            ) : (
              <span>{msg.text}</span>
            )}

            {/* Show buttons for bot messages that aren't images */}
            {!msg.isUser && !msg.isImage && (
              <div className="flex justify-end space-x-2 mt-2">
                {msg.hasVisualization && (
                  <button
                    onClick={() => onVisualize?.(msg.id, msg.originalQuestion || msg.text)}
                    disabled={activeMessageId === msg.id}
                    className={`px-3 py-1 rounded-md text-sm ${isDarkMode ? 'bg-[#5d5d5d] hover:bg-[#6d6d6d]' : 'bg-[#7030a0] hover:bg-[#5a2580] text-white'} ${activeMessageId === msg.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {activeMessageId === msg.id ? 'Visualizing...' : 'Visualize'}
                  </button>
                )}
                <button
                  onClick={() => onSpeak?.(msg.id)}
                  disabled={activeMessageId === msg.id}
                  className={`px-3 py-1 rounded-md text-sm ${isDarkMode ? 'bg-[#5d5d5d] hover:bg-[#6d6d6d]' : 'bg-[#7030a0] hover:bg-[#5a2580] text-white'} ${activeMessageId === msg.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {activeMessageId === msg.id ? 'Speaking...' : 'Speak'}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

// Add display name for better debugging
MessageList.displayName = 'MessageList';

export default MessageList;