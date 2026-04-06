<template>
  <div class="api-reference">

    <!-- ── Connection Config ───────────────────────────────────── -->
    <div class="connection-bar">
      <div class="conn-field">
        <label class="conn-label">Host</label>
        <input class="conn-input mono" readonly value="127.0.0.1" />
      </div>
      <div class="conn-field">
        <label class="conn-label">Port</label>
        <input
          v-model="conn.port"
          class="conn-input mono"
          placeholder="54321"
          style="width: 80px"
          @input="saveConn"
        />
      </div>
      <div class="conn-field conn-field--grow">
        <label class="conn-label">Token</label>
        <input
          v-model="conn.token"
          class="conn-input mono"
          placeholder="Bearer token from ~/.pixel-agents/server.json"
          @input="saveConn"
        />
      </div>
      <div class="conn-hint">
        Read from <code>~/.pixel-agents/server.json</code>
      </div>
    </div>

    <!-- ── Endpoints ──────────────────────────────────────────── -->
    <div v-for="[endpointPath, methods] in endpoints" :key="endpointPath">
      <div
        v-for="[method, op] in sortedMethods(methods)"
        :key="method"
        class="endpoint"
        :class="{ 'is-open': expanded[endpointPath + method] }"
      >
        <!-- Clickable header -->
        <button class="endpoint-header" @click="toggle(endpointPath + method)">
          <span :class="['method-badge', method]">{{ method.toUpperCase() }}</span>
          <code class="endpoint-path">{{ interpolatePath(endpointPath, endpointPath + method) }}</code>
          <span v-if="op.security?.length" class="lock-icon" title="Requires Bearer token">🔒</span>
          <span class="endpoint-summary-inline">{{ op.summary }}</span>
          <span class="chevron">{{ expanded[endpointPath + method] ? '▲' : '▼' }}</span>
        </button>

        <!-- Expanded body -->
        <div v-if="expanded[endpointPath + method]" class="endpoint-body">
          <p v-if="op.description" class="op-description" v-html="md(op.description)" />

          <!-- Path params -->
          <template v-if="pathParams(op).length">
            <div class="section-title">Path Parameters</div>
            <div class="path-params">
              <div v-for="p in pathParams(op)" :key="p.name" class="param-row">
                <label class="param-name">
                  <code>{{ p.name }}</code>
                  <span v-if="p.required" class="required-star">*</span>
                </label>
                <input
                  v-model="paramValues[endpointPath + method][p.name]"
                  class="param-input mono"
                  :placeholder="p.example ?? p.name"
                />
                <span class="param-desc">{{ p.description }}</span>
              </div>
            </div>
          </template>

          <!-- Request body -->
          <template v-if="op.requestBody">
            <div class="section-title">
              Request Body
              <span class="section-hint">application/json · max 64 KB</span>
            </div>
            <!-- Example pills -->
            <div v-if="getExamples(op).length" class="example-pills">
              <button
                v-for="ex in getExamples(op)"
                :key="ex.key"
                :class="['pill', { active: activeExample[endpointPath + method] === ex.key }]"
                @click="loadExample(endpointPath + method, ex)"
              >{{ ex.summary }}</button>
            </div>
            <!-- Editable textarea -->
            <textarea
              v-model="bodyText[endpointPath + method]"
              class="body-editor mono"
              :rows="bodyRows(bodyText[endpointPath + method])"
              spellcheck="false"
              autocomplete="off"
            />
            <div v-if="bodyParseError[endpointPath + method]" class="body-error">
              ⚠ {{ bodyParseError[endpointPath + method] }}
            </div>
          </template>

          <!-- Send button row -->
          <div class="send-row">
            <button
              class="btn-send"
              :disabled="isSending(endpointPath + method)"
              @click="sendRequest(endpointPath, method, op, endpointPath + method)"
            >
              <span v-if="isSending(endpointPath + method)" class="spinner" />
              {{ isSending(endpointPath + method) ? 'Sending…' : 'Send' }}
            </button>
            <span v-if="!conn.port" class="send-warn">Set port above</span>
            <span v-else-if="op.security?.length && !conn.token" class="send-warn">Set token above</span>
          </div>

          <!-- Response panel -->
          <template v-if="lastResponse[endpointPath + method]">
            <div class="response-panel">
              <div class="response-meta">
                <span :class="['status-badge', statusClass(lastResponse[endpointPath + method].status)]">
                  {{ lastResponse[endpointPath + method].status }}
                </span>
                <span class="response-time">{{ lastResponse[endpointPath + method].ms }} ms</span>
                <button class="clear-btn" @click="clearResponse(endpointPath + method)">✕</button>
              </div>
              <pre class="response-body mono">{{ lastResponse[endpointPath + method].body }}</pre>
            </div>
          </template>
          <div v-if="fetchError[endpointPath + method]" class="fetch-error">
            {{ fetchError[endpointPath + method] }}
          </div>

          <!-- Responses reference table -->
          <div class="section-title" style="margin-top: 1.5rem">Expected Responses</div>
          <table class="resp-table">
            <thead>
              <tr><th>Status</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr v-for="[status, resp] in Object.entries(op.responses)" :key="status">
                <td>
                  <span :class="['status-badge', statusClass(status)]">{{ status }}</span>
                </td>
                <td>{{ resp.description }}</td>
              </tr>
            </tbody>
          </table>
        </div><!-- /endpoint-body -->
      </div><!-- /endpoint -->
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import spec from '@pixel-agents-openapi'

