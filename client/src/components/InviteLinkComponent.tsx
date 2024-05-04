import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClickToCopyProps {
  link: string;
}

const ClickToCopy: React.FC<ClickToCopyProps> = ({ link }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset the copied state after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const variants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  return (
    <div className='relative flex items-center space-x-2' onClick={handleCopy}>
      <input
        type='text'
        readOnly
        value={link}
        className='text-gray-800 cursor-pointer border border-none active:border-none rounded-lg p-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 w-full'
      />
      <AnimatePresence>
        {copied && (
          <motion.div
            initial='hidden'
            animate='visible'
            exit='hidden'
            variants={variants}
            transition={{ duration: 0.5 }}
            className='absolute inset-y-0 right-0 pr-4 flex items-center'
          >
            <span className='text-green-500 font-medium'>Copied!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClickToCopy;
