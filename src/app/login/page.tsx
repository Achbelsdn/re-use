'use client';
import sharedStyles from '../page-shared.module.css';
import styles from './login.module.css';
import FooterSection from '@/components/sections/FooterSection';
import { useEffect } from 'react';

export default function LoginPage() {
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
    <main className={sharedStyles.main}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Bon retour !</h1>
        <p className={styles.subtitle}>Connecte-toi à ton compte Re-Use pour gérer tes téléchargements et composants.</p>
        
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Adresse Email</label>
            <input type="email" id="email" placeholder="toi@exemple.com" />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">Mot de passe</label>
            <input type="password" id="password" placeholder="••••••••" />
          </div>
          
          <button type="submit" className={styles.submitBtn}>
            Se Connecter
          </button>
          
          <div className={styles.footer}>
            Pas encore de compte ? <a href="#">Créer un compte</a>
          </div>
        </form>
      </div>
      <FooterSection disableParallax={true} />
    </main>
  );
}
