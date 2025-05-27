<script setup lang="ts">
import {ref} from 'vue';

interface Restaurant {
    id: number;
    name: string;
    rating: number;
}

interface ScheduleDay {
    name: string;
    restaurant: Restaurant | null;
}

const props = defineProps<{
    listRef: any;
}>();

const schedule = ref<ScheduleDay[]>([
    { name: 'Lundi', restaurant: null },
    { name: 'Mardi', restaurant: null },
    { name: 'Mercredi', restaurant: null },
    { name: 'Jeudi', restaurant: null },
    { name: 'Vendredi', restaurant: null },
    { name: 'Samedi', restaurant: null },
    { name: 'Dimanche', restaurant: null }
]);

const handleDrop = (event: DragEvent, dayIndex: number) => {
    event.preventDefault();
    const restaurantData = event.dataTransfer?.getData('restaurant');
    if (restaurantData) {
        const restaurant = JSON.parse(restaurantData);
        schedule.value[dayIndex].restaurant = restaurant;
        // Remove from the list
        if (props.listRef) {
            props.listRef.removeRestaurant(restaurant.id);
        }
    }
};

const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
};

const removeRestaurant = (dayIndex: number) => {
    const restaurant = schedule.value[dayIndex].restaurant;
    if (restaurant && props.listRef) {
        // Add back to the list
        props.listRef.addExistingRestaurant(restaurant);
    }
    schedule.value[dayIndex].restaurant = null;
};
</script>

<template>
    <div class="weekly-schedule">
        <h2>Planning de la semaine</h2>
        <div class="schedule-days">
            <div
                v-for="(day, index) in schedule"
                :key="day.name"
                class="schedule-day"
                @drop="handleDrop($event, index)"
                @dragover="handleDragOver"
            >
                <h3>{{ day.name }}</h3>
                <div
                    class="schedule-slot"
                    :class="{ 'has-restaurant': day.restaurant }">
                    <template v-if="day.restaurant">
                        <div class="restaurant-info">
                            <span>{{ day.restaurant.name }}</span>
                            <div class="rating">
                                <span
                                    v-for="star in 5"
                                    :key="star"
                                    :class="{ 'star-filled': star <= day.restaurant.rating }"
                                >★</span>
                            </div>
                        </div>
                        <button
                            class="remove-btn"
                            @click="removeRestaurant(index)">✕
                        </button>
                    </template>
                    <span v-else class="empty-slot">Déposez un restaurant ici</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.weekly-schedule {
    width: 300px;
    padding: 20px;
    background: #f5f5f5;
    height: 100vh;
    overflow-y: auto;
    border-left: 1px solid #ddd;
}

:root.dark .weekly-schedule {
    background: #2a2a2a;
    border-left-color: #444;
    color: #fff;
}

.schedule-days {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.schedule-day h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #666;
}

:root.dark .schedule-day h3 {
    color: #aaa;
}

.schedule-slot {
    min-height: 60px;
    padding: 10px;
    background: white;
    border-radius: 8px;
    border: 2px dashed #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

:root.dark .schedule-slot {
    background: #333;
    border-color: #444;
}

.schedule-slot.has-restaurant {
    border-style: solid;
    border-color: #4CAF50;
    justify-content: space-between;
}

:root.dark .schedule-slot.has-restaurant {
    border-color: #45a049;
}

.empty-slot {
    color: #999;
    font-size: 14px;
    text-align: center;
}

:root.dark .empty-slot {
    color: #666;
}

.restaurant-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.rating {
    display: flex;
    gap: 2px;
}

.rating span {
    color: #ddd;
    font-size: 14px;
}

:root.dark .rating span {
    color: #555;
}

.rating span.star-filled {
    color: #ffd700;
}

.remove-btn {
    background: none;
    border: none;
    color: #ff4444;
    cursor: pointer;
    padding: 4px;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.6;
    transition: opacity 0.3s ease;
}

.remove-btn:hover {
    opacity: 1;
}

:root.dark .remove-btn {
    color: #ff6b6b;
}
</style>