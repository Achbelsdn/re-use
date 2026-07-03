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
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>En cours de développement...</p>
      </div>
      <ProjectsSection />
      <FooterSection />
    </main>
  );
}
