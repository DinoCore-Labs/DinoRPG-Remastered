import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';
import VueDevTools from 'vite-plugin-vue-devtools';

const STATIC_DIR = 'public';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());
	return {
		plugins: [vue(), VueDevTools()],
		publicDir: STATIC_DIR,
		server: {
			port: 8080,
			host: '0.0.0.0',
			strictPort: true
		},
		define: {
			['import.meta.env.VITE_APP_VERSION']: JSON.stringify(require('../../package.json').version),
			['import.meta.env.VITE_API_RELEASE_COMMIT']: JSON.stringify(env.VITE_API_RELEASE_COMMIT),
			['import.meta.env.VITE_API_RELEASE_CHANNEL']: JSON.stringify(env.VITE_API_RELEASE_CHANNEL)
		},
		assetsInclude: '**/*.swf'
	};
});
