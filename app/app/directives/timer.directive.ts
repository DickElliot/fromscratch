// Angular
import { Directive, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
// RxJs
import { Subject, Subscription, timer, of } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';


@Directive({
  selector: '[counter]'
})
export class TimerDirective implements OnChanges, OnDestroy {
  private timerSource = new Subject<any>();
  private subscription = Subscription.EMPTY;
  private interval: number = 1000;
  @Input() status: string;
  @Input() counter: number;
  @Output() value = new EventEmitter<number>();

  constructor() {
    this.subscription = this.timerSource.pipe(
      switchMap(({ count, interval }) =>
        timer(0, interval).pipe(
          take(count),
          tap(() => this.value.emit(--count))
        )
      )
    ).subscribe();

  }

  ngOnChanges() {
    if (this.status == 'paused') {
      this.timerSource.next({ count: this.counter + 1, interval: of() });
    } else if (this.status == 'started') {
      this.timerSource.next({ count: this.counter, interval: this.interval });
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
