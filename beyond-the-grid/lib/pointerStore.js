/**
 * Posición del ratón normalizada (-1..1), fuera de React.
 * La escribe Experience en 'mousemove' y la lee el useFrame del 3D para el
 * parallax ambiente. Al no ser estado de React, no provoca re-renders.
 */
export const pointer = { x: 0, y: 0 };
