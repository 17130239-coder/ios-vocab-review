"use client";

import React, { useState } from "react";
import {
  Volume2,
  Bookmark,
  Check,
  Search,
  ChevronDown,
  ChevronUp,
  FileAudio,
  ExternalLink,
  BookMarked,
  Sparkles,
} from "lucide-react";
import { Lesson, VocabularyItem, ThemeColor, UserProgress } from "@/types/material";
import { speakEnglish, playHaptic } from "@/lib/audio";

interface VocabularyListProps {
  lesson: Lesson;
  progress: UserProgress;
  themeColor: ThemeColor;
  soundEnabled: boolean;
  onToggleMastered: (word: string) => void;
  onToggleBookmark: (word: string) => void;
}

export const VocabularyList: React.FC<VocabularyListProps> = ({
  lesson,
  progress,
  soundEnabled,
  onToggleMastered,
  onToggleBookmark,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "learning" | "mastered" | "bookmarked">("all");
  const [expandedWords, setExpandedWords] = useState<Record<string, boolean>>({});

  const vocab = lesson.vocabulary || [];

  const toggleExpand = (word: string) => {
    playHaptic("click", soundEnabled);
    setExpandedWords((prev) => ({ ...prev, [word]: !prev[word] }));
  };

  const filteredVocab = vocab.filter((item) => {
    const isMastered = !!progress.masteredWords[`${lesson.day_number}_${item.word}`];
    const isBookmarked = !!progress.bookmarkedWords[`${lesson.day_number}_${item.word}`];

    if (filterMode === "mastered" && !isMastered) return false;
    if (filterMode === "learning" && isMastered) return false;
    if (filterMode === "bookmarked" && !isBookmarked) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.word.toLowerCase().includes(q) ||
      (item.meaning && item.meaning.toLowerCase().includes(q)) ||
      (item.raw_text && item.raw_text.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2 space-y-4 pb-28">
      {/* Search & Filter Bar (iOS 18 Segmented + Search) */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm từ vựng hoặc nghĩa tiếng Việt..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 dark:bg-[#1c1c1e]/75 border border-black/[0.06] dark:border-white/[0.08] text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
          />
        </div>

        {/* iOS 18 Segmented Control Filter */}
        <div className="flex items-center p-1 bg-neutral-200/70 dark:bg-[#242426]/70 rounded-2xl text-xs font-medium backdrop-blur-md overflow-x-auto no-scrollbar">
          {[
            { key: "all", label: `Tất cả (${vocab.length})` },
            {
              key: "learning",
              label: `Chưa thuộc (${vocab.filter((v) => !progress.masteredWords[`${lesson.day_number}_${v.word}`]).length})`,
            },
            {
              key: "mastered",
              label: `Đã nhớ (${vocab.filter((v) => progress.masteredWords[`${lesson.day_number}_${v.word}`]).length})`,
            },
            {
              key: "bookmarked",
              label: `Đánh dấu (${vocab.filter((v) => progress.bookmarkedWords[`${lesson.day_number}_${v.word}`]).length})`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                playHaptic("pop", soundEnabled);
                setFilterMode(tab.key as typeof filterMode);
              }}
              className={`flex-1 min-w-[75px] py-1.5 px-3 rounded-xl transition-all duration-200 whitespace-nowrap text-center ${
                filterMode === tab.key
                  ? "bg-white dark:bg-[#323234] text-neutral-900 dark:text-white shadow-sm font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vocabulary Cards List */}
      {filteredVocab.length === 0 ? (
        <div className="ios-glass-card rounded-2xl p-8 text-center text-neutral-500 space-y-2">
          <BookMarked className="w-8 h-8 mx-auto text-neutral-400 opacity-60" />
          <p className="text-sm font-medium">Không tìm thấy từ vựng phù hợp với bộ lọc</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVocab.map((item, idx) => {
            const isMastered = !!progress.masteredWords[`${lesson.day_number}_${item.word}`];
            const isBookmarked = !!progress.bookmarkedWords[`${lesson.day_number}_${item.word}`];
            const isExpanded = !!expandedWords[item.word];

            return (
              <div
                key={idx}
                className={`ios-glass-card rounded-[24px] p-4 sm:p-5 transition-all duration-200 ${
                  isMastered ? "border-emerald-500/30 bg-emerald-500/[0.02]" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500">
                        #{item.index || idx + 1}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        {item.word}
                      </h3>
                      {item.part_of_speech && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-300">
                          {item.part_of_speech}
                        </span>
                      )}
                      {item.pronunciation && (
                        <span className="text-xs font-mono text-[#007AFF] dark:text-[#389eff]">
                          {item.pronunciation}
                        </span>
                      )}
                    </div>

                    {/* Meaning */}
                    {item.meaning && (
                      <p className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-neutral-100 pt-0.5">
                        {item.meaning}
                      </p>
                    )}
                  </div>

                  {/* Right side actions (Pronounce, Bookmark, Mastered) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        playHaptic("click", soundEnabled);
                        speakEnglish(item.word, progress.speechRate);
                      }}
                      className="w-9 h-9 rounded-full bg-[#007AFF]/12 dark:bg-[#007AFF]/25 hover:bg-[#007AFF]/20 text-[#007AFF] dark:text-[#389eff] flex items-center justify-center transition-all active:scale-95"
                      title="Phát âm tiếng Anh"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        playHaptic("pop", soundEnabled);
                        onToggleBookmark(item.word);
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                        isBookmarked
                          ? "bg-amber-500/20 text-amber-500"
                          : "bg-neutral-100 dark:bg-white/10 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                      }`}
                      title={isBookmarked ? "Bỏ đánh dấu" : "Đánh dấu từ khó"}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-amber-500" : ""}`} />
                    </button>

                    <button
                      onClick={() => {
                        playHaptic("success", soundEnabled);
                        onToggleMastered(item.word);
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                        isMastered
                          ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                          : "bg-neutral-100 dark:bg-white/10 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                      }`}
                      title={isMastered ? "Đã thuộc từ này" : "Đánh dấu đã thuộc"}
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Collocations, Synonyms or Details */}
                {(item.collocations?.length > 0 ||
                  item.synonyms?.length > 0 ||
                  item.examples?.length > 0 ||
                  item.audio) && (
                  <div className="mt-3 pt-3 border-t border-black/[0.04] dark:border-white/[0.06]">
                    <button
                      onClick={() => toggleExpand(item.word)}
                      className="w-full flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 font-medium py-1"
                    >
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#007AFF]" />
                        {isExpanded ? "Ẩn chi tiết ngữ cảnh & cụm từ" : "Xem cụm từ, đồng nghĩa & ví dụ"}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 space-y-2 text-xs leading-relaxed animate-in fade-in-50 duration-200">
                        {item.synonyms?.length > 0 && (
                          <div className="p-2 rounded-xl bg-neutral-100/80 dark:bg-white/5">
                            <span className="font-semibold text-neutral-600 dark:text-neutral-300">
                              Từ đồng nghĩa:
                            </span>{" "}
                            <span className="text-neutral-800 dark:text-neutral-200">
                              {item.synonyms.join(", ")}
                            </span>
                          </div>
                        )}

                        {item.collocations?.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 text-[#007AFF] dark:text-[#389eff] space-y-1">
                            <span className="font-bold">Collocations & Điểm thi cần nhớ:</span>
                            {item.collocations.map((c, cIdx) => (
                              <p key={cIdx} className="text-neutral-700 dark:text-neutral-200">
                                • {c}
                              </p>
                            ))}
                          </div>
                        )}

                        {item.examples?.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-neutral-100/80 dark:bg-white/5 space-y-1">
                            <span className="font-semibold text-neutral-600 dark:text-neutral-300">
                              Ví dụ trong bài:
                            </span>
                            {item.examples.map((ex, exIdx) => (
                              <p key={exIdx} className="italic text-neutral-700 dark:text-neutral-300">
                                &ldquo;{ex}&rdquo;
                              </p>
                            ))}
                          </div>
                        )}

                        {item.audio && (
                          <div className="pt-1">
                            <a
                              href={item.audio.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-[#007AFF] hover:underline font-medium"
                            >
                              <FileAudio className="w-3.5 h-3.5" />
                              <span>Nghe audio gốc ({item.audio.name})</span>
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
