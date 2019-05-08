import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineageDetailComponent } from './lineage-detail.component';

describe('LineageDetailComponent', () => {
  let component: LineageDetailComponent;
  let fixture: ComponentFixture<LineageDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LineageDetailComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineageDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
