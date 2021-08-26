import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Options, ChangeContext, PointerType } from '@angular-slider/ngx-slider';
import { debounceTime, take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-multi-slider',
  templateUrl: './multi-slider.component.html',
  styleUrls: ['./multi-slider.component.css']
})

export class MultiSliderComponent implements OnInit {
  @Input() range: number[];
  @Output() rangeChange = new EventEmitter<number[]>();
  currentRange: number[];
  minValue: number;
  maxValue: number;
  options: Options = {
    step: 1,
    noSwitching: true,
    translate: (value: number): string => {
      return '$' + value;
    },
  };
  constructor() { }

  ngOnInit(): void {
    this.options.floor = this.range[0];
    this.options.ceil = this.range[1];
    this.currentRange = this.range;
    this.minValue = this.range[0];
    this.maxValue = this.range[1];

  }
  onUserChange(changeContext: ChangeContext) {
    let newRange = [changeContext.value, changeContext.highValue];
    if (newRange !== this.currentRange) {
      this.rangeChange.emit(newRange);
      this.currentRange = newRange;
    }


  }

  onUserChangeEnd(changeContext: ChangeContext): void {
    let newRange = [changeContext.value, changeContext.highValue];
    if (newRange !== this.currentRange) {
      this.rangeChange.emit(newRange);
      this.currentRange = newRange;
    }
  }

}
