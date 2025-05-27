<script lang="ts" setup>
import {computed, ref} from 'vue'

import { useRoute } from 'vue-router';
// Accède à la route active
const route = useRoute();

interface AppButton {
  name: string;
  path: string;
}

const apps = ref([
  {name: 'RestaurantWheel', label: 'Restaurant Wheel'},
])

const gridColumns = computed(() => {
  const itemCount = apps.value.length;

  return Math.ceil(Math.sqrt(itemCount));
});


const gridSize = computed(() => {
  const columns = gridColumns.value;
  const totalItems = columns * columns;
  return {
    columns,
    totalItems,
  };
});
// Détermine les pages où la navigation doit être masquée
const hideNavigation = computed(() => {
  // Masquer la navigation, par exemple, pour `/restaurant-wheel`
  return route.name !== 'mainApp';
});

</script>

<template>
  <div class="container" v-if="!hideNavigation">
    <div :style="{ '--grid-columns': gridSize.columns }" class="app-grid">
      <router-link v-for="app in apps"
                   :key="app.name"
                   :to="{name : app.name}"
                   class="app-button"
      >
        {{ app.label }}
      </router-link>
    </div>

    <RouterView v-if="hideNavigation" />
  </div>
</template>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-grid {
  --min-button-width: 200px;
  --grid-gap: 2.5rem;

  display: grid;
  grid-template-columns: repeat(var(--grid-columns), var(--min-button-width));
  gap: var(--grid-gap);
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 3rem;
  box-sizing: border-box;
}

.app-button {
  background-color: #1a1a1a;
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 0.9rem;
  font-size: 1.1em;
  text-align: center;
  transition: all 0.25s ease;
  aspect-ratio: 2/1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-button:hover {
  border-color: #646cff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 1024px) {
  .app-grid {
    --min-button-width: 180px;
    --grid-gap: 2rem;
    padding: 2rem;
  }
}

@media (max-width: 768px) {
  .app-grid {
    --min-button-width: 140px;
    --grid-gap: 1.5rem;
    padding: 1.5rem;
  }
}

@media (prefers-color-scheme: light) {
  .app-button {
    background-color: #f9f9f9;
  }
}
</style>