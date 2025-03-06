import { TestBed } from '@angular/core/testing';

import { UserAccessWebsocketService } from './user-access-websocket.service';

describe('UserAccessWebsocketService', () => {
  let service: UserAccessWebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserAccessWebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