// ── Types ────────────────────────────────────────────────────────
interface Example { key: string; summary: string; value: unknown }
interface ResponseState { status: number; ms: number; body: string }

// ── Connection ───────────────────────────────────────────────────
const conn = reactive({ port: '', token: '' })
const STORAGE_KEY = 'pa-api-conn'

function saveConn() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ port: conn.port, token: conn.token })) } catch {}
}

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    if (saved.port) conn.port = saved.port
    if (saved.token) conn.token = saved.token
  } catch {}
  // Init per-endpoint state from spec
  for (const [endpointPath, methods] of Object.entries(spec.paths ?? {})) {
    for (const [method, op] of Object.entries(methods as Record<string, any>)) {
      const key = endpointPath + method
      // Path params default values
      paramValues[key] = {}
      for (const p of pathParams(op)) {
        paramValues[key][p.name] = (p.example ?? spec.paths?.[endpointPath]?.[method]?.parameters?.find((x: any) => x.name === p.name)?.example ?? defaultParamValue(p)) as string
      }
      // Body default: first example
      const examples = getExamples(op)
      if (examples.length) {
        activeExample[key] = examples[0].key
        bodyText[key] = JSON.stringify(examples[0].value, null, 2)
      }
    }
  }
  // Expand all by default
  for (const [endpointPath, methods] of Object.entries(spec.paths ?? {})) {
    for (const method of Object.keys(methods as object)) {
      expanded[endpointPath + method] = true
    }
  }
})

// ── Endpoint state ───────────────────────────────────────────────
const expanded = reactive<Record<string, boolean>>({})
const paramValues = reactive<Record<string, Record<string, string>>>({})
const activeExample = reactive<Record<string, string>>({})
const bodyText = reactive<Record<string, string>>({})
const bodyParseError = reactive<Record<string, string>>({})
const sending = reactive<Record<string, boolean>>({})
const lastResponse = reactive<Record<string, ResponseState | null>>({})
const fetchError = reactive<Record<string, string>>({})

// ── Spec helpers ─────────────────────────────────────────────────
const endpoints = Object.entries(spec.paths ?? {}) as [string, Record<string, any>][]

function sortedMethods(methods: Record<string, any>): [string, any][] {
  const order = ['get', 'post', 'put', 'patch', 'delete']
  return Object.entries(methods).sort(([a], [b]) => order.indexOf(a) - order.indexOf(b))
}

function pathParams(op: any) {
  return (op.parameters ?? []).filter((p: any) => p.in === 'path')
}

function getExamples(op: any): Example[] {
  const content = op.requestBody?.content?.['application/json']
  if (!content) return []
  if (content.examples) {
    return Object.entries(content.examples).map(([key, ex]: [string, any]) => ({
      key,
      summary: ex.summary ?? key,
      value: ex.value,
    }))
  }
  if (content.example) {
    return [{ key: 'example', summary: 'Example', value: content.example }]
  }
  return []
}

function defaultParamValue(p: any): string {
  return p.schema?.example ?? p.schema?.default ?? p.name
}

