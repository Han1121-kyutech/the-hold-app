"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { HoldButton } from "@/components/HoldButton";
import { LiveCounter } from "@/components/LiveCounter";
import { LoadingScreen } from "@/components/LoadingScreen";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [personalBest, setPersonalBest] = useState(0); // 名前入力ダイアログ用のステート
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [newRecordDuration, setNewRecordDuration] = useState(0);
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("personalBest");
    if (stored) {
      setPersonalBest(parseInt(stored, 10));
    }
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleDurationUpdate = (duration: number) => {
    // 1秒未満は保存しない（誤操作防止）
    if (duration < 1000) return;

    // 自己ベストに関係なく、1秒以上耐えたら保存ダイアログを出す
    // （または duration > personalBest の条件を外す）
    setNewRecordDuration(duration);
    setShowNamePrompt(true);

    // 自己ベストの表示だけ更新しておく
    if (duration > personalBest) {
      setPersonalBest(duration);
      localStorage.setItem("personalBest", duration.toString());
    }
  };
  const submitScore = async () => {
    const nameToSave =
      playerName.trim() === "" ? "Anonymous" : playerName.trim();

    const { error } = await supabase.from("leaderboard").insert([
      {
        player_name: nameToSave,
        duration: newRecordDuration,
        session_id: `session-${Date.now()}`,
      },
    ]);

    if (error) {
      console.error("保存エラー:", error);
      alert("エラーが発生しました。");
    } else {
      // 成功したらランキングページへ強制移動！これで最新の順位が見れます
      router.push("/leaderboard");
    }

    setShowNamePrompt(false);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* 背景エフェクト */}     {" "}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
           {" "}
      <div className="absolute inset-0 opacity-20">
               {" "}
        <div className="absolute top-20 left-20 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
               {" "}
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gray-700 rounded-full blur-3xl" />
             {" "}
      </div>
           {" "}
      <div className="relative z-10 min-h-screen flex flex-col">
               {" "}
        <header className="p-6 md:p-8">
                   {" "}
          <div className="max-w-7xl mx-auto flex items-center justify-between">
                       {" "}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
                           {" "}
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                THE <span className="text-amber-500">HOLD</span>
                             {" "}
              </h1>
                           {" "}
              <p className="text-gray-400 text-sm mt-1">Test your endurance.</p>
                         {" "}
            </motion.div>
                       {" "}
            <div className="flex items-center gap-6">
                            <LiveCounter />             {" "}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                               {" "}
                <Link href="/leaderboard">
                                   {" "}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
                  >
                                       {" "}
                    <TrendingUp className="w-5 h-5 text-amber-500" />           
                           {" "}
                    <span className="hidden md:inline">Leaderboard</span>       
                             {" "}
                  </motion.button>
                                 {" "}
                </Link>
                             {" "}
              </motion.div>
                         {" "}
            </div>
                     {" "}
          </div>
                 {" "}
        </header>
               {" "}
        <main className="flex-1 flex items-center justify-center p-6">
                   {" "}
          <div className="w-full max-w-4xl">
                       {" "}
            <HoldButton
              onDurationUpdate={handleDurationUpdate}
              personalBest={personalBest}
            />
                     {" "}
          </div>
                 {" "}
        </main>
             {" "}
      </div>
            {/* 名前入力ポップアップ */}     {" "}
      {showNamePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                   {" "}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-amber-500/50 p-8 rounded-2xl w-full max-w-md shadow-2xl"
          >
                       {" "}
            <h2 className="text-2xl font-bold text-amber-500 mb-2">
                            NEW RECORD!            {" "}
            </h2>
                       {" "}
            <p className="text-gray-300 mb-6">
              記録を更新しました。
              <br />
              リーダーボードに名前を残しましょう。{" "}
            </p>
                       {" "}
            <input
              type="text"
              placeholder="Your Name (max 12 chars)"
              maxLength={12}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors mb-6"
            />
                       {" "}
            <div className="flex justify-end gap-3">
                           {" "}
              <button
                onClick={() => setShowNamePrompt(false)}
                className="px-5 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                                Skip              {" "}
              </button>
                           {" "}
              <button
                onClick={submitScore}
                className="px-5 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-colors"
              >
                                Submit Score              {" "}
              </button>
                         {" "}
            </div>
                     {" "}
          </motion.div>
                 {" "}
        </div>
      )}
         {" "}
    </div>
  );
}
