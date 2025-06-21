import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { ScrollView } from "react-native-gesture-handler";
import { FontAwesome5, FontAwesome6, Ionicons, Octicons } from "@expo/vector-icons";
import Divider from "@/app/components/divider";
import { Link, Stack, useLocalSearchParams, useNavigation } from "expo-router";
import { ToplasAPICache, ToplasPreferences } from "@/app/storage";
import { isOppositeDirection } from "@/app/utils";
import { ToplasDataProvider } from "@/app/provider";
import { useTranslation } from "react-i18next";
import { ToplasApi } from "@/sdks/typescript";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    padding: 16,
    maxHeight: "40%",
    minHeight: "20%"
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#ccc",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "bold",
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },
  text: {
    fontSize: 16,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    paddingVertical: 10,
  },
  stopItem: {
    padding: 4,
    fontSize: 16,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },
  overlay: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
    paddingVertical: 8,
    backgroundColor: "rgba(244, 81, 30, 0.9)",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  overlayText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },
  overlayBackButton: {
    position: "absolute",
    left: 16,
    zIndex: 101,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.85)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 4,
  },
});

interface StopWithBus extends ToplasApi.LineStop {
  bus?: ToplasApi.LiveBus;
}

export default function LineBottomSheet({ lastTappedStopIndex }: { lastTappedStopIndex?: number | null }) {
  const { t, i18n } = useTranslation([], { keyPrefix: "lines" });
  const { code, routeCode } = useLocalSearchParams();
  const navigation = useNavigation();
  const { top } = useSafeAreaInsets();

  const [lineInfo, setLineInfo] = useState<ToplasApi.LineInfo | null>(null);
  const [error, setError] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState<ToplasApi.RouteInfo | null>(null);
  const [liveBuses, setLiveBuses] = useState<ToplasApi.LiveBus[]>([]);
  const sizes = useRef<number[]>([]);
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (lastTappedStopIndex != null) {
      scrollRef.current?.scrollTo({
        y: sizes.current[lastTappedStopIndex],
        animated: true,
      });
    }
  }, [lastTappedStopIndex]);

  useEffect(() => {
    if (lineInfo && selectedRoute) {
      ToplasPreferences.appendRecentLine({
        lineCode: code as string,
        routeCode: selectedRoute.routeCode,
      });
      // @ts-ignore
      navigation.setParams({ routeCode: selectedRoute.routeCode });
    }
  }, [selectedRoute]);

  useEffect(() => {
    const lineInfo = ToplasDataProvider.getLineInfo(code as string);
    lineInfo
      .then((val) => {
        ToplasAPICache.setLineInfo(code as string, val);
        if (routeCode) {
          const route = val.routes.find((e) => e.routeCode == routeCode)!;
          setSelectedRoute(route);
        } else if (val.routes.length > 0) {
          setSelectedRoute(val.routes[0]);
        }
        setLineInfo(val);
      })
      .catch(setError);

    function getLiveData() {
      const liveData = ToplasDataProvider.getLiveBusesOnLine(code as string);
      liveData
        .then((val) => {
          ToplasAPICache.setLiveBuses(code as string, val);
          setLiveBuses(val);
        })
        .catch((val) => ToplasAPICache.setLiveBuses(code as string, []));
    }
    getLiveData();
    const id = setInterval(getLiveData, 20000);
    return () => clearInterval(id);
  }, [code]);

  if (lineInfo && selectedRoute) {
    const stops: StopWithBus[] = selectedRoute!.stops.map((e) => (Object.assign({}, e) as StopWithBus));
    const buses = liveBuses.filter((e) => e.routeCode == selectedRoute?.routeCode);
    const oppositeRoute = lineInfo.routes.find((e) => isOppositeDirection(selectedRoute!, e));
    for (const bus of buses) {
      const stop = stops[bus.stopOrder];
      if (stop) {
        stop.bus = bus;
      }
    }
    return (
      <>
        <View style={[styles.overlay, { top: top }]}>  
  
          <Text style={styles.overlayText}>
            {code} ({lineInfo.lineName})
          </Text>
        </View>
        <View style={[styles.overlay, { top: top + 50, backgroundColor: "transparent" }]}>
            <TouchableOpacity
                style={styles.overlayBackButton}
                onPress={() => navigation.goBack()}
                accessibilityLabel="Back"
            >
            <Ionicons name="arrow-back" size={20} color="#222" />
          </TouchableOpacity>
        </View>
        <View style={styles.sheet}>
          <Text style={styles.text}>{t("route")}</Text>
          <View style={{ flexDirection: "row" }}>
            <Dropdown
              style={{ flex: 1 }}
              placeholderStyle={styles.dropdownText}
              placeholder={t("route")}
              itemTextStyle={styles.dropdownText}
              selectedTextStyle={styles.dropdownText}
              value={selectedRoute!.routeCode}
              data={lineInfo.routes}
              labelField="routeName"
              valueField="routeCode"
              onChange={(e) => {
                setSelectedRoute(e);
              }}
            />
            {oppositeRoute && (
              <>
                <View style={{ width: 10 }} />
                <TouchableOpacity onPress={() => setSelectedRoute(oppositeRoute)}>
                  <Ionicons name="swap-horizontal" size={20} color="black" />
                </TouchableOpacity>
              </>
            )}
          </View>
          <Divider height={20} />
          <View style={{ flexDirection: "row" }}>
            <Link
              push
              href={{
                pathname: "/lines/[code]/schedule",
                params: {
                  code: code as string,
                  routeCode: selectedRoute?.routeCode,
                },
              }}
              style={[styles.text, { flex: 1, textAlign: "center" }]}
            >
              {t("schedule")}
              <View style={{ width: 10 }} />
              <FontAwesome5 name="clock" size={16} />
            </Link>
            <Link
              push
              href={{
                pathname: "/lines/[code]/announcements",
                params: { code: code as string, name: lineInfo.lineName },
              }}
              style={[styles.text, { flex: 1, textAlign: "center" }]}
            >
              {t("announcements")} <Octicons name="report" size={16} color="black" />
            </Link>
          </View>
          <Divider height={20} />
          <Text style={styles.text}>{t("stops")}</Text>
          <ScrollView style={{ paddingBottom: 10 }} ref={scrollRef}>
            {stops.map((e, i) => (
              <Text style={[styles.stopItem, i == lastTappedStopIndex ? { backgroundColor: "#8080809F" } : {} ]} key={`${e.stopCode}-${i}`} onLayout={(e) => sizes.current[i] = e.nativeEvent.layout.y}>
                <Link
                  push
                  onPress={() => {
                    ToplasPreferences.appendRecentStop(e);
                  }}
                  href={{
                    pathname: "/stops/[code]",
                    params: {
                      code: e.stopCode,
                      name: e.stopName,
                      direction: e.direction,
                    },
                  }}
                >
                  {i + 1}. {e.stopName}
                </Link>{" "}
                {e.bus ? (
                  <Link
                    push
                    href={{
                      pathname: "/bus/[vehicleDoorNo]",
                      params: {
                        vehicleDoorNo: e.bus.vehicleDoorNo,
                        lineCode: e.lineCode,
                        routeCode: e.routeCode,
                      },
                    }}
                  >
                    <FontAwesome6 name="bus-simple" size={16} />
                    {e.bus.stopEnterTime ? ` (${e.bus.stopEnterTime})` : ""}
                  </Link>
                ) : (
                  ""
                )}
              </Text>
            ))}
          </ScrollView>
        </View>
      </>
    );
  } else if (lineInfo && !selectedRoute) {
    return (
      <View style={styles.sheet}>
        <View style={[styles.overlay, { top: top }]}>  
          <Text style={styles.overlayText}>
            {code}
          </Text>
        </View>
        <Text style={styles.text}>{t("noRoutesFound")}</Text>
      </View>
    );
  } else if (error) {
    return (
        <>
        <View style={[styles.overlay, { top: top }]}>  
          <Text style={styles.overlayText}>
            {code}
          </Text>
        </View>
        <View style={[styles.overlay, { top: top + 50, backgroundColor: "transparent" }]}>
            <TouchableOpacity
                style={styles.overlayBackButton}
                onPress={() => navigation.goBack()}
                accessibilityLabel="Back"
            >
            <Ionicons name="arrow-back" size={20} color="#222" />
          </TouchableOpacity>
        </View>
        <View style={styles.sheet}>
        <Text style={styles.text}>{t("lineInformationUnavailable")}</Text>
      </View>
        </>
    );
  } else {
    return (<>
        <View style={[styles.overlay, { top: top }]}>  
          <Text style={styles.overlayText}>
            {code}
          </Text>
        </View>
        <View style={[styles.overlay, { top: top + 50, backgroundColor: "transparent" }]}>
            <TouchableOpacity
                style={styles.overlayBackButton}
                onPress={() => navigation.goBack()}
                accessibilityLabel="Back"
            >
            <Ionicons name="arrow-back" size={20} color="#222" />
          </TouchableOpacity>
        </View>
        <View style={styles.sheet}>
        <Text style={styles.text}>{t("loading")}</Text>
      </View>
    </>
    );
  }
}
