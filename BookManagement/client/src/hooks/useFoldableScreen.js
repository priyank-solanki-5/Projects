import { useState, useEffect } from 'react';

/**
 * Custom hook to detect foldable screen orientations and screen states
 * Specifically designed for ASUS ZenBook Fold and similar devices
 */
export const useFoldableScreen = () => {
  const [screenState, setScreenState] = useState({
    isFolded: false,
    isPortrait: false,
    isLandscape: false,
    isUltraWide: false,
    orientation: 'unknown',
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight
  });

  useEffect(() => {
    const updateScreenState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      
      const newState = {
        isFolded: width <= 1024 && aspectRatio < 1.2,
        isPortrait: height > width,
        isLandscape: width > height,
        isUltraWide: width >= 1920,
        orientation: height > width ? 'portrait' : 'landscape',
        screenWidth: width,
        screenHeight: height
      };
      
      setScreenState(newState);
    };

    // Initial check
    updateScreenState();

    // Listen for resize events
    window.addEventListener('resize', updateScreenState);
    
    // Listen for orientation changes (if supported)
    if (screen.orientation) {
      screen.orientation.addEventListener('change', updateScreenState);
    }

    return () => {
      window.removeEventListener('resize', updateScreenState);
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', updateScreenState);
      }
    };
  }, []);

  return screenState;
};

export default useFoldableScreen;
