import { useState, useEffect, memo } from 'react';

const Message = memo(({ 
  id,
  text, 
  isUser, 
  isDarkMode, 
  isImage = false, 
  imageUrl, 
  timestamp = new Date().toISOString(),
  showActions = false,
  onVisualize,
  onSpeak,
  isActive = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [messageTime, setMessageTime] = useState('');

  // Memoize the formatted time
  useEffect(() => {
    const formattedTime = new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    setMessageTime(formattedTime);
  }, [timestamp]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (isImage && imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [isImage, imageUrl]);

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);

  if (isImage) {
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
        <div
          className={`max-w-[90%] rounded-xl overflow-hidden transition-all duration-200 ${
            isUser
              ? isDarkMode
                ? 'border-2 border-[#5d5d5d] bg-[#5d5d5d] p-2'
                : 'border-2 border-[#7030a0] bg-white p-2'
              : isDarkMode
              ? 'border-2 border-[#6d6d6d] bg-[#6d6d6d] p-2'
              : 'border-2 border-[#f2f2f2] bg-white p-2'
          }`}
        >
          <div className="max-w-full max-h-96 overflow-hidden flex items-center justify-center">
            <img
              src={imageUrl}
              alt="User uploaded content"
              className="max-h-96 max-w-full object-contain rounded-lg"
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          </div>
          {showActions && !isUser && (
            <div className="flex justify-end space-x-2 mt-2">
             // In Message.jsx, update the Visualize button:
<button
  onClick={() => onVisualize && onVisualize(id)}
  disabled={isActive}
  className={`px-3 py-1 rounded-md text-sm ${
    isDarkMode 
      ? 'bg-[#5d5d5d] hover:bg-[#6d6d6d]' 
      : 'bg-[#7030a0] hover:bg-[#5a2580] text-white'
  } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
>
  {isActive ? 'Visualizing...' : 'Visualize'}
</button>
              <button
                onClick={() => onSpeak && onSpeak(id)}
                disabled={isActive}
                className={`px-3 py-1 rounded-md text-sm ${isDarkMode ? 'bg-[#5d5d5d] hover:bg-[#6d6d6d]' : 'bg-[#7030a0] hover:bg-[#5a2580] text-white'} ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isActive ? 'Speaking...' : 'Speak'}
              </button>
            </div>
          )}
        </div>
        <span className={`text-xs mt-1 mx-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {messageTime}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
      <div className="flex flex-col max-w-[90%] transition-all duration-200">
        <div
          className={`p-4 rounded-xl whitespace-pre-line break-words ${
            isUser
              ? isDarkMode
                ? 'bg-[#5d5d5d] text-[#f2f2f2] rounded-br-none' 
                : 'bg-[#7030a0] text-white rounded-br-none'
              : isDarkMode
              ? 'bg-[#6d6d6d] text-[#f2f2f2] rounded-bl-none'
              : 'bg-[#f2f2f2] text-[#012060] rounded-bl-none'
          }`}
        >
          {text}
        </div>
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mt-1`}>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {messageTime}
          </span>
        </div>
      </div>
    </div>
  );
});

// Add display name for better debugging
Message.displayName = 'Message';

export default Message;