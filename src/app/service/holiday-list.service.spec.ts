import { TestBed } from '@angular/core/testing';

import { HolidayListService } from './holiday-list.service';

describe('HolidayListService', () => {
  let service: HolidayListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HolidayListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
