"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Lesson, ThemeColor, UserProgress } from "@/types/material";
import { playHaptic } from "@/lib/audio";

interface JourneyViewProps {
  lessons: Lesson[];
  selectedDay: number;
  onSelectDay: (day: number) => void;
  progress: UserProgress;
  themeColor: ThemeColor;
  soundEnabled: boolean;
}

export const JourneyView: React.FC<JourneyViewProps> = ({
  lessons,
  selectedDay,
  onSelectDay,
  progress,
  soundEnabled,
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "in_progress">("all");

  const filteredLessons = lessons.filter((lesson) => {
    const vocab = lesson.vocabulary || [];
    const masteredCount = vocab.filter(
      (v) => progress.masteredWords[`${lesson.day_number}_${v.word}`]
    ).length;
    const isCompleted = vocab.length > 0 && masteredCount === vocab.length;

    if (filter === "completed" && !isCompleted) return false;
    if (filter === "in_progress" && isCompleted) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      lesson.title.toLowerCase().includes(q) ||
      `day ${lesson.day_number}`.includes(q) ||
      vocab.some((v) => v.word.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2 space-y-5 pb-28">
      {/* Hero Header */}
      <div className="ios-glass-card rounded-[28px] p-6 sm:p-7 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#007AFF]/15 text-[#007AFF]">
              <CalendarDays className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#007AFF]">
              Lộ Trình 36 Ngày Ôn Tập
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Chinh Phục 196 Từ Vựng TOEIC
          </h2>

          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-lg">
            Học & ôn tập bài học theo từng ngày (Day 0 → Day 35). Theo dõi tiến độ ghi nhớ từ vựng và hoàn thành bài tập.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo ngày (ví dụ: Day 5) hoặc tên từ vựng..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 dark:bg-[#1c1c1e]/75 border border-black/[0.06] dark:border-white/[0.08] text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
          />
        </div>

        <div className="flex items-center p-1 bg-neutral-200/70 dark:bg-[#242426]/70 rounded-2xl text-xs font-medium backdrop-blur-md">
          {[
            { key: "all", label: `Tất cả (${lessons.length} ngày)` },
            {
              key: "in_progress",
              label: "Đang học",
            },
            {
              key: "completed",
              label: "Đã hoàn thành",
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                playHaptic("pop", soundEnabled);
                setFilter(tab.key as typeof filter);
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl transition-all duration-200 text-center ${
                filter === tab.key
                  ? "bg-white dark:bg-[#323234] text-neutral-900 dark:text-white shadow-sm font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Day Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {filteredLessons.map((lesson) => {
          const vocab = lesson.vocabulary || [];
          const masteredCount = vocab.filter(
            (v) => progress.masteredWords[`${lesson.day_number}_${v.word}`]
          ).length;
          const isCompleted = vocab.length > 0 && masteredCount === vocab.length;
          const percent = vocab.length > 0 ? Math.round((masteredCount / vocab.length) * 100) : 0;
          const isCurrentSelected = lesson.day_number === selectedDay;

          return (
            <div
              key={lesson.day_number}
              onClick={() => {
                playHaptic("click", soundEnabled);
                onSelectDay(lesson.day_number);
              }}
              className={`ios-glass-card rounded-[24px] p-4 sm:p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                isCurrentSelected
                  ? "ring-2 ring-[#007AFF] shadow-lg shadow-[#007AFF]/15"
                  : isCompleted
                  ? "border-emerald-500/30"
                  : ""
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#007AFF]/12 text-[#007AFF] dark:text-[#389eff]">
                    Day {lesson.day_number}
                  </span>
                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Thuộc hết
                    </span>
                  ) : (
                    <span className="text-[11px] text-neutral-400 font-medium">
                      {masteredCount}/{vocab.length} từ
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-neutral-900 dark:text-white line-clamp-1">
                  {lesson.title || `Day ${lesson.day_number}`}
                </h3>

                {lesson.due_date && (
                  <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                    <Clock className="w-3 h-3" />
                    <span className="line-clamp-1">Hạn: {lesson.due_date}</span>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                  <span>Tiến độ</span>
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">{percent}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted ? "bg-emerald-500" : "bg-[#007AFF]"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
