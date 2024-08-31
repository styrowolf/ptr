import { ToplasApi } from "@/sdks/typescript";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { ScrollView } from "react-native-gesture-handler";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {
  FontAwesome5,
  Ionicons,
  MaterialIcons,
  Octicons,
} from "@expo/vector-icons";
import Divider from "@/app/components/divider";
import { ToplasAPICache, ToplasPreferences } from "@/app/storage";
import { isOppositeDirection } from "@/app/utils";
import { ToplasDataProvider } from "@/app/provider";
import { useTranslation } from "react-i18next";

const styles = StyleSheet.create({
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
  view: {
    flex: 1,
  },
  map: {
    flex: 1,
    alignSelf: "stretch",
  },
});

interface StopWithBus extends ToplasApi.LineStop {
  bus?: ToplasApi.LiveBus;
}

export default function LinePage() {
  const { t, i18n } = useTranslation([], { keyPrefix: "lines" });
  const flexValues = i18n.resolvedLanguage == "tr" ? [6, 7, 7] : [2, 3, 4];
  const { code, routeCode } = useLocalSearchParams();

  const [lineInfo, setLineInfo] = useState<ToplasApi.LineInfo | null>(null);
  const [error, setError] = useState(null);
  const [selectedRoute, setSelectedRoute] =
    useState<ToplasApi.RouteInfo | null>(null);

  const [liveBuses, setLiveBuses] = useState<ToplasApi.LiveBus[]>([]);

  useEffect(() => {
    if (lineInfo && selectedRoute) {
      ToplasPreferences.appendRecentLine({
        lineCode: code as string,
        routeCode: selectedRoute.routeCode,
      });
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
    const stops: StopWithBus[] = selectedRoute!.stops;
    const buses = liveBuses.filter(
      (e) => e.routeCode == selectedRoute?.routeCode,
    );
    const oppositeRoute = lineInfo.routes.find((e) =>
      isOppositeDirection(selectedRoute!, e),
    );

    for (const bus of buses) {
      const stop = stops[bus.stopOrder];
      if (stop) {
        stop.bus = bus;
      }
    }

    return (
      <SafeAreaView style={[styles.view]}>
        <Stack.Screen
          options={{
            title: `${code}`,
          }}
        />
        <View style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
          <Text style={styles.title}>
            {code} ({lineInfo.lineName})
          </Text>
          <Divider height={20} />
          <Text style={styles.text}>{t('route')}</Text>
          <View style={{ flexDirection: "row" }}>
            <Dropdown
              style={{ flex: 1 }}
              placeholderStyle={styles.dropdownText}
              placeholder={t('route')}
              itemTextStyle={styles.dropdownText}
              selectedTextStyle={styles.dropdownText}
              value={selectedRoute!.routeCode}
              data={lineInfo.routes}
              labelField="routeName"
              valueField="routeCode"
              onChange={(e) => setSelectedRoute(e)}
            />
            {oppositeRoute && (
              <>
                <View style={{ width: 10 }} />
                <TouchableOpacity
                  onPress={() => setSelectedRoute(oppositeRoute)}
                >
                  <Ionicons name="swap-horizontal" size={24} color="black" />
                </TouchableOpacity>
              </>
            )}
          </View>
          <Divider height={20} />
          <View style={{ flexDirection: "row" }}>
            <Link push
              href={{
                pathname: "/lines/[code]/map",
                params: {
                  code: code as string,
                  routeCode: selectedRoute?.routeCode,
                },
              }}
              style={[styles.text, { flex: flexValues[0] }]}
            >
              {t('map')}
              <View style={{ width: 10 }} />
              <FontAwesome5 name="map" size={16} />
            </Link>
            <Link push
              href={{
                pathname: "/lines/[code]/schedule",
                params: {
                  code: code as string,
                  routeCode: selectedRoute?.routeCode,
                },
              }}
              style={[styles.text, { flex: flexValues[1] }]}
            >
              {t('schedule')}
              <View style={{ width: 10 }} />
              <FontAwesome5 name="clock" size={16} />
            </Link>
            <Link push
              href={{
                pathname: "/lines/[code]/announcements",
                params: { code: code as string, name: lineInfo.lineName },
              }}
              style={[styles.text, { flex: flexValues[2] }]}
            >
              {t('announcements')} <Octicons name="report" size={16} color="black" />
            </Link>
          </View>
          <Divider height={20} />
          <Text style={styles.text}>{t('stops')}</Text>
          <ScrollView style={{ paddingBottom: 10 }}>
            {stops.map((e, i) => (
              <Text style={styles.stopItem} key={`${e.stopCode}-${i}`}>
                <Link push
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
                  <Link push
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
      </SafeAreaView>
    );
  } else if (lineInfo && !selectedRoute) {
    return (
      <SafeAreaView style={styles.view}>
        <Stack.Screen
          options={{
            title: `${code}`,
          }}
        />
        <View style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
          <Text style={styles.title}>{code}</Text>
          <Divider height={20} />
          <Text style={styles.text}>{t('noRoutesFound')}</Text>
        </View>
      </SafeAreaView>
    );
  } else if (error) {
    return (
      <SafeAreaView style={styles.view}>
        <Stack.Screen
          options={{
            title: `${code}`,
          }}
        />
        <View style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
          <Text style={styles.title}>{code}</Text>
          <Divider height={20} />
          <Text style={styles.text}>
            {t('lineInformationUnavailable')}
          </Text>
        </View>
      </SafeAreaView>
    );
  } else {
    return (
      <SafeAreaView style={styles.view}>
        <Stack.Screen
          options={{
            title: `${code}`,
          }}
        />
        <View style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
          <Text style={styles.title}>{code}</Text>
          <Divider height={20} />
          <Text style={styles.text}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }
}
