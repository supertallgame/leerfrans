import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Plus, Trash2, Shuffle, Check, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Direction = [number, number];
type PlacedWord = { word: string; row: number; col: number; dir: Direction };

const DIRECTIONS: Direction[] = [
  [0, 1], [1, 0], [1, 1], [1, -1],
  [0, -1], [-1, 0], [-1, -1], [-1, 1],
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generateGrid(words: string[], size: number): { grid: string[][]; placed: PlacedWord[] } {
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(""));
  const placed: PlacedWord[] = [];
  const sorted = [...words].sort((a, b) => b.length - a.length);

  for (const rawWord of sorted) {
    const word = rawWord.toUpperCase().replace(/[^A-Z]/g, "");
    if (!word || word.length > size) continue;

    let didPlace = false;
    const shuffledDirs = [...DIRECTIONS].sort(() => Math.random() - 0.5);

    for (let attempt = 0; attempt < 200; attempt++) {
      const dir = shuffledDirs[attempt % shuffledDirs.length];
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);

      if (canPlace(grid, word, row, col, dir, size)) {
        placeWord(grid, word, row, col, dir);
        placed.push({ word, row, col, dir });
        didPlace = true;
        break;
      }
    }
    if (!didPlace) console.warn(`Could not place: ${word}`);
  }

  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (!grid[r][c]) grid[r][c] = ALPHABET[Math.floor(Math.random() * 26)];

  return { grid, placed };
}

function canPlace(grid: string[][], word: string, row: number, col: number, dir: Direction, size: number): boolean {
  for (let i = 0; i < word.length; i++) {
    const r = row + dir[0] * i;
    const c = col + dir[1] * i;
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    if (grid[r][c] && grid[r][c] !== word[i]) return false;
  }
  return true;
}

function placeWord(grid: string[][], word: string, row: number, col: number, dir: Direction) {
  for (let i = 0; i < word.length; i++) {
    grid[row + dir[0] * i][col + dir[1] * i] = word[i];
  }
}

function getCellsForWord(pw: PlacedWord): string[] {
  const cells: string[] = [];
  for (let i = 0; i < pw.word.length; i++) {
    cells.push(`${pw.row + pw.dir[0] * i},${pw.col + pw.dir[1] * i}`);
  }
  return cells;
}

