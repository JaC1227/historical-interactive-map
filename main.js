import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Fill, Stroke, Style, Text } from 'ol/style';
import { transform } from 'ol/proj'; // Import the transform function for projections

// Initialize the map
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(), // OpenStreetMap base layer
    }),
  ],
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// Load the GeoJSON data
fetch('borders_117AD.geojson')
  .then((response) => response.json())
  .then((data) => {
    console.log('GeoJSON data loaded:', data);
    const geojson = new GeoJSON();
    const features = geojson.readFeatures(data);

    // Reproject the features from EPSG:4326 to EPSG:3857
    features.forEach((feature) => {
      const geom = feature.getGeometry();
      geom.transform('EPSG:4326', 'EPSG:3857');
    });

    const vectorSource = new VectorSource({
      features: features,
    });

    // Layer for blurred borders
    const blurredVectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.2)', // More transparent for smooth fading effect
        }),
        stroke: new Stroke({
          color: 'rgba(255, 0, 0, 0.5)',
          width: 5, 
        }),
      }),
    });

    // Apply blur effect only to this layer
    blurredVectorLayer.on('prerender', function (event) {
      event.context.save();
      event.context.filter = 'blur(4px)';
    });
    blurredVectorLayer.on('postrender', function (event) {
      event.context.filter = 'none';
      event.context.restore();
    });

    // Separate layer for text labels (without blur)
    const labelVectorLayer = new VectorLayer({
      source: vectorSource,
      style: function (feature) {
        return new Style({
          text: new Text({
            text: feature.get('name') || '',
            font: '14px sans-serif',
            fill: new Fill({
              color: '#000000',
            }),
            stroke: new Stroke({
              color: '#ffffff',
              width: 3,
            }),
            offsetX: 5,
            offsetY: -10,
          }),
        });
      },
    });

    // Add both layers to the map
    map.addLayer(blurredVectorLayer);
    map.addLayer(labelVectorLayer);

    // Fit the map to the extent of the features
    const extent = vectorSource.getExtent();
    map.getView().fit(extent, { padding: [50, 50, 50, 50] });
  })
  .catch((error) => {
    console.error('Error loading GeoJSON:', error);
  });
