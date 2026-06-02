// Grammar exercises for English chapters

export interface GrammarQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  chapterId: string; // e.g. "en_chapter2", "en_chapter4"
}

// ─── Chapter 1 (VMBO-HAVO): Personal pronouns, Possessive pronouns, to be, have got ───

const ch1PersonalPronouns: GrammarQuestion[] = [
  { question: "ik → ____ (onderwerpsvorm)", options: ["I", "me", "my", "mine"], correctAnswer: "I", explanation: "Onderwerpsvorm 1e persoon enkelvoud = I (altijd met hoofdletter).", topic: "Personal pronouns", chapterId: "en_chapter1" },
  { question: "jij → ____ (onderwerpsvorm)", options: ["you", "your", "yours", "thou"], correctAnswer: "you", explanation: "Onderwerp 'jij' = you.", topic: "Personal pronouns", chapterId: "en_chapter1" },
  { question: "hij → ____ (onderwerpsvorm)", options: ["he", "him", "his", "she"], correctAnswer: "he", explanation: "Onderwerp 'hij' = he.", topic: "Personal pronouns", chapterId: "en_chapter1" },
  { question: "zij (enkelvoud) → ____", options: ["she", "her", "hers", "they"], correctAnswer: "she", explanation: "Onderwerp 'zij' (enkelvoud) = she.", topic: "Personal pronouns", chapterId: "en_chapter1" },
  { question: "wij → ____ (onderwerpsvorm)", options: ["we", "us", "our", "they"], correctAnswer: "we", explanation: "Onderwerp 'wij' = we.", topic: "Personal pronouns", chapterId: "en_chapter1" },
  { question: "zij (meervoud) → ____", options: ["they", "them", "their", "we"], correctAnswer: "they", explanation: "Onderwerp 'zij' (meervoud) = they.", topic: "Personal pronouns", chapterId: "en_chapter1" },
  { question: "mij → ____ (voorwerpsvorm)", options: ["me", "I", "my", "mine"], correctAnswer: "me", explanation: "Voorwerpsvorm 'mij' = me.", topic: "Personal pronouns", chapterId: "en_chapter1" },
  { question: "hem → ____", options: ["him", "he", "his", "her"], correctAnswer: "him", explanation: "Voorwerpsvorm 'hem' = him.", topic: "Personal pronouns", chapterId: "en_chapter1" },
  { question: "haar → ____ (voorwerpsvorm)", options: ["her", "she", "hers", "him"], correctAnswer: "her", explanation: "Voorwerpsvorm 'haar' = her.", topic: "Personal pronouns", chapterId: "en_chapter1" },
  { question: "ons → ____", options: ["us", "we", "our", "ours"], correctAnswer: "us", explanation: "Voorwerpsvorm 'ons' = us.", topic: "Personal pronouns", chapterId: "en_chapter1" },
  { question: "hen / hun → ____", options: ["them", "they", "their", "theirs"], correctAnswer: "them", explanation: "Voorwerpsvorm 'hen/hun' = them.", topic: "Personal pronouns", chapterId: "en_chapter1" },
  { question: "I walk to school every day. You can walk with ____.", options: ["me", "I", "my", "mine"], correctAnswer: "me", explanation: "Na 'with' komt voorwerpsvorm: me.", topic: "Personal pronouns", chapterId: "en_chapter1" },
  { question: "We eat lunch together. Do you want to eat with ____?", options: ["us", "we", "our", "ours"], correctAnswer: "us", explanation: "Na 'with' komt voorwerpsvorm: us.", topic: "Personal pronouns", chapterId: "en_chapter1" },
];

const ch1PossessivePronouns: GrammarQuestion[] = [
  { question: "mijn (met zelfstandig naamwoord) → This is ____ book.", options: ["my", "mine", "me", "I"], correctAnswer: "my", explanation: "Met zelfstandig naamwoord erna → my.", topic: "Possessive pronouns", chapterId: "en_chapter1" },
  { question: "die van mij (zonder zelfstandig naamwoord) → The book is ____.", options: ["mine", "my", "me", "I"], correctAnswer: "mine", explanation: "Zonder zelfstandig naamwoord erna → mine.", topic: "Possessive pronouns", chapterId: "en_chapter1" },
  { question: "jouw → ____ pen", options: ["your", "yours", "you", "yore"], correctAnswer: "your", explanation: "Met zelfstandig naamwoord → your.", topic: "Possessive pronouns", chapterId: "en_chapter1" },
  { question: "die van jou → The pen is ____.", options: ["yours", "your", "you", "yourse"], correctAnswer: "yours", explanation: "Zonder zelfstandig naamwoord → yours.", topic: "Possessive pronouns", chapterId: "en_chapter1" },
  { question: "zijn → ____ pen", options: ["his", "him", "he", "his'"], correctAnswer: "his", explanation: "His is hetzelfde mét of zonder zelfstandig naamwoord.", topic: "Possessive pronouns", chapterId: "en_chapter1" },
  { question: "haar → ____ bag", options: ["her", "hers", "she", "her's"], correctAnswer: "her", explanation: "Met zelfstandig naamwoord → her.", topic: "Possessive pronouns", chapterId: "en_chapter1" },
  { question: "die van haar → The bag is ____.", options: ["hers", "her", "her's", "she"], correctAnswer: "hers", explanation: "Zonder zelfstandig naamwoord → hers (geen apostrof!).", topic: "Possessive pronouns", chapterId: "en_chapter1" },
  { question: "onze → ____ teacher", options: ["our", "ours", "us", "we"], correctAnswer: "our", explanation: "Met zelfstandig naamwoord → our.", topic: "Possessive pronouns", chapterId: "en_chapter1" },
  { question: "die van ons → The teacher is ____.", options: ["ours", "our", "us", "our's"], correctAnswer: "ours", explanation: "Zonder zelfstandig naamwoord → ours (geen apostrof).", topic: "Possessive pronouns", chapterId: "en_chapter1" },
  { question: "hun → ____ schedule", options: ["their", "theirs", "they", "there"], correctAnswer: "their", explanation: "Met zelfstandig naamwoord → their.", topic: "Possessive pronouns", chapterId: "en_chapter1" },
  { question: "die van hen → The schedule is ____.", options: ["theirs", "their", "there", "their's"], correctAnswer: "theirs", explanation: "Zonder zelfstandig naamwoord → theirs.", topic: "Possessive pronouns", chapterId: "en_chapter1" },
  { question: "Look, the dog is biting ____ tail!", options: ["its", "it's", "his", "their"], correctAnswer: "its", explanation: "Bezittelijk 'zijn' voor een dier/ding → its (zonder apostrof!).", topic: "Possessive pronouns", chapterId: "en_chapter1" },
  { question: "Is that ____ pen? – No, it's ____. (zijn pen – die van haar)", options: ["his / hers", "his / her", "him / hers", "his / her's"], correctAnswer: "his / hers", explanation: "Met zelfstandig naamwoord: his. Zonder: hers.", topic: "Possessive pronouns", chapterId: "en_chapter1" },
];

