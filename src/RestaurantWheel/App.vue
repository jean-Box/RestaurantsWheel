<script setup lang="ts">
import {ref, watch} from 'vue';
import RestaurantList from './components/RestaurantList.vue';
import RestaurantWheel from './components/RestaurantWheel.vue';
import WeeklySchedule from './components/WeeklySchedule.vue';

const wheelRef = ref();
const listRef = ref();
const isDark = ref(false);

// Sync the selected restaurant between components
watch(() => wheelRef.value?.selectedRestaurant, (newValue) => {
  if (listRef.value) {
    listRef.value.selectedRestaurant = newValue;
  }
}, {deep: true});

const toggleTheme = () => {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle('dark', isDark.value);
};
</script>

<template>
  <div class="app-container">
    <RestaurantList ref="listRef"/>
    <main class="main-content">
      <RestaurantWheel
          :height="400"
          :width="450"
          ref="wheelRef"
          :restaurants="listRef?.restaurants || []"
      />
      <button class="theme-toggle" @click="toggleTheme">
        {{ isDark ? '☀️' : '🌙' }}
      </button>
    </main>
    <WeeklySchedule ref="scheduleRef" :list-ref="listRef"/>
  </div>
</template>

<style>
.app-container {
  display: flex;
  max-width: none;
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

:root.dark .main-content {
  background: #192c48;
}

body {
  margin: 0;
  padding: 0;
  display: block;
}

.theme-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}
</style>