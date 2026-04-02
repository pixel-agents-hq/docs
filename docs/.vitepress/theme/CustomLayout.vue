<script setup>
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <img
        src="/characters.png"
        alt="Pixel characters"
        class="nav-characters"
      />
    </template>
  </Layout>
</template>

<style scoped>
.nav-characters {
  width: 160px;
  height: 36px;
  image-rendering: pixelated;
  -ms-interpolation-mode: nearest-neighbor;
  margin-left: 12px;
  vertical-align: middle;
}
</style>
