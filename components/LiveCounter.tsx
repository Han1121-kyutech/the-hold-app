'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function LiveCounter() {
  const [activeCount, setActiveCount] = useState<number>(0);

  useEffect(() => {
    const fetchActiveCount = async () => {
      const { count } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setActiveCount(count || 0);
    };

    fetchActiveCount();

    const channel = supabase
      .channel('active-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions',
          filter: 'is_active=eq.true',
        },
        () => {
          fetchActiveCount();
        }
      )
      .subscribe();

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
          initial={{ scale: 1.2, color: '#f59e0b' }}
          animate={{ scale: 1, color: '#d1d5db' }}
          className="text-2xl font-bold"
        >
          {activeCount}
        </motion.span>
      </div>
    </motion.div>
  );
}
