export const cardVariants = {
  hidden: { opacity: 0, y: -50, rotate: -10 },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { type: 'spring', stiffness: 500, damping: 30 },
  },
}

export const chipVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { delay: 0.2, duration: 0.4, ease: 'easeOut' },
  },
}

export const winnerBannerVariants = {
  hidden: { opacity: 0, scale: 0.8, y: -30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -50,
    transition: { duration: 0.4, ease: 'easeIn' },
  },
}
