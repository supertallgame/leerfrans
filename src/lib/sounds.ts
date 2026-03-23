const ctx = () => new (window.AudioContext || (window as any).webkitAudioContext)();

function beep(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.3) {
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
