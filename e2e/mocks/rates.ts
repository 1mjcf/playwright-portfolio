/**
 * Canned responses for the third-party FX provider (`GET /api/rates`).
 * Values are deliberately unrealistic so a passing assertion proves the
 * mock (not the real service) supplied the data.
 */
export const MOCK_RATES = {
  base: 'AUD',
  provider: 'MockFX',
  fetchedAt: '2026-01-01T00:00:00.000Z',
  rates: {
    USD: 0.99,
    EUR: 0.88,
    GBP: 0.77,
  },
};
