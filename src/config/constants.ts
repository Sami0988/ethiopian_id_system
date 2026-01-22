export const APP_CONSTANTS = {
  API_VERSION: 'v1',
  API_PREFIX: 'api/v1',

  // Rate limiting
  RATE_LIMIT_TTL: 60,
  RATE_LIMIT_MAX: 100,

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // File uploads
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],

  // QR Code
  QR_CODE_DEFAULT_SIZE: 300,
  QR_CODE_MAX_SIZE: 1000,

  // Cache TTL (seconds)
  CACHE_TTL: {
    SHORT: 60,
    MEDIUM: 300,
    LONG: 3600,
  },
} as const;
