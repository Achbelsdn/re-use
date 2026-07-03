import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/services/supabase';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'like';
    
    // Fetch current likes
    const { data: comp, error: fetchErr } = await supabaseAdmin
      .from('components')
      .select('likes')
      .eq('id', id)
      .single();
      
    if (fetchErr) {
      throw fetchErr;
    }

    let newLikes = comp.likes || 0;
    if (action === 'unlike') {
      newLikes = Math.max(0, newLikes - 1);
    } else {
      newLikes = newLikes + 1;
    }

    // Update with new likes
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('components')
      .update({ likes: newLikes })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      throw updateErr;
    }

    return NextResponse.json({ success: true, likes: updated.likes });
  } catch (error: any) {
    console.error('Like error:', error);
    return NextResponse.json({ error: 'Failed to like component' }, { status: 500 });
  }
}
