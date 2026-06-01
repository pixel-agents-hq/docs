import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Pixel Agents',
  tagline: 'The game interface where AI agents build real things',
  favicon: 'img/favicon.png',

  url: 'https://pixel-agents-hq.github.io',
  baseUrl: '/',

  organizationName: 'pixel-agents-hq',
  projectName: 'docs',

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/pixel-agents-hq/docs/edit/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'PIXEL AGENTS',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'guideSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/pixel-agents-hq/docs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Released under MIT License. Copyright ${new Date().getFullYear()} Pablo De Lucca.`,
    },
    // Algolia DocSearch — fill in after DocSearch approval
    // algolia: {
    //   appId: 'YOUR_APP_ID',
    //   apiKey: 'YOUR_SEARCH_API_KEY',
    //   indexName: 'pixel-agents-docs',
    // },
  } satisfies Preset.ThemeConfig,
};

export default config;
