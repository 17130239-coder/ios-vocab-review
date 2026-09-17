"use client";

import React from "react";
import {
  CalendarDays,
  BookOpen,
  Layers,
  PenTool,
  BarChart3,
  Settings,
} from "lucide-react";
import { playHaptic } from "@/lib/audio";
import { ThemeColor } from "@/types/material";

export type TabKey = "journey" | "words" | "flashcards" | "practice" | "stats";

interface TabBarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onOpenSettings: () => void;
  themeColor: ThemeColor;
  soundEnabled: boolean;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onTabChange,
  onOpenSettings,
  soundEnabled,
}) => {
  const tabs: { key: TabKey; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: "journey", label: "Lộ trình", icon: CalendarDays },
    { key: "words", label: "Từ vựng", icon: BookOpen },
    { key: "flashcards", label: "Flashcard", icon: Layers },
    { key: "practice", label: "Luyện tập", icon: PenTool },
    { key: "stats", label: "Tiến độ", icon: BarChart3 },
  ];

  const handleSelect = (key: TabKey) => {
    playHaptic("pop", soundEnabled);
    onTabChange(key);
  };

  return (
    <nav aria-label="Bottom Navigation" className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-full ios-glass-floating border border-black/10 dark:border-white/15 shadow-2xl backdrop-blur-3xl transition-all duration-300">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleSelect(tab.key)}
              className={`relative flex flex-col items-center justify-center min-w-[58px] sm:min-w-[68px] py-1.5 px-2 rounded-full transition-all duration-200 ${
                isActive
                  ? "text-[#007AFF] dark:text-[#389eff] font-semibold"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
              }`}
            >
              {isActive && (
                <span className="absolute inset-0 rounded-full bg-[#007AFF]/12 dark:bg-[#007AFF]/25 transition-all duration-300" />
              )}
              <Icon className={`w-5 h-5 relative z-10 transition-transform ${isActive ? "scale-110" : ""}`} />
              <span className="text-[10px] tracking-tight relative z-10 mt-0.5">{tab.label}</span>
            </button>
          );
        })}

        <div className="w-[1px] h-6 bg-black/10 dark:bg-white/15 mx-1" />

        <button
          onClick={() => {
            playHaptic("click", soundEnabled);
            onOpenSettings();
          }}
          className="flex flex-col items-center justify-center p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
          title="Cài đặt"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Cài đặt</span>
        </button>
      </div>
    </nav>
  );
};
