import { Block, BlockType, Biome, WORLD_W, WORLD_H, STAR_COUNT, getBiome, isSolid } from "./types";

function generateHeightmap(): number[] {
  const heights: number[] = [];
  let h = 3;
  for (let c = 0; c < WORLD_W; c++) {
    // Smooth random terrain
    const r = Math.random();
    if (r < 0.15) h = Math.min(5, h + 1);
    else if (r < 0.3) h = Math.max(2, h - 1);
    heights.push(h);
  }
  // Ensure start and end are accessible
  heights[0] = 3;
  heights[1] = 3;
  heights[WORLD_W - 1] = 3;
  heights[WORLD_W - 2] = 3;
  return heights;
}

function placeItem(
  grid: Block[][],
  type: BlockType,
  count: number,
  occupied: Set<string>,
  heightmap: number[]
) {
  let placed = 0;
  let attempts = 0;
  while (placed < count && attempts < 300) {
    attempts++;
    // Place items on ground surface
    const c = 2 + Math.floor(Math.random() * (WORLD_W - 4));
    const groundRow = WORLD_H - heightmap[c];
    const r = groundRow - 1; // one above ground
    if (r < 0 || r >= WORLD_H) continue;
    const key = `${r},${c}`;
    if (occupied.has(key)) continue;
    if (grid[r][c].type !== "air") continue;
    occupied.add(key);
    grid[r][c] = { type, biome: getBiome(c) };
    placed++;
  }
}

function placePlatformItem(
  grid: Block[][],
  type: BlockType,
  count: number,
  occupied: Set<string>
) {
  let placed = 0;
  let attempts = 0;
  while (placed < count && attempts < 300) {
    attempts++;
    // Find platform blocks and place item above
    const c = Math.floor(Math.random() * WORLD_W);
    for (let r = 0; r < WORLD_H - 1; r++) {
      if (grid[r + 1][c].type === "platform" && grid[r][c].type === "air") {
        const key = `${r},${c}`;
        if (occupied.has(key)) continue;
        occupied.add(key);
        grid[r][c] = { type, biome: getBiome(c) };
        placed++;
        break;
      }
    }
  }
}

export function generateWorld(): { grid: Block[][]; heightmap: number[] } {
  const heightmap = generateHeightmap();

  // Initialize with air
  const grid: Block[][] = Array.from({ length: WORLD_H }, (_, r) =>
    Array.from({ length: WORLD_W }, (_, c) => ({
      type: "air" as BlockType,
      biome: getBiome(c),
    }))
  );

  // Fill terrain based on heightmap
  for (let c = 0; c < WORLD_W; c++) {
    const groundHeight = heightmap[c];
    for (let h = 0; h < groundHeight; h++) {
      const r = WORLD_H - 1 - h;
      if (r < 0) continue;
      grid[r][c] = {
        type: h === groundHeight - 1 ? "grass" : "dirt",
        biome: getBiome(c),
      };
    }
  }

  // Add floating platforms
  const platformCount = 12;
  for (let i = 0; i < platformCount; i++) {
    const c = 4 + Math.floor(Math.random() * (WORLD_W - 8));
    const groundRow = WORLD_H - heightmap[c];
    const r = groundRow - 3 - Math.floor(Math.random() * 2); // 3-4 above ground
    if (r < 1 || r >= WORLD_H) continue;
    const len = 2 + Math.floor(Math.random() * 3); // 2-4 wide
    for (let j = 0; j < len && c + j < WORLD_W; j++) {
      if (grid[r][c + j].type === "air") {
        grid[r][c + j] = { type: "platform", biome: getBiome(c + j) };
      }
    }
  }

  // Add some stone blocks in terrain
  for (let c = 0; c < WORLD_W; c++) {
    for (let r = WORLD_H - 1; r >= 0; r--) {
      if (grid[r][c].type === "dirt" && Math.random() < 0.15) {
        grid[r][c] = { type: "stone", biome: getBiome(c) };
      }
    }
  }

  // Place finish at far right on ground
  const finishR = WORLD_H - heightmap[WORLD_W - 2] - 1;
  grid[finishR][WORLD_W - 2] = { type: "finish", biome: getBiome(WORLD_W - 2) };

  // Place items
  const occupied = new Set<string>([
    "0,0", "0,1",
    `${finishR},${WORLD_W - 2}`,
  ]);

  placeItem(grid, "question", 14, occupied, heightmap);
  placeItem(grid, "star", STAR_COUNT, occupied, heightmap);
  placeItem(grid, "boost", 4, occupied, heightmap);
  placeItem(grid, "shield", 2, occupied, heightmap);
  placeItem(grid, "speed", 2, occupied, heightmap);
  placeItem(grid, "chest", 3, occupied, heightmap);

  // Some items on platforms too
  placePlatformItem(grid, "star", 3, occupied);
  placePlatformItem(grid, "question", 3, occupied);
  placePlatformItem(grid, "boost", 2, occupied);

  return { grid, heightmap };
}

export function getSpawnPos(heightmap: number[]): [number, number] {
  return [WORLD_H - heightmap[1] - 1, 1];
}
