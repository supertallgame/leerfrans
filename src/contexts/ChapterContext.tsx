import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { DEFAULT_CHAPTER_ID, getActiveVocabulary, getDefaultChapterId, getChaptersForLanguage, getSectionsForChapter, VocabItem, Language } from "@/data/vocabulary";

interface ChapterContextType {
  chapterId: string;
  setChapterId: (id: string) => void;
  activeVocabulary: VocabItem[];
  language: Language;
  setLanguage: (lang: Language) => void;
  selectedSections: string[];
  setSelectedSections: (sections: string[]) => void;
  availableSections: string[];
}

const ChapterContext = createContext<ChapterContextType>({
  chapterId: DEFAULT_CHAPTER_ID,
  setChapterId: () => {},
  activeVocabulary: getActiveVocabulary(DEFAULT_CHAPTER_ID),
  language: "french",
  setLanguage: () => {},
  selectedSections: [],
  setSelectedSections: () => {},
  availableSections: [],
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

  const [selectedSections, setSelectedSectionsState] = useState<string[]>(() => {
    const saved = localStorage.getItem("selectedSections");
    return saved ? JSON.parse(saved) : [];
  });

  const handleSetChapter = (id: string) => {
    setChapterIdState(id);
    localStorage.setItem("selectedChapter", id);
    // Reset sections when chapter changes
    setSelectedSectionsState([]);
    localStorage.removeItem("selectedSections");
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("selectedLanguage", lang);
    const defaultId = getDefaultChapterId(lang);
    setChapterIdState(defaultId);
    localStorage.setItem("selectedChapter", defaultId);
    setSelectedSectionsState([]);
    localStorage.removeItem("selectedSections");
  };

  const handleSetSections = (sections: string[]) => {
    setSelectedSectionsState(sections);
    if (sections.length > 0) {
      localStorage.setItem("selectedSections", JSON.stringify(sections));
    } else {
      localStorage.removeItem("selectedSections");
    }
  };

  const availableSections = useMemo(() => getSectionsForChapter(chapterId), [chapterId]);

  // Validate saved sections against available ones
  const validSections = useMemo(() => {
    if (availableSections.length === 0) return [];
    return selectedSections.filter((s) => availableSections.includes(s));
  }, [selectedSections, availableSections]);

  const rawVocabulary = getActiveVocabulary(chapterId);
  const filteredVocabulary = useMemo(() => {
    if (validSections.length === 0 || availableSections.length === 0) return rawVocabulary;
    return rawVocabulary.filter((w) => w.section && validSections.includes(w.section));
  }, [rawVocabulary, validSections, availableSections]);

  const activeVocabulary = useMemo(
    () => (vocabTransform ? vocabTransform(filteredVocabulary) : filteredVocabulary),
    [filteredVocabulary, vocabTransform]
  );

  return (
    <ChapterContext.Provider
      value={{
        chapterId,
        setChapterId: handleSetChapter,
        activeVocabulary,
        language,
        setLanguage: handleSetLanguage,
        selectedSections: validSections,
        setSelectedSections: handleSetSections,
        availableSections,
      }}
    >
      {children}
    </ChapterContext.Provider>
  );
};