'use client';
import sharedStyles from '../page-shared.module.css';
import styles from './pricing.module.css';
import FooterSection from '@/components/sections/FooterSection';
import { useEffect } from 'react';
import { Check } from 'lucide-react';
import CreativeButton from '@/components/ui/CreativeButton';

export default function PricingPage() {
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
      <h1 className={sharedStyles.title}>Tarifs Simples</h1>
      <p className={sharedStyles.subtitle}>
        Accède à l'ensemble des composants et templates UI/UX premium. Commence à créer de magnifiques landing pages dès aujourd'hui.
      </p>

      <div className={styles.pricingContainer}>
        {/* Free Plan */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Basique</h3>
          <div className={styles.price}>
            <span className={styles.currency}>$</span>
            <span className={styles.amount}>0</span>
            <span className={styles.period}>/mois</span>
          </div>
          <p className={styles.desc}>Idéal pour essayer nos composants gratuits.</p>
          
          <div className={styles.btnWrapper}>
            <CreativeButton className={styles.fullWidthBtn}>Commencer</CreativeButton>
          </div>
          
          <ul className={styles.features}>
            <li><Check className={styles.icon} size={18} /> Accès aux templates gratuits</li>
            <li><Check className={styles.icon} size={18} /> Support communautaire</li>
            <li className={styles.disabled}><Check className={styles.iconDisabled} size={18} /> Composants Premium</li>
            <li className={styles.disabled}><Check className={styles.iconDisabled} size={18} /> Licence commerciale</li>
          </ul>
        </div>

        {/* Pro Plan */}
        <div className={`${styles.card} ${styles.cardPro}`}>
          <div className={styles.badge}>LE PLUS POPULAIRE</div>
          <h3 className={`${styles.cardTitle} ${styles.textGradient}`}>Illimité</h3>
          <div className={styles.price}>
            <span className={styles.currency}>$</span>
            <span className={styles.amount}>29</span>
            <span className={styles.period}>/mois</span>
          </div>
          <p className={styles.desc}>Accès illimité à tous les composants et templates premium.</p>
          
          <div className={styles.btnWrapper}>
            <CreativeButton className={styles.fullWidthBtn}>Accès Illimité</CreativeButton>
          </div>
          
          <ul className={styles.features}>
            <li><Check className={styles.icon} size={18} /> Accès à TOUS les templates</li>
            <li><Check className={styles.icon} size={18} /> Composants Premium</li>
            <li><Check className={styles.icon} size={18} /> Licence commerciale</li>
            <li><Check className={styles.icon} size={18} /> Support prioritaire</li>
            <li><Check className={styles.icon} size={18} /> Nouveautés chaque semaine</li>
          </ul>
        </div>
      </div>

      <FooterSection />
    </main>
  );
}
