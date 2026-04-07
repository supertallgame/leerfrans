export const WORLD_W = 60;
export const WORLD_H = 10;
export const VIEW_W = 16;
export const VIEW_H = 10;
export const MAX_ENERGY = 300;
export const START_ENERGY = 200;
export const MOVE_COST = 1;
export const CORRECT_REWARD = 20;
export const STAR_COUNT = 12;

export type BlockType =
  | "air" | "dirt" | "grass" | "stone" | "platform"
  | "star" | "finish"
  | "boost" | "shield" | "speed" | "chest";

export type Biome = "forest" | "swamp" | "snow" | "desert";

export interface Block {
  type: BlockType;
  collected?: boolean;
  biome: Biome;
}

export interface QuizState {
  term: string;
  correctAnswer: string;
  options: string[];
}

export interface EnergyMarker {
  r: number;
  c: number;
  amount: number;
  id: number;
}

export function isSolid(type: BlockType) {
  return type === "dirt" || type === "grass" || type === "stone" || type === "platform";
}

export function isItem(type: BlockType) {
  return ["star", "boost", "shield", "speed", "chest", "finish"].includes(type);
}

export function getBiome(c: number): Biome {
  if (c < WORLD_W * 0.25) return "forest";
  if (c < WORLD_W * 0.5) return "swamp";
  if (c < WORLD_W * 0.75) return "snow";
  return "desert";
}

export const BLOCK_COLORS: Record<Biome, Record<string, string>> = {
  forest: {
    dirt: "#6B3A1F", grass: "#2D8B2D", stone: "#6B6B6B",
    platform: "#8B6914", sky: "#5BA3D9",
  },
  swamp: {
    dirt: "#4A5A2B", grass: "#5A7A23", stone: "#5A6B5A",
    platform: "#4A5A3C", sky: "#6B9B6B",
  },
  snow: {
    dirt: "#8A9BB0", grass: "#D8E8F8", stone: "#A0A8B0",
    platform: "#909AA8", sky: "#B8C8D8",
  },
  desert: {
    dirt: "#C8A060", grass: "#D4A84A", stone: "#B8A078",
    platform: "#A88040", sky: "#E8C888",
  },
};

export const ITEM_EMOJI: Record<string, string> = {
  star: "⭐",
  finish: "🏰",
  boost: "⚡",
  shield: "🛡️",
  speed: "👟",
  chest: "🎁",
};

// ─── Pixel-art sprite system ───
// Each pixel is PX×PX CSS pixels via box-shadow.
const PX = 2;
function px(x: number, y: number, color: string) {
  return `${x * PX}px ${y * PX}px 0 ${PX}px ${color}`;
}

