import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsTimeSheetComponent } from './tabs-time-sheet.component';

describe('TabsTimeSheetComponent', () => {
  let component: TabsTimeSheetComponent;
  let fixture: ComponentFixture<TabsTimeSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabsTimeSheetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsTimeSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
