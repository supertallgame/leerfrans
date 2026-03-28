let soundEnabled = true;

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  try {
    localStorage.setItem("sound-enabled", JSON.stringify(enabled));
  } catch {}
}

// Load from localStorage on init
try {
  const stored = localStorage.getItem("sound-enabled");
  if (stored !== null) soundEnabled = JSON.parse(stored);
} catch {}

const ctx = () => new (window.AudioContext || (window as any).webkitAudioContext)();

function beep(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.3) {
  if (!soundEnabled) return;
  const ac = ctx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(ac.destination);
  gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + duration);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

export function playCorrect() {
  beep(523, 0.12); // C5
  setTimeout(() => beep(659, 0.12), 100); // E5
  setTimeout(() => beep(784, 0.2), 200); // G5
}

export function playWrong() {
  beep(311, 0.15, "square", 0.2); // Eb4
  setTimeout(() => beep(233, 0.3, "square", 0.2), 150); // Bb3
}

export function playSkip() {
  beep(600, 0.06, "sine", 0.08); // gentle short boop
}

export function playHint() {
  beep(880, 0.05, "sine", 0.1);
  setTimeout(() => beep(880, 0.05, "sine", 0.1), 120);
}

export function playCountdownTick() {
  beep(440, 0.08, "sine", 0.15); // A4 short tick
}

export function playCountdownGo() {
  beep(523, 0.1, "sine", 0.2); // C5
  setTimeout(() => beep(659, 0.1, "sine", 0.2), 80); // E5
  setTimeout(() => beep(784, 0.15, "sine", 0.25), 160); // G5
  setTimeout(() => beep(1047, 0.25, "sine", 0.3), 240); // C6
}

export function playVictory() {
  // Triumphant ascending fanfare
  beep(523, 0.12, "sine", 0.2);    // C5
  setTimeout(() => beep(659, 0.12, "sine", 0.2), 100);  // E5
  setTimeout(() => beep(784, 0.12, "sine", 0.25), 200); // G5
  setTimeout(() => beep(1047, 0.15, "sine", 0.3), 300);  // C6
  setTimeout(() => beep(1319, 0.15, "sine", 0.3), 420);  // E6
  setTimeout(() => beep(1568, 0.3, "sine", 0.25), 540);  // G6 (held)
}
