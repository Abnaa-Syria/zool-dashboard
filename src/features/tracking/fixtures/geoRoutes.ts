/**
 * Real geographic coordinates along Sudan interstate highway corridors.
 * [Latitude, Longitude] in standard WGS84 geographic system.
 */

export interface GeoRoute {
  id: string;
  name: string;
  corridorId: 'northern' | 'port_sudan' | 'gezira_kassala' | 'western';
  totalDistanceKm: number;
  waypoints: [number, number][]; // [lat, lng]
}

// 1. Sharyan Al-Shamal (Northern Arterial Highway: Khartoum -> Shendi -> Begrawiya -> Merowe)
export const northernCorridorWaypoints: [number, number][] = [
  [15.5450, 32.5550], // Khartoum (Mina Al-Barri)
  [15.6100, 32.5400], // Khartoum North Exit
  [15.7200, 32.5350], // Bahri - Kadaro
  [15.8600, 32.5450], // Wad Ramli
  [16.0200, 32.6100], // Tamaniat checkpoint
  [16.1800, 32.7400], // Qoz Abu Dulu Junction
  [16.3500, 32.9500], // Wad Hamid Rest Stop
  [16.5200, 33.1800], // Hajar Al-Asal Checkpoint
  [16.6300, 33.3400], // Shendi South Approach
  [16.6912, 33.4321], // Shendi Central Station & Rest Stop
  [16.7800, 33.5600], // Al-Matamma Bridge / Shendi North
  [16.8600, 33.6600], // Al-Messiktab
  [16.9380, 33.7480], // Begrawiya Tourist Stop (Meroe Pyramids)
  [17.0900, 33.7900], // Kabushiya Junction
  [17.2500, 33.8500], // Zaidab agricultural belt
  [17.4200, 33.9100], // Damer South
  [17.5800, 33.9500], // Al-Damer / Atbara Junction
  [17.7500, 33.7200], // West Nile Crossing towards Karima
  [17.9200, 33.3100], // Desert Corridor Kilo 210
  [18.0800, 32.8800], // Desert Checkpoint (Abu Dom)
  [18.2500, 32.4200], // Bayuda Oasis Point
  [18.4100, 31.9800], // Merowe Dam Approach
  [18.4850, 31.8150], // Merowe Central Terminal (Arrival)
];

// 2. Eastern Challenge Highway (Khartoum -> Atbara -> Haiya -> Sinkat -> Suakin -> Port Sudan)
export const portSudanCorridorWaypoints: [number, number][] = [
  [15.5450, 32.5550], // Khartoum Mina Al-Barri
  [15.8600, 32.5450], // Wad Ramli
  [16.6912, 33.4321], // Shendi
  [17.5800, 33.9500], // Al-Damer
  [17.7022, 33.9864], // Atbara Central Terminal
  [17.8900, 34.4200], // Atbara East Highway
  [18.0500, 34.9500], // Desert Waypoint (Musmar)
  [18.2100, 35.6500], // Tahamyam Highway Rest
  [18.3300, 36.3500], // Haiya Strategic Junction
  [18.5200, 36.6200], // Sinkat Valley Approach
  [18.8300, 36.8300], // Sinkat High-Plateau Station
  [19.0100, 37.1500], // Aqaba Pass / Red Sea Hills
  [19.1000, 37.3300], // Suakin Historical Junction
  [19.4500, 37.2600], // Port Sudan South Gate
  [19.6158, 37.2164], // Port Sudan Harbor & Intercity Station
];

// 3. Gezira, Gedaref & Kassala Corridor (Khartoum -> Wad Madani -> Gedaref -> Kassala)
export const geziraKassalaWaypoints: [number, number][] = [
  [15.5450, 32.5550], // Khartoum Mina Al-Barri
  [15.3200, 32.6800], // Soba Checkpoint
  [15.0800, 32.8200], // Kamlin Station
  [14.7800, 33.1200], // Al-Hasaheisa
  [14.4012, 33.5199], // Wad Madani Central Terminal
  [14.2100, 33.9200], // Rahad River Crossing
  [13.9700, 34.3300], // Fau Rest Stop
  [14.0300, 35.3800], // Gedaref Grain Terminal Station
  [14.6500, 35.8500], // Showak Station (Atbara River)
  [15.1200, 36.1500], // Kashm Al-Girba
  [15.4500, 36.4000], // Kassala Terminal (Taka Mountains)
];

