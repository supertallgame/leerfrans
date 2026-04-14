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
  // Section B – vocab block 2
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
  // Section C – Se présenter (zinnen)
  { french: "Bonjour, ça va?", dutch: "Hallo, hoe gaat het?", section: "C" },
  { french: "Ça va bien.", dutch: "Het gaat goed.", section: "C" },
  { french: "Je m'appelle Léa. Et toi?", dutch: "Ik heet Léa. En jij?", section: "C" },
  { french: "Je m'appelle Noah.", dutch: "Ik heet Noah.", section: "C" },
  { french: "Tu habites où?", dutch: "Waar woon jij?", section: "C" },
  { french: "J'habite à Paris.", dutch: "Ik woon in Parijs.", section: "C" },
  { french: "Tu as un chien?", dutch: "Heb jij een hond?", section: "C" },
  { french: "Oui, j'ai un chien, Hector.", dutch: "Ja, ik heb een hond, Hector.", section: "C" },
  // Section E – vocab block 3
  { french: "la mer", dutch: "de zee", section: "E" },
  { french: "le message", dutch: "het bericht", section: "E" },
  { french: "le problème", dutch: "het probleem", section: "E" },
  { french: "aujourd'hui", dutch: "vandaag", section: "E" },
  { french: "c'est quoi?", dutch: "Wat is dat?", section: "E" },
  { french: "ici", dutch: "hier", section: "E" },
  { french: "presque", dutch: "bijna", section: "E" },
  { french: "alors", dutch: "dus, dan", section: "E" },
  { french: "bizarre", dutch: "vreemd", section: "E" },
  { french: "mais", dutch: "maar", section: "E" },
  { french: "quelque chose", dutch: "iets", section: "E" },
  { french: "il y a", dutch: "er is / er zijn", section: "E" },
  { french: "on adore", dutch: "wij zijn dol op", section: "E" },
  { french: "aider", dutch: "helpen", section: "E" },
  { french: "peut-être", dutch: "misschien", section: "E" },
  { french: "ensemble", dutch: "samen", section: "E" },
  // Section F – vocab block 4
  { french: "le portable", dutch: "het mobieltje", section: "F" },
  { french: "le pays", dutch: "het land", section: "F" },
  { french: "petit(e)", dutch: "klein", section: "F" },
  { french: "grand(e)", dutch: "groot", section: "F" },
  { french: "il passe", dutch: "hij brengt door", section: "F" },
  { french: "il reste", dutch: "hij blijft", section: "F" },
  { french: "donc", dutch: "dus", section: "F" },
  { french: "chouette", dutch: "te gek", section: "F" },
  { french: "voilà", dutch: "alstublieft (als je iets geeft)", section: "F" },
  { french: "la famille", dutch: "de familie", section: "F" },
  { french: "mon père", dutch: "mijn vader", section: "F" },
  { french: "ma mère", dutch: "mijn moeder", section: "F" },
  { french: "la sœur", dutch: "de zus", section: "F" },
  { french: "le frère", dutch: "de broer", section: "F" },
  { french: "le cousin", dutch: "de neef", section: "F" },
  { french: "la cousine", dutch: "de nicht", section: "F" },
  // Section G – Parler de toi (zinnen)
  { french: "Tu as quel âge?", dutch: "Hoe oud ben jij?", section: "G" },
  { french: "J'ai treize ans.", dutch: "Ik ben dertien jaar.", section: "G" },
  { french: "Tu as un frère?", dutch: "Heb jij een broer?", section: "G" },
  { french: "Oui, j'ai un frère, Romain.", dutch: "Ja, ik heb een broer, Romain.", section: "G" },
  { french: "Quel est ton numéro de téléphone?", dutch: "Wat is je telefoonnummer?", section: "G" },
  { french: "Mon numéro, c'est le 06-12 06 11 7.", dutch: "Mijn nummer is 06-12 06 11 7.", section: "G" },
  { french: "Au revoir!", dutch: "Tot ziens.", section: "G" },
];

