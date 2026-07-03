import Link from 'next/link';
import styles from './style.module.css';
import { ReactNode } from 'react';

interface CreativeButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: (e: any) => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const CreativeButton = ({ children, href, onClick, className = '', type = 'button', disabled }: CreativeButtonProps) => {
  const content = (
    <>
      <span className={styles.textPrimary}>
        {children}
      </span>
      <div className={styles.overlay}>
        <span>{children}</span>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${styles.buttonWrapper} ${className} ${disabled ? styles.disabled : ''}`} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={`${styles.buttonWrapper} ${className} ${disabled ? styles.disabled : ''}`}
      disabled={disabled}
    >
      {content}
    </button>
  );
};

export default CreativeButton;
