import type { Preview } from '@storybook/nextjs-vite'
import React from 'react'
import '../src/app/globals.css'

// El prototipo va siempre en modo claro (ver CLAUDE.md), así que Storybook
// fuerza data-theme="light" igual que src/app/layout.tsx. Tiene que ir en
// <html> (document.documentElement): la regla `:root[data-theme="light"]`
// de globals.css no mira un <div> normal, solo la raíz real del documento.
const preview: Preview = {
  decorators: [
    (Story) => {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', 'light');
      }
      return (
        <div className="antialiased">
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;