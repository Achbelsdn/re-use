'use client';
import { useState, useEffect } from 'react';
import { supabasePublic } from '@/services/supabase';

interface Component {
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
  created_at: string;
  is_hidden: boolean;
}

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [sessionToken, setSessionToken] = useState('');
  const [authError, setAuthError] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceLabel, setPriceLabel] = useState('Gratuit');
  const [priceValue, setPriceValue] = useState(0);
  const [type, setType] = useState('Template');
  const [tag, setTag] = useState('Gratuit');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Existing components
  const [components, setComponents] = useState<Component[]>([]);
  const [loadingComponents, setLoadingComponents] = useState(false);

  useEffect(() => {
    // Check active session on mount
    supabasePublic.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    const { data: { subscription } } = supabasePublic.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSession = (session: any) => {
    if (session?.user?.email === 'achbelneri@gmail.com') {
      setIsAuthed(true);
      setSessionToken(session.access_token);
      fetchComponents();
    } else if (session?.user) {
      setAuthError("Accès refusé. Cette adresse email n'est pas autorisée.");
      supabasePublic.auth.signOut();
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    const { error } = await supabasePublic.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/admin'
      }
    });
    if (error) {
      setAuthError(error.message);
    }
  };

  const fetchComponents = async () => {
    setLoadingComponents(true);
    try {
      const res = await fetch('/api/admin/components?admin=true&t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        setComponents(data.components || []);
      }
    } catch (err) {
      console.error('Erreur chargement composants:', err);
    }
    setLoadingComponents(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('priceLabel', priceLabel);
      formData.append('priceValue', priceValue.toString());
      formData.append('type', type);
      formData.append('tag', tag);
      if (imageFile) formData.append('image', imageFile);
      if (zipFile) formData.append('zipFile', zipFile);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }

      setSuccessMsg(`"${title}" a été ajouté avec succes !`);
      // Reset form
      setTitle('');
      setDescription('');
      setPriceLabel('Gratuit');
      setPriceValue(0);
      setType('Template');
      setTag('Gratuit');
      setImageFile(null);
      setZipFile(null);
      fetchComponents();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
    setUploading(false);
  };

  const handleTogglePricing = async (c: Component) => {
    let newTag = '';
    let newPriceLabel = '';
    let newPriceValue = 0;

    if (c.tag === 'Gratuit') {
      const pLabel = prompt("Prix affiché pour le rendre Pro (ex: $49) ?");
      if (!pLabel) return;
      const pValue = prompt("Prix en FCFA (ex: 30000) ?");
      if (!pValue || isNaN(parseInt(pValue))) return;
      
      newTag = 'Pro';
      newPriceLabel = pLabel;
      newPriceValue = parseInt(pValue);
    } else {
      if (!confirm(`Es-tu sûr de vouloir rendre "${c.title}" gratuit ?`)) return;
      newTag = 'Gratuit';
      newPriceLabel = 'Gratuit';
      newPriceValue = 0;
    }

    try {
      const res = await fetch(`/api/admin/components/${c.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          tag: newTag,
          price_label: newPriceLabel,
          price_value: newPriceValue
        })
      });
      if (res.ok) {
        fetchComponents();
      } else {
        const data = await res.json();
        alert('Erreur: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleVisibility = async (id: string, currentHidden: boolean) => {
    try {
      const res = await fetch(`/api/admin/components/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ is_hidden: !currentHidden })
      });
      if (res.ok) {
        fetchComponents();
      } else {
        const data = await res.json();
        alert('Erreur: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Es-tu sûr de vouloir supprimer définitivement "${title}" ?`)) return;
    try {
      const res = await fetch(`/api/admin/components/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      if (res.ok) {
        fetchComponents();
      } else {
        const data = await res.json();
        alert('Erreur: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // LOGIN SCREEN
  if (!isAuthed) {
    return (
      <div style={loginPageStyle}>
        <div style={loginBoxStyle}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'white' }}>Re-Use Admin</h1>

          <button onClick={handleGoogleLogin} style={{...btnPrimaryStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'white', color: 'black'}}>
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </button>
          {authError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '15px', textAlign: 'center' }}>{authError}</p>}
        </div>
      </div>
    );
  }

  // DASHBOARD
  return (
    <div style={dashboardStyle}>
      <main style={mainStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '1.6rem', color: 'white' }}>Ajouter un nouveau composant</h1>
          <button onClick={() => supabasePublic.auth.signOut()} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Déconnexion</button>
        </div>

        {successMsg && <div style={successBoxStyle}>{successMsg}</div>}
        {errorMsg && <div style={errorBoxStyle}>{errorMsg}</div>}

        <form onSubmit={handleUpload} style={formStyle}>
          <div style={formGridStyle}>
            {/* Title */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Titre</label>
              <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: SaaS Landing Kit" required />
            </div>

            {/* Description */}
            <div style={{...fieldStyle, gridColumn: '1 / -1'}}>
              <label style={labelStyle}>Description</label>
              <textarea style={{...inputStyle, minHeight: '80px', resize: 'vertical'}} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description courte du composant" required />
            </div>

            {/* Tag */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Tag (Gratuit ou Pro)</label>
              <select style={inputStyle} value={tag} onChange={(e) => {
                setTag(e.target.value);
                if (e.target.value === 'Gratuit') {
                  setPriceLabel('Gratuit');
                  setPriceValue(0);
                }
              }}>
                <option value="Gratuit">Gratuit</option>
                <option value="Pro">Pro</option>
              </select>
            </div>

            {/* Type */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Type</label>
              <select style={inputStyle} value={type} onChange={(e) => setType(e.target.value)}>
                <option value="Template">Template</option>
                <option value="Section">Section</option>
                <option value="Background">Background</option>
              </select>
            </div>

            {/* Prix Label */}
            {tag === 'Pro' && (
              <>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Prix affiché (ex: $49)</label>
                  <input style={inputStyle} value={priceLabel} onChange={(e) => setPriceLabel(e.target.value)} placeholder="$49" />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Prix en FCFA</label>
                  <input style={inputStyle} type="number" value={priceValue} onChange={(e) => setPriceValue(parseInt(e.target.value) || 0)} placeholder="30000" />
                </div>
              </>
            )}

            {/* Image */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Image ou Vidéo de couverture</label>
              <input style={inputStyle} type="file" accept="image/*,video/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </div>

            {/* ZIP */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Fichier ZIP du composant</label>
              <input style={inputStyle} type="file" accept=".zip,.rar,.7z" onChange={(e) => setZipFile(e.target.files?.[0] || null)} />
            </div>
          </div>

          <button type="submit" style={{...btnPrimaryStyle, marginTop: '20px', width: '100%'}} disabled={uploading}>
            {uploading ? 'Publication en cours...' : 'Publier le composant'}
          </button>
        </form>

        {/* LISTE DES COMPOSANTS */}
        <h2 style={{ fontSize: '1.3rem', marginTop: '50px', marginBottom: '20px', color: 'white' }}>
          Composants publiés ({components.length})
        </h2>
        {loadingComponents ? (
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Chargement...</p>
        ) : components.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Aucun composant pour le moment. Publie ton premier !</p>
        ) : (
          <div style={componentListStyle}>
            {components.map((c) => (
              <div key={c.id} style={{...componentCardStyle, opacity: c.is_hidden ? 0.5 : 1}}>
                {c.image_url && (
                  <div style={{ width: '80px', height: '50px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.05)' }}>
                    {/\.(mp4|webm|ogg|mov)(\?|$)/i.test(c.image_url) ? (
                      <video src={c.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src={c.image_url} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '3px' }}>{c.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{c.type} - {c.tag}</p>
                </div>
                <span style={{ color: '#8b5cf6', fontWeight: 700, fontSize: '0.95rem', marginRight: '15px' }}>{c.price_label}</span>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleTogglePricing(c)} style={{ background: 'rgba(59,130,246,0.2)', color: '#3b82f6', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    {c.tag === 'Gratuit' ? '💰 Rendre Pro' : '🎁 Rendre Gratuit'}
                  </button>
                  <button onClick={() => handleToggleVisibility(c.id, c.is_hidden)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    {c.is_hidden ? '👁️ Afficher' : '👁️‍🗨️ Masquer'}
                  </button>
                  <button onClick={() => handleDelete(c.id, c.title)} style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* === STYLES === */
const loginPageStyle: React.CSSProperties = {
  height: '100vh', overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: '#09090b', padding: '20px'
};
const loginBoxStyle: React.CSSProperties = {
  background: '#121214', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
  padding: '40px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column'
};
const dashboardStyle: React.CSSProperties = {
  height: '100vh', overflowY: 'auto', display: 'flex', background: '#09090b', color: 'white'
};
const mainStyle: React.CSSProperties = {
  flex: 1, padding: '30px 20px', maxWidth: '900px', margin: '0 auto'
};
const formStyle: React.CSSProperties = {
  background: '#121214', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '30px'
};
const formGridStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'
};
const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle: React.CSSProperties = { color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 500 };
const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  padding: '12px 14px', borderRadius: '10px', color: 'white', fontSize: '0.95rem', fontFamily: 'inherit',
  outline: 'none', width: '100%'
};
const btnPrimaryStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', color: 'white', border: 'none',
  padding: '14px', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginTop: '16px'
};
const successBoxStyle: React.CSSProperties = {
  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', padding: '14px',
  borderRadius: '12px', color: '#22c55e', marginBottom: '20px', fontSize: '0.9rem'
};
const errorBoxStyle: React.CSSProperties = {
  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '14px',
  borderRadius: '12px', color: '#ef4444', marginBottom: '20px', fontSize: '0.9rem'
};
const componentListStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '10px'
};
const componentCardStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '15px', padding: '15px',
  background: '#121214', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px'
};
