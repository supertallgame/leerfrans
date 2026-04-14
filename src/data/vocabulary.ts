export interface VocabItem {
  french: string;
  dutch: string;
  section?: string;
}

export type Language = "french" | "english" | "nask" | "biology";
export type Niveau = "vmbo-havo" | "havo-vwo";

export interface Chapter {
  id: string;
  title: string;
  description: string;
  words: VocabItem[];
  requiresLogin: boolean;
}

// ─── French chapters ───

const chapitre1Words: VocabItem[] = [
  // Section A – vocab block 1
  { french: "la France", dutch: "Frankrijk", section: "Sport" },
  { french: "salut", dutch: "hoi", section: "Sport" },
  { french: "la plage", dutch: "het strand", section: "Sport" },
  { french: "mignon", dutch: "leuk / schattig", section: "Sport" },
  { french: "regarde!", dutch: "kijk!", section: "Sport" },
  { french: "aussi", dutch: "ook", section: "Sport" },
  { french: "maintenant", dutch: "nu", section: "Sport" },
  { french: "pour moi", dutch: "voor mij", section: "Sport" },
  { french: "le lapin", dutch: "het konijn", section: "Sport" },
  { french: "le chien", dutch: "de hond", section: "Sport" },
  { french: "le chat", dutch: "de kat", section: "Sport" },
  { french: "le poisson", dutch: "de vis", section: "Sport" },
  { french: "j'aime", dutch: "ik houd van", section: "Sport" },
  { french: "on va à", dutch: "wij gaan naar", section: "Sport" },
  { french: "on continue", dutch: "wij gaan door", section: "Sport" },
  { french: "il joue", dutch: "hij speelt", section: "Sport" },
  // Section B – vocab block 2
  { french: "bienvenue", dutch: "welkom", section: "Balsport" },
  { french: "la semaine", dutch: "de week", section: "Balsport" },
  { french: "demain", dutch: "morgen", section: "Balsport" },
  { french: "en vacances", dutch: "op vakantie", section: "Balsport" },
  { french: "le copain", dutch: "de vriend", section: "Balsport" },
  { french: "la copine", dutch: "de vriendin", section: "Balsport" },
  { french: "génial(e)", dutch: "geniaal", section: "Balsport" },
  { french: "cool", dutch: "te gek", section: "Balsport" },
  { french: "j'habite", dutch: "ik woon", section: "Balsport" },
  { french: "j'organise", dutch: "ik organiseer", section: "Balsport" },
  { french: "je suis", dutch: "ik ben", section: "Balsport" },
  { french: "le prix", dutch: "de prijs", section: "Balsport" },
  { french: "beaucoup", dutch: "veel", section: "Balsport" },
  { french: "quand", dutch: "wanneer", section: "Balsport" },
  { french: "pourquoi", dutch: "waarom", section: "Balsport" },
  { french: "merci", dutch: "dankjewel", section: "Balsport" },
  // Section C – Se présenter (zinnen)
  { french: "Bonjour, ça va?", dutch: "Hallo, hoe gaat het?", section: "Werk" },
  { french: "Ça va bien.", dutch: "Het gaat goed.", section: "Werk" },
  { french: "Je m'appelle Léa. Et toi?", dutch: "Ik heet Léa. En jij?", section: "Werk" },
  { french: "Je m'appelle Noah.", dutch: "Ik heet Noah.", section: "Werk" },
  { french: "Tu habites où?", dutch: "Waar woon jij?", section: "Werk" },
  { french: "J'habite à Paris.", dutch: "Ik woon in Parijs.", section: "Werk" },
  { french: "Tu as un chien?", dutch: "Heb jij een hond?", section: "Werk" },
  { french: "Oui, j'ai un chien, Hector.", dutch: "Ja, ik heb een hond, Hector.", section: "Werk" },
  // Section E – vocab block 3
  { french: "la mer", dutch: "de zee", section: "Geld" },
  { french: "le message", dutch: "het bericht", section: "Geld" },
  { french: "le problème", dutch: "het probleem", section: "Geld" },
  { french: "aujourd'hui", dutch: "vandaag", section: "Geld" },
  { french: "c'est quoi?", dutch: "Wat is dat?", section: "Geld" },
  { french: "ici", dutch: "hier", section: "Geld" },
  { french: "presque", dutch: "bijna", section: "Geld" },
  { french: "alors", dutch: "dus, dan", section: "Geld" },
  { french: "bizarre", dutch: "vreemd", section: "Geld" },
  { french: "mais", dutch: "maar", section: "Geld" },
  { french: "quelque chose", dutch: "iets", section: "Geld" },
  { french: "il y a", dutch: "er is / er zijn", section: "Geld" },
  { french: "on adore", dutch: "wij zijn dol op", section: "Geld" },
  { french: "aider", dutch: "helpen", section: "Geld" },
  { french: "peut-être", dutch: "misschien", section: "Geld" },
  { french: "ensemble", dutch: "samen", section: "Geld" },
  // Section F – vocab block 4
  { french: "le portable", dutch: "het mobieltje", section: "Geld 2" },
  { french: "le pays", dutch: "het land", section: "Geld 2" },
  { french: "petit(e)", dutch: "klein", section: "Geld 2" },
  { french: "grand(e)", dutch: "groot", section: "Geld 2" },
  { french: "il passe", dutch: "hij brengt door", section: "Geld 2" },
  { french: "il reste", dutch: "hij blijft", section: "Geld 2" },
  { french: "donc", dutch: "dus", section: "Geld 2" },
  { french: "chouette", dutch: "te gek", section: "Geld 2" },
  { french: "voilà", dutch: "alstublieft (als je iets geeft)", section: "Geld 2" },
  { french: "la famille", dutch: "de familie", section: "Geld 2" },
  { french: "mon père", dutch: "mijn vader", section: "Geld 2" },
  { french: "ma mère", dutch: "mijn moeder", section: "Geld 2" },
  { french: "la sœur", dutch: "de zus", section: "Geld 2" },
  { french: "le frère", dutch: "de broer", section: "Geld 2" },
  { french: "le cousin", dutch: "de neef", section: "Geld 2" },
  { french: "la cousine", dutch: "de nicht", section: "Geld 2" },
  // Section G – Parler de toi (zinnen)
  { french: "Tu as quel âge?", dutch: "Hoe oud ben jij?", section: "Vrije tijd" },
  { french: "J'ai treize ans.", dutch: "Ik ben dertien jaar.", section: "Vrije tijd" },
  { french: "Tu as un frère?", dutch: "Heb jij een broer?", section: "Vrije tijd" },
  { french: "Oui, j'ai un frère, Romain.", dutch: "Ja, ik heb een broer, Romain.", section: "Vrije tijd" },
  { french: "Quel est ton numéro de téléphone?", dutch: "Wat is je telefoonnummer?", section: "Vrije tijd" },
  { french: "Mon numéro, c'est le 06-12 06 11 7.", dutch: "Mijn nummer is 06-12 06 11 7.", section: "Vrije tijd" },
  { french: "Au revoir!", dutch: "Tot ziens.", section: "Vrije tijd" },
];

