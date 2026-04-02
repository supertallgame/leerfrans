export interface VocabItem {
  french: string;
  dutch: string;
  section?: string;
}

export type Language = "french" | "english" | "nask" | "biology";

export interface Chapter {
  id: string;
  title: string;
  description: string;
  words: VocabItem[];
  requiresLogin: boolean;
}

// ─── French chapters ───

const chapitre1Words: VocabItem[] = [
  { french: "la France", dutch: "Frankrijk", section: "A" },
  { french: "salut", dutch: "hoi", section: "A" },
  { french: "la plage", dutch: "het strand", section: "A" },
  { french: "mignon", dutch: "leuk / schattig", section: "A" },
  { french: "regarde!", dutch: "kijk!", section: "A" },
  { french: "aussi", dutch: "ook", section: "A" },
  { french: "maintenant", dutch: "nu", section: "A" },
  { french: "pour moi", dutch: "voor mij", section: "A" },
  { french: "le lapin", dutch: "het konijn", section: "A" },
  { french: "le chien", dutch: "de hond", section: "A" },
  { french: "le chat", dutch: "de kat", section: "A" },
  { french: "le poisson", dutch: "de vis", section: "A" },
  { french: "j'aime", dutch: "ik houd van", section: "A" },
  { french: "on va à", dutch: "wij gaan naar", section: "A" },
  { french: "on continue", dutch: "wij gaan door", section: "A" },
  { french: "il joue", dutch: "hij speelt", section: "A" },
  { french: "Bonjour, ça va?", dutch: "Hallo, hoe gaat het?", section: "A" },
  { french: "Ça va bien.", dutch: "Het gaat goed.", section: "A" },
  { french: "Tu as un chien?", dutch: "Heb jij een hond?", section: "A" },
  { french: "Oui, j'ai un chien, Hector.", dutch: "Ja, ik heb een hond, Hector.", section: "A" },
  { french: "bienvenue", dutch: "welkom", section: "B" },
  { french: "la semaine", dutch: "de week", section: "B" },
  { french: "demain", dutch: "morgen", section: "B" },
  { french: "en vacances", dutch: "op vakantie", section: "B" },
  { french: "le copain", dutch: "de vriend", section: "B" },
  { french: "la copine", dutch: "de vriendin", section: "B" },
  { french: "génial(e)", dutch: "geniaal", section: "B" },
  { french: "cool", dutch: "te gek", section: "B" },
  { french: "j'habite", dutch: "ik woon", section: "B" },
  { french: "j'organise", dutch: "ik organiseer", section: "B" },
  { french: "je suis", dutch: "ik ben", section: "B" },
  { french: "le prix", dutch: "de prijs", section: "B" },
  { french: "beaucoup", dutch: "veel", section: "B" },
  { french: "quand", dutch: "wanneer", section: "B" },
  { french: "pourquoi", dutch: "waarom", section: "B" },
  { french: "merci", dutch: "dankjewel", section: "B" },
  { french: "Je m'appelle Léa. Et toi?", dutch: "Ik heet Léa. En jij?", section: "B" },
  { french: "Je m'appelle Noah.", dutch: "Ik heet Noah.", section: "B" },
  { french: "Tu habites où?", dutch: "Waar woon jij?", section: "B" },
  { french: "J'habite à Paris.", dutch: "Ik woon in Parijs.", section: "B" },
  { french: "la mer", dutch: "de zee", section: "C" },
  { french: "le message", dutch: "het bericht", section: "C" },
  { french: "le problème", dutch: "het probleem", section: "C" },
  { french: "aujourd'hui", dutch: "vandaag", section: "C" },
  { french: "c'est quoi?", dutch: "Wat is dat?", section: "C" },
  { french: "ici", dutch: "hier", section: "C" },
  { french: "presque", dutch: "bijna", section: "C" },
  { french: "alors", dutch: "dus, dan", section: "C" },
  { french: "bizarre", dutch: "vreemd", section: "C" },
  { french: "mais", dutch: "maar", section: "C" },
  { french: "quelque chose", dutch: "iets", section: "C" },
  { french: "il y a", dutch: "er is / er zijn", section: "C" },
  { french: "on adore", dutch: "wij zijn dol op", section: "C" },
  { french: "aider", dutch: "helpen", section: "C" },
  { french: "peut-être", dutch: "misschien", section: "C" },
  { french: "ensemble", dutch: "samen", section: "C" },
  { french: "Quel est ton numéro de téléphone?", dutch: "Wat is je telefoonnummer?", section: "C" },
  { french: "Mon numéro, c'est le 06-12 06 11 7.", dutch: "Mijn nummer is 06-12 06 11 7.", section: "C" },
  { french: "Au revoir!", dutch: "Tot ziens.", section: "C" },
  { french: "le portable", dutch: "het mobieltje", section: "D" },
  { french: "le pays", dutch: "het land", section: "D" },
  { french: "petit(e)", dutch: "klein", section: "D" },
  { french: "grand(e)", dutch: "groot", section: "D" },
  { french: "il passe", dutch: "hij brengt door", section: "D" },
  { french: "il reste", dutch: "hij blijft", section: "D" },
  { french: "donc", dutch: "dus", section: "D" },
  { french: "chouette", dutch: "te gek", section: "D" },
  { french: "voilà", dutch: "alstublieft (als je iets geeft)", section: "D" },
  { french: "la famille", dutch: "de familie", section: "D" },
  { french: "mon père", dutch: "mijn vader", section: "D" },
  { french: "ma mère", dutch: "mijn moeder", section: "D" },
  { french: "la sœur", dutch: "de zus", section: "D" },
  { french: "le frère", dutch: "de broer", section: "D" },
  { french: "le cousin", dutch: "de neef", section: "D" },
  { french: "la cousine", dutch: "de nicht", section: "D" },
  { french: "Tu as quel âge?", dutch: "Hoe oud ben jij?", section: "D" },
  { french: "J'ai treize ans.", dutch: "Ik ben dertien jaar.", section: "D" },
  { french: "Tu as un frère?", dutch: "Heb jij een broer?", section: "D" },
  { french: "Oui, j'ai un frère, Romain.", dutch: "Ja, ik heb een broer, Romain.", section: "D" },
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
  { french: "secondary school / high school", dutch: "middelbare school" },
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

const englishChapter5Words: VocabItem[] = [
  { french: "air", dutch: "lucht" },
  { french: "coast(line)", dutch: "kust(lijn)" },
  { french: "countryside", dutch: "platteland" },
  { french: "to cover", dutch: "bedekken" },
  { french: "to discover", dutch: "ontdekken" },
  { french: "earth", dutch: "aarde" },
  { french: "environment", dutch: "milieu" },
  { french: "to explore", dutch: "verkennen" },
  { french: "fire", dutch: "vuur" },
  { french: "landscape", dutch: "landschap" },
  { french: "leaf", dutch: "blad" },
  { french: "path", dutch: "pad" },
  { french: "to protect", dutch: "beschermen" },
  { french: "rocky", dutch: "rotsachtig" },
  { french: "village", dutch: "dorp" },
  { french: "wave", dutch: "golf" },
  { french: "wildlife", dutch: "dieren in het wild" },
  { french: "wood", dutch: "hout" },
];

const englishChapter6Words: VocabItem[] = [
  { french: "band", dutch: "band, muziekgroep" },
  { french: "famous", dutch: "beroemd" },
  { french: "concert", dutch: "concert" },
  { french: "flute", dutch: "fluit" },
  { french: "guitar", dutch: "gitaar" },
  { french: "classical", dutch: "klassiek(e)" },
  { french: "song", dutch: "liedje" },
  { french: "melody", dutch: "melodie" },
  { french: "microphone", dutch: "microfoon" },
  { french: "piano", dutch: "piano" },
  { french: "stage", dutch: "podium" },
  { french: "boring", dutch: "saai" },
  { french: "saxophone", dutch: "saxofoon" },
  { french: "drums", dutch: "slagwerk" },
  { french: "trumpet", dutch: "trompet" },
  { french: "violin", dutch: "viool" },
  { french: "singer", dutch: "zanger(es)" },
  { french: "to sing", dutch: "zingen" },
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
  {
    id: "en_chapter5",
    title: "Chapter 5",
    description: "Natuur & omgeving",
    words: englishChapter5Words,
    requiresLogin: false,
  },
  {
    id: "en_chapter6",
    title: "Chapter 6",
    description: "Muziek & instrumenten",
    words: englishChapter6Words,
    requiresLogin: false,
  },
];

// ─── NASK chapters ───

const naskChapter1Words: VocabItem[] = [
  { dutch: "Blusdeken", french: "Een deken die je gebruikt om een kleine brand of brandende kleding te blussen" },
  { dutch: "Brandblusser", french: "Een blusapparaat om een groter brandje te blussen" },
  { dutch: "Brander", french: "Een apparaat dat aardgas verbrandt om warmte te produceren" },
  { dutch: "Diagram", french: "Een assenstelsel waarin een grafiek is getekend" },
  { dutch: "Eenheid", french: "De maat waarin je grootheden meet" },
  { dutch: "Experimenteren", french: "Proeven doen om de vragen uit het onderzoek te beantwoorden" },
  { dutch: "Grafiek", french: "Een vloeiende lijn door de meetpunten in een diagram" },
  { dutch: "Grootheid", french: "Een eigenschap die je kunt meten" },
  { dutch: "Kwaliteitscontrole", french: "Het onderzoek of een product voldoet aan alle eisen" },
  { dutch: "Labjas", french: "Een jas die je over je kleren aantrekt als bescherming voor je kleren" },
  { dutch: "Massa", french: "De hoeveelheid die je met een weegschaal meet" },
  { dutch: "Meetbereik", french: "De waarden die je met een meetinstrument kan meten" },
  { dutch: "Nooddouche", french: "Een douche die je gebruikt om bijtende stof van je huid of uit je kleren te spoelen" },
  { dutch: "Noodstop", french: "De knop die de toevoer van aardgas, water en elektriciteit stopt als je hem indrukt" },
  { dutch: "Onderdompelmethode", french: "De manier om het volume van een voorwerp te bepalen door onderdompelen" },
  { dutch: "Onderzoek doen", french: "Een manier van werken om antwoord te vinden op vragen" },
  { dutch: "Onderzoeksvraag", french: "Een vraag die aangeeft wat je wilt onderzoeken" },
  { dutch: "Oogdouche", french: "Een fontijntje dat je gebruikt om een bijtende stof uit je oog te spoelen" },
  { dutch: "Practicum", french: "Het uitvoeren van een experiment in de les" },
  { dutch: "Schaaldeel", french: "De waarde tussen twee streepjes op de schaalverdeling van een meetinstrument" },
  { dutch: "Veiligheidsbril", french: "Een bril die je opzet om je ogen te beschermen" },
  { dutch: "Veiligheidspictogram", french: "Een plaatje waaraan je kunt zien waarom een stof gevaarlijk is" },
  { dutch: "Veiligheidsregels", french: "De regels om ervoor te zorgen dat iedereen in het lokaal veilig kan werken" },
  { dutch: "Verband", french: "De invloed die de ene grootheid heeft op een andere grootheid" },
  { dutch: "Volume", french: "De hoeveelheid die aangeeft hoeveel ruimte een stof inneemt" },
  { dutch: "Waarnemen", french: "Opmerken wat er gebeurt door zien, horen, voelen, ruiken of proeven" },
  { dutch: "Conclusie", french: "Antwoord op de onderzoeksvraag" },
  { dutch: "Eerlijk vergelijken", french: "Je verandert alleen de grootheid waarvan je het effect onderzoekt" },
  { dutch: "Verslag", french: "Een schriftelijke uitwerking van een experiment" },
  { dutch: "Voorspelling", french: "Je eigen verwachting van de uitkomst van het experiment" },
  { dutch: "Werkplan", french: "Het overzicht van hoe je een experiment wilt gaan uitvoeren" },
];

const naskChapter2Words: VocabItem[] = [
  { dutch: "Absorberen van licht", french: "Het opnemen van licht" },
  { dutch: "Bolle lens", french: "Een lens die in het midden dikker is dan aan de rand" },
  { dutch: "Convergerende werking", french: "Lichtstralen naar elkaar toe laten knikken" },
  { dutch: "Convergente lichtbundel", french: "Een lichtbundel die steeds smaller wordt" },
  { dutch: "Divergerende werking", french: "Lichtstralen van elkaar af laten knikken" },
  { dutch: "Divergente lichtbundel", french: "Een lichtbundel die steeds breder wordt" },
  { dutch: "Evenwijdige lichtbundel", french: "Een lichtbundel die overal even breed is" },
  { dutch: "Gezichtsveld", french: "Het gebied dat je kunt zien" },
  { dutch: "Holle lens", french: "Een lens die in het midden dunner is dan aan de rand" },
  { dutch: "Indirect licht", french: "Licht dat niet rechtstreeks van een lichtbron komt, maar via een voorwerp" },
  { dutch: "Kleurenspectrum", french: "De kleurenband die je ziet als wit licht op een prisma valt" },
  { dutch: "Kleurfilter", french: "Glas of kunststof dat alleen één kleur uit het kleurenspectrum doorlaat" },
  { dutch: "Kunstmatige lichtbron", french: "Een lichtbron die door de mens is gemaakt" },
  { dutch: "Lens", french: "Een stukje geslepen glas of doorzichtig kunststof waarmee je lichtbundels kunt veranderen" },
  { dutch: "Lichtbron", french: "De plaats waar licht ontstaat" },
  { dutch: "Lichtbundel", french: "De verzameling lichtstralen van één lichtbron" },
  { dutch: "Lichtstraal", french: "Een rechte lijn die laat zien hoe licht vanaf de lichtbron naar de omgeving gaat" },
  { dutch: "Primaire kleuren", french: "De basiskleuren waarmee je alle andere kleuren kunt maken" },
  { dutch: "Prisma", french: "Een driehoekig stuk glas of doorzichtig kunststof" },
  { dutch: "Natuurlijke lichtbron", french: "Een lichtbron die in de natuur is ontstaan zonder invloed van mensen" },
  { dutch: "Randstralen", french: "De lichtstralen die vanuit de lichtbron vlak langs een voorwerp lopen" },
  { dutch: "Schaduw", french: "Het gebied achter een verlicht voorwerp waar veel minder licht komt" },
  { dutch: "Spiegelbeeld", french: "Het beeld dat je ziet als je in een spiegel kijkt" },
  { dutch: "Spiegelende weerkaatsing", french: "De weerkaatsing van licht in één richting, zoals bij een spiegel gebeurt" },
  { dutch: "Zichtlijn", french: "De lijn waarlangs je naar een voorwerp kijkt" },
];

const naskChapter3Words: VocabItem[] = [
  { dutch: "Condenseren", french: "De faseovergang van gas naar vloeistof" },
  { dutch: "Dichtheid", french: "De massa van één kubieke centimeter (1 cm³) van een stof" },
  { dutch: "Dosis", french: "De hoeveelheid van een stof die je binnenkrijgt" },
  { dutch: "Fase", french: "De toestand waarin een stof kan voorkomen: vaste stof, vloeistof en gas" },
  { dutch: "Faseovergang", french: "Overgang van de ene fase naar de andere fase" },
  { dutch: "Filtraat", french: "De vloeistof die door een filter is gegaan" },
  { dutch: "Filtreren", french: "Een scheidingsmethode om een vaste stof uit een suspensie te halen" },
  { dutch: "Graden Celsius", french: "De eenheid van temperatuur: gebaseerd op het smeltpunt en kookpunt van water" },
  { dutch: "Gas", french: "Een stof zonder eigen vorm en zonder eigen volume, bijvoorbeeld lucht" },
  { dutch: "Giftig", french: "Een stof die dodelijk of schadelijk is voor je gezondheid" },
  { dutch: "Hergebruik", french: "Het opnieuw gebruiken van een voorwerp" },
  { dutch: "Indampen", french: "Een scheidingsmethode om een vaste stof uit een suspensie te halen" },
  { dutch: "Kookpunt", french: "De temperatuur waarbij de vloeistof verdampt met dampbellen in de vloeistof" },
  { dutch: "Mengsel", french: "Materie die bestaat uit twee of meer stoffen" },
  { dutch: "Oplossing", french: "Een helder mengsel van een stof in een vloeistof" },
  { dutch: "Recyclen", french: "Afval gebruiken om nieuwe producten te maken" },
  { dutch: "Residu", french: "De stof die bij filtreren of indampen op het filter of in het indampschaaltje achterblijft" },
  { dutch: "Smelten", french: "De faseovergang van vaste stof naar vloeistof" },
  { dutch: "Smeltpunt", french: "De temperatuur waarbij een stof van de vaste naar de vloeibare fase overgaat" },
  { dutch: "Stofeigenschap", french: "Een eigenschap van een stof zoals de dichtheid" },
  { dutch: "Stoffen", french: "De materie waaruit alles om je heen bestaat" },
  { dutch: "Stollen", french: "De faseovergang van vloeistof naar vaste stof" },
  { dutch: "Suspensie", french: "Een troebel mengsel van een vaste stof in een vloeistof" },
  { dutch: "Temperatuurlijn", french: "De lijn waaruit je kunt aflezen wat de fase van een stof is" },
  { dutch: "Vaste stof", french: "Een stof met een eigen vorm en een eigen volume, bijvoorbeeld steen" },
  { dutch: "Veiligheidspictogram", french: "Een afbeelding waar je aan kunt zien waarom een stof gevaarlijk is" },
  { dutch: "Verdampen", french: "De faseovergang van vloeistof naar gas" },
  { dutch: "Voorwerpseigenschap", french: "Een eigenschap van een voorwerp zoals de vorm" },
  { dutch: "Vloeistof", french: "Een stof zonder eigen vorm, maar met eigen volume, bijvoorbeeld water" },
  { dutch: "Zuivere stof", french: "Materie die bestaat uit één stof" },
  { dutch: "Afschenken", french: "Het afgieten van de vloeistof (bij suspensies) of de vloeistof met de kleinste dichtheid (bij emulsies)" },
  { dutch: "Bezinken", french: "De scheiding van twee stoffen waarbij de stof met de grootste dichtheid naar beneden zakt" },
  { dutch: "Emulgator", french: "Een stof die ervoor zorgt dat een emulsie gemengd blijft" },
  { dutch: "Emulsie", french: "Een troebel mengsel van een vloeistof in een andere vloeistof" },
];

const naskChapter4Words: VocabItem[] = [
  { dutch: "Afstand,tijd-diagram", french: "Diagram dat laat zien welke afstand op elk tijdstip is afgelegd" },
  { dutch: "Beweging met constante snelheid", french: "Een beweging waarbij de snelheid op elk moment even groot is" },
  { dutch: "Gemiddelde snelheid", french: "Grootheid die je berekent met de formule gemiddelde snelheid = afstand ÷ tijdsduur (als de snelheid varieert)" },
  { dutch: "Formule", french: "Een korte manier om op te schrijven hoe je iets uitrekent" },
  { dutch: "Reactieafstand", french: "De afstand die je aflegt tijdens de reactietijd" },
  { dutch: "Reactietijd", french: "De tijd tussen zien dat je moet reageren en zelf reageren" },
  { dutch: "Snelheid", french: "Grootheid die je berekent met de formule snelheid = afstand ÷ tijdsduur (als de snelheid constant is)" },
  { dutch: "Snelheid,tijd-diagram", french: "Diagram dat laat zien hoe groot de snelheid is op elk tijdstip" },
  { dutch: "Versnelde beweging", french: "Een beweging waarbij de snelheid steeds groter wordt" },
  { dutch: "Vertraagde beweging", french: "Een beweging waarbij de snelheid steeds kleiner wordt" },
];

// ─── Biology chapters ───

const biologyChapter4Words: VocabItem[] = [
  { dutch: "Dubbele-S-vorm", french: "De vorm van de wervelkolom" },
  { dutch: "Tussenwervelschijf", french: "Geleiachtige kern omgeven door kraakbeen" },
  { dutch: "Lichaamshouding", french: "De manier waarop je staat en zit" },
  { dutch: "Bochel", french: "Kromme rug, kan ontstaan door veel omlaag kijken op beeldschermen" },
  { dutch: "Blessure", french: "Beschadiging aan spieren, botten of gewrichten" },
  { dutch: "Spierscheuring", french: "Een beschadiging van een spier, oorzaak: te sterke inspanning of een plotselinge beweging" },
  { dutch: "Botbreuk", french: "Een bot breekt in twee (of meer) delen" },
  { dutch: "Zetten van een bot", french: "De delen van het bot in de goede stand brengen, de delen groeien weer aan elkaar" },
  { dutch: "Voetbalknie", french: "In het kniegewricht is een meniscus beschadigd, bijv. door een draaibeweging terwijl het onderbeen blijft staan" },
  { dutch: "Kneuzing", french: "Beschadiging van weefsel door een val, duw, stomp of trap" },
  { dutch: "Blauwe plek", french: "Inwendige bloeding als gevolg van een kneuzing" },
  { dutch: "Zwelling", french: "Ophoping van vocht" },
  { dutch: "Verzwikking", french: "Kneuzing van het gewricht; beschadiging van het gewrichtskapsel en de kapselbanden" },
  { dutch: "Ontwrichting", french: "De gewrichtskogel is uit de gewrichtskom geraakt" },
];

const biologyChapters: Chapter[] = [
  {
    id: "bio_chapter4",
    title: "Hoofdstuk 4",
    description: "Stevigheid & beweging",
    words: biologyChapter4Words,
    requiresLogin: false,
  },
];

const naskChapters: Chapter[] = [
  {
    id: "nask_chapter1",
    title: "Hoofdstuk 1",
    description: "Onderzoeken & veiligheid",
    words: naskChapter1Words,
    requiresLogin: false,
  },
  {
    id: "nask_chapter2",
    title: "Hoofdstuk 2",
    description: "Licht",
    words: naskChapter2Words,
    requiresLogin: false,
  },
  {
    id: "nask_chapter3",
    title: "Hoofdstuk 3",
    description: "Stoffen & mengsels",
    words: naskChapter3Words,
    requiresLogin: false,
  },
  {
    id: "nask_chapter4",
    title: "Hoofdstuk 4",
    description: "Snelheid & beweging",
    words: naskChapter4Words,
    requiresLogin: false,
  },
];

export function getChaptersForLanguage(lang: Language): Chapter[] {
  if (lang === "french") return frenchChapters;
  if (lang === "english") return englishChapters;
  if (lang === "biology") return biologyChapters;
  return naskChapters;
}

export function getDefaultChapterId(lang: Language): string {
  if (lang === "french") return "chapitre3";
  if (lang === "english") return "en_chapter1";
  if (lang === "biology") return "bio_chapter4";
  return "nask_chapter1";
}

// Keep `chapters` as backward compat (french)
export const chapters = frenchChapters;

export const DEFAULT_CHAPTER_ID = "chapitre3";

export function getChapter(id: string): Chapter | undefined {
  return [...frenchChapters, ...englishChapters, ...naskChapters, ...biologyChapters].find((c) => c.id === id);
}

export function getActiveVocabulary(chapterId: string): VocabItem[] {
  return getChapter(chapterId)?.words ?? chapitre3Words;
}

export function getSectionsForChapter(chapterId: string): string[] {
  const words = getChapter(chapterId)?.words ?? [];
  const sections = new Set(words.map((w) => w.section).filter(Boolean) as string[]);
  return Array.from(sections).sort();
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
  if (lang === "french") return "Frans";
  if (lang === "english") return "Engels";
  return "Omschrijving";
}

export function getForeignLabelNative(lang: Language): string {
  if (lang === "french") return "Français";
  if (lang === "english") return "English";
  return "Omschrijving";
}

export function getNlLabel(lang: Language): string {
  if (lang === "nask" || lang === "biology") return "Begrip";
  return "Nederlands";
}

export function getForeignShort(lang: Language): string {
  if (lang === "french") return "FR";
  if (lang === "english") return "EN";
  return "Omschrijving";
}

export function getNlShort(lang: Language): string {
  if (lang === "nask" || lang === "biology") return "Begrip";
  return "NL";
}

export function getDirectionLabel(lang: Language, direction: "nl_to_foreign" | "foreign_to_nl"): string {
  const nlShort = getNlShort(lang);
  const foreignShort = getForeignShort(lang);
  return direction === "nl_to_foreign" ? `${nlShort} → ${foreignShort}` : `${foreignShort} → ${nlShort}`;
}
