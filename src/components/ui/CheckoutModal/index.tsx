import React, { useState } from 'react';
import styles from './style.module.css';
import { X, Loader2, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CreativeButton from '../CreativeButton';

interface CheckoutModalProps {
  component: any;
  onClose: () => void;
  isLiked?: boolean;
  onLike?: (e: React.MouseEvent) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ component, onClose, isLiked, onLike }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showCheckout, setShowCheckout] = useState(component.startCheckout || false);

  const isVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(component.image_url || component.img);
  const mediaSrc = component.fromDB 
    ? component.image_url 
    : `/images/${component.img}`;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          componentId: component.id,
          email: email,
          returnUrl: window.location.origin + '/success'
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du paiement');
      }

      if (data.freeSuccess) {
        setSuccess(true);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Lien de paiement non reçu');
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <button className={styles.closeButtonMobile} onClick={onClose}>
          <X size={24} />
        </button>
        
        <motion.div 
          className={styles.modal}
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.leftPanel}>
            <div className={styles.componentInfo}>
              <h2 className={styles.title}>{component.title}</h2>
              <p className={styles.type}>{component.type}</p>
              
              {component.type !== 'Abonnement' && (
                <button 
                  className={`${styles.likes} ${isLiked ? styles.liked : ''}`}
                  onClick={onLike}
                >
                  <Heart size={16} fill={isLiked ? '#ec4899' : 'transparent'} color={isLiked ? '#ec4899' : 'currentColor'} /> 
                  {component.likes || 0} likes
                </button>
              )}
            </div>

            <div className={styles.actionArea}>
              {!showCheckout ? (
                <div style={{ width: '100%', display: 'flex' }}>
                  <CreativeButton 
                    className={styles.fullWidthBtn}
                    onClick={() => {
                      if (component.type === 'Abonnement' && (component.priceValue === 0 || component.price === 'Gratuit')) {
                        window.location.href = '/';
                      } else {
                        setShowCheckout(true);
                      }
                    }}
                  >
                    {component.priceValue === 0 || component.tag === 'Free' || component.price === 'Gratuit'
                      ? (component.type === 'Abonnement' ? 'S\'inscrire gratuitement' : 'Obtenir Gratuitement')
                      : (component.type === 'Abonnement' 
                          ? `Souscrire pour ${component.priceValue ? component.priceValue + ' FCFA/mois' : component.price}` 
                          : `Télécharger pour ${component.priceValue ? component.priceValue + ' FCFA' : component.price}`)}
                  </CreativeButton>
                </div>
              ) : success ? (
                <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                  <h3 style={{ color: 'white', marginBottom: '8px' }}>C'est parti !</h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                    Le lien de téléchargement a été envoyé à <strong>{email}</strong>. Vérifiez vos emails !
                  </p>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleCheckout}>
                  <div className={styles.inputGroup}>
                    <input 
                      type="email" 
                      placeholder="toi@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                    {error && <span className={styles.error}>{error}</span>}
                  </div>
                  <CreativeButton type="submit" className={styles.fullWidthBtn} disabled={loading || !email}>
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                      component.priceValue === 0 || component.tag === 'Free' || component.price === 'Gratuit' 
                        ? 'Envoyer le lien par email' 
                        : 'Payer avec FedaPay'
                    )}
                  </CreativeButton>
                </form>
              )}
            </div>
          </div>

          <div className={styles.rightPanel}>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={20} />
            </button>
            
            {isVideo ? (
              <video
                src={mediaSrc}
                autoPlay
                muted
                loop
                playsInline
                className={styles.mediaElement}
              />
            ) : (
              <img
                src={mediaSrc}
                alt={component.title}
                className={styles.mediaElement}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CheckoutModal;
