'use client';

import { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Environment, Html } from '@react-three/drei';
import { useGameStore, selectPlanetColor } from '@/stores/gameStore';
import { PLANET_RADIUS, PLANET_COLORS, LINEAGE_COLORS } from '@/lib/constants';
import { useDayNightCycle, getAmbientLightColor, getAmbientLightIntensity } from '@/hooks/use-daynight';
import * as THREE from 'three';

// ============================================
// HELPER: Position objects on sphere surface
// ============================================

function sphereToCartesian(radius: number, theta: number, phi: number): [number, number, number] {
  // theta: horizontal angle (0 to 2π)
  // phi: vertical angle (0 = top, π = bottom)
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return [x, y, z];
}

function getSurfaceRotation(theta: number, phi: number): [number, number, number] {
  // Calculate rotation so object stands "up" on sphere surface
  return [phi - Math.PI / 2, -theta, 0];
}

// ============================================
// INTERACTIVE OBJECT PROPS
// ============================================

interface InteractiveObjectProps {
  onClick?: () => void;
  children: React.ReactNode;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  hoverScale?: number;
}

function InteractiveObject({ onClick, children, position, rotation = [0, 0, 0], scale = 1, hoverScale = 1.1 }: InteractiveObjectProps) {
  const [isHovered, setIsHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={isHovered ? scale * hoverScale : scale}
      onPointerEnter={() => {
        setIsHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerLeave={() => {
        setIsHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={onClick}
    >
      {children}
      {isHovered && (
        <Html center position={[0, 1.5, 0]}>
          <div className="bg-white/90 px-3 py-1 rounded-full text-sm font-medium shadow-lg whitespace-nowrap">
            Click to interact!
          </div>
        </Html>
      )}
    </group>
  );
}

// ============================================
// CANDY PLANET COMPONENT
// ============================================

function CandyPlanet({ onDarkSideClick }: { onDarkSideClick?: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetColor = useGameStore(selectPlanetColor);
  const currentColor = useMemo(() => new THREE.Color(targetColor), [targetColor]);

  useFrame(() => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.color.lerp(currentColor, 0.02);
    }
  });

  return (
    <group>
      {/* Main planet sphere */}
      <mesh ref={meshRef} receiveShadow>
        <icosahedronGeometry args={[PLANET_RADIUS, 2]} />
        <meshStandardMaterial
          color={PLANET_COLORS.unloved}
          roughness={0.6}
          metalness={0.1}
          flatShading
        />
      </mesh>

      {/* Candy rocks/decorations */}
      <CandyDetails />

      {/* Atmosphere glow */}
      <mesh scale={1.05}>
        <icosahedronGeometry args={[PLANET_RADIUS, 2]} />
        <meshBasicMaterial
          color={PLANET_COLORS.highlight}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Dark Side easter egg - bottom of planet */}
      <mesh
        position={[0, -PLANET_RADIUS - 0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={onDarkSideClick}
      >
        <planeGeometry args={[0.5, 0.2]} />
        <meshBasicMaterial color="#FF69B4" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ============================================
// CANDY DETAILS (Decorations)
// ============================================

function CandyDetails() {
  const decorations = useMemo(() => {
    const items = [];
    const count = 8;

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;

      items.push({
        position: sphereToCartesian(PLANET_RADIUS * 1.02, theta, phi),
        scale: Math.random() * 0.2 + 0.1,
        type: i % 3,
      });
    }

    return items;
  }, []);

  return (
    <>
      {decorations.map((deco, i) => (
        <Float key={i} speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
          <mesh position={deco.position} scale={deco.scale}>
            {deco.type === 0 && <dodecahedronGeometry args={[1, 0]} />}
            {deco.type === 1 && <octahedronGeometry args={[1, 0]} />}
            {deco.type === 2 && <tetrahedronGeometry args={[1, 0]} />}
            <meshStandardMaterial
              color={PLANET_COLORS.accent}
              roughness={0.3}
              metalness={0.5}
              flatShading
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

// ============================================
// PET COMPONENT WITH WALKING
// ============================================

interface PetState {
  theta: number;  // Horizontal position on planet
  phi: number;    // Vertical position on planet
  targetTheta: number;
  targetPhi: number;
  isMoving: boolean;
  walkSpeed: number;
}

function Pet() {
  const pet = useGameStore((s) => s.pet);
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Pet position state (spherical coordinates)
  const petStateRef = useRef<PetState>({
    theta: 0,        // Start at front
    phi: Math.PI / 4, // Start slightly above equator
    targetTheta: 0,
    targetPhi: Math.PI / 4,
    isMoving: false,
    walkSpeed: 0.3,
  });

  // Random wandering
  useEffect(() => {
    const wander = () => {
      const state = petStateRef.current;
      // Pick a random nearby target
      state.targetTheta = state.theta + (Math.random() - 0.5) * 0.5;
      state.targetPhi = Math.max(Math.PI / 8, Math.min(Math.PI / 3, state.phi + (Math.random() - 0.5) * 0.3));
      state.isMoving = true;
    };

    // Wander every 3-8 seconds
    const interval = setInterval(() => {
      if (!petStateRef.current.isMoving) {
        wander();
      }
    }, 3000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, []);
  
  const petColor = useMemo(() => {
    if (!pet.lineage) return '#FF69B4';
    return pet.lineage === 'gummy' ? LINEAGE_COLORS.gummy.primary : LINEAGE_COLORS.chocolate.primary;
  }, [pet.lineage]);

  const secondaryColor = useMemo(() => {
    if (!pet.lineage) return '#FFB6C1';
    return pet.lineage === 'gummy' ? LINEAGE_COLORS.gummy.secondary : LINEAGE_COLORS.chocolate.secondary;
  }, [pet.lineage]);

  const petSize = useMemo(() => {
    switch (pet.stage) {
      case 0: return 0.3;
      case 1: return 0.5;
      case 2: return 0.8;
      case 3: return 1.2;
      default: return 0.5;
    }
  }, [pet.stage]);

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return;
    
    const petState = petStateRef.current;
    
    // Movement
    if (petState.isMoving) {
      const dTheta = petState.targetTheta - petState.theta;
      const dPhi = petState.targetPhi - petState.phi;
      const distance = Math.sqrt(dTheta * dTheta + dPhi * dPhi);
      
      if (distance < 0.01) {
        petState.isMoving = false;
      } else {
        // Move toward target
        petState.theta += dTheta * petState.walkSpeed * delta;
        petState.phi += dPhi * petState.walkSpeed * delta;
      }
    }
    
    // Animation
    const bouncePhase = state.clock.elapsedTime * 2;
    const bounceY = Math.sin(bouncePhase) * 0.03;
    const walkBob = petState.isMoving ? Math.sin(bouncePhase * 3) * 0.08 : 0;
    
    // Squash and stretch
    const squash = Math.abs(Math.sin(bouncePhase * 0.5)) * 0.1;
    const stretch = 1 + squash * 0.5 + (petState.isMoving ? 0.1 : 0);
    const squish = 1 - squash * 0.3;
    
    meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, stretch, 0.1);
    meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, squish, 0.1);
    meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, squish, 0.1);
    
    // Position on sphere surface
    const surfacePos = sphereToCartesian(PLANET_RADIUS + petSize * 0.5 + bounceY + walkBob, petState.theta, petState.phi);
    groupRef.current.position.set(...surfacePos);
    
    // Rotate to stand on surface
    const surfaceRot = getSurfaceRotation(petState.theta, petState.phi);
    groupRef.current.rotation.set(...surfaceRot);
    
    // Face direction of movement
    if (petState.isMoving) {
      const moveDir = Math.atan2(
        petState.targetTheta - petState.theta,
        petState.targetPhi - petState.phi
      );
      groupRef.current.rotateY(moveDir);
    }
  });

  if (pet.stage === 0) {
    return (
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh position={[0, PLANET_RADIUS + 0.3, 0]} scale={petSize}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={petColor} roughness={0.3} metalness={0.2} />
        </mesh>
      </Float>
    );
  }

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} scale={[petSize, petSize * 0.8, petSize]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={petColor}
          roughness={pet.lineage === 'chocolate' ? 0.2 : 0.4}
          metalness={pet.lineage === 'chocolate' ? 0.3 : 0.1}
        />
      </mesh>

      {/* Eyes */}
      <group position={[0, petSize * 0.2, petSize * 0.7]}>
        <mesh position={[petSize * 0.25, 0, 0]}>
          <sphereGeometry args={[petSize * 0.12, 8, 8]} />
          <meshBasicMaterial color="#333" />
        </mesh>
        <mesh position={[-petSize * 0.25, 0, 0]}>
          <sphereGeometry args={[petSize * 0.12, 8, 8]} />
          <meshBasicMaterial color="#333" />
        </mesh>
        
        <mesh position={[petSize * 0.28, petSize * 0.04, petSize * 0.06]}>
          <sphereGeometry args={[petSize * 0.04, 8, 8]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
        <mesh position={[-petSize * 0.22, petSize * 0.04, petSize * 0.06]}>
          <sphereGeometry args={[petSize * 0.04, 8, 8]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
      </group>

      {pet.stage >= 2 && (
        <mesh position={[0, petSize * 0.6, 0]} scale={petSize * 0.3}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color={secondaryColor} roughness={0.5} />
        </mesh>
      )}

      {pet.accessory === 'top_hat' && (
        <group position={[0, petSize * 0.9, 0]} scale={petSize * 0.3}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.6, 8]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[1, 1, 0.1, 8]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>
        </group>
      )}

      {pet.accessory === 'unicorn_horn' && (
        <mesh position={[0, petSize * 0.8, petSize * 0.3]} rotation={[Math.PI * 0.1, 0, 0]} scale={petSize * 0.15}>
          <coneGeometry args={[0.5, 2, 8]} />
          <meshStandardMaterial color="#FFD700" roughness={0.3} metalness={0.6} />
        </mesh>
      )}
    </group>
  );
}

// ============================================
// ROCKET (Interactive) - North Pole
// ============================================

function Rocket({ onClick }: { onClick?: () => void }) {
  const rocketDiscovered = useGameStore((s) => s.rocketDiscovered);
  const rocketRepaired = useGameStore((s) => s.rocketRepaired);

  // Position at top of planet (North Pole)
  const theta = 0;
  const phi = 0.1; // Near top
  const position = sphereToCartesian(PLANET_RADIUS + 1, theta, phi);
  const rotation = getSurfaceRotation(theta, phi);

  if (!rocketDiscovered) return null;

  return (
    <InteractiveObject onClick={onClick} position={position} rotation={rotation} scale={0.4}>
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.1}>
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.4, 1.5, 8, 16]} />
          <meshStandardMaterial
            color={rocketRepaired ? '#FFD700' : '#888'}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>

        <mesh position={[0, 1.2, 0]}>
          <coneGeometry args={[0.4, 0.6, 8]} />
          <meshStandardMaterial color="#FF4444" roughness={0.3} />
        </mesh>

        {[0, 120, 240].map((angle, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((angle * Math.PI) / 180) * 0.5,
              -0.5,
              Math.sin((angle * Math.PI) / 180) * 0.5,
            ]}
            rotation={[0, (angle * Math.PI) / 180, 0]}
          >
            <boxGeometry args={[0.1, 0.6, 0.3]} />
            <meshStandardMaterial color="#FF4444" roughness={0.3} />
          </mesh>
        ))}

        {!rocketRepaired && (
          <mesh position={[0, 0, 0.5]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial color="#FF0000" />
          </mesh>
        )}
      </Float>
    </InteractiveObject>
  );
}

// ============================================
// STORE BUILDING (Interactive) - Side of planet
// ============================================

function StoreBuilding({ onClick }: { onClick?: () => void }) {
  // Position on the right side of planet
  const theta = Math.PI / 4;  // 45 degrees around
  const phi = Math.PI / 3;    // Above equator
  const position = sphereToCartesian(PLANET_RADIUS + 0.3, theta, phi);
  const rotation = getSurfaceRotation(theta, phi);

  return (
    <InteractiveObject onClick={onClick} position={position} rotation={rotation} scale={0.25}>
      {/* Main building */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshStandardMaterial color="#FFB6C1" roughness={0.6} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 1.2, 0]}>
        <coneGeometry args={[1.2, 0.8, 4]} />
        <meshStandardMaterial color="#FF69B4" roughness={0.4} />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.2, 0.76]}>
        <boxGeometry args={[0.4, 0.6, 0.05]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>

      {/* Sign */}
      <mesh position={[0, 0.85, 0.76]}>
        <boxGeometry args={[0.8, 0.3, 0.05]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
    </InteractiveObject>
  );
}

// ============================================
// ARCADE MACHINE (Interactive) - Another side
// ============================================

function ArcadeMachine({ onClick }: { onClick?: () => void }) {
  // Position on left side of planet
  const theta = -Math.PI / 3;  // -60 degrees around
  const phi = Math.PI / 2.5;   // Above equator
  const position = sphereToCartesian(PLANET_RADIUS + 0.2, theta, phi);
  const rotation = getSurfaceRotation(theta, phi);

  return (
    <InteractiveObject onClick={onClick} position={position} rotation={rotation} scale={0.2}>
      {/* Cabinet */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[1, 1.5, 0.8]} />
        <meshStandardMaterial color="#4169E1" roughness={0.5} />
      </mesh>

      {/* Screen */}
      <mesh position={[0, 1, 0.41]}>
        <boxGeometry args={[0.7, 0.5, 0.05]} />
        <meshBasicMaterial color="#00FF00" />
      </mesh>

      {/* Top */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[1.1, 0.2, 0.9]} />
        <meshStandardMaterial color="#FF69B4" roughness={0.5} />
      </mesh>
    </InteractiveObject>
  );
}

// ============================================
// FLOATING PARTICLES
// ============================================

function FloatingParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 15,
      ] as [number, number, number],
      scale: Math.random() * 0.08 + 0.03,
      speed: Math.random() * 0.5 + 0.5,
    }));
  }, []);

  return (
    <>
      {particles.map((p) => (
        <Float key={p.id} speed={p.speed} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={p.position} scale={p.scale}>
            <octahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color="#FFD700" transparent opacity={0.5} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

// ============================================
// DYNAMIC LIGHTING (Day/Night)
// ============================================

function DynamicLighting() {
  const timeInfo = useDayNightCycle();
  const ambientColor = getAmbientLightColor(timeInfo.phase);
  const ambientIntensity = getAmbientLightIntensity(timeInfo.phase);

  return (
    <>
      <directionalLight
        position={[5, 10, 5]}
        intensity={timeInfo.isNight ? 0.3 : 0.8}
        color={timeInfo.isNight ? '#4169E1' : '#FFD700'}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <spotLight
        position={[-5, 5, -5]}
        intensity={timeInfo.isNight ? 0.6 : 0.4}
        color={timeInfo.isNight ? '#9370DB' : '#ADD8E6'}
        angle={0.5}
        penumbra={0.5}
      />

      <ambientLight intensity={ambientIntensity} color={ambientColor} />
    </>
  );
}

// ============================================
// MAIN SCENE COMPONENT
// ============================================

interface GameSceneProps {
  onStoreClick?: () => void;
  onArcadeClick?: () => void;
  onRocketClick?: () => void;
  onDarkSideClick?: () => void;
}

export function GameScene({ onStoreClick, onArcadeClick, onRocketClick, onDarkSideClick }: GameSceneProps) {
  const timeInfo = useDayNightCycle();

  const getBackgroundStyle = useCallback(() => {
    switch (timeInfo.phase) {
      case 'dawn':
        return 'linear-gradient(to bottom, #2d1b4e, #4a2c5a, #8b4d6b)';
      case 'day':
        return 'linear-gradient(to bottom, #1a1a2e, #16213e, #0f3460)';
      case 'dusk':
        return 'linear-gradient(to bottom, #1a1a2e, #4a2c5a, #6b3a5a)';
      case 'night':
        return 'linear-gradient(to bottom, #0a0a1a, #0f0f2e, #1a1a3e)';
      default:
        return 'linear-gradient(to bottom, #1a1a2e, #16213e, #0f3460)';
    }
  }, [timeInfo.phase]);

  return (
    <Canvas
      camera={{ position: [0, 5, 12], fov: 45 }}
      dpr={[1, 2]}
      style={{ background: getBackgroundStyle() }}
    >
      <DynamicLighting />

      <Stars
        radius={100}
        depth={50}
        count={timeInfo.isNight ? 8000 : 3000}
        factor={timeInfo.isNight ? 6 : 3}
        saturation={0}
        fade
        speed={0.5}
      />

      <FloatingParticles />

      <CandyPlanet onDarkSideClick={onDarkSideClick} />

      <Pet />

      <StoreBuilding onClick={onStoreClick} />
      <ArcadeMachine onClick={onArcadeClick} />
      <Rocket onClick={onRocketClick} />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={8}
        maxDistance={20}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
        rotateSpeed={0.5}
      />

      <Environment preset="sunset" />
    </Canvas>
  );
}

export default GameScene;
