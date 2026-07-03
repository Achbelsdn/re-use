export const createLocomotive = async () => {
  // Ne pas initialiser locomotive sur mobile — ça casse le scroll natif tactile
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    return null;
  }
  const LocomotiveScroll = (await import('locomotive-scroll')).default;
  const locomotiveScroll = new LocomotiveScroll();
  return locomotiveScroll;
};
