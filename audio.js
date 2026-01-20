// ===================================================================
// AUDIO.JS - Systém zvuku pomocí Web Audio API
// ===================================================================
// Účel: Generování všech zvuků v hře bez externích souborů
// - Hudba v pozadí (základní ambient melodie)
// - Zvuk při zásahu nepřítele
// - Zvuk při sbírání úhlu
// - Zvuk při otevření shopu a nákupu
// - Zvuk při levelupu
// ===================================================================

// ===================================================================
// AUDIO CONTEXT - Inicializace
// ===================================================================
let audioContext = null;

export function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

function getAudioContext() {
  if (!audioContext) {
    initAudio();
  }
  return audioContext;
}

// ===================================================================
// HELPER FUNKCE - Základní oscilátory
// ===================================================================

// Přehraje jednu notu na určité frekvenci a dobu
function playNote(frequency, duration, volume = 0.3, type = 'sine') {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

// Přehraje více not v posloupnosti (sekvence)
function playSequence(notes, tempo = 0.3) {
  let time = 0;
  notes.forEach(([frequency, duration]) => {
    setTimeout(() => {
      playNote(frequency, duration);
    }, time * 1000);
    time += duration;
  });
}

// ===================================================================
// ZVUK: HUDBA NA POZADÍ
// ===================================================================
// Hypnotická progrese G-Dm-Am-F-C - v osminkách (2x rychlejší)
export function playBackgroundMusic() {
  const ctx = getAudioContext();
  
  // AKORDICKÁ PROGRESE: G → Dm → Am → F → C (v osminkách = 0.5s na akor)
  
  // G akor (G, B, D)
  const chordG = [
    { freq: 196.00, duration: 0.5 },   // G3
    { freq: 246.94, duration: 0.5 },   // B3
    { freq: 293.66, duration: 0.5 }    // D4
  ];
  
  // Dm akor (D, F, A)
  const chordDm = [
    { freq: 293.66, duration: 0.5 },   // D4
    { freq: 349.23, duration: 0.5 },   // F4
    { freq: 440.00, duration: 0.5 }    // A4
  ];
  
  // Am akor (A, C, E)
  const chordAm = [
    { freq: 220.00, duration: 0.5 },   // A3
    { freq: 261.63, duration: 0.5 },   // C4
    { freq: 329.63, duration: 0.5 }    // E4
  ];
  
  // F akor (F, A, C)
  const chordF = [
    { freq: 349.23, duration: 0.5 },   // F4
    { freq: 220.00, duration: 0.5 },   // A3
    { freq: 261.63, duration: 0.5 }    // C4
  ];
  
  // C akor (C, E, G)
  const chordC = [
    { freq: 261.63, duration: 0.5 },   // C4
    { freq: 329.63, duration: 0.5 },   // E4
    { freq: 392.00, duration: 0.5 }    // G4
  ];
  
  // BAS: Basové noty - jeden tón na akor (0.5 sekundy = půl času)
  const bassLine = [
    { freq: 98.00, duration: 2.0 },    // G2 - pro G
    { freq: 146.83, duration: 2.0 },   // D3 - pro Dm
    { freq: 110.00, duration: 2.0 },   // A2 - pro Am
    { freq: 174.61, duration: 2.0 },   // F3 - pro F
    { freq: 130.81, duration: 2.0 }    // C3 - pro C
  ];
  
  // MELODICKÁ ČÁRA: Vyšší vrstva - rychlejší, v osminkách
  const melodyLine = [
    // Přes G (2 osminy)
    { freq: 392.00, duration: 0.25 },  // G4
    { freq: 440.00, duration: 0.25 },  // A4
    { freq: 493.88, duration: 0.25 },  // B4
    { freq: 440.00, duration: 0.25 },  // A4
    { freq: 392.00, duration: 0.25 },  // G4
    { freq: 440.00, duration: 0.25 },  // A4
    { freq: 493.88, duration: 0.25 },  // B4
    { freq: 440.00, duration: 0.25 },  // A4
    
    // Přes Dm
    { freq: 440.00, duration: 0.25 },  // A4
    { freq: 392.00, duration: 0.25 },  // G4
    { freq: 349.23, duration: 0.25 },  // F4
    { freq: 392.00, duration: 0.25 },  // G4
    { freq: 440.00, duration: 0.25 },  // A4
    { freq: 392.00, duration: 0.25 },  // G4
    { freq: 349.23, duration: 0.25 },  // F4
    { freq: 392.00, duration: 0.25 },  // G4
    
    // Přes Am
    { freq: 440.00, duration: 0.25 },  // A4
    { freq: 392.00, duration: 0.25 },  // G4
    { freq: 349.23, duration: 0.25 },  // F4
    { freq: 330.00, duration: 0.25 },  // E4
    { freq: 440.00, duration: 0.25 },  // A4
    { freq: 392.00, duration: 0.25 },  // G4
    { freq: 349.23, duration: 0.25 },  // F4
    { freq: 330.00, duration: 0.25 },  // E4
    
    // Přes F
    { freq: 349.23, duration: 0.25 },  // F4
    { freq: 392.00, duration: 0.25 },  // G4
    { freq: 440.00, duration: 0.25 },  // A4
    { freq: 392.00, duration: 0.25 },  // G4
    { freq: 349.23, duration: 0.25 },  // F4
    { freq: 392.00, duration: 0.25 },  // G4
    { freq: 440.00, duration: 0.25 },  // A4
    { freq: 392.00, duration: 0.25 },  // G4
    
    // Přes C
    { freq: 392.00, duration: 0.25 },  // G4
    { freq: 329.63, duration: 0.25 },  // E4
    { freq: 261.63, duration: 0.25 },  // C4
    { freq: 329.63, duration: 0.25 },  // E4
    { freq: 392.00, duration: 0.25 },  // G4
    { freq: 329.63, duration: 0.25 },  // E4
    { freq: 261.63, duration: 0.25 },  // C4
    { freq: 329.63, duration: 0.25 }   // E4
  ];
  
  // Celkový čas jednoho loop cyklu (nyní 2.5 sekund - 2x rychleji)
  const loopDuration = 2.5; // sekund
  
  // VRSTVA 1: Basová linka
  playBackgroundMelodyLine(bassLine, 0.06, 'sine');
  
  // VRSTVA 2: Akordy (postupně se přehrávají - v polovičním čase)
  playBackgroundMelodyLine(chordG, 0.05, 'sine');
  setTimeout(() => playBackgroundMelodyLine(chordDm, 0.05, 'sine'), 500);
  setTimeout(() => playBackgroundMelodyLine(chordAm, 0.05, 'sine'), 1000);
  setTimeout(() => playBackgroundMelodyLine(chordF, 0.05, 'sine'), 1500);
  setTimeout(() => playBackgroundMelodyLine(chordC, 0.05, 'sine'), 2000);
  
  // VRSTVA 3: Melodická čára (plyuje přes akordy - nyní v osminkách)
  setTimeout(() => {
    playBackgroundMelodyLine(melodyLine, 0.08, 'sine');
  }, 50);
  
  // Loopuj hudbu
  setTimeout(() => playBackgroundMusic(), loopDuration * 1000);
}

// Helper funkce pro přehrávání sekvence not
function playBackgroundMelodyLine(notes, volume, type) {
  const ctx = getAudioContext();
  let currentTime = ctx.currentTime;
  
  notes.forEach(note => {
    // Vytvoř oscilator pro tuto notu
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = note.freq;
    
    // Připoj do audio grafu
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    
    // Nastaví envelope: fade-in, sustain, fade-out
    gain.gain.setValueAtTime(0, currentTime);
    gain.gain.linearRampToValueAtTime(volume, currentTime + 0.05); // fade-in
    gain.gain.setValueAtTime(volume, currentTime + note.duration - 0.1); // sustain
    gain.gain.linearRampToValueAtTime(0, currentTime + note.duration); // fade-out
    
    // Spustit a zastavit notu
    oscillator.start(currentTime);
    oscillator.stop(currentTime + note.duration);
    
    // Posun čas pro další notu
    currentTime += note.duration;
  });
}

// ===================================================================
// ZVUK: ZÁSAH NEPŘÍTELE
// ===================================================================
// Krátký "boom" zvuk když hráč zabije nepřítele
export function playEnemyHitSound() {
  const ctx = getAudioContext();
  
  // Dvoutónový efekt - vysoký tón padá dolů (frequency sweep)
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(400, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
  
  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.15);
}

// ===================================================================
// ZVUK: SBÍRÁNÍ ÚHLU
// ===================================================================
// Pozvánlivý "ding" zvuk když hráč sebere úhel
export function playAngleCollectSound() {
  const ctx = getAudioContext();
  
  // Dvě noty - vzestupná melodie
  const notes = [
    [523.25, 0.1], // C5 - výše
    [659.25, 0.15] // E5 - ještě výše
  ];
  
  playSequence(notes, 0.1);
}

// ===================================================================
// ZVUK: OTEVŘENÍ SHOPU
// ===================================================================
// Vyzývavý zvuk při otevření shopu
export function playShopOpenSound() {
  const ctx = getAudioContext();
  
  // Třítonová sekvence - ascendentní
  const notes = [
    [392.00, 0.15], // G4
    [523.25, 0.15], // C5
    [659.25, 0.2]   // E5
  ];
  
  playSequence(notes, 0.12);
}

// ===================================================================
// ZVUK: NÁKUP VYLEPŠENÍ
// ===================================================================
// "Chiming" zvuk při koupi upgradu v shopu
export function playShopBuySound() {
  const ctx = getAudioContext();
  
  // Pětitonová harmonie - major akord
  const notes = [
    [523.25, 0.08],  // C5
    [659.25, 0.08],  // E5
    [783.99, 0.08],  // G5
    [659.25, 0.08],  // E5
    [523.25, 0.15]   // C5
  ];
  
  playSequence(notes, 0.08);
}

// ===================================================================
// ZVUK: LEVELUP
// ===================================================================
// Triumfální fanfára při dosažení nového levelu
export function playLevelUpSound() {
  const ctx = getAudioContext();
  
  // Ascendentní sekvence s výškou
  const notes = [
    [523.25, 0.15],  // C5
    [659.25, 0.15],  // E5
    [783.99, 0.15],  // G5
    [1046.50, 0.25]  // C6 - vrchol
  ];
  
  playSequence(notes, 0.14);
}

// ===================================================================
// ZVUK: CHYBA / NEMŮŽEŠ KOUPIT
// ===================================================================
// Zvuk když hráč nemá dost peněz na nákup
export function playErrorSound() {
  const ctx = getAudioContext();
  
  // Dvě noty - sestupná melodie (opakem nákupu)
  const notes = [
    [329.63, 0.15], // E4
    [246.94, 0.2]   // B3
  ];
  
  playSequence(notes, 0.12);
}

// ===================================================================
// ZVUK: BONUS - AMBIENT NOISE
// ===================================================================
// Lehký ambient zvuk (optional)
export function playAmbientPulse() {
  const ctx = getAudioContext();
  
  // Vytvoří měkký puls - šum procházející přes filter
  const noise = ctx.createBufferSource();
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  
  // Vyplň buffer s noise
  for (let i = 0; i < noiseBuffer.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  noise.buffer = noiseBuffer;
  
  // Propusť přes lowpass filter pro "měkčí" zvuk
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 200;
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  noise.start(ctx.currentTime);
  noise.stop(ctx.currentTime + 0.3);
}
