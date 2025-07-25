import { TestBed } from '@angular/core/testing';

import { DropDownPaginationService } from './drop-down-pagination.service';

describe('DropDownPaginationService', () => {
  let service: DropDownPaginationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DropDownPaginationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
