import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipePriceComponent } from './recipe-price.component';

describe('RecipePriceComponent', () => {
  let component: RecipePriceComponent;
  let fixture: ComponentFixture<RecipePriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecipePriceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipePriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
