import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BusinessContextService} from '../../../core/services/business-context.service';
import {BusinessContextHeader} from './business-context-header';

describe('BusinessContextHeader', () => {
  let fixture: ComponentFixture<BusinessContextHeader>;
  let businessContext: BusinessContextService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessContextHeader],
    }).compileComponents();

    businessContext = TestBed.inject(BusinessContextService);
    fixture = TestBed.createComponent(BusinessContextHeader);
  });

  it('should hide the header when no business is selected', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });

  it('should display the selected business name', () => {
    businessContext.selectBusiness({
      id: 'business-123',
      name: 'SmartOffice Store',
    });

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('SmartOffice Store');
  });

  it('should update the name when the business changes', () => {
    businessContext.selectBusiness({
      id: 'business-123',
      name: 'SmartOffice Store',
    });

    fixture.detectChanges();

    businessContext.selectBusiness({
      id: 'business-456',
      name: 'Demo Store',
    });

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Demo Store');
    expect(fixture.nativeElement.textContent).not.toContain('SmartOffice Store');
  });
});