const chapitre2Words: VocabItem[] = [
  // Section A
  { french: "aimer", dutch: "houden van", section: "Sport" },
  { french: "préférer", dutch: "liever hebben", section: "Sport" },
  { french: "adorer", dutch: "dol zijn op", section: "Sport" },
  { french: "détester", dutch: "een hekel hebben aan", section: "Sport" },
  { french: "mais", dutch: "maar", section: "Sport" },
  { french: "quoi", dutch: "wat", section: "Sport" },
  { french: "et", dutch: "en", section: "Sport" },
  { french: "je prends", dutch: "ik neem", section: "Sport" },
  { french: "manger", dutch: "eten", section: "Sport" },
  { french: "la pizza", dutch: "de pizza", section: "Sport" },
  { french: "la crêpe", dutch: "de pannenkoek", section: "Sport" },
  { french: "le pain", dutch: "het brood", section: "Sport" },
  { french: "la tomate", dutch: "de tomaat", section: "Sport" },
  { french: "le chocolat", dutch: "de chocola(de)", section: "Sport" },
  { french: "le thé", dutch: "de thee", section: "Sport" },
  { french: "le coca", dutch: "de cola", section: "Sport" },
  // Section B
  { french: "avec", dutch: "met", section: "Balsport" },
  { french: "après", dutch: "na / daarna", section: "Balsport" },
  { french: "aussi", dutch: "ook", section: "Balsport" },
  { french: "d'accord", dutch: "oké", section: "Balsport" },
  { french: "ce soir", dutch: "vanavond", section: "Balsport" },
  { french: "acheter", dutch: "kopen", section: "Balsport" },
  { french: "préparer", dutch: "voorbereiden / maken", section: "Balsport" },
  { french: "tu veux", dutch: "je wilt", section: "Balsport" },
  { french: "le repas", dutch: "de maaltijd", section: "Balsport" },
  { french: "le beurre", dutch: "de boter", section: "Balsport" },
  { french: "l'ognon (m)", dutch: "de ui", section: "Balsport" },
  { french: "bon / bonne", dutch: "lekker", section: "Balsport" },
  { french: "le fromage", dutch: "de kaas", section: "Balsport" },
  { french: "l'œuf (m)", dutch: "het ei", section: "Balsport" },
  { french: "le légume", dutch: "de groente", section: "Balsport" },
  { french: "la viande", dutch: "het vlees", section: "Balsport" },
  // Section C – À une terrasse (zinnen)
  { french: "La carte, s'il vous plaît.", dutch: "De kaart alstublieft.", section: "Werk" },
  { french: "Un coca et une crêpe, s'il vous plaît.", dutch: "Een cola en een pannenkoek alstublieft.", section: "Werk" },
  { french: "Tu aimes le coca?", dutch: "Houd je van cola?", section: "Werk" },
  { french: "Oui, j'adore le coca!", dutch: "Ja, ik ben dol op cola!", section: "Werk" },
  { french: "C'est quoi?", dutch: "Wat is dat?", section: "Werk" },
  { french: "C'est une quiche.", dutch: "Dat is een hartige taart.", section: "Werk" },
  { french: "Voilà.", dutch: "Alstublieft. (Als je iets geeft.)", section: "Werk" },
  { french: "Bon appétit!", dutch: "Eet smakelijk!", section: "Werk" },
  // Section E
  { french: "l'enfant (m/v)", dutch: "het kind", section: "Geld" },
  { french: "le (super)marché", dutch: "de (super)markt", section: "Geld" },
  { french: "le rendez-vous", dutch: "de afspraak", section: "Geld" },
  { french: "le problème", dutch: "het probleem", section: "Geld" },
  { french: "demain", dutch: "morgen", section: "Geld" },
  { french: "célèbre", dutch: "beroemd", section: "Geld" },
  { french: "important(e)", dutch: "belangrijk", section: "Geld" },
  { french: "maintenant", dutch: "nu", section: "Geld" },
  { french: "aider", dutch: "helpen", section: "Geld" },
  { french: "chercher", dutch: "zoeken", section: "Geld" },
  { french: "trouver", dutch: "vinden", section: "Geld" },
  { french: "regarder", dutch: "kijken (naar)", section: "Geld" },
  { french: "beaucoup", dutch: "veel", section: "Geld" },
  { french: "toujours", dutch: "altijd", section: "Geld" },
  { french: "combien", dutch: "hoeveel", section: "Geld" },
  { french: "j'ai besoin de", dutch: "ik heb nodig", section: "Geld" },
  // Section F
  { french: "demander", dutch: "vragen", section: "Geld 2" },
  { french: "parler", dutch: "praten", section: "Geld 2" },
  { french: "possible", dutch: "mogelijk", section: "Geld 2" },
  { french: "dans", dutch: "in", section: "Geld 2" },
  { french: "marcher", dutch: "lopen", section: "Geld 2" },
  { french: "entrer", dutch: "binnenkomen", section: "Geld 2" },
  { french: "rester", dutch: "blijven", section: "Geld 2" },
  { french: "l'argent (m)", dutch: "het geld", section: "Geld 2" },
  { french: "j'ai faim", dutch: "ik heb honger", section: "Geld 2" },
  { french: "la boulangerie", dutch: "de bakkerij", section: "Geld 2" },
  { french: "le magasin", dutch: "de winkel", section: "Geld 2" },
  { french: "le vêtement", dutch: "het kledingstuk", section: "Geld 2" },
  { french: "le croissant", dutch: "de croissant", section: "Geld 2" },
  { french: "le pain au chocolat", dutch: "het chocoladebroodje", section: "Geld 2" },
  { french: "la baguette", dutch: "het stokbrood", section: "Geld 2" },
  { french: "fou/folle de", dutch: "gek op", section: "Geld 2" },
  // Section G – Acheter quelque chose (zinnen)
  { french: "Vous avez deux croissants?", dutch: "Heeft u twee croissants?", section: "Vrije tijd" },
  { french: "Oui, voilà.", dutch: "Ja, alstublieft.", section: "Vrije tijd" },
  { french: "Je voudrais une baguette.", dutch: "Ik wil graag een stokbrood.", section: "Vrije tijd" },
  { french: "Ça coute combien?", dutch: "Hoeveel kost het?", section: "Vrije tijd" },
  { french: "Ça coute trois euros cinquante.", dutch: "Dat kost drie euro vijftig.", section: "Vrije tijd" },
  { french: "Je ne comprends pas.", dutch: "Ik begrijp het niet.", section: "Vrije tijd" },
  { french: "Trois euros cinquante.", dutch: "Drie euro vijftig.", section: "Vrije tijd" },
  { french: "Merci.", dutch: "Bedankt.", section: "Vrije tijd" },
  { french: "Au revoir!", dutch: "Tot ziens!", section: "Vrije tijd" },
];

