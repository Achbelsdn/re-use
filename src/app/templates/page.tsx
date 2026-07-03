'use client';
import styles from '../page-shared.module.css';
import ProjectsSection from '@/components/sections/ProjectsSection';
import FooterSection from '@/components/sections/FooterSection';
import { useEffect } from 'react';

export default function TemplatesPage() {
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
      <h1 className={styles.title}>Explorer les Templates</h1>
      <p className={styles.subtitle}>
        Découvre notre collection de composants et templates UI/UX Premium prêts à l'emploi.
      </p>
      <ProjectsSection />
      <FooterSection disableParallax={true} />
    </main>
  );
}
