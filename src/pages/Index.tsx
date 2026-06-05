import { useState, useEffect, lazy, Suspense } from "react";
import { useThemeSync } from "@/hooks/use-theme-sync";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Puzzle, Keyboard, Users, PenTool, MessageSquare, Bot, Settings, Star, Lock, BookMarked, FlaskConical, CheckCircle, Layers, Microscope, Bone, Clock, BookType, Map, ShieldCheck, GraduationCap, Hash, BookText, LifeBuoy, ShieldQuestion, MessagesSquare, Music2, VolumeX } from "lucide-react";
import polarExpressImg from "@/assets/polar-express.png";
import { FlagNL, FlagFR } from "@/components/Flags";
import { getChaptersForLanguage, getChapter, getForeignLabel, getForeignLabelNative, Language, Niveau } from "@/data/vocabulary";
import { hasGrammarForChapter } from "@/data/grammar-en";
import { useChapter } from "@/contexts/ChapterContext";
import { Switch } from "@/components/ui/switch";
import SettingsDialog from "@/components/SettingsDialog";
import ObamaPopup from "@/components/ObamaPopup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AuthDialog from "@/components/AuthDialog";
import { supabase } from "@/integrations/supabase/client";
import { safeSignOut } from "@/lib/auth";
import { usePollingInterval } from "@/lib/usePollingInterval";
import { toast } from "sonner";
import UpdateBanner from "@/components/UpdateBanner";
import SupportDialog from "@/components/support/SupportDialog";
import AdminApplyDialog from "@/components/support/AdminApplyDialog";
import StaffChat from "@/components/staff/StaffChat";
import OnboardingTour, { type TourStep } from "@/components/OnboardingTour";

const Flashcards = lazy(() => import("@/components/games/Flashcards"));
const MultipleChoice = lazy(() => import("@/components/games/MultipleChoice"));
const MatchPairs = lazy(() => import("@/components/games/MatchPairs"));
const TypeAnswer = lazy(() => import("@/components/games/TypeAnswer"));
const Multiplayer = lazy(() => import("@/components/games/Multiplayer"));
const FillLetters = lazy(() => import("@/components/games/FillLetters"));
const SentenceFill = lazy(() => import("@/components/games/SentenceFill"));
const AiChat = lazy(() => import("@/components/games/AiChat"));
const TrueOrFalse = lazy(() => import("@/components/games/TrueOrFalse"));
const MemoryGame = lazy(() => import("@/components/games/MemoryGame"));
const SkeletonLabel = lazy(() => import("@/components/games/SkeletonLabel"));
const ClockTimes = lazy(() => import("@/components/games/ClockTimes"));
const EtreConjugation = lazy(() => import("@/components/games/EtreConjugation"));
const FrenchExplorer = lazy(() => import("@/components/games/FrenchExplorer"));
const GrammarQuiz = lazy(() => import("@/components/games/GrammarQuiz"));
const Chapitre1Grammaire = lazy(() => import("@/components/games/Chapitre1Grammaire"));
const Chapitre2Grammaire = lazy(() => import("@/components/games/Chapitre2Grammaire"));
const Chapitre3Grammaire = lazy(() => import("@/components/games/Chapitre3Grammaire"));
const Chapitre5Grammaire = lazy(() => import("@/components/games/Chapitre5Grammaire"));
const Chapitre6Grammaire = lazy(() => import("@/components/games/Chapitre6Grammaire"));
const EnglishClockTimes = lazy(() => import("@/components/games/EnglishClockTimes"));
const NaskSpeedStories = lazy(() => import("@/components/games/NaskSpeedStories"));

type Game = "menu" | "flashcards" | "quiz" | "match" | "type" | "multiplayer" | "fill" | "sentence" | "ai" | "truefalse" | "memory" | "skeleton" | "clocktimes" | "etre" | "explorer" | "grammar" | "grammaire1" | "grammaire2" | "grammaire3" | "grammaire5" | "grammaire6" | "enclock" | "naskspeed";

