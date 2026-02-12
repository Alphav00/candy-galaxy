'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Star } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { EVOLUTION_NAMES, LINEAGE_COLORS } from '@/lib/constants';

interface EvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EvolutionModal({ isOpen, onClose }: EvolutionModalProps) {
  const pet = useGameStore((s) => s.pet);
  const setScreen = useGameStore((s) => s.setScreen);
  const [phase, setPhase] = useState(0);

  const lineageColor = pet.lineage ? LINEAGE_COLORS[pet.lineage] : { primary: '#FF69B4', secondary: '#FFB6C1' };
  const evolutionName = pet.lineage ? EVOLUTION_NAMES[pet.lineage][pet.stage] : 'Unknown';

  useEffect(() => {
    if (isOpen) {
      setPhase(0);
      const timer1 = setTimeout(() => setPhase(1), 1000);
      const timer2 = setTimeout(() => setPhase(2), 2500);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setScreen('game');
    onClose();
  };

  // Generate random particles
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    angle: (i / 30) * Math.PI * 2,
    distance: 100 + Math.random() * 100,
    size: Math.random() * 10 + 5,
    delay: Math.random() * 0.5,
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50"
          />

          {/* Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Particle explosion */}
            {phase >= 1 && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ 
                      x: '50%', 
                      y: '50%', 
                      scale: 0,
                      opacity: 1 
                    }}
                    animate={{ 
                      x: `calc(50% + ${Math.cos(p.angle) * p.distance}px)`,
                      y: `calc(50% + ${Math.sin(p.angle) * p.distance}px)`,
                      scale: [0, 1.5, 0],
                      opacity: [1, 1, 0]
                    }}
                    transition={{ 
                      duration: 1.5,
                      delay: p.delay,
                      ease: 'easeOut'
                    }}
                    className="absolute"
                  >
                    {['✨', '⭐', '💫', '🌟', '✨'][p.id % 5]}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Main content */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10 }}
              className="relative text-center"
            >
              {/* Glow background */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 blur-3xl"
                style={{ backgroundColor: lineageColor.primary }}
              />

              {/* Pet visualization */}
              <motion.div
                animate={phase === 1 ? { 
                  scale: [1, 1.3, 1],
                  rotate: [0, 10, -10, 0]
                } : {}}
                transition={{ duration: 0.5 }}
                className="relative mb-8"
              >
                {/* Outer ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 w-32 h-32 mx-auto"
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-4 h-4 text-2xl"
                      style={{
                        top: `${50 + 45 * Math.sin((i / 8) * Math.PI * 2)}%`,
                        left: `${50 + 45 * Math.cos((i / 8) * Math.PI * 2)}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </div>
                  ))}
                </motion.div>

                {/* Pet shape */}
                <motion.div
                  animate={phase >= 2 ? { y: [0, -5, 0] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-32 h-32 mx-auto relative"
                >
                  <div 
                    className="absolute inset-0 rounded-full shadow-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${lineageColor.secondary} 0%, ${lineageColor.primary} 100%)`,
                    }}
                  >
                    {/* Eyes */}
                    <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-black/70 rounded-full">
                      <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-black/70 rounded-full">
                      <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    {/* Smile */}
                    <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-8 h-4 border-b-4 border-black/50 rounded-b-full" />
                  </div>
                </motion.div>
              </motion.div>

              {/* Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 20 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  <h1 className="text-3xl font-bold text-white">Evolution!</h1>
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </div>
                
                <motion.p
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl text-white/90 mb-2"
                >
                  {pet.name} evolved into
                </motion.p>
                
                <motion.p
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.7 }}
                  className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400"
                >
                  {evolutionName}!
                </motion.p>

                {/* Stage indicator */}
                <div className="flex justify-center gap-2 mt-4">
                  {[1, 2, 3].map((stage) => (
                    <motion.div
                      key={stage}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.9 + stage * 0.1 }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        stage <= pet.stage
                          ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white'
                          : 'bg-gray-700 text-gray-500'
                      }`}
                    >
                      {stage}
                    </motion.div>
                  ))}
                </div>

                {/* Continue button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="mt-8"
                >
                  <Button
                    onClick={handleClose}
                    size="lg"
                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full px-8"
                  >
                    Amazing! 🎉
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default EvolutionModal;
