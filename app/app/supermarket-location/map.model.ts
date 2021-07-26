
import 'ol/ol.css';
import Map from 'ol/Map';
import * as olSize from 'ol/size';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import { Tile, Tile as TileLayer, Vector, Vector as VectorLayer } from 'ol/layer';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import Text from 'ol/style/Text';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { Subject } from 'rxjs';

export class supermarketMap {
  map: Map;
  featureNames: string[];
  superMarketLocationSelection: Subject<string> = new Subject<string>();
  constructor(target: string) {
    this.featureNames = [];
    this.map = new Map({
      target: target,
      layers: [
        new Tile({
          source: new OSM()
        }),
      ],
      view: new View({
        center: fromLonLat([172.83441, -41.50008]),
        zoom: 5
      })
    });
    this.map.on('pointermove', (e) => {
      var pixel = this.map.getEventPixel(e.originalEvent);
      var hit = this.map.hasFeatureAtPixel(pixel);
      this.map.getViewport().style.cursor = hit ? 'pointer' : '';
    });
    this.map.on('click', (evt) => {
      for (let featureName of this.featureNames) {
        if (this.map.forEachFeatureAtPixel(evt.pixel, (feature) => {
          return feature.getProperties().name == featureName;
        })) {
          this.superMarketLocationSelection.next(featureName);
        }
      }
    });
  }

  addSupermarketLocationToMap(supermarketName: string, longitude: number, latitude: number) {
    this.featureNames.push(supermarketName);
    const newFeature = new Feature({
      geometry: new Point(fromLonLat([longitude, latitude])),
      name: supermarketName,
    });

    let labelStyle = new Style({
      text: new Text({
        font: '12px Calibri,sans-serif',
        overflow: true,
        fill: new Fill({
          color: '#000'
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 3
        }),
        offsetY: 16
      }),
      image: new Icon({
        src: 'http://localhost/fromscratch/images/countdown_mini.png',
      })
    });
    const newMarker = new VectorSource({
      features: [newFeature]
    });
    let newMarkerLayer = new Vector({
      source: newMarker,
      style: function (feature) {
        labelStyle.getText().setText(feature.get('name'));
        return labelStyle;
      },
    });
    this.map.addLayer(newMarkerLayer);
  }

}