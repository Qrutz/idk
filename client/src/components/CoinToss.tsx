import React from 'react';
import { motion } from 'framer-motion';
import heads from '../assets/heads.png';
import tails from '../assets/tails2.png';

interface CoinTossProps {
  onFlip: () => void; // Callback function to signal that a flip has started
  onFinish: (result: boolean) => void; // Callback function to return the result
  isFlipping: boolean; // State to control whether the coin is flipping
}

const CoinToss: React.FC<CoinTossProps> = ({
  onFlip,
  onFinish,
  isFlipping,
}) => {
  const flipAnimation = {
    initial: { scale: 1, y: 0, rotateY: 0 },
    animate: {
      scale: [1, 1.2, 1],
      y: [0, -300, 0],
      rotateY: [0, 7200], // Multiple fast rotations
      transition: {
        scale: { duration: 2, times: [0, 0.5, 1] },
        y: { type: 'spring', stiffness: 170, damping: 8, duration: 2 },
        rotateY: { duration: 2, ease: 'linear' },
      },
    },
  };

  React.useEffect(() => {
    if (isFlipping) {
      onFlip();
      const result = Math.random() < 0.5;
      setTimeout(() => onFinish(result), 2000); // Adjust the time to match the length of the animation
    }
  }, [isFlipping, onFlip, onFinish]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <motion.div
        initial='initial'
        animate={isFlipping ? 'animate' : 'initial'}
        variants={flipAnimation}
        style={{
          cursor: 'pointer',
          width: '200px',
          height: '200px',
          position: 'relative',
          display: 'inline-block',
        }}
      >
        <img
          src={isFlipping ? heads : tails} // Assuming you start with heads
          alt='coin'
          style={{ width: '200px', height: '200px' }}
        />
      </motion.div>
    </div>
  );
};

export default CoinToss;
