import { useState } from 'react';
import { novelExercises } from '../excercises/novelExercises.js';  // make sure this path is correct!!

export default function ChaptersPage({ onAskQuestion }) {
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const handleChapterSelect = (chapterKey) => {
    setSelectedChapter(chapterKey);
    const questions = novelExercises[chapterKey] || [];
    setSelectedQuestions(questions);
  };

  const handleQuestionClick = (question) => {
    if (onAskQuestion) {
      onAskQuestion(question);  // 🛠 SAFETY CHECK
    } else {
      console.warn("onAskQuestion not provided");
    }
  };

  const handleBack = () => {
    setSelectedChapter(null);
    setSelectedQuestions([]);
  };

  return (
    <div className="p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8"> Exercises 📚</h1>

      {/* If NO chapter is selected, show chapter buttons */}
      {selectedChapter === null && (
        <div className="flex flex-wrap gap-4 justify-center">
          {Array.from({ length: 12 }, (_, i) => (
            <button
              key={i}
              onClick={() => handleChapterSelect(`chapter${i + 1}`)}
              className="px-6 py-3 bg-[#7030a0] hover:bg-[#512b81] text-white rounded-lg text-lg font-semibold transition-all"
            >
              Chapter {i + 1} Exercises
            </button>
          ))}
          <button
            onClick={() => handleChapterSelect('general')}
            className="px-6 py-3 bg-[#7030a0] hover:bg-[#512b81] text-white rounded-lg text-lg font-semibold transition-all"
          >
            General Questions
          </button>
        </div>
      )}

      {/* If chapter is selected, show questions */}
      {selectedChapter !== null && (
        <div className="mt-8 w-full max-w-3xl flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-6">
            {selectedChapter === 'general'
              ? 'General Questions'
              : `Exercises - Chapter ${selectedChapter.replace('chapter', '')}`}
          </h2>

          {selectedQuestions.length > 0 ? (
            <div className="flex flex-col gap-4 w-full">
              {selectedQuestions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(q)}
                  className="p-4 bg-gradient-to-r from-[#7030a0] to-[#a678ff] text-white rounded-xl text-left hover:scale-105 transition-transform text-lg"
                >
                  {q}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No questions available for this chapter yet.</p>
          )}

          <button
            onClick={handleBack}
            className="mt-8 px-6 py-3 bg-gray-500 hover:bg-gray-700 text-white rounded-lg text-lg font-semibold"
          >
            ← Back to Chapters
          </button>
        </div>
      )}
    </div>
  );
}
