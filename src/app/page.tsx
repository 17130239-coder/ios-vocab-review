"use client";

import React, { useState, useEffect } from "react";
import rawMaterialData from "@/data/material.json";
import { MaterialData, Lesson, UserProgress } from "@/types/material";
import {
  loadUserProgress,
  saveUserProgress,
  calculateDailyStreak,
} from "@/lib/storage";
import { playHaptic, speakEnglish } from "@/lib/audio";
import { ZenFlashcardModal } from "@/components/ZenFlashcardModal";
import { Volume2, Layers, ArrowUpRight, Check } from "lucide-react";

const materialData = rawMaterialData as unknown as MaterialData;
const lessons: Lesson[] = materialData.lessons || [];

export default function HomePage() {
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);

  // User progress
  const [progress, setProgress] = useState<UserProgress>(() => {
    if (typeof window !== "undefined") {
      const initial = loadUserProgress();
      const updatedStreak = calculateDailyStreak(initial.streak, initial.lastActiveDate);
      return {
        ...initial,
        streak: updatedStreak,
        lastActiveDate: new Date().toISOString().split("T")[0],
      };
    }
    return {
      masteredWords: {},
      bookmarkedWords: {},
      completedExercises: {},
      completedDays: {},
      streak: 1,
      lastActiveDate: new Date().toISOString().split("T")[0],
      themeColor: "blue",
      appearance: "auto",
      soundEnabled: true,
      speechRate: 0.95,
    };
  });

  useEffect(() => {
    saveUserProgress(progress);
  }, [progress]);

  const currentLesson = lessons.find((l) => l.day_number === selectedDay) || lessons[0];
  const vocab = currentLesson?.vocabulary || [];
  const masteredInDay = vocab.filter(
    (v) => progress.masteredWords[`${currentLesson.day_number}_${v.word}`]
  ).length;

  const handleToggleMastered = (word: string) => {
    const key = `${currentLesson.day_number}_${word}`;
    setProgress((prev) => {
      const next = { ...prev.masteredWords, [key]: !prev.masteredWords[key] };
      return { ...prev, masteredWords: next };
    });
  };

  const handleSelectDay = (dayNum: number) => {
    playHaptic("click", progress.soundEnabled);
    setSelectedDay(dayNum);
  };

  const handlePlayAudio = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    playHaptic("click", progress.soundEnabled);
    speakEnglish(word, progress.speechRate);
  };

  return (
    <div className="font-sans antialiased min-h-screen flex flex-col justify-between selection:bg-[#0066CC]/10 selection:text-[#0066CC] bg-[#F9F9FB] dark:bg-[#0d0d0e] text-[#161618] dark:text-[#f4f4f5]">
      {/* Minimal Header */}
      <header className="sticky top-0 z-30 bg-[#F9F9FB]/80 dark:bg-[#0d0d0e]/80 backdrop-blur-xl border-b border-black/[0.04] dark:border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="text-sm font-semibold tracking-tight text-[#161618] dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0066CC]"></span>
            <span>TOEIC Prep</span>
          </div>
          <div className="text-xs font-medium text-[#6E6E73] dark:text-neutral-400 tracking-wide">
            35 Days Vocabulary
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="w-full max-w-3xl mx-auto px-6 py-8 sm:py-12 flex-1">
        {/* Day Pill Timeline Rail (Zen Minimalist) */}
        <nav aria-label="Lịch học" className="mb-10">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {lessons.map((lesson) => {
              const isActive = lesson.day_number === selectedDay;
              return (
                <button
                  key={lesson.day_number}
                  onClick={() => handleSelectDay(lesson.day_number)}
                  className={`shrink-0 transition-all ${
                    isActive
                      ? "px-4 py-1.5 rounded-full bg-[#161618] dark:bg-white text-white dark:text-black text-xs font-semibold tracking-tight shadow-sm"
                      : "px-3 py-1.5 rounded-full text-xs font-medium text-[#6E6E73] dark:text-neutral-400 hover:text-[#161618] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/10"
                  }`}
                >
                  Day {lesson.day_number}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Zen Hero Section */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#161618] dark:text-white mb-1.5">
                Day {currentLesson.day_number}
              </h1>
              <p className="text-sm font-medium text-[#6E6E73] dark:text-neutral-400">
                Chương trình cốt lõi •{" "}
                <span className="text-[#161618] dark:text-white font-semibold">
                  {vocab.length} từ vựng
                </span>
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F2F2F6] dark:bg-white/10 text-[#6E6E73] dark:text-neutral-300 text-xs font-medium self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>
                Tiến độ:{" "}
                <strong className="text-[#161618] dark:text-white font-semibold">
                  {masteredInDay}/{vocab.length} từ
                </strong>
              </span>
            </div>
          </div>

          {/* Hero Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playHaptic("pop", progress.soundEnabled);
                setIsFlashcardOpen(true);
              }}
              type="button"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#161618] dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-[#161618]/90 dark:hover:bg-neutral-100 active:scale-[0.98] transition-all shadow-sm"
            >
              <Layers className="w-4 h-4" />
              <span>Ôn tập</span>
            </button>

            {currentLesson.quizizz?.url && (
              <a
                href={currentLesson.quizizz.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playHaptic("click", progress.soundEnabled)}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-white dark:bg-[#161618] text-[#161618] dark:text-white text-sm font-medium border border-black/[0.06] dark:border-white/[0.1] hover:bg-[#F2F2F6] dark:hover:bg-white/5 active:scale-[0.98] transition-all shadow-sm"
              >
                <span>Quizizz</span>
                <ArrowUpRight className="w-4 h-4 text-[#8E8E93]" />
              </a>
            )}
          </div>
        </section>

        {/* Clean Flat Vocabulary List (iOS 18 Inset Flat Style) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8E8E93] dark:text-neutral-500">
              Danh sách từ
            </span>
            <span className="text-xs font-normal text-[#8E8E93] dark:text-neutral-500">
              Chạm vào biểu tượng loa để nghe
            </span>
          </div>

          <div className="bg-white dark:bg-[#161618] rounded-2xl border border-black/[0.05] dark:border-white/[0.08] divide-y divide-black/[0.04] dark:divide-white/[0.06] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            {vocab.map((item, idx) => {
              const isMastered = !!progress.masteredWords[`${currentLesson.day_number}_${item.word}`];

              return (
                <div
                  key={idx}
                  onClick={() => handleToggleMastered(item.word)}
                  className="flex items-center justify-between px-5 py-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.02] transition-colors group cursor-pointer"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-baseline gap-2.5 flex-wrap">
                      <span
                        className={`text-base sm:text-lg font-semibold tracking-tight transition-colors ${
                          isMastered
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-[#161618] dark:text-white"
                        }`}
                      >
                        {item.word}
                      </span>
                      {item.part_of_speech && (
                        <span className="text-[11px] font-medium text-[#6E6E73] dark:text-neutral-400 bg-[#F2F2F6] dark:bg-white/10 px-1.5 py-0.5 rounded">
                          {item.part_of_speech}
                        </span>
                      )}
                      {item.pronunciation && (
                        <span className="text-xs font-normal text-[#8E8E93] dark:text-neutral-500 tracking-normal">
                          {item.pronunciation}
                        </span>
                      )}
                      {isMastered && (
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          <span>Đã thuộc</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#6E6E73] dark:text-neutral-400 mt-0.5">
                      {item.meaning || "(Chưa có nghĩa)"}
                    </p>
                  </div>

                  <button
                    aria-label={`Phát âm ${item.word}`}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-[#0066CC] hover:bg-[#EBF3FB] dark:hover:bg-white/10 active:scale-90 transition-all shrink-0"
                    onClick={(e) => handlePlayAudio(e, item.word)}
                    type="button"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Clean Zen Minimalist Footer */}
      <footer className="w-full py-8 text-center border-t border-black/[0.03] dark:border-white/[0.06]">
        <p className="text-xs text-[#8E8E93] dark:text-neutral-500">
          Day {currentLesson.day_number} • Tự học &amp; ôn luyện TOEIC
        </p>
      </footer>

      {/* Zen Flashcard Modal */}
      <ZenFlashcardModal
        lesson={currentLesson}
        isOpen={isFlashcardOpen}
        onClose={() => setIsFlashcardOpen(false)}
        progress={progress}
        onToggleMastered={handleToggleMastered}
      />
    </div>
  );
}
