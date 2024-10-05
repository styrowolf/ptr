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
import { ToplasAPICache, ToplasPreferences } from "../storage";
import {
  getBounds,
  getPadding,
  MAP_PADDING,
  MAX_ZOOM,
  selectClosestFeature,
  stopLayerStyle,
} from "../utils";
import * as turf from "@turf/turf";
import { ToplasDataProvider } from "../provider";
import { useTranslation } from "react-i18next";

// Will be null for most users (only Mapbox authenticates this way).
// Required on Android. See Android installation notes.
MapLibreGL.setAccessToken(null);

const MAP_BOUNDS = { ne: [27.970848, 40.737673], sw: [29.958805, 41.671] };

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

export default function BusPage() {
  const { t } = useTranslation([], { keyPrefix: "bus" });
  const { vehicleDoorNo, lineCode, routeCode } = useLocalSearchParams();

  const [lineInfo, setLineInfo] = useState<ToplasApi.LineInfo | null>(
    ToplasAPICache.getLineInfo(lineCode as string),
  );

  const routeStops =
    lineInfo?.routes.find((e) => e.routeCode == routeCode)?.stops ?? [];

  const mapRef = useRef<MapLibreGL.MapViewRef | null>();
  const cameraRef = useRef<MapLibreGL.CameraRef | null>();
  const [bus, setBus] = useState<ToplasApi.LiveBusIndividual | null>(null);

  const bounds = getBounds(routeStops);
  const [lastTappedStopIndex, setLastTappedStopIndex] = useState<number | null>(
    null,
  );
  const geojson = useMemo(() => makeGeojson(routeStops), [routeStops]);

  useEffect(() => {
    if (!lineInfo) {
      const lineInfo = ToplasDataProvider.getLineInfo(lineCode as string);

      lineInfo.then((val) => {
        ToplasAPICache.setLineInfo(lineCode as string, val);
        setLineInfo(val);
      });
    }
    function getLiveData() {
      const bus = ToplasDataProvider.getLiveBusByVehicleDoorNo(
        vehicleDoorNo as string,
      );
      bus.then((val) => {
        setBus(val);
      });
    }

    getLiveData();

    const id = setInterval(getLiveData, 20000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (bus) {
      cameraRef.current?.setCamera({
        zoomLevel: 14,
        centerCoordinate: [bus.lastLocation.x, bus.lastLocation.y],
        animationDuration: 1000,
      });
    }
  }, [bus]);

  return (
    <View style={styles.page}>
      <Stack.Screen
        options={{
          title: `${t("bus")} ${vehicleDoorNo}`,
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
          ref={(r) => (cameraRef.current = r)}
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
          .filter((e, i) => lastTappedStopIndex == i)
          .map((e, i) => {
            return (
              <StopMarker
                onPress={() => setLastTappedStopIndex(null)}
                key={`${e.stopCode}-${i}`}
                stop={e}
              />
            );
          })}
        {bus && <BusMarker bus={bus} />}
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

function BusMarker({ bus }: { bus: ToplasApi.LiveBusIndividual }) {
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
