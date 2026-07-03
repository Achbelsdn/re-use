import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/services/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin') === 'true';

    let query = supabaseAdmin
      .from('components')
      .select('*')
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      // Filter out hidden components for public API
      query = query.or('is_hidden.eq.false,is_hidden.is.null');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erreur lecture composants:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ components: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
