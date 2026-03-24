export interface VocabItem {
  french: string;
  dutch: string;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  words: VocabItem[];
  requiresLogin: boolean;
}

const chapitre3Words: VocabItem[] = [
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
  { french: "sévère", dutch: "streng" },
  { french: "noter", dutch: "noteren / opschrijven" },
  { french: "peut-être", dutch: "misschien" },
  { french: "la chambre", dutch: "de kamer" },
  { french: "le poster", dutch: "de poster" },
  { french: "les affaires (f)", dutch: "de spullen" },
  { french: "l'étagère (f)", dutch: "de plank / het rek" },
  { french: "le bureau", dutch: "het bureau" },
  { french: "l'ordinateur (m)", dutch: "de computer" },
  { french: "la porte", dutch: "de deur" },
  { french: "la fenêtre", dutch: "het raam" },
  { french: "le mur", dutch: "de muur" },
  { french: "le lit", dutch: "het bed" },
  { french: "la couleur", dutch: "de kleur" },
  { french: "blanc / blanche", dutch: "wit" },
  { french: "bleu(e)", dutch: "blauw" },
  { french: "jaune", dutch: "geel" },
  { french: "noir(e)", dutch: "zwart" },
  { french: "orange", dutch: "oranje" },
  { french: "rose", dutch: "roze" },
  { french: "rouge", dutch: "rood" },
  { french: "vert(e)", dutch: "groen" },
  { french: "violet / violette", dutch: "paars" },
  { french: "C'est comment, ta chambre?", dutch: "Hoe is jouw kamer?" },
  { french: "Ma chambre est assez grande.", dutch: "Mijn kamer is vrij groot." },
  { french: "petit(e)", dutch: "klein" },
  { french: "grand(e)", dutch: "groot" },
];

export const chapters: Chapter[] = [
  {
    id: "chapitre3",
    title: "Chapitre 3",
    description: "School, vakken & de kamer",
    words: chapitre3Words,
    requiresLogin: false,
  },
  // More chapters will be added later
];

export const DEFAULT_CHAPTER_ID = "chapitre3";

export function getChapter(id: string): Chapter | undefined {
  return chapters.find((c) => c.id === id);
}

export function getActiveVocabulary(chapterId: string): VocabItem[] {
  return getChapter(chapterId)?.words ?? chapitre3Words;
}

// Backward compatibility
export const vocabulary: VocabItem[] = chapitre3Words;
