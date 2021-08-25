// Angular
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time'
})

/**
  * Transforms units of time into an easy-to-read readable format 
  * e.g. '220' into '3 hours 40 minutes'
  */
export class TimePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    const hours = Math.floor((value / 60) / 60);
    const minutes = Math.floor(value / 60) % 60;
    const seconds = value % 60;
    if (args == 'recipe') {
      let h = minutes;
      let m = seconds;
      let pipe = '';
      if (h > 0) {
        pipe = `${this.padding(h)}${h}H`;
      }
      if (m > 0) {
        pipe = pipe + `${this.padding(m)}${m}M`;
      }
      return pipe;
    }
    let pipe = `${this.padding(minutes)}${minutes}:${this.padding(seconds)}${seconds}`;
    if (hours > 0) {
      pipe = `${this.padding(hours)}${hours}:` + pipe;
    }
    return pipe;
  }

  private padding(time) {
    return time < 10 ? '0' : '';
  }
}