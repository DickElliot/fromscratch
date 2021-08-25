// Angular
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
//RxJs
import { debounceTime } from 'rxjs/operators';
// Classes
import { Recipe } from '../../classes/IRecipe';
// Services
import { RecipeService } from '../../services/recipe.service';
import { UtilitiesService } from '../../services/utilities.service';

@Component({
  selector: 'app-recipe-skeleton',
  templateUrl: './recipe-skeleton.component.html',
  styleUrls: ['./recipe-skeleton.component.css']
})
/**
 * The is the main component to display a a recipe,
 * it is 'fleshed out', by recipe- components.
 */
export class RecipeSkeletonComponent implements OnInit {
  recipe: Recipe;
  method: string[];
  recipeDetailsFormGroup: FormGroup;
  cooktime: string;
  preptime: string;
  titleFromRoute: string = '';
  isSelected: boolean;
  private hideProducts: boolean = true;

  constructor(
    // private route: ActivatedRoute,
    private recipeService: RecipeService,
    public formBuilder: FormBuilder,
    private UtilitiesService: UtilitiesService,
    private router: Router,
  ) {
    this.recipeDetailsFormGroup = formBuilder.group({
      servingsize: [],
    });
    this.isSelected = false;
  }

  ngOnInit(): void {
    document.body.classList.add('recipeBackground');
    this.recipeService.currentRecipe.subscribe((recipe: Recipe) => { this.recipe = recipe });
    this.recipeService.downloadRecipeMethod(this.recipe.title).subscribe((method: string[]) => this.recipe.method = method);
    /** This sets the single recipes serving size, allowing for view change of serving */
    this.recipeDetailsFormGroup.valueChanges.pipe(debounceTime(250)).subscribe((values: any) => {
      if (values['servingsize'] != this.recipe.servingSize && values['servingsize'] > 0) {
        console.log(`serving size changed old: ${this.recipe.servingSize} | new: ${values['servingsize']}`);
        this.recipe = this.recipeService.setServingSizeRecipe(Number(values['servingsize']), this.recipe);
        this.recipeService.setCurrentRecipe(this.recipe);
      }
    });
    this.UtilitiesService.setHeaderText(this.recipe.title);
  }

  toggleSelected(id: string) {
    let classList = document.getElementById(id).classList;
    if (classList.contains('selected')) {
      classList.remove('selected');
    } else classList.add('selected');
  }
  /** 
   * Checks or downloads for corresponding image. 
   * @return string the path to the image. 
   */
  getRecipeImageUrl(): string {
    return this.UtilitiesService.getRecipeImage(this.recipe.title);
  }

  toggleHide(id: string) {
    if (this.hideProducts) {
      document.getElementById(id).classList.add('min');
    } else { document.getElementById(id).classList.remove('min'); }
    this.hideProducts = !this.hideProducts;
  }

  getSentences(paragraph: string): string[] {
    let sentences = paragraph.split('.');
    for (let i = 0; i < sentences.length - 1; i++) {
      sentences[i] = sentences[i] + '.';
    }
    return sentences;
  }

  /**
   * Shortcut to return to dashboard
   */
  goTo(location: string) {
    this.UtilitiesService.setHeaderText('from scratch');
    this.router.navigate([`/${location}`], { skipLocationChange: true });
  }
}
