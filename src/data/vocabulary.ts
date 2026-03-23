export interface VocabItem {
  french: string;
  dutch: string;
}

export const vocabulary: VocabItem[] = [
  { french: "l'anglais", dutch: "Engels" },
  { french: "le français", dutch: "Frans" },
  { french: "le néerlandais", dutch: "Nederlands" },
  { french: "les maths", dutch: "wiskunde" },
  { french: "la géographie", dutch: "aardrijkskunde" },
  { french: "l'histoire", dutch: "geschiedenis" },
  { french: "le dessin", dutch: "tekenen" },
  { french: "la gym", dutch: "gym" },
  { french: "le contrôle", dutch: "de toets" },
  { french: "facile", dutch: "makkelijk" },
  { french: "difficile", dutch: "moeilijk" },
  { french: "fort(e)", dutch: "goed / sterk" },
  { french: "vraiment", dutch: "echt / werkelijk" },
  { french: "l'école", dutch: "de school" },
  { french: "commencer", dutch: "beginnen" },
  { french: "rigoler", dutch: "lachen" },
  { french: "Tu as quelles matières, le mardi?", dutch: "Welke vakken heb je op dinsdag?" },
  { french: "Le mardi, j'ai anglais et géographie.", dutch: "Op dinsdag heb ik Engels en aardrijkskunde." },
  { french: "La récré, c'est à quelle heure?", dutch: "Hoe laat is de pauze?" },
  { french: "À dix heures", dutch: "Om tien uur" },
];

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
