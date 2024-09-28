import { Link, router, Stack, useNavigation } from "expo-router";
import { Platform, SafeAreaView, StyleSheet, Text, View } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
import {
  getBounds,
  getPadding,
  MAP_BOUNDS,
  MAP_PADDING,
  MAP_STYLE_URL,
  selectClosestFeature,
  stopLayerStyle,
} from "./utils";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { ToplasApi, ToplasApiClient } from "@/sdks/typescript";
import BottomSheet from "@gorhom/bottom-sheet";
import * as turf from "@turf/turf";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ToplasDataProvider } from "./provider";
import { ToplasPreferences } from "./storage";
import { useTranslation } from "react-i18next";
import appStyles from "./styles";

const styles = StyleSheet.create({
  view: {
    flex: 1,
  },
  map: {
    flex: 1,
    alignSelf: "stretch",
  },
  searchItemView: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    width: "100%",
    borderColor: "black",
    borderWidth: 3,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  selected: {
    opacity: 0.5,
  },
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
  tc: {
    textAlign: "center",
  },
});

function makeGeojson(stops: ToplasApi.NearbyStop[]) {
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

function differentEnough(a: ToplasApi.Coordinates, b: ToplasApi.Coordinates) {
  const aPoint = turf.point([a.x, a.y]);
  const bPoint = turf.point([b.x, b.y]);
  const distance = turf.distance(aPoint, bPoint, { units: "meters" });
  return distance > 50;
}

export default function NearbyStops() {
  const { t } = useTranslation([], { keyPrefix: "nearbyStops" });
  const mapRef = useRef<MapLibreGL.MapViewRef | null>();
  const userLocationRef = useRef<MapLibreGL.UserLocationRef | null>();
  const cameraRef = useRef<MapLibreGL.CameraRef | null>();
  const [stops, setStops] = useState<ToplasApi.NearbyStop[]>([]);
  const [prevLocation, setPrevLocation] =
    useState<ToplasApi.Coordinates | null>(null);
  const [location, setLocation] = useState<ToplasApi.Coordinates | null>(null);
  const sizes = useRef<number[]>([]);
  const scrollRef = useRef<ScrollView | null>();
  const [lastTappedStopIndex, setLastTappedStopIndex] = useState<number | null>(
    null,
  );
  const safeAreaInsets = useSafeAreaInsets();
  const geojson = useMemo(() => makeGeojson(stops), [stops]);

  useEffect(() => {
    if (lastTappedStopIndex != null) {
      scrollRef.current?.scrollTo({
        y: sizes.current[lastTappedStopIndex],
        animated: true,
      });
    }
  }, [lastTappedStopIndex]);

  useEffect(() => {
    if (
      location &&
      (!prevLocation || differentEnough(location, prevLocation))
    ) {
      ToplasDataProvider.getNearbyStops(location.y, location.x).then((val) => {
        setStops(val.sort((a, b) => a.distance - b.distance));
      });
      cameraRef.current?.setCamera({
        zoomLevel: 13,
        centerCoordinate: [location.x, location.y - 0.005],
        animationDuration: 2000,
      });
      setPrevLocation(location);
    }
  }, [location]);

  return (
    <View style={styles.view}>
      <Stack.Screen options={{ title: t("title") }} />
      <MapLibreGL.MapView
        style={styles.map}
        logoEnabled={true}
        styleURL={MAP_STYLE_URL}
        ref={(r) => (mapRef.current = r)}
      >
        <MapLibreGL.Camera
          ref={(r) => (cameraRef.current = r)}
          maxZoomLevel={15}
          defaultSettings={{
            bounds: location ? undefined : MAP_BOUNDS,
            centerCoordinate: location ? [location.x, location.y] : undefined,
            zoomLevel: 14,
          }}
        />
        <MapLibreGL.UserLocation
          renderMode="native"
          onUpdate={(location) =>
            setLocation({
              x: location.coords.longitude,
              y: location.coords.latitude,
            })
          }
          ref={(r) => (userLocationRef.current = r)}
        />

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
        {stops
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
      </MapLibreGL.MapView>
      <BottomSheet snapPoints={[220]}>
        <ScrollView
          style={{
            paddingHorizontal: 10,
            gap: 5,
            paddingVertical: 10,
            flex: 1,
            marginBottom: safeAreaInsets.bottom,
          }}
          ref={(r) => {
            // @ts-ignore
            scrollRef.current = r;
          }}
        >
          {stops.map((e, i) => (
            <View
              onLayout={(e) => sizes.current.push(e.nativeEvent.layout.y)}
              key={`${e.stopCode}-${i}`}
              style={{ paddingBottom: 10 }}
            >
              <SearchItem stop={e} isSelected={lastTappedStopIndex == i} />
            </View>
          ))}
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

function SearchItem({
  stop,
  isSelected,
}: {
  stop: ToplasApi.NearbyStop;
  isSelected?: boolean;
}) {
  const { t } = useTranslation([], { keyPrefix: "nearbyStops" });
  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: "/stops/[code]",
          params: {
            code: stop.stopCode,
            name: stop.stopName,
            direction: stop.direction,
          },
        });
        ToplasPreferences.appendRecentStop(stop);
      }}
    >
      <View
        style={
          isSelected
            ? [styles.selected, styles.searchItemView]
            : styles.searchItemView
        }
      >
        <MaterialCommunityIcons
          name="bus-stop"
          size={36}
          style={{ paddingRight: 10 }}
          color="black"
        />
        <View>
          <Text style={appStyles.t20b}>{stop.stopName}</Text>
          <Text style={appStyles.t16i}>
            {t("direction")}: {stop.direction}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function StopMarker({
  stop,
  onPress,
}: {
  stop: ToplasApi.NearbyStop;
  onPress: () => void;
}) {

  return (
    <MapLibreGL.MarkerView
      coordinate={[stop.coordinates.x, stop.coordinates.y]}
    >
      <View style={{ flex: 1, flexDirection: "column", alignItems: "center" }}>
        <TouchableOpacity onPress={onPress}>
          <View style={{ height: 10 }}></View>
          <View
            style={[
              styles.stopNameBox,
              { flexDirection: "row", alignItems: "center" },
            ]}
          >
            <View>
              <Text style={styles.tc} numberOfLines={1}>
                {stop.stopName}
              </Text>
              <Text style={styles.tc}>({stop.direction})</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </MapLibreGL.MarkerView>
  );
}
