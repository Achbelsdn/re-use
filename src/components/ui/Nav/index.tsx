'use client';
import { navLinks } from '@/constants/cmsInfo';
import styles from './style.module.css';
import CreativeButton from '../CreativeButton';
import { useEffect, useState } from 'react';
import { supabasePublic } from '@/services/supabase';

const ADMIN_EMAIL = 'achbelneri@gmail.com';

const Nav = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabasePublic.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      }
    });

    const { data: { subscription } } = supabasePublic.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(session?.user?.email === ADMIN_EMAIL);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Filtrer les liens selon le statut admin
  const visibleLinks = navLinks.slice(1).filter(({ href }) => {
    if (href === '/sell') return isAdmin;
    return true;
  });

  return (
    <ul className={styles.nav}>
      {visibleLinks.map(({ title, href }, index) => (
        <li className={styles.el} key={index}>
          <CreativeButton href={href}>{title}</CreativeButton>
        </li>
      ))}
      <li className={styles.el}>
        <CreativeButton href="/pricing">
          Accès Illimité
        </CreativeButton>
      </li>
    </ul>
  );
};

export default Nav;