function interpolatePath(endpointPath: string, key: string): string {
  let result = endpointPath
  const params = paramValues[key] ?? {}
  for (const [k, v] of Object.entries(params)) {
    result = result.replace(`{${k}}`, v || `{${k}}`)
  }
  return result
}

// ── UI helpers ───────────────────────────────────────────────────
function toggle(key: string) {
  expanded[key] = !expanded[key]
}

function loadExample(key: string, ex: Example) {
  activeExample[key] = ex.key
  bodyText[key] = JSON.stringify(ex.value, null, 2)
  bodyParseError[key] = ''
}

function bodyRows(text: string | undefined): number {
  if (!text) return 8
  return Math.max(8, Math.min(28, (text.match(/\n/g)?.length ?? 0) + 2))
}

function isSending(key: string) { return sending[key] === true }
function clearResponse(key: string) { lastResponse[key] = null; fetchError[key] = '' }

function statusClass(status: string | number): string {
  const code = parseInt(String(status))
  if (code >= 200 && code < 300) return 'success'
  if (code >= 400 && code < 500) return 'client-error'
  if (code >= 500) return 'server-error'
  return 'neutral'
}

function md(text: string): string {
  return text
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

// ── Send request ─────────────────────────────────────────────────
async function sendRequest(endpointPath: string, method: string, op: any, key: string) {
  fetchError[key] = ''
  lastResponse[key] = null

  // Validate body JSON
  let body: string | undefined
  if (op.requestBody) {
    const raw = bodyText[key] ?? ''
    try {
      JSON.parse(raw)
      body = raw
      bodyParseError[key] = ''
    } catch (e: any) {
      bodyParseError[key] = `Invalid JSON: ${e.message}`
      return
    }
  }

  const port = String(conn.port ?? '').trim()
  if (!port) { fetchError[key] = 'Set a port in the connection bar above.'; return }

  const resolvedPath = interpolatePath(endpointPath, key)
  const url = `http://127.0.0.1:${port}${resolvedPath}`
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (op.security?.length && conn.token) headers['Authorization'] = `Bearer ${conn.token}`

  sending[key] = true
  const t0 = Date.now()
  try {
    const res = await fetch(url, {
      method: method.toUpperCase(),
      headers,
      body,
    })
    const text = await res.text()
    let pretty = text
    try { pretty = JSON.stringify(JSON.parse(text), null, 2) } catch {}
    lastResponse[key] = { status: res.status, ms: Date.now() - t0, body: pretty }
  } catch (e: any) {
    if (e?.name === 'TypeError' && e?.message?.includes('Failed to fetch')) {
      fetchError[key] =
        'Network error — the server may not be running, or CORS headers are missing. ' +
        'Check that Pixel Agents is open in VS Code with hooks enabled.'
    } else {
      fetchError[key] = `Error: ${e?.message ?? e}`
    }
  } finally {
    sending[key] = false
  }
}
</script>

<style scoped>
/* ── Connection bar ───────────────────────────────────────────── */
.connection-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
}

.conn-field {
  display: flex;
  align-items: center;
  gap: 6px;
}

.conn-field--grow {
  flex: 1;
  min-width: 240px;
}

.conn-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.conn-input {
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 4px 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.82rem;
  width: 100%;
}

.conn-input:focus { outline: 1px solid var(--vp-c-brand-1); }
.conn-input[readonly] { color: var(--vp-c-text-3); cursor: default; }

.conn-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  margin-left: auto;
}

/* ── Endpoint card ─────────────────────────────────────────────── */
.endpoint {
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.endpoint.is-open {
  border-color: var(--vp-c-brand-soft);
}

.endpoint-header {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  background: var(--vp-c-bg-soft);
  border: none;
  cursor: pointer;
  text-align: left;
  flex-wrap: wrap;
  transition: background 0.1s;
}

.endpoint-header:hover { background: var(--vp-c-bg-mute); }

.method-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 3px;
  letter-spacing: 0.05em;
  font-family: var(--vp-font-family-mono);
  flex-shrink: 0;
}

