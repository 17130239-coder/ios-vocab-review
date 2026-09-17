"use client";

import React, { useState } from "react";
import {
  Flame,
  CheckCircle2,
  Bookmark,
  Volume2,
  Trash2,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Lesson, ThemeColor, UserProgress } from "@/types/material";
import { speakEnglish, playHaptic } from "@/lib/audio";

interface StatsViewProps {
  lessons: Lesson[];
  progress: UserProgress;
  themeColor: ThemeColor;
  soundEnabled: boolean;
  onSelectDay: (day: number) => void;
  onToggleBookmark: (dayNumber: number, word: string) => void;
  onResetProgress: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  lessons,
  progress,
  soundEnabled,
  onSelectDay,
  onToggleBookmark,
  onResetProgress,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Calculate totals
  let totalVocab = 0;
  let totalExercises = 0;
  lessons.forEach((l) => {
    totalVocab += l.vocabulary?.length || 0;
    totalExercises += l.homework?.exercises?.length || 0;
  });

  const masteredWordsCount = Object.values(progress.masteredWords).filter(Boolean).length;
  const completedExercisesCount = Object.values(progress.completedExercises).filter(Boolean).length;

  const completedDaysCount = lessons.filter((l) => {
    const v = l.vocabulary || [];
    if (v.length === 0) return false;
    return v.every((item) => progress.masteredWords[`${l.day_number}_${item.word}`]);
  }).length;

  const vocabPercent = totalVocab > 0 ? Math.min(100, Math.round((masteredWordsCount / totalVocab) * 100)) : 0;
  const exercisePercent =
    totalExercises > 0 ? Math.min(100, Math.round((completedExercisesCount / totalExercises) * 100)) : 0;
  const dayPercent = Math.min(100, Math.round((completedDaysCount / lessons.length) * 100));

