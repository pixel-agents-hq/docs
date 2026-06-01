---
sidebar_position: 2
---

# Getting Started

## Install from the Marketplace

The easiest way to get started is to install the extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=pablodelucca.pixel-agents) or [Open VSX](https://open-vsx.org/extension/pablodelucca/pixel-agents).

### Requirements

- VS Code 1.105.0 or later
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and configured
- **Platform**: Windows, Linux, and macOS are supported

## Install from Source

If you want to develop or contribute:

```bash
git clone https://github.com/pixel-agents-hq/pixel-agents.git
cd pixel-agents
npm install
cd webview-ui && npm install && cd ..
npm run build
```

Then press **F5** in VS Code to launch the Extension Development Host.

## Usage

1. Open the **Pixel Agents** panel (it appears in the bottom panel area alongside your terminal)
2. Click **+ Agent** to spawn a new Claude Code terminal and its character
   - Right-click for the option to launch with `--dangerously-skip-permissions` (bypasses all tool approval prompts)
3. Start coding with Claude — watch the character react in real time
4. Click a character to select it, then click a seat to reassign it
5. Click **Layout** to open the office editor and customize your space
