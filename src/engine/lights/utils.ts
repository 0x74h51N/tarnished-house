//fireLight animation
export const animateValue = (
  base: number,
  { speed, amplitude }: { speed: number; amplitude: number },
  elapsed: number
) => base + Math.sin(elapsed * speed) * amplitude;
