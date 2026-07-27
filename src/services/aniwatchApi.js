/**
 * AniWatch (HiAnime) API Service
 * Uses public AniWatch API instances to search anime and get HLS stream sources
 * Endpoint docs: https://github.com/ghoshRitesh12/aniwatch-api
 */

// Public AniWatch API instances — will try each in order on failure
const API_INSTANCES = [
  'https://aniwatch-api-eight.vercel.app',
  'https://aniwatch-api-dusky.vercel.app',
  'https://api-aniwatch.onrender.com',
];

let _workingBase = null;

async function fetchFromApi(path, timeout = 8000) {
  const instances = _workingBase ? [_workingBase, ...API_INSTANCES.filter(b => b !== _workingBase)] : API_INSTANCES;

  for (const base of instances) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeout);
      const res = await fetch(`${base}${path}`, { signal: ctrl.signal });
      clearTimeout(timer);
      if (res.ok) {
        _workingBase = base;
        return await res.json();
      }
    } catch (e) {
      // Try next instance
    }
  }
  return null;
}

/**
 * Search anime on AniWatch by title — returns best matching ID
 */
export async function searchAnimeId(title) {
  try {
    const query = encodeURIComponent(title.split(/[–:]/)[0].trim());
    const data = await fetchFromApi(`/api/v2/hianime/search?q=${query}&page=1`);
    const results = data?.data?.animes || [];
    if (!results.length) return null;

    const titleLower = title.toLowerCase();
    const match = results.find(r => {
      const t = (r.name || '').toLowerCase();
      return t.includes(titleLower) || titleLower.includes(t);
    }) || results[0];

    return match?.id || null;
  } catch (e) {
    return null;
  }
}

/**
 * Get episodes list for a given anime HiAnime ID
 */
export async function getAnimeEpisodes(aniwatchId) {
  try {
    const data = await fetchFromApi(`/api/v2/hianime/anime/${aniwatchId}/episodes`);
    return data?.data?.episodes || [];
  } catch (e) {
    return [];
  }
}

/**
 * Get HLS stream sources for a specific episode
 * category: 'sub' | 'dub' | 'raw'
 * server: 'hd-1' | 'hd-2' | 'megacloud'
 */
export async function getEpisodeSources(episodeId, server = 'hd-1', category = 'sub') {
  try {
    const id = encodeURIComponent(episodeId);
    const data = await fetchFromApi(
      `/api/v2/hianime/episode/sources?animeEpisodeId=${id}&server=${server}&category=${category}`
    );
    return data?.data || null;
  } catch (e) {
    return null;
  }
}

/**
 * Full flow: title + episode number → best HLS stream URL
 */
export async function resolveEpisodeStream(title, episodeNum, category = 'sub') {
  try {
    // 1. Find anime ID on HiAnime
    const aniwatchId = await searchAnimeId(title);
    if (!aniwatchId) return null;

    // 2. Get episode list
    const episodes = await getAnimeEpisodes(aniwatchId);
    if (!episodes.length) return null;

    // 3. Find episode by number
    const ep = episodes.find(e => e.number === episodeNum) || episodes[episodeNum - 1] || episodes[0];
    if (!ep?.episodeId) return null;

    // 4. Try servers in order: hd-1 → hd-2 → megacloud
    for (const server of ['hd-1', 'hd-2', 'megacloud']) {
      const sources = await getEpisodeSources(ep.episodeId, server, category);
      if (sources?.sources?.length) {
        const m3u8 = sources.sources.find(s => s.url?.includes('.m3u8')) || sources.sources[0];
        if (m3u8?.url) {
          return {
            url: m3u8.url,
            subtitles: sources.tracks?.filter(t => t.kind === 'captions') || [],
            episodeId: ep.episodeId,
            server
          };
        }
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}
