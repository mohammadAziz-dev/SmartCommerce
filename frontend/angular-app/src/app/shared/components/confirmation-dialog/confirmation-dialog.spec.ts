import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationDialog } from './confirmation-dialog';

describe('ConfirmationDialog', () => {
  let component: ConfirmationDialog;
  let fixture: ComponentFixture<ConfirmationDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialog);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('title', 'Deactivate product?');
    fixture.componentRef.setInput(
      'message',
      'Are you sure you want to deactivate this product?',
    );

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the provided title and message', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h2')?.textContent).toContain(
      'Deactivate product?',
    );
    expect(element.querySelector('p')?.textContent).toContain(
      'Are you sure you want to deactivate this product?',
    );
  });

  it('should emit cancelled when Cancel is clicked', () => {
    const cancelledSpy = vi.spyOn(component.cancelled, 'emit');
    const cancelButton = fixture.nativeElement.querySelector(
      '.btn-secondary',
    ) as HTMLButtonElement;

    cancelButton.click();

    expect(cancelledSpy).toHaveBeenCalledOnce();
  });

  it('should emit confirmed when Confirm is clicked', () => {
    const confirmedSpy = vi.spyOn(component.confirmed, 'emit');
    const confirmButton = fixture.nativeElement.querySelector(
      '.btn-danger',
    ) as HTMLButtonElement;

    confirmButton.click();

    expect(confirmedSpy).toHaveBeenCalledOnce();
  });
});
