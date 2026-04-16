import React, { useState, useEffect } from 'react';
import { MainScreen } from './components/MainScreen';
import { MapScreen } from './components/MapScreen';
import { fetchWeather } from './services/weather';
import { fetchRestaurants } from './services/gemini';
import { Location, Weather, Restaurant } from './types';

export default function App() {
  const [view, setView] = useState<'main' | 'map'>('main');
  const [location, setLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isFetchingRestaurants, setIsFetchingRestaurants] = useState(false);
  
  const [searchType, setSearchType] = useState<'food' | 'drink'>('food');
  const [radius, setRadius] = useState(1000);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const getDislikedNames = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('saved_restaurants_data') || '{}');
      return Object.values(saved)
        .filter((r: any) => r.pref === 'disliked')
        .map((r: any) => r.name);
    } catch (e) {
      return [];
    }
  };

  const fetchLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(loc);
          setIsLoadingLocation(false);
          
          const weatherData = await fetchWeather(loc.lat, loc.lng);
          setWeather(weatherData);
        },
        (error) => {
          console.error('Geolocation error:', error);
          if (error.code === error.PERMISSION_DENIED) {
            setLocationError('您已拒絕定位權限。請在瀏覽器設定中允許存取位置資訊。');
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            setLocationError('無法取得位置資訊。請確認手機的 GPS 定位功能已開啟。');
          } else if (error.code === error.TIMEOUT) {
            setLocationError('定位請求超時。請確認網路連線或移動到空曠處後重試。');
          } else {
            setLocationError('發生未知錯誤，無法取得位置資訊。');
          }
          setIsLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError('您的瀏覽器不支援定位功能。');
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const handleStart = async (type: 'food' | 'drink') => {
    if (!location || !weather) return;
    
    setSearchType(type);
    setRadius(1000);
    setIsFetchingRestaurants(true);
    try {
      const disliked = getDislikedNames();
      const results = await fetchRestaurants(location, weather, new Date(), type, 1000, disliked);
      setRestaurants(results);
      setView('map');
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
      alert('無法取得推薦，請稍後再試。');
    } finally {
      setIsFetchingRestaurants(false);
    }
  };

  const handleLoadMore = async () => {
    if (!location || !weather || isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      const newRadius = radius + 1000;
      setRadius(newRadius);
      const disliked = getDislikedNames();
      const shownNames = restaurants.map(r => r.name);
      const allExcluded = [...new Set([...disliked, ...shownNames])];

      const results = await fetchRestaurants(location, weather, new Date(), searchType, newRadius, allExcluded);
      setRestaurants(prev => [...prev, ...results]);
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  return (
    <div className="w-full min-h-screen font-sans text-gray-900">
      {view === 'main' ? (
        <MainScreen 
          onStart={handleStart} 
          weather={weather} 
          locationError={locationError}
          isLoadingLocation={isLoadingLocation || isFetchingRestaurants}
          onRetryLocation={fetchLocation}
        />
      ) : (
        location && restaurants.length > 0 && (
          <MapScreen 
            userLocation={location} 
            restaurants={restaurants} 
            onBack={() => setView('main')}
            onLoadMore={handleLoadMore}
            isFetchingMore={isFetchingMore}
          />
        )
      )}
    </div>
  );
}
