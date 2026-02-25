"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function LiveCounter() {
  const [activeCount, setActiveCount] = useState<number>(0);

  useEffect(() => {
    // プレゼンス（今いる人を数える）用のチャンネルを作成
    const channel = supabase.channel("online-users", {
      config: {
        presence: {
          key: "user",
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        // 全ユーザーのプレゼンス状態を取得
        const newState = channel.presenceState();
        // 重複を除いた接続数をカウント
        const totalConnections = Object.values(newState).flat().length;
        setActiveCount(totalConnections);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        console.log("新規プレイヤーが参加しました", newPresences);
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        console.log("プレイヤーが退出しました", leftPresences);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // チャンネルに参加したことを自分自身も報告
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 text-gray-300"
    >
      <Users className="w-5 h-5 text-amber-500" />
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 uppercase tracking-wider">
          Active Players
        </span>
        <motion.span
          key={activeCount}
          initial={{ scale: 1.2, color: "#f59e0b" }}
          animate={{ scale: 1, color: "#d1d5db" }}
          className="text-2xl font-bold font-mono"
        >
          {activeCount}
        </motion.span>
      </div>
    </motion.div>
  );
}
