export const BREAKPOINTS = {
  tabletMin: 550 / 16,
  laptopMin: 1100 / 16,
  desktopMin: 1500 / 16,
};

export const QUERIES = {
  tabletAndUp: `(min-width: ${BREAKPOINTS.tabletMin}rem)`,
  laptopAndUp: `(min-width: ${BREAKPOINTS.laptopMin}rem)`,
  desktopAndUp: `(min-width: ${BREAKPOINTS.desktopMin}rem)`,
};

export const FONT_FAMILY = {
  japanese_primary: "BIZ UDMincho",
  japanese_secondary: "Hina Mincho",
  japanese_tertiary: "Zen Kaku Gothic New",
  chinese_primary: "Noto Serif SC",
  chinese_secondary: "Noto Sans SC",
  english_primary: "Raleway",
};

export const FONT_SIZE = {
  giant: "1.25rem",
  large: "1.125rem",
  default: "1rem",
  small: "0.9rem",
  tiny: "0.75rem",
};
