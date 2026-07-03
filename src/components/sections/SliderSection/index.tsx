
import styles from './style.module.css';
import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const fallbackColors = ["#e3e5e7", "#d6d7dc", "#e3e3e3", "#21242b", "#8b5cf6", "#ec4899"];

const SliderSection = () => {
  const sectionRef = useRef(null);
  const [dbComponents, setDbComponents] = useState<any[]>([]);

  useEffect(() => {
    const fetchFromDB = async () => {
      try {
        const res = await fetch('/api/admin/components?t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          if (data.components && data.components.length > 0) {
            setDbComponents(data.components);
          }
        }
      } catch (err) {
        console.error('Erreur chargement composants DB:', err);
      }
    };
    fetchFromDB();
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });
  
  const x1 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const x2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const overlayHeight = useTransform(scrollYProgress, [0, 0.9], [50, 0]);

  // Use ONLY DB components
  const items = dbComponents.map((c, i) => ({
        color: fallbackColors[i % fallbackColors.length],
        src: c.image_url,
        isUrl: true
      }));

  // Duplicate items if we have very few to keep the slider looking full
  const displayItems = items.length > 0 && items.length < 8 ? [...items, ...items, ...items] : items;
  
  const half = Math.ceil(displayItems.length / 2);
  const row1 = displayItems.slice(0, half);
  const row2 = displayItems.slice(half);

  return (
    <section ref={sectionRef} className={styles.sliderSection}>
      <motion.div style={{ x: x1 }} className={styles.slider}>
        {row1.map(({ color, src }, index) => (
          <div className={styles.project} key={`r1-${index}`} style={{ backgroundColor: color }}>
            <div className={styles.imageContainer}>
              {src ? (
                /\.(mp4|webm|ogg|mov)(\?|$)/i.test(src) ? (
                  <video
                    src={src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <img src={src} alt="slider item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )
              ) : (
                 <div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Pas d'image</div>
              )}
            </div>
          </div>
        ))}
      </motion.div>
      <motion.div style={{ x: x2 }} className={styles.slider}>
        {row2.map(({ color, src }, index) => (
          <div className={styles.project} key={`r2-${index}`} style={{ backgroundColor: color }}>
            <div className={styles.imageContainer}>
              {src ? (
                /\.(mp4|webm|ogg|mov)(\?|$)/i.test(src) ? (
                  <video
                    src={src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <img src={src} alt="slider item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )
              ) : (
                 <div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Pas d'image</div>
              )}
            </div>
          </div>
        ))}
      </motion.div>
      <motion.div style={{ height: overlayHeight }} className={styles.overlayContainer}>
        <div className={styles.overlay}></div>
      </motion.div>
    </section>
  );
};

export default SliderSection;