const ch1ToBe: GrammarQuestion[] = [
  { question: "I ____ 13 years old.", options: ["am", "is", "are", "be"], correctAnswer: "am", explanation: "I → am.", topic: "To be (present)", chapterId: "en_chapter1" },
  { question: "You ____ in Spain.", options: ["are", "is", "am", "be"], correctAnswer: "are", explanation: "You → are.", topic: "To be (present)", chapterId: "en_chapter1" },
  { question: "He ____ German.", options: ["is", "are", "am", "be"], correctAnswer: "is", explanation: "He/she/it → is.", topic: "To be (present)", chapterId: "en_chapter1" },
  { question: "She ____ Dutch.", options: ["is", "are", "am", "be"], correctAnswer: "is", explanation: "She → is.", topic: "To be (present)", chapterId: "en_chapter1" },
  { question: "We ____ at home.", options: ["are", "is", "am", "be"], correctAnswer: "are", explanation: "We/you/they → are.", topic: "To be (present)", chapterId: "en_chapter1" },
  { question: "They ____ abroad.", options: ["are", "is", "am", "were"], correctAnswer: "are", explanation: "They → are.", topic: "To be (present)", chapterId: "en_chapter1" },
  { question: "Korte vorm: I am = ____", options: ["I'm", "Im", "I're", "I's"], correctAnswer: "I'm", explanation: "I am → I'm.", topic: "To be (present)", chapterId: "en_chapter1" },
  { question: "Korte vorm: She is = ____", options: ["She's", "Shes", "She're", "She'is"], correctAnswer: "She's", explanation: "She is → She's.", topic: "To be (present)", chapterId: "en_chapter1" },
  { question: "Korte vorm: They are = ____", options: ["They're", "Theyre", "They's", "They'are"], correctAnswer: "They're", explanation: "They are → They're.", topic: "To be (present)", chapterId: "en_chapter1" },
  { question: "I ____ Dutch. (-)", options: ["am not", "aren't", "isn't", "not am"], correctAnswer: "am not", explanation: "I + am not (geen korte vorm 'amn't').", topic: "To be (present)", chapterId: "en_chapter1" },
  { question: "He ____ Dutch. (-)", options: ["isn't", "aren't", "amn't", "doesn't"], correctAnswer: "isn't", explanation: "He/she/it → isn't (is not).", topic: "To be (present)", chapterId: "en_chapter1" },
  { question: "We ____ Dutch. (-)", options: ["aren't", "isn't", "amn't", "don't"], correctAnswer: "aren't", explanation: "We/you/they → aren't (are not).", topic: "To be (present)", chapterId: "en_chapter1" },
  { question: "____ I Dutch? (?)", options: ["Am", "Is", "Are", "Do"], correctAnswer: "Am", explanation: "Vraag met I → Am I…?", topic: "To be (present)", chapterId: "en_chapter1" },
  { question: "____ she Dutch? (?)", options: ["Is", "Are", "Am", "Does"], correctAnswer: "Is", explanation: "Vraag met he/she/it → Is …?", topic: "To be (present)", chapterId: "en_chapter1" },
  { question: "____ they Dutch? (?)", options: ["Are", "Is", "Am", "Do"], correctAnswer: "Are", explanation: "Vraag met we/you/they → Are …?", topic: "To be (present)", chapterId: "en_chapter1" },
];

const ch1HaveGot: GrammarQuestion[] = [
  { question: "I ____ blonde hair.", options: ["have got", "has got", "am got", "is got"], correctAnswer: "have got", explanation: "I/you/we/they → have got.", topic: "To have got", chapterId: "en_chapter1" },
  { question: "She ____ curly hair.", options: ["has got", "have got", "is got", "haves got"], correctAnswer: "has got", explanation: "He/she/it → has got.", topic: "To have got", chapterId: "en_chapter1" },
  { question: "He ____ straight hair.", options: ["has got", "have got", "is got", "got"], correctAnswer: "has got", explanation: "He → has got.", topic: "To have got", chapterId: "en_chapter1" },
  { question: "My dog ____ black fur. (-)", options: ["has not got", "have not got", "doesn't has got", "isn't got"], correctAnswer: "has not got", explanation: "It → has not got / hasn't got.", topic: "To have got", chapterId: "en_chapter1" },
  { question: "We ____ the same earrings. (-)", options: ["have not got", "has not got", "don't have got", "aren't got"], correctAnswer: "have not got", explanation: "We → have not got / haven't got.", topic: "To have got", chapterId: "en_chapter1" },
  { question: "Welke zin klopt om te vragen of iemand een bril heeft?", options: ["Has she got glasses?", "Does she got glasses?", "Is she got glasses?", "She has got glasses?"], correctAnswer: "Has she got glasses?", explanation: "Vraag met she/he/it → Has … got…? (geen do/does!).", topic: "To have got", chapterId: "en_chapter1" },
  { question: "____ you got braces? (?)", options: ["Have", "Has", "Do", "Are"], correctAnswer: "Have", explanation: "Vraag met you → Have you got…?", topic: "To have got", chapterId: "en_chapter1" },
  { question: "Korte vorm: I have got = ____", options: ["I've got", "I'm got", "I has got", "I'd got"], correctAnswer: "I've got", explanation: "I have → I've.", topic: "To have got", chapterId: "en_chapter1" },
  { question: "Korte vorm: He has got = ____", options: ["He's got", "He've got", "He'as got", "He has't"], correctAnswer: "He's got", explanation: "He has → He's (zelfde vorm als He is, context maakt verschil).", topic: "To have got", chapterId: "en_chapter1" },
  { question: "Korte vorm: She has not got = ____", options: ["She hasn't got", "She haven't got", "She'sn't got", "She isn't got"], correctAnswer: "She hasn't got", explanation: "has not → hasn't.", topic: "To have got", chapterId: "en_chapter1" },
  { question: "You ____ a lot of hair. (-)", options: ["haven't got", "hasn't got", "don't got", "aren't got"], correctAnswer: "haven't got", explanation: "You → haven't got.", topic: "To have got", chapterId: "en_chapter1" },
];

// ─── Chapter 2 (VMBO-HAVO): Plurals, Demonstratives, Present simple ───

