import type { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class TransactionsPage extends BasePage {
  readonly path = '/transactions';

  readonly searchInput = this.page.getByTestId('filter-search');
  readonly accountFilter = this.page.getByTestId('filter-account');
  readonly typeFilter = this.page.getByTestId('filter-type');
  readonly sortByDate = this.page.getByTestId('sort-date');
  readonly sortByAmount = this.page.getByTestId('sort-amount');
  readonly rows = this.page.getByTestId('transaction-row');
  readonly emptyState = this.page.getByTestId('transactions-empty');

  /** Description cell of every visible row, in display order. */
  readonly descriptions: Locator = this.rows.locator('td:nth-child(3)');
  /** Amount cell of every visible row, in display order. */
  readonly amounts: Locator = this.rows.locator('td:nth-child(4)');

  async search(text: string): Promise<void> {
    await this.searchInput.fill(text);
  }

  async filterByAccount(accountId: string): Promise<void> {
    await this.accountFilter.selectOption(accountId);
  }

  async filterByType(type: 'all' | 'credit' | 'debit'): Promise<void> {
    await this.typeFilter.selectOption(type);
  }
}
