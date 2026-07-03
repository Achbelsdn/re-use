import { NextResponse } from 'next/server';
import { FedaPay, Transaction } from 'fedapay';
import { supabaseAdmin } from '@/services/supabase';
import { Resend } from 'resend';

// Cache memory to avoid resending the email if user refreshes the page
const sentEmailsCache = new Set<string>();

export async function POST(req: Request) {
  try {
    const { transactionId } = await req.json();

    if (!transactionId) {
      return NextResponse.json({ error: 'ID de transaction manquant' }, { status: 400 });
    }

    const secretKey = process.env.FEDAPAY_SECRET_KEY || '';
    FedaPay.setApiKey(secretKey);
    FedaPay.setEnvironment(secretKey.includes('sandbox') ? 'sandbox' : 'live');
    
    // Retrieve transaction from FedaPay
    const transaction = await Transaction.retrieve(transactionId);
    
    if (transaction.status !== 'approved') {
      return NextResponse.json({ error: 'La transaction n\'est pas encore approuvée.' }, { status: 400 });
    }

    const customMetadata = transaction.custom_metadata;
    if (!customMetadata || !customMetadata.filename) {
      return NextResponse.json({ error: 'Fichier associé introuvable.' }, { status: 400 });
    }

    // Generate signed URL
    const { data, error } = await supabaseAdmin.storage
      .from('components')
      .createSignedUrl(customMetadata.filename, 86400); // 24 hours
      
    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: 'Erreur lors de la génération du lien de téléchargement.' }, { status: 500 });
    }

    // Envoi de l'email via Resend
    if (customMetadata.buyer_email && !sentEmailsCache.has(transactionId)) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: [customMetadata.buyer_email],
          subject: '🎉 Votre composant Re-Use est prêt !',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #09090b; color: white; border-radius: 10px;">
              <h2 style="color: #8b5cf6;">Merci pour votre achat !</h2>
              <p style="color: #e5e5e5; font-size: 16px;">Votre paiement a été validé avec succès. Voici votre lien de téléchargement.</p>
              <br/>
              <div style="text-align: center;">
                <a href="${data.signedUrl}" style="background: linear-gradient(135deg, #f0c27f 0%, #ec4899 50%, #8b5cf6 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Télécharger mon composant (ZIP)
                </a>
              </div>
              <br/>
              <p style="color: #a3a3a3; font-size: 14px;"><em>Ce lien expirera dans 24 heures. Veillez à télécharger et sauvegarder vos fichiers.</em></p>
            </div>
          `,
        });
        sentEmailsCache.add(transactionId);
      } catch (emailErr) {
        console.error('Erreur lors de l envoi de l email:', emailErr);
        // We do not fail the request if the email fails, the user can still download from the frontend
      }
    }

    return NextResponse.json({ url: data.signedUrl });
  } catch (error: any) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Erreur de vérification interne.' }, { status: 500 });
  }
}
