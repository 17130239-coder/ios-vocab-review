"use client";

import React, { useState, useEffect, useRef } from "react";
import rawMaterialData from "@/data/material.json";
import { MaterialData, Lesson, UserProgress } from "@/types/material";
import {
  loadUserProgress,
  saveUserProgress,
  calculateDailyStreak,
} from "@/lib/storage";
import { playHaptic, speakEnglish, stopSpeaking } from "@/lib/audio";
import { FocusCardsView } from "@/components/FocusCardsView";
import { FlashcardModal } from "@/components/FlashcardModal";
import { ExerciseSession } from "@/components/ExerciseSession";
import { JourneyView } from "@/components/JourneyView";
import { StatsView } from "@/components/StatsView";
import { SettingsModal } from "@/components/SettingsModal";
import { TabBar, TabKey } from "@/components/TabBar";
import {
  Volume2,
  Settings,
  Flame,
  CheckCircle2,
  Square,
  Sparkles,
} from "lucide-react";

const materialData = rawMaterialData as unknown as MaterialData;
const lessons: Lesson[] = materialData.lessons || [];

export default function HomePage() {
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<TabKey>("words"); // "words" maps to Focus Cards
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAutoPlayingAudio, setIsAutoPlayingAudio] = useState(false);
  const autoPlayCancelRef = useRef(false);

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

  // Apply dark mode
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (progress.appearance === "dark") {
      document.documentElement.classList.add("dark");
    } else if (progress.appearance === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [progress.appearance]);

  const currentLesson = lessons.find((l) => l.day_number === selectedDay) || lessons[0];
  const vocab = currentLesson?.vocabulary || [];
  const masteredInDay = vocab.filter(
    (v) => progress.masteredWords[`${currentLesson.day_number}_${v.word}`]
  ).length;

  // Handlers
  const handleToggleMastered = (word: string) => {
    const key = `${currentLesson.day_number}_${word}`;
    setProgress((prev) => {
      const next = { ...prev.masteredWords, [key]: !prev.masteredWords[key] };
      return { ...prev, masteredWords: next };
    });
  };

  const handleToggleBookmark = (word: string, dayNum: number = currentLesson.day_number) => {
    const key = `${dayNum}_${word}`;
    setProgress((prev) => {
      const next = { ...prev.bookmarkedWords, [key]: !prev.bookmarkedWords[key] };
      return { ...prev, bookmarkedWords: next };
    });
  };

  const handleSetExerciseCompleted = (qNum: number, completed: boolean) => {
    const key = `${currentLesson.day_number}_${qNum}`;
    setProgress((prev) => {
      const next = { ...prev.completedExercises, [key]: completed };
      return { ...prev, completedExercises: next };
    });
  };

  const handleResetProgress = () => {
    const resetData: UserProgress = {
      ...progress,
      masteredWords: {},
      bookmarkedWords: {},
      completedExercises: {},
      completedDays: {},
      streak: 1,
      lastActiveDate: new Date().toISOString().split("T")[0],
    };
    setProgress(resetData);
    saveUserProgress(resetData);
    playHaptic("pop", progress.soundEnabled);
  };

  // Sequential Listen All words feature (from Stitch design)
  const handleQuickListenAll = async () => {
    if (isAutoPlayingAudio) {
      autoPlayCancelRef.current = true;
      setIsAutoPlayingAudio(false);
      stopSpeaking();
      return;
    }

    if (vocab.length === 0) return;

    playHaptic("pop", progress.soundEnabled);
    setIsAutoPlayingAudio(true);
    autoPlayCancelRef.current = false;

    for (let i = 0; i < vocab.length; i++) {
      if (autoPlayCancelRef.current) break;
      await speakEnglish(vocab[i].word, progress.speechRate);
      if (autoPlayCancelRef.current) break;
      // Wait 1.1s between words
      await new Promise((res) => setTimeout(res, 1100));
    }

    setIsAutoPlayingAudio(false);
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#09090b] text-[#0f172a] dark:text-[#f8fafc] transition-colors duration-300">
      {/* Minimal iOS Top App Header (Stitch Design) */}
      <header className="sticky top-0 z-40 frosted-glass border-b border-slate-200/60 dark:border-white/10 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab("words")}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-[#0058bc] text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-[#0058bc]/30">
              T
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-none">
                TOEIC Focus
              </h1>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                iOS 18 Focus Mode
              </span>
            </div>
          </div>

          {/* Quick Status & Voice Mode Pill */}
          <div className="flex items-center gap-2">
            {/* Streak flame badge */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span>{progress.streak}d streak</span>
            </div>

            {/* Quick Listen All Button */}
            <button
              onClick={handleQuickListenAll}
              className={`h-8 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isAutoPlayingAudio
                  ? "bg-rose-500/15 text-rose-600 border border-rose-500/30"
                  : "bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200"
              }`}
              title={isAutoPlayingAudio ? "Dừng đọc" : "Đọc lần lượt các từ"}
            >
              {isAutoPlayingAudio ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-rose-600" />
                  <span>Dừng</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#0058bc]" />
                  <span>Nghe toàn bộ</span>
                </>
              )}
            </button>

            {/* Learned Count Pill */}
            <div className="h-8 px-3 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>
                {masteredInDay}/{vocab.length} từ
              </span>
            </div>

            {/* Settings button */}
            <button
              onClick={() => {
                playHaptic("click", progress.soundEnabled);
                setIsSettingsOpen(true);
              }}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors"
              title="Cài đặt"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 w-full animate-in fade-in duration-300 pb-20">
        {activeTab === "words" ? (
          /* iOS 18 Focus Cards (Exact Stitch Design) */
          <FocusCardsView
            lessons={lessons}
            currentLesson={currentLesson}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            progress={progress}
            themeColor={progress.themeColor}
            soundEnabled={progress.soundEnabled}
            onToggleMastered={handleToggleMastered}
            onToggleBookmark={(w) => handleToggleBookmark(w)}
            onStartFlashcard={() => setIsFlashcardOpen(true)}
            onStartPractice={() => setActiveTab("practice")}
          />
        ) : activeTab === "practice" ? (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <ExerciseSession
              lesson={currentLesson}
              progress={progress}
              themeColor={progress.themeColor}
              soundEnabled={progress.soundEnabled}
              onSetExerciseCompleted={handleSetExerciseCompleted}
            />
          </div>
        ) : activeTab === "journey" ? (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <JourneyView
              lessons={lessons}
              selectedDay={selectedDay}
              onSelectDay={(d) => {
                setSelectedDay(d);
                setActiveTab("words");
              }}
              progress={progress}
              themeColor={progress.themeColor}
              soundEnabled={progress.soundEnabled}
            />
          </div>
        ) : activeTab === "flashcards" ? (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-center space-y-4">
            <div className="frosted-glass rounded-3xl p-8 max-w-md mx-auto space-y-4 border border-slate-200/60 dark:border-white/10 shadow-lg">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-[#0058bc] flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Flashcard Focus: DAY {currentLesson.day_number}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Lật thẻ từ vựng với hiệu ứng 3D, nghe phát âm bản xứ và ghi nhớ {vocab.length} từ cốt lõi.
              </p>
              <button
                onClick={() => {
                  playHaptic("pop", progress.soundEnabled);
                  setIsFlashcardOpen(true);
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#0058bc] hover:bg-[#004ca3] text-white font-bold text-sm shadow-lg shadow-[#0058bc]/30 transition-all"
              >
                Bắt đầu ôn Flashcard
              </button>
            </div>
          </div>
        ) : activeTab === "stats" ? (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <StatsView
              lessons={lessons}
              progress={progress}
              themeColor={progress.themeColor}
              soundEnabled={progress.soundEnabled}
              onSelectDay={(day) => {
                setSelectedDay(day);
                setActiveTab("words");
              }}
              onToggleBookmark={(dayNum, word) => handleToggleBookmark(word, dayNum)}
              onResetProgress={handleResetProgress}
            />
          </div>
        ) : null}
      </div>

      {/* Fullscreen 3D Flashcard Modal */}
      <FlashcardModal
        lesson={currentLesson}
        isOpen={isFlashcardOpen}
        onClose={() => setIsFlashcardOpen(false)}
        progress={progress}
        themeColor={progress.themeColor}
        soundEnabled={progress.soundEnabled}
        onToggleMastered={handleToggleMastered}
        onToggleBookmark={(word) => handleToggleBookmark(word)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        progress={progress}
        onUpdateProgress={setProgress}
      />

      {/* iOS 18 Floating Glass Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "flashcards") {
            setIsFlashcardOpen(true);
          }
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        themeColor={progress.themeColor}
        soundEnabled={progress.soundEnabled}
      />
    </main>
  );
}
