'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGameStore } from '@/stores/gameStore';
import { LineageType, LINEAGE_COLORS, EVOLUTION_NAMES } from '@/lib/constants';

interface CharacterSelectProps {
  onComplete: () => void;
}

export function CharacterSelect({ onComplete }: CharacterSelectProps) {
  const [selectedLineage, setSelectedLineage] = useState<LineageType | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const setPetLineage = useGameStore((s) => s.setPetLineage);
  const setScreen = useGameStore((s) => s.setScreen);

  const handleSelect = (lineage: LineageType) => {
    setSelectedLineage(lineage);
  };

  const handleConfirm = () => {
    if (selectedLineage) {
      setPetLineage(selectedLineage);
      setIsExiting(true);
      setTimeout(() => {
        setScreen('naming');
      }, 500);
    }
  };

  const lineages: { type: LineageType; name: string; description: string; emoji: string }[] = [
    {
      type: 'gummy',
      name: 'Gummy Egg',
      description: 'Sweet and bouncy! This lineage loves to play and bounce around.',
      emoji: '🍬',
    },
    {
      type: 'chocolate',
      name: 'Chocolate Egg',
      description: 'Rich and shiny! This lineage is noble and protective.',
      emoji: '🍫',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-pink-200 via-purple-100 to-pink-200 flex flex-col items-center justify-center p-4"
    >
      {/* Title */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-2">
          Choose Your Egg
        </h1>
        <p className="text-purple-600">Which Candy Creature will you raise?</p>
      </motion.div>

      {/* Egg Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {lineages.map((lineage, index) => (
          <motion.div
            key={lineage.type}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-300 ${
                selectedLineage === lineage.type
                  ? 'ring-4 ring-pink-400 shadow-2xl scale-105'
                  : 'hover:shadow-lg hover:scale-102'
              }`}
              onClick={() => handleSelect(lineage.type)}
            >
              <CardContent className="p-6">
                {/* Egg visualization */}
                <div className="flex justify-center mb-4">
                  <motion.div
                    animate={selectedLineage === lineage.type ? { 
                      y: [0, -10, 0],
                      rotate: [-5, 5, -5, 0]
                    } : {}}
                    transition={{ duration: 0.5, repeat: selectedLineage === lineage.type ? Infinity : 0 }}
                    className="relative"
                  >
                    {/* Egg glow */}
                    <div 
                      className="absolute inset-0 w-24 h-28 rounded-full blur-xl opacity-50"
                      style={{ 
                        backgroundColor: LINEAGE_COLORS[lineage.type].primary 
                      }}
                    />
                    {/* Egg shape */}
                    <div 
                      className="w-24 h-28 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] relative shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${LINEAGE_COLORS[lineage.type].secondary} 0%, ${LINEAGE_COLORS[lineage.type].primary} 100%)`,
                      }}
                    >
                      {/* Shine */}
                      <div className="absolute top-3 left-4 w-4 h-6 bg-white/40 rounded-full transform -rotate-30" />
                      {/* Eyes (if selected) */}
                      {selectedLineage === lineage.type && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute top-1/3 left-1/2 -translate-x-1/2 flex gap-4"
                        >
                          <div className="w-3 h-3 bg-black/60 rounded-full" />
                          <div className="w-3 h-3 bg-black/60 rounded-full" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Info */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl">{lineage.emoji}</span>
                    <h3 className="text-xl font-bold text-gray-800">{lineage.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">{lineage.description}</p>
                  
                  {/* Evolution preview */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Evolution Path:</p>
                    <div className="flex justify-center gap-2 text-xs">
                      {EVOLUTION_NAMES[lineage.type].map((name, i) => (
                        <span key={i} className="text-purple-500">
                          {i > 0 && '→ '}{name.split(' ').pop()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Confirm button */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Button
          onClick={handleConfirm}
          disabled={!selectedLineage}
          size="lg"
          className={`font-bold px-8 py-6 text-lg rounded-full shadow-lg transition-all ${
            selectedLineage
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {selectedLineage ? 'Choose This Egg! 🥚' : 'Select an Egg'}
        </Button>
      </motion.div>
    </motion.div>
  );
}
