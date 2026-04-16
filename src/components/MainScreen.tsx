import React, { useEffect, useState } from 'react';
import { MapPin, Cloud, Sun, CloudRain, Loader2, Coffee, Utensils, AlertTriangle, RefreshCw, Settings, X } from 'lucide-react';
import { Weather } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface MainScreenProps {
  onStart: (type: 'food' | 'drink') => void;
  weather: Weather | null;
  locationError: string | null;
  isLocating: boolean;
  isFetching: boolean;
  onRetryLocation: () => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({
  onStart,
  weather,
  locationError,
  isLocating,
  isFetching,
  onRetryLocation,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'food' | 'drink' | null>(null);

  useEffect(() => {
    if (!isFetching) {
      setSelectedType(null);
    }
  }, [isFetching]);

  const handleStartClick = (type: 'food' | 'drink') => {
    setSelectedType(type);
    onStart(type);
  };

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
        className="flex flex-col items-center gap-4 z-20 w-full"
      >
        <AnimatePresence mode="popLayout">
          {(!isFetching || selectedType === 'food') && (
            <motion.div
              layout
              key="food-btn"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[280px]"
            >
              <button
                onClick={() => handleStartClick('food')}
                disabled={isLocating || isFetching || !!locationError}
                className="group relative px-[40px] py-[18px] w-full justify-center bg-white text-black rounded-full text-[20px] font-semibold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-[10px] shadow-[0_25px_50px_rgba(0,0,0,0.3)]"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    定位中...
                  </>
                ) : isFetching && selectedType === 'food' ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    搜尋中...
                  </>
                ) : (
                  <>
                    <Utensils className="w-6 h-6 group-hover:animate-bounce" />
                    想吃什麼？
                  </>
                )}
              </button>
            </motion.div>
          )}

          {(!isFetching || selectedType === 'drink') && (
            <motion.div
              layout
              key="drink-btn"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[280px]"
            >
              <button
                onClick={() => handleStartClick('drink')}
                disabled={isLocating || isFetching || !!locationError}
                className="group relative px-[40px] py-[18px] w-full justify-center bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full text-[20px] font-semibold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-[10px] shadow-[0_25px_50px_rgba(0,0,0,0.3)]"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    定位中...
                  </>
                ) : isFetching && selectedType === 'drink' ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    搜尋中...
                  </>
                ) : (
                  <>
                    <Coffee className="w-6 h-6 group-hover:animate-bounce" />
                    想喝什麼？
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {locationError && (
          <div className="w-full max-w-[280px] bg-white/10 backdrop-blur-md border border-red-400/50 rounded-2xl p-5 flex flex-col items-center gap-3 shadow-lg">
            <div className="flex items-center gap-2 text-red-300">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">定位失敗</span>
            </div>
            <p className="text-white/90 text-sm text-center leading-relaxed">
              {locationError}
            </p>
            <div className="flex w-full gap-2 mt-2">
              <button
                onClick={onRetryLocation}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" /> 重試
              </button>
              <button
                onClick={() => setShowHelpModal(true)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <Settings className="w-4 h-4" /> 教學
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showHelpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white/15 backdrop-blur-[25px] border border-white/25 rounded-[30px] p-6 shadow-2xl text-white relative"
            >
              <button onClick={() => setShowHelpModal(false)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5"/>
              </button>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Settings className="w-5 h-5"/> 如何開啟定位？</h3>
              
              <div className="space-y-4 text-sm text-white/80">
                <p className="text-yellow-200 text-xs">⚠️ 網頁無法直接跳轉至手機設定，請依照以下步驟手動開啟：</p>
                
                <div>
                  <h4 className="font-bold text-white mb-1">📱 iOS (iPhone/iPad)</h4>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>前往手機的「設定」&gt;「隱私權與安全性」</li>
                    <li>點擊「定位服務」並確認已開啟</li>
                    <li>在下方找到您使用的瀏覽器 (如 Safari 或 Chrome)</li>
                    <li>將權限改為「使用 App 期間」</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-1">🤖 Android</h4>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>前往手機的「設定」&gt;「位置」</li>
                    <li>確認「使用位置資訊」已開啟</li>
                    <li>點擊「應用程式權限」</li>
                    <li>找到您使用的瀏覽器 (如 Chrome) 並允許存取</li>
                  </ol>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
