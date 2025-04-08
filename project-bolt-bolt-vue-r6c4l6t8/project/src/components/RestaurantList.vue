<script setup lang="ts">
import { ref, watch, computed } from 'vue';

interface Restaurant {
  id: number;
  name: string;
  rating: number;
}

const restaurants = ref<Restaurant[]>([
  { id: 1, name: 'La Crêperie du Centre', rating: 0 },
  { id: 2, name: 'Le Bistrot des Remparts', rating: 0 },
  { id: 3, name: 'La Table de Rennes', rating: 0 },
  { id: 4, name: 'Le Saint-Georges', rating: 0 },
  { id: 5, name: 'L\'Ardoise', rating: 0 },
  { id: 6, name: 'Le Carré', rating: 0 },
  { id: 7, name: 'La Fontaine aux Perles', rating: 0 },
  { id: 8, name: 'Le Petit Rennais', rating: 0 }
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
      rating: 0
    });
    newRestaurantName.value = '';
  }
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

const deleteRestaurant = (id: number) => {
  restaurants.value = restaurants.value.filter(r => r.id !== id);
};

// Sort restaurants to put selected one at the top
const sortedRestaurants = computed(() => {
  if (!selectedRestaurant.value) return restaurants.value;
  
  return [...restaurants.value].sort((a, b) => {
    if (a.name === selectedRestaurant.value) return -1;
    if (b.name === selectedRestaurant.value) return 1;
    return 0;
  });
});

defineExpose({ selectedRestaurant, restaurants });
</script>

<template>
  <div class="restaurant-list">
    <h2>Restaurants de Rennes</h2>
    
    <!-- Add new restaurant -->
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
.restaurant-list {
  width: 300px;
  padding: 20px;
  background: #f5f5f5;
  height: 100vh;
  overflow-y: auto;
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

.rating {
  display: flex;
  gap: 5px;
}

.rating span {
  cursor: pointer;
  color: #ddd;
  font-size: 20px;
}

.rating span.star-filled {
  color: #ffd700;
}
</style>