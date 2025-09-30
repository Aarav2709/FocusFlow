import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  routeKey: string;
  children: ReactNode;
}

const variants = {
  initial: { opacity: 0, y: 24 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 }
};

export const PageTransition = ({ routeKey, children }: PageTransitionProps) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={routeKey}
      initial="initial"
      animate="enter"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      style={{ height: '100%' }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

export default PageTransition;
