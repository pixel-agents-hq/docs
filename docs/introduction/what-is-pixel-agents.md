---
sidebar_position: 1
---

# What is Pixel Agents?

Pixel Agents turns multi-agent AI systems into something you can actually see and manage. Each agent becomes a character in a pixel art office. They walk around, sit at their desk, and visually reflect what they are doing — typing when writing code, reading when searching files, waiting when it needs your attention.

Right now it works as a **VS Code extension** with **Claude Code**. The vision is a fully agent-agnostic, platform-agnostic interface for orchestrating any AI agents, deployable anywhere.

## Why Pixel Agents?

When you're running multiple AI agents, it's hard to keep track of what each one is doing. Pixel Agents makes this intuitive by giving each agent a visual presence:

- **See at a glance** which agents are active, idle, or waiting for input
- **Speech bubbles** appear when an agent needs your attention
- **Sound notifications** alert you when an agent finishes its turn
- **A fun, engaging interface** that makes working with AI agents feel like managing a tiny office

## The Vision

The long-term vision is an interface where managing AI agents feels like playing The Sims, but the results are real things being built.

- **Agents as characters** you can see, assign, monitor, and redirect — each with visible roles, stats, context usage, and tools
- **Desks as directories** — drag an agent to a desk to assign it to a project or working directory
- **An office as a project** — with a Kanban board on the wall where idle agents can pick up tasks autonomously
- **Deep inspection** — click any agent to see its model, branch, system prompt, and full work history
- **Token health bars** — rate limits and context windows visualized as in-game stats
- **Fully customizable** — upload your own character sprites, themes, and office assets

## Architecture Goals

For this vision to work, the architecture needs to be modular at every level:

- **Platform-agnostic**: VS Code extension today, Electron app, web app, or any other host environment tomorrow
- **Agent-agnostic**: Claude Code today, but built to support Codex, OpenCode, Gemini, Cursor, Copilot, and others through composable adapters
- **Theme-agnostic**: community-created assets, skins, and themes from any contributor

## Tech Stack

- **Extension**: TypeScript, VS Code Webview API, esbuild
- **Webview**: React 19, TypeScript, Vite, Canvas 2D
