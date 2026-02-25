'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Leaderboard } from '@/components/Leaderboard';

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />

      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gray-700 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen">
        <header className="p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors mb-6"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Game
                </motion.button>
              </Link>

              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                THE <span className="text-amber-500">HOLD</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Global Hall of Fame
              </p>
            </motion.div>
          </div>
        </header>

        <main className="p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Leaderboard />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
