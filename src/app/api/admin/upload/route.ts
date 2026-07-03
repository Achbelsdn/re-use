import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/services/supabase';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Check for Authorization Header (JWT from Google Login)
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé. Connectez-vous avec Google.' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user || user.email !== 'achbelneri@gmail.com') {
      return NextResponse.json({ error: 'Accès refusé. Compte non autorisé.' }, { status: 403 });
    }

    // Récupérer les données du formulaire
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priceLabel = formData.get('priceLabel') as string;
    const priceValue = parseInt(formData.get('priceValue') as string) || 0;
    const type = formData.get('type') as string;
    const tag = formData.get('tag') as string;

    // Récupérer les fichiers
    const imageFile = formData.get('image') as File | null;
    const zipFile = formData.get('zipFile') as File | null;

    if (!title || !description) {
      return NextResponse.json({ error: 'Titre et description requis' }, { status: 400 });
    }

    // --- SECURITY: Validation des fichiers ---
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 Mo
    const MAX_ZIP_SIZE = 50 * 1024 * 1024; // 50 Mo

    if (imageFile) {
      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Le fichier de couverture doit être une image.' }, { status: 400 });
      }
      if (imageFile.size > MAX_IMAGE_SIZE) {
        return NextResponse.json({ error: 'L\'image est trop volumineuse (max 5 Mo).' }, { status: 400 });
      }
    }

    if (zipFile) {
      const allowedZipTypes = ['application/zip', 'application/x-zip-compressed', 'multipart/x-zip'];
      if (!allowedZipTypes.includes(zipFile.type) && !zipFile.name.endsWith('.zip')) {
        return NextResponse.json({ error: 'Le composant doit être une archive .zip.' }, { status: 400 });
      }
      if (zipFile.size > MAX_ZIP_SIZE) {
        return NextResponse.json({ error: 'Le fichier ZIP est trop volumineux (max 50 Mo).' }, { status: 400 });
      }
    }
    // --- FIN SECURITY ---

    let imageUrl = '';
    let filename = '';

    // 1. Upload de l'image de couverture vers le bucket PUBLIC "component-images"
    if (imageFile && imageFile.size > 0) {
      // SECURITY: Nettoyer le nom de fichier (Path traversal & caractères bizarres)
      const cleanImgName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const imageName = `${Date.now()}-${cleanImgName}`;
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

      const { error: imageError } = await supabaseAdmin.storage
        .from('component-images')
        .upload(imageName, imageBuffer, {
          contentType: imageFile.type,
          upsert: true
        });

      if (imageError) {
        console.error('Erreur upload image:', imageError);
        return NextResponse.json({ error: `Erreur upload image: ${imageError.message}` }, { status: 500 });
      }

      // Récupérer l'URL publique
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('component-images')
        .getPublicUrl(imageName);

      imageUrl = publicUrlData.publicUrl;
    }

    // 2. Upload du fichier ZIP vers le bucket PRIVE "components"
    if (zipFile && zipFile.size > 0) {
      // SECURITY: Nettoyer le nom de fichier (Path traversal & caractères bizarres)
      const cleanZipName = zipFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      filename = `${Date.now()}-${cleanZipName}`;
      const zipBuffer = Buffer.from(await zipFile.arrayBuffer());

      const { error: zipError } = await supabaseAdmin.storage
        .from('components')
        .upload(filename, zipBuffer, {
          contentType: 'application/zip',
          upsert: true
        });

      if (zipError) {
        console.error('Erreur upload ZIP:', zipError);
        return NextResponse.json({ error: `Erreur upload ZIP: ${zipError.message}` }, { status: 500 });
      }
    }

    // 3. Insérer l'entrée dans la table "components"
    const { data, error: dbError } = await supabaseAdmin
      .from('components')
      .insert({
        title,
        description,
        price_label: priceLabel,
        price_value: priceValue,
        type,
        tag,
        image_url: imageUrl,
        filename,
        likes: 0
      })
      .select()
      .single();

    if (dbError) {
      console.error('Erreur insertion DB:', dbError);
      return NextResponse.json({ error: `Erreur base de données: ${dbError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, component: data });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
  }
}
