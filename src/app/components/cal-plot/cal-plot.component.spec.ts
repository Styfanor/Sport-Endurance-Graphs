import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalPlotComponent } from './cal-plot.component';

describe('CalPlotComponent', () => {
  let component: CalPlotComponent;
  let fixture: ComponentFixture<CalPlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalPlotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
