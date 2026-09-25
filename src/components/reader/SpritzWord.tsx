import React from 'react';

interface SpritzWordProps {
  word: string;
  fontSize?: number;
}

// Spritz focal point: the optimal recognition point (ORP)
// roughly at 1/3 of the word length from the start
function getOrpIndex(word: string): number {
  const cleanWord = word.replace(/[^a-zA-ZÀ-ÿ]/g, '');
  const len = cleanWord.length;
  if (len <= 1) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  if (len <= 13) return 3;
  return 4;
}

// Split word into before, focal, after parts
function splitWordAtOrp(word: string): { before: string; focal: string; after: string } {
  const orpIdx = getOrpIndex(word);
  // Count only letter characters for ORP, but split the full string
  let letterCount = 0;
  let splitPos = 0;

  for (let i = 0; i < word.length; i++) {
    if (/[a-zA-ZÀ-ÿ]/.test(word[i])) {
      if (letterCount === orpIdx) {
        splitPos = i;
        break;
      }
      letterCount++;
    }
  }

  return {
    before: word.slice(0, splitPos),
    focal: word.slice(splitPos, splitPos + 1),
    after: word.slice(splitPos + 1),
  };
}

const SpritzWord: React.FC<SpritzWordProps> = ({ word, fontSize = 48 }) => {
  const { before, focal, after } = splitWordAtOrp(word);

  return (
    <div
      className="flex items-baseline justify-center"
      style={{ fontSize: `${fontSize}px`, lineHeight: 1.2 }}
    >
      {/* Left part */}
      <span
        className="text-ink font-bold tracking-tight text-right"
        style={{ minWidth: `${fontSize * 3}px`, display: 'inline-block' }}
      >
        {before}
      </span>

      {/* Focal letter - highlighted in red (token --color-spritz-focal) */}
      <span
        className="font-bold tracking-tight text-spritz-focal"
        style={{ display: 'inline-block' }}
      >
        {focal}
      </span>

      {/* Right part */}
      <span
        className="text-ink font-bold tracking-tight text-left"
        style={{ minWidth: `${fontSize * 3}px`, display: 'inline-block' }}
      >
        {after}
      </span>
    </div>
  );
};

export default SpritzWord;
