'use client';
import { navLinks } from '@/constants/cmsInfo';
import styles from './style.module.css';
import NavLink from '../NavLink';
import { motion } from 'framer-motion';
import { menuSlide } from './animation';
import SVGMask from '../ui/SVGMask';
import { useEffect, useState } from 'react';
import { supabasePublic } from '@/services/supabase';

const ADMIN_EMAIL = 'achbelneri@gmail.com';

interface Props {
  onClose?: () => void;
}

const NavBar: React.FC<Props> = ({ onClose }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabasePublic.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(session?.user?.email === ADMIN_EMAIL);
    });
  }, []);

  const visibleLinks = navLinks.filter(({ href }) => {
    if (href === '/sell') return isAdmin;
    return true;
  });

  return (
    <motion.section
      className={styles.menu}
      variants={menuSlide}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className={styles.body}>
        <nav className={styles.nav}>
          <header className={styles.header}>
            <p>Navigation</p>
          </header>
          {visibleLinks.map(({ title, href }, index) => (
            <div key={href} onClick={onClose}>
              <NavLink href={href} title={title} index={index} />
            </div>
          ))}
        </nav>
      </div>
      <SVGMask />
    </motion.section>
  );
};

export default NavBar;
