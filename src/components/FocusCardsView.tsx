"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  Check,
  Search,
  SearchX,
  Layers,
  Gamepad2,
  PenTool,
  Bookmark,
  ExternalLink,
  Sparkles,
  AlertCircle,
  FileAudio,
} from "lucide-react";
import { Lesson, ThemeColor, UserProgress } from "@/types/material";
import { speakEnglish, playHaptic } from "@/lib/audio";
import confetti from "canvas-confetti";

interface FocusCardsViewProps {
  lessons: Lesson[];
  currentLesson: Lesson;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  progress: UserProgress;
  themeColor: ThemeColor;
  soundEnabled: boolean;
  onToggleMastered: (word: string) => void;
  onToggleBookmark: (word: string) => void;
  onStartFlashcard: () => void;
  onStartPractice: () => void;
}

export const FocusCardsView: React.FC<FocusCardsViewProps> = ({
  lessons,
  currentLesson,
  selectedDay,
  onSelectDay,
  progress,
  soundEnabled,
  onToggleMastered,
  onToggleBookmark,
  onStartFlashcard,
  onStartPractice,
}) => {
  const [filterMode, setFilterMode] = useState<"all" | "unlearned" | "learned">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

  const vocab = currentLesson.vocabulary || [];
  const totalWords = vocab.length;

  const masteredCount = vocab.filter(
    (v) => progress.masteredWords[`${currentLesson.day_number}_${v.word}`]
  ).length;
  const unlearnedCount = totalWords - masteredCount;
  const percentage = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;

  // Filter and search
  const filteredVocab = vocab.filter((item) => {
    const isMastered = !!progress.masteredWords[`${currentLesson.day_number}_${item.word}`];

    if (filterMode === "unlearned" && isMastered) return false;
    if (filterMode === "learned" && !isMastered) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.word.toLowerCase().includes(q) ||
      (item.meaning && item.meaning.toLowerCase().includes(q)) ||
      (item.raw_text && item.raw_text.toLowerCase().includes(q))
    );
  });

  const handlePrevDay = () => {
    if (selectedDay > 0) {
      playHaptic("click", soundEnabled);
      onSelectDay(selectedDay - 1);
    }
  };

  const handleNextDay = () => {
    if (selectedDay < lessons.length - 1) {
      playHaptic("click", soundEnabled);
      onSelectDay(selectedDay + 1);
    }
  };

  const toggleExpand = (word: string) => {
    playHaptic("click", soundEnabled);
    setExpandedDetails((prev) => ({ ...prev, [word]: !prev[word] }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Sticky Focus Controls & Day Info */}
        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
          {/* Day Focus Card with Circular Progress (Stitch Design) */}
          <div className="frosted-glass rounded-3xl p-6 border border-white/80 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] relative overflow-hidden">
            {/* Top Row: Day Pill + Prev/Next buttons */}
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#0058bc] dark:text-[#389eff] text-xs font-bold uppercase tracking-wider">
                <span>Day {currentLesson.day_number}</span>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={handlePrevDay}
                  disabled={selectedDay === 0}
                  className="w-7 h-7 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors disabled:opacity-20"
                  title="Ngày trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextDay}
                  disabled={selectedDay === lessons.length - 1}
                  className="w-7 h-7 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors disabled:opacity-20"
                  title="Ngày kế tiếp"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title & Circular Progress Ring */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Từ vựng Cốt lõi
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Mục tiêu: {totalWords} từ vựng ngày này
                </p>
                {currentLesson.due_date && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                    Hạn nộp: {currentLesson.due_date}
                  </p>
                )}
              </div>

              {/* Apple-style Circular Progress */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-neutral-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#0058bc] dark:text-[#389eff] transition-all duration-500"
                    strokeDasharray={`${percentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-extrabold text-slate-800 dark:text-white">
                  {percentage}%
                </span>
              </div>
            </div>

            {/* Quick Filters Pills (iOS Segmented) */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100/90 dark:bg-neutral-800/80 rounded-2xl text-xs font-semibold select-none mb-5">
              <button
                onClick={() => {
                  playHaptic("pop", soundEnabled);
                  setFilterMode("all");
                }}
                className={`py-1.5 rounded-xl transition-all ${
                  filterMode === "all"
                    ? "bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Tất cả ({totalWords})
              </button>
              <button
                onClick={() => {
                  playHaptic("pop", soundEnabled);
                  setFilterMode("unlearned");
                }}
                className={`py-1.5 rounded-xl transition-all ${
                  filterMode === "unlearned"
                    ? "bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Cần ôn ({unlearnedCount})
              </button>
              <button
                onClick={() => {
                  playHaptic("pop", soundEnabled);
                  setFilterMode("learned");
                }}
                className={`py-1.5 rounded-xl transition-all ${
                  filterMode === "learned"
                    ? "bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Đã thuộc ({masteredCount})
              </button>
            </div>

            {/* Main Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  playHaptic("pop", soundEnabled);
                  onStartFlashcard();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-[#0058bc] hover:bg-[#004ca3] text-white font-semibold text-sm shadow-[0_6px_20px_-4px_rgba(0,88,188,0.35)] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <Layers className="w-4 h-4" />
                <span>Luyện Flashcard Focus</span>
              </button>

              {currentLesson.quizizz && (
                <a
                  href={currentLesson.quizizz.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playHaptic("click", soundEnabled)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Gamepad2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Kiểm tra Quizizz</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>
              )}

              <button
                onClick={() => {
                  playHaptic("click", soundEnabled);
                  onStartPractice();
                }}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <PenTool className="w-4 h-4 text-[#0058bc]" />
                <span>Luyện bài tập điền từ ({currentLesson.homework?.exercises?.length || 0} câu)</span>
              </button>
            </div>
          </div>

          {/* Quick Day Carousel Strip */}
          <div className="bg-white/60 dark:bg-[#1c1c1e]/70 backdrop-blur rounded-2xl p-3 border border-slate-200/50 dark:border-white/10">
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1 flex items-center justify-between">
              <span>Lộ trình các ngày</span>
              <span>{lessons.length} ngày</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-center">
              {lessons.map((l) => {
                const isSelected = l.day_number === selectedDay;
                const v = l.vocabulary || [];
                const m = v.filter(
                  (item) => progress.masteredWords[`${l.day_number}_${item.word}`]
                ).length;
                const isComplete = v.length > 0 && m === v.length;

                return (
                  <button
                    key={l.day_number}
                    onClick={() => {
                      playHaptic("click", soundEnabled);
                      onSelectDay(l.day_number);
                    }}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[#0058bc] text-white shadow-sm font-bold"
                        : "hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    Day {l.day_number}
                    {isComplete && !isSelected && <span className="ml-1 text-emerald-500">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule Banner if present */}
          {currentLesson.schedule && currentLesson.schedule.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-3.5 border border-amber-200/60 dark:border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Dặn dò lịch trả bài</span>
              </div>
              {currentLesson.schedule.map((s, idx) => (
                <p key={idx} className="leading-relaxed font-medium">
                  {s}
                </p>
              ))}
            </div>
          )}
        </aside>

        {/* RIGHT COLUMN: 2-Column Clean Vocabulary Flashcard Grid */}
        <section className="lg:col-span-8 space-y-4">
          {/* Search bar (Ultra Slim iOS Search) */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhanh từ vựng hoặc nghĩa tiếng Việt..."
              className="w-full bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200/80 dark:border-white/10 focus:border-[#0058bc] focus:ring-2 focus:ring-[#0058bc]/20 outline-none transition-all"
            />
          </div>

          {/* Grid Cards (2 columns on tablet/desktop) */}
          {filteredVocab.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-2 bg-white/60 dark:bg-[#1c1c1e]/50 rounded-3xl border border-slate-200/60 dark:border-white/10">
              <SearchX className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Không tìm thấy từ tương ứng
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="vocab-grid">
              {filteredVocab.map((item, idx) => {
                const isMastered = !!progress.masteredWords[`${currentLesson.day_number}_${item.word}`];
                const isBookmarked = !!progress.bookmarkedWords[`${currentLesson.day_number}_${item.word}`];
                const isExpanded = !!expandedDetails[item.word];

                return (
                  <article
                    key={idx}
                    className={`vocab-card bg-white dark:bg-[#1c1c1e] rounded-2xl p-4 border transition-all flex flex-col justify-between group ${
                      isMastered
                        ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10"
                        : "border-slate-200/70 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md"
                    }`}
                  >
                    {/* Top Row: Word, POS, IPA, Audio, Bookmark */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                              {item.word}
                            </h3>
                            {item.part_of_speech && (
                              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold lowercase">
                                ({item.part_of_speech})
                              </span>
                            )}
                          </div>
                          {item.pronunciation && (
                            <p className="text-xs text-slate-400 font-medium mt-0.5">
                              {item.pronunciation}
                            </p>
                          )}
                        </div>

                        {/* Action buttons (Bookmark & Audio) */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              playHaptic("pop", soundEnabled);
                              onToggleBookmark(item.word);
                            }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                              isBookmarked
                                ? "text-amber-500 bg-amber-50 dark:bg-amber-950/40"
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                            }`}
                            title={isBookmarked ? "Bỏ đánh dấu" : "Đánh dấu từ"}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-500" : ""}`} />
                          </button>

                          <button
                            onClick={() => {
                              playHaptic("click", soundEnabled);
                              speakEnglish(item.word, progress.speechRate);
                            }}
                            className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-[#0058bc] text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all active:scale-95"
                            title="Phát âm tiếng Anh"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Collocations / Synonyms Details if expanded */}
                      {(item.collocations?.length > 0 || item.synonyms?.length > 0 || item.audio) && (
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
                          <button
                            onClick={() => toggleExpand(item.word)}
                            className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3 text-[#0058bc]" />
                            <span>{isExpanded ? "Ẩn ghi chú" : "Xem cụm từ & ví dụ"}</span>
                          </button>

                          {isExpanded && (
                            <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 animate-in fade-in duration-200">
                              {item.synonyms?.length > 0 && (
                                <p className="text-[11px]">
                                  <strong className="text-slate-500">Đồng nghĩa:</strong>{" "}
                                  {item.synonyms.join(", ")}
                                </p>
                              )}
                              {item.collocations?.map((col, cIdx) => (
                                <p key={cIdx} className="text-[11px] text-[#0058bc] dark:text-[#389eff]">
                                  • {col}
                                </p>
                              ))}
                              {item.audio && (
                                <a
                                  href={item.audio.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-[#0058bc] hover:underline pt-1"
                                >
                                  <FileAudio className="w-3 h-3" />
                                  <span>Audio: {item.audio.name}</span>
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Row: Meaning & Mastery Check Button */}
                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                        {item.meaning || "(Chưa có nghĩa)"}
                      </p>

                      <button
                        onClick={() => {
                          if (!isMastered) {
                            playHaptic("success", soundEnabled);
                            try {
                              confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
                            } catch (e) {
                              console.debug("Confetti error:", e);
                            }
                          } else {
                            playHaptic("pop", soundEnabled);
                          }
                          onToggleMastered(item.word);
                        }}
                        className={`mastery-btn w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                          isMastered
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                            : "border-slate-200 dark:border-white/20 hover:border-emerald-500 text-slate-300 hover:text-emerald-600"
                        }`}
                        title={isMastered ? "Đã thuộc (nhấn để bỏ)" : "Đánh dấu đã thuộc"}
                      >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
