import { defineConfig } from "vite";
export default defineConfig({
    root: ".",
    base: "./",
    build: {
        outDir: "app",
        rollupOptions: {
            output: {
                entryFileNames: "assets/[name].js",
                chunkFileNames: "assets/[name].js",
                assetFileNames: "assets/[name].[ext]",
            },
        },
    }
});
