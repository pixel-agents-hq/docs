---
sidebar_position: 1
---

# How It Works

Pixel Agents watches Claude Code's JSONL transcript files to track what each agent is doing. When an agent uses a tool (like writing a file or running a command), the extension detects it and updates the character's animation accordingly.

**No modifications to Claude Code are needed** — it's purely observational.

## Rendering

The webview runs a lightweight game loop with:

- **Canvas 2D rendering** — pixel-perfect at integer zoom levels
- **BFS pathfinding** — characters navigate around furniture to reach their desks
- **Character state machine** — idle → walk → type/read transitions

## Agent Detection

Each Claude Code terminal session produces JSONL transcript files. Pixel Agents:

1. Detects new terminal sessions
2. Locates their JSONL transcript files
3. Polls the files for new entries
4. Maps tool usage to character animations

## Known Limitations

- **Agent-terminal sync** — the way agents are connected to Claude Code terminal instances is not super robust and sometimes desyncs, especially when terminals are rapidly opened/closed or restored across sessions
- **Heuristic-based status detection** — Claude Code's JSONL transcript format does not provide clear signals for when an agent is waiting for user input or when it has finished its turn. The current detection is based on heuristics (idle timers, turn-duration events) and may misfire
- **Linux/macOS tip** — if you launch VS Code without a folder open, agents will start in your home directory. This is fully supported; your Claude sessions will be tracked under `~/.claude/projects/` using your home directory as the project root
