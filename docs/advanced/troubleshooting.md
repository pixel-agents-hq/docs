---
sidebar_position: 2
---

# Troubleshooting

If your agent appears stuck on idle or doesn't spawn, try the following.

## Debug View

In the Pixel Agents panel, click the gear icon (Settings), then toggle **Debug View**.

This shows connection diagnostics per agent:

- JSONL file status
- Lines parsed
- Last data timestamp
- File path

If you see "JSONL not found", the extension can't locate the session file.

## Debug Console

If you're running from source (Extension Development Host via F5):

1. Open VS Code's **View > Debug Console**
2. Search for `[Pixel Agents]` to see detailed logs

The logs include:

- Project directory resolution
- JSONL polling status
- Path encoding mismatches
- Unrecognized JSONL record types

## Common Issues

### Agent doesn't spawn a character

Make sure you're using the **+ Agent** button in the Pixel Agents panel to create terminals. Characters are only spawned for terminals created through the extension.

### Character is stuck on idle

The agent-terminal sync can sometimes desync when terminals are rapidly opened/closed or restored across sessions. Try closing the terminal and spawning a new agent.

### JSONL not found

The extension locates transcript files based on the project directory. Make sure VS Code has a folder open (not just a single file).
