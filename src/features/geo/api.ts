import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api/client';

/** GET /admin/cities row (backend geo.service `toCityDto`). */
export type City = {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  imageUrl: string | null;
  isPopular: boolean;
  sortOrder: number;
  isActive: boolean;
  stationCount: number;
  createdAt: string;
  updatedAt: string;
};

/** GET /admin/stations row (`toStationDto`). */
export type Station = {
  id: string;
  city: { id: string; code: string; nameAr: string; nameEn: string };
  nameAr: string;
  nameEn: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/** GET /admin/amenities row (`toAmenityDto`). */
export type Amenity = { id: string; code: string; nameAr: string; nameEn: string; icon: string; sortOrder: number };

export type CityFilters = { page?: number; pageSize?: number; q?: string; isActive?: boolean };
export type StationFilters = { page?: number; pageSize?: number; cityId?: string; q?: string; isActive?: boolean };

export type CreateCityInput = { code: string; nameAr: string; nameEn: string; imageUrl?: string; isPopular?: boolean; sortOrder?: number };
export type CityPatch = Partial<{
  nameAr: string;
  nameEn: string;
  imageUrl: string | null;
  isPopular: boolean;
  sortOrder: number;
  isActive: boolean;
}>;

export type CreateStationInput = {
  cityId: string;
  nameAr: string;
  nameEn: string;
  address?: string;
  latitude?: number;
  longitude?: number;
};
export type StationPatch = Partial<{
  nameAr: string;
  nameEn: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
}>;

export type CreateAmenityInput = { code: string; nameAr: string; nameEn: string; icon: string; sortOrder?: number };
export type AmenityPatch = Partial<{ nameAr: string; nameEn: string; icon: string; sortOrder: number }>;

export const geoKeys = {
  all: ['geo'] as const,
  cities: (f: CityFilters) => [...geoKeys.all, 'cities', f] as const,
  stations: (f: StationFilters) => [...geoKeys.all, 'stations', f] as const,
  amenities: () => [...geoKeys.all, 'amenities'] as const,
  city: (id: string) => [...geoKeys.all, 'city', id] as const,
  station: (id: string) => [...geoKeys.all, 'station', id] as const,
  amenity: (id: string) => [...geoKeys.all, 'amenity', id] as const,
};

export function useCities(filters: CityFilters) {
  return useQuery({
    queryKey: geoKeys.cities(filters),
    queryFn: ({ signal }) => api.get<City[]>('/admin/cities', filters, signal),
    placeholderData: keepPreviousData,
  });
}

/** Every city (max page size) for selects and filters. */
export function useAllCities() {
  return useCities({ pageSize: 100 });
}

export function useStations(filters: StationFilters, enabled = true) {
  return useQuery({
    queryKey: geoKeys.stations(filters),
    queryFn: ({ signal }) => api.get<Station[]>('/admin/stations', filters, signal),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useAmenities() {
  return useQuery({
    queryKey: geoKeys.amenities(),
    queryFn: ({ signal }) => api.get<Amenity[]>('/admin/amenities', undefined, signal).then((r) => r.data),
  });
}

export function useCity(id: string | undefined) {
  return useQuery({
    queryKey: geoKeys.city(id ?? ''),
    queryFn: ({ signal }) => api.get<City>(`/admin/cities/${id}`, undefined, signal).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function useStation(id: string | undefined) {
  return useQuery({
    queryKey: geoKeys.station(id ?? ''),
    queryFn: ({ signal }) => api.get<Station>(`/admin/stations/${id}`, undefined, signal).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function useAmenity(id: string | undefined) {
  return useQuery({
    queryKey: geoKeys.amenity(id ?? ''),
    queryFn: ({ signal }) => api.get<Amenity>(`/admin/amenities/${id}`, undefined, signal).then((r) => r.data),
    enabled: Boolean(id),
  });
}

/** Any geo write can change counts or names shown on other geo lists (and vehicle amenity names). */
function useGeoMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => Promise.all([qc.invalidateQueries({ queryKey: geoKeys.all }), qc.invalidateQueries({ queryKey: ['fleet'] })]),
  });
}

export const useCreateCity = () => useGeoMutation((input: CreateCityInput) => api.post<City>('/admin/cities', input).then((r) => r.data));
export const useUpdateCity = () =>
  useGeoMutation((v: { id: string; patch: CityPatch }) => api.patch<City>(`/admin/cities/${v.id}`, v.patch).then((r) => r.data));

export const useCreateStation = () =>
  useGeoMutation((input: CreateStationInput) => api.post<Station>('/admin/stations', input).then((r) => r.data));
export const useUpdateStation = () =>
  useGeoMutation((v: { id: string; patch: StationPatch }) => api.patch<Station>(`/admin/stations/${v.id}`, v.patch).then((r) => r.data));

export const useCreateAmenity = () =>
  useGeoMutation((input: CreateAmenityInput) => api.post<Amenity>('/admin/amenities', input).then((r) => r.data));
export const useUpdateAmenity = () =>
  useGeoMutation((v: { id: string; patch: AmenityPatch }) => api.patch<Amenity>(`/admin/amenities/${v.id}`, v.patch).then((r) => r.data));

/**
 * Hard deletes (geo.manage). 409 ENTITY_IN_USE when something still uses the record; the caller
 * (DeleteEntityDialog) then offers deactivation instead.
 */
function useGeoDelete(kind: 'cities' | 'stations' | 'amenities') {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ deleted: boolean }>(`/admin/${kind}/${id}`).then((r) => r.data),
    // Refresh lists but not the deleted record's own detail (it would 404 while the page navigates away).
    onSuccess: (_d, id) =>
      Promise.all([
        qc.invalidateQueries({ queryKey: geoKeys.all, predicate: (q) => q.queryKey[2] !== id }),
        qc.invalidateQueries({ queryKey: ['fleet'] }),
      ]),
  });
}

export const useDeleteCity = () => useGeoDelete('cities');
export const useDeleteStation = () => useGeoDelete('stations');
export const useDeleteAmenity = () => useGeoDelete('amenities');