export default function Woordenzoeker() {
  const navigate = useNavigate();
  const [words, setWords] = useState<string[]>(["SCHOOL", "BOEK", "LERAAR", "KLAS", "LEREN"]);
  const [newWord, setNewWord] = useState("");
  const [gridSize, setGridSize] = useState(14);
  const [grid, setGrid] = useState<string[][] | null>(null);
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [selecting, setSelecting] = useState(false);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [startCell, setStartCell] = useState<string | null>(null);
  const [highlightedCells, setHighlightedCells] = useState<Map<string, string>>(new Map());
  const gridRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  const FOUND_COLORS = [
    "hsl(262 60% 55% / 0.25)", "hsl(160 50% 45% / 0.25)", "hsl(45 80% 65% / 0.35)",
    "hsl(0 72% 55% / 0.2)", "hsl(200 70% 50% / 0.2)", "hsl(300 50% 50% / 0.2)",
    "hsl(30 80% 55% / 0.25)", "hsl(180 60% 40% / 0.2)",
  ];

  const generate = useCallback(() => {
    const validWords = words.filter((w) => w.trim().length > 0);
    if (validWords.length === 0) return;
    const { grid: g, placed } = generateGrid(validWords, gridSize);
    setGrid(g);
    setPlacedWords(placed);
    setFoundWords(new Set());
    setSelectedCells(new Set());
    setHighlightedCells(new Map());
  }, [words, gridSize]);

  const addWord = () => {
    const w = newWord.trim().toUpperCase();
    if (w && !words.includes(w)) {
      setWords([...words, w]);
      setNewWord("");
    }
  };

  const removeWord = (i: number) => setWords(words.filter((_, idx) => idx !== i));

  // Selection logic
  const cellKey = (r: number, c: number) => `${r},${c}`;

  const getCellsBetween = (start: string, end: string): Set<string> => {
    const [sr, sc] = start.split(",").map(Number);
    const [er, ec] = end.split(",").map(Number);
    const dr = Math.sign(er - sr);
    const dc = Math.sign(ec - sc);
    const dist = Math.max(Math.abs(er - sr), Math.abs(ec - sc));

    // Only allow straight lines (horizontal, vertical, diagonal)
    if (er - sr !== 0 && ec - sc !== 0 && Math.abs(er - sr) !== Math.abs(ec - sc)) {
      return new Set([start]);
    }

    const cells = new Set<string>();
    for (let i = 0; i <= dist; i++) {
      cells.add(cellKey(sr + dr * i, sc + dc * i));
    }
    return cells;
  };

  const handlePointerDown = (r: number, c: number) => {
    if (!grid) return;
    const key = cellKey(r, c);
    setSelecting(true);
    setStartCell(key);
    setSelectedCells(new Set([key]));
  };

  const handlePointerMove = (r: number, c: number) => {
    if (!selecting || !startCell || !grid) return;
    const key = cellKey(r, c);
    setSelectedCells(getCellsBetween(startCell, key));
  };

  const handlePointerUp = () => {
    if (!selecting || !grid) return;
    setSelecting(false);

    // Check if selection matches a word
    for (const pw of placedWords) {
      if (foundWords.has(pw.word)) continue;
      const wordCells = new Set(getCellsForWord(pw));
      if (wordCells.size === selectedCells.size && [...wordCells].every((c) => selectedCells.has(c))) {
        const colorIdx = foundWords.size % FOUND_COLORS.length;
        const newHighlighted = new Map(highlightedCells);
        for (const c of wordCells) {
          newHighlighted.set(c, FOUND_COLORS[colorIdx]);
        }
        setHighlightedCells(newHighlighted);
        setFoundWords(new Set([...foundWords, pw.word]));
        break;
      }
    }
    setSelectedCells(new Set());
    setStartCell(null);
  };

  const allFound = grid && placedWords.length > 0 && foundWords.size === placedWords.length;

  const ANSWER_COLORS = [
    "#7c3aed40", "#2dd4bf40", "#f59e0b50", "#ef444440",
    "#3b82f640", "#a855f740", "#f9731640", "#14b8a640",
  ];

  const answerCellSet = new Map<string, string>();
  placedWords.forEach((pw, idx) => {
    const color = ANSWER_COLORS[idx % ANSWER_COLORS.length];
    getCellsForWord(pw).forEach((c) => answerCellSet.set(c, color));
  });

  // Download as image
  const downloadAsImage = async (format: "png" | "jpeg" | "webp", withAnswers = false) => {
    const ref = withAnswers ? answerRef.current : printRef.current;
    if (!ref) return;
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(ref, { scale: 3, backgroundColor: "#ffffff" });
    const link = document.createElement("a");
    const suffix = withAnswers ? "_antwoorden" : "";
    link.download = `woordenzoeker${suffix}.${format === "jpeg" ? "jpg" : format}`;
    link.href = canvas.toDataURL(`image/${format}`, 1.0);
    link.click();
  };

  // Download as PDF (puzzle + answer key)
  const downloadAsPDF = async () => {
    if (!printRef.current || !answerRef.current) return;
    const { default: html2canvas } = await import("html2canvas");
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfW = pdf.internal.pageSize.getWidth() - 20;

    // Page 1: puzzle
    const c1 = await html2canvas(printRef.current, { scale: 3, backgroundColor: "#ffffff" });
    const h1 = (c1.height / c1.width) * pdfW;
    pdf.addImage(c1.toDataURL("image/png"), "PNG", 10, 10, pdfW, h1);

    // Page 2: answer key
    pdf.addPage();
    const c2 = await html2canvas(answerRef.current, { scale: 3, backgroundColor: "#ffffff" });
    const h2 = (c2.height / c2.width) * pdfW;
    pdf.addImage(c2.toDataURL("image/png"), "PNG", 10, 10, pdfW, h2);

    pdf.save("woordenzoeker.pdf");
  };

  useEffect(() => {
    generate();
  }, []);

  const renderPrintGrid = (g: string[][], size: number, highlights?: Map<string, string>) => (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${size}, 1fr)`, border: "2px solid #333", width: 700 }}>
      {g.map((row, r) =>
        row.map((letter, c) => {
          const k = `${r},${c}`;
          const bg = highlights?.get(k);
          return (
            <div key={k} style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 700 / size, height: 700 / size,
              fontSize: Math.max(12, (700 / size) * 0.6),
              fontWeight: 700, fontFamily: "monospace",
              border: "0.5px solid #ddd", color: "#222",
              backgroundColor: bg || undefined,
            }}>{letter}</div>
          );
        })
      )}
    </div>
  );

  const renderWordList = (pws: PlacedWord[], checked = false) => (
    <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
      {pws.map((pw) => (
        <span key={pw.word} style={{
          background: "#f0f0f0", padding: "4px 12px", borderRadius: 12, fontSize: 14, fontWeight: 600,
          textDecoration: checked ? "line-through" : undefined,
        }}>
          {checked ? "✅ " : ""}{pw.word}
        </span>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">🔍 Woordenzoeker</h1>
        </div>

        <div className="grid md:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar controls */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Woorden</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value.toUpperCase())}
                    placeholder="Nieuw woord..."
                    onKeyDown={(e) => e.key === "Enter" && addWord()}
                    className="text-sm"
                  />
                  <Button size="icon" onClick={addWord}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                  {words.map((w, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                        foundWords.has(w.toUpperCase())
                          ? "bg-accent/20 text-accent line-through"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {foundWords.has(w.toUpperCase()) && <Check className="h-3 w-3" />}
                      {w}
                      <button onClick={() => removeWord(i)} className="ml-0.5 hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Grootte:</span>
                  <Input
                    type="number"
                    min={8}
                    max={25}
                    value={gridSize}
                    onChange={(e) => setGridSize(Math.max(8, Math.min(25, +e.target.value)))}
                    className="text-sm w-20"
                  />
                </div>
                <Button className="w-full gap-2" onClick={generate}>
                  <Shuffle className="h-4 w-4" /> Genereer
                </Button>
              </CardContent>
            </Card>

            {/* Download options */}
            {grid && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Download className="h-4 w-4" /> Download
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground">Puzzel + antwoordblad</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={downloadAsPDF}>PDF</Button>
                    <Button variant="outline" size="sm" onClick={() => downloadAsImage("png")}>PNG</Button>
                    <Button variant="outline" size="sm" onClick={() => downloadAsImage("jpeg")}>JPG</Button>
                    <Button variant="outline" size="sm" onClick={() => downloadAsImage("webp")}>WebP</Button>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">Alleen antwoordblad</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => downloadAsImage("png", true)}>PNG</Button>
                    <Button variant="outline" size="sm" onClick={() => downloadAsImage("jpeg", true)}>JPG</Button>
                  </div>
                  <Button variant="outline" size="sm" className="w-full gap-1" onClick={() => window.print()}>
                    <Printer className="h-3.5 w-3.5" /> Printen
                  </Button>
                </CardContent>
              </Card>
            )}

            {allFound && (
              <Card className="border-accent bg-accent/10">
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold">🎉 Alles gevonden!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Je hebt alle {placedWords.length} woorden gevonden!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Grid */}
          {grid && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Klik en sleep om woorden te markeren • {foundWords.size}/{placedWords.length} gevonden
              </p>

              {/* Playable grid */}
              <div
                ref={gridRef}
                className="inline-grid border border-border rounded-lg overflow-hidden select-none touch-none bg-card shadow-sm"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, minmax(24px, 36px))`,
                  width: "fit-content",
                }}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                {grid.map((row, r) =>
                  row.map((letter, c) => {
                    const key = cellKey(r, c);
                    const isSelected = selectedCells.has(key);
                    const highlightColor = highlightedCells.get(key);
                    return (
                      <div
                        key={key}
                        className={`flex items-center justify-center aspect-square font-mono font-bold text-foreground transition-colors duration-100 cursor-pointer border-[0.5px] border-border/30 text-xs sm:text-sm ${
                          isSelected ? "bg-primary/30 scale-105" : ""
                        }`}
                        style={{
                          backgroundColor: isSelected ? undefined : highlightColor || undefined,
                        }}
                        onPointerDown={() => handlePointerDown(r, c)}
                        onPointerEnter={() => handlePointerMove(r, c)}
                      >
                        {letter}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Hidden printable puzzle */}
              <div className="fixed -left-[9999px] top-0">
                <div ref={printRef} style={{ padding: 32, width: 800, background: "#fff", fontFamily: "Arial, sans-serif" }}>
                  <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>🔍 Woordenzoeker</h2>
                  {renderPrintGrid(grid, gridSize)}
                  {renderWordList(placedWords)}
                </div>

                {/* Answer key */}
                <div ref={answerRef} style={{ padding: 32, width: 800, background: "#fff", fontFamily: "Arial, sans-serif" }}>
                  <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>🔍 Antwoordblad</h2>
                  {renderPrintGrid(grid, gridSize, answerCellSet)}
                  {renderWordList(placedWords, true)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
