export const WORLD_W = 60;
export const WORLD_H = 10;
export const VIEW_W = 16;
export const VIEW_H = 10;
export const MAX_ENERGY = 120;
export const START_ENERGY = 70;
export const MOVE_COST = 1;
export const CORRECT_REWARD = 18;
export const STAR_COUNT = 12;

export type BlockType =
  | "air" | "dirt" | "grass" | "stone" | "platform"
  | "question" | "star" | "finish"
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

export function isSolid(type: BlockType) {
  return type === "dirt" || type === "grass" || type === "stone" || type === "platform";
}

export function isItem(type: BlockType) {
  return ["question", "star", "boost", "shield", "speed", "chest", "finish"].includes(type);
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
    skyGradient: "linear-gradient(180deg, #3A8AD4 0%, #87CEEB 100%)",
  },
  swamp: {
    dirt: "#4A5A2B", grass: "#5A7A23", stone: "#5A6B5A",
    platform: "#4A5A3C", sky: "#6B9B6B",
    skyGradient: "linear-gradient(180deg, #4A7A4A 0%, #8FBC8F 100%)",
  },
  snow: {
    dirt: "#8A9BB0", grass: "#D8E8F8", stone: "#A0A8B0",
    platform: "#909AA8", sky: "#B8C8D8",
    skyGradient: "linear-gradient(180deg, #90A8C0 0%, #D0E0F0 100%)",
  },
  desert: {
    dirt: "#C8A060", grass: "#D4A84A", stone: "#B8A078",
    platform: "#A88040", sky: "#E8C888",
    skyGradient: "linear-gradient(180deg, #D4A050 0%, #F0D898 100%)",
  },
};

export const ITEM_EMOJI: Record<string, string> = {
  question: "📜",
  star: "⭐",
  finish: "🏰",
  boost: "⚡",
  shield: "🛡️",
  speed: "👟",
  chest: "🎁",
};
