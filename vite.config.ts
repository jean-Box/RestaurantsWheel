import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig(() => {
  console.log(`> Restau Wheel start`);
  let server = {
    /**
     * Ajoute les ip reseau pour partager sont code
     */
    host: true,
  };


  return {
    server,
    preview: server,
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@custom': fileURLToPath(
            new URL('./src/custom/components', import.meta.url)
        )
      },
      extensions: ['.vue', '.js', '.ts'],
    },
  };
});
