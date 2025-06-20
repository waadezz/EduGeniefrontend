import { useRef } from 'react';

const ChatInput = ({ value, onChange, onSend, isDarkMode, onImageUpload }) => {
  const fileInputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(value)
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImageUpload(file);
      // Reset the file input to allow selecting the same file again
      e.target.value = null;
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex gap-2">
        <button
          className={`p-3 rounded-lg ${isDarkMode ? 'bg-[#5d5d5d] hover:bg-[#6d6d6d]' : 'bg-white hover:bg-gray-100'} border ${isDarkMode ? 'border-[#6d6d6d]' : 'border-[#7030a0]'}`}
          onClick={() => fileInputRef.current.click()}
          type="button"
          title="Upload image"
        >
          📷
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        <textarea
          className={`flex-1 border-2 rounded-xl p-3 text-lg focus:outline-none placeholder-gray-400 ${isDarkMode
              ? 'bg-[#5d5d5d] border-[#6d6d6d] text-[#f2f2f2] focus:border-[#7030a0]'
              : 'bg-white border-[#7030a0] text-[#012060] focus:border-[#012060]'
            }`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows="3"
        />
        <button
          className={`px-6 py-3 rounded-xl text-white transition duration-300 ${isDarkMode ? 'bg-[#7030a0] hover:bg-[#5d5d5d]' : 'bg-[#7030a0] hover:bg-[#012060]'
            }`}
          onClick={onSend}
          disabled={!value.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
