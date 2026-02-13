<!--
  App.vue – Root Component

  - Initialises the theme store so dark/light mode is applied on first load.
  - Renders whichever <RouterView> page matches the current URL.
-->

<script setup>
import { RouterView } from 'vue-router'
import { useThemeStore } from './store/theme'

// Trigger theme initialisation (applies dark/light class to <html>)
const themeStore = useThemeStore()
</script>

<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<style>
/* Global styles live in style.css */
</style>