const ch2Plurals: GrammarQuestion[] = [
  { question: "video → ____", options: ["videos", "videoes", "videoses", "videoses'"], correctAnswer: "videos", explanation: "Standaard krijgen woorden -s in het meervoud: video → videos.", topic: "Plurals", chapterId: "en_chapter2" },
  { question: "shoe → ____", options: ["shoes", "shoees", "shoese", "shoeies"], correctAnswer: "shoes", explanation: "Gewoon -s erbij: shoe → shoes.", topic: "Plurals", chapterId: "en_chapter2" },
  { question: "watch → ____ (sisklank)", options: ["watches", "watchs", "watchies", "watchen"], correctAnswer: "watches", explanation: "Eindigt op een sisklank (-ch) → meervoud krijgt -es.", topic: "Plurals", chapterId: "en_chapter2" },
  { question: "dress → ____", options: ["dresses", "dress'", "dresss", "dressen"], correctAnswer: "dresses", explanation: "Eindigt op -ss (sisklank) → -es erbij: dresses.", topic: "Plurals", chapterId: "en_chapter2" },
  { question: "lady → ____ (medeklinker + y)", options: ["ladies", "ladys", "lady's", "ladyes"], correctAnswer: "ladies", explanation: "Medeklinker + -y → -y wordt -ies: lady → ladies.", topic: "Plurals", chapterId: "en_chapter2" },
  { question: "baby → ____", options: ["babies", "babys", "baby's", "babyes"], correctAnswer: "babies", explanation: "Medeklinker + -y → -ies: baby → babies.", topic: "Plurals", chapterId: "en_chapter2" },
  { question: "life → ____ (-f)", options: ["lives", "lifes", "lifves", "lifs"], correctAnswer: "lives", explanation: "Eindigt op -f → meestal -ves: life → lives.", topic: "Plurals", chapterId: "en_chapter2" },
  { question: "scarf → ____", options: ["scarves", "scarfs", "scarfes", "scarvies"], correctAnswer: "scarves", explanation: "-f wordt -ves: scarf → scarves.", topic: "Plurals", chapterId: "en_chapter2" },
  { question: "child → ____ (onregelmatig)", options: ["children", "childs", "childes", "childies"], correctAnswer: "children", explanation: "Onregelmatig meervoud: child → children.", topic: "Plurals", chapterId: "en_chapter2" },
  { question: "person → ____", options: ["people", "persons", "peoples", "personas"], correctAnswer: "people", explanation: "Onregelmatig: person → people.", topic: "Plurals", chapterId: "en_chapter2" },
  { question: "man → ____", options: ["men", "mans", "manes", "mens"], correctAnswer: "men", explanation: "Onregelmatig: man → men.", topic: "Plurals", chapterId: "en_chapter2" },
  { question: "woman → ____", options: ["women", "womans", "womens", "womenes"], correctAnswer: "women", explanation: "Onregelmatig: woman → women.", topic: "Plurals", chapterId: "en_chapter2" },
  { question: "foot → ____", options: ["feet", "foots", "feets", "footes"], correctAnswer: "feet", explanation: "Onregelmatig: foot → feet.", topic: "Plurals", chapterId: "en_chapter2" },
  { question: "tomato → ____", options: ["tomatoes", "tomatos", "tomatas", "tomato's"], correctAnswer: "tomatoes", explanation: "Veel woorden op -o krijgen -es: tomato → tomatoes.", topic: "Plurals", chapterId: "en_chapter2" },
  { question: "Welk woord wordt alleen in het meervoud gebruikt?", options: ["trousers", "shirt", "skirt", "coat"], correctAnswer: "trousers", explanation: "Trousers (broek) gebruik je altijd in het meervoud: 'I need new trousers.'", topic: "Plurals", chapterId: "en_chapter2" },
];

const ch2Demonstratives: GrammarQuestion[] = [
  { question: "I like ____ jumper. (dichtbij, enkelvoud)", options: ["this", "that", "these", "those"], correctAnswer: "this", explanation: "Dichtbij + enkelvoud → this.", topic: "Demonstrative Pronouns", chapterId: "en_chapter2" },
  { question: "I like ____ shirt. (verder weg, enkelvoud)", options: ["that", "this", "these", "those"], correctAnswer: "that", explanation: "Verder weg + enkelvoud → that.", topic: "Demonstrative Pronouns", chapterId: "en_chapter2" },
  { question: "I like ____ shoes. (dichtbij, meervoud)", options: ["these", "this", "those", "that"], correctAnswer: "these", explanation: "Dichtbij + meervoud → these.", topic: "Demonstrative Pronouns", chapterId: "en_chapter2" },
  { question: "I like ____ socks. (verder weg, meervoud)", options: ["those", "these", "that", "this"], correctAnswer: "those", explanation: "Verder weg + meervoud → those.", topic: "Demonstrative Pronouns", chapterId: "en_chapter2" },
  { question: "Look at ____ shoes over there. I like them.", options: ["those", "these", "that", "this"], correctAnswer: "those", explanation: "'Over there' = verder weg + meervoud → those.", topic: "Demonstrative Pronouns", chapterId: "en_chapter2" },
  { question: "____ is my new bike. (dichtbij)", options: ["This", "That", "These", "Those"], correctAnswer: "This", explanation: "Enkelvoud + dichtbij → This.", topic: "Demonstrative Pronouns", chapterId: "en_chapter2" },
];

