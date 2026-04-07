import { Block, BlockType, WORLD_W, WORLD_H, STAR_COUNT, getBiome, isSolid } from "./types";

function generateHeightmap(): number[] {
  const heights: number[] = [];
  let h = 3;
  for (let c = 0; c < WORLD_W; c++) {
    const r = Math.random();
    if (r < 0.15) h = Math.min(4, h + 1);
    else if (r < 0.3) h = Math.max(2, h - 1);
    heights.push(h);
  }
  heights[0] = 3; heights[1] = 3;
  heights[WORLD_W - 1] = 3; heights[WORLD_W - 2] = 3;
  return heights;
}

function placeItem(grid: Block[][], type: BlockType, count: number, occupied: Set<string>, heightmap: number[]) {
  let placed = 0, attempts = 0;
  while (placed < count && attempts < 300) {
    attempts++;
    const c = 2 + Math.floor(Math.random() * (WORLD_W - 4));
    const groundRow = WORLD_H - heightmap[c];
    const r = groundRow - 1;
    if (r < 0 || r >= WORLD_H) continue;
    const key = `${r},${c}`;
    if (occupied.has(key) || grid[r][c].type !== "air") continue;
    occupied.add(key);
    grid[r][c] = { type, biome: getBiome(c) };
    placed++;
  }
}

function placePlatformItem(grid: Block[][], type: BlockType, count: number, occupied: Set<string>) {
  let placed = 0, attempts = 0;
  while (placed < count && attempts < 300) {
    attempts++;
    const c = Math.floor(Math.random() * WORLD_W);
    for (let r = 0; r < WORLD_H - 1; r++) {
      if (grid[r + 1][c].type === "platform" && grid[r][c].type === "air") {
        const key = `${r},${c}`;
        if (occupied.has(key)) continue;
        occupied.add(key);
        grid[r][c] = { type, biome: getBiome(c) };
        placed++; break;
      }
    }
  }
}

export function generateWorld(): { grid: Block[][]; heightmap: number[] } {
  const heightmap = generateHeightmap();
  const grid: Block[][] = Array.from({ length: WORLD_H }, (_, r) =>
    Array.from({ length: WORLD_W }, (_, c) => ({ type: "air" as BlockType, biome: getBiome(c) }))
  );

  // Fill terrain
  for (let c = 0; c < WORLD_W; c++) {
    const groundHeight = heightmap[c];
    for (let h = 0; h < groundHeight; h++) {
      const r = WORLD_H - 1 - h;
      if (r < 0) continue;
      grid[r][c] = { type: h === groundHeight - 1 ? "grass" : "dirt", biome: getBiome(c) };
    }
  }

  // Floating platforms: fewer, thinner (1 row), no overlap
  const platformOccupied = new Set<string>();
  for (let i = 0; i < 7; i++) {
    const c = 5 + Math.floor(Math.random() * (WORLD_W - 10));
    const groundRow = WORLD_H - heightmap[c];
    const r = groundRow - 3; // 3 rows above ground surface
    if (r < 1 || r >= WORLD_H) continue;
    // Check no overlap with existing platforms
    const len = 2 + Math.floor(Math.random() * 2); // 2-3 wide only
    let canPlace = true;
    for (let j = 0; j < len && c + j < WORLD_W; j++) {
      const key = `${r},${c + j}`;
      if (platformOccupied.has(key) || grid[r][c + j].type !== "air") { canPlace = false; break; }
      // Also check row above and below aren't platforms
      if (r > 0 && grid[r - 1][c + j].type === "platform") { canPlace = false; break; }
      if (r < WORLD_H - 1 && grid[r + 1][c + j].type === "platform") { canPlace = false; break; }
    }
    if (!canPlace) continue;
    for (let j = 0; j < len && c + j < WORLD_W; j++) {
      platformOccupied.add(`${r},${c + j}`);
      grid[r][c + j] = { type: "platform", biome: getBiome(c + j) };
    }
  }

  // Stone variation in dirt
  for (let c = 0; c < WORLD_W; c++) {
    for (let r = WORLD_H - 1; r >= 0; r--) {
      if (grid[r][c].type === "dirt" && Math.random() < 0.15) {
        grid[r][c] = { type: "stone", biome: getBiome(c) };
      }
    }
  }

  // Finish castle
  const finishR = WORLD_H - heightmap[WORLD_W - 2] - 1;
  grid[finishR][WORLD_W - 2] = { type: "finish", biome: getBiome(WORLD_W - 2) };

  const occupied = new Set<string>([`0,0`, `0,1`, `${finishR},${WORLD_W - 2}`]);

  placeItem(grid, "star", STAR_COUNT, occupied, heightmap);
  placeItem(grid, "boost", 4, occupied, heightmap);
  placeItem(grid, "shield", 2, occupied, heightmap);
  placeItem(grid, "speed", 2, occupied, heightmap);
  placeItem(grid, "chest", 3, occupied, heightmap);
  placePlatformItem(grid, "star", 3, occupied);
  placePlatformItem(grid, "boost", 2, occupied);

  return { grid, heightmap };
}

export function getSpawnPos(heightmap: number[]): [number, number] {
  // Place player directly above the ground surface
  const groundRow = WORLD_H - heightmap[1]; // top of ground (grass row)
  return [groundRow - 1, 1]; // one above grass
}
