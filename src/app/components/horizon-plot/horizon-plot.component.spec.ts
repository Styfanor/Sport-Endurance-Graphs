import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizonPlotComponent } from './horizon-plot.component';

describe('HorizonPlotComponent', () => {
  let component: HorizonPlotComponent;
  let fixture: ComponentFixture<HorizonPlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HorizonPlotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HorizonPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
