/** Mapea nombres de color en español (los que cargue el admin) a un swatch visual. */
const COLOR_MAP: Record<string, string> = {
  negro: '#1a1626',
  blanco: '#f5f2ea',
  beige: '#e3cfa8',
  gris: '#8a8a8a',
  azul: '#3b6cf6',
  'azul marino': '#1f3a63',
  verde: '#3fcda3',
  rojo: '#ff5c47',
  amarillo: '#ffd23f',
  naranja: '#ff9d2e',
  morado: '#8b5cf6',
  rosa: '#ff8fb3',
  cafe: '#7a4a2b',
  café: '#7a4a2b',
};

export function swatchFor(name: string): string {
  return COLOR_MAP[name.trim().toLowerCase()] ?? '#453a68';
}