// ─── PLAYER: 12×14 pixel wizard ───
function makeWizard(frame: 0 | 1): string {
  const p: string[] = [];
  // Hat tip
  p.push(px(5, 0, "#4C1D95"), px(6, 0, "#4C1D95"));
  // Hat mid
  p.push(px(4, 1, "#6D28D9"), px(5, 1, "#7C3AED"), px(6, 1, "#7C3AED"), px(7, 1, "#6D28D9"));
  // Hat brim
  p.push(px(3, 2, "#8B5CF6"), px(4, 2, "#8B5CF6"), px(5, 2, "#A78BFA"), px(6, 2, "#A78BFA"), px(7, 2, "#8B5CF6"), px(8, 2, "#8B5CF6"));
  // Hat star
  p.push(px(6, 1, "#FBBF24"));
  // Hair
  p.push(px(3, 3, "#92400E"), px(4, 3, "#B45309"), px(7, 3, "#B45309"), px(8, 3, "#92400E"));
  // Face row 1
  p.push(px(4, 3, "#FDE68A"), px(5, 3, "#FDE68A"), px(6, 3, "#FDE68A"), px(7, 3, "#FDE68A"));
  // Face row 2 - eyes
  p.push(px(3, 4, "#FDE68A"), px(4, 4, "#FDE68A"), px(5, 4, "#1E293B"), px(6, 4, "#FDE68A"), px(7, 4, "#1E293B"), px(8, 4, "#FDE68A"));
  // Face row 3 - beard/mouth
  p.push(px(4, 5, "#FDE68A"), px(5, 5, "#FDE68A"), px(6, 5, "#EF4444"), px(7, 5, "#FDE68A"));
  // Beard
  p.push(px(4, 6, "#D1D5DB"), px(5, 6, "#E5E7EB"), px(6, 6, "#E5E7EB"), px(7, 6, "#D1D5DB"));
  // Robe top
  p.push(px(3, 7, "#1D4ED8"), px(4, 7, "#2563EB"), px(5, 7, "#3B82F6"), px(6, 7, "#3B82F6"), px(7, 7, "#2563EB"), px(8, 7, "#1D4ED8"));
  // Belt
  p.push(px(4, 8, "#92400E"), px(5, 8, "#B45309"), px(6, 8, "#FBBF24"), px(7, 8, "#B45309"));
  // Robe bottom
  p.push(px(3, 9, "#1E40AF"), px(4, 9, "#2563EB"), px(5, 9, "#3B82F6"), px(6, 9, "#3B82F6"), px(7, 9, "#2563EB"), px(8, 9, "#1E40AF"));
  // Robe skirt
  p.push(px(2, 10, "#1E3A8A"), px(3, 10, "#1D4ED8"), px(4, 10, "#2563EB"), px(5, 10, "#3B82F6"), px(6, 10, "#3B82F6"), px(7, 10, "#2563EB"), px(8, 10, "#1D4ED8"), px(9, 10, "#1E3A8A"));
  // Staff (right side)
  p.push(px(9, 5, "#78350F"), px(9, 6, "#78350F"), px(9, 7, "#92400E"), px(9, 8, "#92400E"), px(9, 9, "#78350F"), px(9, 10, "#78350F"));
  // Staff orb
  p.push(px(9, 4, "#22D3EE"), px(10, 4, "#06B6D4"), px(9, 3, "#67E8F9"));
  // Boots (animated)
  if (frame === 0) {
    p.push(px(4, 11, "#78350F"), px(5, 11, "#92400E"), px(6, 11, "#92400E"), px(7, 11, "#78350F"));
  } else {
    p.push(px(3, 11, "#78350F"), px(4, 11, "#92400E"), px(7, 11, "#92400E"), px(8, 11, "#78350F"));
  }
  return p.join(",");
}

// ─── PLAYER JUMP: wizard with arms up, legs together ───
function makeWizardJump(): string {
  const p: string[] = [];
  // Hat tip (higher)
  p.push(px(5, 0, "#4C1D95"), px(6, 0, "#4C1D95"));
  p.push(px(4, 1, "#6D28D9"), px(5, 1, "#7C3AED"), px(6, 1, "#7C3AED"), px(7, 1, "#6D28D9"));
  p.push(px(3, 2, "#8B5CF6"), px(4, 2, "#8B5CF6"), px(5, 2, "#A78BFA"), px(6, 2, "#A78BFA"), px(7, 2, "#8B5CF6"), px(8, 2, "#8B5CF6"));
  p.push(px(6, 1, "#FBBF24")); // hat star
  // Face
  p.push(px(3, 3, "#92400E"), px(4, 3, "#FDE68A"), px(5, 3, "#FDE68A"), px(6, 3, "#FDE68A"), px(7, 3, "#FDE68A"), px(8, 3, "#92400E"));
  p.push(px(3, 4, "#FDE68A"), px(4, 4, "#FDE68A"), px(5, 4, "#1E293B"), px(6, 4, "#FDE68A"), px(7, 4, "#1E293B"), px(8, 4, "#FDE68A"));
  p.push(px(4, 5, "#FDE68A"), px(5, 5, "#FDE68A"), px(6, 5, "#FDE68A"), px(7, 5, "#FDE68A"));
  // Beard
  p.push(px(4, 6, "#D1D5DB"), px(5, 6, "#E5E7EB"), px(6, 6, "#E5E7EB"), px(7, 6, "#D1D5DB"));
  // Arms up!
  p.push(px(1, 5, "#1D4ED8"), px(2, 4, "#2563EB"), px(10, 4, "#2563EB"), px(11, 5, "#1D4ED8"));
  // Staff raised
  p.push(px(11, 3, "#22D3EE"), px(12, 3, "#06B6D4"), px(11, 2, "#67E8F9"));
  p.push(px(11, 4, "#78350F"), px(11, 5, "#78350F"), px(11, 6, "#92400E"));
  // Robe (compact)
  p.push(px(3, 7, "#1D4ED8"), px(4, 7, "#2563EB"), px(5, 7, "#3B82F6"), px(6, 7, "#3B82F6"), px(7, 7, "#2563EB"), px(8, 7, "#1D4ED8"));
  p.push(px(4, 8, "#92400E"), px(5, 8, "#B45309"), px(6, 8, "#FBBF24"), px(7, 8, "#B45309"));
  p.push(px(3, 9, "#1E40AF"), px(4, 9, "#2563EB"), px(5, 9, "#3B82F6"), px(6, 9, "#3B82F6"), px(7, 9, "#2563EB"), px(8, 9, "#1E40AF"));
  p.push(px(3, 10, "#1E3A8A"), px(4, 10, "#1D4ED8"), px(5, 10, "#2563EB"), px(6, 10, "#2563EB"), px(7, 10, "#1D4ED8"), px(8, 10, "#1E3A8A"));
  // Boots together
  p.push(px(4, 11, "#78350F"), px(5, 11, "#92400E"), px(6, 11, "#92400E"), px(7, 11, "#78350F"));
  return p.join(",");
}

