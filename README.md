# Vue 3 + TypeScript + Vite

Vue application with the following features:

    Left Column (RestaurantList.vue):
        List of restaurants in Rennes
        Star rating system (1-5 stars) for each restaurant
        Scrollable list with nice styling
        Added restaurant management features to RestaurantList:
            Add new restaurants
            Edit existing restaurants
            Delete restaurants

    Center Wheel (RestaurantWheel.vue):
        Interactive wheel with all restaurants
        Drag functionality (click and hold to rotate)
        "Spin" button for random selection
        Smooth animation when spinning
        Pointer to indicate selected restaurant

    Component communication:
        Connected the wheel and list components to sync the selected restaurant
        Selection updates while dragging the wheel or after spinning



The wheel can be controlled in two ways:

    Click and drag to manually rotate
    Click the "Tourner la roue" button to spin randomly

The restaurants are displayed in both the list and the wheel. You can rate restaurants in the left panel using the star system, and the wheel will help you randomly select a restaurant when you can't decide where to eat.

## feature

- mode hardCore
  - reserve le resto selectionner, pas de possibiliter de revenir en arrière !!!
- avoir les info google du resto: horaire, app de résa, adresse
- Pouvoir mettre des tag sur des resto et pouvoir lancer la roue que avec les resto sur ce tag, ex: burger, healthy


# Cool

https://spinthewheel.app/editor