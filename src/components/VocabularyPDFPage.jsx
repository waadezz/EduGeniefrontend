import React, { useRef, useEffect, useState } from 'react';
import GenieImage from '../assets/Genie.png';

export default function VocabularyPDFPage({ unit, onBack, isDarkMode }) {
  const [sidebarInput, setSidebarInput] = useState("");
  const [sidebarMessages, setSidebarMessages] = useState([
    { text: "Hello! Ask me anything about the vocabulary in this unit ", isUser: false }
  ]);
  const messagesEndRef = useRef(null);

  const handleSend = () => {
    if (!sidebarInput.trim()) return;
    setSidebarMessages(prev => [...prev, { text: sidebarInput, isUser: true }]);
    setSidebarInput("");
    setTimeout(() => {
      setSidebarMessages(prev => [...prev, { text: `Answering "${sidebarInput}" (mock reply)`, isUser: false }]);
    }, 800);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sidebarMessages]);

  return (
    <div className="flex h-screen">
      {/* PDF Area */}
      <div className="flex-1 overflow-auto p-4 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#7030a0]">Unit {unit} Vocabulary PDF</h2>
          <button onClick={onBack} className="px-4 py-2 bg-[#7030a0] text-white rounded-lg hover:bg-[#512b81]"> Back</button>
        </div>
        <iframe
          src={`/vocabulary_pdfs/Unit_${unit}_Vocabulary_PDF.pdf`}
          title={`Unit ${unit} Vocabulary PDF`}
          className="w-full"
          style={{ height: '90vh' }}
        ></iframe>
      </div>

      {/* Sidebar Chat */}
      <div className="w-80 bg-white border-l-2 border-[#7030a0] p-4 flex flex-col">
        <div className="flex justify-center mb-4">
          <img src={GenieImage} alt="Genie" className="w-16 h-16" />
        </div>
        <h3 className="text-center text-xl font-bold text-[#7030a0] mb-4">Ask Genie</h3>
        <div className="flex-1 overflow-y-auto bg-[#f9f9f9] p-3 rounded-xl space-y-2">
          {sidebarMessages.map((msg, i) => (
            <div key={i} className={`p-2 rounded-lg ${msg.isUser ? 'bg-[#7030a0] text-white ml-auto' : 'bg-white text-black mr-auto shadow'}`}>
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            className="flex-1 p-2 border border-[#7030a0] rounded-lg"
            value={sidebarInput}
            onChange={(e) => setSidebarInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about vocabulary..."
          />
          <button onClick={handleSend} className="px-4 py-2 bg-[#7030a0] text-white rounded-lg">Send</button>
        </div>
      </div>
    </div>
  );
}