import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import heads from '../assets/heads.png';
import tails from '../assets/tails2.png';

interface CoinTossProps {
  result: boolean; // true for tails, false for heads
  win: boolean | undefined; // true if the player won
}

const CoinToss: React.FC<CoinTossProps> = ({ result, win }) => {
  const [animateFlip, setAnimateFlip] = useState(false);
  const [displayResult, setDisplayResult] = useState('');

  useEffect(() => {
    // Trigger flip animation when result is received
    if (result !== undefined) {
      setAnimateFlip(true);
      setTimeout(() => {
        setAnimateFlip(false);
        setDisplayResult(win ? 'You won sir' : 'You lost sir');
      }, 2000); // Duration of the flip animation matches timeout
    }
  }, [result, win]);

  const flipAnimation = {
    initial: { scale: 1, y: 0, rotateY: 0 },
    animate: {
      scale: [1, 1.2, 1],
      y: [0, -300, 0],
      rotateY: [0, 3600], // Making it really fast to mimic a blur
      transition: {
        scale: { duration: 2, times: [0, 0.5, 1] },
        y: { type: 'spring', stiffness: 170, damping: 8, duration: 2 },
        rotateY: { duration: 2, ease: 'linear' },
      },
    },
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <motion.div
        initial='initial'
        animate={animateFlip ? 'animate' : 'initial'}
        variants={flipAnimation}
        style={{
          width: '200px',
          height: '200px',
          position: 'relative',
          display: 'inline-block',
        }}
      >
        <img
          src={result ? tails : heads}
          alt={result ? 'Tails' : 'Heads'}
          style={{ width: '200px', height: '200px' }}
        />
      </motion.div>
      {displayResult && <h3>{displayResult}</h3>}
    </div>
  );
};

export default CoinToss;
