import { motion } from 'framer-motion';

interface CoinProps {
  Image: string;
  onClick: () => void;
}

export default function Coin({ Image, onClick }: CoinProps) {
  return (
    <motion.div
      onClick={onClick}
      initial='initial'
      animate={{ x: 0 }}
      whileHover={{ scale: 1.05 }}
      style={{
        cursor: 'pointer',
        width: '200px',
        height: '200px',
        position: 'relative',
        display: 'inline-block',
      }}
    >
      <img src={Image} alt='coin' style={{ width: '200px', height: '200px' }} />
    </motion.div>
  );
}
