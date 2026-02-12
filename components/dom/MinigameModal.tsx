'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Rocket, Play, RotateCcw, Trophy } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';

interface MinigameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Jelly Bean types
const JELLY_BEANS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑'];
const GRID_SIZE = 6;

type Grid = string[][];

// Helper function to create initial grid
function createInitialGrid(): Grid {
  const newGrid: Grid = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    newGrid[row] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      newGrid[row][col] = JELLY_BEANS[Math.floor(Math.random() * JELLY_BEANS.length)];
    }
  }
  return newGrid;
}

export function MinigameModal({ isOpen, onClose }: MinigameModalProps) {
  const [grid, setGrid] = useState<Grid>(() => createInitialGrid());
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(10);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [gamePhase, setGamePhase] = useState<'idle' | 'playing' | 'ended'>('idle');

  const addRocketParts = useGameStore((s) => s.addRocketParts);
  const evolvePet = useGameStore((s) => s.evolvePet);

  // Derived state
  const isWin = score >= 15;
  const isPlaying = gamePhase === 'playing';
  const gameOver = gamePhase === 'ended';

  // Check for matches
  const checkMatches = useCallback((currentGrid: Grid): { newGrid: Grid; matches: number } => {
    const matches = new Set<string>();
    
    // Check horizontal matches
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 2; col++) {
        const bean = currentGrid[row][col];
        if (bean && bean === currentGrid[row][col + 1] && bean === currentGrid[row][col + 2]) {
          matches.add(`${row},${col}`);
          matches.add(`${row},${col + 1}`);
          matches.add(`${row},${col + 2}`);
        }
      }
    }

    // Check vertical matches
    for (let row = 0; row < GRID_SIZE - 2; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const bean = currentGrid[row][col];
        if (bean && bean === currentGrid[row + 1][col] && bean === currentGrid[row + 2][col]) {
          matches.add(`${row},${col}`);
          matches.add(`${row + 1},${col}`);
          matches.add(`${row + 2},${col}`);
        }
      }
    }

    // Remove matches and drop
    const newGrid = currentGrid.map((row) => [...row]);
    
    // Mark matched cells as empty
    matches.forEach((pos) => {
      const [row, col] = pos.split(',').map(Number);
      newGrid[row][col] = '';
    });

    // Drop beans down
    for (let col = 0; col < GRID_SIZE; col++) {
      let emptyRow = GRID_SIZE - 1;
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        if (newGrid[row][col]) {
          if (row !== emptyRow) {
            newGrid[emptyRow][col] = newGrid[row][col];
            newGrid[row][col] = '';
          }
          emptyRow--;
        }
      }

      // Fill empty spots at top
      for (let row = emptyRow; row >= 0; row--) {
        newGrid[row][col] = JELLY_BEANS[Math.floor(Math.random() * JELLY_BEANS.length)];
      }
    }

    return { newGrid, matches: matches.size };
  }, []);

  // Start game
  const startGame = useCallback(() => {
    setGrid(createInitialGrid());
    setScore(0);
    setMoves(10);
    setSelected(null);
    setGamePhase('playing');
  }, []);

  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    if (!isPlaying || gameOver) return;

    if (!selected) {
      setSelected({ row, col });
    } else {
      // Check if adjacent
      const isAdjacent = 
        (Math.abs(selected.row - row) === 1 && selected.col === col) ||
        (Math.abs(selected.col - col) === 1 && selected.row === row);

      if (isAdjacent) {
        // Swap
        const newGrid = grid.map((r) => [...r]);
        [newGrid[row][col], newGrid[selected.row][selected.col]] = 
          [newGrid[selected.row][selected.col], newGrid[row][col]];

        // Check matches
        const { newGrid: matchedGrid, matches } = checkMatches(newGrid);
        
        let newScore = score;
        if (matches > 0) {
          setGrid(matchedGrid);
          newScore = score + matches;
          setScore(newScore);
        } else {
          // Swap back if no match
          setGrid(newGrid);
        }

        const newMoves = moves - 1;
        setMoves(newMoves);
        setSelected(null);

        // Check game over
        if (newMoves <= 0) {
          setGamePhase('ended');
          if (newScore >= 15) {
            addRocketParts(1);
            evolvePet();
          }
        }
      } else {
        setSelected(null);
      }
    }
  }, [isPlaying, gameOver, selected, grid, score, moves, checkMatches, addRocketParts, evolvePet]);

  // Reset game state (called when modal closes via onExitComplete)
  const resetGame = useCallback(() => {
    setGrid(createInitialGrid());
    setScore(0);
    setMoves(10);
    setSelected(null);
    setGamePhase('idle');
  }, []);

  return (
    <AnimatePresence onExitComplete={resetGame}>
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[400px] bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Jelly Bean Match</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Stats */}
              {isPlaying && (
                <div className="flex justify-center gap-6 mt-3">
                  <div className="text-center">
                    <p className="text-xs text-white/70">Score</p>
                    <p className="text-2xl font-bold">{score}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-white/70">Moves</p>
                    <p className="text-2xl font-bold">{moves}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              {!isPlaying && !gameOver && (
                // Start screen
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🍬</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Match 3 or more!</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Swap adjacent jelly beans to match 3+ of the same type.<br />
                    Score 15+ points to win Rocket Parts!
                  </p>
                  <Button
                    onClick={startGame}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-8"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Game
                  </Button>
                </div>
              )}

              {isPlaying && (
                // Game grid
                <div className="grid grid-cols-6 gap-1 max-w-[300px] mx-auto">
                  {grid.map((row, rowIdx) =>
                    row.map((bean, colIdx) => {
                      const isSelected = selected?.row === rowIdx && selected?.col === colIdx;
                      
                      return (
                        <motion.button
                          key={`${rowIdx}-${colIdx}`}
                          onClick={() => handleCellClick(rowIdx, colIdx)}
                          animate={{
                            scale: isSelected ? 1.1 : 1,
                            rotate: isSelected ? [0, -5, 5, 0] : 0,
                          }}
                          className={`
                            w-11 h-11 rounded-xl text-2xl
                            flex items-center justify-center
                            transition-all duration-150
                            ${isSelected 
                              ? 'bg-yellow-200 shadow-lg ring-2 ring-yellow-400' 
                              : 'bg-gradient-to-br from-pink-100 to-purple-100 hover:from-pink-200 hover:to-purple-200'
                            }
                          `}
                        >
                          {bean}
                        </motion.button>
                      );
                    })
                  )}
                </div>
              )}

              {gameOver && (
                // Game over screen
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                  >
                    {isWin ? (
                      <>
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-2xl font-bold text-green-600 mb-2">You Win!</h3>
                        <p className="text-gray-500 mb-2">Score: {score}</p>
                        <div className="flex items-center justify-center gap-2 text-purple-500 mb-4">
                          <Rocket className="w-5 h-5" />
                          <span className="font-bold">+1 Rocket Part!</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-6xl mb-4">😢</div>
                        <h3 className="text-2xl font-bold text-gray-600 mb-2">Try Again!</h3>
                        <p className="text-gray-500 mb-2">Score: {score}</p>
                        <p className="text-sm text-gray-400 mb-4">Need 15+ points to win</p>
                      </>
                    )}
                  </motion.div>

                  <Button
                    onClick={startGame}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-8"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Play Again
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default MinigameModal;
