/**
 * Public-asset URL helper: prefixes Vite's base path so the app works both
 * at the domain root (dev, `/`) and under a subpath (GitHub Pages,
 * `/lattice-atlas/`). Use for every public/ asset referenced from JSX.
 */
export const asset = (path: string) => import.meta.env.BASE_URL + path;
