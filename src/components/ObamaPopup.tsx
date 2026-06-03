import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import obamaImg from "@/assets/obama.jpg";
import { fireConfetti } from "@/lib/confetti";
import { toast } from "sonner";

interface Props {
  adminEnabled?: boolean;
}

const hasObamaUnlocked = () => {
  try {
    return localStorage.getItem("obama_unlocked") === "true" || localStorage.getItem("obama_mode") === "true";
  } catch {
    return false;
  }
};

export default function ObamaPopup({ adminEnabled = true }: Props) {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Hard short-circuit: if the admin toggle is off (or we're not on the home page),
  // render nothing and skip all timers, scroll listeners and toasts entirely.
  if (!adminEnabled || !isHomePage) return null;

  return <ObamaPopupInner />;
}

function ObamaPopupInner() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(hasObamaUnlocked);

  useEffect(() => {
    if (unlocked) {
      setVisible(false);
      setReady(false);
      return;
    }

    const delay = 20000 + Math.random() * 10000;
    const timer = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(timer);
  }, [unlocked]);

  useEffect(() => {
    const syncUnlocked = () => {
      if (!hasObamaUnlocked()) return;
      localStorage.setItem("obama_unlocked", "true");
      setUnlocked(true);
    };

    syncUnlocked();
    window.addEventListener("storage", syncUnlocked);
    window.addEventListener("obama-unlocked", syncUnlocked);
    return () => {
      window.removeEventListener("storage", syncUnlocked);
      window.removeEventListener("obama-unlocked", syncUnlocked);
    };
  }, []);

  // Show only when scrolled down (past 400px)
  const handleScroll = useCallback(() => {
    if (!ready || unlocked) return;
    if (window.scrollY > 400) {
      setVisible(true);
    } else {
      if (visible && !exiting) {
        setExiting(true);
        setTimeout(() => { setVisible(false); setExiting(false); }, 500);
      }
    }
  }, [ready, visible, exiting, unlocked]);

  useEffect(() => {
    if (!ready || unlocked) return;
    if (window.scrollY > 400) { setVisible(true); return; }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [ready, handleScroll, unlocked]);

  useEffect(() => {
    if (!visible) return;
    // Auto-hide after 5s if not clicked
    const hide = setTimeout(() => {
      setExiting(true);
      setTimeout(() => { setVisible(false); setExiting(false); }, 500);
    }, 5000);
    return () => clearTimeout(hide);
  }, [visible]);

  const handleClick = () => {
    localStorage.setItem("obama_unlocked", "true");
    localStorage.setItem("obama_mode", "true");
    setUnlocked(true);
    document.documentElement.classList.add("obama-mode");
    fireConfetti();
    toast.success("🇺🇸 Obama modus ontgrendeld!");
    setExiting(true);
    setTimeout(() => { setVisible(false); setExiting(false); }, 500);
    // Dispatch storage event so settings can react
    window.dispatchEvent(new Event("obama-unlocked"));
  };

  if (!visible || unlocked) return null;

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-0 left-0 z-[9999] cursor-pointer focus:outline-none"
      style={{
        animation: exiting ? "obama-slide-down 0.5s ease-in forwards" : "obama-slide-up 0.8s ease-out forwards",
        transform: "scale(0.7)",
        transformOrigin: "bottom left",
      }}
      aria-label="Secret Obama"
    >
      <img
        src={obamaImg}
        alt="Obama"
        className="w-24 h-28 md:w-32 md:h-36 object-cover object-top rounded-t-xl shadow-2xl"
      />
    </button>
  );
}
