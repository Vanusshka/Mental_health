import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMood } from "@/contexts/MoodContext";

export default function MouseGlow() {
  const { theme } = useMood();
  const mouseX = useMotionValue(-300);
  const mouseY = useMotionValue(-300);

  const springX = useSpring(mouseX, { stiffness: 45, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 45, damping: 18 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 180);
      mouseY.set(e.clientY - 180);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  if (!theme) return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-0 rounded-full"
      style={{
        x: springX,
        y: springY,
        width: 360,
        height: 360,
        background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`,
        mixBlendMode: "normal",
      }}
    />
  );
}
