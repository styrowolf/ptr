import {
  StyleSheet,
  View,
  Image,
  Text,
  Touchable,
  TouchableOpacity,
  Modal,
  useWindowDimensions,
  Platform,
} from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { ToplasApi } from "@/sdks/typescript";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Entypo, FontAwesome5, FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
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
import appStyles from "../styles";
import Divider from "../components/divider";
import { ScrollView } from "react-native-gesture-handler";
import BottomSheet from "@gorhom/bottom-sheet";
import { use } from "i18next";
import { set } from "@/sdks/typescript/core/schemas";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Will be null for most users (only Mapbox authenticates this way).
// Required on Android. See Android installation notes.
MapLibreGL.setAccessToken(null);

const MAP_BOUNDS = { ne: [27.970848, 40.737673], sw: [29.958805, 41.671] };
const BUS_PAGE_MAP_DEF_BOUNDS = { ne: [27.970848 + 0.5, 40.737673 + 0.5], sw: [29.958805 - 0.5, 41.671 -0.5] };

const styles = StyleSheet.create({
  page: {
    flex: 1,
    //justifyContent: "center",
    //alignItems: "center",
    //backgroundColor: "#F5FCFF",
  },
  map: {
    //flex: 1,
    alignSelf: "stretch",
    //flexGrow: 1,
  },
  text: {
    padding: 4,
    ...appStyles.t16
  },
  linesTableText: {
    fontSize: 20,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "bold",
  },
  arrivalItem: {
    padding: 4,
    fontSize: 16,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },
  arrivalsHeader: {
    fontSize: 16,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
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
  const { bottom } = useSafeAreaInsets();

  const [lineInfo, setLineInfo] = useState<ToplasApi.LineInfo | null>(
    ToplasAPICache.getLineInfo(lineCode as string),
  );

  const routeStops =
    lineInfo?.routes.find((e) => e.routeCode == routeCode)?.stops ?? [];

  const mapRef = useRef<MapLibreGL.MapViewRef | null>();
  const cameraRef = useRef<MapLibreGL.CameraRef | null>();
  const [isCameraRefSet, setIsCameraRefSet] = useState<boolean>(false);
  const [bus, setBus] = useState<ToplasApi.LiveBusIndividual | null>(null);
  const [vehicleTasks, setVehicleTasks] = useState<ToplasApi.VehicleTask[]>([]);
  const [showVehicleInfo, setShowVehicleInfo] = useState(false);
  const [showVehicleTasks, setShowVehicleTasks] = useState(false);
  const [vehicleInfoNotAvailable, setVehicleInfoNotAvailable] = useState(false);

  const bottomSheetRef = useRef<BottomSheetMethods | null>(null);
  
  const bounds = useMemo(() => {
    if (routeStops.length == 0) {
      return BUS_PAGE_MAP_DEF_BOUNDS;
    } else {
      return getBounds(routeStops);
    }
  }, [routeStops]);

  const [lastTappedStopIndex, setLastTappedStopIndex] = useState<number | null>(
    null,
  );
  const geojson = useMemo(() => makeGeojson(routeStops), [routeStops]);
  const showGeojson = useMemo(() => routeStops.length != 0, [routeStops]);

  useEffect(() => {
    if (!lineInfo && lineCode) {
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
      }).catch((e) => {
        setVehicleInfoNotAvailable(true);
      });
    }

    ToplasDataProvider.getVehicleTasks(vehicleDoorNo as string).then((val) => {
      setVehicleTasks(val);
    }).catch((e) => {});
  
    getLiveData();
    
    const id = setInterval(getLiveData, 20000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (bus && cameraRef.current) {
      cameraRef.current?.setCamera({
        zoomLevel: 14,
        centerCoordinate: [bus.lastLocation.x, bus.lastLocation.y],
        animationDuration: 1000,
      });
    }
  }, [bus, isCameraRefSet]);

  if (vehicleInfoNotAvailable) {
    return (<View style={styles.page}>
      <Stack.Screen
        options={{
          title: `${t("bus")} ${vehicleDoorNo}`,
        }}
      />
      <View style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
          <Text style={styles.text}>{t("busInformationUnavailable")}</Text>
        </View>
      </View>)
  } else if (!lineInfo && !bus) {
    return (<View style={styles.page}>
      <Stack.Screen
        options={{
          title: `${t("bus")} ${vehicleDoorNo}`,
        }}
      />
      <View style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
          <Text style={styles.text}>{t("loading")}</Text>
        </View>
      </View>)
  }

  return (
    <View style={styles.page}>
      <Stack.Screen
        options={{
          title: `${t("bus")} ${vehicleDoorNo}`,
        }}
      />
      <MapLibreGL.MapView
        style={[styles.map, { flex: 1}]}
        logoEnabled={true}
        styleURL={ToplasPreferences.getMapStyleUrl()}
        ref={(r) => (mapRef.current = r)}
        localizeLabels={true}
      >
        <MapLibreGL.Camera
          maxZoomLevel={MAX_ZOOM}
          ref={(r) => { cameraRef.current = r; !isCameraRefSet && setIsCameraRefSet(true); }}
          padding={getPadding(MAP_PADDING)}
          defaultSettings={{
              bounds: bounds,
              zoomLevel: 12,
          }}
        />

        <MapLibreGL.UserLocation renderMode="native" />

        {showGeojson && <MapLibreGL.ShapeSource
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
        </MapLibreGL.ShapeSource>}

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
      <BottomSheet snapPoints={[120 + bottom, 300 + bottom]} ref={(r) => bottomSheetRef.current = r}>
        <View style={{ paddingHorizontal: 10, paddingTop: 10, paddingBottom: bottom }}>
          <TouchableOpacity onPress={() => { onPressVehicleSection(bottomSheetRef.current, showVehicleInfo, setShowVehicleInfo, showVehicleTasks, setShowVehicleTasks) }}><Text style={styles.text}>{t('vehicleInfo')}</Text></TouchableOpacity>
          { showVehicleInfo && <VehicleInfo bus={bus} /> }
          <Divider height={20} />
          <TouchableOpacity onPress={() => { onPressVehicleSection(bottomSheetRef.current, showVehicleTasks, setShowVehicleTasks, showVehicleInfo, setShowVehicleInfo) }}><Text style={styles.text}>{t('vehicleTrips')}</Text></TouchableOpacity>
          { showVehicleTasks && <VehicleTasks tasks={vehicleTasks} /> }
          <Divider height={20} />
        </View>
      </BottomSheet>
    </View>
  );
}

function onPressVehicleSection(ref: BottomSheetMethods | null, self: boolean, setSelf: (b: boolean) => void, other: boolean, setOther: (b: boolean) => void) {
  const nextState = !self;
  if (nextState) {
    setOther(false);
    setSelf(true);
    ref?.expand();
  } else {
    setSelf(false);
    if (!other) {
      ref?.collapse();
    }
  }
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

function VehicleInfo({ bus }: { bus: ToplasApi.LiveBusIndividual | null }) {
  const { t } = useTranslation([], { keyPrefix: "bus" });
  const showSeating = bus?.vehicleInfo.seatingCapacity != 0 
    || bus?.vehicleInfo.fullCapacity != 0;
  return (
    <>
      <Text style={styles.text}>{t("plate")}: {bus?.vehiclePlate}</Text>
      <Text style={styles.text}>{t("model")}: {bus?.vehicleInfo.brandName} {bus?.vehicleInfo.year}</Text>
      {showSeating && (
        <Text style={styles.text}>
          {t("capacity")}: {bus?.vehicleInfo.seatingCapacity} {t("seated")} / {bus!.vehicleInfo.fullCapacity - bus!.vehicleInfo.seatingCapacity} {t("standing")}
        </Text>
      )}
      <Text style={styles.text}>{t("operator")}: {bus?.vehicleInfo.operator}</Text>
      <View style={{ flexDirection: "column" }}>
        {bus?.amenities.wifi && <Text style={styles.text}>{t("wifi")} <FontAwesome5 name="wifi" size={16} /></Text>}
        {bus?.amenities.airConditioning && <Text style={styles.text}>{t("airConditioning")} <Entypo name="air" size={16} /></Text>}
        {bus?.amenities.wheelchairAccessible && <Text style={styles.text}>{t("accessible")} <FontAwesome6 name="wheelchair" size={16} /></Text>}
        {bus?.amenities.bicycle && <Text style={styles.text}>{t("bicycle")} <FontAwesome5 name="bicycle" size={16} /></Text>}
        {bus?.amenities.usb && <Text style={styles.text}>{t("usbCharging")} <FontAwesome5 name="usb" size={16} /></Text>}
      </View>
    </>
  );
}

function VehicleTasks({ tasks }: { tasks: ToplasApi.VehicleTask[] }) {
  const { t } = useTranslation([], { keyPrefix: "bus" });
  if (tasks.length == 0) {
    return <Text style={styles.text}>{t('noTrips')}</Text>;
  }
  return (
    <ScrollView style={{ maxHeight: 80/3 * 5 }}>
      {tasks.map((task, i) => {
        return (
          <View
          key={`${task.routeCode}-${i}`}
          style={{ flexDirection: "row", flex: 1 }}
        >
          <Text style={[{ width: 65 }, styles.linesTableText]}>
            <Link
              push
              onPress={() =>
                ToplasPreferences.appendRecentLine({
                  lineCode: task.lineCode,
                  routeCode: task.routeCode,
                })
              }
              href={{
                pathname: "/lines/[code]",
                params: {
                  code: task.lineCode,
                  routeCode: task.routeCode,
                },
              }}
            >
              {task.lineCode}
            </Link>
          </Text>
          <Text
            style={[{ flex: 1 }, styles.arrivalItem]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {task.lineName}
          </Text>
          <Text style={[styles.arrivalItem]}>
            {task.taskStartTime}
          </Text>
        </View>
        );
      })}
    </ScrollView>
  );
}