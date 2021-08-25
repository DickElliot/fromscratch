import { trigger, style, animate, transition, keyframes } from '@angular/animations';

/**
 * Animation for splash screen while recipes are being imported/generated
 */
export const loadingChange = trigger('loadingChange', [
  transition('* => loop-state', [
    style({
      color: 'white'
    }),
    animate('1000ms ease', keyframes(
      [
        style({
          backgroundImage: 'linear-gradient(90deg,  rgb(0,0,0), rgba(255, 255, 255, 0.9))',
        }),
        style({
          backgroundImage: 'linear-gradient(90deg,  rgb(0,0,0) 20%, rgba(255, 255, 255, 0.9))',
        }),
        style({
          backgroundImage: 'linear-gradient(90deg,  rgb(0,0,0) 50%, rgba(255, 255, 255, 0.9))',
        }),
        style({
          backgroundImage: 'linear-gradient(90deg,  rgb(0,0,0) 70%, rgba(255, 255, 255, 0.9))',
        }),
        style({
          backgroundImage: 'linear-gradient(90deg, rgb(0,0,0), rgb(0,0,0)',
        }),
      ]
    )),
  ]),
])