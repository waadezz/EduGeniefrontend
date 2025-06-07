import { useState } from 'react';

export default function NovelReader({ onBack }) {
  const [currentChapter, setCurrentChapter] = useState(1);

  const goToPreviousChapter = () => {
    setCurrentChapter((c) => Math.max(1, c - 1));
  };

  const goToNextChapter = () => {
    setCurrentChapter((c) => Math.min(12, c + 1));
  };

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={onBack}>← Back to Menu</button>

      <h2>Great Expectations - Chapter {currentChapter}</h2>

      <iframe
        src={`/novels/great-expectations/chapter${currentChapter}.pdf`}
        width="100%"
        height="600px"
        title={`Chapter ${currentChapter}`}
      />

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button onClick={goToPreviousChapter} disabled={currentChapter === 1}>
          ← Previous Chapter
        </button>
        <button onClick={goToNextChapter} disabled={currentChapter === 12}>
          Next Chapter →
        </button>
      </div>
    </div>
  );
}
