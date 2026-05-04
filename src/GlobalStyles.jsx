import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    line-height: 1.75;
    font-size: 1.125rem;
    font-family: inherit;
    /* margin: 0;
    padding: 0; */
  }

  html {
    /* font-size: 1.25rem; */
    font-family: "Noto Serif SC", serif;
    --gray95: hsl(0deg 0% 95%);
    --gray85: hsl(0deg 0% 85%);
    --gray75: hsl(0deg 0% 75%);
    --gray60: hsl(0deg 0% 60%);
    --gray40: hsl(0deg 0% 40%);
    --gray25: hsl(0deg 0% 25%);
    --gray15: hsl(0deg 0% 15%);

    --transparentGray15: hsl(0deg 0% 15% / 0.5);
    --green85: hsl(150deg 20% 85%);
    --green15: hsl(150deg 20% 15%);
    --red85: hsl(0deg 20% 85%);
    --red15: hsl(0deg 20% 15%);
  }

  body {
    background-color: var(--gray95);
    margin: 0;
  }
  html, body {
    height: 100%;
  }

  #root {
    height: 100%;
  }

  h1, h2, h3, h4, h5, h6, p{
    margin: 0;
    padding: 0;
  }
`;

export default GlobalStyles;
