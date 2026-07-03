import { useLayoutEffect, useRef } from 'react';
import styles from './style.module.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import CircleButton from '../CircleButton';

interface Props {
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
}

const HamburgerButton: React.FC<Props> = ({ isActive, setIsActive }) => {
  const hamburgerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Sur mobile, on n'applique pas GSAP (il écraserait le CSS avec scale:0)
    const isMobile = window.innerWidth < 1024;
    if (isMobile) return;

    gsap.registerPlugin(ScrollTrigger);
    gsap.to(hamburgerRef.current, {
      scrollTrigger: {
        trigger: document.documentElement,
        start: 0,
        end: '+=300px',
        onLeave: () => {
          gsap.to(hamburgerRef.current, { scale: 1, duration: 0.25, ease: 'power1.out' });
        },
        onEnterBack: () => {
          gsap.to(hamburgerRef.current, { scale: 0, duration: 0.25, ease: 'power1.out' });
        }
      }
    });
  }, []);

  return (
    <div className={styles.buttonWrapper} ref={hamburgerRef}>
      <CircleButton
        className={styles.button}
        onClick={() => {
          setIsActive(!isActive);
        }}
      >
        <div className={`${styles.hamburger} ${isActive ? styles.hamburgerActive : ''}`}></div>
      </CircleButton>
    </div>
  );
};

export default HamburgerButton;
