import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Fill, Stroke, Style, Text } from 'ol/style';
import { transform } from 'ol/proj'; // Import transform function for projections

// Initialize map
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

// Load GeoJSON data
fetch('200ad.geojson')
  .then((response) => response.json())
  .then((data) => {
    console.log('GeoJSON data loaded:', data);
    const geojson = new GeoJSON();
    const features = geojson.readFeatures(data);

    // Reproject features from EPSG:4326 to EPSG:3857
    features.forEach((feature) => {
      const geom = feature.getGeometry();
      geom.transform('EPSG:4326', 'EPSG:3857');
    });

    const vectorSource = new VectorSource({
      features: features,
    });

    // Helper function to convert HEX to RGBA
    function hexToRGBA(hex, opacity) {
      let r = parseInt(hex.substring(1, 3), 16);
      let g = parseInt(hex.substring(3, 5), 16);
      let b = parseInt(hex.substring(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    const mapVectorLayer = new VectorLayer({
      source: vectorSource,
      style: function (feature) {
        let fillColor = feature.get('fill') 
          ? hexToRGBA(feature.get('fill'), feature.get('fill-opacity') || 0.5) 
          : 'rgba(133, 133, 133, 0.5)'; // Default grey

        let strokeColor = feature.get('stroke') 
          ? hexToRGBA(feature.get('stroke'), feature.get('stroke-opacity') || 0.2) 
          : 'rgba(133, 133, 133, 0.3)'; // Default grey

        return new Style({
          fill: new Fill({
            color: fillColor,
          }),
          stroke: new Stroke({
            color: strokeColor,
            width: feature.get('lineWidth') || 10,
          }),
        });
      },
    });

    // Ensure label layer appears on top
    const labelVectorLayer = new VectorLayer({
      source: vectorSource,
      declutter: true, 
      style: function (feature) {
        return new Style({
          text: new Text({
            text: feature.get('NAME') || '',
            font: 'bold 16px sans-serif',
            fill: new Fill({
              color: '#000000',
            }),
            stroke: new Stroke({
              color: '#ffffff', 
              width: 2, 
            }),
            offsetX: 5,
            offsetY: -10,
          }),
        });
      },
      zIndex: 999, // Ensure this layer is on top
    });

    map.addLayer(mapVectorLayer);
    map.addLayer(labelVectorLayer);


    // Fit map to extent of features
    const extent = vectorSource.getExtent();
    map.getView().fit(extent, { padding: [50, 50, 50, 50] });
  })
  .catch((error) => {
    console.error('Error loading GeoJSON:', error);
  });