const ch2PresentSimple: GrammarQuestion[] = [
  { question: "I always ____ milk.", options: ["drink", "drinks", "am drink", "drinking"], correctAnswer: "drink", explanation: "Bij I/you/we/they: gebruik het hele werkwoord.", topic: "Present Simple (+)", chapterId: "en_chapter2" },
  { question: "He often ____ milk.", options: ["drinks", "drink", "drinkes", "is drink"], correctAnswer: "drinks", explanation: "Bij he/she/it komt er een -s achter het werkwoord.", topic: "Present Simple (+)", chapterId: "en_chapter2" },
  { question: "She often ____ chips on Friday.", options: ["eats", "eat", "eates", "is eat"], correctAnswer: "eats", explanation: "She → werkwoord + s.", topic: "Present Simple (+)", chapterId: "en_chapter2" },
  { question: "I catch — he ____", options: ["catches", "catchs", "catchies", "catch"], correctAnswer: "catches", explanation: "Eindigt op -ch (sisklank) → -es achter het werkwoord.", topic: "Present Simple (+)", chapterId: "en_chapter2" },
  { question: "I guess — she ____", options: ["guesses", "guesss", "guess", "guessies"], correctAnswer: "guesses", explanation: "Eindigt op -ss (sisklank) → -es: guesses.", topic: "Present Simple (+)", chapterId: "en_chapter2" },
  { question: "I study — he ____", options: ["studies", "studys", "studyes", "study"], correctAnswer: "studies", explanation: "Medeklinker + y → -y wordt -ies: studies.", topic: "Present Simple (+)", chapterId: "en_chapter2" },
  { question: "I try — she ____", options: ["tries", "trys", "tryes", "try"], correctAnswer: "tries", explanation: "Medeklinker + y → -ies: tries.", topic: "Present Simple (+)", chapterId: "en_chapter2" },
  { question: "I go — he ____", options: ["goes", "gos", "goies", "go"], correctAnswer: "goes", explanation: "Werkwoord op -o → -es: goes.", topic: "Present Simple (+)", chapterId: "en_chapter2" },
  { question: "I do — she ____", options: ["does", "dos", "doies", "doos"], correctAnswer: "does", explanation: "do + es → does.", topic: "Present Simple (+)", chapterId: "en_chapter2" },
  { question: "Dogs ____ meat. (algemene waarheid)", options: ["eat", "eats", "are eating", "is eat"], correctAnswer: "eat", explanation: "Meervoud onderwerp → hele werkwoord. Algemene waarheid → present simple.", topic: "Present Simple (+)", chapterId: "en_chapter2" },
  { question: "It ____ a lot in the autumn.", options: ["rains", "rain", "is rain", "raines"], correctAnswer: "rains", explanation: "It → werkwoord + s: rains.", topic: "Present Simple (+)", chapterId: "en_chapter2" },

  // Negatives & questions
  { question: "I ____ run. (-)", options: ["don't", "doesn't", "am not", "isn't"], correctAnswer: "don't", explanation: "Bij I/you/we/they → don't (do not) + hele werkwoord.", topic: "Present Simple (-)", chapterId: "en_chapter2" },
  { question: "She ____ run. (-)", options: ["doesn't", "don't", "isn't", "aren't"], correctAnswer: "doesn't", explanation: "Bij he/she/it → doesn't (does not) + hele werkwoord.", topic: "Present Simple (-)", chapterId: "en_chapter2" },
  { question: "He ____ play football.", options: ["doesn't", "don't", "isn't", "aren't"], correctAnswer: "doesn't", explanation: "He → doesn't + hele werkwoord.", topic: "Present Simple (-)", chapterId: "en_chapter2" },
  { question: "We ____ like tomatoes.", options: ["don't", "doesn't", "aren't", "isn't"], correctAnswer: "don't", explanation: "We → don't.", topic: "Present Simple (-)", chapterId: "en_chapter2" },
  { question: "____ you run? (?)", options: ["Do", "Does", "Are", "Is"], correctAnswer: "Do", explanation: "Vraag met I/you/we/they → Do + persoon + hele werkwoord.", topic: "Present Simple (?)", chapterId: "en_chapter2" },
  { question: "____ he run? (?)", options: ["Does", "Do", "Is", "Are"], correctAnswer: "Does", explanation: "Vraag met he/she/it → Does + persoon + hele werkwoord.", topic: "Present Simple (?)", chapterId: "en_chapter2" },
  { question: "____ she play the piano?", options: ["Does", "Do", "Is", "Are"], correctAnswer: "Does", explanation: "She → Does … play.", topic: "Present Simple (?)", chapterId: "en_chapter2" },
  { question: "Bij 'have got' gebruik je voor vraag/ontkenning géén do/does. Welke zin klopt?", options: ["Have you got new shoes?", "Do you have got new shoes?", "Does you got new shoes?", "Are you got new shoes?"], correctAnswer: "Have you got new shoes?", explanation: "Bij 'have got' gebruik je geen do/does: Have you got…?", topic: "Present Simple (?)", chapterId: "en_chapter2" },
  { question: "She ____ got new shoes. (-)", options: ["hasn't", "doesn't have", "don't have", "isn't"], correctAnswer: "hasn't", explanation: "Bij 'have got' gebruik je voor ontkenning: hasn't / haven't got.", topic: "Present Simple (-)", chapterId: "en_chapter2" },
];

// ─── Chapter 3 (VMBO-HAVO): Present continuous ───

const ch3PresentContinuous: GrammarQuestion[] = [
  { question: "I ____ TV right now.", options: ["am watching", "watch", "watches", "is watching"], correctAnswer: "am watching", explanation: "Present continuous: am/is/are + werkwoord+ing. Bij I → am.", topic: "Present continuous (+)", chapterId: "en_chapter3" },
  { question: "He ____ to music at the moment.", options: ["is listening", "are listening", "am listening", "listens"], correctAnswer: "is listening", explanation: "He/she/it → is + werkwoord+ing.", topic: "Present continuous (+)", chapterId: "en_chapter3" },
  { question: "They ____ football now.", options: ["are playing", "is playing", "am playing", "play"], correctAnswer: "are playing", explanation: "We/you/they → are + werkwoord+ing.", topic: "Present continuous (+)", chapterId: "en_chapter3" },
  { question: "She ____ her grandparents today.", options: ["is visiting", "visit", "visits", "are visiting"], correctAnswer: "is visiting", explanation: "Bezig nú → present continuous met is + -ing.", topic: "Present continuous (+)", chapterId: "en_chapter3" },
  { question: "Korte vorm: I am driving = ____", options: ["I'm driving", "I am'driving", "I are driving", "Im driving"], correctAnswer: "I'm driving", explanation: "I am → I'm.", topic: "Present continuous (+)", chapterId: "en_chapter3" },
  { question: "Korte vorm: He is walking = ____", options: ["He's walking", "He're walking", "Hes walking", "He'is walking"], correctAnswer: "He's walking", explanation: "He is → He's.", topic: "Present continuous (+)", chapterId: "en_chapter3" },
  { question: "I ____ studying. (-)", options: ["am not", "isn't", "aren't", "don't"], correctAnswer: "am not", explanation: "Ontkenning bij I → am not (geen 'amn't').", topic: "Present continuous (-)", chapterId: "en_chapter3" },
  { question: "We ____ spending money today. (-)", options: ["aren't", "isn't", "amn't", "don't"], correctAnswer: "aren't", explanation: "We/you/they → aren't + werkwoord+ing.", topic: "Present continuous (-)", chapterId: "en_chapter3" },
  { question: "She ____ working at the moment. (-)", options: ["isn't", "aren't", "amn't", "doesn't"], correctAnswer: "isn't", explanation: "He/she/it → isn't + werkwoord+ing.", topic: "Present continuous (-)", chapterId: "en_chapter3" },
  { question: "____ Paul visiting his grandparents today? (?)", options: ["Is", "Are", "Am", "Does"], correctAnswer: "Is", explanation: "Vraag met he/she/it → Is + onderwerp + -ing.", topic: "Present continuous (?)", chapterId: "en_chapter3" },
  { question: "____ they moving to New York? (?)", options: ["Are", "Is", "Am", "Do"], correctAnswer: "Are", explanation: "Vraag met we/you/they → Are + onderwerp + -ing.", topic: "Present continuous (?)", chapterId: "en_chapter3" },
  { question: "____ I disturbing you? (?)", options: ["Am", "Is", "Are", "Do"], correctAnswer: "Am", explanation: "Vraag met I → Am I + -ing?", topic: "Present continuous (?)", chapterId: "en_chapter3" },
  { question: "Spelling: live + ing = ____", options: ["living", "liveing", "liveing", "livving"], correctAnswer: "living", explanation: "Werkwoord eindigt op -e → -e weglaten + -ing: live → living.", topic: "Present continuous: spelling", chapterId: "en_chapter3" },
  { question: "Spelling: move + ing = ____", options: ["moving", "moveing", "movving", "moveng"], correctAnswer: "moving", explanation: "-e weglaten: move → moving.", topic: "Present continuous: spelling", chapterId: "en_chapter3" },
  { question: "Spelling: lie + ing = ____", options: ["lying", "lieing", "liying", "liing"], correctAnswer: "lying", explanation: "-ie wordt -y + ing: lie → lying.", topic: "Present continuous: spelling", chapterId: "en_chapter3" },
  { question: "Spelling: die + ing = ____", options: ["dying", "dieing", "diying", "diing"], correctAnswer: "dying", explanation: "-ie wordt -y + ing: die → dying.", topic: "Present continuous: spelling", chapterId: "en_chapter3" },
  { question: "Spelling: get + ing = ____", options: ["getting", "geting", "gettting", "geting"], correctAnswer: "getting", explanation: "Kort woord, 1 klinker + 1 medeklinker → laatste letter verdubbelen: get → getting.", topic: "Present continuous: spelling", chapterId: "en_chapter3" },
  { question: "Spelling: swim + ing = ____", options: ["swimming", "swiming", "swimmming", "swimeng"], correctAnswer: "swimming", explanation: "1 klinker + 1 medeklinker → verdubbelen: swim → swimming.", topic: "Present continuous: spelling", chapterId: "en_chapter3" },
  { question: "Spelling: travel + ing = ____", options: ["travelling", "traveling", "traveleng", "travling"], correctAnswer: "travelling", explanation: "Eindigt op -l → -l verdubbelen: travel → travelling.", topic: "Present continuous: spelling", chapterId: "en_chapter3" },
  { question: "Spelling: begin + ing = ____", options: ["beginning", "begining", "beginng", "beginneng"], correctAnswer: "beginning", explanation: "Eindigt op klinker + medeklinker (klemtoon achter) → verdubbelen: begin → beginning.", topic: "Present continuous: spelling", chapterId: "en_chapter3" },
];

