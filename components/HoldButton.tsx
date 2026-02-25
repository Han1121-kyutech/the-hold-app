"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import { supabase } from '@/lib/supabase'; // ← 後で使います
import { AudioFeedback } from "@/lib/audio";

interface HoldButtonProps {
  onDurationUpdate: (duration: number) => void;
  personalBest: number;
}

export function HoldButton({
  onDurationUpdate,
  personalBest,
}: HoldButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [duration, setDuration] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showFailAnimation, setShowFailAnimation] = useState(false);

  const audioRef = useRef<AudioFeedback | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // ★ 重要：イベントリスナーから最新のisHoldingを参照するためのRef
  const isHoldingRef = useRef(false);

  // 初期化とクリーンアップ
  useEffect(() => {
    audioRef.current = new AudioFeedback();
    return () => {
      if (audioRef.current) audioRef.current.cleanup();
      if (heartbeatIntervalRef.current)
        clearInterval(heartbeatIntervalRef.current);
      if (durationIntervalRef.current)
        clearInterval(durationIntervalRef.current);
    };
  }, []);

  // isHoldingの状態が変わるたびにRefも更新する
  useEffect(() => {
    isHoldingRef.current = isHolding;
  }, [isHolding]);

  const startSession = useCallback(async () => {
    // ※Supabase連携前の一時的なモック処理
    const newSessionId = `session-${Date.now()}`;
    const startTime = new Date();
    return { sessionId: newSessionId, startTime };
  }, []);

  const endSession = useCallback(
    async (sid: string, finalDuration: number) => {
      console.log(`Session ${sid} ended. Final duration: ${finalDuration}`);
      // 記録が更新されたら親コンポーネント(page.tsx)に知らせる
      onDurationUpdate(finalDuration);
    },
    [onDurationUpdate],
  );

  // ★ 離した時の処理を独立させる
  const handleStop = useCallback(async () => {
    // 既に止まっている場合は何もしない
    if (!isHoldingRef.current || !sessionId) return;

    if (audioRef.current) audioRef.current.stopPulse();
    if (heartbeatIntervalRef.current)
      clearInterval(heartbeatIntervalRef.current);
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);

    const finalDuration = duration;
    await endSession(sessionId, finalDuration);

    setIsHolding(false);
    setShowFailAnimation(true);
    setSessionId(null);
    startTimeRef.current = null;

    setTimeout(() => {
      setShowFailAnimation(false);
      setDuration(0);
    }, 2000);
  }, [sessionId, duration, endSession]);

  const handlePointerDown = useCallback(
    async (e: React.PointerEvent) => {
      // 右クリックなどは無視
      if (e.button !== 0 && e.pointerType === "mouse") return;
      e.preventDefault();
      if (isHoldingRef.current) return;

      const session = await startSession();
      if (!session) return;

      setSessionId(session.sessionId);
      setIsHolding(true);
      setDuration(0);
      setShowFailAnimation(false);
      startTimeRef.current = session.startTime;

      if (audioRef.current) audioRef.current.startPulse();

      durationIntervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setDuration(Date.now() - startTimeRef.current.getTime());
        }
      }, 50); // 50msごとに画面を更新
    },
    [startSession],
  );

  // ★ 画面全体での「離した」「中断された」イベントを監視する最強のフック
  useEffect(() => {
    // 指を離した、または画面外に出た
    const onGlobalPointerUp = () => {
      if (isHoldingRef.current) handleStop();
    };

    // タブを切り替えた、最小化した
    const onVisibilityChange = () => {
      if (document.hidden && isHoldingRef.current) handleStop();
    };

    // スマホの着信などでブラウザからフォーカスが外れた
    const onBlur = () => {
      if (isHoldingRef.current) handleStop();
    };

    if (isHolding) {
      window.addEventListener("pointerup", onGlobalPointerUp);
      window.addEventListener("pointercancel", onGlobalPointerUp);
      window.addEventListener("contextmenu", onGlobalPointerUp);
      document.addEventListener("visibilitychange", onVisibilityChange);
      window.addEventListener("blur", onBlur);
    }

    return () => {
      window.removeEventListener("pointerup", onGlobalPointerUp);
      window.removeEventListener("pointercancel", onGlobalPointerUp);
      window.removeEventListener("contextmenu", onGlobalPointerUp);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
    };
  }, [isHolding, handleStop]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative flex items-center justify-center">
      <AnimatePresence>
        {showFailAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 2] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 rounded-full border-4 border-red-500"
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          scale: isHolding ? [1, 1.05, 1] : 1,
          boxShadow: isHolding
            ? [
                "0 0 20px rgba(245, 158, 11, 0.3)",
                "0 0 60px rgba(245, 158, 11, 0.6)",
                "0 0 20px rgba(245, 158, 11, 0.3)",
              ]
            : "0 0 20px rgba(245, 158, 11, 0.2)",
        }}
        transition={{
          duration: 1,
          repeat: isHolding ? Infinity : 0,
          ease: "easeInOut",
        }}
        onPointerDown={handlePointerDown}
        // ★ バグの原因だった onPointerUp や onPointerLeave をここから削除しました
        className="relative w-80 h-80 md:w-96 md:h-96 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center cursor-pointer select-none touch-none border-4 border-amber-500"
        style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none" }}
        role="button"
        aria-label="Hold button to start game"
        aria-pressed={isHolding}
      >
        <div className="text-center pointer-events-none">
          <motion.div
            animate={{ scale: isHolding ? 1.1 : 1 }}
            className="text-6xl md:text-7xl font-bold text-white mb-4 tabular-nums"
          >
            {formatTime(duration)}
          </motion.div>
          <motion.div
            animate={{ opacity: isHolding ? 1 : 0.6 }}
            className="text-amber-500 text-lg uppercase tracking-widest"
          >
            {isHolding ? "HOLDING..." : "PRESS & HOLD"}
          </motion.div>
          {personalBest > 0 && !isHolding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-400 text-sm mt-4"
            >
              Personal Best: {formatTime(personalBest)}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
