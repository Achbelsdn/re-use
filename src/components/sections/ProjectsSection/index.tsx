import { useState, useEffect } from 'react';
import styles from './style.module.css';
import Image from 'next/image';
import { motion } from 'framer-motion';
import CheckoutModal from '@/components/ui/CheckoutModal';

interface DBComponent {
  id: string;
  title: string;
  description: string;
  price_label: string;
  price_value: number;
  type: string;
  tag: string;
  image_url: string;
  filename: string;
  likes: number;
}

const ProjectsSection = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [pricingFilter, setPricingFilter] = useState('All');
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [dbComponents, setDbComponents] = useState<DBComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // Load liked components from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('likedComponents') || '[]');
      setLikedIds(new Set(saved));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Charger les composants depuis Supabase au montage
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
      setLoading(false);
    };
    fetchFromDB();
  }, []);

  // Normaliser les données pour l'affichage
  const allComponents = dbComponents.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        img: '', // pas utilisé pour les composants DB
        image_url: c.image_url,
        tag: c.tag,
        type: c.type,
        likes: c.likes,
        price: c.price_label,
        priceValue: c.price_value,
        filename: c.filename,
        fromDB: true
      }));

  const filters = ['All', 'Section', 'Background', 'Template'];

  const filtered = allComponents.filter(c => {
    const matchType = activeFilter === 'All' || c.type === activeFilter;
    const matchPrice = pricingFilter === 'All' || c.tag === pricingFilter;
    return matchType && matchPrice;
  });

  const handlePricingClick = () => {
    if (pricingFilter === 'All') setPricingFilter('Pro');
    else if (pricingFilter === 'Pro') setPricingFilter('Gratuit');
    else setPricingFilter('All');
  };

  const getPricingLabel = () => {
    if (pricingFilter === 'All') return 'Prix : Tous ▾';
    if (pricingFilter === 'Pro') return 'Prix : Pro ▾';
    return 'Prix : Gratuit ▾';
  };

  const handleLike = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const isLiked = likedIds.has(id);
    const action = isLiked ? 'unlike' : 'like';

    // Optimistic update
    setDbComponents(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, likes: Math.max(0, (c.likes || 0) + (isLiked ? -1 : 1)) };
      }
      return c;
    }));
    
    // Save to local storage
    const newLiked = new Set(likedIds);
    if (isLiked) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedIds(newLiked);
    localStorage.setItem('likedComponents', JSON.stringify(Array.from(newLiked)));

    // API Call
    try {
      await fetch(`/api/components/${id}/like`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
    } catch (err) {
      console.error('Failed to save like to DB', err);
    }
  };

  return (
    <section className={styles.projects}>
      <div className={styles.filterBar}>
        <div className={styles.filterLeft}>
          <button 
            className={`${styles.filterChip} ${pricingFilter !== 'All' ? styles.filterActive : ''}`} 
            onClick={handlePricingClick}
          >
            {getPricingLabel()}
          </button>
        </div>
        <div className={styles.filterRight}>
          {filters.map(f => (
            <button
              key={f}
              className={`${styles.filterChip} ${activeFilter === f ? styles.filterActive : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.grid}>
        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0' }}>
            Chargement des composants...
          </p>
        ) : filtered.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0' }}>
            Aucun composant ne correspond aux filtres.
          </p>
        ) : (
          filtered.map((comp, index) => (
            <motion.div
              key={comp.id}
              className={styles.card}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => {
                setSelectedComponent(comp);
              }}
            >
              <div className={styles.cardImage}>
                {comp.image_url ? (
                  /\.(mp4|webm|ogg|mov)(\?|$)/i.test(comp.image_url) ? (
                    <video
                      src={comp.image_url}
                      autoPlay
                      muted
                      loop
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
                    />
                  ) : (
                    <img
                      src={comp.image_url}
                      alt={comp.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
                    />
                  )
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#222', position: 'absolute', top: 0, left: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '0.8rem' }}>
                    Aucun média
                  </div>
                )}
                {comp.tag === 'Pro' && (
                  <span className={styles.cardTag}>PRO</span>
                )}
                <button 
                  className={`${styles.cardLikes} ${likedIds.has(comp.id) ? styles.cardLiked : ''}`}
                  onClick={(e) => handleLike(e, comp.id)}
                >
                  {comp.likes || 0} {likedIds.has(comp.id) ? '♥' : '♡'}
                </button>
              </div>
              <div className={styles.cardInfo}>
                <h3 className={styles.cardTitle}>{comp.title}</h3>
                <p className={styles.cardDesc}>{comp.description}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.cardPrice}>{comp.price}</span>
                  <span className={styles.cardType}>{comp.type}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
      {selectedComponent && (
        <CheckoutModal 
          component={selectedComponent} 
          onClose={() => setSelectedComponent(null)} 
          isLiked={likedIds.has(selectedComponent.id)}
          onLike={(e) => {
            handleLike(e, selectedComponent.id);
            const isCurrentlyLiked = likedIds.has(selectedComponent.id);
            setSelectedComponent({ 
              ...selectedComponent, 
              likes: Math.max(0, (selectedComponent.likes || 0) + (isCurrentlyLiked ? -1 : 1)) 
            });
          }}
        />
      )}
    </section>
  );
};

export default ProjectsSection;
