import { TestBed } from '@angular/core/testing';

import { OrgAuthGuard } from './org-auth.guard';

describe('OrgAuthGuard', () => {
  let guard: OrgAuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(OrgAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
