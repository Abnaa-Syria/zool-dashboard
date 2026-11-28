import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api/client';

// Leaflet map defaults shared by tracking pages.
export const MAP_CONFIG = {
  tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
  maxZoom: 18,
  minZoom: 5,
  defaultCenter: [16.5, 33.5] as [number, number], // Central Sudan transit hub
  defaultZoom: 7,
};

type AppConfigMaps = { maps?: { tileUrl: string; tileUrlRetina: string; attribution: string; maxZoom: number } };

/**
 * Tile source from `GET /public/app-config` (MapTiler once its key is set in the admin settings,
 * OpenStreetMap otherwise). Null while loading, so the map does not fetch tiles twice.
 */
export function useMapTiles(): { url: string; attribution: string; maxZoom: number } | null {
  const q = useQuery({
    queryKey: ['public', 'app-config'],
    queryFn: async () => (await api.get<AppConfigMaps>('/public/app-config')).data,
    staleTime: 10 * 60_000,
    retry: 1,
  });
  if (q.isPending) return null;
  const m = q.data?.maps;
  if (!m) return { url: MAP_CONFIG.tileUrl, attribution: MAP_CONFIG.attribution, maxZoom: MAP_CONFIG.maxZoom };
  const retina = typeof window !== 'undefined' && window.devicePixelRatio > 1;
  return { url: retina ? m.tileUrlRetina : m.tileUrl, attribution: m.attribution, maxZoom: Math.min(m.maxZoom, 19) };
}
