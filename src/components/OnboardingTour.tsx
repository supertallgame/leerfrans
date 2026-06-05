import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface TourStep {
  target: string; // data-tour value
  title: string;
  description: string;
}

interface Props {
  steps: TourStep[];
  onClose: () => void;
}

interface Rect { top: number; left: number; width: number; height: number }

export default function OnboardingTour({ steps, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const step = steps[index];

  // Skip steps whose target isn't on screen
  useEffect(() => {
    if (!step) return;
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    if (!el) {
      if (index < steps.length - 1) setIndex((i) => i + 1);
      else onClose();
    }
  }, [index, step, steps.length, onClose]);

  useLayoutEffect(() => {
    if (!step) return;
    const update = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (!el) { setRect(null); return; }
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    update();
    const id = window.setTimeout(update, 350);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [step]);

  if (!step) return null;

  const pad = 8;
  const r = rect;
  const spotlight = r
    ? { top: r.top - pad, left: r.left - pad, width: r.width + pad * 2, height: r.height + pad * 2 }
    : null;

  // Position tooltip below or above the spotlight depending on space
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const vw = typeof window !== "undefined" ? window.innerWidth : 400;
  const tooltipWidth = Math.min(320, vw - 24);
  let tooltipTop = 24;
  let tooltipLeft = 12;
  if (spotlight) {
    const below = spotlight.top + spotlight.height + 12;
    if (below + 180 < vh) tooltipTop = below;
    else tooltipTop = Math.max(12, spotlight.top - 180);
    tooltipLeft = Math.max(12, Math.min(vw - tooltipWidth - 12, spotlight.left + spotlight.width / 2 - tooltipWidth / 2));
  }

  const last = index === steps.length - 1;

  return createPortal(
    <div className="fixed inset-0 z-[100]" aria-live="polite">
      {/* Dim overlay with spotlight cut-out via box-shadow */}
      {spotlight ? (
        <div
          className="absolute rounded-xl pointer-events-none transition-all duration-300"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
            boxShadow: "0 0 0 9999px hsl(var(--background) / 0.85)",
            outline: "2px solid hsl(var(--primary))",
            outlineOffset: "0px",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-background/85" />
      )}

      {/* Tooltip */}
      <div
        className="absolute rounded-xl border border-border bg-card text-card-foreground shadow-2xl p-4 animate-in fade-in zoom-in-95"
        style={{ top: tooltipTop, left: tooltipLeft, width: tooltipWidth }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          aria-label="Sluiten"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="text-xs font-medium text-primary mb-1">
          Stap {index + 1} van {steps.length}
        </div>
        <h3 className="text-base font-bold mb-1 pr-6">{step.title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Overslaan
          </Button>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <Button variant="outline" size="sm" onClick={() => setIndex((i) => i - 1)}>
                Vorige
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => {
                if (last) onClose();
                else setIndex((i) => i + 1);
              }}
            >
              {last ? "Klaar" : "Volgende"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