const chapitre2Words: VocabItem[] = [
  // Section A
  { french: "aimer", dutch: "houden van", section: "A" },
  { french: "préférer", dutch: "liever hebben", section: "A" },
  { french: "adorer", dutch: "dol zijn op", section: "A" },
  { french: "détester", dutch: "een hekel hebben aan", section: "A" },
  { french: "mais", dutch: "maar", section: "A" },
  { french: "quoi", dutch: "wat", section: "A" },
  { french: "et", dutch: "en", section: "A" },
  { french: "je prends", dutch: "ik neem", section: "A" },
  { french: "manger", dutch: "eten", section: "A" },
  { french: "la pizza", dutch: "de pizza", section: "A" },
  { french: "la crêpe", dutch: "de pannenkoek", section: "A" },
  { french: "le pain", dutch: "het brood", section: "A" },
  { french: "la tomate", dutch: "de tomaat", section: "A" },
  { french: "le chocolat", dutch: "de chocola(de)", section: "A" },
  { french: "le thé", dutch: "de thee", section: "A" },
  { french: "le coca", dutch: "de cola", section: "A" },
  // Section B
  { french: "avec", dutch: "met", section: "B" },
  { french: "après", dutch: "na / daarna", section: "B" },
  { french: "aussi", dutch: "ook", section: "B" },
  { french: "d'accord", dutch: "oké", section: "B" },
  { french: "ce soir", dutch: "vanavond", section: "B" },
  { french: "acheter", dutch: "kopen", section: "B" },
  { french: "préparer", dutch: "voorbereiden / maken", section: "B" },
  { french: "tu veux", dutch: "je wilt", section: "B" },
  { french: "le repas", dutch: "de maaltijd", section: "B" },
  { french: "le beurre", dutch: "de boter", section: "B" },
  { french: "l'ognon (m)", dutch: "de ui", section: "B" },
  { french: "bon / bonne", dutch: "lekker", section: "B" },
  { french: "le fromage", dutch: "de kaas", section: "B" },
  { french: "l'œuf (m)", dutch: "het ei", section: "B" },
  { french: "le légume", dutch: "de groente", section: "B" },
  { french: "la viande", dutch: "het vlees", section: "B" },
  // Section C – À une terrasse (zinnen)
  { french: "La carte, s'il vous plaît.", dutch: "De kaart alstublieft.", section: "C" },
  { french: "Un coca et une crêpe, s'il vous plaît.", dutch: "Een cola en een pannenkoek alstublieft.", section: "C" },
  { french: "Tu aimes le coca?", dutch: "Houd je van cola?", section: "C" },
  { french: "Oui, j'adore le coca!", dutch: "Ja, ik ben dol op cola!", section: "C" },
  { french: "C'est quoi?", dutch: "Wat is dat?", section: "C" },
  { french: "C'est une quiche.", dutch: "Dat is een hartige taart.", section: "C" },
  { french: "Voilà.", dutch: "Alstublieft. (Als je iets geeft.)", section: "C" },
  { french: "Bon appétit!", dutch: "Eet smakelijk!", section: "C" },
  // Section E
  { french: "l'enfant (m/v)", dutch: "het kind", section: "E" },
  { french: "le (super)marché", dutch: "de (super)markt", section: "E" },
  { french: "le rendez-vous", dutch: "de afspraak", section: "E" },
  { french: "le problème", dutch: "het probleem", section: "E" },
  { french: "demain", dutch: "morgen", section: "E" },
  { french: "célèbre", dutch: "beroemd", section: "E" },
  { french: "important(e)", dutch: "belangrijk", section: "E" },
  { french: "maintenant", dutch: "nu", section: "E" },
  { french: "aider", dutch: "helpen", section: "E" },
  { french: "chercher", dutch: "zoeken", section: "E" },
  { french: "trouver", dutch: "vinden", section: "E" },
  { french: "regarder", dutch: "kijken (naar)", section: "E" },
  { french: "beaucoup", dutch: "veel", section: "E" },
  { french: "toujours", dutch: "altijd", section: "E" },
  { french: "combien", dutch: "hoeveel", section: "E" },
  { french: "j'ai besoin de", dutch: "ik heb nodig", section: "E" },
  // Section F
  { french: "demander", dutch: "vragen", section: "F" },
  { french: "parler", dutch: "praten", section: "F" },
  { french: "possible", dutch: "mogelijk", section: "F" },
  { french: "dans", dutch: "in", section: "F" },
  { french: "marcher", dutch: "lopen", section: "F" },
  { french: "entrer", dutch: "binnenkomen", section: "F" },
  { french: "rester", dutch: "blijven", section: "F" },
  { french: "l'argent (m)", dutch: "het geld", section: "F" },
  { french: "j'ai faim", dutch: "ik heb honger", section: "F" },
  { french: "la boulangerie", dutch: "de bakkerij", section: "F" },
  { french: "le magasin", dutch: "de winkel", section: "F" },
  { french: "le vêtement", dutch: "het kledingstuk", section: "F" },
  { french: "le croissant", dutch: "de croissant", section: "F" },
  { french: "le pain au chocolat", dutch: "het chocoladebroodje", section: "F" },
  { french: "la baguette", dutch: "het stokbrood", section: "F" },
  { french: "fou/folle de", dutch: "gek op", section: "F" },
  // Section G – Acheter quelque chose (zinnen)
  { french: "Vous avez deux croissants?", dutch: "Heeft u twee croissants?", section: "G" },
  { french: "Oui, voilà.", dutch: "Ja, alstublieft.", section: "G" },
  { french: "Je voudrais une baguette.", dutch: "Ik wil graag een stokbrood.", section: "G" },
  { french: "Ça coute combien?", dutch: "Hoeveel kost het?", section: "G" },
  { french: "Ça coute trois euros cinquante.", dutch: "Dat kost drie euro vijftig.", section: "G" },
  { french: "Je ne comprends pas.", dutch: "Ik begrijp het niet.", section: "G" },
  { french: "Trois euros cinquante.", dutch: "Drie euro vijftig.", section: "G" },
  { french: "Merci.", dutch: "Bedankt.", section: "G" },
  { french: "Au revoir!", dutch: "Tot ziens!", section: "G" },
];

