const COLORS = ["#7c3aed", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#ec4899"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export function fireConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;

  const particles: Particle[] = [];
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: canvas.width * (0.3 + Math.random() * 0.4),
      y: canvas.height * 0.4,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 16 - 4,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      opacity: 1,
    });
  }

  let frame: number;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      p.vy += 0.4;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.008;
      if (p.opacity <= 0) continue;
      alive = true;
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive) {
      frame = requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  };
  frame = requestAnimationFrame(animate);

  setTimeout(() => {
    cancelAnimationFrame(frame);
    canvas.remove();
  }, 4000);
}
