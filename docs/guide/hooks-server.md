# Hooks Server

Pixel Agents embeds a lightweight HTTP server that receives real-time events from Claude Code (and other CLI tools) via the [Claude Code Hooks API](https://docs.anthropic.com/en/docs/claude-code/hooks). This lets characters animate instantly — without waiting for the 500 ms JSONL polling cycle.

## How It Works

When you enable hooks (via the settings toggle in the extension), Pixel Agents:

1. Starts an HTTP server bound to `127.0.0.1` on a random port
2. Writes a discovery file to `~/.pixel-agents/server.json`
3. Installs hook entries into `~/.claude/settings.json` pointing to `~/.pixel-agents/hooks/claude-hook.js`

Claude Code invokes the hook script on each event. The script reads `server.json`, then POSTs the event JSON to the server. The extension receives it instantly and updates the character state.

**Multi-window safe**: A second VS Code window detects the running server via `server.json` and reuses it rather than starting a second one.

## Discovery File

The server writes `~/.pixel-agents/server.json` on startup:

```json
{
  "port": 54321,
  "pid": 12345,
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "startedAt": 1712345678000
}
```

| Field | Description |
|-------|-------------|
| `port` | Port the server is listening on |
| `pid` | PID of the VS Code process that owns the server |
| `token` | Bearer token required for all hook requests |
| `startedAt` | Unix timestamp (ms) when the server started |

## Hook Events

The server handles 11 Claude Code hook events:

| Event | Trigger |
|-------|---------|
| `SessionStart` | Session begins, resumes, or restarts after `/clear` |
| `SessionEnd` | Session exits, logs out, or a `/clear`/`--resume` transition begins |
| `Stop` | Claude finishes a turn (agent goes to waiting state) |
| `PermissionRequest` | Agent needs approval before proceeding |
| `Notification` | Permission prompt or idle state |
| `UserPromptSubmit` | User submits a message (instant spawn confirmation) |
| `PreToolUse` | Tool is about to execute (instant active animation) |
| `PostToolUse` | Tool finished successfully |
| `PostToolUseFailure` | Tool execution failed |
| `SubagentStart` | A sub-agent spawns (Task/Agent tool) |
| `SubagentStop` | A sub-agent finishes |

## Example Configurations

### Automatic (Claude Code)

The extension manages this automatically when hooks are enabled. The installed hook entry in `~/.claude/settings.json` looks like:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node \"/home/user/.pixel-agents/hooks/claude-hook.js\"",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

All 11 events get the same entry. The hook script reads `server.json` and POSTs to `/api/hooks/claude`.

### Custom Provider (External Integration)

You can POST events directly from any tool or script using any provider ID that matches `[a-z0-9-]+`. Read the token from `server.json`:

```bash
# Read server config
PORT=$(cat ~/.pixel-agents/server.json | python3 -c "import sys,json; c=json.load(sys.stdin); print(c['port'])")
TOKEN=$(cat ~/.pixel-agents/server.json | python3 -c "import sys,json; c=json.load(sys.stdin); print(c['token'])")

# Send a PreToolUse event from a custom tool
curl -s -X POST "http://127.0.0.1:$PORT/api/hooks/my-tool" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hook_event_name": "PreToolUse",
    "session_id": "my-session-id",
    "tool_name": "Write",
    "tool_input": { "file_path": "/path/to/file.ts" }
  }'
```

### Testing with VS Code REST Client

Create a `.http` file and use the [REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) to manually fire events. Read the values from `~/.pixel-agents/server.json` first.

```http
@host = 127.0.0.1
@port = 54321
@token = 550e8400-e29b-41d4-a716-446655440000
@provider = my-provider
@session = test-session-001
@cwd = /home/user/myproject
@transcript = /home/user/.claude/projects/-home-user-myproject/test-session-001.jsonl

### Health check
GET http://{{host}}:{{port}}/api/health

### Start a session
POST http://{{host}}:{{port}}/api/hooks/{{provider}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "hook_event_name": "SessionStart",
  "session_id": "{{session}}",
  "source": "new",
  "transcript_path": "{{transcript}}",
  "cwd": "{{cwd}}"
}

### Agent starts working
POST http://{{host}}:{{port}}/api/hooks/{{provider}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "hook_event_name": "PreToolUse",
  "session_id": "{{session}}",
  "tool_name": "Bash",
  "tool_input": { "command": "npm test" }
}

### Agent finishes turn
POST http://{{host}}:{{port}}/api/hooks/{{provider}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "hook_event_name": "Stop",
  "session_id": "{{session}}"
}

### Agent needs permission
POST http://{{host}}:{{port}}/api/hooks/{{provider}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "hook_event_name": "PermissionRequest",
  "session_id": "{{session}}"
}

### Session ends
POST http://{{host}}:{{port}}/api/hooks/{{provider}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "hook_event_name": "SessionEnd",
  "session_id": "{{session}}",
  "reason": "exit"
}
```

### /clear and --resume Flow

`/clear` and `--resume` both send a `SessionEnd` immediately followed by a `SessionStart` with a new session ID. The server expects this pattern:

```http
### Step 1: SessionEnd with reason=clear
POST http://{{host}}:{{port}}/api/hooks/{{provider}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "hook_event_name": "SessionEnd",
  "session_id": "{{session}}",
  "reason": "clear"
}

### Step 2: SessionStart with source=clear (new session ID)
POST http://{{host}}:{{port}}/api/hooks/{{provider}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "hook_event_name": "SessionStart",
  "session_id": "new-session-id-after-clear",
  "source": "clear",
  "transcript_path": "{{transcript}}",
  "cwd": "{{cwd}}"
}
```

If `SessionStart` never arrives after `SessionEnd(reason=clear)`, the agent is cleaned up automatically after 2 seconds.

## Security

- The server only binds to `127.0.0.1` (localhost) — not accessible from the network
- Every hook request requires a `Authorization: Bearer <token>` header
- The token is validated with a timing-safe comparison (prevents side-channel attacks)
- `server.json` is written with mode `0600` (owner read/write only)
- Requests larger than 64 KB are rejected with `413`

## API Reference

The full API reference below is generated from the OpenAPI spec at `server/openapi.json` in the [pixel-agents repository](https://github.com/pablodelucca/pixel-agents).

<ApiReference />
