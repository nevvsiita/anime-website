// Jikan API Service (MyAnimeList Official API)
// Provides real-time anime search, top trending anime, episodes, and official HD trailers

const JIKAN_BASE = 'https://api.jikan.moe/v4';

export class JikanService {
  // Fetch top trending anime from MyAnimeList
  async getTopAnime(limit = 15) {
    try {
      const res = await fetch(`${JIKAN_BASE}/top/anime?limit=${limit}`);
      if (!res.ok) throw new Error('Jikan API error');
      const data = await res.json();
      return (data.data || []).map(this.formatJikanAnime);
    } catch (err) {
      console.error('Error fetching top anime from Jikan:', err);
      return [];
    }
  }

  // Search anime by query from MyAnimeList
  async searchAnime(query, limit = 20) {
    try {
      const res = await fetch(`${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&limit=${limit}`);
      if (!res.ok) throw new Error('Jikan API error');
      const data = await res.json();
      return (data.data || []).map(this.formatJikanAnime);
    } catch (err) {
      console.error('Error searching anime from Jikan:', err);
      return [];
    }
  }

  // Fetch specific anime details by MyAnimeList ID
  async getAnimeDetails(malId) {
    try {
      const res = await fetch(`${JIKAN_BASE}/anime/${malId}/full`);
      if (!res.ok) throw new Error('Jikan API error');
      const data = await res.json();
      return this.formatJikanAnime(data.data);
    } catch (err) {
      console.error('Error fetching anime details from Jikan:', err);
      return null;
    }
  }

  // Helper: Format raw Jikan API item into AnimeGL data structure
  formatJikanAnime(item) {
    if (!item) return null;
    return {
      id: `mal-${item.mal_id}`,
      malId: item.mal_id,
      title: item.title_japanese || item.title || 'Anime',
      englishTitle: item.title_english || item.title,
      japaneseTitle: item.title_japanese || item.title,
      synopsis: item.synopsis || 'Sinopsis no disponible.',
      coverUrl: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '',
      bannerUrl: item.trailer?.images?.maximum_image_url || item.images?.jpg?.large_image_url || '',
      rating: item.score ? item.score.toFixed(1) : '8.5',
      studio: item.studios?.[0]?.name || 'Studio',
      year: item.year || (item.aired?.from ? new Date(item.aired.from).getFullYear() : 2024),
      episodesCount: item.episodes || 12,
      status: item.status || 'Finalizado',
      genres: item.genres?.map(g => g.name) || ['Acción', 'Aventura'],
      trailerEmbedUrl: item.trailer?.embed_url || null,
      youtubeId: item.trailer?.youtube_id || null,
      gradient: 'linear-gradient(135deg, rgba(240, 171, 252, 0.4) 0%, rgba(167, 139, 250, 0.4) 100%)'
    };
  }
}

export const jikanApi = new JikanService();
