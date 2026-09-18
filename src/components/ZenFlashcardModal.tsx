"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Volume2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Lesson, UserProgress } from "@/types/material";
import { speakEnglish, playHaptic } from "@/lib/audio";

interface ZenFlashcardModalProps {
  lesson: Lesson;
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onToggleMastered: (word: string) => void;
}

export const ZenFlashcardModal: React.FC<ZenFlashcardModalProps> = ({
  lesson,
  isOpen,
  onClose,
  progress,
  onToggleMastered,
}) => {
  const vocab = lesson.vocabulary || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [isOpen, lesson.day_number]);

  const currentWord = vocab[currentIndex];

  const handleFlip = useCallback(() => {
    playHaptic("flip", progress.soundEnabled);
    setIsFlipped((prev) => !prev);
  }, [progress.soundEnabled]);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex < vocab.length - 1) {
      playHaptic("click", progress.soundEnabled);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, vocab.length, progress.soundEnabled]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      playHaptic("click", progress.soundEnabled);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex, progress.soundEnabled]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

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
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleFlip, handleNext, handlePrev, onClose]);

  // Auto pronounce
  useEffect(() => {
    if (isOpen && currentWord && !isFlipped) {
      speakEnglish(currentWord.word, progress.speechRate);
    }
  }, [isOpen, currentIndex]);

  if (!isOpen || !currentWord) return null;

  const isMastered = !!progress.masteredWords[`${lesson.day_number}_${currentWord.word}`];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-[#161618] rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/[0.06] dark:border-white/[0.08] flex flex-col justify-between min-h-[420px]">
        {/* Top Header */}
        <div className="flex items-center justify-between text-xs text-[#6E6E73] dark:text-neutral-400">
          <span className="font-medium">
            Day {lesson.day_number} • {currentIndex + 1} / {vocab.length}
          </span>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="w-7 h-7 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/10 flex items-center justify-center text-[#6E6E73] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Body */}
        <div
          onClick={handleFlip}
          className="my-auto py-8 text-center cursor-pointer select-none space-y-3"
        >
          {!isFlipped ? (
            <div className="space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#161618] dark:text-white">
                  {currentWord.word}
                </h2>
                {currentWord.part_of_speech && (
                  <span className="text-xs font-medium text-[#6E6E73] bg-[#F2F2F6] dark:bg-white/10 px-2 py-0.5 rounded">
                    {currentWord.part_of_speech}
                  </span>
                )}
              </div>
              {currentWord.pronunciation && (
                <p className="text-sm font-normal text-[#8E8E93]">{currentWord.pronunciation}</p>
              )}
              <div className="pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakEnglish(currentWord.word, progress.speechRate);
                  }}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#F2F2F6] dark:bg-white/10 hover:bg-[#EBF3FB] text-[#0066CC] transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[#8E8E93] pt-4 font-normal">Chạm hoặc nhấn Space để xem nghĩa</p>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-200">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0066CC]">
                Ý Nghĩa
              </span>
              <p className="text-2xl font-bold text-[#161618] dark:text-white">
                {currentWord.meaning || "(Chưa có nghĩa)"}
              </p>
              {currentWord.collocations?.length > 0 && (
                <div className="text-xs text-[#6E6E73] dark:text-neutral-400 max-w-xs mx-auto text-left pt-2 space-y-1">
                  {currentWord.collocations.slice(0, 2).map((col, idx) => (
                    <p key={idx}>• {col}</p>
                  ))}
                </div>
              )}
              <p className="text-xs text-[#8E8E93] pt-4 font-normal">Chạm để lật lại từ vựng</p>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-4 border-t border-black/[0.04] dark:border-white/[0.06]">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/[0.05] dark:hover:bg-white/10 disabled:opacity-20 text-[#161618] dark:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              playHaptic("pop", progress.soundEnabled);
              onToggleMastered(currentWord.word);
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              isMastered
                ? "bg-emerald-500 text-white shadow-sm"
                : "bg-[#F2F2F6] dark:bg-white/10 text-[#161618] dark:text-white hover:bg-emerald-50 hover:text-emerald-600"
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isMastered ? "Đã thuộc" : "Đánh dấu đã thuộc"}</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === vocab.length - 1}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/[0.05] dark:hover:bg-white/10 disabled:opacity-20 text-[#161618] dark:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
