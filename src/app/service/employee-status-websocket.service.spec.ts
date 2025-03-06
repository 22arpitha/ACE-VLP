import { TestBed } from '@angular/core/testing';

import { EmployeeStatusWebsocketService } from './employee-status-websocket.service';

describe('EmployeeStatusWebsocketService', () => {
  let service: EmployeeStatusWebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeStatusWebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
