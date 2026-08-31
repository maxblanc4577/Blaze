export interface WorldCity {
  id: string;
  name: string;
  region: string;
  country: string;
  continent: string;
  lat: number;
  lng: number;
}

export const WORLD_CITIES: WorldCity[] = [
  // North America
  { id: 'nyc', name: 'New York City', region: 'New York', country: 'United States', continent: 'North America', lat: 40.7128, lng: -74.0060 },
  { id: 'la', name: 'Los Angeles', region: 'California', country: 'United States', continent: 'North America', lat: 34.0522, lng: -118.2437 },
  { id: 'chicago', name: 'Chicago', region: 'Illinois', country: 'United States', continent: 'North America', lat: 41.8781, lng: -87.6298 },
  { id: 'miami', name: 'Miami', region: 'Florida', country: 'United States', continent: 'North America', lat: 25.7617, lng: -80.1918 },
  { id: 'sf', name: 'San Francisco', region: 'California', country: 'United States', continent: 'North America', lat: 37.7749, lng: -122.4194 },
  { id: 'toronto', name: 'Toronto', region: 'Ontario', country: 'Canada', continent: 'North America', lat: 43.6532, lng: -79.3832 },
  { id: 'vancouver', name: 'Vancouver', region: 'British Columbia', country: 'Canada', continent: 'North America', lat: 49.2827, lng: -123.1207 },
  { id: 'montreal', name: 'Montreal', region: 'Quebec', country: 'Canada', continent: 'North America', lat: 45.5017, lng: -73.5673 },
  { id: 'mexico_city', name: 'Mexico City', region: 'CDMX', country: 'Mexico', continent: 'North America', lat: 19.4326, lng: -99.1332 },
  { id: 'guadalajara', name: 'Guadalajara', region: 'Jalisco', country: 'Mexico', continent: 'North America', lat: 20.6597, lng: -103.3496 },
  { id: 'cancun', name: 'Cancún', region: 'Quintana Roo', country: 'Mexico', continent: 'North America', lat: 21.1619, lng: -86.8515 },

  // Latin America & South America
  { id: 'sao_paulo', name: 'São Paulo', region: 'São Paulo', country: 'Brazil', continent: 'South America', lat: -23.5505, lng: -46.6333 },
  { id: 'rio', name: 'Rio de Janeiro', region: 'Rio de Janeiro', country: 'Brazil', continent: 'South America', lat: -22.9068, lng: -43.1729 },
  { id: 'buenos_aires', name: 'Buenos Aires', region: 'Buenos Aires', country: 'Argentina', continent: 'South America', lat: -34.6037, lng: -58.3816 },
  { id: 'bogota', name: 'Bogotá', region: 'Cundinamarca', country: 'Colombia', continent: 'South America', lat: 4.7110, lng: -74.0721 },
  { id: 'medellin', name: 'Medellín', region: 'Antioquia', country: 'Colombia', continent: 'South America', lat: 6.2442, lng: -75.5812 },
  { id: 'lima', name: 'Lima', region: 'Lima Province', country: 'Peru', continent: 'South America', lat: -12.0464, lng: -77.0428 },
  { id: 'santiago', name: 'Santiago', region: 'Santiago Metropolitan', country: 'Chile', continent: 'South America', lat: -33.4489, lng: -70.6693 },

  // Caribbean
  { id: 'havana', name: 'Havana', region: 'Havana Province', country: 'Cuba', continent: 'Caribbean', lat: 23.1136, lng: -82.3666 },
  { id: 'santo_domingo', name: 'Santo Domingo', region: 'National District', country: 'Dominican Republic', continent: 'Caribbean', lat: 18.4861, lng: -69.9312 },
  { id: 'punta_cana', name: 'Punta Cana', region: 'La Altagracia', country: 'Dominican Republic', continent: 'Caribbean', lat: 18.5601, lng: -68.3725 },
  { id: 'san_juan', name: 'San Juan', region: 'San Juan', country: 'Puerto Rico', continent: 'Caribbean', lat: 18.4655, lng: -66.1057 },
  { id: 'kingston', name: 'Kingston', region: 'Surrey', country: 'Jamaica', continent: 'Caribbean', lat: 17.9712, lng: -76.7928 },
  { id: 'nassau', name: 'Nassau', region: 'New Providence', country: 'Bahamas', continent: 'Caribbean', lat: 25.0343, lng: -77.3963 },

  // Europe
  { id: 'london', name: 'London', region: 'Greater London', country: 'United Kingdom', continent: 'Europe', lat: 51.5074, lng: -0.1278 },
  { id: 'paris', name: 'Paris', region: 'Île-de-France', country: 'France', continent: 'Europe', lat: 48.8566, lng: 2.3522 },
  { id: 'madrid', name: 'Madrid', region: 'Community of Madrid', country: 'Spain', continent: 'Europe', lat: 40.4168, lng: -3.7038 },
  { id: 'barcelona', name: 'Barcelona', region: 'Catalonia', country: 'Spain', continent: 'Europe', lat: 41.3851, lng: 2.1734 },
  { id: 'rome', name: 'Rome', region: 'Lazio', country: 'Italy', continent: 'Europe', lat: 41.9028, lng: 12.4964 },
  { id: 'berlin', name: 'Berlin', region: 'Berlin', country: 'Germany', continent: 'Europe', lat: 52.5200, lng: 13.4050 },
  { id: 'amsterdam', name: 'Amsterdam', region: 'North Holland', country: 'Netherlands', continent: 'Europe', lat: 52.3676, lng: 4.9041 },

  // Asia & Middle East
  { id: 'tokyo', name: 'Tokyo', region: 'Tokyo', country: 'Japan', continent: 'Asia', lat: 35.6762, lng: 139.6503 },
  { id: 'singapore', name: 'Singapore', region: 'Singapore', country: 'Singapore', continent: 'Asia', lat: 1.3521, lng: 103.8198 },
  { id: 'dubai', name: 'Dubai', region: 'Dubai', country: 'United Arab Emirates', continent: 'Asia', lat: 25.2048, lng: 55.2708 },
  { id: 'bangkok', name: 'Bangkok', region: 'Bangkok', country: 'Thailand', continent: 'Asia', lat: 13.7563, lng: 100.5018 },
  { id: 'seoul', name: 'Seoul', region: 'Seoul', country: 'South Korea', continent: 'Asia', lat: 37.5665, lng: 126.9780 },

  // Oceania & Africa
  { id: 'sydney', name: 'Sydney', region: 'New South Wales', country: 'Australia', continent: 'Oceania', lat: -33.8688, lng: 151.2093 },
  { id: 'melbourne', name: 'Melbourne', region: 'Victoria', country: 'Australia', continent: 'Oceania', lat: -37.8136, lng: 144.9631 },
  { id: 'auckland', name: 'Auckland', region: 'Auckland', country: 'New Zealand', continent: 'Oceania', lat: -36.8485, lng: 174.7633 },
  { id: 'cape_town', name: 'Cape Town', region: 'Western Cape', country: 'South Africa', continent: 'Africa', lat: -33.9249, lng: 18.4241 },
  { id: 'cairo', name: 'Cairo', region: 'Cairo Governorate', country: 'Egypt', continent: 'Africa', lat: 30.0444, lng: 31.2357 }
];
