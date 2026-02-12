'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Rocket, ShoppingCart, Gift } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { STORE_ITEMS } from '@/lib/constants';
import { useState } from 'react';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShopModal({ isOpen, onClose }: ShopModalProps) {
  const rocketParts = useGameStore((s) => s.rocketParts);
  const inventory = useGameStore((s) => s.inventory);
  const buyItem = useGameStore((s) => s.buyItem);
  const creativeMode = useGameStore((s) => s.creativeMode);
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);

  const handleBuy = (itemId: string) => {
    const success = buyItem(itemId);
    if (success) {
      const item = STORE_ITEMS.find((i) => i.id === itemId);
      setPurchaseMessage(`Bought ${item?.name}! 🎉`);
      setTimeout(() => setPurchaseMessage(null), 2000);
    }
  };

  const getEmoji = (type: string) => {
    switch (type) {
      case 'food': return '🍰';
      case 'toy': return '🎾';
      case 'decoration': return '🌸';
      case 'special': return '🎁';
      default: return '📦';
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

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] md:max-h-[80vh] bg-white rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-400 to-teal-400 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Candy Shop</h2>
                    <p className="text-sm text-white/80">Buy treats for your pet!</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* Currency display */}
              <div className="mt-4 flex items-center justify-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <Rocket className="w-5 h-5" />
                <span className="font-bold text-xl">{creativeMode ? '∞' : rocketParts}</span>
                <span className="text-sm">Rocket Parts</span>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {STORE_ITEMS.map((item) => {
                const canAfford = creativeMode || rocketParts >= item.cost;
                const owned = inventory[item.id] || 0;

                return (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Emoji */}
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-3xl">
                          {getEmoji(item.type)}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-800">{item.name}</h3>
                            {owned > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                x{owned}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>

                          {/* Stats */}
                          <div className="flex gap-3 mt-2 text-xs">
                            {item.hungerValue && (
                              <span className="text-orange-500">🍔 +{item.hungerValue} Hunger</span>
                            )}
                            {item.happinessValue && (
                              <span className="text-pink-500">💖 +{item.happinessValue} Happy</span>
                            )}
                          </div>
                        </div>

                        {/* Buy button */}
                        <Button
                          onClick={() => handleBuy(item.id)}
                          disabled={!canAfford}
                          className={`flex flex-col h-14 w-16 rounded-xl ${
                            canAfford
                              ? 'bg-gradient-to-b from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          <Rocket className="w-4 h-4" />
                          <span className="font-bold">{item.cost}</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Mystery Box special */}
              <div className="text-center py-4">
                <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                  <Gift className="w-3 h-3" />
                  Play mini-games to earn more Rocket Parts!
                </p>
              </div>
            </div>

            {/* Purchase message */}
            <AnimatePresence>
              {purchaseMessage && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  className="absolute bottom-4 left-4 right-4 bg-green-500 text-white text-center py-3 rounded-xl font-bold shadow-lg"
                >
                  {purchaseMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ShopModal;
