import type { CSSProperties } from "react";

export const FALLBACK_COLOR = "#D1D5DB";

export const COLOR_MAP: Record<string, string> = {
  NEGRO: "#111111",
  BLANCO: "#FFFFFF",
  GRIS: "#9CA3AF",
  AZUL: "#2563EB",
  "AZUL CLARO": "#93C5FD",
  ROJO: "#DC2626",
  VERDE: "#16A34A",
  "VERDE CLARO": "#86EFAC",
  AMARILLO: "#EAB308",
  NARANJA: "#F97316",
  ROSA: "#EC4899",
  MORADO: "#7C3AED",
  MARINO: "#1E3A8A",
  "VERDE OSCURO": "#166534",
  NATURAL: "#E5DCCB",
  BEIGE: "#F5F5DC",
  BEIG: "#F5F5DC",
  CAFE: "#8B5E3C",
  CAFÉ: "#8B5E3C",
  PLATA: "#C0C0C0",
  PLATEADO: "#C0C0C0",
  DORADO: "#D4AF37",
  TRANSPARENTE: "#F8FAFC",
  "NEGRO MATE": "#1F2937",
  MULTICOLOR: FALLBACK_COLOR,
  "COLORES VARIOS": FALLBACK_COLOR,
  VARIOS: FALLBACK_COLOR,
};

export const LOCAL_COLOR_ALIASES: Record<string, string> = {
  R: "ROJO",
  RO: "ROJO",
  ROJ: "ROJO",

  A: "AZUL",
  AZ: "AZUL",
  AC: "AZUL CLARO",

  N: "NEGRO",
  NE: "NEGRO",
  NG: "NEGRO",
  NEG: "NEGRO",

  B: "BLANCO",
  BL: "BLANCO",
  BLA: "BLANCO",

  V: "VERDE",
  VE: "VERDE",
  VER: "VERDE",
  VC: "VERDE CLARO",
  VO: "VERDE OSCURO",

  AM: "AMARILLO",
  Y: "AMARILLO",
  AMA: "AMARILLO",

  O: "NARANJA",
  "0": "NARANJA",

  G: "GRIS",
  GR: "GRIS",

  C: "CAFE",
  CF: "CAFE",

  P: "PLATEADO",
  PL: "PLATEADO",

  T: "TRANSPARENTE",
  TR: "TRANSPARENTE",

  CV: "COLORES VARIOS",
  VAR: "VARIOS",
  "002": "COLORES VARIOS",
};

export const COMPOSITE_COLOR_MAP: Record<
  string,
  {
    label: string;
    colors: string[];
  }
> = {
  NR: {
    label: "Negro / Rojo",
    colors: ["#111111", "#DC2626"],
  },
  "NEGRO ROJO": {
    label: "Negro / Rojo",
    colors: ["#111111", "#DC2626"],
  },
  "NEGRO CON ROJO": {
    label: "Negro / Rojo",
    colors: ["#111111", "#DC2626"],
  },
  "NEGRO Y ROJO": {
    label: "Negro / Rojo",
    colors: ["#111111", "#DC2626"],
  },

  NA: {
    label: "Blanco / Naranja",
    colors: ["#FFFFFF", "#F97316"],
  },
  "BLANCO NARANJA": {
    label: "Blanco / Naranja",
    colors: ["#FFFFFF", "#F97316"],
  },
  "BLANCO CON NARANJA": {
    label: "Blanco / Naranja",
    colors: ["#FFFFFF", "#F97316"],
  },
  "BLANCO / NARANJA": {
    label: "Blanco / Naranja",
    colors: ["#FFFFFF", "#F97316"],
  },

  CV: {
    label: "Colores varios",
    colors: ["#DC2626", "#2563EB", "#16A34A", "#EAB308"],
  },
  "COLORES VARIOS": {
    label: "Colores varios",
    colors: ["#DC2626", "#2563EB", "#16A34A", "#EAB308"],
  },
  VARIOS: {
    label: "Colores varios",
    colors: ["#DC2626", "#2563EB", "#16A34A", "#EAB308"],
  },
  "002": {
    label: "Colores varios",
    colors: ["#DC2626", "#2563EB", "#16A34A", "#EAB308"],
  },
};

export function normalizeColorName(color?: string | null): string {
  return (color || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

export function resolveColorName(color?: string | null): string {
  const normalized = normalizeColorName(color);
  if (!normalized) return "";

  if (COMPOSITE_COLOR_MAP[normalized]) {
    return normalized;
  }

  return LOCAL_COLOR_ALIASES[normalized] || normalized;
}

export function getColorHex(color?: string | null): string {
  const rawColor = (color || "").trim();
  if (!rawColor) return FALLBACK_COLOR;

  if (/^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(rawColor)) {
    return rawColor;
  }

  const resolved = resolveColorName(rawColor);
  if (!resolved) return FALLBACK_COLOR;

  if (COMPOSITE_COLOR_MAP[resolved]) {
    return COMPOSITE_COLOR_MAP[resolved].colors[0] || FALLBACK_COLOR;
  }

  return COLOR_MAP[resolved] || FALLBACK_COLOR;
}

export function getColorLabel(color?: string | null): string {
  const resolved = resolveColorName(color);
  if (!resolved) return "Sin color";

  if (COMPOSITE_COLOR_MAP[resolved]) {
    return COMPOSITE_COLOR_MAP[resolved].label;
  }

  return resolved
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getColorSwatchStyle(color?: string | null): CSSProperties {
  const resolved = resolveColorName(color);

  if (COMPOSITE_COLOR_MAP[resolved]) {
    const colors = COMPOSITE_COLOR_MAP[resolved].colors;

    if (colors.length >= 4) {
      return {
        background: `conic-gradient(${colors.join(", ")}, ${colors[0]})`,
        border: "1px solid #D1D5DB",
      };
    }

    return {
      background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[0]} 50%, ${colors[1]} 50%, ${colors[1]} 100%)`,
      border: "1px solid #D1D5DB",
    };
  }

  const hex = getColorHex(color);

  const isVeryLight = [
    "#FFFFFF",
    "#F5F5DC",
    "#E5DCCB",
    "#C0C0C0",
    "#93C5FD",
    "#86EFAC",
    "#F8FAFC",
  ].includes(hex.toUpperCase());

  return {
    backgroundColor: hex,
    border: isVeryLight ? "1px solid #D1D5DB" : "1px solid transparent",
  };
}
