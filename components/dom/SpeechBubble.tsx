'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';

// Pet messages based on state
const PET_MESSAGES = {
  hungry: [
    "I'm hungry! 🍔",
    "Got any snacks? 🍰",
    "My tummy is rumbling... 🍬",
    "Feed me please! 🧁",
  ],
  sad: [
    "I'm feeling lonely... 💔",
    "Play with me? 🎮",
    "I need attention... 😢",
    "Where are you? 🥺",
  ],
  tired: [
    "I'm sleepy... 😴",
    "*yawns* 💤",
    "So tired... 🌙",
    "Need rest... ☁️",
  ],
  happy: [
    "I love you! 💖",
    "Life is sweet! 🌈",
    "So happy! ✨",
    "You're the best! 🌟",
  ],
  neutral: [
    "Hi there! 👋",
    "What's up? 🌸",
    "Nice day! ☀️",
    "*bounce bounce* 🎀",
  ],
  playful: [
    "Let's play! 🎲",
    "I want to have fun! 🎪",
    "Mini-game time! 🕹️",
    "Game on! 🎯",
  ],
};

export function SpeechBubble() {
  const [message, setMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const pet = useGameStore((s) => s.pet);
  const lastActivityTime = useGameStore((s) => s.lastActivityTime);

  // Get random message from category
  const getRandomMessage = (category: keyof typeof PET_MESSAGES) => {
    const messages = PET_MESSAGES[category];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Determine pet mood and show appropriate message
  useEffect(() => {
    // Don't show bubbles for eggs
    if (pet.stage === 0) return;

    // Determine what message to show
    const getMessageCategory = (): keyof typeof PET_MESSAGES => {
      if (pet.hunger < 30) return 'hungry';
      if (pet.happiness < 30) return 'sad';
      if (pet.energy < 20) return 'tired';
      if (pet.happiness > 80) return 'happy';
      if (pet.happiness > 60) return 'playful';
      return 'neutral';
    };

    const category = getMessageCategory();
    const newMessage = getRandomMessage(category);

    // Show message periodically
    const showMessage = () => {
      setMessage(newMessage);
      setIsVisible(true);
      
      // Hide after 3 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    };

    // Initial message after a short delay
    const initialTimer = setTimeout(showMessage, 2000);

    // Show message every 20-40 seconds
    const interval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityTime;
      
      // Show more frequently if needs are low
      const shouldShow = pet.hunger < 50 || pet.happiness < 50 
        ? timeSinceLastActivity > 10000  // Every 10s if needs are low
        : timeSinceLastActivity > 30000; // Every 30s otherwise
      
      if (shouldShow) {
        setMessage(getRandomMessage(category));
        setIsVisible(true);
        setTimeout(() => setIsVisible(false), 3000);
      }
    }, 5000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [pet.hunger, pet.happiness, pet.energy, pet.stage, lastActivityTime]);

  // Show message on specific actions (called externally)
  const showMessageBubble = (text: string) => {
    setMessage(text);
    setIsVisible(true);
    setTimeout(() => setIsVisible(false), 3000);
  };

  if (pet.stage === 0) return null;

  return (
    <div className="fixed top-32 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <AnimatePresence>
        {isVisible && message && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative"
          >
            {/* Speech bubble */}
            <div className="bg-white rounded-2xl px-5 py-3 shadow-lg border-2 border-pink-200">
              <p className="text-gray-800 font-medium text-center whitespace-nowrap">
                {message}
              </p>
            </div>
            
            {/* Bubble tail */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0">
              <div className="border-l-8 border-r-8 border-t-8 border-transparent border-t-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SpeechBubble;
