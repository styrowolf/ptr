import { ToplasApi } from "@/sdks/typescript";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Octicons } from "@expo/vector-icons";
import Divider from "@/app/components/divider";
import { arrayPad, chunkArray } from "../../utils";
import { ToplasAPICache, ToplasPreferences } from "../../storage";
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
  subtitle: {
    fontSize: 16,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontStyle: "italic",
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

export default function StopPage() {
  const { t } = useTranslation([], { keyPrefix: "stops" });
  const { code, name, direction } = useLocalSearchParams();

  const [stopInfo, setStopInfo] = useState<ToplasApi.StopInfo | null>(null);
  const [error, setError] = useState(null);
  const [arrivals, setArrivals] = useState<ToplasApi.Arrival[]>([]);
  const [showLines, setShowLines] = useState(true);

  useEffect(() => {
    const stopInfo = ToplasDataProvider.getStopInfo(Number(code));

    stopInfo
      .then((val) => {
        ToplasAPICache.setStopInfo(code as string, val);
        setStopInfo(val);
      })
      .catch(setError);

    function getLiveData() {
      const liveData = ToplasDataProvider.getArrivals(Number(code));

      liveData
        .then((val) => {
          ToplasAPICache.setArrivals(code as string, val);
          setArrivals(val);
        })
        .catch((val) => ToplasAPICache.setArrivals(code as string, []));
    }

    getLiveData();

    const id = setInterval(getLiveData, 20000);
    return () => clearInterval(id);
  }, [code]);

  if (stopInfo) {
    const chunkedLines = chunkArray(stopInfo.lines, 4);
    return (
      <SafeAreaView style={[{ flex: 1 }]}>
        <Stack.Screen
          options={{
            title: `${name}`,
          }}
        />
        <View style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subtitle}>
            {t("direction")}: {direction}
          </Text>
          <Divider height={20} />
          <Link
            push
            href={{
              pathname: "/stops/[code]/announcements",
              params: {
                code: code as string,
                name: stopInfo.stopName,
                direction: stopInfo.direction,
              },
            }}
            style={[styles.text]}
          >
            {t("announcements")}{" "}
            <Octicons name="report" size={16} color="black" />
          </Link>
          <Divider height={20} />
          <View>
            <TouchableOpacity onPress={() => setShowLines(!showLines)}><Text style={styles.text}>{t("lines")}</Text></TouchableOpacity>
            {showLines && chunkedLines.map((chunk, i) => (
              <View
                key={`${chunk.map((e) => e.routeCode).join("-")}-${i}`}
                style={{ flexDirection: "row" }}
              >
                {arrayPad(chunk, 4, <View style={{ flex: 1 }}></View>).map(
                  (line: ToplasApi.LineOnStop) => (
                    <Link
                      key={`${line.lineCode}-${line.routeCode}`}
                      push
                      style={[{ flex: 1 }, styles.linesTableText]}
                      onPress={() =>
                        ToplasPreferences.appendRecentLine({
                          lineCode: line.lineCode,
                          routeCode: line.routeCode,
                        })
                      }
                      href={{
                        pathname: "/lines/[code]",
                        params: {
                          code: line.lineCode,
                          routeCode: line.routeCode,
                        },
                      }}
                    >
                      {line.lineCode}
                    </Link>
                  ),
                )}
              </View>
            ))}
          </View>
          <Divider height={20} />
          <Text style={[styles.text, { paddingBottom: 5 }]}>
            {t("arrivals")}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <Text style={[{ width: 65 }, styles.arrivalsHeader]}>
              {t("line")}
            </Text>
            <Text style={[{ flex: 1 }, styles.arrivalsHeader]}>
              {t("lineName")}
            </Text>
            <Text style={[styles.arrivalsHeader]}>
              {t("mins")}
            </Text>
          </View>
          <ScrollView style={{ paddingBottom: 10 }}>
            {arrivals.map((arrival, i) => (
              <View
                key={`${arrival.routeCode}-${i}`}
                style={{ flexDirection: "row" }}
              >
                <Link style={[{ width: 65 }, styles.linesTableText]}
                  push
                  onPress={() =>
                    ToplasPreferences.appendRecentLine({
                      lineCode: arrival.lineCode,
                      routeCode: arrival.routeCode,
                    })
                  }
                  href={{
                    pathname: "/lines/[code]",
                    params: {
                      code: arrival.lineCode,
                      routeCode: arrival.routeCode,
                    },
                  }}
                >
                  {arrival.lineCode}
                </Link>
                <Link
                  push
                  style={[{ flex: 1 }, styles.arrivalItem]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  href={{
                    pathname: "/bus/[vehicleDoorNo]",
                    params: {
                      vehicleDoorNo: arrival.vehicleDoorNo,
                      lineCode: arrival.lineCode,
                      routeCode: arrival.routeCode,
                    },
                  }}
                >
                  {arrival.lineName}
                </Link>
                <Text style={[{}, styles.arrivalItem]}>
                  {`${arrival.minutesUntilArrival < 10 ? " " : ""}${arrival.minutesUntilArrival}`}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  } else if (error) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Screen
          options={{
            title: `${name}`,
          }}
        />
        <View style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subtitle}>
            {t("direction")}: {direction}
          </Text>
          <Divider height={20} />
          <Text style={styles.text}>{t("stopInformationUnavailable")}</Text>
        </View>
      </SafeAreaView>
    );
  } else {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Screen
          options={{
            title: `${name}`,
          }}
        />
        <View style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subtitle}>
            {t("direction")}: {direction}
          </Text>
          <Divider height={20} />
          <Text style={styles.text}>{t("loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }
}
