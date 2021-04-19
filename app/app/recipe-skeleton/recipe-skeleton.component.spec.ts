import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeSkeletonComponent } from './recipe-skeleton.component';

describe('RecipeSkeletonComponent', () => {
  let component: RecipeSkeletonComponent;
  let fixture: ComponentFixture<RecipeSkeletonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecipeSkeletonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
