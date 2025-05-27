<template>
  <div class="fortune-wheel-container" :style="{ width: width + 'px', height: height + 'px' }">
    <div class="wheel-wrapper">
      <svg
          :width="wheelSize"
          :height="wheelSize"
          :viewBox="`0 0 ${wheelSize} ${wheelSize}`"
          class="wheel-svg"
          :style="{
          transform: `rotate(${rotationAngle}deg)`,
          transition: isSpinning ? spinTransition : 'none'
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

          <!-- Center hub -->
          <circle
              cx="0"
              cy="0"
              :r="hubRadius"
              :fill="hubColor"
              class="wheel-hub"
          />
        </g>
      </svg>

      <!-- Pointer -->
      <div class="wheel-pointer" :style="{ borderTopColor: pointerColor }"></div>
    </div>

    <button
        class="spin-button"
        @click="spinWheel"
        :disabled="isSpinning"
    >
      {{ spinButtonText }}
    </button>

    <div v-if="showResult && selectedSection" class="result-display">
      Selected: {{ selectedSection.text }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'FortuneWheel',
  props: {
    sections: {
      type: Array,
      required: true,
      validator: (value) => value.length >= 2
    },
    width: {
      type: Number,
      default: 400
    },
    height: {
      type: Number,
      default: 500
    },
    duration: {
      type: Number,
      default: 5000
    },
    easing: {
      type: String,
      default: 'cubic-bezier(0.17, 0.67, 0.83, 0.67)'
    },
    spinButtonText: {
      type: String,
      default: 'SPIN'
    },
    hubColor: {
      type: String,
      default: '#333333'
    },
    pointerColor: {
      type: String,
      default: '#FF5252'
    },
    defaultSectionColor: {
      type: String,
      default: '#3498DB'
    },
    showResultText: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      rotationAngle: 0,
      isSpinning: false,
      selectedSection: null,
      showResult: false,
      lastSelectedIndex: -1,
      currentRotation: 0 // Track current rotation for continuous spinning
    };
  },
  computed: {
    wheelSize() {
      return Math.min(this.width, this.height - 80);
    },
    hubRadius() {
      return this.wheelSize * 0.05;
    },
    textPadding() {
      return this.wheelSize * 0.14;
    },
    textSize() {
      return Math.max(10, Math.min(16, this.wheelSize * 0.04));
    },
    spinTransition() {
      return `transform ${this.duration / 1000}s ${this.easing}`;
    },
    normalizedSections() {
      const colors = [
        '#3498DB', '#E74C3C', '#2ECC71', '#F39C12',
        '#9B59B6', '#1ABC9C', '#D35400', '#34495E'
      ];

      return this.sections.map((section, index) => {
        const text = typeof section === 'object' ? section.text || `Section ${index+1}` : section;
        const color = typeof section === 'object' && section.color
            ? section.color
            : colors[index % colors.length];

        return {
          ...section,
          text,
          color,
          id: typeof section === 'object' && section.id ? section.id : index
        };
      });
    }
  },
  methods: {
    getSectionPath(index) {
      const totalSections = this.normalizedSections.length;
      const anglePerSection = 360 / totalSections;

      // Start angle for this section
      const startAngle = index * anglePerSection;
      const endAngle = (index + 1) * anglePerSection;

      // Convert to radians
      const startRad = (startAngle - 90) * Math.PI / 180;
      const endRad = (endAngle - 90) * Math.PI / 180;

      const radius = this.wheelSize / 2 - 2; // Slightly smaller to fit in SVG

      // Calculate points
      const x1 = radius * Math.cos(startRad);
      const y1 = radius * Math.sin(startRad);
      const x2 = radius * Math.cos(endRad);
      const y2 = radius * Math.sin(endRad);

      // Create the arc path
      const largeArcFlag = anglePerSection > 180 ? 1 : 0;

      return `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    },
    getSectionTextRotation(index) {
      const totalSections = this.normalizedSections.length;
      const anglePerSection = 360 / totalSections;
      //return index * anglePerSection + anglePerSection / 2;
      return index * anglePerSection ;
    },
    spinWheel() {
      if (this.isSpinning) return;

      this.isSpinning = true;
      this.showResult = false;
      this.selectedSection = null;

      // Calculate current absolute rotation
      this.currentRotation = this.currentRotation % 360;

      // Determine number of full rotations (2-4 rotations)
      const minRotations = 2;
      const maxRotations = 4;
      const rotations = minRotations + Math.random() * (maxRotations - minRotations);

      // Select target section
      let targetIndex;
      if (this.normalizedSections.length > 1) {
        do {
          targetIndex = Math.floor(Math.random() * this.normalizedSections.length);
        } while (targetIndex === this.lastSelectedIndex);
        this.lastSelectedIndex = targetIndex;
      } else {
        targetIndex = 0;
      }

      // Calculate final stopping position
      const sectionsCount = this.normalizedSections.length;
      const degreesPerSection = 360 / sectionsCount;

      // Calculate the target angle to stop at (pointer at top)
      const targetAngle = 360 - (targetIndex * degreesPerSection);

      // Calculate total rotation including current position, full rotations, and target position
      const totalRotation = this.currentRotation + (rotations * 360) + targetAngle;

      // Update rotation angle
      this.rotationAngle = totalRotation;
      this.currentRotation = totalRotation;

      // After spin completes
      setTimeout(() => {
        this.isSpinning = false;
        this.selectedSection = this.normalizedSections[targetIndex];
        this.showResult = this.showResultText;

        // Emit selected section
        this.$emit('selection', this.selectedSection);
      }, this.duration);
    },
    getContrastColor(backgroundColor) {
      let hex = backgroundColor.replace('#', '');
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }

      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }
  }
};
</script>

<style scoped>
.fortune-wheel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;
}

.wheel-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.wheel-svg {
  transform-origin: center;
  will-change: transform;
}

.wheel-section {
  stroke: #ffffff;
  stroke-width: 1;
}

.section-text {
  font-weight: bold;
  pointer-events: none;
  font-family: 'Arial', sans-serif;
}

.wheel-hub {
  stroke: #ffffff;
  stroke-width: 2;
}

.wheel-pointer {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 30px solid;
  z-index: 10;
}

.spin-button {
  padding: 12px 24px;
  font-size: 18px;
  font-weight: bold;
  background-color: #ff4757;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.spin-button:hover {
  background-color: #ff6b81;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.spin-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.spin-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.result-display {
  margin-top: 15px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  padding: 10px 15px;
  border-radius: 8px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .fortune-wheel-container {
    width: 100% !important;
    height: auto !important;
  }

  .spin-button {
    padding: 10px 20px;
    font-size: 16px;
  }
}
</style>