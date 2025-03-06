import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsMyTimesheetComponent } from './tabs-my-timesheet.component';

describe('TabsMyTimesheetComponent', () => {
  let component: TabsMyTimesheetComponent;
  let fixture: ComponentFixture<TabsMyTimesheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabsMyTimesheetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsMyTimesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