const chapitre3Words: VocabItem[] = [
  // Section A
  { french: "l'anglais", dutch: "Engels", section: "A" },
  { french: "le français", dutch: "Frans", section: "A" },
  { french: "le néerlandais", dutch: "Nederlands", section: "A" },
  { french: "les maths", dutch: "wiskunde", section: "A" },
  { french: "la géographie", dutch: "aardrijkskunde", section: "A" },
  { french: "l'histoire", dutch: "geschiedenis", section: "A" },
  { french: "le dessin", dutch: "tekenen", section: "A" },
  { french: "la gym", dutch: "gym", section: "A" },
  { french: "le contrôle", dutch: "de toets", section: "A" },
  { french: "facile", dutch: "makkelijk", section: "A" },
  { french: "difficile", dutch: "moeilijk", section: "A" },
  { french: "fort(e)", dutch: "goed / sterk", section: "A" },
  { french: "vraiment", dutch: "echt / werkelijk", section: "A" },
  { french: "l'école", dutch: "de school", section: "A" },
  { french: "commencer", dutch: "beginnen", section: "A" },
  { french: "rigoler", dutch: "lachen", section: "A" },
  // Section B
  { french: "sévère", dutch: "streng", section: "B" },
  { french: "noter", dutch: "noteren / opschrijven", section: "B" },
  { french: "peut-être", dutch: "misschien", section: "B" },
  { french: "la chambre", dutch: "de kamer", section: "B" },
  { french: "le secret", dutch: "het geheim", section: "B" },
  { french: "les devoirs (m mv)", dutch: "het huiswerk", section: "B" },
  { french: "le sac à dos", dutch: "de rugzak", section: "B" },
  { french: "la trousse", dutch: "het etui", section: "B" },
  { french: "la classe", dutch: "de klas", section: "B" },
  { french: "en quatrième", dutch: "in de tweede klas", section: "B" },
  { french: "trop", dutch: "te / te veel", section: "B" },
  { french: "aujourd'hui", dutch: "vandaag", section: "B" },
  { french: "le/la prof", dutch: "de leraar/de lerares", section: "B" },
  { french: "toujours", dutch: "altijd", section: "B" },
  { french: "sympa", dutch: "aardig", section: "B" },
  { french: "surtout", dutch: "vooral", section: "B" },
  // Section C – Parler de l'école (zinnen)
  { french: "Tu es en quelle classe?", dutch: "In welke klas zit jij?", section: "C" },
  { french: "Je suis en cinquième.", dutch: "Ik zit in de eerste klas.", section: "C" },
  { french: "Tu as quelles matières, le mardi?", dutch: "Welke vakken heb je op dinsdag?", section: "C" },
  { french: "Le mardi, j'ai anglais et géographie.", dutch: "Op dinsdag heb ik Engels en aardrijkskunde.", section: "C" },
  { french: "La récré, c'est à quelle heure?", dutch: "Hoe laat is de pauze?", section: "C" },
  { french: "À dix heures.", dutch: "Om tien uur.", section: "C" },
  { french: "Quelle heure est-il?", dutch: "Hoe laat is het?", section: "C" },
  { french: "Il est neuf heures et demie.", dutch: "Het is half tien.", section: "C" },
  // Section E
  { french: "madame", dutch: "mevrouw", section: "E" },
  { french: "préféré(e)", dutch: "lievelings-", section: "E" },
  { french: "là-bas", dutch: "daar, daarginds", section: "E" },
  { french: "tout le monde", dutch: "iedereen", section: "E" },
  { french: "les affaires (f)", dutch: "de spullen", section: "E" },
  { french: "marrant(e)", dutch: "grappig", section: "E" },
  { french: "enthousiaste", dutch: "enthousiast", section: "E" },
  { french: "terrible", dutch: "vreselijk", section: "E" },
  { french: "le tableau", dutch: "het schilderij", section: "E" },
  { french: "volé", dutch: "gestolen", section: "E" },
  { french: "vrai", dutch: "waar", section: "E" },
  { french: "nul/nulle", dutch: "slecht / waardeloos", section: "E" },
  { french: "je finis", dutch: "ik eindig / ben klaar", section: "E" },
  { french: "travailler", dutch: "werken", section: "E" },
  { french: "encore", dutch: "nog", section: "E" },
  { french: "rentrer", dutch: "thuiskomen", section: "E" },
  // Section F
  { french: "faire", dutch: "maken / doen", section: "F" },
  { french: "aimer", dutch: "houden van", section: "F" },
  { french: "oublier", dutch: "vergeten", section: "F" },
  { french: "la langue", dutch: "de taal", section: "F" },
  { french: "la récré", dutch: "de pauze", section: "F" },
  { french: "la matière", dutch: "het vak", section: "F" },
  { french: "l'élève (m/v)", dutch: "de leerling", section: "F" },
  { french: "l'avenir (m)", dutch: "de toekomst", section: "F" },
  { french: "en retard", dutch: "te laat", section: "F" },
  { french: "à l'heure", dutch: "op tijd", section: "F" },
  { french: "bien sûr", dutch: "natuurlijk", section: "F" },
  { french: "paresseux/paresseuse", dutch: "lui", section: "F" },
  { french: "sérieux/sérieuse", dutch: "serieus", section: "F" },
  { french: "bon/bonne", dutch: "goed", section: "F" },
  { french: "formidable", dutch: "fantastisch", section: "F" },
  { french: "intéressant(e)", dutch: "interessant", section: "F" },
  // Section G – Parler des matières et des profs (zinnen)
  { french: "Tu aimes la géographie?", dutch: "Houd je van aardrijkskunde?", section: "G" },
  { french: "Oui, j'aime la géographie.", dutch: "Ja, ik houd van aardrijkskunde.", section: "G" },
  { french: "Non, je n'aime pas la géographie.", dutch: "Nee, ik houd niet van aardrijkskunde.", section: "G" },
  { french: "Quelle est ta matière préférée?", dutch: "Wat is jouw lievelingsvak?", section: "G" },
  { french: "Le français est ma matière préférée.", dutch: "Frans is mijn lievelingsvak.", section: "G" },
  { french: "Qui est ton prof de français?", dutch: "Wie is je leraar Frans?", section: "G" },
  { french: "C'est monsieur Duval.", dutch: "Het is meneer Duval.", section: "G" },
  { french: "Il est sévère?", dutch: "Is hij streng?", section: "G" },
  { french: "Non, il est sympa.", dutch: "Nee, hij is aardig.", section: "G" },
];

