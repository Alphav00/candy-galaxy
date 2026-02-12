'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  X, 
  RotateCcw, 
  Sparkles, 
  User, 
  Home,
  Volume2,
  VolumeX,
  Music,
  Music2
} from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { useAudio } from '@/lib/audio';

interface PauseMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PauseMenu({ isOpen, onClose }: PauseMenuProps) {
  const creativeMode = useGameStore((s) => s.creativeMode);
  const toggleCreativeMode = useGameStore((s) => s.toggleCreativeMode);
  const resetGame = useGameStore((s) => s.resetGame);
  const setScreen = useGameStore((s) => s.setScreen);
  const { isMuted, toggleMute, isMusicMuted, toggleMusicMute } = useAudio();

  const handleResetGame = () => {
    if (window.confirm('Are you sure you want to reset the game? All progress will be lost!')) {
      resetGame();
      setScreen('splash');
      onClose();
    }
  };

  const handleChangeCharacter = () => {
    if (window.confirm('Change character? This will reset your current pet!')) {
      resetGame();
      setScreen('character-select');
      onClose();
    }
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
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-96 bg-white rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 text-white sticky top-0">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Settings</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Creative Mode */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <Label className="font-bold text-gray-800">Creative Mode</Label>
                    <p className="text-xs text-gray-500">Infinite resources, no decay</p>
                  </div>
                </div>
                <Switch
                  checked={creativeMode}
                  onCheckedChange={toggleCreativeMode}
                />
              </div>

              {/* Sound Effects */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div>
                    <Label className="font-bold text-gray-800">Sound Effects</Label>
                    <p className="text-xs text-gray-500">{isMuted ? 'Muted' : 'Enabled'}</p>
                  </div>
                </div>
                <Switch
                  checked={!isMuted}
                  onCheckedChange={toggleMute}
                />
              </div>

              {/* Music */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    {isMusicMuted ? (
                      <Music className="w-5 h-5 text-purple-500" />
                    ) : (
                      <Music2 className="w-5 h-5 text-purple-500" />
                    )}
                  </div>
                  <div>
                    <Label className="font-bold text-gray-800">Background Music</Label>
                    <p className="text-xs text-gray-500">{isMusicMuted ? 'Off' : 'Playing'}</p>
                  </div>
                </div>
                <Switch
                  checked={!isMusicMuted}
                  onCheckedChange={toggleMusicMute}
                />
              </div>

              {/* Action buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12 rounded-xl"
                  onClick={handleChangeCharacter}
                >
                  <User className="w-5 h-5 text-purple-500" />
                  Change Character
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12 rounded-xl"
                  onClick={onClose}
                >
                  <Home className="w-5 h-5 text-green-500" />
                  Resume Game
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={handleResetGame}
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset Game
                </Button>
              </div>

              {/* Version */}
              <p className="text-center text-xs text-gray-400 pt-2">
                Candy Galaxy v1.0 • Made with ❤️ by Chi Studios
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default PauseMenu;
