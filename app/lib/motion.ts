export const motionEase = [0.2, 0.8, 0.2, 1] as const;

export const softPage = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.32, ease: motionEase },
};

export const softSection = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: motionEase },
};

export const softCard = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.42, ease: motionEase },
};

export const softHover = {
  whileHover: { y: -3, scale: 1.01 },
  whileTap: { scale: 0.99 },
  transition: { duration: 0.22, ease: motionEase },
};

export const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.06,
    },
  },
  viewport: { once: true, margin: "-80px" },
};

export const staggerItem = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.42, ease: motionEase },
};
