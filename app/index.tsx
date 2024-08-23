import { Link, router, Stack, useNavigation, usePathname } from "expo-router";
import {
  Platform,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import {
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import Divider from "./components/divider";
import { LineWithRoute, StopWithoutId, ToplasPreferences } from "./storage";
import { arrayPad, chunkArray } from "./utils";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },
  title: {
    fontSize: 24,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 20,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "bold",
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
  },
  border: {
    borderColor: "black",
    borderWidth: 3,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  linesTableText: {
    fontSize: 20,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "bold",
  },
  stopItem: {
    padding: 4,
    fontSize: 16,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },
  stopTitle: {
    fontSize: 20,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "bold",
  },
  stopSubtitle: {
    fontSize: 16,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontStyle: "italic",
  },
});

export default function Index() {
  return (
    <View style={styles.view}>
      <RecentsWidget />
    </View>
  );
}

function RecentsWidget() {
  const pathname = usePathname();

  const [recentLines, setRecentLines] = useState<LineWithRoute[]>(
    ToplasPreferences.getRecentLines(),
  );
  const [recentStops, setRecentStops] = useState<StopWithoutId[]>(
    ToplasPreferences.getRecentStops(),
  );

  useEffect(() => {
    setRecentLines(ToplasPreferences.getRecentLines());
    setRecentStops(ToplasPreferences.getRecentStops());
  }, [pathname]);

  return (
    <View style={[styles.view]}>
      <Stack.Screen
        options={{
          headerBackTitleVisible: false,
          headerStyle: {
            backgroundColor: "#f4511e",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontSize: 24,
            fontFamily: "IBMPlexMono-BI",
            color: "white",
          },
        }}
      />
      <View style={styles.border}>
        <TouchableOpacity onPress={() => router.push("/nearbyStops")}>
          <View style={{ flexDirection: "row" }}>
            <FontAwesome5
              name="map"
              size={24}
              style={{ width: 44, padding: "auto" }}
            />
            <Text style={styles.subtitle}>nearby stops</Text>
          </View>
        </TouchableOpacity>
        <Divider height={20} />
        <TouchableOpacity onPress={() => router.push("/lines/search")}>
          <View style={{ flexDirection: "row" }}>
            <FontAwesome6
              name="bus-simple"
              size={24}
              style={{ width: 44, paddingLeft: 2, alignSelf: "center" }}
            />
            <Text style={styles.subtitle}>find lines</Text>
          </View>
        </TouchableOpacity>
        <Divider height={20} />
        <TouchableOpacity onPress={() => router.push("/stops/search")}>
          <View style={{ flexDirection: "row" }}>
            <FontAwesome
              name="map-pin"
              size={24}
              style={{ width: 44, paddingLeft: 6, alignSelf: "center" }}
            />
            <Text style={styles.subtitle}>find stops</Text>
          </View>
        </TouchableOpacity>
      </View>
      <Text style={[styles.title, { paddingTop: 10 }]}>
        Recents <FontAwesome name="history" size={24} />
      </Text>
      <Divider height={20} />
      <RecentLines lines={recentLines} />
      <Divider height={20} />
      <ScrollView style={{ paddingBottom: 10, flexGrow: 1 }}>
        {recentStops.map((e, i) => (
          <View key={`${e.stopCode}-${i}`} style={{ paddingVertical: 10 }}>
            <TouchableOpacity
              onPress={() => {
                ToplasPreferences.appendRecentStop(e);
                router.push({
                  pathname: "/stops/[code]",
                  params: {
                    code: e.stopCode,
                    name: e.stopName,
                    direction: e.direction,
                  },
                });
              }}
            >
              <Text style={styles.stopTitle}>{e.stopName}</Text>
              <Text style={styles.stopSubtitle}>Direction: {e.direction}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function RecentLines({ lines }: { lines: LineWithRoute[] }) {
  if (lines.length == 0) {
    const placeholders = ["..."];
    return placeholders.map((placeholder, i) => (
      <View key={`${placeholder}-${i}`} style={{ flexDirection: "row" }}>
        {arrayPad(placeholders, 4, <View style={{ flex: 1 }}></View>).map(
          (p: string, i) => (
            <Text key={i} style={[{ flex: 1 }, styles.linesTableText]}>
              {p}
            </Text>
          ),
        )}
      </View>
    ));
  } else {
    const chunkedLines = chunkArray(lines, 4);
    return (
      <>
        {chunkedLines.map((chunk, i) => (
          <View
            key={`${chunk.map((e) => e.routeCode).join("-")}-${i}`}
            style={{ flexDirection: "row" }}
          >
            {arrayPad(chunk, 4, <View style={{ flex: 1 }}></View>).map(
              (line: LineWithRoute, i) => (
                <Link
                  key={`${line.lineCode}-${i}`}
                  style={[{ flex: 1 }, styles.linesTableText]}
                  onPress={() =>
                    ToplasPreferences.appendRecentLine({
                      lineCode: line.lineCode,
                      routeCode: line.routeCode,
                    })
                  }
                  href={{
                    pathname: "/lines/[code]",
                    params: { code: line.lineCode, routeCode: line.routeCode },
                  }}
                >
                  {line.lineCode}
                </Link>
              ),
            )}
          </View>
        ))}
      </>
    );
  }
}
