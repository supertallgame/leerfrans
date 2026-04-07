// 50+ idle animation messages/actions the wizard performs after being idle
export interface IdleAnimation {
  emoji: string;
  text: string;
  duration: number; // ms to show
}

export const IDLE_ANIMATIONS: IdleAnimation[] = [
  // Bored actions
  { emoji: "🥱", text: "Geeuwt luid", duration: 2500 },
  { emoji: "😴", text: "Valt bijna in slaap...", duration: 3000 },
  { emoji: "💤", text: "Zzzzz...", duration: 3000 },
  { emoji: "😶", text: "Staart in de verte", duration: 2000 },
  { emoji: "🙄", text: "Rolt met de ogen", duration: 2000 },
  { emoji: "😒", text: "Zucht diep", duration: 2000 },
  { emoji: "🫠", text: "Smelt van verveling", duration: 2500 },
  { emoji: "😑", text: "Knippert langzaam", duration: 2000 },
  
  // Magic tricks
  { emoji: "✨", text: "Tovert vonken", duration: 2500 },
  { emoji: "🔮", text: "Kijkt in kristallen bol", duration: 3000 },
  { emoji: "🪄", text: "Zwaait met toverstok", duration: 2500 },
  { emoji: "⚡", text: "Schiet bliksem!", duration: 2000 },
  { emoji: "🌟", text: "Laat sterren draaien", duration: 2500 },
  { emoji: "💫", text: "Maakt een pirouette", duration: 2500 },
  { emoji: "🎆", text: "Vuurwerk!", duration: 2000 },
  { emoji: "🌈", text: "Tovert een regenboog", duration: 3000 },
  { emoji: "🦋", text: "Tovert vlinders", duration: 2500 },
  { emoji: "🕊️", text: "Een duif verschijnt!", duration: 2500 },
  { emoji: "🐇", text: "Trekt konijn uit hoed", duration: 3000 },
  
  // Physical actions
  { emoji: "🤸", text: "Doet een radslag", duration: 2500 },
  { emoji: "💪", text: "Spant spieren", duration: 2000 },
  { emoji: "🧘", text: "Mediteert even", duration: 3000 },
  { emoji: "🏋️", text: "Heft toverstok op", duration: 2500 },
  { emoji: "🤹", text: "Jongleert met sterren", duration: 3000 },
  { emoji: "💃", text: "Danst een jig", duration: 2500 },
  { emoji: "🕺", text: "Doet de moonwalk", duration: 2500 },
  { emoji: "🫡", text: "Salueert", duration: 2000 },
  { emoji: "🤷", text: "Haalt schouders op", duration: 2000 },
  { emoji: "👋", text: "Zwaait naar jou!", duration: 2000 },
  
  // Eating/drinking
  { emoji: "🍎", text: "Eet een appel", duration: 2500 },
  { emoji: "🧃", text: "Drinkt toverdrank", duration: 2500 },
  { emoji: "🍕", text: "Bestelt een pizza", duration: 3000 },
  { emoji: "☕", text: "Drinkt koffie", duration: 2500 },
  { emoji: "🍪", text: "Eet een koekje", duration: 2000 },
  { emoji: "🧁", text: "Tovert een cupcake", duration: 2500 },
  
  // Nature interactions
  { emoji: "🌸", text: "Ruikt aan bloem", duration: 2500 },
  { emoji: "🍂", text: "Vangt vallend blad", duration: 2500 },
  { emoji: "🌻", text: "Plant een zonnebloem", duration: 3000 },
  { emoji: "🐛", text: "Bekijkt een rups", duration: 2500 },
  { emoji: "🐌", text: "Race met slak", duration: 3000 },
  { emoji: "🦎", text: "Praat met hagedis", duration: 2500 },
  
  // Thoughts/emotions
  { emoji: "💭", text: "Denkt na over het leven", duration: 3000 },
  { emoji: "🤔", text: "Hmm... wat nu?", duration: 2500 },
  { emoji: "😊", text: "Glimlacht vrolijk", duration: 2000 },
  { emoji: "🥳", text: "Feestje voor 1!", duration: 2500 },
  { emoji: "😎", text: "Zet zonnebril op", duration: 2000 },
  { emoji: "🤠", text: "Cowboyhoed op!", duration: 2000 },
  { emoji: "🧐", text: "Bestudeert de kaart", duration: 2500 },
  { emoji: "📖", text: "Leest toverboek", duration: 3000 },
  
  // Silly actions
  { emoji: "🎵", text: "Zingt een liedje", duration: 2500 },
  { emoji: "🎶", text: "Fluit een deuntje", duration: 2500 },
  { emoji: "🎭", text: "Speelt toneel", duration: 2500 },
  { emoji: "🪩", text: "Discodansen!", duration: 2500 },
  { emoji: "🎸", text: "Speelt luchtgitaar", duration: 2500 },
  { emoji: "🥁", text: "Drumt op stenen", duration: 2500 },
  { emoji: "🎺", text: "Toetert op hoorn", duration: 2000 },
  { emoji: "🎤", text: "Karaoke time!", duration: 2500 },
  { emoji: "📱", text: "Checkt Instagram", duration: 2500 },
  { emoji: "🤳", text: "Maakt een selfie", duration: 2000 },
  { emoji: "🎮", text: "Speelt een spelletje", duration: 3000 },
  { emoji: "📺", text: "Kijkt Netflix", duration: 3000 },
];

export function getRandomIdleAnimation(): IdleAnimation {
  return IDLE_ANIMATIONS[Math.floor(Math.random() * IDLE_ANIMATIONS.length)];
}
