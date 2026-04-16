export interface Restaurant {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  cuisine: string;
  imageUrl: string;
  imageUrls: string[];
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Weather {
  temperature: number;
  condition: string;
  isDay: boolean;
}
