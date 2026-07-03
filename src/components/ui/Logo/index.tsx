import Link from 'next/link';
import styles from './style.module.css';
import MagneticEffect from '../MagneticEffect';
import Image from 'next/image';

const Logo = () => {
  return (
    <Link href="/" className={styles.logoWrapper}>
      <Image
        src="/images/logo-reuse.png"
        alt="Re-Use"
        width={360}
        height={100}
        className={styles.logoImage}
        priority
      />
    </Link>
  );
};

export default Logo;