const languageGames = [
  { id: "flashcards" as Game, title: "Flashcards", description: "Draai kaarten om en leer de woorden", icon: BookOpen, color: "bg-primary/10 text-primary" },
  { id: "quiz" as Game, title: "Meerkeuze Quiz", description: "Kies het juiste antwoord uit 4 opties", icon: Brain, color: "bg-secondary/20 dark:bg-secondary/30 text-secondary-foreground" },
  { id: "match" as Game, title: "Koppel Paren", description: "Verbind de Nederlandse en vreemde woorden", icon: Puzzle, color: "bg-accent/10 text-accent" },
  { id: "type" as Game, title: "Typ het Antwoord", description: "Typ de vertaling zelf in", icon: Keyboard, color: "bg-destructive/10 text-destructive" },
  { id: "memory" as Game, title: "Memory", description: "Vind de paren onder de kaarten", icon: Layers, color: "bg-secondary/20 dark:bg-secondary/30 text-secondary-foreground" },
  { id: "fill" as Game, title: "Ontbrekende Letters", description: "Vul de ontbrekende letters in het woord aan", icon: PenTool, color: "bg-primary/10 text-primary" },
  { id: "sentence" as Game, title: "Zin Aanvullen", description: "Kies het ontbrekende woord in de zin", icon: MessageSquare, color: "bg-accent/10 text-accent" },
  { id: "ai" as Game, title: "AI Leraar", description: "Chat met een AI die je overhoort", icon: Bot, color: "bg-secondary/20 dark:bg-secondary/30 text-secondary-foreground" },
  { id: "clocktimes" as Game, title: "Kloktijden", description: "Leer hoe je de tijd zegt in het Frans", icon: Clock, color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]", frenchOnly: true },
  { id: "etre" as Game, title: "Être (zijn)", description: "Oefen de vervoeging van être", icon: BookType, color: "bg-destructive/10 text-destructive", frenchOnly: true },
  { id: "explorer" as Game, title: "Verkenner", description: "Loop rond, beantwoord vragen en verzamel sterren", icon: Map, color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]", frenchOnly: true },
  { id: "grammar" as Game, title: "Grammar Quiz", description: "Oefen Engelse grammatica-regels", icon: BookText, color: "bg-primary/10 text-primary", englishOnly: true },
  { id: "enclock" as Game, title: "Telling the Time", description: "Lees de klok in het Engels", icon: Clock, color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]", englishOnly: true },
  { id: "grammaire1" as Game, title: "Grammaire (Ch. 1)", description: "Het lidwoord & het werkwoord avoir", icon: BookText, color: "bg-primary/10 text-primary", frenchOnly: true },
  { id: "grammaire2" as Game, title: "Grammaire (Ch. 2)", description: "Werkwoorden op -er & ontkenning ne…pas", icon: BookText, color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]", frenchOnly: true },
  { id: "grammaire3" as Game, title: "Grammaire (Ch. 3)", description: "Het werkwoord être & bezittelijke vnw.", icon: BookText, color: "bg-accent/10 text-accent", frenchOnly: true },
  { id: "grammaire5" as Game, title: "Grammaire (Ch. 5)", description: "Le passé composé & bijvoeglijk naamwoord", icon: BookText, color: "bg-destructive/10 text-destructive", frenchOnly: true },
  { id: "grammaire6" as Game, title: "Grammaire (Ch. 6)", description: "Vragen stellen, aller & futur proche", icon: BookText, color: "bg-primary/10 text-primary", frenchOnly: true },
];

