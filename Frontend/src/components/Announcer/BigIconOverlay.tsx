"use client";

import { motion, AnimatePresence } from "framer-motion";
import { bigIconMap } from "./constants";

interface BigIconOverlayProps {
  showIcon: {
    type: string;
    id: string;
  } | null;
}

export default function BigIconOverlay({ showIcon }: BigIconOverlayProps) {
  return (
    <AnimatePresence>
      {showIcon && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
          className="fixed inset-0 pointer-events-none z-[10000] flex items-center justify-center p-6"
        >
          <div className="relative flex items-center justify-center">
            {/* Outer Glow */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-white/20 blur-3xl rounded-full w-64 h-64"
            />

            {/* Icon Container */}
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="relative bg-white/10 backdrop-blur-md border border-white/20 p-12 rounded-[40px] shadow-2xl"
            >
              {bigIconMap[showIcon.type]}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
