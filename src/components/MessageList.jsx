// MessageList.jsx
import React, { memo } from 'react';

const MessageList = memo(({
  messages,
  isDarkMode,
  compactView = false,
  onVisualize,
  onSpeak,
  visualizingMessageId,
  speakingMessageId,
  playingAudioId,
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
                  ? 'bg-[#7030a0] text-white'
                  : 'bg-[#7030a0] text-white'
                : isDarkMode
                ? 'bg-[#333] text-gray-100'
                : 'bg-white text-[#012060]'
            }`}
          >
            {msg.isImage && msg.imageUrl ? (
              <img
                src={msg.imageUrl}
                alt="Uploaded"
                className="max-w-xs max-h-60 rounded-lg mb-2"
              />
            ) : (
              <div className="whitespace-pre-line">
                {msg.text.split('\n').map((line, idx, arr) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Show buttons for bot messages that aren't images */}
            {!msg.isUser && !msg.isImage && (
              <div className="flex justify-end space-x-2 mt-2">
                {msg.hasVisualization && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onVisualize?.(msg.id, msg.originalQuestion || msg.text);
                    }}
                    disabled={!!visualizingMessageId}
                    className={`px-3 py-1 rounded-md text-sm ${
                      isDarkMode 
                        ? 'bg-[#5d5d5d] hover:bg-[#6d6d6d]' 
                        : 'bg-[#7030a0] hover:bg-[#5a2580] text-white'
                    } ${
                      visualizingMessageId === msg.id 
                        ? 'opacity-50 cursor-not-allowed' 
                        : ''
                    }`}
                  >
                    {visualizingMessageId === msg.id ? 'Visualizing...' : 'Visualize'}
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSpeak?.(msg.id);
                  }}
                  disabled={!!speakingMessageId}
                  className={`px-3 py-1 rounded-md text-sm ${
                    isDarkMode 
                      ? 'bg-[#5d5d5d] hover:bg-[#6d6d6d] text-gray-200' 
                      : 'bg-[#7030a0] hover:bg-[#5a2580] text-white'
                  } ${
                    speakingMessageId === msg.id 
                      ? 'opacity-70' 
                      : playingAudioId === msg.id 
                        ? 'audio-playing' 
                        : ''
                  }`}
                  title="Listen to this message"
                >
                  🔊
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

MessageList.displayName = 'MessageList';

export default MessageList;