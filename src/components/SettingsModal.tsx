"use client";

import React from "react";
import {
  X,
  Palette,
  Volume2,
  Moon,
  Sun,
  Laptop,
  Gauge,
  Info,
  Check,
} from "lucide-react";
import { ThemeColor, AppearanceMode, UserProgress } from "@/types/material";
import { THEME_CONFIG } from "@/lib/storage";
import { playHaptic } from "@/lib/audio";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  progress,
  onUpdateProgress,
}) => {
  if (!isOpen) return null;

  const handleSelectColor = (color: ThemeColor) => {
    playHaptic("pop", progress.soundEnabled);
    onUpdateProgress((p) => ({ ...p, themeColor: color }));
  };

  const handleSelectAppearance = (mode: AppearanceMode) => {
    playHaptic("pop", progress.soundEnabled);
    onUpdateProgress((p) => ({ ...p, appearance: mode }));

    // Apply dark class to html tag if needed
    if (typeof document !== "undefined") {
      if (mode === "dark") {
        document.documentElement.classList.add("dark");
      } else if (mode === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        // Auto
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (prefersDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-md ios-glass-floating rounded-[32px] p-6 shadow-2xl border border-white/20 dark:border-white/10 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#007AFF]/15 text-[#007AFF]">
              <Palette className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Cài Đặt & Giao Diện</h3>
          </div>

          <button
            onClick={() => {
              playHaptic("click", progress.soundEnabled);
              onClose();
            }}
            aria-label="Đóng cài đặt"
            className="w-8 h-8 rounded-full bg-neutral-200/80 dark:bg-white/10 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-white/20 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Appearance Mode */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Chế độ màu sắc (Giao diện)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "light", label: "Sáng", icon: Sun },
              { key: "dark", label: "Tối", icon: Moon },
              { key: "auto", label: "Tự động", icon: Laptop },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = progress.appearance === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleSelectAppearance(item.key as AppearanceMode)}
                  className={`py-2.5 px-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-xs font-semibold border transition-all ${
                    isSelected
                      ? "bg-[#007AFF] text-white border-transparent shadow-md shadow-[#007AFF]/25"
                      : "bg-white/60 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 border-black/[0.06] dark:border-white/[0.08]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent Color Palette */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Màu điểm nhấn iOS 18
          </label>
          <div className="flex items-center justify-between gap-2 p-3 bg-white/60 dark:bg-white/5 rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
            {(Object.keys(THEME_CONFIG) as ThemeColor[]).map((color) => {
              const cfg = THEME_CONFIG[color];
              const isSelected = progress.themeColor === color;
              return (
                <button
                  key={color}
                  onClick={() => handleSelectColor(color)}
                  style={{ backgroundColor: cfg.primaryHex }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all ${
                    isSelected ? "ring-4 ring-offset-2 ring-[#007AFF] dark:ring-offset-black scale-110" : ""
                  }`}
                  title={cfg.name}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sound & Haptic Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Âm thanh & Phản hồi
          </label>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-white/5 rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#007AFF]" />
                <span className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  Âm thanh Haptic Click & Chime
                </span>
              </div>
              <button
                onClick={() => {
                  const nextVal = !progress.soundEnabled;
                  playHaptic("pop", nextVal);
                  onUpdateProgress((p) => ({ ...p, soundEnabled: nextVal }));
                }}
                className={`w-12 h-7 rounded-full transition-colors p-1 flex items-center ${
                  progress.soundEnabled ? "bg-[#34C759] justify-end" : "bg-neutral-300 dark:bg-neutral-700 justify-start"
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md transition-transform" />
              </button>
            </div>

            {/* Speech Rate */}
            <div className="p-3 bg-white/60 dark:bg-white/5 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  <Gauge className="w-4 h-4 text-[#007AFF]" />
                  <span>Tốc độ đọc tiếng Anh</span>
                </div>
                <span className="text-xs font-bold text-[#007AFF]">{progress.speechRate}x</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {[0.8, 0.95, 1.1].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      playHaptic("click", progress.soundEnabled);
                      onUpdateProgress((p) => ({ ...p, speechRate: rate }));
                    }}
                    className={`flex-1 py-1 px-2 rounded-xl text-xs font-semibold transition-all ${
                      progress.speechRate === rate
                        ? "bg-[#007AFF] text-white"
                        : "bg-neutral-200/80 dark:bg-white/10 text-neutral-600 dark:text-neutral-300"
                    }`}
                  >
                    {rate === 0.8 ? "Chậm" : rate === 0.95 ? "Bình thường" : "Nhanh"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 rounded-2xl bg-blue-500/10 text-xs text-[#007AFF] flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>Dữ liệu bài học được tải trực tiếp từ Google Classroom English Vocabulary Course.</span>
        </div>
      </div>
    </div>
  );
};
