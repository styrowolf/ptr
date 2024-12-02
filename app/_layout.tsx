import { Stack, useNavigation } from "expo-router";
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
import "intl-pluralrules";
import enTranslation from "./locales/en/translation.json";
import trTranslation from "./locales/tr/translation.json";
import ToplasLanguageModule from "./languageProvider";
import plausible from "./plausible";
// i18n imports end

SplashScreen.preventAutoHideAsync();

ToplasAPICache.clear();

MapLibreGL.setAccessToken(null);
MapLibreGL.offlineManager.setTileCountLimit(Number.MAX_VALUE);

// i18n init start
i18n
  .use(ToplasLanguageModule)
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

function reconstructUrl(url: string, params?: Record<string, string>) {
  if (params) {
    const matches: string[] = [];
    const fix = url.replace(/\[(\w+)\]/g, (matched, key) => {
      matches.push(matched.slice(1, -1));
      return params[key];
    }).replace("/index", "").replace("index", "");
    const routeCodeAsQuery = Object.entries(params).filter(([k, _]) => k == "routeCode").map(([k, v]) => `${k}=${v}`).join("&");
    if (routeCodeAsQuery && routeCodeAsQuery.length > 0) {
      return `/${fix}?${routeCodeAsQuery}`;
    } else {
      return `/${fix}`;
    }
  }  else {
    return `/${url.replace("/index", "").replace("index", "")}`;
  }
}

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
        screenListeners={{
          state: (s) => {
            // magic to track pageviews + routeCodes
            const copied = Object.assign({}, s.data.state.routes);
            const urls = Object.entries(copied).map(([k, v]) => [k, v, v.name, v.params]);
            // @ts-ignore
            const urlsReconstructed = urls.map(([a, b, n, p]) => reconstructUrl(n, p));
            const lastTwo = urlsReconstructed.slice(-2);
            if (lastTwo.length == 1) {
              plausible.trackPageview(lastTwo[0]);
            } else {
              plausible.trackPageview(lastTwo[1], lastTwo[0]);
            }
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
        <Stack.Screen name="fleet" />
      </Stack>
    </GestureHandlerRootView>
  );
}