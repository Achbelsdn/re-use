import { navLinks } from '@/constants/cmsInfo';
import styles from './style.module.css';
import CreativeButton from '../CreativeButton';

const Nav = () => {
  return (
    <ul className={styles.nav}>
      {navLinks.slice(1).map(({ title, href }, index) => (
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