// ─── Chapter 4 (existing) ───

const ch4TagQuestions: GrammarQuestion[] = [
  { question: "You are a football player, _______?", options: ["aren't you", "isn't you", "don't you", "are you"], correctAnswer: "aren't you", explanation: "Bij een bevestigende (+) hoofdzin met 'are', gebruik je de ontkennende tag question 'aren't you?'", topic: "Tag Questions", chapterId: "en_chapter4" },
  { question: "She isn't very strong, _______?", options: ["is she", "isn't she", "does she", "are she"], correctAnswer: "is she", explanation: "Bij een ontkennende (-) hoofdzin gebruik je een bevestigende (+) tag question.", topic: "Tag Questions", chapterId: "en_chapter4" },
  { question: "She is very good, _______?", options: ["isn't she", "is she", "doesn't she", "aren't she"], correctAnswer: "isn't she", explanation: "Bevestigende hoofdzin → ontkennende tag question: 'isn't she?'", topic: "Tag Questions", chapterId: "en_chapter4" },
  { question: "They are runners, _______?", options: ["aren't they", "are they", "isn't they", "don't they"], correctAnswer: "aren't they", explanation: "Bevestigende hoofdzin met 'are' → 'aren't they?'", topic: "Tag Questions", chapterId: "en_chapter4" },
  { question: "I'm not a good swimmer, _______?", options: ["am I", "aren't I", "do I", "is I"], correctAnswer: "am I", explanation: "Ontkennende hoofdzin met 'I'm not' → bevestigende tag 'am I?'", topic: "Tag Questions", chapterId: "en_chapter4" },
  { question: "I'm a fast runner, _______?", options: ["aren't I", "am I", "isn't I", "don't I"], correctAnswer: "aren't I", explanation: "Bevestigende hoofdzin met 'I'm' → ontkennende tag 'aren't I?'", topic: "Tag Questions", chapterId: "en_chapter4" },
  { question: "The runners are very fast, _______?", options: ["aren't they", "are they", "isn't they", "don't they"], correctAnswer: "aren't they", explanation: "Bij een zelfstandig naamwoord in de hoofdzin gebruik je het bijbehorende persoonlijk voornaamwoord in de tag.", topic: "Tag Questions", chapterId: "en_chapter4" },
  { question: "Baseball is a popular sport, _______?", options: ["isn't it", "is it", "aren't it", "doesn't it"], correctAnswer: "isn't it", explanation: "Baseball → 'it'. Bevestigende hoofdzin → ontkennende tag.", topic: "Tag Questions", chapterId: "en_chapter4" },
];

const ch4MuchMany: GrammarQuestion[] = [
  { question: "I have got _______ wallets. (+)", options: ["a lot of", "many", "much", "a few"], correctAnswer: "a lot of", explanation: "Bevestigende zin + telbaar zelfstandig naamwoord → 'a lot of'.", topic: "Much/Many/A lot of", chapterId: "en_chapter4" },
  { question: "She hasn't got _______ wallets. (-)", options: ["many", "a lot of", "much", "a few"], correctAnswer: "many", explanation: "Ontkennende zin + telbaar zelfstandig naamwoord → 'many'.", topic: "Much/Many/A lot of", chapterId: "en_chapter4" },
  { question: "Have they got _______ wallets? (?)", options: ["many", "a lot of", "much", "a few"], correctAnswer: "many", explanation: "Vragende zin + telbaar zelfstandig naamwoord → 'many'.", topic: "Much/Many/A lot of", chapterId: "en_chapter4" },
  { question: "I have got _______ time. (+)", options: ["a lot of", "many", "much", "a few"], correctAnswer: "a lot of", explanation: "Bevestigende zin + ontelbaar (time) → 'a lot of'.", topic: "Much/Many/A lot of", chapterId: "en_chapter4" },
  { question: "They haven't got _______ time. (-)", options: ["much", "many", "a lot of", "a few"], correctAnswer: "much", explanation: "Ontkennende zin + ontelbaar (time) → 'much'.", topic: "Much/Many/A lot of", chapterId: "en_chapter4" },
  { question: "Has he got _______ time? (?)", options: ["much", "many", "a lot of", "a few"], correctAnswer: "much", explanation: "Vragende zin + ontelbaar (time) → 'much'.", topic: "Much/Many/A lot of", chapterId: "en_chapter4" },
  { question: "She has got _______ money. (+)", options: ["a lot of", "much", "many", "a few"], correctAnswer: "a lot of", explanation: "Bevestigende zin + ontelbaar (money) → 'a lot of'.", topic: "Much/Many/A lot of", chapterId: "en_chapter4" },
  { question: "We haven't got _______ banknotes. (-)", options: ["many", "much", "a lot of", "a few"], correctAnswer: "many", explanation: "Ontkennende zin + telbaar (banknotes) → 'many'.", topic: "Much/Many/A lot of", chapterId: "en_chapter4" },
];

