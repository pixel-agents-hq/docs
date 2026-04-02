import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Pixel Agents',
  description: 'The game interface where AI agents build real things',

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }]
  ],

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
          { text: 'Layout Editor', link: '/guide/layout-editor' }
        ]
      },
      {
        text: 'Assets',
        items: [
          { text: 'Overview', link: '/guide/assets' },
          { text: 'Characters', link: '/guide/characters' },
          { text: 'Furniture', link: '/guide/furniture' },
          { text: 'Walls', link: '/guide/walls' },
          { text: 'Floors', link: '/guide/floors' }
        ]
      },
      {
        text: 'Advanced',
        items: [
          { text: 'How It Works', link: '/guide/how-it-works' },
          { text: 'Troubleshooting', link: '/guide/troubleshooting' }
        ]
      },
      {
        text: 'Community',
        items: [
          { text: 'Contributing', link: '/guide/contributing' },
          { text: 'Roadmap', link: '/guide/roadmap' }
        ]
      }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2026 Pablo De Lucca'
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
