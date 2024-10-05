import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MapLibreGL from "@maplibre/maplibre-react-native";
import React, { useEffect, useReducer, useState } from "react";
import { useFonts } from "expo-font";
import { IBMPlexMono_700Bold_Italic } from "@expo-google-fonts/ibm-plex-mono";
import { ToplasAPICache, ToplasPreferences } from "./storage";
// i18n imports start
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import RNLanguageDetector from "@os-team/i18next-react-native-language-detector";
import "intl-pluralrules";
import enTranslation from "./locales/en/translation.json";
import trTranslation from "./locales/tr/translation.json";
// i18n imports end

SplashScreen.preventAutoHideAsync();

ToplasAPICache.clear();

MapLibreGL.setAccessToken(null);

// i18n init start
i18n
  .use(RNLanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      tr: {
        translation: trTranslation,
      },
    },
    supportedLngs: ["en", "tr"],
    fallbackLng: "en",
    //interpolation: {
    //    escapeValue: false,
    //},
  });
// i18n init end

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "IBMPlexMono-BI": IBMPlexMono_700Bold_Italic,
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
      <Stack
        screenOptions={{
          headerBackTitleVisible: false,
          headerStyle: {
            backgroundColor: "#f4511e",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontSize: 20,
            fontFamily: "IBMPlexMono-BI",
            color: "white",
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: "toplaş" }} />
        <Stack.Screen name="nearbyStops" />
        <Stack.Screen name="settings" />
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