const ch4Future: GrammarQuestion[] = [
  { question: "I _______ have a sandwich. (voornemen)", options: ["'ll", "am going to", "shall", "'m going to"], correctAnswer: "'ll", explanation: "Bij voornemens of besluiten op het moment van spreken gebruik je 'will' ('ll).", topic: "Will/Shall/Going to", chapterId: "en_chapter4" },
  { question: "The sun _______ rise tomorrow.", options: ["will", "is going to", "shall", "does"], correctAnswer: "will", explanation: "Bij gebeurtenissen die in de toekomst gaan gebeuren gebruik je 'will'.", topic: "Will/Shall/Going to", chapterId: "en_chapter4" },
  { question: "They _______ back before noon. (negatief)", options: ["won't be", "aren't going to be", "shan't be", "don't be"], correctAnswer: "won't be", explanation: "Ontkennende toekomst met 'will not' = 'won't'.", topic: "Will/Shall/Going to", chapterId: "en_chapter4" },
  { question: "I hope she _______ give me a present.", options: ["will", "is going to", "shall", "does"], correctAnswer: "will", explanation: "Bij wensen en veronderstellingen gebruik je 'will'.", topic: "Will/Shall/Going to", chapterId: "en_chapter4" },
  { question: "I think you _______ be lucky today.", options: ["'ll", "'re going to", "shall", "do"], correctAnswer: "'ll", explanation: "Bij veronderstellingen: 'I think you'll...'", topic: "Will/Shall/Going to", chapterId: "en_chapter4" },
  { question: "_______ we go to the cinema?", options: ["Shall", "Will", "Are", "Do"], correctAnswer: "Shall", explanation: "'Shall' gebruik je in vragen met 'I' of 'we' om een voorstel te doen.", topic: "Will/Shall/Going to", chapterId: "en_chapter4" },
  { question: "They're _______ visit the zoo tomorrow. (plan)", options: ["going to", "will", "shall", "wanting to"], correctAnswer: "going to", explanation: "Bij plannen die al gemaakt waren gebruik je 'to be going to'.", topic: "Will/Shall/Going to", chapterId: "en_chapter4" },
  { question: "I'm _______ be a doctor. (plan)", options: ["going to", "will", "shall", "wanting to"], correctAnswer: "going to", explanation: "Bij plannen die al gemaakt waren: 'I'm going to...'", topic: "Will/Shall/Going to", chapterId: "en_chapter4" },
  { question: "Look at the sky. It _______ rain. (voorspelling op aanwijzingen)", options: ["isn't going to", "won't", "shan't", "doesn't"], correctAnswer: "isn't going to", explanation: "Bij voorspellingen gebaseerd op aanwijzingen gebruik je 'to be going to'.", topic: "Will/Shall/Going to", chapterId: "en_chapter4" },
  { question: "_______ you cook dinner for me?", options: ["Will", "Shall", "Are", "Do"], correctAnswer: "Will", explanation: "Bij verzoeken gebruik je 'Will you...?'", topic: "Will/Shall/Going to", chapterId: "en_chapter4" },
];

// ─── Chapter 5 (HAVO-VWO): Word order adverbs + Past simple ───

const hv5WordOrder: GrammarQuestion[] = [
  { question: "He's going to give a concert ____.", options: ["in Houston", "Houston in", "at Houston going", "to Houston is"], correctAnswer: "in Houston", explanation: "Plaats- en tijdsbepalingen staan meestal aan het EIND van de zin.", topic: "Word order: place & time", chapterId: "en_hv_chapter5" },
  { question: "Sally's going to order the tickets ____.", options: ["tomorrow", "in tomorrow", "at tomorrow", "tomorrow's"], correctAnswer: "tomorrow", explanation: "Tijdsbepaling 'tomorrow' staat aan het einde van de zin.", topic: "Word order: place & time", chapterId: "en_hv_chapter5" },
  { question: "Welke zin benadrukt het tijdstip extra?", options: ["Last night, I watched his concert on TV.", "I watched his concert on TV last night.", "I last night watched on TV his concert.", "On TV last night I watched his concert."], correctAnswer: "Last night, I watched his concert on TV.", explanation: "Door de tijdsbepaling helemaal vooraan te zetten, benadruk je het moment.", topic: "Word order: place & time", chapterId: "en_hv_chapter5" },
  { question: "Wanneer plaats én tijd achteraan staan, welke komt EERST?", options: ["plaats (P), dan tijd (T)", "tijd (T), dan plaats (P)", "maakt niet uit", "alleen tijd mag achter"], correctAnswer: "plaats (P), dan tijd (T)", explanation: "Onthoud: P van Plaats vóór T van Tijd → 'at the O2 Arena tonight'.", topic: "Word order: place & time", chapterId: "en_hv_chapter5" },
  { question: "Kies de correcte volgorde:", options: ["There's going to be a big music event at the O2 Arena tonight.", "There's going to be a big music event tonight at the O2 Arena.", "Tonight there's going to be at the O2 Arena a big music event.", "There's going to be at the O2 Arena tonight a big music event."], correctAnswer: "There's going to be a big music event at the O2 Arena tonight.", explanation: "Plaats (at the O2 Arena) vóór tijd (tonight).", topic: "Word order: place & time", chapterId: "en_hv_chapter5" },
  { question: "Kies de correcte zin:", options: ["I watched his concert on TV last night.", "I watched on TV last night his concert.", "I last night on TV watched his concert.", "On TV I watched last night his concert."], correctAnswer: "I watched his concert on TV last night.", explanation: "Werkwoord + object + plaats + tijd.", topic: "Word order: place & time", chapterId: "en_hv_chapter5" },
];

