import type { ReactNode } from "react";

// O Rendinho: a moedinha que narra o tutorial. Só SVG e CSS (as animações ficam no globals.css
// e param com "reduzir movimento").

export type Face = "happy" | "neutral" | "worried" | "shocked" | "cheer";
export type Arms = "down" | "up" | "wave" | "cheeks" | "push";

const INK = "#0a0d12";
const LIMB = "#e0a03a"; // braços e pernas: dourado da moeda, para aparecer no fundo escuro

const ARMS: Record<Arms, [string, string]> = {
  down: ["M22 74 Q10 84 12 98", "M98 74 Q110 84 108 98"],
  up: ["M22 68 Q8 54 12 36", "M98 68 Q112 54 108 36"],
  wave: ["M22 74 Q10 84 12 98", "M98 68 Q112 54 108 36"],
  cheeks: ["M22 74 Q14 66 30 60", "M98 74 Q106 66 90 60"],
  push: ["M24 80 Q38 92 52 88", "M98 72 Q112 76 122 70"],
};

function Eyes({ face }: { face: Face }) {
  if (face === "shocked") {
    return (
      <g>
        {[47, 73].map((x) => (
          <g key={x}>
            <circle cx={x} cy={58} r={7} fill="#fff" />
            <circle cx={x} cy={59} r={3} fill={INK} />
          </g>
        ))}
      </g>
    );
  }
  if (face === "cheer") {
    return <path d="M41 60 Q47 52 53 60 M67 60 Q73 52 79 60" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />;
  }
  return (
    <g>
      {[47, 73].map((x) => (
        <g key={x} className="mascot-eye">
          <ellipse cx={x} cy={58} rx={4.2} ry={6} fill={INK} />
          <circle cx={x + 1.4} cy={55.5} r={1.4} fill="#fff" />
        </g>
      ))}
    </g>
  );
}

const BROWS: Partial<Record<Face, string>> = {
  worried: "M38 49 L52 44 M82 49 L68 44",
  shocked: "M38 42 Q46 36 54 41 M66 41 Q74 36 82 42",
};

const MOUTH: Record<Face, ReactNode> = {
  happy: <path d="M48 74 Q60 86 72 74" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />,
  neutral: <path d="M50 77 Q60 81 70 77" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />,
  worried: <path d="M47 81 Q53 75 60 80 Q67 85 73 79" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />,
  shocked: <ellipse cx={60} cy={81} rx={6} ry={8} fill={INK} />,
  cheer: (
    <g>
      <path d="M45 72 Q60 96 75 72 Z" fill={INK} />
      <path d="M52 84 Q60 78 68 84 Q60 90 52 84 Z" fill="#ff6b9a" />
    </g>
  ),
};

export function Mascot({ face = "happy", arms = "down", className = "" }: { face?: Face; arms?: Arms; className?: string }) {
  const [left, right] = ARMS[arms];
  const blush = face === "happy" || face === "cheer";
  const sweat = face === "worried" || face === "shocked";
  return (
    <svg viewBox="-4 0 132 140" className={`overflow-visible ${className}`} aria-hidden>
      <g className="mascot-bob">
        {/* Remonta a cada troca de cara: dá o "pulo" (e a tremida, se for susto). */}
        <g key={face} className={face === "shocked" ? "mascot-shake" : "mascot-pop"}>
          {/* pernas e tênis */}
          <path d="M50 104 L46 126 M70 104 L74 126" stroke={LIMB} strokeWidth="5" strokeLinecap="round" />
          <ellipse cx={42} cy={129} rx={9} ry={5} fill="#3ddc97" />
          <ellipse cx={78} cy={129} rx={9} ry={5} fill="#3ddc97" />
          {/* braços */}
          <path d={left} fill="none" stroke={LIMB} strokeWidth="5" strokeLinecap="round" />
          <path d={right} fill="none" stroke={LIMB} strokeWidth="5" strokeLinecap="round" className={arms === "wave" ? "mascot-wave" : undefined} />
          {/* a moeda */}
          <circle cx={60} cy={64} r={42} fill="#ffb547" stroke="#c98418" strokeWidth="4" />
          <circle cx={60} cy={64} r={34} fill="none" stroke="#c98418" strokeOpacity="0.45" strokeWidth="2" strokeDasharray="3 4" />
          <path d="M32 44 Q40 30 56 26" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" />
          {/* rosto */}
          {BROWS[face] && <path d={BROWS[face]} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />}
          <Eyes face={face} />
          {blush && (
            <>
              <circle cx={38} cy={71} r={5} fill="#ff6b9a" fillOpacity="0.4" />
              <circle cx={82} cy={71} r={5} fill="#ff6b9a" fillOpacity="0.4" />
            </>
          )}
          {MOUTH[face]}
          {sweat && <path d="M100 34 Q95 43 100 46 Q105 43 100 34 Z" fill="#5aa9ff" />}
          {face === "cheer" && (
            <g fill="#3ddc97">
              <path d="M8 22 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" />
              <path d="M112 12 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" />
            </g>
          )}
        </g>
      </g>
    </svg>
  );
}

// Balão de fala do Rendinho. O rabicho aponta para a esquerda, onde ele fica.
export function Bubble({ children, className = "", tail = "" }: { children: ReactNode; className?: string; tail?: string }) {
  return (
    <div className={`relative rounded-2xl border border-line bg-panel-2 px-4 py-3 text-sm leading-relaxed text-text ${className}`}>
      <span className={`absolute -left-[7px] top-5 h-3 w-3 rotate-45 border-b border-l border-line bg-panel-2 ${tail}`} aria-hidden />
      {children}
    </div>
  );
}
