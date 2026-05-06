import React from "react";
import { MemoryRouter } from "react-router-dom";
import GlobalStyles from "../src/GlobalStyles";

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <GlobalStyles />
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
