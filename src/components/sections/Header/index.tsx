'use client';
import { AnimatePresence } from 'framer-motion';
import HamburgerButton from '../../ui/HamburgerButton';
import styles from './style.module.css';
import NavBar from '../../Navbar';
import { useState, useEffect } from 'react';
import Nav from '@/components/ui/Nav';
import Logo from '@/components/ui/Logo';

const Header = () => {
  const [isActive, setIsActive] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <Logo />
        <Nav />
      </header>
      <HamburgerButton isActive={isActive} setIsActive={setIsActive} />
      <AnimatePresence>{isActive && <NavBar onClose={() => setIsActive(false)} />}</AnimatePresence>
    </>
  );
};

export default Header;