const hv5PastSimple: GrammarQuestion[] = [
  { question: "I ____ to Isaac. (to talk – past simple)", options: ["talked", "talk", "talkes", "was talk"], correctAnswer: "talked", explanation: "Past simple van regelmatige werkwoorden: werkwoord + -ed.", topic: "Past simple (+)", chapterId: "en_hv_chapter5" },
  { question: "They ____ in stone houses. (to live)", options: ["lived", "liveed", "livd", "lives"], correctAnswer: "lived", explanation: "Eindigt op -e → alleen -d toevoegen: live → lived.", topic: "Past simple (+)", chapterId: "en_hv_chapter5" },
  { question: "We ____ to help him yesterday. (to try)", options: ["tried", "tryed", "tryied", "trys"], correctAnswer: "tried", explanation: "Medeklinker + y → -y wordt -ied: try → tried.", topic: "Past simple (+)", chapterId: "en_hv_chapter5" },
  { question: "She ____ a game yesterday. (to play)", options: ["played", "plaied", "plaed", "plays"], correctAnswer: "played", explanation: "Klinker + y → gewoon -ed: play → played.", topic: "Past simple (+)", chapterId: "en_hv_chapter5" },
  { question: "I ____ the video. (to stop)", options: ["stopped", "stoped", "stopt", "stops"], correctAnswer: "stopped", explanation: "Eén klinker + één medeklinker → laatste letter verdubbelen + -ed: stop → stopped.", topic: "Past simple (+)", chapterId: "en_hv_chapter5" },
  { question: "Jessica ____ after the show. (to clap)", options: ["clapped", "claped", "clapt", "claps"], correctAnswer: "clapped", explanation: "1 klinker + 1 medeklinker → verdubbelen + -ed: clap → clapped.", topic: "Past simple (+)", chapterId: "en_hv_chapter5" },
  { question: "We ____ to another city. (to travel)", options: ["travelled", "traveled", "travelt", "travels"], correctAnswer: "travelled", explanation: "Twee of meer lettergrepen die eindigen op -l → -l verdubbelen + -ed.", topic: "Past simple (+)", chapterId: "en_hv_chapter5" },
  { question: "They ____ all flights because of the fog. (to cancel)", options: ["cancelled", "canceled", "cancelt", "cancels"], correctAnswer: "cancelled", explanation: "Eindigt op -l → -l verdubbelen + -ed: cancel → cancelled.", topic: "Past simple (+)", chapterId: "en_hv_chapter5" },
  { question: "The wound ____ heal well. (-)", options: ["did not", "does not", "was not", "is not"], correctAnswer: "did not", explanation: "Ontkenning in past simple: did not / didn't + hele werkwoord.", topic: "Past simple (-)", chapterId: "en_hv_chapter5" },
  { question: "His arm ____ hurt. (-)", options: ["didn't", "doesn't", "wasn't", "isn't"], correctAnswer: "didn't", explanation: "Past simple ontkenning: didn't + hele werkwoord (zonder -ed).", topic: "Past simple (-)", chapterId: "en_hv_chapter5" },
  { question: "____ the wound heal well? (?)", options: ["Did", "Does", "Was", "Is"], correctAnswer: "Did", explanation: "Vraag in past simple: Did + onderwerp + hele werkwoord.", topic: "Past simple (?)", chapterId: "en_hv_chapter5" },
  { question: "____ his arm hurt? (?)", options: ["Did", "Does", "Was", "Were"], correctAnswer: "Did", explanation: "Did + onderwerp + hele werkwoord (geen -ed!).", topic: "Past simple (?)", chapterId: "en_hv_chapter5" },
  { question: "Welke zin is FOUT?", options: ["Did he hurt his arm?", "Did he hurted his arm?", "He didn't hurt his arm.", "He hurt his arm."], correctAnswer: "Did he hurted his arm?", explanation: "Na did/didn't gebruik je het HELE werkwoord, dus géén -ed.", topic: "Past simple (?)", chapterId: "en_hv_chapter5" },
];

// ─── Chapter 6 (HAVO-VWO): Irregular past simple, to be past, Possessive 's, Some/any ───

const hv6Irregular: GrammarQuestion[] = [
  { question: "Past simple van 'to become' is ____.", options: ["became", "becomed", "becamed", "becomes"], correctAnswer: "became", explanation: "Onregelmatig: become → became.", topic: "Past simple (irregular)", chapterId: "en_hv_chapter6" },
  { question: "Past simple van 'to bring' is ____.", options: ["brought", "bringed", "brang", "brung"], correctAnswer: "brought", explanation: "Onregelmatig: bring → brought.", topic: "Past simple (irregular)", chapterId: "en_hv_chapter6" },
  { question: "Past simple van 'to come' is ____.", options: ["came", "comed", "comme", "comes"], correctAnswer: "came", explanation: "Onregelmatig: come → came.", topic: "Past simple (irregular)", chapterId: "en_hv_chapter6" },
  { question: "Past simple van 'to do' is ____.", options: ["did", "doed", "done", "didded"], correctAnswer: "did", explanation: "Onregelmatig: do → did.", topic: "Past simple (irregular)", chapterId: "en_hv_chapter6" },
  { question: "Past simple van 'to find' is ____.", options: ["found", "finded", "fund", "finded"], correctAnswer: "found", explanation: "Onregelmatig: find → found.", topic: "Past simple (irregular)", chapterId: "en_hv_chapter6" },
  { question: "Past simple van 'to go' is ____.", options: ["went", "goed", "gone", "goes"], correctAnswer: "went", explanation: "Onregelmatig: go → went.", topic: "Past simple (irregular)", chapterId: "en_hv_chapter6" },
  { question: "Past simple van 'to have' is ____.", options: ["had", "haved", "haded", "has"], correctAnswer: "had", explanation: "Onregelmatig: have → had.", topic: "Past simple (irregular)", chapterId: "en_hv_chapter6" },
  { question: "Past simple van 'to see' is ____.", options: ["saw", "seed", "seen", "sees"], correctAnswer: "saw", explanation: "Onregelmatig: see → saw.", topic: "Past simple (irregular)", chapterId: "en_hv_chapter6" },
  { question: "Past simple van 'to know' is ____.", options: ["knew", "knowed", "known", "knows"], correctAnswer: "knew", explanation: "Onregelmatig: know → knew.", topic: "Past simple (irregular)", chapterId: "en_hv_chapter6" },
  { question: "Past simple van 'to think' is ____.", options: ["thought", "thinked", "thunk", "thinks"], correctAnswer: "thought", explanation: "Onregelmatig: think → thought.", topic: "Past simple (irregular)", chapterId: "en_hv_chapter6" },
  { question: "Past simple van 'to write' is ____.", options: ["wrote", "writed", "written", "writes"], correctAnswer: "wrote", explanation: "Onregelmatig: write → wrote.", topic: "Past simple (irregular)", chapterId: "en_hv_chapter6" },
  { question: "Past simple van 'to say' is ____.", options: ["said", "sayed", "sad", "says"], correctAnswer: "said", explanation: "Onregelmatig: say → said.", topic: "Past simple (irregular)", chapterId: "en_hv_chapter6" },
];

