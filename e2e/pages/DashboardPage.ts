import type { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly path = '/dashboard';

  readonly heading = this.page.getByRole('heading', { name: 'Accounts' });
  readonly accountCards = this.page.getByTestId('account-card');
  readonly transactionRows = this.page.getByTestId('transaction-row');
  readonly rateRows = this.page.getByTestId('rate-row');
  readonly ratesLoading = this.page.getByTestId('rates-loading');
  readonly ratesError = this.page.getByTestId('rates-error');

  accountCard(name: string): Locator {
    return this.accountCards.filter({ hasText: name });
  }

  balanceOf(name: string): Locator {
    return this.accountCard(name).getByTestId('account-balance');
  }

  rateFor(currency: string): Locator {
    return this.page.locator(`[data-testid="rate-row"][data-currency="${currency}"]`);
  }
}
