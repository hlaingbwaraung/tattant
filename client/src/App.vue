<script setup>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useThemeStore } from './store/theme'

// Initialize theme on app mount
const themeStore = useThemeStore()
</script>

<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<style>
/* Base styles moved to style.css */
</style>
