"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  RotateCcw,
  Sparkles,
  FileText,
  BookOpen,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Lesson, ThemeColor, UserProgress } from "@/types/material";
import { playHaptic } from "@/lib/audio";

interface ExerciseSessionProps {
  lesson: Lesson;
  progress: UserProgress;
  themeColor: ThemeColor;
  soundEnabled: boolean;
  onSetExerciseCompleted: (questionNumber: number, completed: boolean) => void;
}

export const ExerciseSession: React.FC<ExerciseSessionProps> = ({
  lesson,
  progress,
  soundEnabled,
  onSetExerciseCompleted,
}) => {
  const exercises = lesson.homework?.exercises || [];
  const [activeTab, setActiveTab] = useState<"exercises" | "quiz">("exercises");

  // State for user answers in interactive exercises: question_number -> slot_index -> selected_word
  const [selectedWords, setSelectedWords] = useState<Record<number, Record<number, string>>>({});
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});

  // Multiple choice quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const vocab = lesson.vocabulary || [];

  // Parse exercise content into components: sentence, vietnamese translation, word options
  const parseExercise = (raw: string) => {
    // raw format e.g. "Jack's ___[1] ___[2] ... [Công ty] của Jack ... holds every PERFORMANCE ... => Jack's ... "
    const parts = raw.split("=>");
    const mainPart = parts[0] || raw;

    // Extract blanks count
    const blankMatches = mainPart.match(/___\[\d+\]/g) || [];
    const blankCount = blankMatches.length;

    // Extract Vietnamese translation inside or after sentence
    const vietnameseMatches = mainPart.match(/\[.*?\]/g);
    let vietnameseGuide = "";
    if (vietnameseMatches && vietnameseMatches.length > 0) {
      // Find where Vietnamese starts
      const firstBracketIdx = mainPart.indexOf("[");
      if (firstBracketIdx !== -1) {
        vietnameseGuide = mainPart.substring(firstBracketIdx);
      }
    }

    return {
      raw,
      blankCount,
      vietnameseGuide,
    };
  };

  const handleSelectChip = (qNum: number, blankIdx: number, word: string) => {
    playHaptic("pop", soundEnabled);
    setSelectedWords((prev) => ({
      ...prev,
      [qNum]: {
        ...(prev[qNum] || {}),
        [blankIdx]: word,
      },
    }));
  };

  const handleClearSlots = (qNum: number) => {
    playHaptic("click", soundEnabled);
    setSelectedWords((prev) => {
      const next = { ...prev };
      delete next[qNum];
      return next;
    });
  };

  const handleToggleComplete = (qNum: number) => {
    const isCompleted = !!progress.completedExercises[`${lesson.day_number}_${qNum}`];
    if (!isCompleted) {
      playHaptic("success", soundEnabled);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch (e) {
        console.debug("Confetti error:", e);
      }
    } else {
      playHaptic("click", soundEnabled);
    }
    onSetExerciseCompleted(qNum, !isCompleted);
  };

  // Vocab Quiz logic
  const currentQuizWord = vocab[quizIndex];
  const generateQuizOptions = (correct: string) => {
    const wrongOptions = vocab
      .filter((v) => v.meaning && v.meaning !== correct)
      .map((v) => v.meaning)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    // If not enough options from current day, add placeholder distractors
    const fillers = ["sự cải tiến", "chính sách bồi thường", "người tiêu dùng", "hạn chế ngân sách"];
    while (wrongOptions.length < 3) {
      const f = fillers[wrongOptions.length % fillers.length];
      if (!wrongOptions.includes(f) && f !== correct) {
        wrongOptions.push(f);
      } else {
        break;
      }
    }

    return [correct, ...wrongOptions].sort(() => 0.5 - Math.random());
  };

  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  React.useEffect(() => {
    if (currentQuizWord) {
      setQuizOptions(generateQuizOptions(currentQuizWord.meaning || ""));
      setQuizSelectedOption(null);
    }
  }, [quizIndex, lesson.day_number]);

  const handleAnswerQuiz = (opt: string) => {
    if (quizSelectedOption) return;
    setQuizSelectedOption(opt);
    const isCorrect = opt === currentQuizWord?.meaning;
    if (isCorrect) {
      playHaptic("success", soundEnabled);
      setQuizScore((prev) => prev + 1);
    } else {
      playHaptic("wrong", soundEnabled);
    }

    setTimeout(() => {
      if (quizIndex < vocab.length - 1) {
        setQuizIndex((prev) => prev + 1);
      } else {
        setQuizFinished(true);
        try {
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        } catch (e) {
          console.debug("Confetti error:", e);
        }
      }
    }, 1100);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2 space-y-4 pb-28">
      {/* Tab Switcher: Exercises vs Quick Quiz */}
      <div className="flex items-center p-1 bg-neutral-200/70 dark:bg-[#242426]/70 rounded-2xl text-xs font-medium backdrop-blur-md">
        <button
          onClick={() => {
            playHaptic("pop", soundEnabled);
            setActiveTab("exercises");
          }}
          className={`flex-1 py-2 px-3 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center gap-1.5 ${
            activeTab === "exercises"
              ? "bg-white dark:bg-[#323234] text-neutral-900 dark:text-white shadow-sm"
              : "text-neutral-600 dark:text-neutral-400"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Bài tập về nhà ({exercises.length} câu)</span>
        </button>

        <button
          onClick={() => {
            playHaptic("pop", soundEnabled);
            setActiveTab("quiz");
            setQuizIndex(0);
            setQuizScore(0);
            setQuizFinished(false);
          }}
          className={`flex-1 py-2 px-3 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center gap-1.5 ${
            activeTab === "quiz"
              ? "bg-white dark:bg-[#323234] text-neutral-900 dark:text-white shadow-sm"
              : "text-neutral-600 dark:text-neutral-400"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#007AFF]" />
          <span>Trắc nghiệm nhanh ({vocab.length} từ)</span>
        </button>
      </div>

      {activeTab === "exercises" ? (
        <div className="space-y-4">
          {/* Homework Instructions Card */}
          {lesson.homework && (
            <div className="ios-glass-card rounded-[24px] p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#007AFF] uppercase tracking-wider">
                  Hướng dẫn bài tập
                </span>
                {lesson.homework.form_url && (
                  <a
                    href={lesson.homework.form_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#007AFF] hover:underline"
                  >
                    <span>Google Forms nộp bài</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              {lesson.homework.instructions && (
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
                  {lesson.homework.instructions}
                </p>
              )}
            </div>
          )}

          {/* Exercise Items */}
          {exercises.length === 0 ? (
            <div className="ios-glass-card rounded-2xl p-8 text-center text-neutral-500 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-neutral-400 opacity-60" />
              <p className="text-sm font-medium">Ngày này không có câu bài tập viết câu.</p>
              <p className="text-xs text-neutral-400">Bạn có thể chuyển qua tab Trắc nghiệm nhanh để ôn từ vựng!</p>
            </div>
          ) : (
            exercises.map((ex) => {
              const isCompleted = !!progress.completedExercises[`${lesson.day_number}_${ex.question_number}`];
              const isHintRevealed = !!revealedHints[ex.question_number];
              const parsed = parseExercise(ex.content);

              return (
                <div
                  key={ex.question_number}
                  className={`ios-glass-card rounded-[24px] p-5 sm:p-6 space-y-4 transition-all duration-200 ${
                    isCompleted ? "border-emerald-500/30 bg-emerald-500/[0.02]" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#007AFF]/15 text-[#007AFF] dark:text-[#389eff] text-xs font-bold flex items-center justify-center">
                        {ex.question_number}
                      </span>
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                        Câu {ex.question_number}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleComplete(ex.question_number)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isCompleted
                          ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                          : "bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isCompleted ? "Đã làm xong" : "Đánh dấu hoàn thành"}</span>
                    </button>
                  </div>

                  {/* Question Content */}
                  <div className="space-y-2">
                    <p className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-white leading-relaxed">
                      {ex.content.split("=>")[0]?.trim()}
                    </p>

                    {ex.content.includes("=>") && (
                      <div className="p-3 rounded-2xl bg-neutral-100/80 dark:bg-white/5 font-mono text-xs text-neutral-700 dark:text-neutral-300">
                        {ex.content.substring(ex.content.indexOf("=>"))}
                      </div>
                    )}
                  </div>

                  {/* Actions / Hint */}
                  <div className="flex items-center justify-between pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
                    <button
                      onClick={() => {
                        playHaptic("click", soundEnabled);
                        setRevealedHints((prev) => ({
                          ...prev,
                          [ex.question_number]: !prev[ex.question_number],
                        }));
                      }}
                      className="flex items-center gap-1 text-xs text-[#007AFF] hover:underline font-medium"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{isHintRevealed ? "Ẩn nội dung gốc" : "Xem nội dung đề & hướng dẫn"}</span>
                    </button>
                  </div>

                  {isHintRevealed && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 text-xs text-amber-900 dark:text-amber-200 space-y-1 animate-in fade-in-50">
                      <div className="font-bold text-amber-600 dark:text-amber-400">Nội dung đầy đủ trong đề:</div>
                      <p className="leading-relaxed">{ex.content}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Vocab Multiple Choice Quiz Tab */
        <div className="ios-glass-card rounded-[28px] p-6 sm:p-8 space-y-6">
          {!quizFinished && currentQuizWord ? (
            <>
              <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
                <span>
                  Câu hỏi {quizIndex + 1} / {vocab.length}
                </span>
                <span>
                  Điểm số: <strong className="text-[#007AFF]">{quizScore}</strong>
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#007AFF] h-full rounded-full transition-all duration-300"
                  style={{ width: `${((quizIndex + 1) / vocab.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <div className="text-center py-4 space-y-2">
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold">
                  Chọn nghĩa tiếng Việt chính xác
                </span>
                <h3 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white">
                  {currentQuizWord.word}
                </h3>
                {currentQuizWord.pronunciation && (
                  <p className="text-sm font-mono text-[#007AFF]">{currentQuizWord.pronunciation}</p>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2.5">
                {quizOptions.map((opt, idx) => {
                  const isSelected = quizSelectedOption === opt;
                  const isCorrect = opt === currentQuizWord.meaning;
                  let btnStyle =
                    "bg-white/80 dark:bg-[#2c2c2e] hover:bg-white dark:hover:bg-[#38383a] text-neutral-800 dark:text-neutral-200 border-black/[0.06] dark:border-white/[0.08]";

                  if (quizSelectedOption) {
                    if (isCorrect) {
                      btnStyle = "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 border-emerald-600";
                    } else if (isSelected) {
                      btnStyle = "bg-rose-500 text-white border-rose-600";
                    } else {
                      btnStyle = "opacity-40 bg-neutral-100 dark:bg-white/5";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerQuiz(opt)}
                      disabled={quizSelectedOption !== null}
                      className={`w-full p-4 rounded-2xl border text-left font-semibold text-sm transition-all duration-200 active:scale-[0.99] flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {quizSelectedOption && isCorrect && <CheckCircle2 className="w-5 h-5 text-white" />}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Quiz Completed */
            <div className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-neutral-900 dark:text-white">Hoàn Thành Trắc Nghiệm!</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Bạn trả lời đúng <strong>{quizScore}</strong> trên <strong>{vocab.length}</strong> từ vựng của DAY{" "}
                  {lesson.day_number}!
                </p>
              </div>

              <button
                onClick={() => {
                  playHaptic("pop", soundEnabled);
                  setQuizIndex(0);
                  setQuizScore(0);
                  setQuizFinished(false);
                }}
                className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-[#007AFF] hover:bg-[#0071eb] text-white font-semibold text-sm shadow-md shadow-[#007AFF]/30 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm lại trắc nghiệm</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
