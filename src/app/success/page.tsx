'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const transactionId = searchParams.get('id');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!transactionId) {
      setStatus('error');
      setErrorMsg('Aucune transaction trouvée.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/verify-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId })
        });
        const data = await res.json();
        
        if (res.ok && data.url) {
          setDownloadUrl(data.url);
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMsg(data.error || 'Erreur de vérification. Le paiement a peut-être échoué.');
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMsg('Erreur de réseau. Veuillez vérifier votre connexion.');
      }
    };
    
    verify();
  }, [transactionId]);

  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0 && downloadUrl) {
      // Lancer le téléchargement
      window.location.href = downloadUrl;
      // Rediriger vers l'accueil après un petit délai
      setTimeout(() => {
        router.push('/');
      }, 1500);
    }
  }, [status, countdown, downloadUrl, router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#09090b', color: 'white', padding: '20px' }}>
      <div style={{ background: '#121214', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '40px', maxWidth: '500px', width: '100%', textAlign: 'center', fontFamily: 'inherit' }}>
        
        {status === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto 20px', color: '#8b5cf6' }} />
            <h1 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Vérification du paiement...</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Veuillez patienter quelques instants.</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CheckCircle size={56} style={{ margin: '0 auto 20px', color: '#22c55e' }} />
            <h1 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Paiement réussi !</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px', lineHeight: 1.5 }}>
              Le lien de téléchargement a également été envoyé par mail.<br/><br/>
              Vous allez être redirigé vers le téléchargement dans...
            </p>
            <div style={{ fontSize: '4rem', fontWeight: 900, color: '#8b5cf6', marginBottom: '30px' }}>
              {countdown}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
              Si la redirection ne fonctionne pas, <a href={downloadUrl} style={{ color: '#ec4899', textDecoration: 'underline' }}>cliquez ici</a>.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>❌</div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#ef4444' }}>Oups...</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '30px' }}>{errorMsg}</p>
            <Link href="/">
              <button style={{ background: 'white', color: 'black', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
                Retour à l'accueil
              </button>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
