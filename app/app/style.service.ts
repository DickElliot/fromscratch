import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StyleService {
  baseColour;
  highLightColour;
  outLineColour;
  colourLength;
  colours;
  constructor(
  ) {
    this.initialTheme();
    }
  
  initialTheme(){
  this.colours = [
    this.baseColour = '#ff19045b',
    this.highLightColour =  'rgb(153, 4, 4)',
    this.outLineColour = 'black',
  ];
  this.colourLength = this.colours.length;    
  }
  
  getBaseColour(): string {
  return this.baseColour
  }
  getHighLightColour(): string {
  return this.highLightColour}
  getOutlineColour(): string {
  return this.outLineColour}
}
