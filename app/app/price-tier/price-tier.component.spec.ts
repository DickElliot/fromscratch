import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceTierComponent } from './price-tier.component';

describe('PriceTierComponent', () => {
  let component: PriceTierComponent;
  let fixture: ComponentFixture<PriceTierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PriceTierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceTierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
