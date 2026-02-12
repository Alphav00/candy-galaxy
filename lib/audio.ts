// Candy Galaxy - Audio Manager
// Simple audio system using Web Audio API with background music

type SoundType = 
  | 'button_click'
  | 'menu_open'
  | 'menu_close'
  | 'pet_bounce'
  | 'pet_happy'
  | 'pet_eat'
  | 'egg_hatch'
  | 'evolution'
  | 'fanfare'
  | 'minigame_win'
  | 'minigame_lose'
  | 'match_success'
  | 'purchase'
  | 'heart';

type MusicType = 'intro' | 'main' | 'minigame' | 'evolution';

interface AudioManagerState {
  audioContext: AudioContext | null;
  masterVolume: number;
  musicVolume: number;
  isMuted: boolean;
  isMusicMuted: boolean;
  isInitialized: boolean;
  musicOscillators: OscillatorNode[];
  musicGain: GainNode | null;
  isPlayingMusic: boolean;
  currentMusic: MusicType | null;
}

// Musical scales and progressions for procedural music
const MUSIC_SCALES = {
  major: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25], // C major
  pentatonic: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25], // C pentatonic
  dreamy: [261.63, 311.13, 349.23, 415.30, 466.16, 523.25], // C dreamy
};

// Chord progressions
const CHORD_PROGRESSIONS = {
  peaceful: [
    [0, 2, 4], // I
    [3, 5, 7], // IV
    [4, 6, 8], // V
    [0, 2, 4], // I
  ],
  happy: [
    [0, 2, 4],
    [2, 4, 6],
    [3, 5, 7],
    [4, 6, 8],
  ],
};

class AudioManager {
  private state: AudioManagerState = {
    audioContext: null,
    masterVolume: 0.5,
    musicVolume: 0.15,
    isMuted: false,
    isMusicMuted: false,
    isInitialized: false,
    musicOscillators: [],
    musicGain: null,
    isPlayingMusic: false,
    currentMusic: null,
  };

  private musicInterval: NodeJS.Timeout | null = null;
  private noteIndex = 0;
  private chordIndex = 0;

  // Initialize audio context (must be called on user interaction)
  initialize() {
    if (this.state.isInitialized) return;
    
    try {
      this.state.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.state.musicGain = this.state.audioContext.createGain();
      this.state.musicGain.connect(this.state.audioContext.destination);
      this.state.musicGain.gain.value = this.state.musicVolume;
      this.state.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  // Set mute state
  setMuted(muted: boolean) {
    this.state.isMuted = muted;
    if (muted) {
      this.stopMusic();
    }
  }

  // Set music mute
  setMusicMuted(muted: boolean) {
    this.state.isMusicMuted = muted;
    if (muted) {
      this.stopMusic();
    } else if (this.state.currentMusic) {
      this.playMusic(this.state.currentMusic);
    }
  }

  // Set volume (0-1)
  setVolume(volume: number) {
    this.state.masterVolume = Math.max(0, Math.min(1, volume));
  }

  // Set music volume (0-1)
  setMusicVolume(volume: number) {
    this.state.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.state.musicGain) {
      this.state.musicGain.gain.value = this.state.musicVolume;
    }
  }

  // Play a sound
  play(sound: SoundType) {
    if (!this.state.isInitialized) {
      this.initialize();
    }

    if (this.state.isMuted || !this.state.audioContext) return;

    const ctx = this.state.audioContext;
    
    // Create oscillator and gain node
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Configure sound based on type
    const config = this.getSoundConfig(sound);
    
    oscillator.type = config.waveform;
    oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime);
    
    if (config.frequencyEnd) {
      oscillator.frequency.exponentialRampToValueAtTime(
        config.frequencyEnd,
        ctx.currentTime + config.duration
      );
    }

    gainNode.gain.setValueAtTime(this.state.masterVolume * config.volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + config.duration);
  }

