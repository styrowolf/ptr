import { Link, router, Stack, useNavigation } from "expo-router";
import { Platform, SafeAreaView, StyleSheet, Text, View } from "react-native";
import MapLibreGL from '@maplibre/maplibre-react-native';
import { getBounds, getPadding, MAP_BOUNDS, MAP_PADDING, MAP_STYLE_URL } from "./utils";
import { useEffect, useRef, useState } from "react";
import { FontAwesome6, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { ToplasApi, ToplasApiClient } from "@/sdks/typescript";
import BottomSheet from "@gorhom/bottom-sheet";
import * as turf from "@turf/turf";
import { ScrollView } from "react-native-gesture-handler";

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },
  title: {
    fontSize: 24,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  view: {
    flex: 1,
  },
  map: {
    flex: 1,
    alignSelf: 'stretch',
  },
  itemView: { 
    flexDirection: "row",
    alignItems: "center", 
    width: "100%",
    borderColor: "black", 
    borderWidth: 3, 
    borderRadius: 15, 
    paddingVertical: 10, 
    paddingHorizontal: 10,
    height: 80,
}
});

function differentEnough(a: ToplasApi.Coordinates, b: ToplasApi.Coordinates) {
  const aPoint = turf.point([a.x, a.y]);
  const bPoint = turf.point([b.x, b.y]);
  const distance = turf.distance(aPoint, bPoint, { units: "meters"});
  return distance > 50;
}

export default function NearbyStops() {
  const mapRef = useRef<MapLibreGL.MapViewRef | null>();
  const userLocationRef = useRef<MapLibreGL.UserLocationRef | null>();
  const cameraRef = useRef<MapLibreGL.CameraRef | null>();
  const [stops, setStops] = useState<ToplasApi.NearbyStop[]>([]);
  const [prevLocation, setPrevLocation] = useState<ToplasApi.Coordinates | null>(null);
  const [location, setLocation] = useState<ToplasApi.Coordinates | null>(null);

  useEffect(() => {
    if (location && (!prevLocation || differentEnough(location, prevLocation))) {
      const client = new ToplasApiClient({ environment: () => "https://toplas.kurt.town/api"});
      client.nearbyStopsStopsGet({ lat: location.y, lon: location.x, radius: 1000 }).then((val) => { setStops(val.sort((a, b) => a.distance - b.distance)) });
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
        <Stack.Screen options={{ title: "Nearby Stops" }}  />
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
              onUpdate={(location) => setLocation({ x: location.coords.longitude, y: location.coords.latitude })}
              ref={(r) => (userLocationRef.current = r)}
            />
            { stops.map((e, i) => {
                return (
                  <StopMarker key={`${e.stopCode}-${i}`} stop={e} />
                );
            }) }
        </MapLibreGL.MapView>
        <BottomSheet snapPoints={[220]}>
          <ScrollView style={{ paddingHorizontal: 10, gap: 5, paddingVertical: 10, flex: 1 }}>
            { stops.map((e, i) => <View key={`${e.stopCode}-${i}`} style={{ paddingBottom: 10, }}><SearchItem stop={e} /></View>)}
          </ScrollView>
        </BottomSheet>
    </View>
  )
}

function SearchItem({ stop }: { stop: ToplasApi.NearbyStop }) {
  const styles = StyleSheet.create({
    stopName: {
      fontSize: 20,
      fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
      fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
        fontStyle: 'italic'
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
        paddingHorizontal: 10 
    }
  });
  return <TouchableOpacity onPress={() => router.push({ pathname: "/stops/[code]", params: { code: stop.stopCode, name: stop.stopName, direction: stop.direction }})}>
      <View style={styles.searchItemView}>
          <MaterialCommunityIcons name="bus-stop" size={36} style={{ paddingRight: 10 }} color="black" />
          <View>
              <Text style={styles.stopName}>{stop.stopName}</Text>
              <Text style={styles.subtitle}>Direction: {stop.direction}</Text>
          </View>
      </View>
  </TouchableOpacity>
}

function StopMarker({ stop }: { stop: ToplasApi.NearbyStop }) {
  const [showText, setShowText] = useState(false);

    const styles = StyleSheet.create({
        stopCircle: {
            borderWidth: 3, 
            borderRadius: 12, 
            borderStyle: "solid", 
            backgroundColor: "white", 
            height: 24, 
            width: 24,
            borderColor: "black",
            zIndex: -100
        },
        stopNameBox: {backgroundColor: "white", borderWidth: 3, padding: 4, borderRadius: 12, zIndex: -100},
        tc: {
          textAlign: "center",
        }
    })

    return (
        <MapLibreGL.MarkerView coordinate={[stop.coordinates.x, stop.coordinates.y]}>
            <View style={{ flex: 1, flexDirection: "column", alignItems: "center"}}>
                <TouchableOpacity onPress={() => setShowText(!showText)}>
                    { !showText && <View style={styles.stopCircle}></View>}
                    { showText && <>
                      <View style={{ height: 10}}></View>
                      <View style={[styles.stopNameBox, { flexDirection: "row", alignItems: "center" }]}>
                        <View>
                          <Text style={styles.tc} numberOfLines={1}>{stop.stopName}</Text>
                          <Text style={styles.tc}>({stop.direction})</Text>
                        </View>
                        <Link href={{ pathname: "/stops/[code]", params: { code: stop.stopCode, name: stop.stopName, direction: stop.direction } }} style={[styles.tc, { paddingLeft: 5 }]}><Ionicons name="arrow-forward-outline" size={24} color="black" /></Link>
                      </View>
                    </>}
                </TouchableOpacity>
            </View>
        </MapLibreGL.MarkerView>
    )
}