import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeProductsComponent } from './recipe-products.component';

describe('RecipeProductsComponent', () => {
  let component: RecipeProductsComponent;
  let fixture: ComponentFixture<RecipeProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecipeProductsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
