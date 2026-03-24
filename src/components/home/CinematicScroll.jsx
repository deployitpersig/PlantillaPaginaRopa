import { useEffect } from 'react';

const CinematicScroll = () => {
  useEffect(() => {
    // Crucial: Return early on ANY touch device or mobile screen to allow 
    // native, hardware-accelerated smooth scrolling.
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (window.innerWidth < 1024 || isTouchDevice) return;

    let isTweening = false;
    let touchStartY = 0;
    
    // Find targets
    const getTargetTop = (direction) => {
      const sections = Array.from(document.querySelectorAll('.section-snap'));
      const currentScroll = window.scrollY;
      
      if (direction > 0) {
        // Next section
        const target = sections.find(sec => sec.offsetTop > currentScroll + 50);
        return target ? target.offsetTop : null;
      } else {
        // Previous section
        const target = [...sections].reverse().find(sec => sec.offsetTop < currentScroll - 50);
        return target ? target.offsetTop : null;
      }
    };

    const smoothScrollTo = (targetY, duration = 1200) => {
      if (isTweening || targetY === null) return;
      isTweening = true;
      
      const startY = window.scrollY;
      const distance = targetY - startY;
      let startTime = null;

      // Cinematic easeInOutCubic
      const easeInOutCubic = t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

      const animation = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        window.scrollTo(0, startY + distance * easeInOutCubic(progress));

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        } else {
          isTweening = false;
        }
      };

      requestAnimationFrame(animation);
    };

    const handleWheel = (e) => {
      e.preventDefault();
      if (isTweening) return;
      smoothScrollTo(getTargetTop(e.deltaY > 0 ? 1 : -1));
    };

    const handleKeydown = (e) => {
      if (window.innerWidth < 768) return;
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '].includes(e.key)) {
        e.preventDefault();
        if (isTweening) return;
        const dir = ['ArrowDown', 'PageDown', ' '].includes(e.key) ? 1 : -1;
        smoothScrollTo(getTargetTop(dir));
      }
    };

    // We only register mouse wheel and keyboard. Touch events are
    // completely omitted because touch devices are handled by the native browser.
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeydown, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  return null;
};

export default CinematicScroll;
