import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// BASE_PATH lets us build a copy for a preview subfolder (e.g. /neu) without
// touching the default root-relative production build.
const basePath = process.env.BASE_PATH;
if (basePath && !basePath.startsWith('/')) {
	throw new Error('BASE_PATH must start with "/", e.g. BASE_PATH=/neu');
}

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			paths: {
				base: (basePath as `/${string}`) ?? ''
			}
		})
	]
});
