"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Volume2,
  Bookmark,
  Check,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Lesson, ThemeColor, UserProgress } from "@/types/material";
import { speakEnglish, playHaptic } from "@/lib/audio";

interface FlashcardModalProps {
  lesson: Lesson;
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  themeColor: ThemeColor;
  soundEnabled: boolean;
  onToggleMastered: (word: string) => void;
  onToggleBookmark: (word: string) => void;
}

export const FlashcardModal: React.FC<FlashcardModalProps> = ({
  lesson,
  isOpen,
  onClose,
  progress,
  soundEnabled,
  onToggleMastered,
  onToggleBookmark,
}) => {
  const vocab = lesson.vocabulary || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Reset index when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsFinished(false);
    }
  }, [isOpen, lesson.day_number]);

  const currentWord = vocab[currentIndex];

  const handleFlip = useCallback(() => {
    playHaptic("flip", soundEnabled);
    setIsFlipped((prev) => !prev);
  }, [soundEnabled]);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex < vocab.length - 1) {
      playHaptic("click", soundEnabled);
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all cards
      setIsFinished(true);
      playHaptic("success", soundEnabled);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.debug("Confetti error:", e);
      }
    }
  }, [currentIndex, vocab.length, soundEnabled]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      playHaptic("click", soundEnabled);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex, soundEnabled]);

  const handleMarkMastered = useCallback(() => {
    if (!currentWord) return;
    const isMastered = !!progress.masteredWords[`${lesson.day_number}_${currentWord.word}`];
    if (!isMastered) {
      onToggleMastered(currentWord.word);
    }
    playHaptic("success", soundEnabled);
    handleNext();
  }, [currentWord, lesson.day_number, progress.masteredWords, onToggleMastered, soundEnabled, handleNext]);

  const handleMarkLearning = useCallback(() => {
    if (!currentWord) return;
    const isMastered = !!progress.masteredWords[`${lesson.day_number}_${currentWord.word}`];
    if (isMastered) {
      onToggleMastered(currentWord.word);
    }
    playHaptic("pop", soundEnabled);
    handleNext();
  }, [currentWord, lesson.day_number, progress.masteredWords, onToggleMastered, soundEnabled, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || isFinished) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "1") {
        e.preventDefault();
        handleMarkLearning();
      } else if (e.key === "2") {
        e.preventDefault();
        handleMarkMastered();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFinished, handleFlip, handleNext, handlePrev, handleMarkLearning, handleMarkMastered, onClose]);

  // Auto pronounce word on card change
  useEffect(() => {
    if (isOpen && currentWord && !isFlipped && !isFinished) {
      speakEnglish(currentWord.word, progress.speechRate);
    }
  }, [isOpen, currentIndex, isFinished]);

  if (!isOpen) return null;

  const isMastered = currentWord
    ? !!progress.masteredWords[`${lesson.day_number}_${currentWord.word}`]
    : false;
  const isBookmarked = currentWord
    ? !!progress.bookmarkedWords[`${lesson.day_number}_${currentWord.word}`]
    : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-lg flex flex-col h-[640px] max-h-[92vh] ios-glass-floating rounded-[36px] p-6 shadow-2xl relative overflow-hidden border border-white/20 dark:border-white/10">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#007AFF]/15 text-[#007AFF] dark:text-[#389eff]">
              DAY {lesson.day_number} FLASHCARDS
            </span>
            <span className="text-xs text-neutral-500 font-medium">
              {currentIndex + 1} / {vocab.length}
            </span>
          </div>

          <button
            onClick={() => {
              playHaptic("click", soundEnabled);
              onClose();
            }}
            aria-label="Đóng flashcard"
            className="w-8 h-8 rounded-full bg-neutral-200/80 dark:bg-white/10 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-white/20 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-neutral-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mb-4">
          <div
            className="bg-[#007AFF] h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex + 1) / Math.max(1, vocab.length)) * 100}%` }}
          />
        </div>

        {/* Flashcard Area */}
        {!isFinished && currentWord ? (
          <div className="flex-1 flex flex-col justify-between">
            {/* 3D Card Container */}
            <div
              onClick={handleFlip}
              className="w-full flex-1 perspective-1000 cursor-pointer select-none my-2 group"
            >
              <div
                className={`w-full h-full relative transform-style-3d transition-transform duration-500 rounded-[28px] ${
                  isFlipped ? "rotate-y-180" : ""
                }`}
              >
                {/* FRONT OF CARD */}
                <div className="absolute inset-0 backface-hidden ios-glass-card rounded-[28px] p-6 sm:p-8 flex flex-col justify-between border border-black/10 dark:border-white/15 shadow-xl bg-gradient-to-b from-white/95 to-neutral-50/90 dark:from-[#242426]/95 dark:to-[#1c1c1e]/90">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-400"># {currentWord.index}</span>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          playHaptic("pop", soundEnabled);
                          onToggleBookmark(currentWord.word);
                        }}
                        className={`p-2 rounded-full transition-all ${
                          isBookmarked ? "text-amber-500 bg-amber-500/15" : "text-neutral-400 hover:text-neutral-600"
                        }`}
                        title="Đánh dấu từ"
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-amber-500" : ""}`} />
                      </button>
                      <button
                        onClick={() => {
                          playHaptic("click", soundEnabled);
                          speakEnglish(currentWord.word, progress.speechRate);
                        }}
                        className="p-2 rounded-full bg-[#007AFF]/15 text-[#007AFF] hover:bg-[#007AFF]/25 transition-all"
                        title="Phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Word Content */}
                  <div className="text-center my-auto space-y-3">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
                      {currentWord.word}
                    </h2>
                    {currentWord.part_of_speech && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-300">
                        {currentWord.part_of_speech}
                      </span>
                    )}
                    {currentWord.pronunciation && (
                      <p className="text-base font-mono text-[#007AFF] dark:text-[#389eff]">
                        {currentWord.pronunciation}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 font-medium">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Chạm vào thẻ hoặc nhấn Space để lật</span>
                  </div>
                </div>

                {/* BACK OF CARD */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 ios-glass-card rounded-[28px] p-6 sm:p-8 flex flex-col justify-between border border-black/10 dark:border-white/15 shadow-xl bg-gradient-to-b from-white/95 to-neutral-50/90 dark:from-[#242426]/95 dark:to-[#1c1c1e]/90 overflow-y-auto no-scrollbar">
                  <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
                    <span className="text-xs font-bold text-[#007AFF]">Nghĩa & Ngữ cảnh</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakEnglish(currentWord.word, progress.speechRate);
                      }}
                      className="p-1.5 rounded-full bg-[#007AFF]/15 text-[#007AFF]"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="my-auto py-3 space-y-3">
                    <p className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white text-center">
                      {currentWord.meaning || "(Chưa có nghĩa cụ thể)"}
                    </p>

                    {currentWord.collocations && currentWord.collocations.length > 0 && (
                      <div className="text-xs bg-blue-500/10 dark:bg-blue-500/20 p-3 rounded-2xl text-left space-y-1">
                        <span className="font-bold text-[#007AFF]">Collocations:</span>
                        {currentWord.collocations.map((c, idx) => (
                          <p key={idx} className="text-neutral-700 dark:text-neutral-200">
                            • {c}
                          </p>
                        ))}
                      </div>
                    )}

                    {currentWord.examples && currentWord.examples.length > 0 && (
                      <div className="text-xs bg-neutral-100 dark:bg-white/5 p-3 rounded-2xl text-left space-y-1">
                        <span className="font-bold text-neutral-600 dark:text-neutral-300">Ví dụ:</span>
                        {currentWord.examples.map((ex, idx) => (
                          <p key={idx} className="italic text-neutral-700 dark:text-neutral-300">
                            &ldquo;{ex}&rdquo;
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-1 text-xs text-neutral-400 font-medium">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Chạm để lật lại mặt trước</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer Controls */}
            <div className="pt-3 space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-3 rounded-2xl bg-neutral-100 dark:bg-white/10 disabled:opacity-30 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-white/20 transition-all"
                  title="Từ trước (Mũi tên trái)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={handleMarkLearning}
                  className="flex-1 py-3 px-4 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-[0.98] text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/20 transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5"
                >
                  <span>Chưa thuộc (Phím 1)</span>
                </button>

                <button
                  onClick={handleMarkMastered}
                  className="flex-1 py-3 px-4 rounded-2xl bg-[#007AFF] hover:bg-[#0071eb] active:scale-[0.98] text-white font-semibold shadow-md shadow-[#007AFF]/25 transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Đã nhớ (Phím 2)</span>
                </button>

                <button
                  onClick={handleNext}
                  className="p-3 rounded-2xl bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-white/20 transition-all"
                  title="Từ tiếp (Mũi tên phải)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-400">
                <span>Phím tắt: [Space] Lật • [1] Ôn lại • [2] Đã nhớ</span>
              </div>
            </div>
          </div>
        ) : (
          /* Finished Screen */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-amber-400/20 text-amber-500 flex items-center justify-center shadow-xl">
              <Trophy className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                Hoàn thành Flashcard!
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs">
                Bạn đã duyệt qua toàn bộ từ vựng của DAY {lesson.day_number}. Hãy tiếp tục với phần bài tập luyện tập!
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 w-full max-w-xs">
              <button
                onClick={() => {
                  playHaptic("pop", soundEnabled);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                  setIsFinished(false);
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-neutral-200/80 dark:bg-white/10 hover:bg-neutral-300 font-semibold text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 transition-all"
              >
                Ôn lại từ đầu
              </button>

              <button
                onClick={() => {
                  playHaptic("click", soundEnabled);
                  onClose();
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#007AFF] hover:bg-[#0071eb] font-semibold text-xs sm:text-sm text-white shadow-md shadow-[#007AFF]/30 transition-all"
              >
                Xong
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
