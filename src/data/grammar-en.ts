// Grammar exercises for English Chapter 4

export interface GrammarQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
}

const tagQuestions: GrammarQuestion[] = [
  { question: "You are a football player, _______?", options: ["aren't you", "isn't you", "don't you", "are you"], correctAnswer: "aren't you", explanation: "Bij een bevestigende (+) hoofdzin met 'are', gebruik je de ontkennende tag question 'aren't you?'", topic: "Tag Questions" },
  { question: "She isn't very strong, _______?", options: ["is she", "isn't she", "does she", "are she"], correctAnswer: "is she", explanation: "Bij een ontkennende (-) hoofdzin gebruik je een bevestigende (+) tag question.", topic: "Tag Questions" },
  { question: "She is very good, _______?", options: ["isn't she", "is she", "doesn't she", "aren't she"], correctAnswer: "isn't she", explanation: "Bevestigende hoofdzin → ontkennende tag question: 'isn't she?'", topic: "Tag Questions" },
  { question: "They are runners, _______?", options: ["aren't they", "are they", "isn't they", "don't they"], correctAnswer: "aren't they", explanation: "Bevestigende hoofdzin met 'are' → 'aren't they?'", topic: "Tag Questions" },
  { question: "I'm not a good swimmer, _______?", options: ["am I", "aren't I", "do I", "is I"], correctAnswer: "am I", explanation: "Ontkennende hoofdzin met 'I'm not' → bevestigende tag 'am I?'", topic: "Tag Questions" },
  { question: "I'm a fast runner, _______?", options: ["aren't I", "am I", "isn't I", "don't I"], correctAnswer: "aren't I", explanation: "Bevestigende hoofdzin met 'I'm' → ontkennende tag 'aren't I?'", topic: "Tag Questions" },
  { question: "The runners are very fast, _______?", options: ["aren't they", "are they", "isn't they", "don't they"], correctAnswer: "aren't they", explanation: "Bij een zelfstandig naamwoord in de hoofdzin gebruik je het bijbehorende persoonlijk voornaamwoord in de tag.", topic: "Tag Questions" },
  { question: "Baseball is a popular sport, _______?", options: ["isn't it", "is it", "aren't it", "doesn't it"], correctAnswer: "isn't it", explanation: "Baseball → 'it'. Bevestigende hoofdzin → ontkennende tag.", topic: "Tag Questions" },
];

const muchManyQuestions: GrammarQuestion[] = [
  { question: "I have got _______ wallets. (+)", options: ["a lot of", "many", "much", "a few"], correctAnswer: "a lot of", explanation: "Bevestigende zin + telbaar zelfstandig naamwoord → 'a lot of'.", topic: "Much/Many/A lot of" },
  { question: "She hasn't got _______ wallets. (-)", options: ["many", "a lot of", "much", "a few"], correctAnswer: "many", explanation: "Ontkennende zin + telbaar zelfstandig naamwoord → 'many'.", topic: "Much/Many/A lot of" },
  { question: "Have they got _______ wallets? (?)", options: ["many", "a lot of", "much", "a few"], correctAnswer: "many", explanation: "Vragende zin + telbaar zelfstandig naamwoord → 'many'.", topic: "Much/Many/A lot of" },
  { question: "I have got _______ time. (+)", options: ["a lot of", "many", "much", "a few"], correctAnswer: "a lot of", explanation: "Bevestigende zin + ontelbaar (time) → 'a lot of'.", topic: "Much/Many/A lot of" },
  { question: "They haven't got _______ time. (-)", options: ["much", "many", "a lot of", "a few"], correctAnswer: "much", explanation: "Ontkennende zin + ontelbaar (time) → 'much'.", topic: "Much/Many/A lot of" },
  { question: "Has he got _______ time? (?)", options: ["much", "many", "a lot of", "a few"], correctAnswer: "much", explanation: "Vragende zin + ontelbaar (time) → 'much'.", topic: "Much/Many/A lot of" },
  { question: "She has got _______ money. (+)", options: ["a lot of", "much", "many", "a few"], correctAnswer: "a lot of", explanation: "Bevestigende zin + ontelbaar (money) → 'a lot of'.", topic: "Much/Many/A lot of" },
  { question: "We haven't got _______ banknotes. (-)", options: ["many", "much", "a lot of", "a few"], correctAnswer: "many", explanation: "Ontkennende zin + telbaar (banknotes) → 'many'.", topic: "Much/Many/A lot of" },
];

const futureQuestions: GrammarQuestion[] = [
  { question: "I _______ have a sandwich. (voornemen)", options: ["'ll", "am going to", "shall", "'m going to"], correctAnswer: "'ll", explanation: "Bij voornemens of besluiten op het moment van spreken gebruik je 'will' ('ll).", topic: "Will/Shall/Going to" },
  { question: "The sun _______ rise tomorrow.", options: ["will", "is going to", "shall", "does"], correctAnswer: "will", explanation: "Bij gebeurtenissen die in de toekomst gaan gebeuren gebruik je 'will'.", topic: "Will/Shall/Going to" },
  { question: "They _______ back before noon. (negatief)", options: ["won't be", "aren't going to be", "shan't be", "don't be"], correctAnswer: "won't be", explanation: "Ontkennende toekomst met 'will not' = 'won't'.", topic: "Will/Shall/Going to" },
  { question: "I hope she _______ give me a present.", options: ["will", "is going to", "shall", "does"], correctAnswer: "will", explanation: "Bij wensen en veronderstellingen gebruik je 'will'.", topic: "Will/Shall/Going to" },
  { question: "I think you _______ be lucky today.", options: ["'ll", "'re going to", "shall", "do"], correctAnswer: "'ll", explanation: "Bij veronderstellingen: 'I think you'll...'", topic: "Will/Shall/Going to" },
  { question: "_______ we go to the cinema?", options: ["Shall", "Will", "Are", "Do"], correctAnswer: "Shall", explanation: "'Shall' gebruik je in vragen met 'I' of 'we' om een voorstel te doen.", topic: "Will/Shall/Going to" },
  { question: "They're _______ visit the zoo tomorrow. (plan)", options: ["going to", "will", "shall", "wanting to"], correctAnswer: "going to", explanation: "Bij plannen die al gemaakt waren gebruik je 'to be going to'.", topic: "Will/Shall/Going to" },
  { question: "I'm _______ be a doctor. (plan)", options: ["going to", "will", "shall", "wanting to"], correctAnswer: "going to", explanation: "Bij plannen die al gemaakt waren: 'I'm going to...'", topic: "Will/Shall/Going to" },
  { question: "Look at the sky. It _______ rain. (voorspelling op aanwijzingen)", options: ["isn't going to", "won't", "shan't", "doesn't"], correctAnswer: "isn't going to", explanation: "Bij voorspellingen gebaseerd op aanwijzingen gebruik je 'to be going to'.", topic: "Will/Shall/Going to" },
  { question: "_______ you cook dinner for me?", options: ["Will", "Shall", "Are", "Do"], correctAnswer: "Will", explanation: "Bij verzoeken gebruik je 'Will you...?'", topic: "Will/Shall/Going to" },
];

export const allGrammarQuestions: GrammarQuestion[] = [
  ...tagQuestions,
  ...muchManyQuestions,
  ...futureQuestions,
];

export const grammarTopics = ["Tag Questions", "Much/Many/A lot of", "Will/Shall/Going to"] as const;

export function getGrammarByTopic(topic: string): GrammarQuestion[] {
  return allGrammarQuestions.filter(q => q.topic === topic);
}
