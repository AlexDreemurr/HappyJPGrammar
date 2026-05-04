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
  chinese_primary: "Noto Serif SC",
  chinese_secondary: "Noto Sans SC",
  english_primary: "Raleway",
};