  // Get sound configuration
  private getSoundConfig(sound: SoundType): {
    waveform: OscillatorType;
    frequency: number;
    frequencyEnd?: number;
    duration: number;
    volume: number;
  } {
    switch (sound) {
      case 'button_click':
        return { waveform: 'sine', frequency: 800, duration: 0.1, volume: 0.3 };
      
      case 'menu_open':
        return { waveform: 'sine', frequency: 400, frequencyEnd: 600, duration: 0.2, volume: 0.4 };
      
      case 'menu_close':
        return { waveform: 'sine', frequency: 600, frequencyEnd: 400, duration: 0.2, volume: 0.4 };
      
      case 'pet_bounce':
        return { waveform: 'sine', frequency: 300, frequencyEnd: 500, duration: 0.15, volume: 0.3 };
      
      case 'pet_happy':
        return { waveform: 'sine', frequency: 523, frequencyEnd: 784, duration: 0.3, volume: 0.4 };
      
      case 'pet_eat':
        return { waveform: 'square', frequency: 200, frequencyEnd: 100, duration: 0.2, volume: 0.2 };
      
      case 'egg_hatch':
        return { waveform: 'sine', frequency: 400, frequencyEnd: 800, duration: 0.5, volume: 0.5 };
      
      case 'evolution':
        return { waveform: 'sine', frequency: 300, frequencyEnd: 900, duration: 0.8, volume: 0.5 };
      
      case 'fanfare':
        return { waveform: 'triangle', frequency: 523, duration: 0.6, volume: 0.5 };
      
      case 'minigame_win':
        return { waveform: 'sine', frequency: 440, frequencyEnd: 880, duration: 0.4, volume: 0.5 };
      
      case 'minigame_lose':
        return { waveform: 'sawtooth', frequency: 300, frequencyEnd: 150, duration: 0.4, volume: 0.3 };
      
      case 'match_success':
        return { waveform: 'sine', frequency: 600, frequencyEnd: 800, duration: 0.15, volume: 0.3 };
      
      case 'purchase':
        return { waveform: 'sine', frequency: 500, frequencyEnd: 700, duration: 0.2, volume: 0.4 };
      
      case 'heart':
        return { waveform: 'sine', frequency: 440, frequencyEnd: 550, duration: 0.2, volume: 0.3 };
      
      default:
        return { waveform: 'sine', frequency: 440, duration: 0.1, volume: 0.3 };
    }
  }

  // Play background music
  playMusic(type: MusicType) {
    if (!this.state.isInitialized) {
      this.initialize();
    }

    if (this.state.isMuted || this.state.isMusicMuted || !this.state.audioContext) return;

    // Stop any existing music
    this.stopMusic();
    
    this.state.currentMusic = type;
    this.state.isPlayingMusic = true;
    
    const ctx = this.state.audioContext;
    const scale = MUSIC_SCALES.pentatonic;
    
    // Create a procedural ambient music loop
    switch (type) {
      case 'intro':
        this.playAmbientMusic(ctx, scale, 0.8); // Slower, dreamier
        break;
      case 'main':
        this.playAmbientMusic(ctx, scale, 0.6); // Medium pace
        break;
      case 'minigame':
        this.playAmbientMusic(ctx, MUSIC_SCALES.major, 0.4); // Faster, more upbeat
        break;
      case 'evolution':
        this.playEvolutionMusic(ctx);
        break;
    }
  }

  // Ambient procedural music
  private playAmbientMusic(ctx: AudioContext, scale: number[], beatDuration: number) {
    const playNote = () => {
      if (!this.state.isPlayingMusic || this.state.isMusicMuted) return;
      
      // Random note from scale
      const noteIndex = Math.floor(Math.random() * scale.length);
      const frequency = scale[noteIndex];
      
      // Create oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.state.musicGain!);
      
      // Random waveform for variety
      osc.type = ['sine', 'triangle'][Math.floor(Math.random() * 2)] as OscillatorType;
      osc.frequency.value = frequency;
      
      // Envelope
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + beatDuration * 1.5);
      
      osc.start(now);
      osc.stop(now + beatDuration * 1.5);
      
      // Add occasional harmony
      if (Math.random() > 0.7) {
        const harmonyOsc = ctx.createOscillator();
        const harmonyGain = ctx.createGain();
        
        harmonyOsc.connect(harmonyGain);
        harmonyGain.connect(this.state.musicGain!);
        
        harmonyOsc.type = 'sine';
        harmonyOsc.frequency.value = frequency * 1.5; // Perfect fifth
        
        harmonyGain.gain.setValueAtTime(0, now);
        harmonyGain.gain.linearRampToValueAtTime(0.15, now + 0.2);
        harmonyGain.gain.exponentialRampToValueAtTime(0.01, now + beatDuration * 2);
        
        harmonyOsc.start(now);
        harmonyOsc.stop(now + beatDuration * 2);
      }
    };
    
