<script setup lang="ts">
import {computed, ref} from 'vue';
import {useMousePressed} from '@vueuse/core';

const wheelRef = ref<HTMLDivElement | null>(null);
const rotation = ref(0);
const spinning = ref(false);
const {pressed} = useMousePressed();
const powerGauge = ref(0);
const powerGaugeInterval = ref<number | null>(null);
const MAX_POWER = 100;
const MIN_ROTATIONS = 2;
const MAX_ROTATIONS = 8;
const MIN_DURATION = 2000;
const MAX_DURATION = 8000;

const props = defineProps<{
    restaurants: { id: number; name: string; rating: number; }[];
    width:  number;
    height: number;

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

const wheelSize = computed(() => {
  return Math.min(props.width, props.height - 80);
});

const textPadding = computed( () => {
  return wheelSize.value * 0.14;
});

const textSize = computed(() => {
  return Math.max(10, Math.min(16, wheelSize.value * 0.04));
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

const startPowerGauge = () => {
    if (spinning.value) return;
    powerGauge.value = 0;
    powerGaugeInterval.value = setInterval(() => {
        powerGauge.value = Math.min(powerGauge.value + 2, MAX_POWER);
    }, 20);
};

const stopPowerGauge = () => {
    if (powerGaugeInterval.value) {
        clearInterval(powerGaugeInterval.value);
        powerGaugeInterval.value = null;
    }
    if (!spinning.value) {
        spinWheel();
    }
};

const normalizedSections = computed(() => {
  const colors = [
    '#3498DB', '#E74C3C', '#2ECC71', '#F39C12',
    '#9B59B6', '#1ABC9C', '#D35400', '#34495E'
  ];

  return props.restaurants.map((section, index) => {
    const text = typeof section === 'object' ? section.name || `Section ${index+1}` : section;
    const color = typeof section === 'object' && colors[index % colors.length];

    return {
      ...section,
      text,
      color,
      id: typeof section === 'object' && section.id ? section.id : index
    };
  });
});

const getSectionPath = (index: number) => {
  const totalSections = normalizedSections.value.length;
  const anglePerSection = 360 / totalSections;

  // Start angle for this section
  const startAngle = index * anglePerSection;
  const endAngle = (index + 1) * anglePerSection;

  // Convert to radians
  const startRad = (startAngle - 90) * Math.PI / 180;
  const endRad = (endAngle - 90) * Math.PI / 180;

  const radius = wheelSize.value / 2 - 2; // Slightly smaller to fit in SVG

  // Calculate points
  const x1 = radius * Math.cos(startRad);
  const y1 = radius * Math.sin(startRad);
  const x2 = radius * Math.cos(endRad);
  const y2 = radius * Math.sin(endRad);

  // Create the arc path
  const largeArcFlag = anglePerSection > 180 ? 1 : 0;

  return `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
};

const getSectionTextRotation = (index: number) => {
  const totalSections = normalizedSections.value.length;
  const anglePerSection = 360 / totalSections;
  //return index * anglePerSection + anglePerSection / 2;
  return index * anglePerSection ;
};

const getContrastColor = (backgroundColor: string) => {
  let hex = backgroundColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

const spinWheel = () => {
    if (spinning.value) return;
    spinning.value = true;

    const power = powerGauge.value;
    powerGauge.value = 0;

    const rotationMultiplier = MIN_ROTATIONS + (power / MAX_POWER) * (MAX_ROTATIONS - MIN_ROTATIONS);
    const durationMultiplier = MIN_DURATION + (power / MAX_POWER) * (MAX_DURATION - MIN_DURATION);

    const sectionAngle = 360 / props.restaurants.length;
    const randomSection = Math.floor(Math.random() * props.restaurants.length);
    const targetRotation = rotation.value + (rotationMultiplier * 360) + (randomSection * sectionAngle);

    let startTime: number | null = null;
    const duration = durationMultiplier;

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

defineExpose({selectedRestaurant});
</script>

<template>
    <div class="wheel-container">

          <svg
              :width="wheelSize"
              :height="wheelSize"
              :viewBox="`0 0 ${wheelSize} ${wheelSize}`"
              class="wheel-svg"
              :style="{
                transform: `rotate(${rotation}deg)`,
                //transition: isSpinning ? spinTransition : 'none'
              }"
          >
            <g :transform="`translate(${wheelSize / 2}, ${wheelSize / 2})`">
              <!-- Wheel sections -->
              <template v-for="(section, index) in normalizedSections" :key="`section-${index}`">
                <path
                    :d="getSectionPath(index)"
                    :fill="section.color"
                    class="wheel-section"
                />
                <!-- Text for each section -->
                <text
                    :transform="`rotate(${getSectionTextRotation(index)}) translate(15, -${wheelSize / 2 - textPadding}) rotate(95)`"
                    text-anchor="middle"
                    :fill="getContrastColor(section.color)"
                    class="section-text"
                    :style="{ fontSize: `${textSize}px` }"
                >
                  {{ section.name }}
                </text>
              </template>

            </g>
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
            <div class="wheel-center"/>
        </svg>
        <div class="pointer"></div>
        <div class="power-gauge-container">
            <div
                class="power-gauge"
                :style="{ width: `${powerGauge}%` }"
            ></div>
        </div>
        <button
            class="spin-button"
            :disabled="spinning"
            @mousedown="startPowerGauge"
            @mouseup="stopPowerGauge"
            @mouseleave="stopPowerGauge"
        >
            Tourner la roue
        </button>
    </div>
</template>

<style scoped>

.wheel-svg {
  transform-origin: center;
  will-change: transform;
}

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

:root.dark .wheel {
    border-color: #666;
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

:root.dark .wheel-section {
    background-color: #333 !important;
}

:root.dark .wheel-section:nth-child(even) {
    background-color: #444 !important;
}

.restaurant-name {
    position: absolute;
    bottom: 22%;
    left: 92%;
    transform: rotate(265deg);
    transform-origin: left center;
    font-size: 14px;
    color: #333;
    white-space: nowrap;
    font-weight: 500;
    text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;
}

:root.dark .restaurant-name {
    color: #fff;
    text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;
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

:root.dark .wheel-center {
    background: #666;
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

.power-gauge-container {
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 10px;
    background: #ddd;
    border-radius: 5px;
    overflow: hidden;
}

:root.dark .power-gauge-container {
    background: #444;
}

.power-gauge {
    height: 100%;
    width: 0;
    background: linear-gradient(90deg, #4CAF50, #ff4444);
    transition: width 0.02s linear;
}

.spin-button {
    position: absolute;
    bottom: -80px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    font-size: 16px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    user-select: none;
}

.spin-button:disabled {
    background: #ccc;
    cursor: not-allowed;
}

:root.dark .spin-button:disabled {
    background: #444;
    color: #888;
}
</style>