<script setup lang="ts">
import { ref, computed } from 'vue';

interface Restaurant {
    id: number;
    name: string;
    rating: number;
    urlGoogle: string,
}

/**
 *
 * Caravane Palace
 */
const restaurantsOld = ref<Restaurant[]>([
    { id: 1, name: 'Café Pok', rating: 5, urlGoogle: '' },
    { id: 2, name: 'OKO café', rating: 4, urlGoogle: '' },
    { id: 3, name: 'Sabibi Pitas', rating: 4, urlGoogle: 'https://maps.app.goo.gl/7f1tGoSCkmHeS6Zw5' },
    { id: 4, name: 'Mirli', rating: 4, urlGoogle: '' }
]);

const restaurants = ref<Restaurant[]>([
  { id: 1, name: 'Café Pok', rating: 5, urlGoogle: '' },
  { id: 2, name: 'OKO café', rating: 4, urlGoogle: '' },
  { id: 3, name: 'Sabibi Pitas', rating: 4, urlGoogle: 'https://maps.app.goo.gl/7f1tGoSCkmHeS6Zw5' },
  { id: 4, name: 'Mirlitantouille', rating: 4, urlGoogle: '' },
  { id: 5, name: 'Satio', rating: 5, urlGoogle: '' },
  { id: 6, name: 'Hot My Dog', rating: 4, urlGoogle: '' },
  { id: 7, name: 'Ferveur', rating: 0, urlGoogle: '' },
  { id: 8, name: 'NOW!', rating: 0, urlGoogle: '' },
  { id: 9, name: '7 grammes', rating: 3, urlGoogle: 'https://maps.app.goo.gl/LXBjX7BGWyrVn58F8' },
  { id: 10, name: 'Pepin Bistrot', rating: 4, urlGoogle: '' },
  { id: 11, name: 'Jeddo', rating: 0, urlGoogle: '' },
  { id: 12, name: 'Les Bavardes', rating: 0, urlGoogle: '' },
  { id: 13, name: 'Hanami Ramen', rating: 5, urlGoogle: 'https://maps.app.goo.gl/i7SA4RoBm6Pg8SET9' },
  { id: 14, name: 'Ramen ya', rating: 5, urlGoogle: 'https://maps.app.goo.gl/zeQMxffvnPSusYDs7' },
  { id: 15, name: 'Banco', rating: 4, urlGoogle: 'https://maps.app.goo.gl/CB9a1Hehzy6Jk125A' },
  { id: 16, name: 'Le Coucou Rennais', rating: 3, urlGoogle: 'https://maps.app.goo.gl/v5xkH3nf9J2i6cGg8' },
  { id: 17, name: 'SAKURA YA', rating: 0, urlGoogle: 'https://maps.app.goo.gl/juTMevXH8Th8sfGX7' },
  { id: 18, name: 'Mono (Pizza)', rating: 4, urlGoogle: 'https://maps.app.goo.gl/nVxZ9wwUJFfcwbJQ7' },
  { id: 19, name: 'Le Globe', rating: 4, urlGoogle: 'https://maps.app.goo.gl/EG5QVaJ59hGEX5F29' },
  { id: 20, name: 'Bombance', rating: 0, urlGoogle: 'https://maps.app.goo.gl/2GNaeDVKAEE8gKnR8' },
  { id: 21, name: 'Café Albertine', rating: 3, urlGoogle: 'https://maps.app.goo.gl/WCFqz33vh1KFkW789' },
  { id: 22, name: 'Caravane Palace', rating: 3, urlGoogle: 'https://maps.app.goo.gl/fgNb6ZtZssfTGhpa6' },
]);

const selectedRestaurant = ref<string | null>(null);
const newRestaurantName = ref('');
const editingRestaurant = ref<Restaurant | null>(null);

const updateRating = (restaurant: Restaurant, newRating: number) => {
    restaurant.rating = newRating;
};

const addRestaurant = () => {
    if (newRestaurantName.value.trim()) {
        const newId = Math.max(...restaurants.value.map(r => r.id), 0) + 1;
        restaurants.value.push({
            id: newId,
            name: newRestaurantName.value.trim(),
            rating: 0,
            urlGoogle: ''
        });
        newRestaurantName.value = '';
    }
};

const addExistingRestaurant = (restaurant: Restaurant) => {
    restaurants.value.push(restaurant);
};

const startEditing = (restaurant: Restaurant) => {
    editingRestaurant.value = { ...restaurant };
};

const saveEdit = () => {
    if (editingRestaurant.value) {
        const index = restaurants.value.findIndex(r => r.id === editingRestaurant.value!.id);
        if (index !== -1) {
            restaurants.value[index] = { ...editingRestaurant.value };
        }
        editingRestaurant.value = null;
    }
};