    // Play notes in a loop with random timing
    const scheduleNextNote = () => {
      if (!this.state.isPlayingMusic || this.state.isMusicMuted) return;
      
      playNote();
      
      // Random delay for natural feel
      const delay = (beatDuration * 1000) * (0.8 + Math.random() * 0.4);
      this.musicInterval = setTimeout(scheduleNextNote, delay);
    };
    
    scheduleNextNote();
    
    // Add a low drone
    this.playDrone(ctx, scale[0] / 2);
  }

  // Low drone for atmosphere
  private playDrone(ctx: AudioContext, frequency: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.state.musicGain!);
    
    osc.type = 'sine';
    osc.frequency.value = frequency;
    
    gain.gain.value = 0.1;
    
    osc.start();
    
    this.state.musicOscillators.push(osc);
    
    // Slowly modulate the drone
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    
    lfo.frequency.value = 0.1;
    lfoGain.gain.value = 2;
    
    lfo.start();
    
    this.state.musicOscillators.push(lfo);
  }

  // Special evolution music
  private playEvolutionMusic(ctx: AudioContext) {
    const scale = MUSIC_SCALES.major;
    const notes = [0, 2, 4, 5, 7, 5, 4, 2]; // Ascending then descending
    
    let noteTime = ctx.currentTime;
    
    notes.forEach((noteIndex, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.state.musicGain!);
      
      osc.type = 'sine';
      osc.frequency.value = scale[noteIndex];
      
      const duration = 0.4;
      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.4, noteTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + duration);
      
      osc.start(noteTime);
      osc.stop(noteTime + duration);
      
      noteTime += duration;
    });
    
    // After evolution music, return to main music
    setTimeout(() => {
      if (this.state.isPlayingMusic) {
        this.playMusic('main');
      }
    }, 4000);
  }

  // Stop all music
  stopMusic() {
    this.state.isPlayingMusic = false;
    this.state.currentMusic = null;
    
    if (this.musicInterval) {
      clearTimeout(this.musicInterval);
      this.musicInterval = null;
    }
    
    // Stop all oscillators
    this.state.musicOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch {
        // Already stopped
      }
    });
    this.state.musicOscillators = [];
  }

  // Play a sequence of notes (for melodies)
  playSequence(notes: { frequency: number; duration: number }[], startDelay = 0) {
    if (!this.state.isInitialized) {
      this.initialize();
    }

    if (this.state.isMuted || !this.state.audioContext) return;

    const ctx = this.state.audioContext;
    let time = ctx.currentTime + startDelay;

    notes.forEach((note) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(note.frequency, time);

      gainNode.gain.setValueAtTime(this.state.masterVolume * 0.3, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + note.duration);

      oscillator.start(time);
      oscillator.stop(time + note.duration);

      time += note.duration;
    });
  }
}

// Export singleton instance
export const audioManager = new AudioManager();

// React hook for audio
import { useCallback, useEffect, useState } from 'react';

export function useAudio() {
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);

  // Initialize on first user interaction
  useEffect(() => {
    const handleInteraction = () => {
      audioManager.initialize();
      // Start music on first interaction
      audioManager.playMusic('main');
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      audioManager.stopMusic();
    };
  }, []);

  const play = useCallback((sound: SoundType) => {
    audioManager.play(sound);
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioManager.setMuted(newMuted);
    return newMuted;
  }, [isMuted]);

  const toggleMusicMute = useCallback(() => {
    const newMuted = !isMusicMuted;
    setIsMusicMuted(newMuted);
    audioManager.setMusicMuted(newMuted);
    return newMuted;
  }, [isMusicMuted]);

  const playMusic = useCallback((type: MusicType) => {
    audioManager.playMusic(type);
  }, []);

  const stopMusic = useCallback(() => {
    audioManager.stopMusic();
  }, []);

  return { 
    play, 
    isMuted, 
    toggleMute, 
    isMusicMuted, 
    toggleMusicMute,
    playMusic,
    stopMusic,
  };
}
