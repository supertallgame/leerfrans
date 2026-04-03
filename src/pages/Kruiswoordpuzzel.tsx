import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Plus, Trash2, Shuffle, Check, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";

type PlacedWord = { word: string; clue: string; row: number; col: number; direction: "across" | "down"; number: number };

interface WordEntry { word: string; clue: string }

function generateCrossword(entries: WordEntry[], maxSize: number): { grid: (string | null)[][]; placed: PlacedWord[] } {
  const sorted = [...entries].sort((a, b) => b.word.length - a.word.length);
  const grid: (string | null)[][] = Array.from({ length: maxSize }, () => Array(maxSize).fill(null));
  const placed: PlacedWord[] = [];

  if (sorted.length === 0) return { grid, placed };

  // Place first word horizontally in center
  const first = sorted[0];
  const word0 = first.word.toUpperCase();
  const startRow = Math.floor(maxSize / 2);
  const startCol = Math.floor((maxSize - word0.length) / 2);
  for (let i = 0; i < word0.length; i++) grid[startRow][startCol + i] = word0[i];
  placed.push({ word: word0, clue: first.clue, row: startRow, col: startCol, direction: "across", number: 0 });

  // Try to place remaining words
  for (let idx = 1; idx < sorted.length; idx++) {
    const entry = sorted[idx];
    const word = entry.word.toUpperCase();
    let bestScore = -1;
    let bestPlacement: { row: number; col: number; dir: "across" | "down" } | null = null;

    // Find intersections with already placed letters
    for (let wi = 0; wi < word.length; wi++) {
      for (let r = 0; r < maxSize; r++) {
        for (let c = 0; c < maxSize; c++) {
          if (grid[r][c] !== word[wi]) continue;

          // Try placing down (intersection at row r, col c means word[wi] is at (r,c), so start = r - wi)
          const sr = r - wi;
          if (canPlaceWord(grid, word, sr, c, "down", maxSize)) {
            const score = scorePlace(grid, word, sr, c, "down", maxSize);
            if (score > bestScore) { bestScore = score; bestPlacement = { row: sr, col: c, dir: "down" }; }
          }

          // Try placing across
          const sc = c - wi;
          if (canPlaceWord(grid, word, r, sc, "across", maxSize)) {
            const score = scorePlace(grid, word, r, sc, "across", maxSize);
            if (score > bestScore) { bestScore = score; bestPlacement = { row: r, col: sc, dir: "across" }; }
          }
        }
      }
    }

    if (bestPlacement) {
      const { row, col, dir } = bestPlacement;
      for (let i = 0; i < word.length; i++) {
        const rr = dir === "down" ? row + i : row;
        const cc = dir === "across" ? col + i : col;
        grid[rr][cc] = word[i];
      }
      placed.push({ word, clue: entry.clue, row, col, direction: dir, number: 0 });
    }
  }

  // Assign numbers
  const numberMap = new Map<string, number>();
  let num = 1;
  // Sort placed words by position (top-to-bottom, left-to-right)
  placed.sort((a, b) => a.row - b.row || a.col - b.col);
  for (const pw of placed) {
    const key = `${pw.row},${pw.col}`;
    if (!numberMap.has(key)) numberMap.set(key, num++);
    pw.number = numberMap.get(key)!;
  }

  // Trim grid
  return trimGrid(grid, placed);
}

function trimGrid(grid: (string | null)[][], placed: PlacedWord[]): { grid: (string | null)[][]; placed: PlacedWord[] } {
  let minR = grid.length, maxR = 0, minC = grid[0].length, maxC = 0;
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[0].length; c++)
      if (grid[r][c] !== null) { minR = Math.min(minR, r); maxR = Math.max(maxR, r); minC = Math.min(minC, c); maxC = Math.max(maxC, c); }

  if (minR > maxR) return { grid: [[]], placed: [] };
  const trimmed = grid.slice(minR, maxR + 1).map((row) => row.slice(minC, maxC + 1));
  const adjusted = placed.map((pw) => ({ ...pw, row: pw.row - minR, col: pw.col - minC }));
  return { grid: trimmed, placed: adjusted };
}

