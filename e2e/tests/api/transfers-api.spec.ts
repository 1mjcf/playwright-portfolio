import { test, expect } from '../../fixtures/test';
import { SEED_ACCOUNTS } from '../../helpers/testData';

const { checking, savings, travel } = SEED_ACCOUNTS;

test.describe('Accounts & Transfers API', () => {
  test('GET /api/accounts returns the seeded portfolio', { tag: '@smoke' }, async ({ api }) => {
    const response = await api.get('/api/accounts');

    expect(response.status()).toBe(200);
    const accounts = await response.json();
    expect(accounts).toHaveLength(3);
    expect(accounts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: checking.id, name: checking.name, balance: checking.balance, currency: 'AUD' }),
        expect.objectContaining({ id: savings.id, name: savings.name, balance: savings.balance, currency: 'AUD' }),
        expect.objectContaining({ id: travel.id, name: travel.name, balance: travel.balance, currency: 'AUD' }),
      ]),
    );
  });

  test('POST /api/transfers moves funds and returns updated balances', async ({ api }) => {
    const response = await api.post('/api/transfers', {
      data: { fromAccountId: checking.id, toAccountId: savings.id, amount: 250.75, description: 'API transfer' },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.transfer).toMatchObject({ fromAccountId: checking.id, toAccountId: savings.id, amount: 250.75 });

    const updated = Object.fromEntries(body.accounts.map((a: { id: string; balance: number }) => [a.id, a.balance]));
    expect(updated[checking.id]).toBeCloseTo(checking.balance - 250.75, 2);
    expect(updated[savings.id]).toBeCloseTo(savings.balance + 250.75, 2);
  });

  test('rejects a transfer with insufficient funds and leaves balances untouched', async ({ api }) => {
    const response = await api.post('/api/transfers', {
      data: { fromAccountId: travel.id, toAccountId: checking.id, amount: 999999 },
    });

    expect(response.status()).toBe(422);
    expect(await response.json()).toEqual({ error: 'Insufficient funds' });

    const accounts = await (await api.get('/api/accounts')).json();
    const travelAccount = accounts.find((a: { id: string }) => a.id === travel.id);
    expect(travelAccount.balance).toBe(travel.balance);
  });

  test.describe('input validation', () => {
    for (const amount of [0, -50, 'abc'] as const) {
      test(`rejects invalid amount: ${JSON.stringify(amount)}`, async ({ api }) => {
        const response = await api.post('/api/transfers', {
          data: { fromAccountId: checking.id, toAccountId: savings.id, amount },
        });

        expect(response.status()).toBe(422);
        expect(await response.json()).toEqual({ error: 'Amount must be greater than zero' });
      });
    }

    test('rejects an unknown account with 404', async ({ api }) => {
      const response = await api.post('/api/transfers', {
        data: { fromAccountId: 'acc-nope', toAccountId: savings.id, amount: 10 },
      });

      expect(response.status()).toBe(404);
    });
  });

  test('rejects unauthenticated requests with 401', async ({ request }) => {
    const response = await request.get('/api/accounts');
    expect(response.status()).toBe(401);
  });
});
