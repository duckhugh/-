import { GoogleGenAI, Type } from '@google/genai';
import { Restaurant, Location, Weather } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const fetchRestaurants = async (
  location: Location,
  weather: Weather,
  currentTime: Date,
  searchType: 'food' | 'drink' = 'food',
  radius: number = 1000,
  dislikedNames: string[] = []
): Promise<Restaurant[]> => {
  try {
    const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const typePrompt = searchType === 'drink'
      ? '飲料店、手搖飲、咖啡廳、酒吧等提供飲品的店家'
      : '餐廳、小吃店、早午餐、晚餐等提供正餐或食物的店家';

    const excludePrompt = dislikedNames.length > 0
      ? `請絕對不要推薦以下店家（使用者已表示不喜歡）：${dislikedNames.join(', ')}。`
      : '';

    const prompt = `You are a local recommendation engine.
Current time: ${timeString}
Current weather: ${weather.condition}, ${weather.temperature}°C
User location: latitude ${location.lat}, longitude ${location.lng}

Find 5 open ${searchType === 'drink' ? 'beverage shops/cafes' : 'restaurants'} near the user's location suitable for the current time.
Search radius: approximately ${radius} meters.
${excludePrompt}

Return a JSON array of objects with the following schema:
- name: string
- description: string (short description of why it's recommended, in Traditional Chinese)
- lat: number
- lng: number
- cuisine: string
- imageKeyword: string (a single English keyword to search for an image of this restaurant or cuisine on Unsplash)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      tools: [{ googleSearch: {} }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER },
              cuisine: { type: Type.STRING },
              imageKeyword: { type: Type.STRING },
            },
            required: ['name', 'description', 'lat', 'lng', 'cuisine', 'imageKeyword'],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error('No response from Gemini');

    const rawRestaurants = JSON.parse(text);
    
    return rawRestaurants.map((r: any, index: number) => ({
      id: `rest-${Date.now()}-${index}`,
      name: r.name,
      description: r.description,
      lat: r.lat,
      lng: r.lng,
      cuisine: r.cuisine,
      imageUrl: `https://picsum.photos/seed/${encodeURIComponent(r.imageKeyword + Date.now())}/800/600`,
    }));
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    // Fallback data if API fails
    return [
      {
        id: 'fallback-1',
        name: 'Local Cafe',
        description: 'A cozy place for coffee and pastries.',
        lat: location.lat + 0.001,
        lng: location.lng + 0.001,
        cuisine: 'Cafe',
        imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
      },
      {
        id: 'fallback-2',
        name: 'Bistro Downtown',
        description: 'Great lunch specials and relaxed atmosphere.',
        lat: location.lat - 0.002,
        lng: location.lng + 0.001,
        cuisine: 'Bistro',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      }
    ];
  }
};
