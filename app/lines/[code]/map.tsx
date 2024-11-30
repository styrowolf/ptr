import {
  StyleSheet,
  View,
  Image,
  Text,
  Touchable,
  TouchableOpacity,
  Modal,
} from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { ToplasApi } from "@/sdks/typescript";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { ToplasAPICache, ToplasPreferences } from "@/app/storage";
import {
  getBounds,
  getPadding,
  MAP_PADDING,
  MAX_ZOOM,
  selectClosestFeature,
  stopLayerStyle,
} from "@/app/utils";
import * as turf from "@turf/turf";
import { ToplasDataProvider } from "@/app/provider";

// Will be null for most users (only Mapbox authenticates this way).
// Required on Android. See Android installation notes.
MapLibreGL.setAccessToken(null);

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  map: {
    flex: 1,
    alignSelf: "stretch",
  },
});

function makeGeojson(stops: ToplasApi.LineStop[]) {
  const geojson = turf.featureCollection(
    stops.map((stop, index) => {
      const point = turf.point(
        [stop.coordinates.x, stop.coordinates.y],
        { stopName: stop.stopName, direction: stop.direction, index: index },
        { id: stop.stopCode },
      );
      return point;
    }),
  );
  return geojson;
}

export default function LineMapPage() {
  const { code, routeCode } = useLocalSearchParams();

  const lineInfo: ToplasApi.LineInfo = ToplasAPICache.getLineInfo(
    code as string,
  )!;
  const routeStops = lineInfo.routes.find(
    (e) => e.routeCode == routeCode,
  )!.stops;
  const mapRef = useRef<MapLibreGL.MapViewRef | null>();
  const bounds = getBounds(routeStops);

  const [liveLine, setLiveLine] = useState<ToplasApi.LiveBus[]>(
    ToplasAPICache.getLiveBuses(code as string) ?? [],
  );
  const [lastTappedStopIndex, setLastTappedStopIndex] = useState<number | null>(
    null,
  );
  const geojson = useMemo(() => makeGeojson(routeStops), [routeStops]);

  useEffect(() => {
    function getLiveData() {
      ToplasDataProvider.getLiveBusesOnLine(code as string).then((val) => {
        ToplasAPICache.setLiveBuses(code as string, val);
        setLiveLine(val);
      });
    }

    const id = setInterval(getLiveData, 20000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.page}>
      <Stack.Screen
        options={{
          title: `${code}`,
        }}
      />
      <MapLibreGL.MapView
        style={styles.map}
        logoEnabled={true}
        styleURL={ToplasPreferences.getMapStyleUrl()}
        ref={(r) => (mapRef.current = r)}
      >
        <MapLibreGL.Camera
          maxZoomLevel={MAX_ZOOM}
          defaultSettings={{
            bounds,
            padding: getPadding(MAP_PADDING),
          }}
        />
        <MapLibreGL.UserLocation renderMode="native" />
        <MapLibreGL.ShapeSource
          id="stops"
          shape={geojson}
          hitbox={{ width: 44, height: 44 }}
          onPress={(e) =>
            setLastTappedStopIndex(selectClosestFeature(e).properties?.index)
          }
        >
          <MapLibreGL.CircleLayer
            id="stopCircles"
            sourceID="stops"
            maxZoomLevel={20}
            minZoomLevel={0}
            style={stopLayerStyle}
          />
        </MapLibreGL.ShapeSource>

        {routeStops
          .filter((e, i) => i == lastTappedStopIndex)
          .map((e, i) => {
            return (
              <StopMarker
                onPress={() => setLastTappedStopIndex(null)}
                key={`${e.stopCode}-${i}`}
                stop={e}
              />
            );
          })}
        {liveLine.filter((bus) => bus.routeCode == routeCode).map((e, i) => {
          return <BusMarker key={`${e.vehicleDoorNo}-${i}`} bus={e} />;
        })}
      </MapLibreGL.MapView>
    </View>
  );
}

function StopMarker({
  stop,
  onPress,
}: {
  stop: ToplasApi.LineStop;
  onPress?: () => void;
}) {
  const styles = StyleSheet.create({
    stopCircle: {
      borderWidth: 3,
      borderRadius: 12,
      borderStyle: "solid",
      backgroundColor: "white",
      height: 24,
      width: 24,
      borderColor: "black",
      zIndex: -100,
    },
    stopNameBox: {
      backgroundColor: "white",
      borderWidth: 3,
      padding: 4,
      borderRadius: 12,
      zIndex: -100,
    },
  });

  return (
    <MapLibreGL.MarkerView
      coordinate={[stop.coordinates.x, stop.coordinates.y]}
    >
      <View style={{ flex: 1, flexDirection: "column", alignItems: "center" }}>
        <TouchableOpacity onPress={onPress}>
          <View style={{ height: 10 }}></View>
          <View style={styles.stopNameBox}>
            <Text>{stop.stopName}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </MapLibreGL.MarkerView>
  );
}

function BusMarker({ bus }: { bus: ToplasApi.LiveBus }) {
  const [showText, setShowText] = useState(false);
  const styles = StyleSheet.create({
    view: {
      borderWidth: 3,
      borderRadius: 12,
      width: 32,
      height: 32,
      paddingTop: 5,
      borderStyle: "solid",
      textAlign: "center",
      backgroundColor: "white",
      zIndex: 100,
    },
    stopNameBox: {
      backgroundColor: "white",
      borderWidth: 3,
      padding: 4,
      borderRadius: 12,
      zIndex: -100,
    },
    tc: {
      textAlign: "center",
    },
  });

  return (
    <MapLibreGL.MarkerView
      key={bus.vehicleDoorNo}
      coordinate={[bus.lastLocation.x, bus.lastLocation.y]}
    >
      <TouchableOpacity onPress={() => setShowText(!showText)}>
        <View style={!showText ? styles.view : styles.stopNameBox}>
          <FontAwesome6 name="bus-simple" style={styles.tc} size={16} />
          {showText && (
            <>
              <Text style={styles.tc}>{bus.vehicleDoorNo}</Text>
              <Text>{bus.lastLocationTime}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </MapLibreGL.MarkerView>
  );
}
