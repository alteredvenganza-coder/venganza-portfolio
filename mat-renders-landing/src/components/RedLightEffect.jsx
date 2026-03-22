import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function RedLightEffect() {
  const lightRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, yoyo: true });
      tl.to(lightRef.current, {
        x: '20vw',
        y: '-10vh',
        opacity: 0.35,
        duration: 8,
        ease: 'sine.inOut',
      })
      .to(lightRef.current, {
        x: '-15vw',
        y: '15vh',
        opacity: 0.2,
        duration: 10,
        ease: 'sine.inOut',
      })
      .to(lightRef.current, {
        x: '10vw',
        y: '5vh',
        opacity: 0.3,
        duration: 7,
        ease: 'sine.inOut',
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={lightRef}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full pointer-events-none"
      style={{
        background: 'radial-gradient(circle, rgba(204,88,51,0.25) 0%, rgba(204,88,51,0.08) 40%, transparent 70%)',
        filter: 'blur(80px)',
      }}
    />
  );
}