const chapitre3Words: VocabItem[] = [
  // Section A
  { french: "l'anglais", dutch: "Engels", section: "Sport" },
  { french: "le français", dutch: "Frans", section: "Sport" },
  { french: "le néerlandais", dutch: "Nederlands", section: "Sport" },
  { french: "les maths", dutch: "wiskunde", section: "Sport" },
  { french: "la géographie", dutch: "aardrijkskunde", section: "Sport" },
  { french: "l'histoire", dutch: "geschiedenis", section: "Sport" },
  { french: "le dessin", dutch: "tekenen", section: "Sport" },
  { french: "la gym", dutch: "gym", section: "Sport" },
  { french: "le contrôle", dutch: "de toets", section: "Sport" },
  { french: "facile", dutch: "makkelijk", section: "Sport" },
  { french: "difficile", dutch: "moeilijk", section: "Sport" },
  { french: "fort(e)", dutch: "goed / sterk", section: "Sport" },
  { french: "vraiment", dutch: "echt / werkelijk", section: "Sport" },
  { french: "l'école", dutch: "de school", section: "Sport" },
  { french: "commencer", dutch: "beginnen", section: "Sport" },
  { french: "rigoler", dutch: "lachen", section: "Sport" },
  // Section B
  { french: "sévère", dutch: "streng", section: "Balsport" },
  { french: "noter", dutch: "noteren / opschrijven", section: "Balsport" },
  { french: "peut-être", dutch: "misschien", section: "Balsport" },
  { french: "la chambre", dutch: "de kamer", section: "Balsport" },
  { french: "le secret", dutch: "het geheim", section: "Balsport" },
  { french: "les devoirs (m mv)", dutch: "het huiswerk", section: "Balsport" },
  { french: "le sac à dos", dutch: "de rugzak", section: "Balsport" },
  { french: "la trousse", dutch: "het etui", section: "Balsport" },
  { french: "la classe", dutch: "de klas", section: "Balsport" },
  { french: "en quatrième", dutch: "in de tweede klas", section: "Balsport" },
  { french: "trop", dutch: "te / te veel", section: "Balsport" },
  { french: "aujourd'hui", dutch: "vandaag", section: "Balsport" },
  { french: "le/la prof", dutch: "de leraar/de lerares", section: "Balsport" },
  { french: "toujours", dutch: "altijd", section: "Balsport" },
  { french: "sympa", dutch: "aardig", section: "Balsport" },
  { french: "surtout", dutch: "vooral", section: "Balsport" },
  // Section C – Parler de l'école (zinnen)
  { french: "Tu es en quelle classe?", dutch: "In welke klas zit jij?", section: "Werk" },
  { french: "Je suis en cinquième.", dutch: "Ik zit in de eerste klas.", section: "Werk" },
  { french: "Tu as quelles matières, le mardi?", dutch: "Welke vakken heb je op dinsdag?", section: "Werk" },
  { french: "Le mardi, j'ai anglais et géographie.", dutch: "Op dinsdag heb ik Engels en aardrijkskunde.", section: "Werk" },
  { french: "La récré, c'est à quelle heure?", dutch: "Hoe laat is de pauze?", section: "Werk" },
  { french: "À dix heures.", dutch: "Om tien uur.", section: "Werk" },
  { french: "Quelle heure est-il?", dutch: "Hoe laat is het?", section: "Werk" },
  { french: "Il est neuf heures et demie.", dutch: "Het is half tien.", section: "Werk" },
  // Section E
  { french: "madame", dutch: "mevrouw", section: "Geld" },
  { french: "préféré(e)", dutch: "lievelings-", section: "Geld" },
  { french: "là-bas", dutch: "daar, daarginds", section: "Geld" },
  { french: "tout le monde", dutch: "iedereen", section: "Geld" },
  { french: "les affaires (f)", dutch: "de spullen", section: "Geld" },
  { french: "marrant(e)", dutch: "grappig", section: "Geld" },
  { french: "enthousiaste", dutch: "enthousiast", section: "Geld" },
  { french: "terrible", dutch: "vreselijk", section: "Geld" },
  { french: "le tableau", dutch: "het schilderij", section: "Geld" },
  { french: "volé", dutch: "gestolen", section: "Geld" },
  { french: "vrai", dutch: "waar", section: "Geld" },
  { french: "nul/nulle", dutch: "slecht / waardeloos", section: "Geld" },
  { french: "je finis", dutch: "ik eindig / ben klaar", section: "Geld" },
  { french: "travailler", dutch: "werken", section: "Geld" },
  { french: "encore", dutch: "nog", section: "Geld" },
  { french: "rentrer", dutch: "thuiskomen", section: "Geld" },
  // Section F
  { french: "faire", dutch: "maken / doen", section: "Geld 2" },
  { french: "aimer", dutch: "houden van", section: "Geld 2" },
  { french: "oublier", dutch: "vergeten", section: "Geld 2" },
  { french: "la langue", dutch: "de taal", section: "Geld 2" },
  { french: "la récré", dutch: "de pauze", section: "Geld 2" },
  { french: "la matière", dutch: "het vak", section: "Geld 2" },
  { french: "l'élève (m/v)", dutch: "de leerling", section: "Geld 2" },
  { french: "l'avenir (m)", dutch: "de toekomst", section: "Geld 2" },
  { french: "en retard", dutch: "te laat", section: "Geld 2" },
  { french: "à l'heure", dutch: "op tijd", section: "Geld 2" },
  { french: "bien sûr", dutch: "natuurlijk", section: "Geld 2" },
  { french: "paresseux/paresseuse", dutch: "lui", section: "Geld 2" },
  { french: "sérieux/sérieuse", dutch: "serieus", section: "Geld 2" },
  { french: "bon/bonne", dutch: "goed", section: "Geld 2" },
  { french: "formidable", dutch: "fantastisch", section: "Geld 2" },
  { french: "intéressant(e)", dutch: "interessant", section: "Geld 2" },
  // Section G – Parler des matières et des profs (zinnen)
  { french: "Tu aimes la géographie?", dutch: "Houd je van aardrijkskunde?", section: "Vrije tijd" },
  { french: "Oui, j'aime la géographie.", dutch: "Ja, ik houd van aardrijkskunde.", section: "Vrije tijd" },
  { french: "Non, je n'aime pas la géographie.", dutch: "Nee, ik houd niet van aardrijkskunde.", section: "Vrije tijd" },
  { french: "Quelle est ta matière préférée?", dutch: "Wat is jouw lievelingsvak?", section: "Vrije tijd" },
  { french: "Le français est ma matière préférée.", dutch: "Frans is mijn lievelingsvak.", section: "Vrije tijd" },
  { french: "Qui est ton prof de français?", dutch: "Wie is je leraar Frans?", section: "Vrije tijd" },
  { french: "C'est monsieur Duval.", dutch: "Het is meneer Duval.", section: "Vrije tijd" },
  { french: "Il est sévère?", dutch: "Is hij streng?", section: "Vrije tijd" },
  { french: "Non, il est sympa.", dutch: "Nee, hij is aardig.", section: "Vrije tijd" },
];

