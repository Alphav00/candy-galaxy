'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useKonamiCode } from '@/hooks/use-konami';
import { useAudio } from '@/lib/audio';
import { toast, Toaster } from 'sonner';

// DOM Components
import { SplashScreen } from '@/components/dom/SplashScreen';
import { IntroSequence } from '@/components/dom/IntroSequence';
import { CharacterSelect } from '@/components/dom/CharacterSelect';
import { NamingScreen } from '@/components/dom/NamingScreen';
import { HUD } from '@/components/dom/HUD';
import { PauseMenu } from '@/components/dom/PauseMenu';
import { ShopModal } from '@/components/dom/ShopModal';
import { MinigameModal } from '@/components/dom/MinigameModal';
import { ValentineModal } from '@/components/dom/ValentineModal';
import { EvolutionModal } from '@/components/dom/EvolutionModal';
import { SpeechBubble } from '@/components/dom/SpeechBubble';

// Canvas Components
import { GameScene } from '@/components/canvas/GameScene';

export default function GamePage() {
  // Audio system
  const { play, isMuted, toggleMute } = useAudio();

  // Game state
  const currentScreen = useGameStore((s) => s.currentScreen);
  const setScreen = useGameStore((s) => s.setScreen);
  const hasSeenIntro = useGameStore((s) => s.hasSeenIntro);
  const pet = useGameStore((s) => s.pet);
  const feed = useGameStore((s) => s.feed);
  const playAction = useGameStore((s) => s.play);
  const cuddle = useGameStore((s) => s.cuddle);
  const updatePlanetHappiness = useGameStore((s) => s.updatePlanetHappiness);
  const decayStats = useGameStore((s) => s.decayStats);
  const calculateOfflineDecay = useGameStore((s) => s.calculateOfflineDecay);
  const creativeMode = useGameStore((s) => s.creativeMode);
  const discoverRocket = useGameStore((s) => s.discoverRocket);
  const rocketDiscovered = useGameStore((s) => s.rocketDiscovered);
  const rocketParts = useGameStore((s) => s.rocketParts);

  // UI state
  const [showSplash, setShowSplash] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [pauseMenuOpen, setPauseMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [minigameOpen, setMinigameOpen] = useState(false);

  // Konami code easter egg
  const activateKonami = useGameStore((s) => s.activateKonami);
  useKonamiCode({
    onActivate: useCallback(() => {
      activateKonami();
      play('fanfare');
      toast.success('🎮 Konami Code Activated!', {
        description: '+1000 Rocket Parts! You found the secret!',
        duration: 5000,
      });
    }, [activateKonami, play]),
  });

  // Discover rocket after some time (easter egg discovery)
  useEffect(() => {
    if (!rocketDiscovered && pet.stage >= 1) {
      const timer = setTimeout(() => {
        discoverRocket();
        toast.info('🚀 New Discovery!', {
          description: 'You found something on the planet! Rotate to explore.',
          duration: 4000,
        });
      }, 30000); // Discover after 30 seconds of playing

      return () => clearTimeout(timer);
    }
  }, [rocketDiscovered, pet.stage, discoverRocket]);

  // Calculate offline decay on mount
  useEffect(() => {
    calculateOfflineDecay();
  }, [calculateOfflineDecay]);

  // Stat decay timer
  useEffect(() => {
    const interval = setInterval(() => {
      decayStats();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [decayStats]);

  // Update planet happiness when stats change
  useEffect(() => {
    updatePlanetHappiness();
  }, [pet.happiness, pet.hunger, pet.energy, updatePlanetHappiness]);

  // Derive modal states from currentScreen to avoid setState in effect
  const valentineOpen = currentScreen === 'valentine';
  const evolutionOpen = currentScreen === 'evolution';

  // Splash screen complete
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    play('fanfare');
    if (hasSeenIntro && pet.lineage) {
      // Returning player
      setScreen('game');
    } else {
      setShowIntro(true);
    }
  }, [hasSeenIntro, pet.lineage, setScreen, play]);

  // Intro complete
  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    play('button_click');
    setScreen('character-select');
  }, [setScreen, play]);

  // Care actions with audio feedback
  const handleFeed = useCallback(() => {
    feed();
    updatePlanetHappiness();
    play('pet_eat');
  }, [feed, updatePlanetHappiness, play]);

  const handlePlay = useCallback(() => {
    playAction();
    updatePlanetHappiness();
    play('pet_bounce');
  }, [playAction, updatePlanetHappiness, play]);

  const handleCuddle = useCallback(() => {
    cuddle();
    updatePlanetHappiness();
    play('heart');
  }, [cuddle, updatePlanetHappiness, play]);

  // 3D Object interactions
  const handleStoreClick = useCallback(() => {
    setShopOpen(true);
    play('menu_open');
  }, [play]);

  const handleArcadeClick = useCallback(() => {
    setMinigameOpen(true);
    play('menu_open');
  }, [play]);

  const handleRocketClick = useCallback(() => {
    play('button_click');
    toast.info('🚀 Ancient Rocket', {
      description: `The rocket needs repairs! Collect ${10 - rocketParts} more Rocket Parts from mini-games!`,
      duration: 4000,
    });
  }, [play, rocketParts]);

  // Dark side easter egg
  const handleDarkSideClick = useCallback(() => {
    toast.success('🌟 Secret Found!', {
      description: 'Made with ❤️ by Chi Studios',
      duration: 5000,
    });
    play('fanfare');
  }, [play]);

  // Render based on current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return null;
      case 'intro':
        return <IntroSequence onComplete={handleIntroComplete} />;
      case 'character-select':
        return <CharacterSelect onComplete={() => {}} />;
      case 'naming':
        return <NamingScreen onComplete={() => {}} />;
      case 'game':
        return (
          <>
            {/* 3D Scene */}
            <div className="fixed inset-0">
              <GameScene
                onStoreClick={handleStoreClick}
                onArcadeClick={handleArcadeClick}
                onRocketClick={handleRocketClick}
                onDarkSideClick={handleDarkSideClick}
              />
            </div>

            {/* Speech Bubble */}
            <SpeechBubble />

            {/* HUD */}
            <HUD
              onOpenSettings={() => {
                setPauseMenuOpen(true);
                play('menu_open');
              }}
              onOpenShop={() => {
                setShopOpen(true);
                play('menu_open');
              }}
              onOpenMinigame={() => {
                setMinigameOpen(true);
                play('menu_open');
              }}
              onFeed={handleFeed}
              onPlay={handlePlay}
              onCuddle={handleCuddle}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Toast notifications */}
      <Toaster position="top-center" richColors />

      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onComplete={handleSplashComplete} />
        )}
      </AnimatePresence>

      {/* Intro Sequence */}
      <AnimatePresence>
        {showIntro && !hasSeenIntro && (
          <IntroSequence onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      {/* Main Game Content */}
      {!showSplash && !showIntro && renderScreen()}

      {/* Modals */}
      <PauseMenu
        isOpen={pauseMenuOpen}
        onClose={() => {
          setPauseMenuOpen(false);
          play('menu_close');
        }}
      />

      <ShopModal
        isOpen={shopOpen}
        onClose={() => {
          setShopOpen(false);
          play('menu_close');
        }}
      />

      <MinigameModal
        isOpen={minigameOpen}
        onClose={() => {
          setMinigameOpen(false);
          play('menu_close');
        }}
      />

      <ValentineModal
        isOpen={valentineOpen}
        onClose={() => setScreen('game')}
      />

      <EvolutionModal
        isOpen={evolutionOpen}
        onClose={() => setScreen('game')}
      />

      {/* Creative Mode Indicator */}
      {creativeMode && currentScreen === 'game' && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full font-bold text-sm shadow-lg">
            ✨ Creative Mode Active ✨
          </div>
        </div>
      )}
    </main>
  );
}
