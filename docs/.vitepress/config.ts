import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Pixel Agents',
  description: 'The game interface where AI agents build real things',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/what-is-pixel-agents' },
      { text: 'GitHub', link: 'https://github.com/pablodelucca/pixel-agents' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What is Pixel Agents?', link: '/guide/what-is-pixel-agents' },
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Features', link: '/guide/features' }
        ]
      },
      {
        text: 'Using the Office',
        items: [
          { text: 'Layout Editor', link: '/guide/layout-editor' },
          { text: 'Office Assets', link: '/guide/office-assets' }
        ]
      },
      {
        text: 'Advanced',
        items: [
          { text: 'How It Works', link: '/guide/how-it-works' },
          { text: 'Troubleshooting', link: '/guide/troubleshooting' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/pablodelucca/pixel-agents' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2025-present Pablo De Lucca'
    },

    editLink: {
      pattern: 'https://github.com/pablodelucca/pixel-agents-docs/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    search: {
      provider: 'local'
    }
  }
})
