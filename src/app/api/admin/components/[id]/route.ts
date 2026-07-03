import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/services/supabase';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json();
    const updateData: any = {};
    if (body.is_hidden !== undefined) updateData.is_hidden = body.is_hidden;
    if (body.tag !== undefined) updateData.tag = body.tag;
    if (body.price_label !== undefined) updateData.price_label = body.price_label;
    if (body.price_value !== undefined) updateData.price_value = body.price_value;

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user || user.email !== 'achbelneri@gmail.com') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('components')
      .update(updateData)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user || user.email !== 'achbelneri@gmail.com') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('components')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
