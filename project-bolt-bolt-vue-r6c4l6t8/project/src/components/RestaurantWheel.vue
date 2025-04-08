<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useMousePressed } from '@vueuse/core';

const wheelRef = ref<HTMLDivElement | null>(null);
const rotation = ref(0);
const spinning = ref(false);
const { pressed } = useMousePressed();

const props = defineProps<{
  restaurants: { id: number; name: string; rating: number; }[];
}>();

const selectedRestaurant = ref<string | null>(null);

const normalizedRotation = computed(() => {
  const normalized = rotation.value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
});

const currentSection = computed(() => {
  const sectionAngle = 360 / props.restaurants.length;
  const currentIndex = Math.floor(((360 - normalizedRotation.value) % 360) / sectionAngle);
  return props.restaurants[currentIndex]?.name;
});

let startAngle = 0;
let startRotation = 0;

const handleMouseDown = (event: MouseEvent) => {
  if (!wheelRef.value) return;
  startAngle = Math.atan2(
    event.clientY - wheelRef.value.offsetHeight / 2,
    event.clientX - wheelRef.value.offsetWidth / 2
  );
  startRotation = rotation.value;
};

const handleMouseMove = (event: MouseEvent) => {
  if (!pressed.value || !wheelRef.value) return;
  const currentAngle = Math.atan2(
    event.clientY - wheelRef.value.offsetHeight / 2,
    event.clientX - wheelRef.value.offsetWidth / 2
  );
  const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
  rotation.value = startRotation + angleDiff;
  selectedRestaurant.value = currentSection.value;
};

const spinWheel = () => {
  if (spinning.value) return;
  spinning.value = true;
  
  const sectionAngle = 360 / props.restaurants.length;
  const fullRotations = 3 + Math.random() * 2;
  const randomSection = Math.floor(Math.random() * props.restaurants.length);
  const targetRotation = rotation.value + (fullRotations * 360) + (randomSection * sectionAngle);
  
  let startTime: number | null = null;
  const duration = 4000;
  
  const animate = (currentTime: number) => {
    if (!startTime) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    
    rotation.value = startRotation + (targetRotation - startRotation) * easeOut(progress);
    selectedRestaurant.value = currentSection.value;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      spinning.value = false;
      rotation.value = targetRotation;
      selectedRestaurant.value = currentSection.value;
    }
  };
  
  const startRotation = rotation.value;
  requestAnimationFrame(animate);
};

defineExpose({ selectedRestaurant });
</script>

<template>
  <div class="wheel-container">
    <div 
      ref="wheelRef"
      class="wheel"
      :style="{ transform: `rotate(${rotation}deg)` }"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
    >
      <div 
        v-for="(restaurant, index) in restaurants" 
        :key="restaurant.id"
        class="wheel-section"
        :style="{ 
          transform: `rotate(${index * (360 / restaurants.length)}deg)`,
          backgroundColor: index % 2 === 0 ? '#f0f0f0' : '#ffffff'
        }"
      >
        <div class="restaurant-name">{{ restaurant.name }}</div>
      </div>
      <div class="wheel-center"></div>
    </div>
    <div class="pointer"></div>
    <button class="spin-button" @click="spinWheel" :disabled="spinning">
      Tourner la roue
    </button>
  </div>
</template>

<style scoped>
.wheel-container {
  position: relative;
  width: 500px;
  height: 500px;
  margin: 50px;
}

.wheel {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 10px solid #333;
  background: #fff;
  cursor: grab;
  transition: transform 0.1s linear;
  overflow: hidden;
}

.wheel:active {
  cursor: grabbing;
}

.wheel-section {
  position: absolute;
  width: 50%;
  height: 50%;
  transform-origin: 100% 100%;
  clip-path: polygon(0 0, 100% 0, 100% 100%);
}

.restaurant-name {
  position: absolute;
  bottom: 10%;
  left: 20%;
  transform: rotate(90deg);
  transform-origin: left center;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  font-weight: 500;
  text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;
}

.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  background: #333;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.pointer {
  position: absolute;
  top: 50%;
  right: -30px;
  width: 40px;
  height: 20px;
  background: #ff4444;
  clip-path: polygon(0 50%, 100% 0, 100% 100%);
  transform: translateY(-50%);
  z-index: 10;
}

.spin-button {
  position: absolute;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  font-size: 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.spin-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>