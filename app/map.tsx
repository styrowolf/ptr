import {StyleSheet, View, Image, Text} from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { useRef } from 'react';

// Will be null for most users (only Mapbox authenticates this way).
// Required on Android. See Android installation notes.
MapLibreGL.setAccessToken(null);

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  map: {
    flex: 1,
    alignSelf: 'stretch',
  },
});

const ANNOTATION_SIZE = 45;

const stylesAnnotation = StyleSheet.create({
  annotationContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: ANNOTATION_SIZE / 2,
    borderWidth: StyleSheet.hairlineWidth,
    height: ANNOTATION_SIZE,
    justifyContent: 'center',
    overflow: 'hidden',
    width: ANNOTATION_SIZE,
  },
});

export default function Index() {
  const mapRef = useRef<MapLibreGL.MapViewRef | null>();
  const annotationRef = useRef<MapLibreGL.PointAnnotationRef | null>();
  const coordinate = [-122.4194, 37.7749];

  return (
    <View style={styles.page}>
      <MapLibreGL.MapView
        style={styles.map}
        logoEnabled={true}
        styleURL="https://demotiles.maplibre.org/style.json"
        ref={(r) => (mapRef.current = r)}
      >
        <MapLibreGL.Camera
          defaultSettings={{
            centerCoordinate: [-122.4194, 37.7749],
            zoomLevel: 0,
          }}
        />
        <MapLibreGL.MarkerView coordinate={coordinate}>
          <View>
            <Text>Test</Text>
          </View>
        </MapLibreGL.MarkerView>
      </MapLibreGL.MapView>
    </View>
  );
}