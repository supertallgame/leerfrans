import { useState, useEffect } from "react";
import obamaImg from "@/assets/obama.jpg";
import { fireConfetti } from "@/lib/confetti";
import { toast } from "sonner";

export default function ObamaPopup() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Already unlocked? Don't show popup anymore
    if (localStorage.getItem("obama_unlocked") === "true") return;

    // Random delay between 20s and 30s
    const delay = 20000 + Math.random() * 10000;
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, []);

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
      className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[9999] cursor-pointer focus:outline-none"
      style={{
        animation: exiting ? "obama-slide-down 0.5s ease-in forwards" : "obama-slide-up 0.8s ease-out forwards",
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
