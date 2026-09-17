"use client";

import React, { useEffect, useState } from "react";
import { Flame, Volume2, Sparkles, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { subscribeSpeech } from "@/lib/audio";
import { ThemeColor } from "@/types/material";

interface DynamicIslandProps {
  currentDay: number;
  totalWordsInDay: number;
  masteredInDay: number;
  streak: number;
  themeColor: ThemeColor;
  onOpenStats?: () => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  currentDay,
  totalWordsInDay,
  masteredInDay,
  streak,
  onOpenStats,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingWord, setSpeakingWord] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const unsub = subscribeSpeech((playing, text) => {
      setIsSpeaking(playing);
      if (text) setSpeakingWord(text);
    });
    return unsub;
  }, []);

  const progressPercent = totalWordsInDay > 0 ? Math.round((masteredInDay / totalWordsInDay) * 100) : 0;

  return (
    <aside aria-label="Dynamic Island" className="sticky top-3 z-40 flex justify-center px-4 pointer-events-none mb-3">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`pointer-events-auto cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] bg-black text-white shadow-2xl rounded-full border border-white/15 backdrop-blur-3xl overflow-hidden ${
          isExpanded
            ? "w-full max-w-sm rounded-[32px] px-5 py-4"
            : isSpeaking
            ? "w-auto min-w-[260px] px-4 py-2 rounded-full ring-2 ring-[#007AFF]/40"
            : "w-auto min-w-[210px] px-4 py-2 rounded-full hover:scale-[1.02] active:scale-[0.98]"
        }`}
      >
        {!isExpanded ? (
          <div className="flex items-center justify-between gap-3 text-xs">
            {/* Left side */}
            <div className="flex items-center gap-2">
              {isSpeaking ? (
                <div className="flex items-center gap-1.5 text-[#007AFF]">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#007AFF] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#007AFF]"></span>
                  </span>
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                </div>
              ) : (
                <div className="w-2 h-2 rounded-full bg-[#007AFF]" />
              )}
              <span className="font-semibold tracking-tight text-neutral-100">
                {isSpeaking ? speakingWord : `Day ${currentDay}`}
              </span>
            </div>

            {/* Middle / Right Audio waveform or stats */}
            {isSpeaking ? (
              <div className="flex items-center gap-1 h-3">
                <span className="w-0.5 h-3 bg-[#007AFF] animate-pulse rounded-full" />
                <span className="w-0.5 h-2 bg-[#007AFF] animate-pulse delay-75 rounded-full" />
                <span className="w-0.5 h-3.5 bg-[#007AFF] animate-pulse delay-150 rounded-full" />
                <span className="w-0.5 h-2 bg-[#007AFF] animate-pulse delay-100 rounded-full" />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-amber-400 font-medium">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{streak}d</span>
                </div>
                <div className="text-[11px] text-neutral-400 bg-white/10 px-2 py-0.5 rounded-full font-medium">
                  {masteredInDay}/{totalWordsInDay}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Expanded state */
          <div className="flex flex-col gap-3 text-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#007AFF]" />
                <span className="font-bold text-base tracking-tight">DAY {currentDay}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold bg-amber-400/15 px-2.5 py-1 rounded-full">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>{streak} Ngày Liên Tiếp</span>
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <div className="text-xs text-neutral-400">Tiến độ từ vựng hôm nay</div>
                <div className="text-sm font-semibold text-white mt-0.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    {masteredInDay} / {totalWordsInDay} từ ({progressPercent}%)
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 relative flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/15"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#007AFF] transition-all duration-500 ease-out"
                    strokeDasharray={`${progressPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[10px] font-bold text-white">{progressPercent}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-neutral-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Apple iOS 18 Vocab Hub
              </span>
              {onOpenStats && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenStats();
                    setIsExpanded(false);
                  }}
                  className="text-xs font-semibold text-[#007AFF] hover:underline"
                >
                  Xem thống kê
                </button>
              )}
            </div>
            <div className="flex justify-center text-neutral-500 pt-1">
              <ChevronUp className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
