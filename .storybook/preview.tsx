import type { Preview } from '@storybook/nextjs-vite'
import React from 'react'
import '../src/app/globals.css'
import { ModoClaro } from './ModoClaro'

// El prototipo va siempre en modo claro (ver CLAUDE.md), así que Storybook
// fuerza data-theme="light" igual que src/app/layout.tsx, y con las mismas
// fuentes. Todo eso lo hace ModoClaro (ver ese archivo).
const preview: Preview = {
  decorators: [
    (Story) => (
      <ModoClaro>
        <Story />
      </ModoClaro>
    ),
  ],
  parameters: {
    options: {
      storySort: {
        order: [
          "Fundamentos",
          ["Colores", "Tipografía", "Espaciados", "Radios y sombras", "Animación"],
          "Sistema de diseño",
        ],
      },
    },

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