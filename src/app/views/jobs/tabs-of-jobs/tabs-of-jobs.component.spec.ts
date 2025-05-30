import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsOfJobsComponent } from './tabs-of-jobs.component';

describe('TabsOfJobsComponent', () => {
  let component: TabsOfJobsComponent;
  let fixture: ComponentFixture<TabsOfJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabsOfJobsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabsOfJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