// 4. Western Corridor (Khartoum -> Ed Dueim -> Kosti -> Tendelti -> El Obeid)
export const westernCorridorWaypoints: [number, number][] = [
  [15.5450, 32.5550], // Khartoum Mina Al-Barri
  [15.2200, 32.4800], // Jebel Aulia Dam
  [14.7200, 32.3900], // Al-Qitaina
  [14.0000, 32.3200], // Ed Dueim Terminal
  [13.5600, 32.4800], // Kawa Checkpoint
  [13.1629, 32.6635], // Kosti White Nile Terminal
  [13.0800, 32.2500], // Kosti West Exit
  [13.0100, 31.8600], // Tendelti Station
  [12.9000, 31.2200], // Umm Ruwaba Market Terminal
  [13.0500, 30.7200], // Al-Rahad Oasis
  [13.1843, 30.2167], // El Obeid Central Terminal
];

export const CORRIDOR_ROUTES: GeoRoute[] = [
  {
    id: 'route-krt-mrw',
    name: 'الخرطوم ← مروي (شريان الشمال)',
    corridorId: 'northern',
    totalDistanceKm: 350,
    waypoints: northernCorridorWaypoints,
  },
  {
    id: 'route-krt-ptsd',
    name: 'الخرطوم ← بورتسودان (طريق التحدي)',
    corridorId: 'port_sudan',
    totalDistanceKm: 810,
    waypoints: portSudanCorridorWaypoints,
  },
  {
    id: 'route-krt-ksl',
    name: 'الخرطوم ← مدني ← كسلا (طريق الشرق)',
    corridorId: 'gezira_kassala',
    totalDistanceKm: 620,
    waypoints: geziraKassalaWaypoints,
  },
  {
    id: 'route-krt-ebd',
    name: 'الخرطوم ← كوستي ← الأبيض (شريان الغرب)',
    corridorId: 'western',
    totalDistanceKm: 560,
    waypoints: westernCorridorWaypoints,
  },
];

/**
 * Calculates geographic distance in kilometers using the Haversine formula.
 */
export function calculateHaversineKm(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371; // Earth radius in km
  const dLat = ((coord2[0] - coord1[0]) * Math.PI) / 180;
  const dLon = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const lat1 = (coord1[0] * Math.PI) / 180;
  const lat2 = (coord2[0] * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Derives true compass heading in degrees (0 - 360) from coord1 to coord2.
 */
export function calculateHeading(coord1: [number, number], coord2: [number, number]): number {
  const lat1 = (coord1[0] * Math.PI) / 180;
  const lat2 = (coord2[0] * Math.PI) / 180;
  const dLon = ((coord2[1] - coord1[1]) * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Converts degrees heading to Arabic cardinal directions (e.g. "شمال شرق", "شمال").
 */
export function getHeadingArabic(heading: number): { code: string; label: string } {
  if (heading >= 337.5 || heading < 22.5) return { code: 'N', label: 'شمال' };
  if (heading >= 22.5 && heading < 67.5) return { code: 'NE', label: 'شمال شرق' };
  if (heading >= 67.5 && heading < 112.5) return { code: 'E', label: 'شرق' };
  if (heading >= 112.5 && heading < 157.5) return { code: 'SE', label: 'جنوب شرق' };
  if (heading >= 157.5 && heading < 202.5) return { code: 'S', label: 'جنوب' };
  if (heading >= 202.5 && heading < 247.5) return { code: 'SW', label: 'جنوب غرب' };
  if (heading >= 247.5 && heading < 292.5) return { code: 'W', label: 'غرب' };
  return { code: 'NW', label: 'شمال غرب' };
}
