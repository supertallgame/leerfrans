export interface VocabItem {
  french: string;
  dutch: string;
}

export type Language = "french" | "english";

export interface Chapter {
  id: string;
  title: string;
  description: string;
  words: VocabItem[];
  requiresLogin: boolean;
}

// ─── French chapters ───

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

const chapitre2Words: VocabItem[] = [
  { french: "aimer", dutch: "houden van" },
  { french: "préférer", dutch: "liever hebben" },
  { french: "adorer", dutch: "dol zijn op" },
  { french: "détester", dutch: "een hekel hebben aan" },
  { french: "mais", dutch: "maar" },
  { french: "quoi", dutch: "wat" },
  { french: "et", dutch: "en" },
  { french: "je prends", dutch: "ik neem" },
  { french: "manger", dutch: "eten" },
  { french: "la pizza", dutch: "de pizza" },
  { french: "la crêpe", dutch: "de pannenkoek" },
  { french: "le pain", dutch: "het brood" },
  { french: "la tomate", dutch: "de tomaat" },
  { french: "le chocolat", dutch: "de chocola(de)" },
  { french: "le thé", dutch: "de thee" },
  { french: "le coca", dutch: "de cola" },
  { french: "La carte, s'il vous plaît.", dutch: "De kaart alstublieft." },
  { french: "Voilà.", dutch: "Alstublieft. (Als je iets geeft.)" },
  { french: "Un coca et une crêpe, s'il vous plaît.", dutch: "Een cola en een pannenkoek alstublieft." },
  { french: "Tu aimes le coca?", dutch: "Houd je van cola?" },
  { french: "Oui, j'adore le coca!", dutch: "Ja, ik ben dol op cola!" },
  { french: "avec", dutch: "met" },
  { french: "après", dutch: "na / daarna" },
  { french: "aussi", dutch: "ook" },
  { french: "d'accord", dutch: "oké" },
  { french: "ce soir", dutch: "vanavond" },
  { french: "acheter", dutch: "kopen" },
  { french: "préparer", dutch: "voorbereiden / maken" },
  { french: "tu veux", dutch: "je wilt" },
  { french: "le repas", dutch: "de maaltijd" },
  { french: "le beurre", dutch: "de boter" },
  { french: "l'ognon (m)", dutch: "de ui" },
  { french: "bon / bonne", dutch: "lekker" },
  { french: "le fromage", dutch: "de kaas" },
  { french: "l'œuf (m)", dutch: "het ei" },
  { french: "le légume", dutch: "de groente" },
  { french: "la viande", dutch: "het vlees" },
  { french: "C'est quoi?", dutch: "Wat is dat?" },
  { french: "C'est une quiche.", dutch: "Dat is een hartige taart." },
  { french: "Bon appétit!", dutch: "Eet smakelijk!" },
  { french: "l'enfant (m/v)", dutch: "het kind" },
  { french: "le (super)marché", dutch: "de (super)markt" },
  { french: "le rendez-vous", dutch: "de afspraak" },
  { french: "le problème", dutch: "het probleem" },
  { french: "demain", dutch: "morgen" },
  { french: "célèbre", dutch: "beroemd" },
  { french: "important(e)", dutch: "belangrijk" },
  { french: "maintenant", dutch: "nu" },
  { french: "aider", dutch: "helpen" },
  { french: "chercher", dutch: "zoeken" },
  { french: "trouver", dutch: "vinden" },
  { french: "regarder", dutch: "kijken (naar)" },
  { french: "beaucoup", dutch: "veel" },
  { french: "toujours", dutch: "altijd" },
  { french: "combien", dutch: "hoeveel" },
  { french: "j'ai besoin de", dutch: "ik heb nodig" },
  { french: "Je voudrais une baguette.", dutch: "Ik wil graag een stokbrood." },
  { french: "Voilà.", dutch: "Alstublieft." },
  { french: "Je ne comprends pas.", dutch: "Ik begrijp het niet." },
  { french: "Merci.", dutch: "Bedankt." },
  { french: "Au revoir!", dutch: "Tot ziens!" },
  { french: "demander", dutch: "vragen" },
  { french: "parler", dutch: "praten" },
  { french: "possible", dutch: "mogelijk" },
  { french: "dans", dutch: "in" },
  { french: "marcher", dutch: "lopen" },
  { french: "entrer", dutch: "binnenkomen" },
  { french: "rester", dutch: "blijven" },
  { french: "l'argent (m)", dutch: "het geld" },
  { french: "j'ai faim", dutch: "ik heb honger" },
  { french: "la boulangerie", dutch: "de bakkerij" },
  { french: "le magasin", dutch: "de winkel" },
  { french: "le vêtement", dutch: "het kledingstuk" },
  { french: "le croissant", dutch: "de croissant" },
  { french: "le pain au chocolat", dutch: "het chocoladebroodje" },
  { french: "la baguette", dutch: "het stokbrood" },
  { french: "fou/folle de", dutch: "gek op" },
  { french: "Vous avez deux croissants?", dutch: "Heeft u twee croissants?" },
  { french: "Oui, voilà.", dutch: "Ja, alstublieft." },
  { french: "Ça coute combien?", dutch: "Hoeveel kost het?" },
  { french: "Ça coute trois euros cinquante.", dutch: "Dat kost drie euro vijftig." },
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

const chapitre5Words: VocabItem[] = [
  { french: "parler", dutch: "praten" },
  { french: "passer", dutch: "doorbrengen" },
  { french: "manger", dutch: "eten" },
  { french: "rigoler", dutch: "lachen / lol maken" },
  { french: "rencontrer", dutch: "ontmoeten" },
  { french: "le grand-père", dutch: "de grootvader" },
  { french: "la grand-mère", dutch: "de grootmoeder" },
  { french: "l'oncle", dutch: "de oom" },
  { french: "le voisin", dutch: "de buurman" },
  { french: "la voisine", dutch: "de buurvrouw" },
  { french: "le cousin", dutch: "de neef" },
  { french: "la cousine", dutch: "de nicht" },
  { french: "prochain(e)", dutch: "volgende" },
  { french: "qui", dutch: "wie" },
  { french: "pourquoi", dutch: "waarom" },
  { french: "chez", dutch: "bij" },
  { french: "Tu as passé un bon weekend?", dutch: "Heb je een leuk weekend gehad?" },
  { french: "Oui, j'ai regardé un film avec Simon.", dutch: "Ja, ik heb een film gekeken met Simon." },
  { french: "C'est qui, Simon?", dutch: "Wie is dat, Simon?" },
  { french: "C'est mon copain.", dutch: "Het is mijn vriend." },
  { french: "janvier", dutch: "januari" },
  { french: "février", dutch: "februari" },
  { french: "mars", dutch: "maart" },
  { french: "avril", dutch: "april" },
  { french: "mai", dutch: "mei" },
  { french: "juin", dutch: "juni" },
  { french: "juillet", dutch: "juli" },
  { french: "aout", dutch: "augustus" },
  { french: "septembre", dutch: "september" },
  { french: "octobre", dutch: "oktober" },
  { french: "novembre", dutch: "november" },
  { french: "décembre", dutch: "december" },
  { french: "cette année", dutch: "dit jaar" },
  { french: "longtemps", dutch: "lang (tijd)" },
  { french: "bien sûr", dutch: "natuurlijk" },
  { french: "refuser", dutch: "weigeren" },
  { french: "demander", dutch: "vragen" },
  { french: "je peux", dutch: "ik kan" },
  { french: "l'argent (m)", dutch: "het geld" },
  { french: "le jardin", dutch: "de tuin" },
  { french: "Tu as quel âge?", dutch: "Hoe oud ben jij?" },
  { french: "J'ai treize ans.", dutch: "Ik ben dertien jaar." },
  { french: "Mon anniversaire, c'est le 11 mars.", dutch: "Ik ben op 11 maart jarig." },
  { french: "le frère", dutch: "de broer" },
  { french: "la sœur", dutch: "de zus" },
  { french: "je vois", dutch: "ik zie" },
  { french: "porter", dutch: "dragen" },
  { french: "rouge", dutch: "rood" },
  { french: "vert(e)", dutch: "groen" },
  { french: "noir(e)", dutch: "zwart" },
  { french: "bleu(e)", dutch: "blauw" },
  { french: "gris(e)", dutch: "grijs" },
  { french: "blond(e)", dutch: "blond" },
  { french: "grand(e)", dutch: "groot" },
  { french: "petit(e)", dutch: "klein" },
  { french: "marron", dutch: "bruin (ogen)" },
  { french: "les yeux (m mv)", dutch: "de ogen" },
  { french: "les cheveux (m mv)", dutch: "het haar" },
  { french: "les lunettes (v mv)", dutch: "de bril" },
  { french: "Ton frère est comment?", dutch: "Hoe is je broer?" },
  { french: "Mon frère a les cheveux bruns.", dutch: "Mijn broer heeft bruin haar." },
  { french: "Il a les yeux bleus.", dutch: "Hij heeft blauwe ogen." },
  { french: "Il porte des lunettes.", dutch: "Hij draagt een bril." },
  { french: "Il est grand?", dutch: "Is hij groot?" },
  { french: "Non, il est petit.", dutch: "Nee, hij is klein." },
  { french: "la question", dutch: "de vraag" },
  { french: "le jour", dutch: "de dag" },
  { french: "le foot", dutch: "voetbal" },
  { french: "changer", dutch: "veranderen" },
  { french: "même", dutch: "zelfs" },
  { french: "depuis", dutch: "sinds" },
  { french: "par exemple", dutch: "bijvoorbeeld" },
  { french: "souvent", dutch: "vaak" },
  { french: "calme", dutch: "rustig" },
  { french: "sportif/sportive", dutch: "sportief" },
  { french: "triste", dutch: "triest" },
  { french: "drôle", dutch: "grappig" },
  { french: "mince", dutch: "slank" },
  { french: "timide", dutch: "verlegen" },
  { french: "meilleur(e)", dutch: "beste" },
  { french: "un peu", dutch: "een beetje" },
  { french: "Il est sympa?", dutch: "Is hij aardig?" },
  { french: "Oui, et il est drôle.", dutch: "Ja, en hij is grappig." },
  { french: "Il aime le sport?", dutch: "Houdt hij van sport?" },
  { french: "Oui, il aime le foot.", dutch: "Ja, hij houdt van voetbal." },
];

// ─── English chapters (uses `french` field for English words) ───

const englishChapter1Words: VocabItem[] = [
  { french: "to study", dutch: "studeren; leren" },
  { french: "art", dutch: "kunst" },
  { french: "to check", dutch: "nakijken" },
  { french: "difficult", dutch: "moeilijk" },
  { french: "French", dutch: "Frans" },
  { french: "geography", dutch: "aardrijkskunde" },
  { french: "history", dutch: "geschiedenis" },
  { french: "to listen (to)", dutch: "luisteren (naar)" },
  { french: "maths", dutch: "wiskunde" },
  { french: "music", dutch: "muziek" },
  { french: "PE", dutch: "gym" },
  { french: "science", dutch: "natuurkunde / scheikunde" },
  { french: "secondary school", dutch: "middelbare school" },
  { french: "high school", dutch: "middelbare school" },
  { french: "subject", dutch: "vak" },
  { french: "to take (out)", dutch: "(erbij) pakken" },
  { french: "timetable", dutch: "rooster" },
  { french: "to understand", dutch: "begrijpen" },
  { french: "year 7", dutch: "brugklas" },
];

const englishChapter2Words: VocabItem[] = [
  { french: "bag", dutch: "tas" },
  { french: "belt", dutch: "riem" },
  { french: "boot", dutch: "laars" },
  { french: "brand", dutch: "merk" },
  { french: "cheap", dutch: "goedkoop" },
  { french: "expensive", dutch: "duur" },
  { french: "jewellery", dutch: "sieraden" },
  { french: "to match", dutch: "passen (bij)" },
  { french: "(to be) on sale", dutch: "in de uitverkoop (zijn)" },
  { french: "outerwear", dutch: "bovenkleding" },
  { french: "second-hand", dutch: "tweedehands" },
  { french: "shorts", dutch: "korte broek" },
  { french: "size", dutch: "maat" },
  { french: "suit", dutch: "pak" },
  { french: "to take off", dutch: "uittrekken" },
  { french: "tie", dutch: "stropdas" },
  { french: "tights", dutch: "panty" },
  { french: "to try on", dutch: "passen" },
  { french: "umbrella", dutch: "paraplu" },
];

// ─── Chapter lists per language ───

export const frenchChapters: Chapter[] = [
  {
    id: "chapitre1",
    title: "Chapitre 1",
    description: "Kennismaken, dieren & familie",
    words: chapitre1Words,
    requiresLogin: false,
  },
  {
    id: "chapitre2",
    title: "Chapitre 2",
    description: "Eten, drinken & winkelen",
    words: chapitre2Words,
    requiresLogin: false,
  },
  {
    id: "chapitre3",
    title: "Chapitre 3",
    description: "School, vakken & de kamer",
    words: chapitre3Words,
    requiresLogin: false,
  },
  {
    id: "chapitre5",
    title: "Chapitre 5",
    description: "Familie, maanden & uiterlijk",
    words: chapitre5Words,
    requiresLogin: false,
  },
];

const englishChapter3Words: VocabItem[] = [
  { french: "car", dutch: "auto" },
  { french: "to drive", dutch: "besturen" },
  { french: "bicycle; bike", dutch: "fiets" },
  { french: "dangerous", dutch: "gevaarlijk" },
  { french: "ticket", dutch: "kaartje" },
  { french: "slow", dutch: "langzaam" },
  { french: "underground (UK) / subway (US)", dutch: "metro" },
  { french: "passenger", dutch: "passagier" },
  { french: "journey", dutch: "reis" },
  { french: "to ride", dutch: "rijden" },
  { french: "fast", dutch: "snel" },
  { french: "taxi(cab)", dutch: "taxi" },
  { french: "train", dutch: "trein" },
  { french: "safe", dutch: "veilig" },
  { french: "traffic", dutch: "verkeer" },
  { french: "plane", dutch: "vliegtuig" },
  { french: "to wait", dutch: "wachten" },
];

const englishChapter4Words: VocabItem[] = [
  { french: "athlete", dutch: "atleet / sporter" },
  { french: "to beat", dutch: "verslaan" },
  { french: "champion", dutch: "kampioen" },
  { french: "court", dutch: "speelveld (afgesloten ruimte)" },
  { french: "field", dutch: "speelveld (open ruimte)" },
  { french: "goalie", dutch: "doelman / doelvrouw" },
  { french: "gymnastics", dutch: "turnen" },
  { french: "ice rink", dutch: "ijsbaan" },
  { french: "(to be) in shape", dutch: "fit; in vorm zijn" },
  { french: "martial arts", dutch: "vechtsport" },
  { french: "match (UK)", dutch: "wedstrijd" },
  { french: "game (US)", dutch: "wedstrijd" },
  { french: "player", dutch: "speler" },
  { french: "referee", dutch: "scheidsrechter" },
  { french: "rule", dutch: "(spel)regel" },
  { french: "to skate", dutch: "schaatsen" },
  { french: "to work out", dutch: "sporten / fitnessen" },
  { french: "goal", dutch: "doel / doelpunt" },
];

export const englishChapters: Chapter[] = [
  {
    id: "en_chapter1",
    title: "Chapter 1",
    description: "School & vakken",
    words: englishChapter1Words,
    requiresLogin: false,
  },
  {
    id: "en_chapter2",
    title: "Chapter 2",
    description: "Kleding & winkelen",
    words: englishChapter2Words,
    requiresLogin: false,
  },
  {
    id: "en_chapter3",
    title: "Chapter 3",
    description: "Vervoer & reizen",
    words: englishChapter3Words,
    requiresLogin: false,
  },
  {
    id: "en_chapter4",
    title: "Chapter 4",
    description: "Sport & bewegen",
    words: englishChapter4Words,
    requiresLogin: false,
  },
];

export function getChaptersForLanguage(lang: Language): Chapter[] {
  return lang === "french" ? frenchChapters : englishChapters;
}

export function getDefaultChapterId(lang: Language): string {
  return lang === "french" ? "chapitre3" : "en_chapter1";
}

// Keep `chapters` as backward compat (french)
export const chapters = frenchChapters;

export const DEFAULT_CHAPTER_ID = "chapitre3";

export function getChapter(id: string): Chapter | undefined {
  return [...frenchChapters, ...englishChapters].find((c) => c.id === id);
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

// ─── Language labels helper ───
export function getForeignLabel(lang: Language): string {
  return lang === "french" ? "Frans" : "Engels";
}

export function getForeignLabelNative(lang: Language): string {
  return lang === "french" ? "Français" : "English";
}

export function getDirectionLabel(lang: Language, direction: "nl_to_foreign" | "foreign_to_nl"): string {
  const foreignShort = lang === "french" ? "FR" : "EN";
  return direction === "nl_to_foreign" ? `NL → ${foreignShort}` : `${foreignShort} → NL`;
}
