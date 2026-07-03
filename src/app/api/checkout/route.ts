import { NextResponse } from 'next/server';
import { FedaPay, Transaction } from 'fedapay';
import { supabaseAdmin } from '@/services/supabase';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { componentId, email, returnUrl } = body;

    if (!componentId || !email) {
      return NextResponse.json({ error: 'Email et ID du composant requis' }, { status: 400 });
    }

    // Essayer de récupérer le composant depuis la DB d'abord
    let component: any = null;
    
    const { data: dbComponent } = await supabaseAdmin
      .from('components')
      .select('*')
      .eq('id', componentId)
      .single();
    
    if (dbComponent) {
      component = {
        id: dbComponent.id,
        title: dbComponent.title,
        priceValue: dbComponent.price_value,
        filename: dbComponent.filename
      };
    }

    if (!component) {
      return NextResponse.json({ error: 'Composant introuvable' }, { status: 404 });
    }
    if (component.priceValue === 0) {
      if (!component.filename) {
        return NextResponse.json({ error: 'Ce composant de démonstration n\'a pas de fichier associé' }, { status: 400 });
      }
      
      const { data: urlData, error: urlError } = await supabaseAdmin.storage
        .from('components')
        .createSignedUrl(component.filename, 86400);
        
      if (urlError || !urlData?.signedUrl) {
        console.error('Erreur SignedURL:', urlError);
        return NextResponse.json({ error: 'Erreur lors de la génération du lien' }, { status: 500 });
      }

      // Importer Resend dynamiquement ou au top
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const resendResponse = await resend.emails.send({
        from: 'onboarding@resend.dev', // Adresse de test Resend obligatoire sans nom de domaine vérifié
        to: [email],
        subject: `🎁 Voici votre composant gratuit : ${component.title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #09090b; color: white; border-radius: 10px;">
            <h2 style="color: #8b5cf6;">Merci pour votre téléchargement !</h2>
            <p style="color: #e5e5e5; font-size: 16px;">Voici le lien pour télécharger votre composant gratuit <strong>${component.title}</strong>.</p>
            <br/>
            <div style="text-align: center;">
              <a href="${urlData.signedUrl}" style="background: linear-gradient(135deg, #f0c27f 0%, #ec4899 50%, #8b5cf6 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">
                Télécharger le fichier (ZIP)
              </a>
            </div>
            <br/>
            <p style="color: #a3a3a3; font-size: 14px;"><em>Ce lien expirera dans 24 heures.</em></p>
          </div>
        `,
      });

      if (resendResponse.error) {
        console.error('Erreur Resend:', resendResponse.error);
        return NextResponse.json({ error: `Erreur email: ${resendResponse.error.message}` }, { status: 500 });
      }

      return NextResponse.json({ freeSuccess: true });
    }
    // Configurer FedaPay
    const secretKey = process.env.FEDAPAY_SECRET_KEY || '';
    if (!secretKey) {
      return NextResponse.json({ error: 'Configuration de paiement manquante' }, { status: 500 });
    }
    
    FedaPay.setApiKey(secretKey);
    FedaPay.setEnvironment(secretKey.includes('sandbox') ? 'sandbox' : 'live');

    // Créer la transaction FedaPay
    const transaction = await Transaction.create({
      description: `Achat Re-Use : ${component.title}`,
      amount: component.priceValue,
      currency: { iso: 'XOF' },
      callback_url: returnUrl || 'http://localhost:3000',
      customer: {
        email: email
      },
      custom_metadata: {
        component_id: component.id,
        filename: component.filename,
        buyer_email: email
      }
    });

    // Générer le lien de paiement
    const token = await transaction.generateToken();
    
    return NextResponse.json({ url: token.url });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de la création de la transaction' }, { status: 500 });
  }
}
