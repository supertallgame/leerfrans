import { createContext, useContext, useState, ReactNode } from "react";
import { DEFAULT_CHAPTER_ID, getActiveVocabulary, VocabItem } from "@/data/vocabulary";

interface ChapterContextType {
  chapterId: string;
  setChapterId: (id: string) => void;
  activeVocabulary: VocabItem[];
}

const ChapterContext = createContext<ChapterContextType>({
  chapterId: DEFAULT_CHAPTER_ID,
  setChapterId: () => {},
  activeVocabulary: getActiveVocabulary(DEFAULT_CHAPTER_ID),
});

export const useChapter = () => useContext(ChapterContext);

export const ChapterProvider = ({ children }: { children: ReactNode }) => {
  const [chapterId, setChapterId] = useState(() => {
    return localStorage.getItem("selectedChapter") || DEFAULT_CHAPTER_ID;
  });

  const handleSetChapter = (id: string) => {
    setChapterId(id);
    localStorage.setItem("selectedChapter", id);
  };

  return (
    <ChapterContext.Provider
      value={{
        chapterId,
        setChapterId: handleSetChapter,
        activeVocabulary: getActiveVocabulary(chapterId),
      }}
    >
      {children}
    </ChapterContext.Provider>
  );
};
