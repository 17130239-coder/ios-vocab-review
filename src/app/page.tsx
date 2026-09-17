"use client";

import React, { useState, useEffect, useTransition } from "react";
import rawMaterialData from "@/data/material.json";
import { MaterialData, Lesson, UserProgress } from "@/types/material";
import {
  loadUserProgress,
  saveUserProgress,
  calculateDailyStreak,
} from "@/lib/storage";
import { playHaptic } from "@/lib/audio";
import { DynamicIsland } from "@/components/DynamicIsland";
import { TabBar, TabKey } from "@/components/TabBar";
import { DaySelector } from "@/components/DaySelector";
import { DayOverview } from "@/components/DayOverview";
import { VocabularyList } from "@/components/VocabularyList";
import { FlashcardModal } from "@/components/FlashcardModal";
import { ExerciseSession } from "@/components/ExerciseSession";
import { JourneyView } from "@/components/JourneyView";
import { StatsView } from "@/components/StatsView";
import { QuizizzCard } from "@/components/QuizizzCard";
import { SettingsModal } from "@/components/SettingsModal";
import {
  Sparkles,
  Gamepad2,
  Calendar,
  Layers,
  PenTool,
  BookOpen,
} from "lucide-react";

const materialData = rawMaterialData as unknown as MaterialData;
const lessons: Lesson[] = materialData.lessons || [];

export default function HomePage() {
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<TabKey>("words");
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showQuizizzTab, setShowQuizizzTab] = useState(false);

  // User progress loaded from localStorage
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

  // Save progress changes to localStorage
  useEffect(() => {
    saveUserProgress(progress);
  }, [progress]);

  // Apply dark mode on initial load based on saved appearance
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

  return (
    <main className="min-h-screen flex flex-col bg-[#F2F2F7] dark:bg-[#000000] text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300">
      {/* Dynamic Island Floating Header */}
      <DynamicIsland
        currentDay={currentLesson.day_number}
        totalWordsInDay={vocab.length}
        masteredInDay={masteredInDay}
        streak={progress.streak}
        themeColor={progress.themeColor}
        onOpenStats={() => setActiveTab("stats")}
      />

      {/* iOS 18 Navigation Bar Header */}
      <header className="w-full max-w-4xl mx-auto px-4 pt-1 pb-2 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#007AFF] dark:text-[#389eff]">
            {materialData.metadata.course_title || "English Vocabulary Course"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Ôn Tập Từ Vựng
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {currentLesson.quizizz && (
            <button
              onClick={() => {
                playHaptic("pop", progress.soundEnabled);
                setShowQuizizzTab(!showQuizizzTab);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                showQuizizzTab
                  ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/25"
                  : "bg-white/80 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 border-black/[0.06] dark:border-white/[0.1]"
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quizizz & Media</span>
            </button>
          )}
        </div>
      </header>

      {/* Horizontal Day Selector (visible on day-related tabs) */}
      {activeTab !== "journey" && activeTab !== "stats" && (
        <DaySelector
          lessons={lessons}
          selectedDay={selectedDay}
          onSelectDay={(d) => {
            setSelectedDay(d);
            setShowQuizizzTab(false);
          }}
          progress={progress}
          themeColor={progress.themeColor}
          soundEnabled={progress.soundEnabled}
        />
      )}

      {/* Main Tab Content */}
      <div className="flex-1 w-full animate-in fade-in duration-300">
        {showQuizizzTab ? (
          <QuizizzCard
            lesson={currentLesson}
            themeColor={progress.themeColor}
            soundEnabled={progress.soundEnabled}
          />
        ) : activeTab === "journey" ? (
          <JourneyView
            lessons={lessons}
            selectedDay={selectedDay}
            onSelectDay={(day) => {
              setSelectedDay(day);
              setActiveTab("words");
            }}
            progress={progress}
            themeColor={progress.themeColor}
            soundEnabled={progress.soundEnabled}
          />
        ) : activeTab === "words" ? (
          <div className="space-y-3">
            <DayOverview
              lesson={currentLesson}
              progress={progress}
              themeColor={progress.themeColor}
              soundEnabled={progress.soundEnabled}
              onStartFlashcard={() => setIsFlashcardOpen(true)}
              onStartPractice={() => setActiveTab("practice")}
              onOpenWords={() => {}}
            />

            <VocabularyList
              lesson={currentLesson}
              progress={progress}
              themeColor={progress.themeColor}
              soundEnabled={progress.soundEnabled}
              onToggleMastered={handleToggleMastered}
              onToggleBookmark={(word) => handleToggleBookmark(word)}
            />
          </div>
        ) : activeTab === "flashcards" ? (
          <div className="w-full max-w-4xl mx-auto px-4 py-8 text-center space-y-4">
            <div className="ios-glass-card rounded-[32px] p-8 max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center mx-auto">
                <Layers className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white">
                Flashcard 3D: DAY {currentLesson.day_number}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                Lật thẻ từ vựng với hiệu ứng 3D chân thực, nghe phát âm giọng bản xứ và ghi nhớ nghĩa nhanh chóng.
              </p>
              <button
                onClick={() => {
                  playHaptic("pop", progress.soundEnabled);
                  setIsFlashcardOpen(true);
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#007AFF] hover:bg-[#0071eb] text-white font-bold text-sm shadow-lg shadow-[#007AFF]/30 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Bắt đầu ôn Flashcard ({vocab.length} từ)</span>
              </button>
            </div>
          </div>
        ) : activeTab === "practice" ? (
          <ExerciseSession
            lesson={currentLesson}
            progress={progress}
            themeColor={progress.themeColor}
            soundEnabled={progress.soundEnabled}
            onSetExerciseCompleted={handleSetExerciseCompleted}
          />
        ) : activeTab === "stats" ? (
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
          setShowQuizizzTab(false);
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