  // Collect all bookmarked words
  const bookmarkedList: { dayNumber: number; word: string; pronunciation?: string; meaning?: string }[] = [];
  lessons.forEach((l) => {
    (l.vocabulary || []).forEach((v) => {
      if (progress.bookmarkedWords[`${l.day_number}_${v.word}`]) {
        bookmarkedList.push({
          dayNumber: l.day_number,
          word: v.word,
          pronunciation: v.pronunciation,
          meaning: v.meaning,
        });
      }
    });
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2 space-y-5 pb-28">
      {/* Apple Activity Rings Hero Card */}
      <div className="ios-glass-card rounded-[32px] p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#007AFF] uppercase tracking-wider">
              Thống kê hoạt động
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
              Apple Activity Rings
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-amber-500/15 text-amber-600 dark:text-amber-400 px-3.5 py-1.5 rounded-full font-bold text-sm">
            <Flame className="w-4 h-4 fill-amber-500" />
            <span>{progress.streak} Ngày Liên Tiếp</span>
          </div>
        </div>

        {/* 3 Rings visualization & Legends */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* SVG Concentric Rings */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              {/* Outer Ring: Mastered Vocab (Pink/Red #FF2D55) */}
              <circle
                cx="60"
                cy="60"
                r="48"
                className="text-[#FF2D55]/20"
                strokeWidth="9"
                stroke="currentColor"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="48"
                className="text-[#FF2D55] transition-all duration-700 ease-out"
                strokeWidth="9"
                strokeDasharray={`${(vocabPercent / 100) * 301.59}, 301.59`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
              />

              {/* Middle Ring: Completed Exercises (Mint/Green #34C759) */}
              <circle
                cx="60"
                cy="60"
                r="36"
                className="text-[#34C759]/20"
                strokeWidth="9"
                stroke="currentColor"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="36"
                className="text-[#34C759] transition-all duration-700 ease-out delay-100"
                strokeWidth="9"
                strokeDasharray={`${(exercisePercent / 100) * 226.19}, 226.19`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
              />

              {/* Inner Ring: Days Completed (Apple Blue #007AFF) */}
              <circle
                cx="60"
                cy="60"
                r="24"
                className="text-[#007AFF]/20"
                strokeWidth="9"
                stroke="currentColor"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="24"
                className="text-[#007AFF] transition-all duration-700 ease-out delay-200"
                strokeWidth="9"
                strokeDasharray={`${(dayPercent / 100) * 150.79}, 150.79`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
              <TrendingUp className="w-6 h-6 text-[#007AFF]" />
              <span className="text-xs font-bold text-neutral-400 mt-1">Hoạt động</span>
            </div>
          </div>

          {/* Legends */}
          <div className="space-y-3.5">
            <div className="p-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#FF2D55]" />
                <div>
                  <div className="text-xs font-semibold text-neutral-500">Từ Vựng Đã Thuộc</div>
                  <div className="text-base font-bold text-neutral-900 dark:text-white">
                    {masteredWordsCount} / {totalVocab} từ
                  </div>
                </div>
              </div>
              <span className="text-sm font-bold text-[#FF2D55]">{vocabPercent}%</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#34C759]" />
                <div>
                  <div className="text-xs font-semibold text-neutral-500">Bài Tập Đã Làm</div>
                  <div className="text-base font-bold text-neutral-900 dark:text-white">
                    {completedExercisesCount} / {totalExercises} câu
                  </div>
                </div>
              </div>
              <span className="text-sm font-bold text-[#34C759]">{exercisePercent}%</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#007AFF]" />
                <div>
                  <div className="text-xs font-semibold text-neutral-500">Ngày Đã Hoàn Thành</div>
                  <div className="text-base font-bold text-neutral-900 dark:text-white">
                    {completedDaysCount} / {lessons.length} ngày
                  </div>
                </div>
              </div>
              <span className="text-sm font-bold text-[#007AFF]">{dayPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarked Difficult Words */}
      <div className="ios-glass-card rounded-[28px] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Từ Vựng Đã Đánh Dấu ({bookmarkedList.length})
            </h3>
          </div>
        </div>

        {bookmarkedList.length === 0 ? (
          <div className="p-6 text-center text-neutral-400 text-xs sm:text-sm">
            Bạn chưa đánh dấu từ khó nào. Nhấn biểu tượng Bookmark khi học từ để lưu vào đây!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bookmarkedList.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-black/[0.04] dark:border-white/[0.08] flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => {
                        playHaptic("click", soundEnabled);
                        onSelectDay(item.dayNumber);
                      }}
                      className="cursor-pointer text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#007AFF]/12 text-[#007AFF] hover:underline"
                    >
                      Day {item.dayNumber}
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-white text-sm">{item.word}</span>
                  </div>
                  {item.pronunciation && (
                    <div className="text-xs font-mono text-[#007AFF]">{item.pronunciation}</div>
                  )}
                  {item.meaning && (
                    <div className="text-xs text-neutral-600 dark:text-neutral-300 font-medium line-clamp-1">
                      {item.meaning}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      playHaptic("click", soundEnabled);
                      speakEnglish(item.word, progress.speechRate);
                    }}
                    className="p-2 rounded-full bg-[#007AFF]/12 text-[#007AFF]"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      playHaptic("pop", soundEnabled);
                      onToggleBookmark(item.dayNumber, item.word);
                    }}
                    className="p-2 rounded-full text-amber-500 hover:bg-amber-500/15"
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-amber-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone / Reset Progress */}
      <div className="ios-glass-card rounded-[24px] p-5 flex items-center justify-between border-rose-500/20">
        <div>
          <div className="text-xs font-bold text-rose-500 uppercase">Cài lại dữ liệu</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Xoá toàn bộ tiến độ đã thuộc, bài tập và streak trên trình duyệt này
          </div>
        </div>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-2.5 py-1.5 rounded-xl bg-neutral-200 dark:bg-white/10 text-xs font-medium text-neutral-600 dark:text-neutral-300"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                onResetProgress();
                setShowResetConfirm(false);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-rose-600 text-xs font-bold text-white shadow-sm"
            >
              Xác nhận xóa
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
