import { TestBed } from '@angular/core/testing';

import { WfhHolidaysService } from './wfh-holidays.service';

describe('WfhHolidaysService', () => {
  let service: WfhHolidaysService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WfhHolidaysService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
