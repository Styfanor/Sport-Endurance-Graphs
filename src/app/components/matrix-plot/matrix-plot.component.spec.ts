import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixPlotComponent } from './matrix-plot.component';

describe('MatrixPlotComponent', () => {
  let component: MatrixPlotComponent;
  let fixture: ComponentFixture<MatrixPlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatrixPlotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatrixPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
