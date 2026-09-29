import { motion } from 'framer-motion'

const VARIANTS = {
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  up: { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } },
  down: { hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -28 }, visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 28 }, visible: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } },
}

/**
 * Scroll-triggered reveal wrapper used across the marketing pages.
 * Respects prefers-reduced-motion through the global CSS rule.
 */
export default function Reveal({
  children,
  variant = 'up',
  delay = 0,
  duration = 0.55,
  once = true,
  className,
  as = 'div',
  ...props
}) {
  const Component = motion[as] ?? motion.div
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-80px' }}
      variants={VARIANTS[variant] ?? VARIANTS.up}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </Component>
  )
}
