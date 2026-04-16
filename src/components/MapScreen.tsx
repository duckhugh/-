import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { ChevronLeft, ChevronRight, Star, MapPin, Clock, ArrowLeft, Heart, X, Navigation, Loader2 } from 'lucide-react';
import L from 'leaflet';
import { Restaurant, Location } from '../types';

const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.9
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9
  })
};

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const customMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/2.0.0/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapScreenProps {
  userLocation: Location;
  restaurants: Restaurant[];
  onBack: () => void;
  onLoadMore: () => void;
  isFetchingMore: boolean;
}

const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    const zoom = 15;
    const targetPoint = map.project(center, zoom);
    // 將地圖中心點向下偏移螢幕高度的 25%，讓標記點顯示在畫面上方
    targetPoint.y += window.innerHeight * 0.25;
    const targetLatLng = map.unproject(targetPoint, zoom);
    map.flyTo(targetLatLng, zoom, { duration: 1.5 });
  }, [center, map]);
  return null;
};

export const MapScreen: React.FC<MapScreenProps> = ({ userLocation, restaurants, onBack, onLoadMore, isFetchingMore }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [savedRestaurants, setSavedRestaurants] = useState<Record<string, Restaurant & { pref: 'liked' | 'disliked' }>>(() => {
    const saved = localStorage.getItem('saved_restaurants_data');
    return saved ? JSON.parse(saved) : {};
  });
  const [showListModal, setShowListModal] = useState<'liked' | 'disliked' | null>(null);

  const currentRestaurant = restaurants[currentIndex];

  const handlePreference = (type: 'liked' | 'disliked', dir: number) => {
    const newSaved = { ...savedRestaurants, [currentRestaurant.id]: { ...currentRestaurant, pref: type } };
    setSavedRestaurants(newSaved);
    localStorage.setItem('saved_restaurants_data', JSON.stringify(newSaved));
    
    if (currentIndex < restaurants.length - 1) {
      setDirection(dir);
      setCurrentIndex(prev => prev + 1);
      
      // Trigger load more when approaching the end of the list
      if (currentIndex === restaurants.length - 2) {
        onLoadMore();
      }
    } else {
      // Reached the end, trigger load more immediately
      onLoadMore();
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      handlePreference('disliked', -1);
    } else if (info.offset.x > swipeThreshold) {
      handlePreference('liked', 1);
    }
  };

  const nextRestaurant = () => {
    if (currentIndex < restaurants.length - 1) {
      setDirection(-1);
      setCurrentIndex(prev => prev + 1);
      
      if (currentIndex === restaurants.length - 2) {
        onLoadMore();
      }
    } else {
      onLoadMore();
    }
  };

  const prevRestaurant = () => {
    if (currentIndex > 0) {
      setDirection(1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (!currentRestaurant) return null;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#1a2a6c]">
      <button 
        onClick={onBack}
        className="absolute top-10 left-10 z-[1000] bg-white/15 backdrop-blur-[25px] border border-white/25 p-4 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:bg-white/25 transition-colors"
      >
        <ArrowLeft className="w-6 h-6 text-white" />
      </button>

      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={[userLocation.lat, userLocation.lng]} 
          zoom={15} 
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[userLocation.lat, userLocation.lng]} />
          <Marker 
            position={[currentRestaurant.lat, currentRestaurant.lng]} 
            icon={customMarkerIcon}
          />
          <MapUpdater center={[currentRestaurant.lat, currentRestaurant.lng]} />
        </MapContainer>
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[#242f3e] z-[400]" style={{
          backgroundImage: `radial-gradient(#38414e 2px, transparent 0), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px, 100px 100px, 100px 100px'
        }} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-[1000] p-6 md:p-10 pb-16 md:pb-20 pointer-events-none flex flex-col items-center">
        <div className="w-full max-w-4xl mx-auto pointer-events-auto">
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="relative w-full bg-white/15 backdrop-blur-[25px] border border-white/25 rounded-[30px] md:rounded-[40px] p-6 md:p-10 flex flex-col md:flex-row gap-6 md:gap-10 shadow-[0_25px_50px_rgba(0,0,0,0.3)] cursor-grab active:cursor-grabbing text-white"
            >
              <div className="relative w-full md:w-[320px] h-[180px] md:h-[400px] shrink-0 rounded-[20px] md:rounded-[24px] overflow-hidden bg-gradient-to-tr from-[#333] to-[#555]">
                <img 
                  src={currentRestaurant.imageUrl} 
                  alt={currentRestaurant.name}
                  className="w-full h-full object-cover opacity-90"
                  referrerPolicy="no-referrer"
                />
                {savedRestaurants[currentRestaurant.id]?.pref === 'liked' && (
                  <button onClick={() => setShowListModal('liked')} className="absolute top-4 left-4 bg-green-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm font-medium flex items-center gap-1.5 shadow-lg hover:bg-green-600 transition-colors">
                    <Heart className="w-4 h-4 fill-current" /> 已喜歡
                  </button>
                )}
                {savedRestaurants[currentRestaurant.id]?.pref === 'disliked' && (
                  <button onClick={() => setShowListModal('disliked')} className="absolute top-4 left-4 bg-red-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm font-medium flex items-center gap-1.5 shadow-lg hover:bg-red-600 transition-colors">
                    <X className="w-4 h-4" /> 不喜歡
                  </button>
                )}
                <div className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-black/70 to-transparent text-white text-[14px]">
                  <span>熱門圖片: {currentRestaurant.cuisine}</span>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                <div className="mb-4 md:mb-6">
                  <span className="inline-block px-[14px] py-[6px] bg-[#FFD700]/20 border border-[#FFD700] rounded-[100px] text-[#FFD700] text-[12px] uppercase tracking-[1px] mb-3 md:mb-5">
                    首選推薦
                  </span>
                  <h2 className="text-[28px] md:text-[42px] font-semibold mb-2 md:mb-3 leading-tight">{currentRestaurant.name}</h2>
                </div>
                
                <div className="flex items-center gap-5 mb-4 md:mb-6 text-[14px] md:text-[16px] text-white/70">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>附近</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-[#00FF88]">
                    <Clock className="w-4 h-4" />
                    <span>營業中</span>
                  </div>
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${currentRestaurant.lat},${currentRestaurant.lng}&travelmode=walking`, '_blank')}
                    className="ml-auto flex items-center gap-1.5 bg-blue-500/80 hover:bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors shadow-lg"
                  >
                    <Navigation className="w-4 h-4" />
                    走路導航
                  </button>
                </div>

                <p className="text-[16px] md:text-[18px] leading-[1.6] mb-6 md:mb-8 text-white/90 line-clamp-3 md:line-clamp-none">
                  {currentRestaurant.description}
                </p>
                
                <div className="mt-auto flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={prevRestaurant}
                      disabled={currentIndex === 0}
                      className="p-4 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 transition-colors border border-white/10"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button 
                      onClick={nextRestaurant}
                      disabled={isFetchingMore && currentIndex === restaurants.length - 1}
                      className="p-4 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 transition-colors border border-white/10"
                    >
                      {isFetchingMore && currentIndex === restaurants.length - 1 ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <ChevronRight className="w-6 h-6 text-white" />
                      )}
                    </button>
                  </div>
                  <div className="text-[13px] md:text-[14px] text-white/70 flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-4 ml-2 font-medium">
                    <button onClick={() => setShowListModal('disliked')} className="flex items-center gap-1 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4 text-red-400"/> 左滑不喜歡</button>
                    <button onClick={() => setShowListModal('liked')} className="flex items-center gap-1 hover:text-white transition-colors">右滑喜歡 <ChevronRight className="w-4 h-4 text-green-400"/></button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-10 flex gap-3 pointer-events-auto">
          {restaurants.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-2 h-2 rounded-full transition-opacity duration-300 ${idx === currentIndex ? 'bg-white opacity-100' : 'bg-white opacity-30'}`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showListModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-10 bg-black/60 backdrop-blur-sm pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl max-h-[80vh] bg-white/15 backdrop-blur-[25px] border border-white/25 rounded-[30px] p-6 flex flex-col shadow-2xl text-white overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2 md:gap-4 bg-black/20 p-1 rounded-full">
                  <button 
                    onClick={() => setShowListModal('liked')} 
                    className={`px-4 md:px-6 py-2 rounded-full text-sm md:text-base font-medium transition-colors flex items-center gap-2 ${showListModal === 'liked' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
                  >
                    <Heart className={`w-4 h-4 ${showListModal === 'liked' ? 'fill-current text-green-400' : ''}`} /> 喜歡
                  </button>
                  <button 
                    onClick={() => setShowListModal('disliked')} 
                    className={`px-4 md:px-6 py-2 rounded-full text-sm md:text-base font-medium transition-colors flex items-center gap-2 ${showListModal === 'disliked' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
                  >
                    <X className={`w-4 h-4 ${showListModal === 'disliked' ? 'text-red-400' : ''}`} /> 不喜歡
                  </button>
                </div>
                <button onClick={() => setShowListModal(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-6 h-6"/>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {Object.values(savedRestaurants).filter(r => r.pref === showListModal).length === 0 ? (
                  <div className="text-center py-10 opacity-50">目前沒有記錄</div>
                ) : (
                  Object.values(savedRestaurants).filter(r => r.pref === showListModal).map(r => (
                    <div key={r.id} className="flex gap-4 bg-black/20 p-4 rounded-2xl items-center border border-white/5 hover:bg-black/30 transition-colors">
                      <img src={r.imageUrl} alt={r.name} className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base md:text-lg font-bold truncate">{r.name}</h3>
                        <p className="text-xs md:text-sm opacity-70 truncate">{r.cuisine}</p>
                      </div>
                      <button
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${r.lat},${r.lng}&travelmode=walking`, '_blank')}
                        className="shrink-0 px-3 py-2 md:px-4 md:py-2 bg-blue-500/80 hover:bg-blue-500 rounded-full text-xs md:text-sm font-medium transition-colors flex items-center gap-1.5 shadow-lg"
                      >
                        <Navigation className="w-4 h-4"/> <span className="hidden md:inline">導航</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
