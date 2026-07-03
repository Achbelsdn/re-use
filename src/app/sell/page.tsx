'use client';
import styles from '../page-shared.module.css';
import AboutSection from '@/components/sections/AboutSection';
import SliderSection from '@/components/sections/SliderSection';
import FooterSection from '@/components/sections/FooterSection';
import { useEffect } from 'react';

export default function SellPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    let locomotive: any;
    const init = async () => {
      const { createLocomotive } = await import('@/services/locomotive');
      locomotive = await createLocomotive();
    };
    init();
    return () => {
      if (locomotive) locomotive.destroy();
    };
  }, []);

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Rejoins les Créateurs</h1>
      <p className={styles.subtitle}>
        Transforme tes compétences en design en revenus passifs. Mets en ligne tes meilleurs composants et templates dès aujourd'hui.
      </p>
      <AboutSection />
      <SliderSection />
      <FooterSection showCallToAction={true} />
    </main>
  );
}