function canPlaceWord(grid: (string | null)[][], word: string, row: number, col: number, dir: "across" | "down", size: number): boolean {
  const dr = dir === "down" ? 1 : 0;
  const dc = dir === "across" ? 1 : 0;

  // Check bounds
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i, c = col + dc * i;
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
  }

  // Check cell before and after word are empty
  const br = row - dr, bc = col - dc;
  if (br >= 0 && br < size && bc >= 0 && bc < size && grid[br][bc] !== null) return false;
  const ar = row + dr * word.length, ac = col + dc * word.length;
  if (ar >= 0 && ar < size && ac >= 0 && ac < size && grid[ar][ac] !== null) return false;

  let intersections = 0;
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i, c = col + dc * i;
    const cell = grid[r][c];

    if (cell !== null) {
      if (cell !== word[i]) return false;
      intersections++;
    } else {
      // Check parallel neighbors (sides perpendicular to direction)
      const sideR = dir === "across" ? 1 : 0;
      const sideC = dir === "down" ? 1 : 0;
      const n1r = r + sideR, n1c = c + sideC;
      const n2r = r - sideR, n2c = c - sideC;
      if (n1r >= 0 && n1r < size && n1c >= 0 && n1c < size && grid[n1r][n1c] !== null) return false;
      if (n2r >= 0 && n2r < size && n2c >= 0 && n2c < size && grid[n2r][n2c] !== null) return false;
    }
  }

  return intersections > 0;
}

function scorePlace(grid: (string | null)[][], word: string, row: number, col: number, dir: "across" | "down", size: number): number {
  const dr = dir === "down" ? 1 : 0;
  const dc = dir === "across" ? 1 : 0;
  let score = 0;
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i, c = col + dc * i;
    if (grid[r][c] === word[i]) score += 10;
  }
  // Prefer center placements
  const centerR = size / 2, centerC = size / 2;
  const midR = row + (dr * word.length) / 2, midC = col + (dc * word.length) / 2;
  score -= Math.abs(midR - centerR) + Math.abs(midC - centerC);
  return score;
}

