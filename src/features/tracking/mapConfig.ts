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
