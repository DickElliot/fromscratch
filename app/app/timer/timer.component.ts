import { Component, Input, OnInit } from '@angular/core';
import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';
import { Subject, Observable } from 'rxjs';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css']
})
/**
 * Generate timers for a recipe parsed from
 * the recipe's method. Will also allow user to create new timers.
 */
export class TimerComponent implements OnInit {
  @Input() recipe: Recipe;
  method: string[];
  times: number[] = [];
  currentTimes: number[] = [];
  status: string[] = [];
  originalTimes: number[] = [];
  constructor(private recipeService: RecipeService) { }

  ngOnInit(): void {
    this.recipeService.downloadRecipeMethod(this.recipe.title).toPromise().then((method) => {
      this.method = method;
      this.findTimers();
    });
  }

  intoTime(index: number, event: number) {
    this.currentTimes[index] = event;
  }
  findTimers() {
    let times: string[] = [];
    let timePattern: RegExp = /[\d]+ min|mins/gi;
    times = this.method.toLocaleString().match(timePattern);
    times.forEach((time) => {
      this.status.push('paused');
      this.times.push((Number(time.match(/[\d]+/)[0])) * 60);
    });
    this.originalTimes = this.times.slice();
  }

  pause(index: number) {
    this.status[index] = 'paused';
    this.times[index] = this.currentTimes[index];
  }

  start(index: number) {
    this.status[index] = 'started';
  }

  reset(index: number) {
    this.status[index] = 'paused';
    this.times[index] = this.originalTimes[index];
  }

}