.method-badge.get    { background: #d1fae5; color: #065f46; }
.method-badge.post   { background: #dbeafe; color: #1e40af; }
.method-badge.put    { background: #fef3c7; color: #92400e; }
.method-badge.delete { background: #fee2e2; color: #991b1b; }

.dark .method-badge.get    { background: #064e3b; color: #6ee7b7; }
.dark .method-badge.post   { background: #1e3a5f; color: #93c5fd; }
.dark .method-badge.put    { background: #451a03; color: #fcd34d; }
.dark .method-badge.delete { background: #450a0a; color: #fca5a5; }

.endpoint-path {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
}

.lock-icon { font-size: 0.8rem; opacity: 0.6; }

.endpoint-summary-inline {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  flex: 1;
}

.chevron { margin-left: auto; font-size: 0.65rem; color: var(--vp-c-text-3); }

/* ── Endpoint body ─────────────────────────────────────────────── */
.endpoint-body {
  padding: 16px 20px 20px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.op-description {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  line-height: 1.65;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 0.73rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  margin: 1rem 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-hint {
  font-size: 0.7rem;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: var(--vp-c-text-3);
  opacity: 0.75;
}

/* ── Path params ─────────────────────────────────────────────── */
.path-params { display: flex; flex-direction: column; gap: 6px; }

.param-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.param-name {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 100px;
  font-size: 0.83rem;
}

.required-star { color: var(--vp-c-danger-1); }

.param-input {
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 4px 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 0.82rem;
  width: 160px;
}

.param-input:focus { outline: 1px solid var(--vp-c-brand-1); }

.param-desc { font-size: 0.8rem; color: var(--vp-c-text-3); }

/* ── Example pills ───────────────────────────────────────────── */
.example-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 8px;
}

.pill {
  font-size: 0.72rem;
  padding: 3px 9px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}

.pill:hover { background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); }
.pill.active {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-2);
  color: var(--vp-c-brand-1);
}

/* ── Body editor ─────────────────────────────────────────────── */
.body-editor {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 10px 12px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  font-size: 0.8rem;
  line-height: 1.55;
  resize: vertical;
  font-family: var(--vp-font-family-mono);
}

.body-editor:focus { outline: 1px solid var(--vp-c-brand-1); }
.body-error { font-size: 0.78rem; color: var(--vp-c-danger-1); margin-top: 4px; }

/* ── Send row ────────────────────────────────────────────────── */
.send-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.btn-send {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 20px;
  background: var(--vp-c-brand-1);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.1s;
}

.btn-send:hover:not(:disabled) { background: var(--vp-c-brand-2); }
.btn-send:disabled { opacity: 0.55; cursor: not-allowed; }

.send-warn { font-size: 0.78rem; color: var(--vp-c-warning-1); }

.spinner {
  display: inline-block;
  width: 10px; height: 10px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Response panel ──────────────────────────────────────────── */
.response-panel {
  margin-top: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  overflow: hidden;
}

.response-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}

.response-time { font-size: 0.75rem; color: var(--vp-c-text-3); }

.clear-btn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  cursor: pointer;
  padding: 2px 4px;
}

.clear-btn:hover { color: var(--vp-c-text-1); }

.response-body {
  margin: 0;
  padding: 10px 14px;
  font-size: 0.8rem;
  line-height: 1.55;
  background: var(--vp-c-bg-alt);
  max-height: 240px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.fetch-error {
  margin-top: 10px;
  padding: 8px 12px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 4px;
  font-size: 0.82rem;
  line-height: 1.5;
}

.dark .fetch-error { background: #450a0a; color: #fca5a5; }

/* ── Responses table ─────────────────────────────────────────── */
.resp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.resp-table th {
  text-align: left;
  padding: 5px 10px;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  font-weight: 600;
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
}

.resp-table td {
  padding: 5px 10px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.resp-table tr:last-child td { border-bottom: none; }

/* ── Status badges ───────────────────────────────────────────── */
.status-badge {
  display: inline-block;
  font-family: var(--vp-font-family-mono);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 3px;
}

.status-badge.success      { background: #d1fae5; color: #065f46; }
.status-badge.client-error { background: #fee2e2; color: #991b1b; }
.status-badge.server-error { background: #fef3c7; color: #92400e; }
.status-badge.neutral      { background: var(--vp-c-bg-mute); color: var(--vp-c-text-2); }

.dark .status-badge.success      { background: #064e3b; color: #6ee7b7; }
.dark .status-badge.client-error { background: #450a0a; color: #fca5a5; }
.dark .status-badge.server-error { background: #451a03; color: #fcd34d; }

/* ── Shared ──────────────────────────────────────────────────── */
.mono { font-family: var(--vp-font-family-mono) !important; }
</style>
