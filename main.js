import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Fill, Stroke, Style, Text } from 'ol/style';
import { transform } from 'ol/proj';  // Import the transform function for projections

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

// Function to style the GeoJSON features
const styleFunction = function (feature) {
  return new Style({
    fill: new Fill({
      color: 'rgba(255, 0, 0, 0.5)' // Semi-transparent red fill
    }),
    stroke: new Stroke({
      color: '#ff0000', // Red outline
      width: 2
    }),
    text: new Text({
      text: feature.get('name') || '', // Use 'name' property for labels
      font: '12px sans-serif',
      fill: new Fill({
        color: '#000000', // Black text color
      }),
      stroke: new Stroke({
        color: '#ffffff', // White stroke for text
        width: 2
      }),
      offsetX: 5, // Horizontal offset for text positioning
      offsetY: -10, // Vertical offset for text positioning
    }),
  });
};

// Load the GeoJSON data
fetch('borders_117AD.geojson')
  .then((response) => response.json())
  .then((data) => {
    console.log('GeoJSON data loaded:', data);

    const geojson = new GeoJSON();
    const features = geojson.readFeatures(data);

    // Reproject the GeoJSON coordinates from EPSG:4326 (WGS 84) to EPSG:3857 (Web Mercator)
    features.forEach((feature) => {
      const geom = feature.getGeometry();
      geom.transform('EPSG:4326', 'EPSG:3857'); // Reproject to Web Mercator
    });

    const vectorSource = new VectorSource({
      features: features, // Parsed and reprojected GeoJSON data
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: styleFunction, // Apply style to the features
    });

    map.addLayer(vectorLayer);

    // Fit the map to the extent of the features in the GeoJSON
    const extent = vectorSource.getExtent();
    map.getView().fit(extent, { padding: [50, 50, 50, 50] }); // Adds padding around the map
  })
  .catch((error) => {
    console.error('Error loading GeoJSON:', error);
  });
