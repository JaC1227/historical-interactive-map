import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Fill, Stroke, Style, Text } from 'ol/style';
import { transform } from 'ol/proj';
import CircleStyle from 'ol/style/Circle';
import Overlay from 'ol/Overlay';
import Select from 'ol/interaction/Select';

let mapVectorLayer, labelVectorLayer, eventVectorLayer, overlay; // Declare layers and overlay

// Initialize map
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// Helper function to convert HEX to RGBA
function hexToRGBA(hex, opacity) {
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Function to load and display GeoJSON data
window.loadMapData = function (geojsonFile, yearLabel) {
  // Save current map center and zoom level
  const currentCenter = map.getView().getCenter();
  const currentZoom = map.getView().getZoom();
  
  fetch(geojsonFile)
    .then((response) => response.json())
    .then((data) => {
      const geojson = new GeoJSON();
      const features = geojson.readFeatures(data);

      // Reproject features from EPSG:4326 to EPSG:3857
      features.forEach((feature) => {
        const geom = feature.getGeometry();
        geom.transform('EPSG:4326', 'EPSG:3857');
      });

      const vectorSource = new VectorSource({ features });

      if (mapVectorLayer) map.removeLayer(mapVectorLayer);
      if (labelVectorLayer) map.removeLayer(labelVectorLayer);

      mapVectorLayer = new VectorLayer({
        source: vectorSource,
        style: (feature) => {
          let fillColor = feature.get('fill')
            ? hexToRGBA(feature.get('fill'), feature.get('fill-opacity') || 0.5)
            : 'rgba(133, 133, 133, 0.5)';

          let strokeColor = feature.get('stroke')
            ? hexToRGBA(feature.get('stroke'), feature.get('stroke-opacity') || 0.2)
            : 'rgba(133, 133, 133, 0.3)';

          return new Style({
            fill: new Fill({ color: fillColor }),
            stroke: new Stroke({ color: strokeColor, width: feature.get('lineWidth') || 10 }),
          });
        },
      });

      labelVectorLayer = new VectorLayer({
        source: vectorSource,
        declutter: true,
        style: (feature) => new Style({
          text: new Text({
            text: feature.get('NAME') || '',
            font: 'bold 16px sans-serif',
            fill: new Fill({ color: '#000000' }),
            stroke: new Stroke({ color: '#ffffff', width: 2 }),
            offsetX: 5,
            offsetY: -10,
          }),
        }),
        zIndex: 999,
      });

      map.addLayer(mapVectorLayer);
      map.addLayer(labelVectorLayer);

      // Fit map to extent of features
      const extent = vectorSource.getExtent();
      map.getView().fit(extent, { padding: [50, 50, 50, 50] });

      // Restore previous center and zoom level
      map.getView().setCenter(currentCenter);
      map.getView().setZoom(currentZoom);

      // Load event markers
      const eventFeatures = features.filter(f => f.get('event')); // Only features with 'event' property

      const eventSource = new VectorSource({ features: eventFeatures });

      if (eventVectorLayer) map.removeLayer(eventVectorLayer);

      eventVectorLayer = new VectorLayer({
        source: eventSource,
        style: new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({ color: 'red' }),
            stroke: new Stroke({ color: 'black', width: 1 }),
          }),
        }),
      });

      map.addLayer(eventVectorLayer);

      // Create popup overlay
      if (overlay) map.removeOverlay(overlay);

      const container = document.createElement('div');
      container.className = 'ol-popup';
      const content = document.createElement('div');
      container.appendChild(content);
      const closer = document.createElement('a');
      closer.href = '#';
      closer.className = 'ol-popup-closer';
      container.appendChild(closer);

      overlay = new Overlay({
        element: container,
        autoPan: true,
        autoPanAnimation: { duration: 250 },
      });

      map.addOverlay(overlay);

      closer.onclick = function () {
        overlay.setPosition(undefined);
        closer.blur();
        return false;
      };

      // Add click interaction for event markers
      const select = new Select({
        filter: (feature, layer) => layer === eventVectorLayer,
      });
      
      map.addInteraction(select);

      select.on('select', function (e) {
        const selectedFeature = e.selected[0];
        if (selectedFeature) {
          const coordinates = selectedFeature.getGeometry().getCoordinates();
          const event = selectedFeature.get('event');
          const description = selectedFeature.get('description');

          content.innerHTML = `<strong>${event}</strong><p>${description}</p>`;
          overlay.setPosition(coordinates);
        } else {
          overlay.setPosition(undefined);
        }
      });

      // Update year label
      document.getElementById('map-label').textContent = yearLabel;
    })
    .catch((error) => {
      console.error('Error loading GeoJSON:', error);
    });
};

// Load the default map data on page load
loadMapData('200ad.geojson', '200 AD');
