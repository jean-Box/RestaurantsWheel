<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import RestaurantList from './components/RestaurantList.vue';
import RestaurantWheel from './components/RestaurantWheel.vue';

const wheelRef = ref();
const listRef = ref();

// Sync the selected restaurant between components
watch(() => wheelRef.value?.selectedRestaurant, (newValue) => {
  if (listRef.value) {
    listRef.value.selectedRestaurant = newValue;
  }
}, { deep: true });
</script>

<template>
  <div class="app-container">
    <RestaurantList ref="listRef" />
    <main class="main-content">
      <RestaurantWheel 
        ref="wheelRef"
        :restaurants="listRef?.restaurants || []"
      />
    </main>
  </div>
</template>

<style>
.app-container {
  display: flex;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
}

body {
  margin: 0;
  padding: 0;
  display: block;
}

#app {
  padding: 0;
  margin: 0;
  max-width: none;
}
</style>