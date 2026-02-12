'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/stores/gameStore';

const introDialogue = [
  { text: "Welcome to the Candy Galaxy! 🌌", duration: 3000 },
  { text: "Our world needs your love...", duration: 3000 },
  { text: "I'm Luca! 💖", speaker: 'Luca', duration: 2500 },
  { text: "And I'm Asher! ✨", speaker: 'Asher', duration: 2500 },
  { text: "We need your help to bring joy to this planet!", duration: 3000 },
  { text: "Will you care for a Candy Creature?", duration: 3000 },
];

interface IntroSequenceProps {
  onComplete: () => void;
}

export function IntroSequence({ onComplete }: IntroSequenceProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const introStep = useGameStore((s) => s.introStep);

  useEffect(() => {
    if (currentStep < introDialogue.length && !showButton) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, introDialogue[currentStep]?.duration || 3000);

      return () => clearTimeout(timer);
    } else if (currentStep >= introDialogue.length) {
      setShowButton(true);
    }
  }, [currentStep, showButton]);

  const handleStart = () => {
    setIsExiting(true);
    setTimeout(onComplete, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-40 bg-gradient-to-b from-purple-900 via-pink-800 to-purple-900 overflow-hidden"
    >
      {/* Animated star background */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.3
            }}
            animate={{ 
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{ 
              duration: Math.random() * 2 + 1, 
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Galaxy swirl effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(255,105,180,0.3) 50%, transparent 70%)',
        }}
      />

      {/* Candy Planet preview */}
      <motion.div
        initial={{ scale: 0, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', delay: 0.5, duration: 1 }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2"
      >
        <div className="relative">
          {/* Planet glow */}
          <div className="absolute inset-0 w-32 h-32 rounded-full bg-pink-400/50 blur-xl" />
          {/* Planet */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-300 via-pink-400 to-purple-400 shadow-2xl relative">
            {/* Candy details */}
            <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-pink-200/60" />
            <div className="absolute bottom-6 right-6 w-3 h-3 rounded-full bg-purple-200/60" />
            <div className="absolute top-1/3 right-4 w-2 h-2 rounded-full bg-white/40" />
          </div>
        </div>
      </motion.div>

      {/* Characters */}
      <AnimatePresence>
        {introDialogue[currentStep - 1]?.speaker && (
          <motion.div
            initial={{ x: introDialogue[currentStep - 1]?.speaker === 'Luca' ? -100 : 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute bottom-40 ${introDialogue[currentStep - 1]?.speaker === 'Luca' ? 'left-8' : 'right-8'}`}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center shadow-lg">
              <span className="text-3xl">
                {introDialogue[currentStep - 1]?.speaker === 'Luca' ? '👧' : '👦'}
              </span>
            </div>
            <p className="text-white text-center text-sm mt-1 font-medium">
              {introDialogue[currentStep - 1]?.speaker}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogue box */}
      <div className="absolute bottom-8 left-4 right-4">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        >
          <AnimatePresence mode="wait">
            {currentStep < introDialogue.length ? (
              <motion.p
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-white text-xl text-center font-medium"
              >
                {introDialogue[currentStep]?.text}
              </motion.p>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <p className="text-white text-xl mb-4">Ready to begin your adventure? 🍬</p>
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  Start! 🚀
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