export default function Kruiswoordpuzzel() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<WordEntry[]>([
    { word: "SCHOOL", clue: "Gebouw waar je leert" },
    { word: "BOEK", clue: "Je leest erin" },
    { word: "LERAAR", clue: "Geeft les" },
    { word: "KLAS", clue: "Groep leerlingen" },
    { word: "LEREN", clue: "Kennis opdoen" },
  ]);
  const [title, setTitle] = useState("Kruiswoordpuzzel");
  const [newWord, setNewWord] = useState("");
  const [newClue, setNewClue] = useState("");
  const [grid, setGrid] = useState<(string | null)[][] | null>(null);
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);
  const [userGrid, setUserGrid] = useState<Map<string, string>>(new Map());
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());
  const [solvedWords, setSolvedWords] = useState<Set<string>>(new Set());
  const printRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  const generate = useCallback(() => {
    const valid = entries.filter((e) => e.word.trim().length > 0);
    if (valid.length === 0) return;
    const { grid: g, placed } = generateCrossword(valid, 20);
    setGrid(g);
    setPlacedWords(placed);
    setUserGrid(new Map());
    setRevealedCells(new Set());
    setSolvedWords(new Set());
  }, [entries]);

  const addEntry = () => {
    const w = newWord.trim().toUpperCase().replace(/[^A-Z]/g, "");
    const c = newClue.trim() || "...";
    if (w && !entries.some((e) => e.word.toUpperCase() === w)) {
      setEntries([...entries, { word: w, clue: c }]);
      setNewWord("");
      setNewClue("");
    }
  };

  const removeEntry = (i: number) => setEntries(entries.filter((_, idx) => idx !== i));

  const handleInput = (r: number, c: number, val: string) => {
    const letter = val.slice(-1).toUpperCase().replace(/[^A-Z]/g, "");
    const key = `${r},${c}`;
    const next = new Map(userGrid);
    if (letter) next.set(key, letter); else next.delete(key);
    setUserGrid(next);

    // Check if any words are now complete
    const newSolved = new Set(solvedWords);
    for (const pw of placedWords) {
      if (newSolved.has(pw.word)) continue;
      let complete = true;
      for (let i = 0; i < pw.word.length; i++) {
        const cr = pw.direction === "down" ? pw.row + i : pw.row;
        const cc = pw.direction === "across" ? pw.col + i : pw.col;
        const k = `${cr},${cc}`;
        const entered = next.get(k) || "";
        if (entered !== pw.word[i]) { complete = false; break; }
      }
      if (complete) newSolved.add(pw.word);
    }
    setSolvedWords(newSolved);

    // Auto-advance to next cell
    if (letter) {
      const inputs = document.querySelectorAll<HTMLInputElement>("[data-crossword-input]");
      const arr = Array.from(inputs);
      const currentIdx = arr.findIndex((el) => el.dataset.r === String(r) && el.dataset.c === String(c));
      if (currentIdx >= 0 && currentIdx < arr.length - 1) arr[currentIdx + 1].focus();
    }
  };

  const allSolved = grid && placedWords.length > 0 && solvedWords.size === placedWords.length;

  useEffect(() => { generate(); }, []);

  // Number map for display
  const numberMap = new Map<string, number>();
  placedWords.forEach((pw) => {
    const key = `${pw.row},${pw.col}`;
    if (!numberMap.has(key)) numberMap.set(key, pw.number);
  });

  // Download helpers
  const downloadAsImage = async (format: "png" | "jpeg" | "webp", withAnswers = false) => {
    const ref = withAnswers ? answerRef.current : printRef.current;
    if (!ref) return;
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(ref, { scale: 3, backgroundColor: "#ffffff" });
    const link = document.createElement("a");
    const suffix = withAnswers ? "_antwoorden" : "";
    link.download = `kruiswoordpuzzel${suffix}.${format === "jpeg" ? "jpg" : format}`;
    link.href = canvas.toDataURL(`image/${format}`, 1.0);
    link.click();
  };

  const downloadAsPDF = async () => {
    if (!printRef.current || !answerRef.current) return;
    const { default: html2canvas } = await import("html2canvas");
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfW = pdf.internal.pageSize.getWidth() - 20;
    const c1 = await html2canvas(printRef.current, { scale: 3, backgroundColor: "#ffffff" });
    pdf.addImage(c1.toDataURL("image/png"), "PNG", 10, 10, pdfW, (c1.height / c1.width) * pdfW);
    pdf.addPage();
    const c2 = await html2canvas(answerRef.current, { scale: 3, backgroundColor: "#ffffff" });
    pdf.addImage(c2.toDataURL("image/png"), "PNG", 10, 10, pdfW, (c2.height / c2.width) * pdfW);
    pdf.save("kruiswoordpuzzel.pdf");
  };

  const handlePrint = async (mode: "puzzle" | "answers" | "both") => {
    const refs: HTMLDivElement[] = [];
    if ((mode === "puzzle" || mode === "both") && printRef.current) refs.push(printRef.current);
    if ((mode === "answers" || mode === "both") && answerRef.current) refs.push(answerRef.current);
    if (refs.length === 0) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    printWindow.document.write(`<!doctype html><html><head><title>Kruiswoordpuzzel</title><style>@page{margin:10mm;size:portrait}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;padding:0;background:#fff;font-family:Arial,sans-serif}.page{display:flex;align-items:center;justify-content:center;min-height:100vh;page-break-after:always;padding:12mm}img{display:block;max-width:100%;width:100%;height:auto}.page:last-child{page-break-after:auto}</style></head><body><div style="padding:24px;text-align:center">Print voorbereiden...</div></body></html>`);
    printWindow.document.close();

    const { default: html2canvas } = await import("html2canvas");
    const pages: string[] = [];

    for (const ref of refs) {
      const canvas = await html2canvas(ref, {
        scale: 3,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });
      pages.push(canvas.toDataURL("image/png", 1.0));
    }

    const content = pages
      .map((src, index) => `<div class="page"${index === pages.length - 1 ? ' style="page-break-after:auto"' : ""}><img src="${src}" alt="Kruiswoordpuzzel printpagina ${index + 1}" /></div>`)
      .join("");

    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html><head><title>Kruiswoordpuzzel</title><style>@page{margin:10mm;size:portrait}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;padding:0;background:#fff;font-family:Arial,sans-serif}.page{display:flex;align-items:center;justify-content:center;min-height:100vh;page-break-after:always;padding:12mm}img{display:block;max-width:100%;width:100%;height:auto}.page:last-child{page-break-after:auto}</style></head><body>${content}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const cellSize = grid ? Math.min(40, 600 / Math.max(grid.length, grid[0]?.length || 1)) : 40;

  const renderPrintGrid = (g: (string | null)[][], showAnswers: boolean) => {
    const cols = g[0]?.length || 1;
    const rows = g.length;
    const maxDim = Math.max(cols, rows);
    const cs = Math.floor(Math.min(56, 480 / maxDim));
    const stroke = 2;
    const pad = stroke; // padding so edge strokes aren't clipped
    const width = cols * cs + pad * 2;
    const height = rows * cs + pad * 2;
    const elements: JSX.Element[] = [];

    g.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === null) return;

        const key = `${r},${c}`;
        const num = numberMap.get(key);
        const x = pad + c * cs;
        const y = pad + r * cs;

        // Draw each cell as a stroked rect — border-collapse effect comes from
        // overlapping strokes being identical color, so they look merged.
        elements.push(
          <rect key={`cell-${key}`} x={x} y={y} width={cs} height={cs}
            fill="#ffffff" stroke="#000000" strokeWidth={stroke}
            shapeRendering="crispEdges" />
        );

        if (num) {
          elements.push(
            <text key={`num-${key}`} x={x + 3} y={y + Math.max(9, cs * 0.28)}
              fontSize={Math.max(8, cs * 0.28)} fontWeight={600}
              fontFamily="Arial, sans-serif" fill="#444444">{num}</text>
          );
        }

        if (showAnswers && cell) {
          elements.push(
            <text key={`letter-${key}`} x={x + cs / 2} y={y + cs / 2}
              textAnchor="middle" dominantBaseline="central"
              fontSize={cs * 0.5} fontWeight={700}
              fontFamily="Arial, sans-serif" fill="#222222">{cell}</text>
          );
        }
      });
    });

    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height}
          viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
          {elements}
        </svg>
      </div>
    );
  };

  const renderClues = (dir: "across" | "down") => {
    const clues = placedWords.filter((pw) => pw.direction === dir);
    return (
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: "#222" }}>{dir === "across" ? "Horizontaal →" : "Verticaal ↓"}</h3>
        {clues.map((pw) => (
          <div key={pw.word} style={{ fontSize: 13, marginBottom: 2 }}>
            <strong>{pw.number}.</strong> {pw.clue}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">✏️ Kruiswoordpuzzel</h1>
        </div>

        <div className="grid md:grid-cols-[320px_1fr] gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Woorden & hints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titel van de puzzel..." className="text-sm font-semibold" />
                <Input value={newWord} onChange={(e) => setNewWord(e.target.value.toUpperCase())}
                  placeholder="Woord..." className="text-sm" />
                <Input value={newClue} onChange={(e) => setNewClue(e.target.value)}
                  placeholder="Hint/omschrijving..." className="text-sm"
                  onKeyDown={(e) => e.key === "Enter" && addEntry()} />
                <Button size="sm" className="w-full gap-1" onClick={addEntry}>
                  <Plus className="h-4 w-4" /> Toevoegen
                </Button>
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {entries.map((e, i) => (
                    <div key={i} className={`flex items-start gap-2 rounded-lg px-2.5 py-1.5 text-xs ${
                      solvedWords.has(e.word.toUpperCase()) ? "bg-accent/20 line-through" : "bg-muted"
                    }`}>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-foreground">{e.word}</span>
                        <span className="text-muted-foreground ml-1">— {e.clue}</span>
                      </div>
                      <button onClick={() => removeEntry(i)} className="hover:text-destructive shrink-0 mt-0.5">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button className="w-full gap-2" onClick={generate}>
                  <Shuffle className="h-4 w-4" /> Genereer
                </Button>

              </CardContent>
            </Card>

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
                  <p className="text-xs text-muted-foreground pt-1">Printen</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => handlePrint("puzzle")}>
                      <Printer className="h-3 w-3" /> Puzzel
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => handlePrint("answers")}>
                      <Printer className="h-3 w-3" /> Antw.
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => handlePrint("both")}>
                      <Printer className="h-3 w-3" /> Beide
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {allSolved && (
              <Card className="border-accent bg-accent/10">
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold">🎉 Opgelost!</p>
                  <p className="text-sm text-muted-foreground mt-1">Alle {placedWords.length} woorden correct!</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Grid + clues */}
          {grid && grid[0] && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Typ letters in de witte vakjes • {solvedWords.size}/{placedWords.length} opgelost
              </p>

              {/* Interactive grid */}
              <div className="inline-grid border-2 border-border rounded-lg overflow-hidden bg-foreground/90"
                style={{ gridTemplateColumns: `repeat(${grid[0].length}, ${cellSize}px)` }}>
                {grid.map((row, r) =>
                  row.map((cell, c) => {
                    const key = `${r},${c}`;
                    const num = numberMap.get(key);
                    const revealed = revealedCells.has(key);
                    if (cell === null) {
                      return <div key={key} style={{ width: cellSize, height: cellSize }} className="bg-foreground/90" />;
                    }
                    return (
                      <div key={key} className="relative bg-card border border-border/50" style={{ width: cellSize, height: cellSize }}>
                        {num && (
                          <span className="absolute top-0 left-0.5 text-muted-foreground font-medium" style={{ fontSize: cellSize * 0.25 }}>
                            {num}
                          </span>
                        )}
                        <input
                          data-crossword-input="" data-r={r} data-c={c}
                          className="w-full h-full text-center font-bold bg-transparent text-foreground outline-none uppercase"
                          style={{ fontSize: cellSize * 0.5 }}
                          maxLength={1}
                          value={revealed ? cell : userGrid.get(key) || ""}
                          readOnly={revealed}
                          onChange={(e) => handleInput(r, c, e.target.value)}
                        />
                      </div>
                    );
                  })
                )}
              </div>

              {/* Clues */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <h3 className="font-bold text-sm mb-2">Horizontaal →</h3>
                    {placedWords.filter((pw) => pw.direction === "across").map((pw) => (
                      <p key={pw.word} className={`text-sm mb-1 ${solvedWords.has(pw.word) ? "line-through text-accent" : "text-foreground"}`}>
                        {solvedWords.has(pw.word) && <Check className="inline h-3 w-3 mr-1" />}
                        <strong>{pw.number}.</strong> {pw.clue}
                      </p>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <h3 className="font-bold text-sm mb-2">Verticaal ↓</h3>
                    {placedWords.filter((pw) => pw.direction === "down").map((pw) => (
                      <p key={pw.word} className={`text-sm mb-1 ${solvedWords.has(pw.word) ? "line-through text-accent" : "text-foreground"}`}>
                        {solvedWords.has(pw.word) && <Check className="inline h-3 w-3 mr-1" />}
                        <strong>{pw.number}.</strong> {pw.clue}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Hidden print versions */}
              <div className="fixed -left-[9999px] top-0">
                <div ref={printRef} style={{ padding: 30, width: 700, background: "#fff", fontFamily: "Arial, sans-serif" }}>
                  <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>✏️ {title || "Kruiswoordpuzzel"}</h2>
                  <div style={{ display: "flex", justifyContent: "center" }}>{renderPrintGrid(grid, false)}</div>
                  <div style={{ display: "flex", gap: 32, marginTop: 28 }}>
                    <div style={{ flex: 1 }}>{renderClues("across")}</div>
                    <div style={{ flex: 1 }}>{renderClues("down")}</div>
                  </div>
                </div>
                <div ref={answerRef} style={{ padding: 30, width: 700, background: "#fff", fontFamily: "Arial, sans-serif" }}>
                  <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>✏️ {title || "Kruiswoordpuzzel"} — Antwoordblad</h2>
                  <div style={{ display: "flex", justifyContent: "center" }}>{renderPrintGrid(grid, true)}</div>
                  <div style={{ display: "flex", gap: 32, marginTop: 28 }}>
                    <div style={{ flex: 1 }}>{renderClues("across")}</div>
                    <div style={{ flex: 1 }}>{renderClues("down")}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
