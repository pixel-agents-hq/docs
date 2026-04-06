<template>
  <div class="api-reference">
    <!-- Endpoints -->
    <div v-for="[path, methods] in endpoints" :key="path" class="endpoint-group">
      <div v-for="[method, op] in Object.entries(methods)" :key="method" class="endpoint">
        <div class="endpoint-header">
          <span :class="['method-badge', method.toLowerCase()]">{{ method.toUpperCase() }}</span>
          <code class="endpoint-path">{{ path }}</code>
          <span v-if="op.security?.length" class="auth-badge" title="Requires Bearer token">🔒</span>
        </div>

        <p class="endpoint-summary">{{ op.summary }}</p>
        <p v-if="op.description" class="endpoint-description" v-html="renderDescription(op.description)"></p>

        <!-- Path parameters -->
        <template v-if="pathParams(op).length">
          <h4>Path Parameters</h4>
          <table class="params-table">
            <thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead>
            <tbody>
              <tr v-for="p in pathParams(op)" :key="p.name">
                <td><code>{{ p.name }}</code><span v-if="p.required" class="required">*</span></td>
                <td><code>{{ p.schema?.type ?? 'string' }}</code></td>
                <td>{{ p.description }}</td>
              </tr>
            </tbody>
          </table>
        </template>

        <!-- Request body examples -->
        <template v-if="op.requestBody">
          <h4>Request Body</h4>
          <p class="schema-note">Content-Type: <code>application/json</code> · Max size: 64 KB</p>
          <div v-if="requestExamples(op).length" class="examples-tabs">
            <div class="tab-list">
              <button
                v-for="ex in requestExamples(op)"
                :key="ex.key"
                :class="['tab-btn', { active: activeTab[path + method] === ex.key }]"
                @click="setTab(path + method, ex.key)"
              >{{ ex.summary }}</button>
            </div>
            <div class="tab-content">
              <pre v-for="ex in requestExamples(op)" v-show="activeTab[path + method] === ex.key || (!activeTab[path + method] && ex === requestExamples(op)[0])" :key="ex.key"><code>{{ JSON.stringify(ex.value, null, 2) }}</code></pre>
            </div>
          </div>
        </template>

        <!-- Responses -->
        <h4>Responses</h4>
        <table class="params-table responses-table">
          <thead><tr><th>Status</th><th>Description</th></tr></thead>
          <tbody>
            <tr v-for="[status, resp] in Object.entries(op.responses)" :key="status">
              <td><span :class="['status-badge', statusClass(status)]">{{ status }}</span></td>
              <td>{{ resp.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import spec from '@pixel-agents-openapi'

const activeTab = reactive<Record<string, string>>({})

function setTab(key: string, tab: string) {
  activeTab[key] = tab
}

const endpoints = computed(() => {
  return Object.entries(spec.paths ?? {}) as [string, Record<string, any>][]
})

function pathParams(op: any) {
  return (op.parameters ?? []).filter((p: any) => p.in === 'path')
}

function requestExamples(op: any): { key: string; summary: string; value: unknown }[] {
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

function statusClass(status: string): string {
  const code = parseInt(status)
  if (code >= 200 && code < 300) return 'success'
  if (code >= 400 && code < 500) return 'client-error'
  if (code >= 500) return 'server-error'
  return ''
}

function renderDescription(desc: string): string {
  return desc.replace(/\n/g, '<br>').replace(/`([^`]+)`/g, '<code>$1</code>')
}
</script>

<style scoped>
.api-reference {
  margin-top: 1.5rem;
}

.endpoint {
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  background: var(--vp-c-bg-soft);
}

.endpoint-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.method-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 3px;
  letter-spacing: 0.05em;
  font-family: var(--vp-font-family-mono);
}

.method-badge.get { background: #d1fae5; color: #065f46; }
.method-badge.post { background: #dbeafe; color: #1e40af; }
.method-badge.put { background: #fef3c7; color: #92400e; }
.method-badge.delete { background: #fee2e2; color: #991b1b; }

.dark .method-badge.get { background: #064e3b; color: #6ee7b7; }
.dark .method-badge.post { background: #1e3a5f; color: #93c5fd; }
.dark .method-badge.put { background: #451a03; color: #fcd34d; }
.dark .method-badge.delete { background: #450a0a; color: #fca5a5; }

.endpoint-path {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.auth-badge {
  font-size: 0.85rem;
  opacity: 0.7;
  cursor: help;
}

.endpoint-summary {
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: var(--vp-c-text-1);
}

.endpoint-description {
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
  font-size: 0.9rem;
  line-height: 1.6;
}

.schema-note {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  margin-bottom: 0.75rem;
}

.params-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.params-table th {
  text-align: left;
  padding: 6px 12px;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.params-table td {
  padding: 6px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
  vertical-align: top;
}

.params-table tr:last-child td {
  border-bottom: none;
}

.required {
  color: var(--vp-c-danger-1);
  margin-left: 2px;
}

.status-badge {
  display: inline-block;
  font-family: var(--vp-font-family-mono);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 3px;
}

.status-badge.success { background: #d1fae5; color: #065f46; }
.status-badge.client-error { background: #fee2e2; color: #991b1b; }
.status-badge.server-error { background: #fef3c7; color: #92400e; }

.dark .status-badge.success { background: #064e3b; color: #6ee7b7; }
.dark .status-badge.client-error { background: #450a0a; color: #fca5a5; }
.dark .status-badge.server-error { background: #451a03; color: #fcd34d; }

.examples-tabs {
  margin-bottom: 1rem;
}

.tab-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 0;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 0;
}

.tab-btn {
  font-size: 0.75rem;
  padding: 4px 10px;
  border: 1px solid var(--vp-c-divider);
  border-bottom: none;
  background: var(--vp-c-bg-mute);
  cursor: pointer;
  border-radius: 3px 3px 0 0;
  color: var(--vp-c-text-2);
  transition: background 0.15s;
}

.tab-btn:hover {
  background: var(--vp-c-bg-soft);
}

.tab-btn.active {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border-bottom: 1px solid var(--vp-c-bg);
  margin-bottom: -1px;
  position: relative;
  z-index: 1;
}

.tab-content pre {
  margin: 0;
  border-radius: 0 4px 4px 4px;
  border: 1px solid var(--vp-c-divider);
  border-top: none;
  background: var(--vp-c-bg-alt) !important;
  font-size: 0.8rem;
  max-height: 300px;
  overflow-y: auto;
}

h4 {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-3);
  margin: 1rem 0 0.5rem;
}
</style>
