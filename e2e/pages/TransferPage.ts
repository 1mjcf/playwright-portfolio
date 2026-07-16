import { BasePage } from './BasePage';

export interface TransferDetails {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
}

export class TransferPage extends BasePage {
  readonly path = '/transfer';

  readonly fromSelect = this.page.getByLabel('From account');
  readonly toSelect = this.page.getByLabel('To account');
  readonly amountInput = this.page.getByLabel('Amount');
  readonly descriptionInput = this.page.getByLabel('Description');
  readonly submitButton = this.page.getByRole('button', { name: 'Send transfer' });
  readonly successMessage = this.page.getByTestId('transfer-success');
  readonly errorMessage = this.page.getByTestId('transfer-error');

  async sendTransfer({ fromAccountId, toAccountId, amount, description }: TransferDetails): Promise<void> {
    await this.fromSelect.selectOption(fromAccountId);
    await this.toSelect.selectOption(toAccountId);
    await this.amountInput.fill(String(amount));
    if (description) await this.descriptionInput.fill(description);
    await this.submitButton.click();
  }
}
