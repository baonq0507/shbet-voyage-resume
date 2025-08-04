// Game Provider Configuration
export const GAME_PROVIDERS = {
  // Các GPID ngẫu nhiên cho testing
  PROVIDER_1: 3,
  PROVIDER_2: 7,
  PROVIDER_3: 12,
  PROVIDER_4: 18,
  PROVIDER_5: 25,
  PROVIDER_6: 31,
  PROVIDER_7: 42,
  PROVIDER_8: 56,
  PROVIDER_9: 67,
  PROVIDER_10: 89,
} as const;

// Default GPID cho từng category
export const CATEGORY_GPID_MAP = {
  'all': GAME_PROVIDERS.PROVIDER_1,
  'live-casino': GAME_PROVIDERS.PROVIDER_2,
  'slots': GAME_PROVIDERS.PROVIDER_3,
  'sports': GAME_PROVIDERS.PROVIDER_4,
  'card-games': GAME_PROVIDERS.PROVIDER_5,
  'fishing': GAME_PROVIDERS.PROVIDER_6,
} as const;

// GPID cho các trang cụ thể
export const PAGE_GPID_CONFIG = {
  HOME: GAME_PROVIDERS.PROVIDER_1,     // Trang chủ
  CASINO: GAME_PROVIDERS.PROVIDER_2,   // Trang Casino
  SLOTS: GAME_PROVIDERS.PROVIDER_3,    // Trang Slots
  SPORTS: GAME_PROVIDERS.PROVIDER_4,   // Trang Thể thao
  BANCA: GAME_PROVIDERS.PROVIDER_5,    // Trang Bắn cá
  DAGA: GAME_PROVIDERS.PROVIDER_6,     // Trang Đá gà
  NOHU: GAME_PROVIDERS.PROVIDER_7,     // Trang Nổ hũ
  GAMEBAI: GAME_PROVIDERS.PROVIDER_8,  // Trang Game bài
} as const;

// Function để get random GPID
export const getRandomGPID = (): number => {
  const providers = Object.values(GAME_PROVIDERS);
  return providers[Math.floor(Math.random() * providers.length)];
};

// Function để get GPID theo category
export const getGPIDByCategory = (category: string): number => {
  return CATEGORY_GPID_MAP[category as keyof typeof CATEGORY_GPID_MAP] || GAME_PROVIDERS.PROVIDER_1;
};