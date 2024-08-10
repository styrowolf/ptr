import { Link, router, useNavigation } from "expo-router";
import { Platform, SafeAreaView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import MapLibreGL from '@maplibre/maplibre-react-native';
import { getBounds, getPadding, MAP_BOUNDS, MAP_PADDING, MAP_STYLE_URL } from "./utils";
import { useEffect, useRef, useState } from "react";
import { FontAwesome, FontAwesome5, FontAwesome6, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
    marginHorizontal: 10,
    marginVertical: 10,
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
            <FontAwesome name="map-pin" style={{ marginLeft: 10, marginRight: 20 }} size={24} color="black" />
            
            <Text style={[styles.title, { flex: 9 }]}>Search Stops</Text>
        </View>
    </TouchableOpacity>
}

function SearchLines() {
  return <TouchableOpacity onPress={() => router.push({ pathname: "/lines/search" })}>
    <View style={styles.itemView}>
          <FontAwesome6 style={{ marginLeft: 10, marginRight: 20 }} name="bus-simple" size={24} />
          <Text style={[styles.title, { flex: 9 }]}>Search Lines</Text>
        </View>
    </TouchableOpacity>
}

function NearbyStops() {
  return <TouchableOpacity onPress={() => router.push({ pathname: "/nearbyStops" })}>
    <View style={[styles.itemView]}>
          <FontAwesome5 style={{ marginLeft: 10, marginRight: 20 }} name="map" size={24} />
          <Text style={[styles.title, { flex: 9 }]}>Nearby Stops</Text>
        </View>
    </TouchableOpacity>
}

export default function Index() {
  return (
    <View style={[styles.view, { gap: 10 }]}>
        <SearchStops />
        <SearchLines />
        <NearbyStops />
    </View>
  )
}