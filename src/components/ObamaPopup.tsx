import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import obamaImg from "@/assets/obama.jpg";
import { fireConfetti } from "@/lib/confetti";
import { toast } from "sonner";

export default function ObamaPopup() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [ready, setReady] = useState(false);
  const location = useLocation();

  // Only allow on the home page
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    if (!isHomePage) { setVisible(false); return; }
    if (localStorage.getItem("obama_unlocked") === "true") return;

    const delay = 20000 + Math.random() * 10000;
    const timer = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(timer);
  }, [isHomePage]);

  // Show only when scrolled down (past 400px)
  const handleScroll = useCallback(() => {
    if (!ready || !isHomePage) return;
    if (window.scrollY > 400) {
      setVisible(true);
    }
  }, [ready, isHomePage]);

  useEffect(() => {
    if (!ready || !isHomePage) return;
    // Check immediately in case already scrolled
    if (window.scrollY > 400) { setVisible(true); return; }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [ready, isHomePage, handleScroll]);

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
    document.documentElement.classList.add("obama-mode");
    fireConfetti();
    toast.success("🇺🇸 Obama modus ontgrendeld!");
    setExiting(true);
    setTimeout(() => { setVisible(false); setExiting(false); }, 500);
    // Dispatch storage event so settings can react
    window.dispatchEvent(new Event("obama-unlocked"));
  };

  if (!visible) return null;

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