export const PLAYER_FRAMES = [makeWizard(0), makeWizard(1)];
export const PLAYER_JUMP_FRAME = makeWizardJump();

// ─── Block texture patterns (CSS background for each block type per biome) ───
export function getBlockStyle(type: string, biome: Biome): React.CSSProperties {
  const colors = BLOCK_COLORS[biome];
  const base = colors[type] || colors.dirt;

  switch (type) {
    case "grass": {
      const dark = colors.dirt;
      return {
        background: `
          linear-gradient(180deg,
            ${base} 0%, ${base} 30%,
            ${adjustColor(base, -15)} 30%, ${adjustColor(base, -15)} 35%,
            ${dark} 35%, ${dark} 100%
          )`,
        boxShadow: `inset 0 1px 0 ${adjustColor(base, 20)}, inset 0 -1px 0 ${adjustColor(dark, -10)}`,
      };
    }
    case "dirt": {
      return {
        background: `
          radial-gradient(circle at 25% 40%, ${adjustColor(base, 12)} 2px, transparent 2px),
          radial-gradient(circle at 70% 70%, ${adjustColor(base, -12)} 2px, transparent 2px),
          radial-gradient(circle at 50% 20%, ${adjustColor(base, 8)} 1px, transparent 1px),
          radial-gradient(circle at 80% 30%, ${adjustColor(base, -8)} 1px, transparent 1px),
          linear-gradient(180deg, ${adjustColor(base, 5)} 0%, ${base} 50%, ${adjustColor(base, -8)} 100%)
        `,
        boxShadow: `inset 0 1px 0 ${adjustColor(base, 10)}, inset 0 -1px 0 ${adjustColor(base, -10)}`,
      };
    }
    case "stone": {
      return {
        background: `
          linear-gradient(135deg, ${adjustColor(base, 10)} 25%, transparent 25%),
          linear-gradient(225deg, ${adjustColor(base, 5)} 25%, transparent 25%),
          linear-gradient(315deg, ${adjustColor(base, -5)} 25%, transparent 25%),
          linear-gradient(45deg, ${adjustColor(base, -10)} 25%, transparent 25%),
          linear-gradient(180deg, ${adjustColor(base, 8)} 0%, ${base} 50%, ${adjustColor(base, -12)} 100%)
        `,
        backgroundSize: "50% 50%, 50% 50%, 50% 50%, 50% 50%, 100% 100%",
        boxShadow: `inset 1px 1px 0 ${adjustColor(base, 15)}, inset -1px -1px 0 ${adjustColor(base, -15)}`,
      };
    }
    case "platform": {
      return {
        background: `
          repeating-linear-gradient(90deg,
            ${base} 0px, ${base} 8px,
            ${adjustColor(base, -12)} 8px, ${adjustColor(base, -12)} 9px,
            ${adjustColor(base, 8)} 9px, ${adjustColor(base, 8)} 17px,
            ${adjustColor(base, -8)} 17px, ${adjustColor(base, -8)} 18px
          ),
          linear-gradient(180deg, ${adjustColor(base, 15)} 0%, ${base} 40%, ${adjustColor(base, -10)} 100%)
        `,
        boxShadow: `inset 0 2px 0 ${adjustColor(base, 20)}, inset 0 -1px 0 ${adjustColor(base, -20)}, 0 2px 4px rgba(0,0,0,0.3)`,
        borderRadius: "2px",
      };
    }
    default:
      return { background: base };
  }
}