const naskGames = [
  { id: "flashcards" as Game, title: "Flashcards", description: "Draai kaarten om en leer begrippen", icon: BookOpen, color: "bg-primary/10 text-primary" },
  { id: "quiz" as Game, title: "Meerkeuze Quiz", description: "Kies de juiste omschrijving", icon: Brain, color: "bg-secondary/20 dark:bg-secondary/30 text-secondary-foreground" },
  { id: "truefalse" as Game, title: "Waar of Onwaar", description: "Klopt de omschrijving bij het begrip?", icon: CheckCircle, color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" },
  
  { id: "type" as Game, title: "Typ het Begrip", description: "Lees de omschrijving en typ het begrip", icon: Keyboard, color: "bg-primary/10 text-primary" },
  { id: "ai" as Game, title: "AI Leraar", description: "Chat met een AI die je overhoort", icon: Bot, color: "bg-secondary/20 dark:bg-secondary/30 text-secondary-foreground" },
  { id: "naskspeed" as Game, title: "Snelheid Verhalen", description: "Reken snelheid, afstand en tijd uit verhalen", icon: Hash, color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" },
];

const biologyGames = [
  { id: "skeleton" as Game, title: "Skelet Benoemen", description: "Benoem alle botten van het skelet", icon: Bone, color: "bg-primary/10 text-primary" },
  { id: "flashcards" as Game, title: "Flashcards", description: "Draai kaarten om en leer begrippen", icon: BookOpen, color: "bg-secondary/20 dark:bg-secondary/30 text-secondary-foreground" },
  { id: "quiz" as Game, title: "Meerkeuze Quiz", description: "Kies de juiste omschrijving", icon: Brain, color: "bg-accent/10 text-accent" },
  { id: "truefalse" as Game, title: "Waar of Onwaar", description: "Klopt de omschrijving bij het begrip?", icon: CheckCircle, color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" },
  { id: "match" as Game, title: "Koppel Paren", description: "Verbind begrippen met omschrijvingen", icon: Puzzle, color: "bg-primary/10 text-primary" },
  { id: "type" as Game, title: "Typ het Begrip", description: "Lees de omschrijving en typ het begrip", icon: Keyboard, color: "bg-accent/10 text-accent" },
  { id: "ai" as Game, title: "AI Leraar", description: "Chat met een AI die je overhoort", icon: Bot, color: "bg-secondary/20 dark:bg-secondary/30 text-secondary-foreground" },
];

const FlagEN = ({ className = "w-5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 640 480" className={className} aria-label="English">
    <rect width="640" height="480" fill="#012169" />
    <path d="M75 0l244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z" fill="#FFF" />
    <path d="M424 281l216 159v40L369 281h55zm-184 20l6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z" fill="#C8102E" />
    <path d="M241 0v480h160V0H241zM0 160v160h640V160H0z" fill="#FFF" />
    <path d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" fill="#C8102E" />
  </svg>
);

const Index = () => {
  const navigate = useNavigate();
  const { chapterId, setChapterId, activeVocabulary, language, setLanguage, selectedSections, setSelectedSections, availableSections, niveau, setNiveau } = useChapter();
  const [activeGame, setActiveGame] = useState<Game>("menu");
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterPicker, setShowChapterPicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [showNiveauPicker, setShowNiveauPicker] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [disabledSubjects, setDisabledSubjects] = useState<string[]>([]);
  const [explorerEnabled, setExplorerEnabled] = useState(false);
  const [aiTeacherEnabled, setAiTeacherEnabled] = useState(false);
  const [disabledNiveaus, setDisabledNiveaus] = useState<string[]>([]);
  const [isHeadAdmin, setIsHeadAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [polarExpressEnabled, setPolarExpressEnabled] = useState(false);
  const [obamaEnabled, setObamaEnabled] = useState(false);
  const [includeGrammar, setIncludeGrammar] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [showStaffChat, setShowStaffChat] = useState(false);
  const [onboardingEnabled, setOnboardingEnabled] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isEminem, setIsEminem] = useState(false);
  const [eminemMusicOn, setEminemMusicOn] = useState(false);

  const chaptersForLanguage = getChaptersForLanguage(language, niveau);
  const foreignLabel = getForeignLabel(language);
  const foreignLabelNative = getForeignLabelNative(language);

  useThemeSync();

  const ALL_SUBJECT_IDS: Language[] = ["french", "english", "nask", "biology"];

  // Fetch settings for instant updates (poll only while tab is visible)
  const fetchSettings = () => {
    (supabase.rpc as any)("get_public_settings_bulk").then(({ data }: { data: any }) => {
      if (!data || typeof data !== "object") return;
      if (Array.isArray(data.disabled_subjects)) setDisabledSubjects(data.disabled_subjects as string[]);
      setExplorerEnabled(data.explorer_enabled === true);
      setAiTeacherEnabled(data.ai_teacher_enabled === true);
      if (Array.isArray(data.disabled_niveaus)) setDisabledNiveaus(data.disabled_niveaus as string[]);
      setPolarExpressEnabled(data.polar_express_enabled === true);
      setObamaEnabled(data.obama_enabled === true);
      setOnboardingEnabled(data.onboarding_enabled === true);
    });
  };

  useEffect(() => {
    fetchSettings();

    // Check IP/VPN on load (fire-and-forget) with 1h localStorage cache
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const CACHE_KEY = "check-ip-result";
        const ONE_HOUR = 3600000;
        try {
          const raw = localStorage.getItem(CACHE_KEY);
          if (raw) {
            const cached = JSON.parse(raw);
            if (typeof cached.ts === "number" && Date.now() - cached.ts < ONE_HOUR) {
              if (cached.banned) {
                safeSignOut();
                window.location.reload();
              }
              return;
            }
          }
        } catch {}
        supabase.functions.invoke("check-ip").then(({ data }) => {
          const banned = !!data?.banned;
          localStorage.setItem(CACHE_KEY, JSON.stringify({ banned, ts: Date.now() }));
          if (banned) {
            safeSignOut();
            window.location.reload();
          }
        }).catch(() => {});
      }
    });
  }, []);

  usePollingInterval(fetchSettings, 60000);

  // If language becomes disabled, redirect to first available and kick back to menu
  useEffect(() => {
    if (disabledSubjects.includes(language)) {
      const available = ALL_SUBJECT_IDS.filter((id) => !disabledSubjects.includes(id));
      if (available.length > 0) {
        setLanguage(available[0]);
      }
      if (activeGame !== "menu") {
        setActiveGame("menu");
        toast.info("Dit vak is momenteel uitgeschakeld door de beheerder.");
      }
    }
  }, [disabledSubjects, language]);

  useEffect(() => {
    const checkRoles = async (userId: string | undefined) => {
      if (!userId) { setIsHeadAdmin(false); setIsStaff(false); setIsEminem(false); return; }
      const OWNER_EMAILS = ["brankovantland@gmail.com", "branko18vantland@gmail.com"];
      const { data: { session } } = await supabase.auth.getSession();
      // Check eminem role (independent of staff hierarchy)
      const { data: roleRows } = await supabase.rpc("get_staff_user_roles", { _user_ids: [userId] });
      const roles = ((roleRows as any[]) || []).map(r => r.role);
      setIsEminem(roles.includes("eminem"));
      if (session?.user?.email && OWNER_EMAILS.includes(session.user.email)) {
        setIsHeadAdmin(true);
        setIsStaff(true);
        return;
      }
      const { data: staffRole } = await supabase.rpc("get_my_staff_role");
      const role = staffRole as string | null;
      setIsHeadAdmin(role === "head_admin");
      // Testers/head_testers must explicitly enable admin-mode in /tester or
      // /headtester before staff features (badge, staff chat, etc.) become active.
      const testerAdminMode = localStorage.getItem("tester_admin_mode") === "1";
      const isActiveTester = (role === "tester" || role === "head_tester") && testerAdminMode;
      setIsStaff(role === "owner" || role === "head_admin" || role === "admin" || isActiveTester);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      checkRoles(session?.user?.id);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      checkRoles(session?.user?.id);
    });
    // React when the tester toggles admin-mode in another tab/page
    const onStorage = (e: StorageEvent) => {
      if (e.key === "tester_admin_mode") {
        supabase.auth.getSession().then(({ data: { session } }) => checkRoles(session?.user?.id));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Show onboarding tour once per account when enabled by admins.
  // Existing accounts (created before this cutoff) are auto-marked as seen
  // so only brand-new users get the tour.
  const ONBOARDING_CUTOFF = "2026-06-05T11:00:00Z";
  useEffect(() => {
    if (!user || !onboardingEnabled || authLoading || activeGame !== "menu") return;
    const key = `onboarding_seen_${user.id}`;
    if (localStorage.getItem(key)) return;
    const createdAt = (user as any).created_at as string | undefined;
    if (createdAt && new Date(createdAt).getTime() < new Date(ONBOARDING_CUTOFF).getTime()) {
      localStorage.setItem(key, "1");
      return;
    }
    const t = window.setTimeout(() => setShowOnboarding(true), 600);
    return () => window.clearTimeout(t);
  }, [user, onboardingEnabled, authLoading, activeGame]);

  const finishOnboarding = () => {
    setShowOnboarding(false);
    if (user) localStorage.setItem(`onboarding_seen_${user.id}`, "1");
  };

  const tourSteps: TourStep[] = [
    { target: "subject-pill", title: "Kies je vak", description: "Wissel hier tussen Frans, Engels, NASK en Biologie." },
    { target: "niveau-pill", title: "Kies je niveau", description: "Schakel tussen VMBO-HAVO en HAVO-VWO (alleen bij talen)." },
    { target: "chapter-pill", title: "Kies een hoofdstuk", description: "Selecteer welke unit of chapter je wilt oefenen." },
    { target: "section-pill", title: "Kies secties", description: "Beperk de woordenlijst tot specifieke paragrafen." },
    { target: "game-grid", title: "Kies een spel", description: "Klik op een tegel om met dat spel te beginnen." },
    { target: "btn-support", title: "Hulp & bugs", description: "Stel een vraag of meld een bug aan het team." },
    { target: "btn-apply", title: "Word admin", description: "Solliciteer hier om admin te worden." },
    { target: "btn-reviews", title: "Reviews", description: "Lees of schrijf reviews over de app." },
    { target: "btn-settings", title: "Instellingen", description: "Wijzig thema, account en andere voorkeuren." },
  ];


  const handleSettingsClick = () => {
    if (!user) {
      setShowLoginPrompt(true);
    } else {
      setShowSettings(true);
    }
  };


  const gameLoader = <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  if (activeGame === "flashcards") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><Flashcards onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "quiz") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><MultipleChoice onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "match") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><MatchPairs onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "type") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><TypeAnswer onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "multiplayer") return <Suspense fallback={gameLoader}><Multiplayer onBack={() => setActiveGame("menu")} /></Suspense>;
  if (activeGame === "fill") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><FillLetters onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "sentence") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><SentenceFill onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "ai") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><AiChat onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "truefalse") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><TrueOrFalse onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "memory") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><MemoryGame onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "skeleton") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><SkeletonLabel onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "clocktimes") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><ClockTimes onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "etre") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><EtreConjugation onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "explorer") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><FrenchExplorer onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "grammar") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><GrammarQuiz onBack={() => setActiveGame("menu")} chapterId={chapterId} /></div></Suspense>;
  if (activeGame === "grammaire1") return <Suspense fallback={gameLoader}><Chapitre1Grammaire onBack={() => setActiveGame("menu")} /></Suspense>;
  if (activeGame === "grammaire2") return <Suspense fallback={gameLoader}><Chapitre2Grammaire onBack={() => setActiveGame("menu")} /></Suspense>;
  if (activeGame === "grammaire3") return <Suspense fallback={gameLoader}><Chapitre3Grammaire onBack={() => setActiveGame("menu")} /></Suspense>;
  if (activeGame === "grammaire5") return <Suspense fallback={gameLoader}><Chapitre5Grammaire onBack={() => setActiveGame("menu")} /></Suspense>;
  if (activeGame === "grammaire6") return <Suspense fallback={gameLoader}><Chapitre6Grammaire onBack={() => setActiveGame("menu")} /></Suspense>;
  if (activeGame === "enclock") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><EnglishClockTimes onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "naskspeed") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><NaskSpeedStories onBack={() => setActiveGame("menu")} /></div></Suspense>;

  const hasSentences = activeVocabulary.some((v) => v.french.includes(" ") && v.french.length > 15);
  const isVmboHavoCh3 = niveau === "vmbo-havo" && chapterId === "chapitre3";
  const isEnglishCh4 = language === "english" && (chapterId === "en_chapter4" || chapterId === "en_hv_chapter4");
  const isEnglishCh2 = language === "english" && chapterId === "en_chapter2";
  const isVhCh1 = language === "french" && niveau === "vmbo-havo" && chapterId === "chapitre1";
  const isVhCh2 = language === "french" && niveau === "vmbo-havo" && chapterId === "chapitre2";
  const isVhCh3 = language === "french" && niveau === "vmbo-havo" && chapterId === "chapitre3";
  const isVhCh5 = language === "french" && ((niveau === "vmbo-havo" && chapterId === "chapitre5") || (niveau === "havo-vwo" && chapterId === "hv_chapitre5"));
  const isVhCh6 = language === "french" && niveau === "vmbo-havo" && chapterId === "chapitre6";
  const chapterHasGrammar = language === "english" && hasGrammarForChapter(chapterId);
  const filterAiTeacher = (list: typeof languageGames) => aiTeacherEnabled ? list : list.filter(g => g.id !== "ai");
  const isNaskCh4 = language === "nask" && chapterId === "nask_chapter4";
  const games = language === "biology" ? filterAiTeacher(biologyGames) : (language === "nask") ? filterAiTeacher(naskGames).filter((g) => {
    if (g.id === "naskspeed" && !isNaskCh4) return false;
    return true;
  }) : filterAiTeacher(languageGames).filter((g) => {
    if ((g as any).frenchOnly && language !== "french") return false;
    if ((g as any).englishOnly && language !== "english") return false;
    if (g.id === "grammar" && !chapterHasGrammar) return false;
    // grammar tile is shown whenever the chapter has grammar; no extra toggle gating
    if (g.id === "enclock" && !isEnglishCh2) return false;
    if (g.id === "grammaire1" && !isVhCh1) return false;
    if (g.id === "grammaire2" && !isVhCh2) return false;
    if (g.id === "grammaire3" && !isVhCh3) return false;
    if (g.id === "grammaire5" && !isVhCh5) return false;
    if (g.id === "grammaire6" && !isVhCh6) return false;
    if (g.id === "explorer" && !explorerEnabled) return false;
    if (g.id === "sentence" && !hasSentences) return false;
    if ((g.id === "etre" || g.id === "clocktimes") && !isVmboHavoCh3) return false;
    return true;
  });

  const allSubjectsDisabled = ALL_SUBJECT_IDS.every((id) => disabledSubjects.includes(id));

  if (allSubjectsDisabled) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-5xl">🚧</p>
          <h1 className="text-2xl font-bold text-foreground">Tijdelijk niet beschikbaar</h1>
          <p className="text-muted-foreground">
            Alle vakken zijn momenteel uitgeschakeld. Probeer het later opnieuw.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-3 py-6 md:px-4 md:py-12">
      <div className="max-w-2xl w-full flex flex-col items-center gap-5 md:gap-8">
        <div className="flex items-center justify-between w-full mb-1">
          <div className="w-10" />
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-medium tracking-wide uppercase whitespace-nowrap">
            {language === "nask" ? (
              <><FlaskConical className="w-4 h-4 md:w-5 md:h-4 shrink-0" /> NASK</>
            ) : language === "biology" ? (
              <><Microscope className="w-4 h-4 md:w-5 md:h-4 shrink-0" /> Biologie</>
            ) : (
              <><FlagNL className="w-4 h-3 md:w-5 md:h-3.5 rounded-sm shrink-0" /> Nederlands ↔ {foreignLabelNative} {language === "french" ? <FlagFR className="w-4 h-3 md:w-5 md:h-3.5 rounded-sm shrink-0" /> : <FlagEN className="w-4 h-3 md:w-5 md:h-3.5 rounded-sm shrink-0" />}</>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            {isHeadAdmin && (
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate("/headadmin")} aria-label="Head Admin">
                <ShieldCheck className="h-5 w-5" />
              </Button>
            )}
            {isStaff && (
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setShowStaffChat(true)} aria-label="Staff Chat">
                <MessagesSquare className="h-5 w-5" />
              </Button>
            )}
            <Button data-tour="btn-support" variant="ghost" size="icon" className="h-9 w-9" onClick={() => setShowSupport(true)} aria-label="Support / Bug">
              <LifeBuoy className="h-5 w-5" />
            </Button>
            {user && !isStaff && (
              <Button data-tour="btn-apply" variant="ghost" size="icon" className="h-9 w-9" onClick={() => setShowApply(true)} aria-label="Admin worden">
                <ShieldQuestion className="h-5 w-5" />
              </Button>
            )}
            <Button data-tour="btn-reviews" variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate("/reviews")} aria-label="Reviews">
              <Star className="h-5 w-5" />
            </Button>
            <Button data-tour="btn-settings" variant="ghost" size="icon" className="h-9 w-9" onClick={handleSettingsClick} aria-label="Instellingen">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="text-center space-y-2 md:space-y-3 w-full">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            {(language === "nask" || language === "biology") ? (language === "biology" ? "Biologie Leren" : "NASK Leren") : "Woordjes Leren"}
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-md mx-auto">
            {(language === "nask" || language === "biology") ? "Kies een spel en oefen je begrippen" : "Kies een spel en oefen je woordenschat"}
          </p>

          {/* Language, niveau & chapter badges */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              data-tour="subject-pill"
              onClick={() => setShowLanguagePicker(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              {language === "nask" ? <FlaskConical className="h-3.5 w-3.5" /> : language === "biology" ? <Microscope className="h-3.5 w-3.5" /> : language === "french" ? <FlagFR className="w-4 h-3 rounded-sm" /> : <FlagEN className="w-4 h-3 rounded-sm" />}
              {language === "nask" ? "NASK" : language === "biology" ? "Biologie" : language === "french" ? "Frans" : "Engels"}
            </button>
            {(language === "french" || language === "english") && (
              <button
                data-tour="niveau-pill"
                onClick={() => setShowNiveauPicker(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                {niveau === "vmbo-havo" ? "VMBO-HAVO" : "HAVO-VWO"}
              </button>
            )}
            <button
              data-tour="chapter-pill"
              onClick={() => setShowChapterPicker(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <BookMarked className="h-3.5 w-3.5" />
              {getChapter(chapterId)?.title ?? "Unit"}
            </button>
            {availableSections.length > 0 && (
              <button
                data-tour="section-pill"
                onClick={() => setShowSectionPicker(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5" />
                {selectedSections.length === 0 || selectedSections.length === availableSections.length ? "Alle woorden" : selectedSections.sort().join(", ")}
              </button>
            )}
          </div>
        </div>

        <UpdateBanner />

        <div data-tour="game-grid" className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 md:gap-4 w-full">
          {games.map((game) => (
            <Card
              key={game.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]"
              onClick={() => setActiveGame(game.id)}
            >
              <CardContent className="p-3 md:p-6 flex flex-col gap-2 md:gap-3">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${game.color}`}>
                  <game.icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <h2 className="text-sm md:text-lg font-semibold leading-tight">{game.title}</h2>
                  <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">{game.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card
          className="w-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5"
          onClick={() => setActiveGame("multiplayer")}
        >
          <CardContent className="p-4 md:p-6 flex items-center gap-3 md:gap-4">
            <div className="w-11 h-11 md:w-14 md:h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-bold">🎮 Multiplayer Quiz</h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Speel tegen je vrienden met een deelcode!
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 w-full">
          <Card className="flex-1 bg-muted/50">
            <CardContent className="p-3 md:p-4 text-center">
              <p className="text-xs md:text-sm text-muted-foreground">
                📚 <span className="font-medium">{activeVocabulary.length} {(language === "nask" || language === "biology") ? "begrippen" : "woorden & zinnen"}</span>
              </p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] bg-primary/5 border-primary/20"
            onClick={() => navigate("/feedback")}
          >
            <CardContent className="p-3 md:p-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-xs md:text-sm font-medium text-primary">Feedback</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chapter picker dialog */}
      <Dialog open={showChapterPicker} onOpenChange={setShowChapterPicker}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Kies een {(language === "nask" || language === "biology") ? "Hoofdstuk" : "Unit"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            {chaptersForLanguage.map((ch) => {
              const locked = ch.requiresLogin && !user;
              const isActive = chapterId === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => { if (!locked) { setChapterId(ch.id); setShowChapterPicker(false); } }}
                  disabled={locked}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                    isActive
                      ? "border-primary bg-primary/10 font-medium"
                      : locked
                      ? "border-muted bg-muted/50 opacity-60 cursor-not-allowed"
                      : "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{ch.title}</span>
                    {locked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                  </div>
                  <span className="text-xs text-muted-foreground">{ch.description} · {ch.words.length} woorden</span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Language picker dialog */}
      <Dialog open={showLanguagePicker} onOpenChange={setShowLanguagePicker}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Kies een vak</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            {([
              { id: "french" as Language, label: "Frans", desc: "Nederlands ↔ Français", flag: <FlagFR className="w-5 h-3.5 rounded-sm" /> },
              { id: "english" as Language, label: "Engels", desc: "Nederlands ↔ English", flag: <FlagEN className="w-5 h-3.5 rounded-sm" /> },
              { id: "nask" as Language, label: "NASK", desc: "Begrippen & omschrijvingen", flag: <FlaskConical className="w-4 h-4" /> },
              { id: "biology" as Language, label: "Biologie", desc: "Begrippen & omschrijvingen", flag: <Microscope className="w-4 h-4" /> },
            ]).filter((lang) => !disabledSubjects.includes(lang.id)).map((lang) => {
              const isActive = language === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => { setLanguage(lang.id); setShowLanguagePicker(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                    isActive
                      ? "border-primary bg-primary/10 font-medium"
                      : "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">{lang.flag} {lang.label}</span>
                  <br />
                  <span className="text-xs text-muted-foreground">{lang.desc}</span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Section picker dialog */}
      <Dialog open={showSectionPicker} onOpenChange={setShowSectionPicker}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Kies woorden</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Selecteer één of meerdere secties, of laat alles uit voor alle woorden.</p>
          <div className="space-y-1.5">
            {availableSections.map((section) => {
              const effectiveSections = selectedSections.length === 0 ? availableSections : selectedSections;
              const isSelected = effectiveSections.includes(section);
              return (
                <button
                  key={section}
                  onClick={() => {
                    const current = selectedSections.length === 0 ? [...availableSections] : [...selectedSections];
                    if (isSelected) {
                      const updated = current.filter((s) => s !== section);
                      setSelectedSections(updated.length === 0 ? [] : updated);
                    } else {
                      setSelectedSections([...current, section]);
                    }
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 font-medium"
                      : "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{section === "Nummers" ? "🔢 Nummers 1-20" : section.length > 1 ? section : `Sectie ${section}`}</span>
                    {isSelected && <span className="text-primary text-xs">✓</span>}
                  </div>
                </button>
              );
            })}
            {isEnglishCh4 && (
              <button
                onClick={() => setIncludeGrammar(!includeGrammar)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                  includeGrammar
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Grammar</span>
                  {includeGrammar && <span className="text-primary text-xs">✓</span>}
                </div>
              </button>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => { setSelectedSections([]); if (isEnglishCh4) setIncludeGrammar(true); }}
            >
              Alles
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => setShowSectionPicker(false)}
            >
              Klaar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Niveau picker dialog */}
      <Dialog open={showNiveauPicker} onOpenChange={setShowNiveauPicker}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Kies je niveau</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            {([
              { id: "vmbo-havo" as Niveau, label: "VMBO-HAVO", desc: "Leerjaar 1 · Basisniveau" },
              { id: "havo-vwo" as Niveau, label: "HAVO-VWO", desc: "Leerjaar 1 · Hoger niveau" },
            ]).filter((n) => !disabledNiveaus.includes(n.id)).map((n) => {
              const isActive = niveau === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => { setNiveau(n.id); setShowNiveauPicker(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                    isActive
                      ? "border-primary bg-primary/10 font-medium"
                      : "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span className="font-medium">{n.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{n.desc}</span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <ObamaPopup adminEnabled={obamaEnabled} />

      {/* Polar Express Easter Egg */}
      {polarExpressEnabled && (
        <a
          href="https://www.youtube.com/watch?v=TQhRqtt-Fpo"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 opacity-80 hover:opacity-100 transition-opacity inline-block"
        >
          <img
            src={polarExpressImg}
            alt="Polar Express"
            className="w-16 h-16 md:w-20 md:h-20 rounded-lg shadow-lg object-cover"
          />
        </a>
      )}
      <AuthDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt} />
      <SupportDialog open={showSupport} onOpenChange={setShowSupport} />
      <AdminApplyDialog open={showApply} onOpenChange={setShowApply} />
      <StaffChat open={showStaffChat} onOpenChange={setShowStaffChat} />

      {showOnboarding && <OnboardingTour steps={tourSteps} onClose={finishOnboarding} />}
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} user={user}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookMarked className="h-4 w-4" />
              <span className="text-sm font-medium">Vak</span>
            </div>
            <button
              onClick={() => { setShowSettings(false); setShowLanguagePicker(true); }}
              className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <span className="inline-flex items-center gap-1.5">{language === "nask" ? <FlaskConical className="h-3.5 w-3.5" /> : language === "biology" ? <Microscope className="h-3.5 w-3.5" /> : language === "french" ? <FlagFR className="w-4 h-3 rounded-sm" /> : <FlagEN className="w-4 h-3 rounded-sm" />} {language === "nask" ? "NASK" : language === "biology" ? "Biologie" : language === "french" ? "Frans" : "Engels"}</span>
            </button>
          </div>
          {language === "french" && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span className="text-sm font-medium">Niveau</span>
              </div>
              <button
                onClick={() => { setShowSettings(false); setShowNiveauPicker(true); }}
                className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {niveau === "vmbo-havo" ? "VMBO-HAVO" : "HAVO-VWO"}
              </button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookMarked className="h-4 w-4" />
              <span className="text-sm font-medium">{(language === "nask" || language === "biology") ? "Hoofdstuk" : "Unit"}</span>
            </div>
            <button
              onClick={() => { setShowSettings(false); setShowChapterPicker(true); }}
              className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              {getChapter(chapterId)?.title ?? "Unit"}
            </button>
          </div>
          {availableSections.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">Woorden</span>
              </div>
              <button
                onClick={() => { setShowSettings(false); setShowSectionPicker(true); }}
                className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {selectedSections.length === 0 || selectedSections.length === availableSections.length ? "Alle" : selectedSections.sort().join(", ")}
              </button>
            </div>
          )}
      </SettingsDialog>
     </main>
  );
};

export default Index;
