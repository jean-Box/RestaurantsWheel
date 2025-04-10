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
            <div class="wheel-center"/>
        </div>
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