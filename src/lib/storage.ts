import { UserProgress, ThemeColor, AppearanceMode } from "@/types/material";

const STORAGE_KEY = "ios_vocab_review_progress_v1";

const DEFAULT_PROGRESS: UserProgress = {
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

export function loadUserProgress(): UserProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
    };
  } catch (e) {
    console.error("Failed to load user progress:", e);
    return DEFAULT_PROGRESS;
  }
}

export function saveUserProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error("Failed to save user progress:", e);
  }
}

export function calculateDailyStreak(currentStreak: number, lastActiveDate: string): number {
  const today = new Date().toISOString().split("T")[0];
  if (lastActiveDate === today) {
    return Math.max(1, currentStreak);
  }

  const last = new Date(lastActiveDate);
  const now = new Date(today);
  const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return currentStreak + 1;
  } else if (diffDays > 1) {
    return 1;
  }
  return currentStreak;
}

export const THEME_CONFIG: Record<
  ThemeColor,
  {
    name: string;
    primaryHex: string;
    primaryLight: string;
    primaryDark: string;
    badgeBg: string;
    badgeText: string;
    ringColor: string;
  }
> = {
  blue: {
    name: "Apple Blue",
    primaryHex: "#007AFF",
    primaryLight: "bg-[#007AFF]",
    primaryDark: "dark:bg-[#0A84FF]",
    badgeBg: "bg-blue-500/15 dark:bg-blue-500/25",
    badgeText: "text-[#007AFF] dark:text-[#389eff]",
    ringColor: "stroke-[#007AFF]",
  },
  indigo: {
    name: "Apple Indigo",
    primaryHex: "#5856D6",
    primaryLight: "bg-[#5856D6]",
    primaryDark: "dark:bg-[#5E5CE6]",
    badgeBg: "bg-indigo-500/15 dark:bg-indigo-500/25",
    badgeText: "text-[#5856D6] dark:text-[#7d7bf7]",
    ringColor: "stroke-[#5856D6]",
  },
  emerald: {
    name: "Apple Mint",
    primaryHex: "#34C759",
    primaryLight: "bg-[#34C759]",
    primaryDark: "dark:bg-[#30D158]",
    badgeBg: "bg-emerald-500/15 dark:bg-emerald-500/25",
    badgeText: "text-[#28a745] dark:text-[#30D158]",
    ringColor: "stroke-[#34C759]",
  },
  orange: {
    name: "Apple Orange",
    primaryHex: "#FF9500",
    primaryLight: "bg-[#FF9500]",
    primaryDark: "dark:bg-[#FF9F0A]",
    badgeBg: "bg-orange-500/15 dark:bg-orange-500/25",
    badgeText: "text-[#FF9500] dark:text-[#FF9F0A]",
    ringColor: "stroke-[#FF9500]",
  },
  purple: {
    name: "Apple Purple",
    primaryHex: "#AF52DE",
    primaryLight: "bg-[#AF52DE]",
    primaryDark: "dark:bg-[#BF5AF2]",
    badgeBg: "bg-purple-500/15 dark:bg-purple-500/25",
    badgeText: "text-[#AF52DE] dark:text-[#BF5AF2]",
    ringColor: "stroke-[#AF52DE]",
  },
};
