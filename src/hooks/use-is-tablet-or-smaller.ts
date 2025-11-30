import { useEffect, useState } from 'react';

export default function useIsTabletOrSmaller() {
  const [isTabletOrSmaller, setIsTabletOrSmaller] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsTabletOrSmaller(window.innerWidth <= 768);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return isTabletOrSmaller;
}
