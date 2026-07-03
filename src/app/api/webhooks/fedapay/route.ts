import { NextResponse } from 'next/server';
import { FedaPay, Transaction } from 'fedapay';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // Le nom de l'événement FedaPay
    const eventName = payload.name;
    
    // Seuls les paiements validés nous intéressent
    if (eventName !== 'transaction.approved') {
      return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
    }

    const entityId = payload.entity?.id;
    if (!entityId) {
      return NextResponse.json({ error: 'Missing entity ID' }, { status: 400 });
    }

    // Sécurité : On récupère la transaction directement depuis l'API FedaPay pour éviter les faux webhooks
    const secretKey = process.env.FEDAPAY_SECRET_KEY || '';
    FedaPay.setApiKey(secretKey);
    FedaPay.setEnvironment(secretKey.includes('sandbox') ? 'sandbox' : 'live');
    
    const transaction = await Transaction.retrieve(entityId);
    
    if (transaction.status !== 'approved') {
      return NextResponse.json({ error: 'Transaction not actually approved' }, { status: 400 });
    }

    const customMetadata = transaction.custom_metadata;
    if (!customMetadata || !customMetadata.filename || !customMetadata.buyer_email) {
      console.error('Missing custom metadata in transaction', transaction.id);
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    const { filename, buyer_email } = customMetadata;

    // 1. Génération de l'URL Signée via Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // URL valide pour 24 heures (86400 secondes)
    const { data, error } = await supabase.storage
      .from('components')
      .createSignedUrl(filename, 86400);
      
    if (error || !data?.signedUrl) {
      console.error('Erreur Supabase Storage:', error);
      return NextResponse.json({ error: 'Erreur lors de la génération du lien' }, { status: 500 });
    }

    // 2. Envoi de l'email via Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const resendResponse = await resend.emails.send({
      from: 're-use <contact@resend.achbelsodjinou.me>',
      to: [buyer_email],
      subject: '🎉 Votre composant Re-Use est prêt !',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #09090b; color: white; border-radius: 10px;">
          <h2 style="color: #8b5cf6;">Merci pour votre achat !</h2>
          <p style="color: #e5e5e5; font-size: 16px;">Votre paiement a été validé avec succès. Vous pouvez maintenant télécharger votre composant/template.</p>
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

    if (resendResponse.error) {
      console.error('Erreur Resend Webhook:', resendResponse.error);
      return NextResponse.json({ error: `Erreur email: ${resendResponse.error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Fichier envoyé' }, { status: 200 });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
  }
}
