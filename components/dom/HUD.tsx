'use client';

import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Utensils, 
  Battery, 
  Settings, 
  ShoppingBag,
  Gamepad2,
  Rocket,
  Sparkles
} from 'lucide-react';
import { useGameStore, selectExpression } from '@/stores/gameStore';
import { EVOLUTION_NAMES, EVOLUTION_THRESHOLDS } from '@/lib/constants';

interface HUDProps {
  onOpenSettings: () => void;
  onOpenShop: () => void;
  onOpenMinigame: () => void;
  onFeed: () => void;
  onPlay: () => void;
  onCuddle: () => void;
}

export function HUD({ onOpenSettings, onOpenShop, onOpenMinigame, onFeed, onPlay, onCuddle }: HUDProps) {
  const pet = useGameStore((s) => s.pet);
  const rocketParts = useGameStore((s) => s.rocketParts);
  const rocketDiscovered = useGameStore((s) => s.rocketDiscovered);
  const expression = useGameStore(selectExpression);
  const evolvePet = useGameStore((s) => s.evolvePet);

  // Get pet name based on stage and lineage
  const petDisplayName = pet.lineage 
    ? EVOLUTION_NAMES[pet.lineage][pet.stage]
    : 'Egg';

  // Calculate progress to next evolution
  const evolutionProgress = (() => {
    if (pet.stage === 0) return (pet.cumulativeCare / EVOLUTION_THRESHOLDS.HATCH) * 100;
    if (pet.stage === 1) return ((pet.cumulativeCare - EVOLUTION_THRESHOLDS.HATCH) / (EVOLUTION_THRESHOLDS.STAGE_2 - EVOLUTION_THRESHOLDS.HATCH)) * 100;
    if (pet.stage === 2) return ((pet.cumulativeCare - EVOLUTION_THRESHOLDS.STAGE_2) / (EVOLUTION_THRESHOLDS.STAGE_3 - EVOLUTION_THRESHOLDS.STAGE_2)) * 100;
    return 100;
  })();

  // Get stat colors
  const getStatColor = (value: number) => {
    if (value >= 70) return 'bg-green-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Pet info */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{expression === 'happy' ? '😊' : expression === 'sad' ? '😢' : expression === 'crying' ? '😭' : '😐'}</span>
              <div>
                <h2 className="font-bold text-gray-800">{pet.name || 'Your Pet'}</h2>
                <p className="text-xs text-gray-500">{petDisplayName}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-2 min-w-[180px]">
              {/* Happiness */}
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <Progress 
                  value={pet.happiness} 
                  className="h-2 flex-1"
                />
                <span className="text-xs font-medium w-8">{Math.round(pet.happiness)}</span>
              </div>

              {/* Hunger */}
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-orange-500" />
                <Progress 
                  value={pet.hunger} 
                  className="h-2 flex-1"
                />
                <span className="text-xs font-medium w-8">{Math.round(pet.hunger)}</span>
              </div>

              {/* Energy */}
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-blue-500" />
                <Progress 
                  value={pet.energy} 
                  className="h-2 flex-1"
                />
                <span className="text-xs font-medium w-8">{Math.round(pet.energy)}</span>
              </div>
            </div>

            {/* Evolution progress */}
            {pet.stage < 3 && (
              <div className="mt-3 pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <div className="flex-1">
                    <Progress value={Math.min(evolutionProgress, 100)} className="h-1.5" />
                  </div>
                  <span className="text-xs text-gray-500">{Math.round(evolutionProgress)}%</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Next evolution</p>
              </div>
            )}
          </motion.div>

          {/* Right side - Buttons */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col gap-2"
          >
            {/* Settings */}
            <Button
              variant="secondary"
              size="icon"
              onClick={onOpenSettings}
              className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg"
            >
              <Settings className="w-5 h-5" />
            </Button>

            {/* Rocket Parts */}
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg flex items-center gap-2">
              <Rocket className="w-4 h-4 text-purple-500" />
              <span className="font-bold text-gray-800">{rocketParts}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom action bar */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto"
      >
        <div className="max-w-md mx-auto">
          {/* Action buttons */}
          <div className="flex justify-center gap-3 mb-3">
            <ActionButton
              icon={<Utensils className="w-5 h-5" />}
              label="Feed"
              onClick={onFeed}
              color="bg-orange-400 hover:bg-orange-500"
              disabled={pet.hunger >= 100}
            />
            <ActionButton
              icon={<Heart className="w-5 h-5" />}
              label="Cuddle"
              onClick={onCuddle}
              color="bg-pink-400 hover:bg-pink-500"
            />
            <ActionButton
              icon={<Gamepad2 className="w-5 h-5" />}
              label="Play"
              onClick={onOpenMinigame}
              color="bg-purple-400 hover:bg-purple-500"
            />
            <ActionButton
              icon={<ShoppingBag className="w-5 h-5" />}
              label="Shop"
              onClick={onOpenShop}
              color="bg-green-400 hover:bg-green-500"
            />
          </div>

          {/* Rocket discovery hint */}
          {rocketDiscovered && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                <Rocket className="w-3 h-3 mr-1" />
                Find the Rocket!
              </Badge>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// ACTION BUTTON COMPONENT
// ============================================

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
  disabled?: boolean;
}

function ActionButton({ icon, label, onClick, color, disabled }: ActionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.1 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center justify-center
        w-16 h-16 rounded-2xl shadow-lg
        text-white font-medium
        transition-all duration-200
        ${disabled ? 'bg-gray-300 cursor-not-allowed opacity-50' : color}
      `}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </motion.button>
  );
}

export default HUD;
