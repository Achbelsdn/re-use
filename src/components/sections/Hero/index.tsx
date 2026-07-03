import styles from './style.module.css';
import { motion } from 'framer-motion';
import { slideUp } from './animation';
import Link from 'next/link';
import CircleButton from '@/components/ui/CircleButton';
import dynamic from 'next/dynamic';

const Beams = dynamic(() => import('@/components/ui/Beams'), { ssr: false });

const HeroSection = () => {
  return (
    <motion.section variants={slideUp} initial="initial" animate="animate" className={styles.hero}>
      <div className={styles.beamsBackground}>
        <Beams
          beamWidth={2}
          beamHeight={15}
          beamNumber={12}
          lightColor="#8b5cf6"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={0}
        />
      </div>
      <div className={styles.heroContent}>

        <div className={styles.banner}>
          <span className={styles.bannerDot}></span>
          De nouveaux composants sont ajoutés chaque jour
        </div>

        <h1 className={styles.heroTitle}>
          LIBÈRE TES<br />
          <span className={styles.heroItalic}>superpouvoirs</span>{' '}
          <span className={styles.heroGradient}>DE DESIGN</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Crée de magnifiques landing pages en quelques minutes avec nos composants prêts à l'emploi. Copie, colle et mets en ligne.
        </p>
        <Link href="/pricing">
          <CircleButton backgroundColor="#8b5cf6">
            <p>Accès Illimité →</p>
          </CircleButton>
        </Link>
      </div>
    </motion.section>
  );
};

export default HeroSection;
