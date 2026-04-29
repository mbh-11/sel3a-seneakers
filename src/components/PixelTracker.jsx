import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../pixelEvents';

const PixelTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // This will trigger on every location change (route change)
    trackPageView();
    
    // Clear test code if needed? No, let's keep it global if user set it
  }, [location.pathname, location.search]);

  return null; // This component doesn't render anything
};

export default PixelTracker;
