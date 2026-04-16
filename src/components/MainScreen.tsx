import React, { useEffect, useState } from 'react';
import { MapPin, Cloud, Sun, CloudRain, Loader2, Coffee, Utensils } from 'lucide-react';
import { Weather } from '../types';
import { motion } from 'motion/react';

interface MainScreenProps {
  onStart: (type: 'food' | 'drink') => void;
  weather: Weather | null;
  locationError: string | null;
  isLoadingLocation: boolean;
}

export const MainScreen: React.FC<MainScreenProps> = ({
  onStart,
  weather,
  locationError,
  isLoadingLocation,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const hour = currentTime.getHours();
  let mealType = '晚餐';
  if (hour >= 5 && hour < 11) mealType = '早餐';
  else if (hour >= 11 && hour < 14) mealType = '午餐';
  else if (hour >= 14 && hour < 17) mealType = '下午茶';
  else if (hour >= 21 || hour < 5) mealType = '宵夜';

  const WeatherIcon = () => {
    if (!weather) return null;
    const condition = weather.condition.toLowerCase();
    if (condition.includes('rain') || condition.includes('drizzle')) {
      return <CloudRain className="w-10 h-10 text-white" />;
    }
    if (condition.includes('cloud') || condition.includes('overcast')) {
      return <Cloud className="w-10 h-10 text-white" />;
    }
    return <Sun className="w-10 h-10 text-white" />;
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2a6c] via-[#b21f1f] to-[#fdbb2d] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 40%)' }} />
      
      <div className="absolute top-10 left-10 right-10 flex justify-between items-start z-10">
        {weather && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-left text-white"
          >
            <div className="text-[48px] font-[200] mb-[-10px] flex items-center gap-3">
              <WeatherIcon />
              {Math.round(weather.temperature)}°C
            </div>
            <div className="text-[18px] tracking-[2px] opacity-80 mt-4">
              {weather.condition}
            </div>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-right text-white"
        >
          <div className="text-[24px] font-medium">{timeString}</div>
          <div className="text-[14px] opacity-60 mt-1">搜尋附近的{mealType}選項</div>
        </motion.div>
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center gap-4 z-20"
      >
        <button
          onClick={() => onStart('food')}
          disabled={isLoadingLocation || !!locationError}
          className="group relative px-[40px] py-[18px] w-full max-w-[280px] justify-center bg-white text-black rounded-full text-[20px] font-semibold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-[10px] shadow-[0_25px_50px_rgba(0,0,0,0.3)]"
        >
          {isLoadingLocation ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              定位中...
            </>
          ) : (
            <>
              <Utensils className="w-6 h-6 group-hover:animate-bounce" />
              想吃什麼？
            </>
          )}
        </button>

        <button
          onClick={() => onStart('drink')}
          disabled={isLoadingLocation || !!locationError}
          className="group relative px-[40px] py-[18px] w-full max-w-[280px] justify-center bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full text-[20px] font-semibold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-[10px] shadow-[0_25px_50px_rgba(0,0,0,0.3)]"
        >
          {isLoadingLocation ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              定位中...
            </>
          ) : (
            <>
              <Coffee className="w-6 h-6 group-hover:animate-bounce" />
              想喝什麼？
            </>
          )}
        </button>

        {locationError && (
          <div className="text-white bg-red-500/50 backdrop-blur-[25px] border border-white/25 px-4 py-2 rounded-lg text-sm">
            {locationError}
          </div>
        )}
      </motion.div>
    </div>
  );
};
