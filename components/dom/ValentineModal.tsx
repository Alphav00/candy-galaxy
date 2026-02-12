'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';

interface ValentineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ValentineModal({ isOpen, onClose }: ValentineModalProps) {
  const pet = useGameStore((s) => s.pet);
  const setScreen = useGameStore((s) => s.setScreen);

  const handleClose = () => {
    setScreen('game');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-b from-pink-500/80 to-purple-600/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', damping: 15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative max-w-md w-full">
              {/* Floating hearts */}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  initial={{ 
                    x: Math.random() * 300 - 150,
                    y: 300,
                    opacity: 0 
                  }}
                  animate={{ 
                    y: -300,
                    opacity: [0, 1, 1, 0],
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    duration: 3 + Math.random() * 2,
                    delay: Math.random() * 2,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 3
                  }}
                >
                  {['💖', '💕', '✨', '🌟', '💗'][Math.floor(Math.random() * 5)]}
                </motion.div>
              ))}

              {/* Card */}
              <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden relative"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-pink-400 via-red-400 to-pink-400 p-6 text-white text-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="inline-block"
                  >
                    <Heart className="w-16 h-16 fill-white" />
                  </motion.div>
                  <h1 className="text-3xl font-bold mt-4">Happy Valentine&apos;s Day!</h1>
                </div>

                {/* Content */}
                <div className="p-8 text-center">
                  {/* Characters */}
                  <div className="flex justify-center gap-8 mb-6">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center text-3xl mx-auto mb-2 shadow-lg">
                        👧
                      </div>
                      <p className="font-bold text-pink-600">Luca</p>
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-300 to-purple-400 flex items-center justify-center text-3xl mx-auto mb-2 shadow-lg">
                        👦
                      </div>
                      <p className="font-bold text-purple-600">Asher</p>
                    </motion.div>
                  </div>

                  {/* Message */}
                  <div className="space-y-4">
                    <p className="text-gray-700 text-lg">
                      Dear <span className="font-bold text-pink-500">{pet.name || 'Friend'}</span>,
                    </p>
                    <p className="text-gray-600">
                      Thank you for bringing so much love to the Candy Galaxy! 💖
                    </p>
                    <p className="text-gray-600">
                      Your {pet.lineage === 'gummy' ? 'Gummy Dragon' : 'Gateau Guardian'} has grown into a beautiful creature, 
                      and it&apos;s all thanks to your care and dedication.
                    </p>
                    <p className="text-gray-600">
                      Remember: every act of kindness makes the universe a sweeter place! 🌈
                    </p>
                  </div>

                  {/* Signature */}
                  <div className="mt-6 pt-4 border-t border-pink-100">
                    <p className="text-pink-500 font-bold">
                      With love,
                    </p>
                    <p className="text-purple-500 font-bold">
                      Luca & Asher 💕
                    </p>
                  </div>

                  {/* Sparkles */}
                  <div className="flex justify-center gap-2 mt-4">
                    <Sparkles className="w-5 h-5 text-pink-400" />
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <Sparkles className="w-5 h-5 text-pink-400" />
                  </div>

                  {/* Close button */}
                  <Button
                    onClick={handleClose}
                    size="lg"
                    className="mt-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full px-8"
                  >
                    Continue Playing! 🎮
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ValentineModal;
