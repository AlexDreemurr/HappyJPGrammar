import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    font-family: BIZ UDMincho, 宋体;
    line-height: 1.75;
    font-size: 1.125rem;
    /* margin: 0;
    padding: 0; */
  }

  html {
    /* font-size: 1.25rem; */
  }

  body {
    background-color: hsl(0deg 0% 95%);
    margin: 0;
  }

  html, body {
    height: 100%;
  }

  #root {
    height: 100%;
  }
`;

export default GlobalStyles;
