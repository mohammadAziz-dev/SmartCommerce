import {TestBed} from '@angular/core/testing';

import {BusinessContextService} from './business-context.service';
import {Business} from '../../models/business.model';

describe('BusinessContextService', () => {
  let service: BusinessContextService;

  const firstBusiness: Business = {
    id: 'business-123',
    name: 'SmartOffice Store',
  };

  const secondBusiness: Business = {
    id: 'business-456',
    name: 'Aziz Electronics',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});

    service = TestBed.inject(BusinessContextService);
  });

  it('should start without a selected business', () => {
    expect(service.selectedBusiness()).toBeNull();
    expect(service.businessId()).toBeNull();
  });

  it('should select a business', () => {
    service.selectBusiness(firstBusiness);

    expect(service.selectedBusiness()).toEqual(firstBusiness);
    expect(service.businessId()).toBe(firstBusiness.id);
  });

  it('should update the selection when switching businesses', () => {
    service.selectBusiness(firstBusiness);
    service.selectBusiness(secondBusiness);

    expect(service.selectedBusiness()).toEqual(secondBusiness);
    expect(service.businessId()).toBe(secondBusiness.id);
  });

  it('should clear the selected business', () => {
    service.selectBusiness(firstBusiness);
    service.clearBusiness();

    expect(service.selectedBusiness()).toBeNull();
    expect(service.businessId()).toBeNull();
  });
});
