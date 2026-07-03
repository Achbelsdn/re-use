import Image from 'next/image';
import styles from './style.module.css';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { FooterArrow } from '@/components/ui/icons/Index';
import Link from 'next/link';
import CircleButton from '@/components/ui/CircleButton';

const FooterSection = ({ showCallToAction = false }: { showCallToAction?: boolean }) => {
  const [time, setTime] = useState('');

  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end end']
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const y = useTransform(scrollYProgress, [0, 1], !showCallToAction ? [0, 0] : [-500, 0]);
  const rotateArrow = useTransform(scrollYProgress, [0, 1], [120, 90]);

  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date();
      const currentTime =
        date.toLocaleString('es-es', { hour: '2-digit', minute: '2-digit' }) + ' CEST';
      setTime(currentTime);
    }, 1000);
    return function cleanup() {
      clearInterval(interval);
    };
  });

  return (
    <motion.section style={{ y }} ref={sectionRef} className={styles.footer}>
      <div className={styles.container}>
        
        {showCallToAction && (
          <>
            <div className={styles.title}>
              <span>
                <div className={styles.imageContainer}>
                  <Image fill={true} alt="image" src={`/images/hero-background.avif`} />
                </div>
                <h2>Construisons</h2>
              </span>
              <h2>ensemble</h2>
              <motion.div style={{ x }} className={styles.buttonContainer}>
                <Link href="/sell">
                  <CircleButton backgroundColor={'#334BD3'} className={styles.button}>
                    <p>Commencer à vendre</p>
                  </CircleButton>
                </Link>
              </motion.div>
              <FooterArrow rotate={rotateArrow} />
            </div>
            
            <div className={styles.nav}>
              <a href="#">
                <CircleButton>
                  <p>hello@re-use.market</p>
                </CircleButton>
              </a>
              <a href="#">
                <CircleButton>
                  <p>Rejoindre Discord</p>
                </CircleButton>
              </a>
            </div>
          </>
        )}

        <div className={styles.info}>
          <div>
            <span>
              <h3>Version</h3>
              <p>2026 Re-Use</p>
            </span>
            <span>
              <h3>Heure Locale</h3>
              <p>{time}</p>
            </span>
          </div>
          <div>
            <span>
              <h3>réseaux</h3>
              <a>
                <p>Product Hunt</p>
              </a>
            </span>
            <a>
              <p>Instagram</p>
            </a>
            <a>
                <p>GitHub</p>
            </a>
            <a>
              <p>Linkedin</p>
            </a>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default FooterSection;
