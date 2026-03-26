import { createContext, useContext, useState, ReactNode } from "react";
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

export const ChapterProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("selectedLanguage") as Language) || "french";
  });

  const [chapterId, setChapterIdState] = useState(() => {
    const saved = localStorage.getItem("selectedChapter") || DEFAULT_CHAPTER_ID;
    // Validate saved chapter belongs to current language
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
    // Switch to default chapter for the new language
    const defaultId = getDefaultChapterId(lang);
    setChapterIdState(defaultId);
    localStorage.setItem("selectedChapter", defaultId);
  };

  return (
    <ChapterContext.Provider
      value={{
        chapterId,
        setChapterId: handleSetChapter,
        activeVocabulary: getActiveVocabulary(chapterId),
        language,
        setLanguage: handleSetLanguage,
      }}
    >
      {children}
    </ChapterContext.Provider>
  );
};
