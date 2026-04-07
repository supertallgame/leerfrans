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

// Pixel-art block colors per biome
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

// Pixel-art character sprites (CSS box-shadow pixel art)
// Each "pixel" is 4x4px. Origin is top-left of a ~28x28 box.
// Format: "offsetX offsetY 0 size color"
const PX = 3; // pixel size

function px(x: number, y: number, color: string) {
  return `${x * PX}px ${y * PX}px 0 ${PX}px ${color}`;
}

export const PLAYER_SPRITE = [
  // Hat (purple wizard hat)
  px(3, 0, "#6B21A8"), px(4, 0, "#6B21A8"),
  px(2, 1, "#7C3AED"), px(3, 1, "#7C3AED"), px(4, 1, "#7C3AED"), px(5, 1, "#7C3AED"),
  px(1, 2, "#8B5CF6"), px(2, 2, "#8B5CF6"), px(3, 2, "#8B5CF6"), px(4, 2, "#8B5CF6"), px(5, 2, "#8B5CF6"), px(6, 2, "#8B5CF6"),
  // Face
  px(2, 3, "#FBBF24"), px(3, 3, "#FDE68A"), px(4, 3, "#FDE68A"), px(5, 3, "#FBBF24"),
  px(2, 4, "#FDE68A"), px(3, 4, "#1E1E1E"), px(4, 4, "#1E1E1E"), px(5, 4, "#FDE68A"),
  px(2, 5, "#FDE68A"), px(3, 5, "#FDE68A"), px(4, 5, "#F87171"), px(5, 5, "#FDE68A"),
  // Body (blue robe)
  px(2, 6, "#2563EB"), px(3, 6, "#3B82F6"), px(4, 6, "#3B82F6"), px(5, 6, "#2563EB"),
  px(1, 7, "#2563EB"), px(2, 7, "#3B82F6"), px(3, 7, "#3B82F6"), px(4, 7, "#3B82F6"), px(5, 7, "#3B82F6"), px(6, 7, "#2563EB"),
  // Legs
  px(2, 8, "#92400E"), px(3, 8, "#92400E"), px(4, 8, "#92400E"), px(5, 8, "#92400E"),
].join(",");

export const TREE_SPRITE = [
  px(3, 0, "#166534"), px(4, 0, "#166534"),
  px(2, 1, "#15803D"), px(3, 1, "#22C55E"), px(4, 1, "#22C55E"), px(5, 1, "#15803D"),
  px(1, 2, "#15803D"), px(2, 2, "#22C55E"), px(3, 2, "#16A34A"), px(4, 2, "#22C55E"), px(5, 2, "#16A34A"), px(6, 2, "#15803D"),
  px(1, 3, "#166534"), px(2, 3, "#22C55E"), px(3, 3, "#22C55E"), px(4, 3, "#16A34A"), px(5, 3, "#22C55E"), px(6, 3, "#166534"),
  px(3, 4, "#92400E"), px(4, 4, "#92400E"),
  px(3, 5, "#78350F"), px(4, 5, "#78350F"),
].join(",");

export const CASTLE_SPRITE = [
  px(1, 0, "#78716C"), px(3, 0, "#78716C"), px(5, 0, "#78716C"),
  px(0, 1, "#A8A29E"), px(1, 1, "#A8A29E"), px(2, 1, "#A8A29E"), px(3, 1, "#A8A29E"), px(4, 1, "#A8A29E"), px(5, 1, "#A8A29E"), px(6, 1, "#A8A29E"),
  px(0, 2, "#D6D3D1"), px(1, 2, "#D6D3D1"), px(2, 2, "#D6D3D1"), px(3, 2, "#D6D3D1"), px(4, 2, "#D6D3D1"), px(5, 2, "#D6D3D1"), px(6, 2, "#D6D3D1"),
  px(0, 3, "#D6D3D1"), px(1, 3, "#D6D3D1"), px(2, 3, "#D6D3D1"), px(3, 3, "#78350F"), px(4, 3, "#D6D3D1"), px(5, 3, "#D6D3D1"), px(6, 3, "#D6D3D1"),
  px(0, 4, "#D6D3D1"), px(1, 4, "#D6D3D1"), px(2, 4, "#D6D3D1"), px(3, 4, "#78350F"), px(4, 4, "#D6D3D1"), px(5, 4, "#D6D3D1"), px(6, 4, "#D6D3D1"),
].join(",");