function adjustColor(hex: string, amount: number): string {
  const r = Math.min(255, Math.max(0, parseInt(hex.slice(1, 3), 16) + amount));
  const g = Math.min(255, Math.max(0, parseInt(hex.slice(3, 5), 16) + amount));
  const b = Math.min(255, Math.max(0, parseInt(hex.slice(5, 7), 16) + amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// ─── CASTLE: 12×12 pixel castle ───
export const CASTLE_SPRITE = (() => {
  const p: string[] = [];
  // Towers (left & right)
  [1, 10].forEach(tx => {
    p.push(px(tx, 0, "#78716C"), px(tx, 1, "#A8A29E"));
    // Flag
    p.push(px(tx, -1, "#EF4444"), px(tx + 1, -1, "#EF4444"));
  });
  // Battlements
  for (let x = 0; x < 12; x += 2) {
    p.push(px(x, 2, "#A8A29E"));
  }
  // Wall
  for (let x = 0; x < 12; x++) {
    p.push(px(x, 3, "#D6D3D1"), px(x, 4, "#E7E5E4"), px(x, 5, "#D6D3D1"));
    p.push(px(x, 6, "#D6D3D1"), px(x, 7, "#E7E5E4"));
  }
  // Windows
  p.push(px(3, 4, "#1E293B"), px(4, 4, "#1E293B"), px(7, 4, "#1E293B"), px(8, 4, "#1E293B"));
  // Door
  p.push(px(5, 5, "#78350F"), px(6, 5, "#78350F"), px(5, 6, "#78350F"), px(6, 6, "#78350F"), px(5, 7, "#92400E"), px(6, 7, "#92400E"));
  // Door handle
  p.push(px(6, 6, "#FBBF24"));
  // Base
  for (let x = 0; x < 12; x++) {
    p.push(px(x, 8, "#78716C"), px(x, 9, "#57534E"));
  }
  return p.join(",");
})();

// ─── STAR: 10×10 pixel star ───
export const STAR_SPRITE = (() => {
  const p: string[] = [];
  const gold = "#FBBF24", light = "#FDE68A", dark = "#D97706";
  p.push(px(4, 0, light), px(5, 0, light));
  p.push(px(4, 1, gold), px(5, 1, gold));
  p.push(px(3, 2, gold), px(4, 2, light), px(5, 2, light), px(6, 2, gold));
  p.push(px(0, 3, dark), px(1, 3, gold), px(2, 3, gold), px(3, 3, light), px(4, 3, light), px(5, 3, light), px(6, 3, light), px(7, 3, gold), px(8, 3, gold), px(9, 3, dark));
  p.push(px(1, 4, gold), px(2, 4, light), px(3, 4, light), px(4, 4, light), px(5, 4, light), px(6, 4, light), px(7, 4, light), px(8, 4, gold));
  p.push(px(2, 5, gold), px(3, 5, gold), px(4, 5, light), px(5, 5, light), px(6, 5, gold), px(7, 5, gold));
  p.push(px(3, 6, dark), px(4, 6, gold), px(5, 6, gold), px(6, 6, dark));
  p.push(px(2, 7, dark), px(3, 7, gold), px(6, 7, gold), px(7, 7, dark));
  p.push(px(1, 8, dark), px(2, 8, gold), px(7, 8, gold), px(8, 8, dark));
  return p.join(",");
})();

// ─── BOOST: 10×10 pixel lightning bolt ───
export const BOOST_SPRITE = (() => {
  const p: string[] = [];
  const y1 = "#FBBF24", y2 = "#F59E0B", y3 = "#D97706";
  p.push(px(5, 0, y1), px(6, 0, y1));
  p.push(px(4, 1, y1), px(5, 1, y2));
  p.push(px(3, 2, y1), px(4, 2, y2), px(5, 2, y2));
  p.push(px(2, 3, y2), px(3, 3, y2), px(4, 3, y1), px(5, 3, y1), px(6, 3, y1), px(7, 3, y1));
  p.push(px(4, 4, y2), px(5, 4, y1), px(6, 4, y2));
  p.push(px(3, 5, y2), px(4, 5, y1), px(5, 5, y3));
  p.push(px(2, 6, y3), px(3, 6, y2));
  p.push(px(1, 7, y3), px(2, 7, y2));
  return p.join(",");
})();

// ─── SHIELD: 10×10 pixel shield ───
export const SHIELD_SPRITE = (() => {
  const p: string[] = [];
  const b1 = "#3B82F6", b2 = "#2563EB", b3 = "#1D4ED8", g = "#FBBF24";
  p.push(px(2, 0, b3), px(3, 0, b2), px(4, 0, b1), px(5, 0, b1), px(6, 0, b2), px(7, 0, b3));
  p.push(px(1, 1, b3), px(2, 1, b2), px(3, 1, b1), px(4, 1, g), px(5, 1, g), px(6, 1, b1), px(7, 1, b2), px(8, 1, b3));
  p.push(px(1, 2, b2), px(2, 2, b1), px(3, 2, g), px(4, 2, g), px(5, 2, g), px(6, 2, g), px(7, 2, b1), px(8, 2, b2));
  p.push(px(1, 3, b2), px(2, 3, b1), px(3, 3, g), px(4, 3, b1), px(5, 3, b1), px(6, 3, g), px(7, 3, b1), px(8, 3, b2));
  p.push(px(2, 4, b2), px(3, 4, b1), px(4, 4, b1), px(5, 4, b1), px(6, 4, b1), px(7, 4, b2));
  p.push(px(2, 5, b3), px(3, 5, b2), px(4, 5, b1), px(5, 5, b1), px(6, 5, b2), px(7, 5, b3));
  p.push(px(3, 6, b3), px(4, 6, b2), px(5, 6, b2), px(6, 6, b3));
  p.push(px(4, 7, b3), px(5, 7, b3));
  return p.join(",");
})();

// ─── CHEST: 10×10 pixel treasure chest ───
export const CHEST_SPRITE = (() => {
  const p: string[] = [];
  const w1 = "#92400E", w2 = "#B45309", w3 = "#D97706", gold = "#FBBF24";
  // Lid
  p.push(px(2, 1, w1), px(3, 1, w2), px(4, 1, w2), px(5, 1, w2), px(6, 1, w2), px(7, 1, w1));
  p.push(px(1, 2, w1), px(2, 2, w2), px(3, 2, w3), px(4, 2, w3), px(5, 2, w3), px(6, 2, w3), px(7, 2, w2), px(8, 2, w1));
  // Lock band
  p.push(px(1, 3, gold), px(2, 3, gold), px(3, 3, w2), px(4, 3, gold), px(5, 3, gold), px(6, 3, w2), px(7, 3, gold), px(8, 3, gold));
  // Body
  p.push(px(1, 4, w1), px(2, 4, w2), px(3, 4, w2), px(4, 4, w3), px(5, 4, w3), px(6, 4, w2), px(7, 4, w2), px(8, 4, w1));
  p.push(px(1, 5, w1), px(2, 5, w2), px(3, 5, w2), px(4, 5, gold), px(5, 5, gold), px(6, 5, w2), px(7, 5, w2), px(8, 5, w1));
  // Base
  p.push(px(1, 6, w1), px(2, 6, w1), px(3, 6, w2), px(4, 6, w2), px(5, 6, w2), px(6, 6, w2), px(7, 6, w1), px(8, 6, w1));
  return p.join(",");
})();

// ─── SPEED BOOT: 10×8 pixel boot ───
export const SPEED_SPRITE = (() => {
  const p: string[] = [];
  const r1 = "#DC2626", r2 = "#EF4444", r3 = "#FCA5A5";
  p.push(px(4, 0, r1), px(5, 0, r1));
  p.push(px(3, 1, r1), px(4, 1, r2), px(5, 1, r2), px(6, 1, r1));
  p.push(px(3, 2, r2), px(4, 2, r2), px(5, 2, r3), px(6, 2, r2));
  p.push(px(3, 3, r2), px(4, 3, r3), px(5, 3, r2), px(6, 3, r1));
  p.push(px(2, 4, r1), px(3, 4, r2), px(4, 4, r2), px(5, 4, r1));
  p.push(px(1, 5, r1), px(2, 5, r2), px(3, 5, r2), px(4, 5, r1), px(5, 5, "#FBBF24"), px(6, 5, "#FBBF24"));
  p.push(px(0, 6, r1), px(1, 6, r1), px(2, 6, r1), px(3, 6, r1), px(4, 6, r1));
  return p.join(",");
})();