const cancelEdit = () => {
    editingRestaurant.value = null;
};

const removeRestaurant = (id: number) => {
    restaurants.value = restaurants.value.filter(r => r.id !== id);
};

const deleteRestaurant = (id: number) => {
    restaurants.value = restaurants.value.filter(r => r.id !== id);
};

const sortedRestaurants = computed(() => {
    if (!selectedRestaurant.value) return restaurants.value;

    return [...restaurants.value].sort((a, b) => {
        if (a.name === selectedRestaurant.value) return -1;
        if (b.name === selectedRestaurant.value) return 1;
        return 0;
    });
});

const handleDragStart = (event: DragEvent, restaurant: Restaurant) => {
    if (event.dataTransfer) {
        event.dataTransfer.setData('restaurant', JSON.stringify(restaurant));
    }
};

defineExpose({ selectedRestaurant, restaurants, removeRestaurant, addExistingRestaurant });
</script>

<template>
    <div class="restaurant-list">
        <div>
            <img class="logo" src="../../../public/RestaurantWheel.svg" height="150" alt="icon"/>
            <h2 style="margin-top: 0px">Restaurants de Rennes</h2>
        </div>

        <div class="add-restaurant">
            <input
                v-model="newRestaurantName"
                placeholder="Nouveau restaurant"
                @keyup.enter="addRestaurant"
            />
            <button @click="addRestaurant" class="add-btn">Ajouter</button>
        </div>

        <div class="restaurant-items">
            <div
                v-for="restaurant in sortedRestaurants"
                :key="restaurant.id"
                class="restaurant-item"
                :class="{ 'selected': restaurant.name === selectedRestaurant }"
                draggable="true"
                @dragstart="handleDragStart($event, restaurant)"
            >
                <div class="restaurant-header">
                    <div v-if="editingRestaurant?.id === restaurant.id" class="edit-form">
                        <input
                            v-model="editingRestaurant.name"
                            @keyup.enter="saveEdit"
                        />
                        <div class="edit-buttons">
                            <button @click="saveEdit" class="save-btn">✓</button>
                            <button @click="cancelEdit" class="cancel-btn">✗</button>
                        </div>
                    </div>
                    <span v-else>{{ restaurant.name }}</span>
                    <div v-if="editingRestaurant?.id !== restaurant.id" class="actions">
                        <button @click="startEditing(restaurant)" class="edit-btn">✎</button>
                        <button @click="deleteRestaurant(restaurant.id)" class="delete-btn">🗑</button>
                    </div>
                </div>
                <div class="rating">
          <span
              v-for="star in 5"
              :key="star"
              :class="{ 'star-filled': star <= restaurant.rating }"
              @click="updateRating(restaurant, star)"
          >
            ★
          </span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.restaurant-list .logo{
    margin-left: auto;
    margin-right: auto;
    display: block;
}

.restaurant-list {
    width: 50vh;
    padding: 20px;
    background: #f5f5f5;
    height: 100vh;
    overflow-y: auto;
}

:root.dark .restaurant-list {
    background: #1c375f;
    color: #ffffff;
}

.add-restaurant {
    margin-bottom: 20px;
    display: flex;
    gap: 8px;
}

.add-restaurant input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    color: #333;
}

:root.dark .add-restaurant input {
    background: #57769a;
    color: white;

}

.add-btn {
    padding: 8px 16px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.restaurant-items {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.restaurant-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 10px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: grab;
}

:root.dark .restaurant-item {
    background: #57769a;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.restaurant-item:active {
    cursor: grabbing;
}

.restaurant-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.edit-form {
    display: flex;
    gap: 8px;
    width: 100%;
}

.edit-form input {
    flex: 1;
    padding: 4px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

:root.dark .edit-form input {
    background: #444;
    color: white;
    border-color: #555;
}

.actions {
    display: flex;
    gap: 4px;
}

.edit-btn, .delete-btn, .save-btn, .cancel-btn {
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
}

.edit-btn {
    background: #2196F3;
    color: white;
}

.delete-btn {
    background: #f44336;
    color: white;
}

.save-btn {
    background: #4CAF50;
    color: white;
}

.cancel-btn {
    background: #9e9e9e;
    color: white;
}

.restaurant-item.selected {
    background: #e3f2fd;
    transform: scale(1.02);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

:root.dark .restaurant-item.selected {
    background: #1a237e;
}

.rating {
    display: flex;
    gap: 5px;
}

.rating span {
    cursor: pointer;
    color: #ddd;
    font-size: 20px;
}

:root.dark .rating span {
    color: #555;
}

.rating span.star-filled {
    color: #ffd700;
}

:root.dark .rating span.star-filled {
    color: #ffd700;
}
</style>