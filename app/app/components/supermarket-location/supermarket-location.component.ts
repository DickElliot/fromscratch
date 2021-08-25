// Angular
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
// RxJs
import { Observable, of } from 'rxjs';
// OpenLayers
import 'ol/ol.css';
// Classes
import { supermarketMap } from '../../classes/SupermarketMap';
import { IMarket, toTitleCase } from '../../classes/IMarket';
import { ICoordinates } from '../../classes/ICoordinates';
// Services
import { ProductService } from '../../services/product.service';
import { UtilitiesService } from '../../services/utilities.service';


@Component({
  selector: 'app-supermarket-location',
  templateUrl: './supermarket-location.component.html',
  styleUrls: ['./supermarket-location.component.css']
})
/**
 * Displays a map (using OpenLayers), allows a user to choose the supermarket
 * they want to purchase the recipe ingredient products from.
 */
export class SupermarketLocationComponent implements OnInit, AfterViewInit {
  location: string;
  latitude: string;
  longitude: string;
  geoLocation: ICoordinates;
  superMarketLocationSelection: Observable<string>;
  constructor(
    private productService: ProductService,
    private UtilitiesService: UtilitiesService,
    private router: Router) { }
  map: supermarketMap;
  supermarkets: IMarket[] = [];

  ngOnInit(): void {
    this.UtilitiesService.setHeaderText('Choose Store');
  }
  ngAfterViewInit(): void {
    this.map = new supermarketMap('newzealand_map');
    this.productService.downloadSupermarketsDetails().subscribe((res) => {
      res.forEach((market: IMarket) => {
        this.supermarkets.push(market);
      });
      this.addSupermarketLocationsToMap(this.supermarkets);
    });
    this.map.superMarketLocationSelection.subscribe((location) => {
      this.updateSupermarketLocation(location);
    });
  }

  /**
   * Uses the browsers library to get the location of the user
   * so that the nearest supermarket can be chosen
   */
  getGeoLocation() {
    this.productService.getGeoLocation();
    of(this.productService.geoLocation).subscribe((location) => {
      this.geoLocation = location;
      // console.log('User location:', this.geoLocation.latitude, this.geoLocation.longitude);
    });
  }

  findNearestMarket() {
    let shortestDistance = { distance: 'empty', market: 'empty' };
    shortestDistance = this.productService.getNearestSuperMarket(this.geoLocation, this.supermarkets);
    this.updateSupermarketLocation(shortestDistance.market);
  }

  /**
   * Adds pin on to the map that display the available supermarkets.
   * @param markets the supermarkets
   */
  addSupermarketLocationsToMap(markets: IMarket[]) {
    for (let market of markets) {
      this.map.addSupermarketLocationToMap(market.name, Number(market.longitude), Number(market.latitude),);
    }
  }

  /**
   * Displays the supermarket location on the browsers
   * and sends the location to update the recipes
   * @param location supermarket title from map
   */
  updateSupermarketLocation(location: string) {
    let currentSupermarketInterface: IMarket;
    for (let market of this.supermarkets) {
      if (market.name == location) {
        currentSupermarketInterface = market;
      }
    }
    this.latitude = currentSupermarketInterface.latitude;
    this.longitude = currentSupermarketInterface.longitude;
    let chosenHTML = document.getElementById('chosen');
    if (currentSupermarketInterface != null) {
      chosenHTML.innerHTML =
        `${toTitleCase(currentSupermarketInterface.name)}`
    } else {
      chosenHTML.innerHTML =
        `${location}
      address unknown`;
    }
    if (location !== this.location) {
      this.location = location;
    }
  }

  chooseSupermarketLocation() {
    this.location = document.getElementById('chosen').innerHTML.toLowerCase();
    this.UtilitiesService.setHeaderText(`from ${this.location}`);
    this.productService.setCurrentLocation(this.location);
  }

  /**
   * Shortcut to return to dashboard
   */
  goTo(location: string) {
    this.router.navigate([`/${location}`], { skipLocationChange: true });
  }
}
