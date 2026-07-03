'use client';
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import { createLocomotive } from '@/services/locomotive';
import HeroSection from '@/components/sections/Hero';
import ProjectsSection from '@/components/sections/ProjectsSection';
import FooterSection from '@/components/sections/FooterSection';
import Preloader from '@/components/ui/Preloader';
import { AnimatePresence } from 'framer-motion';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let locomotive: any;
    const init = async () => {
      locomotive = await createLocomotive();
    };
    init();

    setTimeout(() => {
      setIsLoading(false);
      window.scrollTo(0, 0); // Scroll to start
    }, 2000);

    return () => {
      if (locomotive) locomotive.destroy();
    };
  }, []);

  return (
    <main className={styles.main}>
      <AnimatePresence mode="wait">{isLoading && <Preloader />}</AnimatePresence>
      <HeroSection />
      <ProjectsSection />
      <FooterSection />
    </main>
  );
}