const hv6ToBePast: GrammarQuestion[] = [
  { question: "I ____ angry.", options: ["was", "were", "is", "am"], correctAnswer: "was", explanation: "Past simple van to be: I/he/she/it → was.", topic: "Past simple of 'to be'", chapterId: "en_hv_chapter6" },
  { question: "You ____ angry.", options: ["were", "was", "are", "is"], correctAnswer: "were", explanation: "You/we/they → were.", topic: "Past simple of 'to be'", chapterId: "en_hv_chapter6" },
  { question: "He ____ angry.", options: ["was", "were", "is", "are"], correctAnswer: "was", explanation: "He/she/it → was.", topic: "Past simple of 'to be'", chapterId: "en_hv_chapter6" },
  { question: "We ____ angry.", options: ["were", "was", "are", "is"], correctAnswer: "were", explanation: "We/you/they → were.", topic: "Past simple of 'to be'", chapterId: "en_hv_chapter6" },
  { question: "She ____ angry. (-)", options: ["wasn't", "weren't", "isn't", "doesn't"], correctAnswer: "wasn't", explanation: "Bij 'to be' gebruik je GEEN did/didn't, maar was not/wasn't.", topic: "Past simple of 'to be'", chapterId: "en_hv_chapter6" },
  { question: "They ____ angry. (-)", options: ["weren't", "wasn't", "didn't", "aren't"], correctAnswer: "weren't", explanation: "We/you/they → were not / weren't.", topic: "Past simple of 'to be'", chapterId: "en_hv_chapter6" },
  { question: "____ he angry? (?)", options: ["Was", "Were", "Did", "Is"], correctAnswer: "Was", explanation: "Bij vragen met 'to be' zet je was/were vóór het onderwerp.", topic: "Past simple of 'to be'", chapterId: "en_hv_chapter6" },
  { question: "____ they angry? (?)", options: ["Were", "Was", "Did", "Are"], correctAnswer: "Were", explanation: "Were + we/you/they.", topic: "Past simple of 'to be'", chapterId: "en_hv_chapter6" },
];

const hv6Possessive: GrammarQuestion[] = [
  { question: "Dit is het boek van mijn vriend(in). → This is my ____ book.", options: ["friend's", "friends'", "friend", "friends"], correctAnswer: "friend's", explanation: "Bezit van één persoon → 's: friend's.", topic: "Possessive 's / of", chapterId: "en_hv_chapter6" },
  { question: "Dit zijn de vrienden van mijn zussen. → These are my ____ friends.", options: ["sisters'", "sister's", "sisters", "sisterses"], correctAnswer: "sisters'", explanation: "Meervoud dat al eindigt op -s → alleen een apostrof erna: sisters'.", topic: "Possessive 's / of", chapterId: "en_hv_chapter6" },
  { question: "De kleren van de kinderen liggen boven. → The ____ clothes are upstairs.", options: ["children's", "childrens'", "childrens", "childs'"], correctAnswer: "children's", explanation: "Meervoud dat NIET op -s eindigt → 's: children's.", topic: "Possessive 's / of", chapterId: "en_hv_chapter6" },
  { question: "De dochter van Jess is op school. → ____ daughter is at school.", options: ["Jess's", "Jess'", "Jesss", "Jesses"], correctAnswer: "Jess's", explanation: "Bij namen op -s mag zowel 's als alleen ': Jess's / Jess'.", topic: "Possessive 's / of", chapterId: "en_hv_chapter6" },
  { question: "Hij stond op de voorkant van een tijdschrift. → He was on the ____ a magazine.", options: ["cover of", "cover's", "covers'", "cover"], correctAnswer: "cover of", explanation: "Bij DINGEN gebruik je '… of …', niet 's.", topic: "Possessive 's / of", chapterId: "en_hv_chapter6" },
  { question: "Het geluid van de machines is erg hard. → The ____ the machines is very loud.", options: ["noise of", "noise's", "noises'", "machines' noise"], correctAnswer: "noise of", explanation: "Bezit van DINGEN → … of …", topic: "Possessive 's / of", chapterId: "en_hv_chapter6" },
  { question: "We zijn in de stad Londen. → We are in the ____ London.", options: ["city of", "city's", "London's city", "Londons city"], correctAnswer: "city of", explanation: "Bij geografische locaties → … of …", topic: "Possessive 's / of", chapterId: "en_hv_chapter6" },
];

const hv6SomeAny: GrammarQuestion[] = [
  { question: "I have ____ good ideas for my party. (+)", options: ["some", "any", "no", "much"], correctAnswer: "some", explanation: "In bevestigende zinnen gebruik je some.", topic: "Some / Any", chapterId: "en_hv_chapter6" },
  { question: "Do you want ____ milk? (aanbod)", options: ["some", "any", "no", "many"], correctAnswer: "some", explanation: "In vragen waarin iets wordt aangeboden → some.", topic: "Some / Any", chapterId: "en_hv_chapter6" },
  { question: "Shall we buy ____ souvenirs? (voorstel)", options: ["some", "any", "much", "no"], correctAnswer: "some", explanation: "In vragen waarin iets wordt voorgesteld → some.", topic: "Some / Any", chapterId: "en_hv_chapter6" },
  { question: "Can I have ____ more sugar, please? (verzoek)", options: ["some", "any", "no", "much"], correctAnswer: "some", explanation: "In verzoeken → some.", topic: "Some / Any", chapterId: "en_hv_chapter6" },
  { question: "Have you got ____ plans for the weekend? (?)", options: ["any", "some", "no", "many"], correctAnswer: "any", explanation: "In gewone vragen (geen aanbod/verzoek) → any.", topic: "Some / Any", chapterId: "en_hv_chapter6" },
  { question: "There aren't ____ campgrounds in the city. (-)", options: ["any", "some", "no", "much"], correctAnswer: "any", explanation: "In ontkennende zinnen → any (not + any = 'geen').", topic: "Some / Any", chapterId: "en_hv_chapter6" },
  { question: "I have ____ idea what you mean. (= geen)", options: ["no", "any", "some", "much"], correctAnswer: "no", explanation: "'No' = niet + any. 'I have no idea' = 'I don't have any idea'.", topic: "Some / Any", chapterId: "en_hv_chapter6" },
];

export const allGrammarQuestions: GrammarQuestion[] = [
  ...ch1PersonalPronouns,
  ...ch1PossessivePronouns,
  ...ch1ToBe,
  ...ch1HaveGot,
  ...ch3PresentContinuous,
  ...ch2Plurals,
  ...ch2Demonstratives,
  ...ch2PresentSimple,
  ...ch4TagQuestions,
  ...ch4MuchMany,
  ...ch4Future,
  ...hv5WordOrder,
  ...hv5PastSimple,
  ...hv6Irregular,
  ...hv6ToBePast,
  ...hv6Possessive,
  ...hv6SomeAny,
];

export function getGrammarByChapter(chapterId: string): GrammarQuestion[] {
  return allGrammarQuestions.filter((q) => q.chapterId === chapterId);
}

export function getGrammarTopicsForChapter(chapterId: string): string[] {
  const set = new Set(getGrammarByChapter(chapterId).map((q) => q.topic));
  return Array.from(set);
}

export function getGrammarByTopic(topic: string, chapterId?: string): GrammarQuestion[] {
  return allGrammarQuestions.filter((q) => q.topic === topic && (!chapterId || q.chapterId === chapterId));
}

export function hasGrammarForChapter(chapterId: string): boolean {
  return allGrammarQuestions.some((q) => q.chapterId === chapterId);
}
