import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import VueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
	plugins: [vue(), VueDevTools()],
	server: {
		port: 8000,
		host: '0.0.0.0',
		strictPort: true
	}
});
