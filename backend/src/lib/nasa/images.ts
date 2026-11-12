/**
 * NASA Image and Video Library client.
 *
 * Docs: https://images-api.nasa.gov
 * No API key required. Rate-limited but generous for demos.
 */

export type NasaMediaType = "image" | "video" | "audio";

export type NasaSearchResult = {
  nasaId: string;
  title: string;
  description: string;
  mediaType: NasaMediaType;
  dateCreated: string;
  /** Thumbnail or preview image URL. */
  thumbnailUrl: string | null;
  /** Full-resolution asset manifest URL. */
  assetUrl: string;
};

type NasaApiResponse = {
  collection: {
    items: Array<{
      href: string;
      data: Array<{
        nasa_id: string;
        title: string;
        description?: string;
        media_type: string;
        date_created: string;
      }>;
      links?: Array<{
        href: string;
        rel: string;
        render?: string;
      }>;
    }>;
    metadata?: { total_hits: number };
  };
};

const BASE_URL = "https://images-api.nasa.gov";

export async function searchNasaImages(
  query: string,
  options: {
    mediaType?: NasaMediaType;
    yearStart?: number;
    yearEnd?: number;
    page?: number;
    limit?: number;
  } = {},
): Promise<NasaSearchResult[]> {
  const { mediaType = "image", yearStart, yearEnd, page = 1, limit = 12 } = options;

  const params = new URLSearchParams({
    q: query,
    media_type: mediaType,
    page: String(page),
  });
  if (yearStart) params.set("year_start", String(yearStart));
  if (yearEnd) params.set("year_end", String(yearEnd));

  const url = `${BASE_URL}/search?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`NASA Image API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as NasaApiResponse;
  const items = data.collection?.items ?? [];

  const results: NasaSearchResult[] = [];
  for (const item of items) {
    const meta = item.data?.[0];
    if (!meta) continue;

    const thumbnail = item.links?.find((l) => l.rel === "preview" && l.render === "image");

    results.push({
      nasaId: meta.nasa_id,
      title: meta.title,
      description: meta.description ?? "",
      mediaType: meta.media_type as NasaMediaType,
      dateCreated: meta.date_created,
      thumbnailUrl: thumbnail?.href ?? null,
      assetUrl: `${BASE_URL}/asset/${meta.nasa_id}`,
    });
  }

  return results.slice(0, limit);
}

/**
 * Fetch the asset manifest for a NASA item. Returns URLs for different sizes.
 */
export async function getAssetManifest(
  nasaId: string,
): Promise<{
  original: string | null;
  large: string | null;
  medium: string | null;
  thumbnail: string | null;
}> {
  const url = `${BASE_URL}/asset/${nasaId}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`NASA Asset API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as {
    collection: { items: Array<{ href: string }> };
  };

  const items = data.collection?.items ?? [];
  const find = (size: string) =>
    items.find((i) => i.href.includes(size) || i.href.includes(`~${size}.`))?.href ?? null;

  return {
    original: find("orig"),
    large: find("large"),
    medium: find("medium"),
    thumbnail: find("thumb"),
  };
}
