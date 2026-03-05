import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to detect when content overflows horizontally
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Minimum overflow pixels to trigger (default: 50)
 * @param {boolean} options.enabled - Whether detection is enabled (default: true)
 * @returns {Object} - { isOverflowing, ref, checkOverflow }
 */
export const useOverflowDetection = ({ threshold = 50, enabled = true } = {}) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const ref = useRef(null);

  const checkOverflow = () => {
    if (!ref.current || !enabled) {
      setIsOverflowing(false);
      return;
    }

    const element = ref.current;
    const isOverflow = element.scrollWidth > element.clientWidth + threshold;
    setIsOverflowing(isOverflow);
  };

  useEffect(() => {
    if (!enabled) {
      setIsOverflowing(false);
      return;
    }

    // Initial check
    checkOverflow();

    // Set up ResizeObserver to watch for size changes
    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });

    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    // Also listen for window resize events
    const handleResize = () => {
      checkOverflow();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled, threshold]);

  return {
    isOverflowing,
    ref,
    checkOverflow
  };
};

export default useOverflowDetection;
