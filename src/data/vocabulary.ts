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

const chapitre1Words: VocabItem[] = [
  { french: "la France", dutch: "Frankrijk" },
  { french: "salut", dutch: "hoi" },
  { french: "la plage", dutch: "het strand" },
  { french: "mignon", dutch: "leuk / schattig" },
  { french: "regarde!", dutch: "kijk!" },
  { french: "aussi", dutch: "ook" },
  { french: "maintenant", dutch: "nu" },
  { french: "pour moi", dutch: "voor mij" },
  { french: "le lapin", dutch: "het konijn" },
  { french: "le chien", dutch: "de hond" },
  { french: "le chat", dutch: "de kat" },
  { french: "le poisson", dutch: "de vis" },
  { french: "j'aime", dutch: "ik houd van" },
  { french: "on va à", dutch: "wij gaan naar" },
  { french: "on continue", dutch: "wij gaan door" },
  { french: "il joue", dutch: "hij speelt" },
  { french: "Bonjour, ça va?", dutch: "Hallo, hoe gaat het?" },
  { french: "Ça va bien.", dutch: "Het gaat goed." },
  { french: "Tu as un chien?", dutch: "Heb jij een hond?" },
  { french: "Oui, j'ai un chien, Hector.", dutch: "Ja, ik heb een hond, Hector." },
  { french: "bienvenue", dutch: "welkom" },
  { french: "la semaine", dutch: "de week" },
  { french: "demain", dutch: "morgen" },
  { french: "en vacances", dutch: "op vakantie" },
  { french: "le copain", dutch: "de vriend" },
  { french: "la copine", dutch: "de vriendin" },
  { french: "génial(e)", dutch: "geniaal" },
  { french: "cool", dutch: "te gek" },
  { french: "j'habite", dutch: "ik woon" },
  { french: "j'organise", dutch: "ik organiseer" },
  { french: "je suis", dutch: "ik ben" },
  { french: "le prix", dutch: "de prijs" },
  { french: "beaucoup", dutch: "veel" },
  { french: "quand", dutch: "wanneer" },
  { french: "pourquoi", dutch: "waarom" },
  { french: "merci", dutch: "dankjewel" },
  { french: "Je m'appelle Léa. Et toi?", dutch: "Ik heet Léa. En jij?" },
  { french: "Je m'appelle Noah.", dutch: "Ik heet Noah." },
  { french: "Tu habites où?", dutch: "Waar woon jij?" },
  { french: "J'habite à Paris.", dutch: "Ik woon in Parijs." },
  { french: "la mer", dutch: "de zee" },
  { french: "le message", dutch: "het bericht" },
  { french: "le problème", dutch: "het probleem" },
  { french: "aujourd'hui", dutch: "vandaag" },
  { french: "c'est quoi?", dutch: "Wat is dat?" },
  { french: "ici", dutch: "hier" },
  { french: "presque", dutch: "bijna" },
  { french: "alors", dutch: "dus, dan" },
  { french: "bizarre", dutch: "vreemd" },
  { french: "mais", dutch: "maar" },
  { french: "quelque chose", dutch: "iets" },
  { french: "il y a", dutch: "er is / er zijn" },
  { french: "on adore", dutch: "wij zijn dol op" },
  { french: "aider", dutch: "helpen" },
  { french: "peut-être", dutch: "misschien" },
  { french: "ensemble", dutch: "samen" },
  { french: "Quel est ton numéro de téléphone?", dutch: "Wat is je telefoonnummer?" },
  { french: "Mon numéro, c'est le 06-12 06 11 7.", dutch: "Mijn nummer is 06-12 06 11 7." },
  { french: "Au revoir!", dutch: "Tot ziens." },
  { french: "le portable", dutch: "het mobieltje" },
  { french: "le pays", dutch: "het land" },
  { french: "petit(e)", dutch: "klein" },
  { french: "grand(e)", dutch: "groot" },
  { french: "il passe", dutch: "hij brengt door" },
  { french: "il reste", dutch: "hij blijft" },
  { french: "donc", dutch: "dus" },
  { french: "chouette", dutch: "te gek" },
  { french: "voilà", dutch: "alstublieft (als je iets geeft)" },
  { french: "la famille", dutch: "de familie" },
  { french: "mon père", dutch: "mijn vader" },
  { french: "ma mère", dutch: "mijn moeder" },
  { french: "la sœur", dutch: "de zus" },
  { french: "le frère", dutch: "de broer" },
  { french: "le cousin", dutch: "de neef" },
  { french: "la cousine", dutch: "de nicht" },
  { french: "Tu as quel âge?", dutch: "Hoe oud ben jij?" },
  { french: "J'ai treize ans.", dutch: "Ik ben dertien jaar." },
  { french: "Tu as un frère?", dutch: "Heb jij een broer?" },
  { french: "Oui, j'ai un frère, Romain.", dutch: "Ja, ik heb een broer, Romain." },
];

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

export function shuffle<T>(array: T[]): T[] {
  const maxAttempts = 50;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const origIndex = (item: T) => array.indexOf(item);
    let valid = true;
    for (let i = 0; i < arr.length - 1; i++) {
      if (Math.abs(origIndex(arr[i]) - origIndex(arr[i + 1])) <= 1) {
        valid = false;
        break;
      }
    }
    if (valid) return arr;
  }
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
