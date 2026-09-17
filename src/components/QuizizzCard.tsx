"use client";

import React from "react";
import {
  Gamepad2,
  Trophy,
  Clock,
  AlertTriangle,
  ExternalLink,
  FileImage,
  Video,
  FileAudio,
  FileText,
  FolderOpen,
} from "lucide-react";
import { Lesson, ThemeColor } from "@/types/material";
import { playHaptic } from "@/lib/audio";

interface QuizizzCardProps {
  lesson: Lesson;
  themeColor: ThemeColor;
  soundEnabled: boolean;
}

export const QuizizzCard: React.FC<QuizizzCardProps> = ({
  lesson,
  soundEnabled,
}) => {
  const quiz = lesson.quizizz;
  const attachments = lesson.attachments || [];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2 space-y-4 pb-28">
      {/* Quizizz Game Widget */}
      {quiz ? (
        <div className="ios-glass-card rounded-[28px] p-6 sm:p-7 relative overflow-hidden space-y-4 border border-purple-500/20 bg-gradient-to-br from-purple-500/[0.05] to-blue-500/[0.05]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-400">
                <Gamepad2 className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                Game Ôn Tập Từ Vựng
              </span>
            </div>

            {quiz.deadline && (
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Hạn: {quiz.deadline}</span>
              </div>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
            {quiz.title}
          </h3>

          {quiz.reward && (
            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-2.5 text-amber-900 dark:text-amber-200">
              <Trophy className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs uppercase tracking-wide text-amber-600 dark:text-amber-400">
                  Cơ cấu giải thưởng
                </span>
                <p className="text-xs sm:text-sm font-semibold mt-0.5">{quiz.reward}</p>
              </div>
            </div>
          )}

          {quiz.notes && (
            <div className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {quiz.notes}
            </div>
          )}

          <a
            href={quiz.url}
            target="_blank"
            rel="noreferrer"
            onClick={() => playHaptic("pop", soundEnabled)}
            className="w-full py-3.5 px-6 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Mở & Chơi Quizizz Ngay</span>
            <ExternalLink className="w-4 h-4 opacity-80" />
          </a>
        </div>
      ) : (
        <div className="ios-glass-card rounded-[24px] p-6 text-center text-neutral-500">
          Chưa có game Quizizz cho ngày này.
        </div>
      )}

      {/* Attachments / Files Area (iOS 18 Files Style) */}
      <div className="ios-glass-card rounded-[28px] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-[#007AFF]" />
          <h4 className="text-base font-bold text-neutral-900 dark:text-white">
            Tài Liệu & Đính Kèm ({attachments.length})
          </h4>
        </div>

        {attachments.length === 0 ? (
          <p className="text-xs text-neutral-400">Không có tệp đính kèm nào.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {attachments.map((att) => {
              let Icon = FileText;
              let badgeColor = "bg-neutral-100 text-neutral-600";
              if (att.type === "Image") {
                Icon = FileImage;
                badgeColor = "bg-blue-500/15 text-[#007AFF]";
              } else if (att.type === "Video") {
                Icon = Video;
                badgeColor = "bg-red-500/15 text-red-500";
              } else if (att.type === "Audio") {
                Icon = FileAudio;
                badgeColor = "bg-amber-500/15 text-amber-500";
              }

              return (
                <a
                  key={att.id}
                  href={att.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => playHaptic("click", soundEnabled)}
                  className="p-3.5 rounded-2xl bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between gap-3 group transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className={`p-2 rounded-xl shrink-0 ${badgeColor}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                        {att.name}
                      </div>
                      <div className="text-[11px] text-neutral-400">{att.type}</div>
                    </div>
                  </div>

                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#007AFF] shrink-0 transition-colors" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
