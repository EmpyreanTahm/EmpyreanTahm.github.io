import { SearchPlugin } from 'vitepress-plugin-search'
import { defineConfig } from 'vite'
import flexSearchIndexOptions from 'flexsearch'

export default defineConfig({
    plugins: [SearchPlugin({
        ...flexSearchIndexOptions,
        previewLength: 62,
        buttonLabel: 'Search',
        placeholder: 'Search docs',
        allow: [],
        ignore: []
    })]
})
