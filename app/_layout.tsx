import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MapLibreGL from '@maplibre/maplibre-react-native';
import React, { useEffect, useReducer, useState } from "react";
import { useFonts } from "expo-font";
import { IBMPlexMono_700Bold_Italic } from '@expo-google-fonts/ibm-plex-mono';
import { ToplasAPICache } from "./storage";

SplashScreen.preventAutoHideAsync();

ToplasAPICache.clear();

MapLibreGL.setAccessToken(null);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'IBMPlexMono-BI': IBMPlexMono_700Bold_Italic,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <Stack screenOptions={{
        headerBackTitleVisible: false,
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontSize: 20,
          fontFamily: "IBMPlexMono-BI",
          color: 'white',
        },}}>
        <Stack.Screen name="index" options={{title: "toplaş"}}/>
        <Stack.Screen name="stops/[code]/index" />
        <Stack.Screen name="stops/[code]/announcements" />
        <Stack.Screen name="stops/search" />
        <Stack.Screen name="lines/[code]/index" />
        <Stack.Screen name="lines/[code]/map" />
        <Stack.Screen name="lines/[code]/schedule" />
        <Stack.Screen name="lines/[code]/announcements" />
        <Stack.Screen name="lines/search" />
        <Stack.Screen name="bus/[vehicleDoorNo]" />
      </Stack>
    </GestureHandlerRootView>
  );
}
