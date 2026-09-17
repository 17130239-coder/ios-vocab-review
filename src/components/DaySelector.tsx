"use client";

import React, { useRef, useEffect } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Lesson, ThemeColor, UserProgress } from "@/types/material";
import { playHaptic } from "@/lib/audio";

interface DaySelectorProps {
  lessons: Lesson[];
  selectedDay: number;
  onSelectDay: (dayNumber: number) => void;
  progress: UserProgress;
  themeColor: ThemeColor;
  soundEnabled: boolean;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  lessons,
  selectedDay,
  onSelectDay,
  progress,
  soundEnabled,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll selected day into view smoothly
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector(`[data-day="${selectedDay}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [selectedDay]);

  const handleSelect = (day: number) => {
    if (day !== selectedDay) {
      playHaptic("click", soundEnabled);
      onSelectDay(day);
    }
  };

  const scrollByAmount = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -240 : 240;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-2 sm:px-4 py-2">
      {/* Scroll navigation arrows for desktop */}
      <button
        onClick={() => scrollByAmount("left")}
        aria-label="Previous days"
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/80 dark:bg-[#2c2c2e]/80 shadow-md backdrop-blur-md items-center justify-center text-neutral-600 dark:text-neutral-300 hover:scale-105 active:scale-95 transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => scrollByAmount("right")}
        aria-label="Next days"
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/80 dark:bg-[#2c2c2e]/80 shadow-md backdrop-blur-md items-center justify-center text-neutral-600 dark:text-neutral-300 hover:scale-105 active:scale-95 transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth"
      >
        {lessons.map((lesson) => {
          const isSelected = lesson.day_number === selectedDay;
          const vocab = lesson.vocabulary || [];
          const masteredCount = vocab.filter(
            (v) => progress.masteredWords[`${lesson.day_number}_${v.word}`]
          ).length;
          const isCompleted = vocab.length > 0 && masteredCount === vocab.length;

          return (
            <button
              key={lesson.day_number}
              data-day={lesson.day_number}
              onClick={() => handleSelect(lesson.day_number)}
              className={`group flex-shrink-0 flex flex-col items-center justify-center px-3.5 py-2 rounded-2xl transition-all duration-200 ${
                isSelected
                  ? "bg-[#007AFF] text-white shadow-lg shadow-[#007AFF]/30 scale-105"
                  : "bg-white/70 dark:bg-[#1c1c1e]/75 text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-[#2c2c2e] border border-black/[0.04] dark:border-white/[0.08]"
              }`}
            >
              <div className="flex items-center gap-1">
                <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-neutral-900 dark:text-white"}`}>
                  Day {lesson.day_number}
                </span>
                {isCompleted && (
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                      isSelected ? "bg-white text-[#007AFF]" : "bg-emerald-500 text-white"
                    }`}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-0.5 font-medium ${
                  isSelected ? "text-blue-100" : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {vocab.length} từ
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
