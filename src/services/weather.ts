import { Weather } from '../types';

// WMO Weather interpretation codes (https://open-meteo.com/en/docs)
const getWeatherCondition = (code: number): string => {
  if (code === 0) return 'Clear sky';
  if (code === 1 || code === 2 || code === 3) return 'Mainly clear, partly cloudy, and overcast';
  if (code === 45 || code === 48) return 'Fog and depositing rime fog';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 65) return 'Rain';
  if (code >= 71 && code <= 75) return 'Snow fall';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Unknown';
};

export const fetchWeather = async (lat: number, lng: number): Promise<Weather> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
    );
    const data = await response.json();
    
    return {
      temperature: data.current_weather.temperature,
      condition: getWeatherCondition(data.current_weather.weathercode),
      isDay: data.current_weather.is_day === 1,
    };
  } catch (error) {
    console.warn('Weather API unavailable, using fallback data.');
    return {
      temperature: 25,
      condition: 'Clear sky',
      isDay: true,
    };
  }
};
