import React from 'react';
import GenieImage from '../assets/Genie.png';

export default function WelcomePage({ onStartChatting, onViewCurriculum }) {
  return (
    <div className="bg-gradient-to-r from-[#f2f2f2] to-[#7030a0] w-full h-screen flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full flex flex-col items-center space-y-12 px-8">
        
        {/* Title and Genie Image */}
        <div className="flex items-center gap-4">
          <h1 className="text-8xl font-bold text-[#012060] animate-bounce">
            EDU-<span className="text-[#7030a0]">GENIE!</span>
          </h1>
          <img
            src={GenieImage}
            alt="Genie"
            className="w-24 h-24 object-contain animate-bounce"
          />
        </div>

        {/* Subtitle */}
        <p className="text-3xl text-[#012060] font-semibold text-center animate-fade-in">
          Your AI-Powered Learning Companion
        </p>

        {/* Description */}
        <div className="flex flex-col space-y-6 text-center max-w-4xl">
          <p className="text-xl text-[#012060]">
            Welcome to <span className="font-bold text-[#7030a0]">EduGenie</span>, your intelligent chatbot designed to make learning fun, interactive, and effortless.
          </p>
          <p className="text-xl text-[#012060]">
            Whether you need help with homework, study tips, or just want to explore new topics, I'm here to guide you every step of the way!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-8 mt-8">
          <button
            className="cursor-pointer hover:scale-105 duration-300 transition py-4 px-12 rounded-3xl bg-[#7030a0] text-white text-2xl font-semibold shadow-lg hover:bg-[#012060] animate-pulse"
            onClick={onViewCurriculum}
          >
            View Curriculum
          </button>
          <button
            className="cursor-pointer hover:scale-105 duration-300 transition py-4 px-12 rounded-3xl bg-[#012060] text-white text-2xl font-semibold shadow-lg hover:bg-[#7030a0] animate-pulse"
            onClick={onStartChatting}
          >
            Start Chatting
          </button>
        </div>

        {/* Decorative Dot */}
        <div className="mt-16 flex justify-center animate-pulse">
          <div className="w-16 h-16 bg-[#7030a0] rounded-full" />
        </div>
      </div>
    </div>
  );
}
