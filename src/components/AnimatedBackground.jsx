import { useEffect, useState } from 'react';

function AnimatedBackground() {
  const [currentBg, setCurrentBg] = useState(1);
  const [nextBg, setNextBg] = useState(2);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Prepare next background
      const next = (currentBg % 4) + 1;
      setNextBg(next);
      
      // Trigger subtle glitch effect
      setIsGlitching(true);
      
      // Change background smoothly
      setTimeout(() => {
        setCurrentBg(next);
      }, 200);
      
      // End glitch effect
      setTimeout(() => {
        setIsGlitching(false);
      }, 400);
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, [currentBg]);

  return (
    <div className="animated-background">
      <div 
        className={`bg-layer ${currentBg === 1 ? 'active' : ''} ${isGlitching && currentBg === 1 ? 'glitch' : ''}`}
        style={{ backgroundImage: 'url(/back1.jpg)' }}
      />
      <div 
        className={`bg-layer ${currentBg === 2 ? 'active' : ''} ${isGlitching && currentBg === 2 ? 'glitch' : ''}`}
        style={{ backgroundImage: 'url(/back2.jpg)' }}
      />
      <div 
        className={`bg-layer ${currentBg === 3 ? 'active' : ''} ${isGlitching && currentBg === 3 ? 'glitch' : ''}`}
        style={{ backgroundImage: 'url(/back3.jpg)' }}
      />
      <div 
        className={`bg-layer ${currentBg === 4 ? 'active' : ''} ${isGlitching && currentBg === 4 ? 'glitch' : ''}`}
        style={{ backgroundImage: 'url(/back4.jpg)' }}
      />
      <div className="bg-overlay" />
    </div>
  );
}

export default AnimatedBackground;
