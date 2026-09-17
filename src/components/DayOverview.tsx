"use client";

import React from "react";
import {
  Sparkles,
  Layers,
  PenTool,
  Gamepad2,
  Calendar,
  AlertCircle,
  ExternalLink,
  Award,
} from "lucide-react";
import { Lesson, ThemeColor, UserProgress } from "@/types/material";
import { playHaptic } from "@/lib/audio";

interface DayOverviewProps {
  lesson: Lesson;
  progress: UserProgress;
  themeColor: ThemeColor;
  soundEnabled: boolean;
  onStartFlashcard: () => void;
  onStartPractice: () => void;
  onOpenWords: () => void;
}

export const DayOverview: React.FC<DayOverviewProps> = ({
  lesson,
  progress,
  soundEnabled,
  onStartFlashcard,
  onStartPractice,
  onOpenWords,
}) => {
  const vocab = lesson.vocabulary || [];
  const exercises = lesson.homework?.exercises || [];
  const masteredCount = vocab.filter(
    (v) => progress.masteredWords[`${lesson.day_number}_${v.word}`]
  ).length;
  const progressPercent = vocab.length > 0 ? Math.round((masteredCount / vocab.length) * 100) : 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-3 space-y-4">
      {/* Schedule Banner if available */}
      {lesson.schedule && lesson.schedule.length > 0 && (
        <div className="ios-glass p-3.5 rounded-2xl flex items-start gap-3 border-l-4 border-l-amber-500 text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm space-y-0.5">
            <div className="font-semibold text-amber-600 dark:text-amber-400">Lịch Trả Bài & Dặn Dò:</div>
            {lesson.schedule.map((item, idx) => (
              <p key={idx} className="leading-relaxed font-medium">
                {item}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Main Day Hero Card (iOS 18 Glass Card) */}
      <div className="ios-glass-card rounded-[28px] p-5 sm:p-7 relative overflow-hidden transition-all duration-300">
        {/* Subtle decorative iOS glass gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#007AFF]/10 dark:bg-[#007AFF]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#007AFF]/15 text-[#007AFF] dark:text-[#389eff]">
                BÀI HỌC THEO NGÀY
              </span>
              {lesson.status && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  {lesson.status}
                </span>
              )}
            </div>

            {lesson.due_date && (
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>Hạn nộp: {lesson.due_date}</span>
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {lesson.title || `Day ${lesson.day_number}`}
          </h1>

          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Chương trình tự học & ôn luyện từ vựng TOEIC Google Classroom
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 my-5">
            <button
              onClick={onOpenWords}
              className="bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 p-3 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] text-left transition-all"
            >
              <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Từ Vựng</div>
              <div className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
                {vocab.length} <span className="text-xs font-normal text-neutral-400">từ</span>
              </div>
              <div className="text-[11px] text-[#007AFF] font-medium mt-0.5">
                Đã thuộc: {masteredCount}
              </div>
            </button>

            <button
              onClick={onStartPractice}
              className="bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 p-3 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] text-left transition-all"
            >
              <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Bài Tập Câu</div>
              <div className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
                {exercises.length} <span className="text-xs font-normal text-neutral-400">câu</span>
              </div>
              <div className="text-[11px] text-emerald-500 font-medium mt-0.5">Tương tác</div>
            </button>

            <div className="bg-white/60 dark:bg-white/5 p-3 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] text-left">
              <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Hoàn Thành</div>
              <div className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
                {progressPercent}%
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-[#007AFF] h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => {
                playHaptic("pop", soundEnabled);
                onStartFlashcard();
              }}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#007AFF] hover:bg-[#0071eb] active:scale-[0.98] text-white font-semibold shadow-md shadow-[#007AFF]/25 transition-all text-sm"
            >
              <Layers className="w-4 h-4" />
              <span>Ôn Flashcard 3D</span>
            </button>

            <button
              onClick={() => {
                playHaptic("click", soundEnabled);
                onStartPractice();
              }}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 active:scale-[0.98] text-neutral-800 dark:text-neutral-100 font-semibold border border-black/[0.06] dark:border-white/[0.12] transition-all text-sm"
            >
              <PenTool className="w-4 h-4 text-[#007AFF]" />
              <span>Luyện Tập Điền Từ</span>
            </button>

            {lesson.quizizz && (
              <a
                href={lesson.quizizz.url}
                target="_blank"
                rel="noreferrer"
                onClick={() => playHaptic("pop", soundEnabled)}
                className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 active:scale-[0.98] text-purple-700 dark:text-purple-300 font-semibold border border-purple-500/20 transition-all text-sm"
              >
                <Gamepad2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Quizizz</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
