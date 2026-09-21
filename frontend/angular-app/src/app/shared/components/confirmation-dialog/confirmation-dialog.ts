import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirmation-dialog',
  imports: [],
  templateUrl: './confirmation-dialog.html',
  styleUrl: './confirmation-dialog.scss',
})
export class ConfirmationDialog {
  readonly title = input.required<string>();
  readonly message = input.required<string>();

  readonly confirmText = input('Confirm');
  readonly cancelText = input('Cancel');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