const chapitre5Words: VocabItem[] = [
  // Section A
  { french: "parler", dutch: "praten", section: "A" },
  { french: "passer", dutch: "doorbrengen", section: "A" },
  { french: "manger", dutch: "eten", section: "A" },
  { french: "rigoler", dutch: "lachen / lol maken", section: "A" },
  { french: "rencontrer", dutch: "ontmoeten", section: "A" },
  { french: "le grand-père", dutch: "de grootvader", section: "A" },
  { french: "la grand-mère", dutch: "de grootmoeder", section: "A" },
  { french: "l'oncle", dutch: "de oom", section: "A" },
  { french: "le voisin", dutch: "de buurman", section: "A" },
  { french: "la voisine", dutch: "de buurvrouw", section: "A" },
  { french: "le cousin", dutch: "de neef", section: "A" },
  { french: "la cousine", dutch: "de nicht", section: "A" },
  { french: "prochain(e)", dutch: "volgende", section: "A" },
  { french: "qui", dutch: "wie", section: "A" },
  { french: "pourquoi", dutch: "waarom", section: "A" },
  { french: "chez", dutch: "bij", section: "A" },
  // Section B
  { french: "janvier", dutch: "januari", section: "B" },
  { french: "février", dutch: "februari", section: "B" },
  { french: "mars", dutch: "maart", section: "B" },
  { french: "avril", dutch: "april", section: "B" },
  { french: "mai", dutch: "mei", section: "B" },
  { french: "juin", dutch: "juni", section: "B" },
  { french: "juillet", dutch: "juli", section: "B" },
  { french: "aout", dutch: "augustus", section: "B" },
  { french: "septembre", dutch: "september", section: "B" },
  { french: "octobre", dutch: "oktober", section: "B" },
  { french: "novembre", dutch: "november", section: "B" },
  { french: "décembre", dutch: "december", section: "B" },
  { french: "cette année", dutch: "dit jaar", section: "B" },
  { french: "longtemps", dutch: "lang (tijd)", section: "B" },
  { french: "bien sûr", dutch: "natuurlijk", section: "B" },
  { french: "refuser", dutch: "weigeren", section: "B" },
  { french: "demander", dutch: "vragen", section: "B" },
  { french: "je peux", dutch: "ik kan", section: "B" },
  { french: "l'argent (m)", dutch: "het geld", section: "B" },
  { french: "le jardin", dutch: "de tuin", section: "B" },
  // Section C – Parler de ses activités
  { french: "Tu as passé un bon weekend?", dutch: "Heb je een leuk weekend gehad?", section: "C" },
  { french: "Oui, j'ai regardé un film avec Simon.", dutch: "Ja, ik heb een film gekeken met Simon.", section: "C" },
  { french: "C'est qui, Simon?", dutch: "Wie is dat, Simon?", section: "C" },
  { french: "C'est mon copain.", dutch: "Het is mijn vriend.", section: "C" },
  { french: "Tu as quel âge?", dutch: "Hoe oud ben jij?", section: "C" },
  { french: "J'ai treize ans.", dutch: "Ik ben dertien jaar.", section: "C" },
  { french: "Mon anniversaire, c'est le 11 mars.", dutch: "Ik ben op 11 maart jarig.", section: "C" },
  // Section E
  { french: "le frère", dutch: "de broer", section: "E" },
  { french: "la sœur", dutch: "de zus", section: "E" },
  { french: "je vois", dutch: "ik zie", section: "E" },
  { french: "porter", dutch: "dragen", section: "E" },
  { french: "rouge", dutch: "rood", section: "E" },
  { french: "vert(e)", dutch: "groen", section: "E" },
  { french: "noir(e)", dutch: "zwart", section: "E" },
  { french: "bleu(e)", dutch: "blauw", section: "E" },
  { french: "gris(e)", dutch: "grijs", section: "E" },
  { french: "blond(e)", dutch: "blond", section: "E" },
  { french: "grand(e)", dutch: "groot", section: "E" },
  { french: "petit(e)", dutch: "klein", section: "E" },
  { french: "marron", dutch: "bruin (ogen)", section: "E" },
  { french: "les yeux (m mv)", dutch: "de ogen", section: "E" },
  { french: "les cheveux (m mv)", dutch: "het haar", section: "E" },
  { french: "les lunettes (v mv)", dutch: "de bril", section: "E" },
  // Section F
  { french: "la question", dutch: "de vraag", section: "F" },
  { french: "le jour", dutch: "de dag", section: "F" },
  { french: "le foot", dutch: "voetbal", section: "F" },
  { french: "changer", dutch: "veranderen", section: "F" },
  { french: "même", dutch: "zelfs", section: "F" },
  { french: "depuis", dutch: "sinds", section: "F" },
  { french: "par exemple", dutch: "bijvoorbeeld", section: "F" },
  { french: "souvent", dutch: "vaak", section: "F" },
  { french: "calme", dutch: "rustig", section: "F" },
  { french: "sportif/sportive", dutch: "sportief", section: "F" },
  { french: "triste", dutch: "triest", section: "F" },
  { french: "drôle", dutch: "grappig", section: "F" },
  { french: "mince", dutch: "slank", section: "F" },
  { french: "timide", dutch: "verlegen", section: "F" },
  { french: "meilleur(e)", dutch: "beste", section: "F" },
  { french: "un peu", dutch: "een beetje", section: "F" },
  // Section G – Décrire quelqu'un
  { french: "Ton frère est comment?", dutch: "Hoe is je broer?", section: "G" },
  { french: "Mon frère a les cheveux bruns.", dutch: "Mijn broer heeft bruin haar.", section: "G" },
  { french: "Il a les yeux bleus.", dutch: "Hij heeft blauwe ogen.", section: "G" },
  { french: "Il porte des lunettes.", dutch: "Hij draagt een bril.", section: "G" },
  { french: "Il est grand?", dutch: "Is hij groot?", section: "G" },
  { french: "Non, il est petit.", dutch: "Nee, hij is klein.", section: "G" },
  { french: "Il est sympa?", dutch: "Is hij aardig?", section: "G" },
  { french: "Oui, et il est drôle.", dutch: "Ja, en hij is grappig.", section: "G" },
  { french: "Il aime le sport?", dutch: "Houdt hij van sport?", section: "G" },
  { french: "Oui, il aime le foot.", dutch: "Ja, hij houdt van voetbal.", section: "G" },
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
  { french: "la France", dutch: "Frankrijk", section: "A" },
  { french: "les vacances (v mv)", dutch: "de vakantie", section: "A" },
  { french: "la piscine", dutch: "het zwembad", section: "A" },
  { french: "un peu", dutch: "een beetje", section: "A" },
  { french: "attention", dutch: "pas op", section: "A" },
  { french: "je suis", dutch: "ik ben", section: "A" },
  { french: "tu parles", dutch: "jij spreekt", section: "A" },
  { french: "français", dutch: "Frans", section: "A" },
  { french: "salut", dutch: "hoi", section: "A" },
  { french: "bonjour", dutch: "hallo, goedendag", section: "A" },
  { french: "petit(e)", dutch: "klein", section: "A" },
  { french: "grand(e)", dutch: "groot", section: "A" },
  { french: "d'accord", dutch: "oké", section: "A" },
  { french: "mais", dutch: "maar", section: "A" },
  { french: "pour", dutch: "voor", section: "A" },
  { french: "et", dutch: "en", section: "A" },
  { french: "bien", dutch: "goed", section: "A" },
  { french: "j'aime", dutch: "ik vind (het) leuk", section: "A" },
  { french: "on joue", dutch: "wij spelen", section: "A" },
  { french: "j'habite", dutch: "ik woon", section: "A" },
  // Section A – zinnen
  { french: "Comment tu t'appelles?", dutch: "Hoe heet jij?", section: "A" },
  { french: "Je m'appelle Roos.", dutch: "Ik heet Roos.", section: "A" },
  { french: "Tu habites où?", dutch: "Waar woon jij?", section: "A" },
  { french: "J'habite à Zwolle.", dutch: "Ik woon in Zwolle.", section: "A" },
  // Section B – vocab
  { french: "la famille", dutch: "de familie, het gezin", section: "B" },
  { french: "le frère", dutch: "de broer", section: "B" },
  { french: "la sœur", dutch: "de zus", section: "B" },
  { french: "le chien", dutch: "de hond", section: "B" },
  { french: "le chat", dutch: "de kat", section: "B" },
  { french: "le poisson", dutch: "de vis", section: "B" },
  { french: "le jour", dutch: "de dag", section: "B" },
  { french: "la fille", dutch: "het meisje", section: "B" },
  { french: "le garçon", dutch: "de jongen", section: "B" },
  { french: "le copain", dutch: "de vriend", section: "B" },
  { french: "la tente", dutch: "de tent", section: "B" },
  { french: "il y a", dutch: "er is, er zijn", section: "B" },
  { french: "ici", dutch: "hier", section: "B" },
  { french: "aussi", dutch: "ook", section: "B" },
  { french: "pourquoi", dutch: "waarom", section: "B" },
  { french: "donc", dutch: "dus", section: "B" },
  { french: "on reste", dutch: "wij blijven", section: "B" },
  { french: "c'est", dutch: "het is", section: "B" },
  { french: "bon appétit", dutch: "eet smakelijk", section: "B" },
  { french: "et toi?", dutch: "en jij?", section: "B" },
  // Section C – vocab
  { french: "la plage", dutch: "het strand", section: "C" },
  { french: "la mer", dutch: "de zee", section: "C" },
  { french: "le problème", dutch: "het probleem", section: "C" },
  { french: "le message", dutch: "het bericht", section: "C" },
  { french: "le truc", dutch: "het ding", section: "C" },
  { french: "regarde", dutch: "kijk", section: "C" },
  { french: "aider", dutch: "helpen", section: "C" },
  { french: "on adore", dutch: "wij zijn gek op", section: "C" },
  { french: "merci", dutch: "bedankt", section: "C" },
  { french: "de rien", dutch: "niets te danken", section: "C" },
  { french: "aujourd'hui", dutch: "vandaag", section: "C" },
  { french: "demain", dutch: "morgen", section: "C" },
  { french: "voilà", dutch: "hier is, hier zijn", section: "C" },
  { french: "alors", dutch: "dan", section: "C" },
  { french: "peut-être", dutch: "misschien", section: "C" },
  { french: "beaucoup", dutch: "veel", section: "C" },
  { french: "dans", dutch: "in", section: "C" },
  { french: "quelque chose", dutch: "iets", section: "C" },
  { french: "beau", dutch: "mooi", section: "C" },
  { french: "super", dutch: "super", section: "C" },
  // Section C – zinnen
  { french: "Quel est ton numéro de téléphone?", dutch: "Wat is jouw telefoonnummer?", section: "C" },
  { french: "Mon numéro, c'est le 06-14 07 18 5.", dutch: "Mijn nummer is 06-14 07 18 5.", section: "C" },
  { french: "Et toi, tu as quel âge?", dutch: "En jij, hoe oud ben jij?", section: "C" },
  { french: "Moi, j'ai 12 ans.", dutch: "Ik ben 12 jaar.", section: "C" },
  // Section D – vocab
  { french: "le père", dutch: "de vader", section: "D" },
  { french: "la mère", dutch: "de moeder", section: "D" },
  { french: "le cousin", dutch: "de neef", section: "D" },
  { french: "la cousine", dutch: "de nicht", section: "D" },
  { french: "l'oncle (m)", dutch: "de oom", section: "D" },
  { french: "la tante", dutch: "de tante", section: "D" },
  { french: "le grand-père", dutch: "de grootvader", section: "D" },
  { french: "la grand-mère", dutch: "de grootmoeder", section: "D" },
  { french: "le jardin", dutch: "de tuin", section: "D" },
  { french: "la photo", dutch: "de foto", section: "D" },
  { french: "la musique", dutch: "de muziek", section: "D" },
  { french: "le dessin", dutch: "de tekening", section: "D" },
  { french: "le prix", dutch: "de prijs", section: "D" },
  { french: "drôle", dutch: "grappig", section: "D" },
  { french: "fou", dutch: "gek", section: "D" },
  { french: "on rigole", dutch: "wij lachen", section: "D" },
  { french: "souvent", dutch: "vaak", section: "D" },
  { french: "toujours", dutch: "altijd", section: "D" },
  { french: "avec", dutch: "met", section: "D" },
  { french: "vraiment", dutch: "echt", section: "D" },
  // Section D – zinnen
  { french: "Tu as un frère?", dutch: "Heb je een broer?", section: "D" },
  { french: "Oui, j'ai un frère, Romain.", dutch: "Ja, ik heb een broer, Romain.", section: "D" },
  { french: "Il a quel âge?", dutch: "Hoe oud is hij?", section: "D" },
  { french: "Il a 13 ans.", dutch: "Hij is 13 jaar.", section: "D" },
  { french: "Au revoir.", dutch: "Tot ziens.", section: "D" },
  { french: "À plus.", dutch: "Tot later.", section: "D" },
  // Section E – Se présenter (zinnen)
  { french: "Bonjour, ça va?", dutch: "Hallo, hoe gaat het?", section: "E" },
  { french: "Ça va bien, et toi?", dutch: "Het gaat goed, en met jou?", section: "E" },
  { french: "Comment tu t'appelles?", dutch: "Hoe heet jij?", section: "E" },
  { french: "Je m'appelle Roos.", dutch: "Ik heet Roos.", section: "E" },
  { french: "Tu habites où?", dutch: "Waar woon jij?", section: "E" },
  { french: "J'habite à Zwolle.", dutch: "Ik woon in Zwolle.", section: "E" },
  { french: "C'est quoi?", dutch: "Wat is dat?", section: "E" },
  { french: "C'est un chien.", dutch: "Dat is een hond.", section: "E" },
  // Section G – Parler de ta famille (zinnen)
  { french: "Tu as un frère?", dutch: "Heb je een broer?", section: "G" },
  { french: "Oui, j'ai un frère, Romain.", dutch: "Ja, ik heb een broer, Romain.", section: "G" },
  { french: "Il a quel âge?", dutch: "Hoe oud is hij?", section: "G" },
  { french: "Il a 13 ans.", dutch: "Hij is 13 jaar.", section: "G" },
  { french: "Et toi, tu as quel âge?", dutch: "En jij, hoe oud ben jij?", section: "G" },
  { french: "Moi, j'ai 12 ans.", dutch: "Ik ben 12 jaar.", section: "G" },
  { french: "Quel est ton numéro de téléphone?", dutch: "Wat is jouw telefoonnummer?", section: "G" },
  { french: "Mon numéro, c'est le 06-14 07 18 5.", dutch: "Mijn nummer is 06-14 07 18 5.", section: "G" },
  { french: "Au revoir.", dutch: "Tot ziens.", section: "G" },
  { french: "À plus.", dutch: "Tot later.", section: "G" },
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
