import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupermarketLocationComponent } from './supermarket-location.component';

describe('SupermarketLocationComponent', () => {
  let component: SupermarketLocationComponent;
  let fixture: ComponentFixture<SupermarketLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupermarketLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupermarketLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
