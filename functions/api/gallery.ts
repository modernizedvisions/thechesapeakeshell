type D1PreparedStatement = {
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean; error?: string }>;
  bind(...values: unknown[]): D1PreparedStatement;
  first<T>(): Promise<T | null>;
};

type D1Database = {
  prepare(query: string): D1PreparedStatement;
};

type GalleryRow = {
  id: string;
  image_url: string | null;
  alt_text?: string | null;
  is_active?: number | null;
  position?: number | null;
  created_at?: string | null;
};

const createGalleryTable = `
  CREATE TABLE IF NOT EXISTS gallery_images (
    id TEXT PRIMARY KEY,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    is_active INTEGER DEFAULT 1,
    position INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`;

export async function onRequestGet(context: { env: { DB?: D1Database }; request: Request }): Promise<Response> {
  try {
    const db = context.env.DB;
    if (!db) {
      console.error('[api/gallery][get] missing DB binding');
      return jsonError('Database unavailable', 500);
    }
    await ensureGallerySchema(db);
    const { results } = await db
      .prepare(
        `SELECT id, image_url, alt_text, is_active, position, created_at
         FROM gallery_images
         ORDER BY position ASC, created_at ASC;`
      )
      .all<GalleryRow>();

    const images = (results || []).map(mapRowToImage).filter(Boolean);
    console.log('[api/gallery][get] fetched', { count: images.length });

    return new Response(JSON.stringify({ images }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('[api/gallery][get] Failed to load gallery images', {
      message: (error as any)?.message,
      stack: (error as any)?.stack,
    });
    return jsonError('Failed to load gallery images', 500);
  }
}

export async function onRequestPut(context: { env: { DB?: D1Database }; request: Request }): Promise<Response> {
  try {
    const db = context.env.DB;
    const contentType = context.request.headers.get('content-type');
    if (!db) {
      console.error('[api/gallery] missing DB binding');
      return jsonError('Database unavailable', 500);
    }

    await ensureGallerySchema(db);

    let body: any = null;
    try {
      body = await context.request.json();
    } catch (parseError) {
      console.error('[api/gallery] failed to parse JSON body', {
        message: (parseError as any)?.message,
        contentType,
      });
      return jsonError('Invalid JSON payload', 400);
    }

    const images = Array.isArray(body?.images) ? body.images : [];
    console.log('[api/gallery] saving images', {
      count: images.length,
      contentType,
      firstPrefix: images[0]?.imageUrl ? String(images[0].imageUrl).slice(0, 32) : null,
      firstLength: images[0]?.imageUrl ? String(images[0].imageUrl).length : 0,
    });

    // Overwrite-all approach keeps ordering simple for now.
    await db.prepare(`DELETE FROM gallery_images;`).run();

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img?.imageUrl || typeof img.imageUrl !== 'string') continue;
      const id = img.id || safeId(`gallery-${i}`);
      try {
        await db
          .prepare(
            `INSERT INTO gallery_images (id, image_url, alt_text, is_active, position, created_at)
           VALUES (?, ?, ?, ?, ?, ?);`
          )
          .bind(
            id,
            img.imageUrl,
            img.alt || img.title || null,
            img.hidden ? 0 : 1,
            Number.isFinite(img.position) ? img.position : i,
            img.createdAt || new Date().toISOString()
          )
          .run();
      } catch (err) {
        console.error('[api/gallery] insert failed', {
          message: (err as any)?.message,
          idx: i,
          id,
        });
        throw err;
      }
    }

    const refreshed = await db
      .prepare(
        `SELECT id, image_url, alt_text, is_active, position, created_at
         FROM gallery_images
         ORDER BY position ASC, created_at ASC;`
      )
      .all<GalleryRow>();

    const savedImages = (refreshed.results || []).map(mapRowToImage).filter(Boolean);
    console.log('[api/gallery] saved', { count: savedImages.length });

    return new Response(JSON.stringify({ images: savedImages }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('[api/gallery] Failed to save gallery images', {
      message: (error as any)?.message,
      stack: (error as any)?.stack,
    });
    return jsonError('Failed to save gallery images', 500);
  }
}

// Allow POST as a convenience in case clients mis-send the verb.
export const onRequestPost = onRequestPut;

function mapRowToImage(row: GalleryRow | null | undefined) {
  if (!row?.id || !row.image_url) return null;
  return {
    id: row.id,
    imageUrl: row.image_url,
    alt: row.alt_text || undefined,
    title: row.alt_text || undefined,
    hidden: row.is_active === 0,
    position: row.position ?? 0,
    createdAt: row.created_at || undefined,
  };
}

async function ensureGallerySchema(db: D1Database) {
  await db.prepare(createGalleryTable).run();
}

function safeId(fallback: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // ignore and fallback
    }
  }
  return `${fallback}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function jsonError(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
