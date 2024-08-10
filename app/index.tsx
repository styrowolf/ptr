import { Link, router, useNavigation } from "expo-router";
import { Platform, SafeAreaView, StyleSheet, Text, View } from "react-native";
import MapLibreGL from '@maplibre/maplibre-react-native';
import { getBounds, getPadding, MAP_BOUNDS, MAP_PADDING, MAP_STYLE_URL } from "./utils";
import { useEffect, useRef, useState } from "react";
import { FontAwesome6, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { ToplasApi, ToplasApiClient } from "@/sdks/typescript";
import BottomSheet from "@gorhom/bottom-sheet";
import * as turf from "@turf/turf";
import * as geojson from "geojson";
import OnPressEvent from "@maplibre/maplibre-react-native/javascript/types/OnPressEvent";
import Maplibre from "@maplibre/maplibre-react-native";

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

function SearchStops() {
  return <TouchableOpacity onPress={() => router.push({ pathname: "/stops/search" })}>
        <View style={styles.itemView}>
            <MaterialCommunityIcons name="bus-stop" size={36} style={{ width: 60 }} color="black" />
            <Text style={[styles.title, { flex: 9 }]}>Search Stops</Text>
        </View>
    </TouchableOpacity>
}

function SearchLines() {
  return <TouchableOpacity onPress={() => router.push({ pathname: "/lines/search" })}>
    <View style={styles.itemView}>
          <FontAwesome6 style={{ marginLeft: 10, width: 50 }} name="bus-simple" size={24} />
          <Text style={[styles.title, { flex: 9 }]}>Search Lines</Text>
        </View>
    </TouchableOpacity>
}

function differentEnough(a: ToplasApi.Coordinates, b: ToplasApi.Coordinates) {
  const aPoint = turf.point([a.x, a.y]);
  const bPoint = turf.point([b.x, b.y]);
  const distance = turf.distance(aPoint, bPoint, { units: "meters"});
  return distance > 50;
}

const layerStyles = {
  stops: {
    circleRadius: 8,
    circleColor: "white",
    circleStrokeColor: "black",
    circleStrokeWidth: 3,
  },
  stopLabels: {
    textField: ["get", "stopName"],
    textSize: 12,
    textColor: "black",
    iconAllowOverlap: true,
    textAllowOverlap: true,
    iconTextFit: "both",
    textFont: ["Noto Sans Regular"],
  } satisfies MapLibreGL.SymbolLayerStyle,
};

function makeGeojson(stops: ToplasApi.NearbyStop[]) {
  const geojson = turf.featureCollection(stops.map((stop) => {
    const point = turf.point([stop.coordinates.x, stop.coordinates.y], { stopName: stop.stopName, direction: stop.direction }, { id: stop.stopCode });
    return point;
  }));
  return geojson;
}

export default function Index() {
  const mapRef = useRef<MapLibreGL.MapViewRef | null>();
  const userLocationRef = useRef<MapLibreGL.UserLocationRef | null>();
  const cameraRef = useRef<MapLibreGL.CameraRef | null>();
  const [stops, setStops] = useState<ToplasApi.NearbyStop[]>([]);
  const [prevLocation, setPrevLocation] = useState<ToplasApi.Coordinates | null>(null);
  const [location, setLocation] = useState<ToplasApi.Coordinates | null>(null);
  const sourceRef = useRef<MapLibreGL.ShapeSourceRef | null>(null);
  const [show, setShow] = useState<number[]>([]);
  const geojson = makeGeojson(stops);

  function showCallback({ e, code }: { e?: OnPressEvent, code?: number }) {
    if (e) {
      const feature = e.features[0];
      const stopCode = feature.id as number;

      if (stopCode) {
        if (show.includes(stopCode)) {
          setShow(show.filter((e) => e != stopCode));
        } else {
          setShow([...show, stopCode]);
        }
      }

    } else {
      if (code) {
        if (show.includes(code)) {
          setShow(show.filter((e) => e != code));
        } else {
          setShow([...show, code]);
        }
      }
    }
    
  }

  
  //(async () => { console.log(await sourceRef.current?.features())})()
  useEffect(() => {
    if (location && (!prevLocation || differentEnough(location, prevLocation))) {
      const client = new ToplasApiClient({ environment: () => "https://toplas.kurt.town/api"});
      client.nearbyStopsStopsGet({ lat: location.y, lon: location.x, radius: 1000 }).then((val) => { setStops(val) });
      cameraRef.current?.setCamera({
        zoomLevel: 13,
        centerCoordinate: [location.x, location.y - 0.005],
        animationDuration: 2000,
      });
      setPrevLocation(location);
    }
  }, [location]);

  useEffect(() => {
    console.log(show);
  }, [show]);

  return (
    <View style={styles.view}>
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

            <MapLibreGL.ShapeSource id="stops" ref={(r) => sourceRef.current = r} shape={geojson} hitbox={{ width: 8, height: 8 }} onPress={(e) => showCallback({ e })}>
              <MapLibreGL.CircleLayer
                id="stopCircles"
                sourceID="stops"
                maxZoomLevel={20}
                minZoomLevel={0}
                style={layerStyles.stops} />
              
            </MapLibreGL.ShapeSource>

             <MapLibreGL.UserLocation
              renderMode="native"
              onUpdate={(location) => setLocation({ x: location.coords.longitude, y: location.coords.latitude })}
              ref={(r) => (userLocationRef.current = r)}
            />
            {
            
            stops.filter((e) => show.includes(e.stopCode)).map((e, i) => {
                return (
                  <StopMarker key={`${e.stopCode}-${i}`} onPress={() => showCallback({ code: e.stopCode})} stop={e} />
                );
            }) 
            
            }
        </MapLibreGL.MapView>
        <BottomSheet snapPoints={[220]}>
          <View style={{ paddingHorizontal: 10, gap: 5, paddingVertical: 10 }}>
            <SearchStops />
            <SearchLines />
          </View>
        </BottomSheet>
    </View>
  )
}

function StopMarker({ stop, onPress }: { stop: ToplasApi.NearbyStop, onPress: () => void }) {
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
                <TouchableOpacity onPress={onPress}>
                      <View style={{ height: 10}}></View>
                      <View style={[styles.stopNameBox, { flexDirection: "row", alignItems: "center" }]}>
                        <View>
                          <Text style={styles.tc}>{stop.stopName}</Text>
                          <Text style={styles.tc}>({stop.direction})</Text>
                        </View>
                        <Link href={{ pathname: "/stops/[code]", params: { code: stop.stopCode, name: stop.stopName, direction: stop.direction } }} style={[styles.tc, { paddingLeft: 5 }]}><Ionicons name="arrow-forward-outline" size={24} color="black" /></Link>
                      </View>
                </TouchableOpacity>
            </View>
        </MapLibreGL.MarkerView>
    )
}