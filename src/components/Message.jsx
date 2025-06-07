import { useState, useEffect, memo } from 'react';

const Message = memo(({ 
  id,
  text, 
  isUser, 
  isDarkMode, 
  isImage = false, 
  imageUrl, 
  timestamp = new Date().toISOString()
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
                ? 'border-2 border-[#5d5d5d]'
                : 'border-2 border-[#7030a0]'
              : isDarkMode
              ? 'border-2 border-[#6d6d6d]'
              : 'border-2 border-[#f2f2f2]'
          }`}
        >
          {!imageLoaded && !imageError && (
            <div className="w-64 h-48 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Loading image...</span>
            </div>
          )}
          {imageError ? (
            <div className="w-64 h-48 flex items-center justify-center bg-red-100 dark:bg-red-900/30">
              <span className="text-red-500 dark:text-red-400">Failed to load image</span>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt="User uploaded content"
              className={`max-h-96 max-w-full object-contain transition-opacity duration-200 ${
                !imageLoaded ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
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