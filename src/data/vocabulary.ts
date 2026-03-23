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
  { french: "sévère", dutch: "streng" },
  { french: "noter", dutch: "noteren / opschrijven" },
  { french: "peut-être", dutch: "misschien" },
  { french: "la chambre", dutch: "de kamer" },
  { french: "la classe", dutch: "de klas" },
  { french: "en quatrième", dutch: "in de vierde (klas)" },
  { french: "trop", dutch: "te / te veel" },
  { french: "aujourd'hui", dutch: "vandaag" },
  { french: "le secret", dutch: "het geheim" },
  { french: "les devoirs", dutch: "het huiswerk" },
  { french: "le sac à dos", dutch: "de rugzak" },
  { french: "la trousse", dutch: "het etui" },
  { french: "le/la prof", dutch: "de leraar / lerares" },
  { french: "toujours", dutch: "altijd" },
  { french: "sympa", dutch: "leuk / aardig" },
  { french: "surtout", dutch: "vooral" },
  { french: "Quelle heure est-il?", dutch: "Hoe laat is het?" },
  { french: "Il est neuf heures et demie.", dutch: "Het is half tien." },
  { french: "Tu es en quelle classe?", dutch: "In welke klas zit je?" },
  { french: "Je suis en cinquième.", dutch: "Ik zit in de vijfde (klas)." },
  { french: "être", dutch: "zijn" },
  { french: "je suis", dutch: "ik ben" },
  { french: "tu es", dutch: "jij bent" },
  { french: "il/elle est", dutch: "hij/zij is" },
  { french: "on est", dutch: "men is / wij zijn" },
  { french: "nous sommes", dutch: "wij zijn" },
  { french: "vous êtes", dutch: "jullie zijn / u bent" },
  { french: "ils/elles sont", dutch: "zij zijn" },
];

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
