'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/stores/gameStore';
import { LINEAGE_COLORS, EVOLUTION_NAMES } from '@/lib/constants';

interface NamingScreenProps {
  onComplete: () => void;
}

export function NamingScreen({ onComplete }: NamingScreenProps) {
  const [name, setName] = useState('');
  const [isExiting, setIsExiting] = useState(false);
  const pet = useGameStore((s) => s.pet);
  const setPetName = useGameStore((s) => s.setPetName);
  const setScreen = useGameStore((s) => s.setScreen);

  const handleConfirm = () => {
    if (name.trim()) {
      setPetName(name.trim());
      setIsExiting(true);
      setTimeout(() => {
        setScreen('game');
      }, 500);
    }
  };

  const lineageColor = pet.lineage ? LINEAGE_COLORS[pet.lineage] : { primary: '#FF69B4', secondary: '#FFB6C1' };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-100 to-purple-100 flex flex-col items-center justify-center p-4"
    >
      {/* Title */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-2">
          Name Your Pet!
        </h1>
        <p className="text-purple-600">What will you call your new friend?</p>
      </motion.div>

      {/* Egg with animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.3 }}
        className="mb-8"
      >
        <div className="relative">
          {/* Glow */}
          <div 
            className="absolute inset-0 w-32 h-36 rounded-full blur-xl opacity-50"
            style={{ backgroundColor: lineageColor.primary }}
          />
          {/* Egg */}
          <motion.div
            animate={{ 
              y: [0, -5, 0],
              rotate: [-2, 2, -2, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-32 h-36 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] relative shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${lineageColor.secondary} 0%, ${lineageColor.primary} 100%)`,
            }}
          >
            {/* Shine */}
            <div className="absolute top-4 left-6 w-6 h-8 bg-white/40 rounded-full transform -rotate-30" />
            {/* Eyes */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex gap-6">
              <motion.div
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                className="w-4 h-4 bg-black/60 rounded-full"
              />
              <motion.div
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, delay: 0.1 }}
                className="w-4 h-4 bg-black/60 rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Input */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-xs"
      >
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter a name..."
          maxLength={15}
          className="text-center text-xl py-6 bg-white/80 border-2 border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-2xl"
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
        />
      </motion.div>

      {/* Hint for easter eggs */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xs text-purple-400 mt-2"
      >
        💡 Try naming your pet "Freddy" or "Celestia" for a surprise!
      </motion.p>

      {/* Confirm button */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        <Button
          onClick={handleConfirm}
          disabled={!name.trim()}
          size="lg"
          className={`font-bold px-8 py-6 text-lg rounded-full shadow-lg transition-all ${
            name.trim()
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {name.trim() ? `Meet ${name.trim()}! 🎉` : 'Enter a Name'}
        </Button>
      </motion.div>
    </motion.div>
  );
}
