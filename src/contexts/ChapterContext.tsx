import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { DEFAULT_CHAPTER_ID, getActiveVocabulary, getDefaultChapterId, getChaptersForLanguage, VocabItem, Language } from "@/data/vocabulary";

interface ChapterContextType {
  chapterId: string;
  setChapterId: (id: string) => void;
  activeVocabulary: VocabItem[];
  language: Language;
  setLanguage: (lang: Language) => void;
}

const ChapterContext = createContext<ChapterContextType>({
  chapterId: DEFAULT_CHAPTER_ID,
  setChapterId: () => {},
  activeVocabulary: getActiveVocabulary(DEFAULT_CHAPTER_ID),
  language: "french",
  setLanguage: () => {},
});

export const useChapter = () => useContext(ChapterContext);

interface ChapterProviderProps {
  children: ReactNode;
  vocabTransform?: (items: VocabItem[]) => VocabItem[];
}

export const ChapterProvider = ({ children, vocabTransform }: ChapterProviderProps) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("selectedLanguage") as Language) || "french";
  });

  const [chapterId, setChapterIdState] = useState(() => {
    const saved = localStorage.getItem("selectedChapter") || DEFAULT_CHAPTER_ID;
    const validChapters = getChaptersForLanguage(
      (localStorage.getItem("selectedLanguage") as Language) || "french"
    );
    if (validChapters.some((c) => c.id === saved)) return saved;
    return getDefaultChapterId((localStorage.getItem("selectedLanguage") as Language) || "french");
  });

  const handleSetChapter = (id: string) => {
    setChapterIdState(id);
    localStorage.setItem("selectedChapter", id);
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("selectedLanguage", lang);
    const defaultId = getDefaultChapterId(lang);
    setChapterIdState(defaultId);
    localStorage.setItem("selectedChapter", defaultId);
  };

  const rawVocabulary = getActiveVocabulary(chapterId);
  const activeVocabulary = useMemo(
    () => (vocabTransform ? vocabTransform(rawVocabulary) : rawVocabulary),
    [rawVocabulary, vocabTransform]
  );

  return (
    <ChapterContext.Provider
      value={{
        chapterId,
        setChapterId: handleSetChapter,
        activeVocabulary,
        language,
        setLanguage: handleSetLanguage,
      }}
    >
      {children}
    </ChapterContext.Provider>
  );
};