const chapitre5Words: VocabItem[] = [
  // Section A
  { french: "parler", dutch: "praten", section: "Sport" },
  { french: "passer", dutch: "doorbrengen", section: "Sport" },
  { french: "manger", dutch: "eten", section: "Sport" },
  { french: "rigoler", dutch: "lachen / lol maken", section: "Sport" },
  { french: "rencontrer", dutch: "ontmoeten", section: "Sport" },
  { french: "le grand-père", dutch: "de grootvader", section: "Sport" },
  { french: "la grand-mère", dutch: "de grootmoeder", section: "Sport" },
  { french: "l'oncle", dutch: "de oom", section: "Sport" },
  { french: "le voisin", dutch: "de buurman", section: "Sport" },
  { french: "la voisine", dutch: "de buurvrouw", section: "Sport" },
  { french: "le cousin", dutch: "de neef", section: "Sport" },
  { french: "la cousine", dutch: "de nicht", section: "Sport" },
  { french: "prochain(e)", dutch: "volgende", section: "Sport" },
  { french: "qui", dutch: "wie", section: "Sport" },
  { french: "pourquoi", dutch: "waarom", section: "Sport" },
  { french: "chez", dutch: "bij", section: "Sport" },
  // Section B
  { french: "janvier", dutch: "januari", section: "Balsport" },
  { french: "février", dutch: "februari", section: "Balsport" },
  { french: "mars", dutch: "maart", section: "Balsport" },
  { french: "avril", dutch: "april", section: "Balsport" },
  { french: "mai", dutch: "mei", section: "Balsport" },
  { french: "juin", dutch: "juni", section: "Balsport" },
  { french: "juillet", dutch: "juli", section: "Balsport" },
  { french: "aout", dutch: "augustus", section: "Balsport" },
  { french: "septembre", dutch: "september", section: "Balsport" },
  { french: "octobre", dutch: "oktober", section: "Balsport" },
  { french: "novembre", dutch: "november", section: "Balsport" },
  { french: "décembre", dutch: "december", section: "Balsport" },
  { french: "cette année", dutch: "dit jaar", section: "Balsport" },
  { french: "longtemps", dutch: "lang (tijd)", section: "Balsport" },
  { french: "bien sûr", dutch: "natuurlijk", section: "Balsport" },
  { french: "refuser", dutch: "weigeren", section: "Balsport" },
  { french: "demander", dutch: "vragen", section: "Balsport" },
  { french: "je peux", dutch: "ik kan", section: "Balsport" },
  { french: "l'argent (m)", dutch: "het geld", section: "Balsport" },
  { french: "le jardin", dutch: "de tuin", section: "Balsport" },
  // Section C – Parler de ses activités
  { french: "Tu as passé un bon weekend?", dutch: "Heb je een leuk weekend gehad?", section: "Werk" },
  { french: "Oui, j'ai regardé un film avec Simon.", dutch: "Ja, ik heb een film gekeken met Simon.", section: "Werk" },
  { french: "C'est qui, Simon?", dutch: "Wie is dat, Simon?", section: "Werk" },
  { french: "C'est mon copain.", dutch: "Het is mijn vriend.", section: "Werk" },
  { french: "Tu as quel âge?", dutch: "Hoe oud ben jij?", section: "Werk" },
  { french: "J'ai treize ans.", dutch: "Ik ben dertien jaar.", section: "Werk" },
  { french: "Mon anniversaire, c'est le 11 mars.", dutch: "Ik ben op 11 maart jarig.", section: "Werk" },
  // Section E
  { french: "le frère", dutch: "de broer", section: "Geld" },
  { french: "la sœur", dutch: "de zus", section: "Geld" },
  { french: "je vois", dutch: "ik zie", section: "Geld" },
  { french: "porter", dutch: "dragen", section: "Geld" },
  { french: "rouge", dutch: "rood", section: "Geld" },
  { french: "vert(e)", dutch: "groen", section: "Geld" },
  { french: "noir(e)", dutch: "zwart", section: "Geld" },
  { french: "bleu(e)", dutch: "blauw", section: "Geld" },
  { french: "gris(e)", dutch: "grijs", section: "Geld" },
  { french: "blond(e)", dutch: "blond", section: "Geld" },
  { french: "grand(e)", dutch: "groot", section: "Geld" },
  { french: "petit(e)", dutch: "klein", section: "Geld" },
  { french: "marron", dutch: "bruin (ogen)", section: "Geld" },
  { french: "les yeux (m mv)", dutch: "de ogen", section: "Geld" },
  { french: "les cheveux (m mv)", dutch: "het haar", section: "Geld" },
  { french: "les lunettes (v mv)", dutch: "de bril", section: "Geld" },
  // Section F
  { french: "la question", dutch: "de vraag", section: "Geld 2" },
  { french: "le jour", dutch: "de dag", section: "Geld 2" },
  { french: "le foot", dutch: "voetbal", section: "Geld 2" },
  { french: "changer", dutch: "veranderen", section: "Geld 2" },
  { french: "même", dutch: "zelfs", section: "Geld 2" },
  { french: "depuis", dutch: "sinds", section: "Geld 2" },
  { french: "par exemple", dutch: "bijvoorbeeld", section: "Geld 2" },
  { french: "souvent", dutch: "vaak", section: "Geld 2" },
  { french: "calme", dutch: "rustig", section: "Geld 2" },
  { french: "sportif/sportive", dutch: "sportief", section: "Geld 2" },
  { french: "triste", dutch: "triest", section: "Geld 2" },
  { french: "drôle", dutch: "grappig", section: "Geld 2" },
  { french: "mince", dutch: "slank", section: "Geld 2" },
  { french: "timide", dutch: "verlegen", section: "Geld 2" },
  { french: "meilleur(e)", dutch: "beste", section: "Geld 2" },
  { french: "un peu", dutch: "een beetje", section: "Geld 2" },
  // Section G – Décrire quelqu'un
  { french: "Ton frère est comment?", dutch: "Hoe is je broer?", section: "Vrije tijd" },
  { french: "Mon frère a les cheveux bruns.", dutch: "Mijn broer heeft bruin haar.", section: "Vrije tijd" },
  { french: "Il a les yeux bleus.", dutch: "Hij heeft blauwe ogen.", section: "Vrije tijd" },
  { french: "Il porte des lunettes.", dutch: "Hij draagt een bril.", section: "Vrije tijd" },
  { french: "Il est grand?", dutch: "Is hij groot?", section: "Vrije tijd" },
  { french: "Non, il est petit.", dutch: "Nee, hij is klein.", section: "Vrije tijd" },
  { french: "Il est sympa?", dutch: "Is hij aardig?", section: "Vrije tijd" },
  { french: "Oui, et il est drôle.", dutch: "Ja, en hij is grappig.", section: "Vrije tijd" },
  { french: "Il aime le sport?", dutch: "Houdt hij van sport?", section: "Vrije tijd" },
  { french: "Oui, il aime le foot.", dutch: "Ja, hij houdt van voetbal.", section: "Vrije tijd" },
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

// ─── Numbers 1-20 (shared by both niveaus) ───
const numbers1to20: VocabItem[] = [
  { french: "un", dutch: "1 (één)", section: "Nummers" },
  { french: "deux", dutch: "2 (twee)", section: "Nummers" },
  { french: "trois", dutch: "3 (drie)", section: "Nummers" },
  { french: "quatre", dutch: "4 (vier)", section: "Nummers" },
  { french: "cinq", dutch: "5 (vijf)", section: "Nummers" },
  { french: "six", dutch: "6 (zes)", section: "Nummers" },
  { french: "sept", dutch: "7 (zeven)", section: "Nummers" },
  { french: "huit", dutch: "8 (acht)", section: "Nummers" },
  { french: "neuf", dutch: "9 (negen)", section: "Nummers" },
  { french: "dix", dutch: "10 (tien)", section: "Nummers" },
  { french: "onze", dutch: "11 (elf)", section: "Nummers" },
  { french: "douze", dutch: "12 (twaalf)", section: "Nummers" },
  { french: "treize", dutch: "13 (dertien)", section: "Nummers" },
  { french: "quatorze", dutch: "14 (veertien)", section: "Nummers" },
  { french: "quinze", dutch: "15 (vijftien)", section: "Nummers" },
  { french: "seize", dutch: "16 (zestien)", section: "Nummers" },
  { french: "dix-sept", dutch: "17 (zeventien)", section: "Nummers" },
  { french: "dix-huit", dutch: "18 (achttien)", section: "Nummers" },
  { french: "dix-neuf", dutch: "19 (negentien)", section: "Nummers" },
  { french: "vingt", dutch: "20 (twintig)", section: "Nummers" },
];

// ─── Havo-VWO Chapitre 1 ───
const havoVwoChapitre1Words: VocabItem[] = [
  // Section A – vocab
  { french: "la France", dutch: "Frankrijk", section: "Sport" },
  { french: "les vacances (v mv)", dutch: "de vakantie", section: "Sport" },
  { french: "la piscine", dutch: "het zwembad", section: "Sport" },
  { french: "un peu", dutch: "een beetje", section: "Sport" },
  { french: "attention", dutch: "pas op", section: "Sport" },
  { french: "je suis", dutch: "ik ben", section: "Sport" },
  { french: "tu parles", dutch: "jij spreekt", section: "Sport" },
  { french: "français", dutch: "Frans", section: "Sport" },
  { french: "salut", dutch: "hoi", section: "Sport" },
  { french: "bonjour", dutch: "hallo, goedendag", section: "Sport" },
  { french: "petit(e)", dutch: "klein", section: "Sport" },
  { french: "grand(e)", dutch: "groot", section: "Sport" },
  { french: "d'accord", dutch: "oké", section: "Sport" },
  { french: "mais", dutch: "maar", section: "Sport" },
  { french: "pour", dutch: "voor", section: "Sport" },
  { french: "et", dutch: "en", section: "Sport" },
  { french: "bien", dutch: "goed", section: "Sport" },
  { french: "j'aime", dutch: "ik vind (het) leuk", section: "Sport" },
  { french: "on joue", dutch: "wij spelen", section: "Sport" },
  { french: "j'habite", dutch: "ik woon", section: "Sport" },
  // Section A – zinnen
  { french: "Comment tu t'appelles?", dutch: "Hoe heet jij?", section: "Sport" },
  { french: "Je m'appelle Roos.", dutch: "Ik heet Roos.", section: "Sport" },
  { french: "Tu habites où?", dutch: "Waar woon jij?", section: "Sport" },
  { french: "J'habite à Zwolle.", dutch: "Ik woon in Zwolle.", section: "Sport" },
  // Section B – vocab
  { french: "la famille", dutch: "de familie, het gezin", section: "Balsport" },
  { french: "le frère", dutch: "de broer", section: "Balsport" },
  { french: "la sœur", dutch: "de zus", section: "Balsport" },
  { french: "le chien", dutch: "de hond", section: "Balsport" },
  { french: "le chat", dutch: "de kat", section: "Balsport" },
  { french: "le poisson", dutch: "de vis", section: "Balsport" },
  { french: "le jour", dutch: "de dag", section: "Balsport" },
  { french: "la fille", dutch: "het meisje", section: "Balsport" },
  { french: "le garçon", dutch: "de jongen", section: "Balsport" },
  { french: "le copain", dutch: "de vriend", section: "Balsport" },
  { french: "la tente", dutch: "de tent", section: "Balsport" },
  { french: "il y a", dutch: "er is, er zijn", section: "Balsport" },
  { french: "ici", dutch: "hier", section: "Balsport" },
  { french: "aussi", dutch: "ook", section: "Balsport" },
  { french: "pourquoi", dutch: "waarom", section: "Balsport" },
  { french: "donc", dutch: "dus", section: "Balsport" },
  { french: "on reste", dutch: "wij blijven", section: "Balsport" },
  { french: "c'est", dutch: "het is", section: "Balsport" },
  { french: "bon appétit", dutch: "eet smakelijk", section: "Balsport" },
  { french: "et toi?", dutch: "en jij?", section: "Balsport" },
  // Section C – vocab
  { french: "la plage", dutch: "het strand", section: "Werk" },
  { french: "la mer", dutch: "de zee", section: "Werk" },
  { french: "le problème", dutch: "het probleem", section: "Werk" },
  { french: "le message", dutch: "het bericht", section: "Werk" },
  { french: "le truc", dutch: "het ding", section: "Werk" },
  { french: "regarde", dutch: "kijk", section: "Werk" },
  { french: "aider", dutch: "helpen", section: "Werk" },
  { french: "on adore", dutch: "wij zijn gek op", section: "Werk" },
  { french: "merci", dutch: "bedankt", section: "Werk" },
  { french: "de rien", dutch: "niets te danken", section: "Werk" },
  { french: "aujourd'hui", dutch: "vandaag", section: "Werk" },
  { french: "demain", dutch: "morgen", section: "Werk" },
  { french: "voilà", dutch: "hier is, hier zijn", section: "Werk" },
  { french: "alors", dutch: "dan", section: "Werk" },
  { french: "peut-être", dutch: "misschien", section: "Werk" },
  { french: "beaucoup", dutch: "veel", section: "Werk" },
  { french: "dans", dutch: "in", section: "Werk" },
  { french: "quelque chose", dutch: "iets", section: "Werk" },
  { french: "beau", dutch: "mooi", section: "Werk" },
  { french: "super", dutch: "super", section: "Werk" },
  // Section C – zinnen
  { french: "Quel est ton numéro de téléphone?", dutch: "Wat is jouw telefoonnummer?", section: "Werk" },
  { french: "Mon numéro, c'est le 06-14 07 18 5.", dutch: "Mijn nummer is 06-14 07 18 5.", section: "Werk" },
  { french: "Et toi, tu as quel âge?", dutch: "En jij, hoe oud ben jij?", section: "Werk" },
  { french: "Moi, j'ai 12 ans.", dutch: "Ik ben 12 jaar.", section: "Werk" },
  // Section D – vocab
  { french: "le père", dutch: "de vader", section: "Beroepen" },
  { french: "la mère", dutch: "de moeder", section: "Beroepen" },
  { french: "le cousin", dutch: "de neef", section: "Beroepen" },
  { french: "la cousine", dutch: "de nicht", section: "Beroepen" },
  { french: "l'oncle (m)", dutch: "de oom", section: "Beroepen" },
  { french: "la tante", dutch: "de tante", section: "Beroepen" },
  { french: "le grand-père", dutch: "de grootvader", section: "Beroepen" },
  { french: "la grand-mère", dutch: "de grootmoeder", section: "Beroepen" },
  { french: "le jardin", dutch: "de tuin", section: "Beroepen" },
  { french: "la photo", dutch: "de foto", section: "Beroepen" },
  { french: "la musique", dutch: "de muziek", section: "Beroepen" },
  { french: "le dessin", dutch: "de tekening", section: "Beroepen" },
  { french: "le prix", dutch: "de prijs", section: "Beroepen" },
  { french: "drôle", dutch: "grappig", section: "Beroepen" },
  { french: "fou", dutch: "gek", section: "Beroepen" },
  { french: "on rigole", dutch: "wij lachen", section: "Beroepen" },
  { french: "souvent", dutch: "vaak", section: "Beroepen" },
  { french: "toujours", dutch: "altijd", section: "Beroepen" },
  { french: "avec", dutch: "met", section: "Beroepen" },
  { french: "vraiment", dutch: "echt", section: "Beroepen" },
  // Section D – zinnen
  { french: "Tu as un frère?", dutch: "Heb je een broer?", section: "Beroepen" },
  { french: "Oui, j'ai un frère, Romain.", dutch: "Ja, ik heb een broer, Romain.", section: "Beroepen" },
  { french: "Il a quel âge?", dutch: "Hoe oud is hij?", section: "Beroepen" },
  { french: "Il a 13 ans.", dutch: "Hij is 13 jaar.", section: "Beroepen" },
  { french: "Au revoir.", dutch: "Tot ziens.", section: "Beroepen" },
  { french: "À plus.", dutch: "Tot later.", section: "Beroepen" },
  // Section E – Se présenter (zinnen)
  { french: "Bonjour, ça va?", dutch: "Hallo, hoe gaat het?", section: "Geld" },
  { french: "Ça va bien, et toi?", dutch: "Het gaat goed, en met jou?", section: "Geld" },
  { french: "Comment tu t'appelles?", dutch: "Hoe heet jij?", section: "Geld" },
  { french: "Je m'appelle Roos.", dutch: "Ik heet Roos.", section: "Geld" },
  { french: "Tu habites où?", dutch: "Waar woon jij?", section: "Geld" },
  { french: "J'habite à Zwolle.", dutch: "Ik woon in Zwolle.", section: "Geld" },
  { french: "C'est quoi?", dutch: "Wat is dat?", section: "Geld" },
  { french: "C'est un chien.", dutch: "Dat is een hond.", section: "Geld" },
  // Section G – Parler de ta famille (zinnen)
  { french: "Tu as un frère?", dutch: "Heb je een broer?", section: "Vrije tijd" },
  { french: "Oui, j'ai un frère, Romain.", dutch: "Ja, ik heb een broer, Romain.", section: "Vrije tijd" },
  { french: "Il a quel âge?", dutch: "Hoe oud is hij?", section: "Vrije tijd" },
  { french: "Il a 13 ans.", dutch: "Hij is 13 jaar.", section: "Vrije tijd" },
  { french: "Et toi, tu as quel âge?", dutch: "En jij, hoe oud ben jij?", section: "Vrije tijd" },
  { french: "Moi, j'ai 12 ans.", dutch: "Ik ben 12 jaar.", section: "Vrije tijd" },
  { french: "Quel est ton numéro de téléphone?", dutch: "Wat is jouw telefoonnummer?", section: "Vrije tijd" },
  { french: "Mon numéro, c'est le 06-14 07 18 5.", dutch: "Mijn nummer is 06-14 07 18 5.", section: "Vrije tijd" },
  { french: "Au revoir.", dutch: "Tot ziens.", section: "Vrije tijd" },
  { french: "À plus.", dutch: "Tot later.", section: "Vrije tijd" },
  // Nummers 1-20
  ...numbers1to20,
];

// ─── Chapter lists per language ───

// vmbo-havo chapters (the original/existing ones) — add numbers to chapitre1
const vmboHavoChapitre1WithNumbers = [...chapitre1Words, ...numbers1to20];

export const frenchChaptersVmboHavo: Chapter[] = [
  {
    id: "chapitre1",
    title: "Chapitre 1",
    description: "Kennismaken, dieren & familie",
    words: vmboHavoChapitre1WithNumbers,
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

export const frenchChaptersHavoVwo: Chapter[] = [
  {
    id: "hv_chapitre1",
    title: "Chapitre 1",
    description: "Kennismaken, familie & dagelijks leven",
    words: havoVwoChapitre1Words,
    requiresLogin: false,
  },
];

// Keep backward compat
export const frenchChapters: Chapter[] = frenchChaptersVmboHavo;

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
  // Section A - Sport
  { french: "athlete", dutch: "atleet; sporter", section: "Sport" },
  { french: "to beat", dutch: "verslaan", section: "Sport" },
  { french: "champion", dutch: "kampioen", section: "Sport" },
  { french: "court", dutch: "speelveld (afgesloten ruimte)", section: "Sport" },
  { french: "field", dutch: "speelveld (open ruimte)", section: "Sport" },
  { french: "goalie", dutch: "doelman; doelvrouw", section: "Sport" },
  { french: "gymnastics", dutch: "turnen", section: "Sport" },
  { french: "ice rink", dutch: "ijsbaan", section: "Sport" },
  { french: "(to be) in shape", dutch: "fit; in vorm zijn", section: "Sport" },
  { french: "martial arts", dutch: "vechtsport", section: "Sport" },
  { french: "match (UK); game (US)", dutch: "wedstrijd", section: "Sport" },
  { french: "player", dutch: "speler", section: "Sport" },
  { french: "referee", dutch: "scheidsrechter", section: "Sport" },
  { french: "rule", dutch: "(spel)regel", section: "Sport" },
  { french: "to skate", dutch: "schaatsen", section: "Sport" },
  { french: "to work out", dutch: "sporten; fitnessen", section: "Sport" },
  { french: "goal", dutch: "doel; doelpunt", section: "Sport" },
  // Section B - Sport 2
  { french: "atletiek", dutch: "athletics; track and field (US)", section: "Balsport" },
  { french: "bal", dutch: "ball", section: "Balsport" },
  { french: "basketball", dutch: "basketball", section: "Balsport" },
  { french: "gooien", dutch: "to throw", section: "Balsport" },
  { french: "helm", dutch: "helmet", section: "Balsport" },
  { french: "honkbal", dutch: "baseball", section: "Balsport" },
  { french: "knuppel", dutch: "bat", section: "Balsport" },
  { french: "racket", dutch: "racket", section: "Balsport" },
  { french: "schoppen", dutch: "to kick", section: "Balsport" },
  { french: "scoren", dutch: "to score", section: "Balsport" },
  { french: "slaan", dutch: "to hit", section: "Balsport" },
  { french: "stick", dutch: "stick", section: "Balsport" },
  { french: "(tafel)tennis", dutch: "(table) tennis", section: "Balsport" },
  { french: "vangen", dutch: "to catch", section: "Balsport" },
  { french: "veldhockey; ijshockey", dutch: "field hockey; (ice) hockey", section: "Balsport" },
  { french: "verliezen", dutch: "to lose", section: "Balsport" },
  { french: "volleybal", dutch: "volleyball", section: "Balsport" },
  { french: "winnen", dutch: "to win", section: "Balsport" },
  // Section C - Werk
  { french: "company", dutch: "bedrijf", section: "Werk" },
  { french: "customer", dutch: "klant", section: "Werk" },
  { french: "employee", dutch: "werknemer", section: "Werk" },
  { french: "employer", dutch: "werkgever", section: "Werk" },
  { french: "job application (form)", dutch: "sollicitatie(formulier)", section: "Werk" },
  { french: "job interview", dutch: "sollicitatiegesprek", section: "Werk" },
  { french: "office", dutch: "kantoor", section: "Werk" },
  { french: "to quit", dutch: "ontslag nemen", section: "Werk" },
  { french: "volunteer", dutch: "vrijwilliger", section: "Werk" },
  // Section D - Beroepen
  { french: "advocaat", dutch: "lawyer", section: "Beroepen" },
  { french: "baas", dutch: "boss", section: "Beroepen" },
  { french: "brandweerman/-vrouw", dutch: "fire-fighter", section: "Beroepen" },
  { french: "(vrachtwagen-/bus-/taxi-)chauffeur", dutch: "(truck, bus, taxi) driver", section: "Beroepen" },
  { french: "chef-kok", dutch: "chef", section: "Beroepen" },
  { french: "dierenarts", dutch: "vet", section: "Beroepen" },
  { french: "dokter", dutch: "doctor", section: "Beroepen" },
  { french: "ingenieur", dutch: "engineer", section: "Beroepen" },
  { french: "kapper", dutch: "hairdresser", section: "Beroepen" },
  { french: "krantenbezorger", dutch: "newspaper carrier", section: "Beroepen" },
  { french: "oppas", dutch: "babysitter", section: "Beroepen" },
  { french: "piloot", dutch: "pilot", section: "Beroepen" },
  { french: "politieagent", dutch: "police officer", section: "Beroepen" },
  { french: "tandarts", dutch: "dentist", section: "Beroepen" },
  { french: "vakkenvuller", dutch: "shelf stocker", section: "Beroepen" },
  { french: "verpleegkundige", dutch: "nurse", section: "Beroepen" },
  { french: "winkelassistent", dutch: "shop assistant", section: "Beroepen" },
  // Section E - Geld 1
  { french: "amount", dutch: "hoeveelheid; bedrag", section: "Geld" },
  { french: "bank account", dutch: "bankrekening", section: "Geld" },
  { french: "bank machine (UK); ATM (US)", dutch: "geldautomaat", section: "Geld" },
  { french: "banknote (UK); bill (US)", dutch: "bankbiljet", section: "Geld" },
  { french: "to borrow", dutch: "lenen (van)", section: "Geld" },
  { french: "(to be) broke", dutch: "blut", section: "Geld" },
  { french: "debit card", dutch: "bankpas", section: "Geld" },
  { french: "coin", dutch: "munt", section: "Geld" },
  { french: "dime (US)", dutch: "dubbeltje", section: "Geld" },
  { french: "discount", dutch: "korting", section: "Geld" },
  { french: "to lend", dutch: "uitlenen", section: "Geld" },
  { french: "nickel (US)", dutch: "munt van vijf cent", section: "Geld" },
  { french: "to pay back", dutch: "terugbetalen", section: "Geld" },
  { french: "piggy bank", dutch: "spaarvarken", section: "Geld" },
  { french: "receipt", dutch: "kassabon", section: "Geld" },
  { french: "to sell", dutch: "verkopen", section: "Geld" },
  { french: "to withdraw", dutch: "opnemen (geld)", section: "Geld" },
  // Section F - Geld 2
  { french: "arm", dutch: "poor", section: "Geld 2" },
  { french: "betalen (voor)", dutch: "to pay (for)", section: "Geld 2" },
  { french: "cent", dutch: "penny; cent (US)", section: "Geld 2" },
  { french: "centen (UK)", dutch: "pence", section: "Geld 2" },
  { french: "contant geld", dutch: "cash", section: "Geld 2" },
  { french: "gratis", dutch: "free", section: "Geld 2" },
  { french: "inkomen", dutch: "income", section: "Geld 2" },
  { french: "kosten", dutch: "to cost", section: "Geld 2" },
  { french: "pond", dutch: "pound", section: "Geld 2" },
  { french: "portemonnee", dutch: "wallet; purse (UK)", section: "Geld 2" },
  { french: "prijs", dutch: "price; cost", section: "Geld 2" },
  { french: "rijk", dutch: "rich", section: "Geld 2" },
  { french: "salaris", dutch: "salary", section: "Geld 2" },
  { french: "sparen", dutch: "to save (up for)", section: "Geld 2" },
  { french: "uitgeven", dutch: "to spend", section: "Geld 2" },
  { french: "wisselgeld; muntgeld", dutch: "change", section: "Geld 2" },
  { french: "zakgeld", dutch: "pocket money (UK); allowance (US)", section: "Geld 2" },
  // Section G - Vrije tijd 1
  { french: "coffee shop", dutch: "café", section: "Vrije tijd" },
  { french: "entrance fee", dutch: "toegangsprijs", section: "Vrije tijd" },
  { french: "to get a bite to eat", dutch: "een hapje eten", section: "Vrije tijd" },
  { french: "(to be) grounded", dutch: "huisarrest (hebben)", section: "Vrije tijd" },
  { french: "to have a good time", dutch: "plezier hebben; zich vermaken", section: "Vrije tijd" },
  { french: "ice cream parlour", dutch: "ijssalon", section: "Vrije tijd" },
  { french: "play", dutch: "toneelstuk", section: "Vrije tijd" },
  { french: "ride", dutch: "attractie", section: "Vrije tijd" },
  { french: "roller coaster", dutch: "achtbaan", section: "Vrije tijd" },
  { french: "zoo", dutch: "dierentuin", section: "Vrije tijd" },
  // Section H - Vrije tijd 2
  { french: "afspreken", dutch: "to meet (up)", section: "Vrije tijd 2" },
  { french: "barbecue", dutch: "barbecue", section: "Vrije tijd 2" },
  { french: "bowlen", dutch: "bowling", section: "Vrije tijd 2" },
  { french: "genieten", dutch: "to enjoy (oneself)", section: "Vrije tijd 2" },
  { french: "kermis", dutch: "funfair (UK); carnival (US)", section: "Vrije tijd 2" },
  { french: "logeerpartij", dutch: "sleepover", section: "Vrije tijd 2" },
  { french: "picknick", dutch: "picnic", section: "Vrije tijd 2" },
  { french: "plannen hebben", dutch: "to have plans", section: "Vrije tijd 2" },
  { french: "plezier", dutch: "fun", section: "Vrije tijd 2" },
  { french: "pretpark", dutch: "amusement park", section: "Vrije tijd 2" },
  { french: "restaurant", dutch: "restaurant", section: "Vrije tijd 2" },
  { french: "strand", dutch: "beach", section: "Vrije tijd 2" },
  { french: "thuisblijven", dutch: "to stay in", section: "Vrije tijd 2" },
  { french: "tijd doorbrengen met", dutch: "to hang out with", section: "Vrije tijd 2" },
  { french: "uitgaan (met); daten", dutch: "to go out (with)", section: "Vrije tijd 2" },
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
    description: "Sport, werk & vrije tijd",
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

export function getChaptersForLanguage(lang: Language, niveau?: Niveau): Chapter[] {
  if (lang === "french") {
    if (niveau === "havo-vwo") return frenchChaptersHavoVwo;
    return frenchChaptersVmboHavo;
  }
  if (lang === "english") return englishChapters;
  if (lang === "biology") return biologyChapters;
  return naskChapters;
}

export function getDefaultChapterId(lang: Language, niveau?: Niveau): string {
  if (lang === "french") {
    if (niveau === "havo-vwo") return "hv_chapitre1";
    return "chapitre3";
  }
  if (lang === "english") return "en_chapter1";
  if (lang === "biology") return "bio_chapter4";
  return "nask_chapter1";
}

// Keep `chapters` as backward compat (french)
export const chapters = frenchChapters;

export const DEFAULT_CHAPTER_ID = "chapitre3";

export function getChapter(id: string): Chapter | undefined {
  return [...frenchChaptersVmboHavo, ...frenchChaptersHavoVwo, ...englishChapters, ...naskChapters, ...biologyChapters].find((c) => c.id === id);
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
