import { Link, router, Stack, useGlobalSearchParams, useNavigation, usePathname, useRootNavigationState } from "expo-router";
import {
  Platform,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
  Alert
} from "react-native";
import {
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import Divider from "./components/divider";
import { LineWithRoute, StopWithoutId, ToplasPreferences } from "./storage";
import { arrayPad, chunkArray } from "./utils";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import appStyles from "./styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Application from "expo-application";
import { ToplasDataProvider } from "./provider";

const styles = StyleSheet.create({
  text: appStyles.t16,
  title: appStyles.t24b,
  subtitle: appStyles.t20b,
  stopTitle: appStyles.t20b,
  stopSubtitle: appStyles.t16i,
  view: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 10,
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
  linesTableText: appStyles.t20b,
  stopItem: {
    padding: 4,
    ...appStyles.t16,
  },
  border: {
    borderColor: "black",
    borderWidth: 3,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
});

function alert(msg: string) {
  Alert.alert(msg, undefined, [
    { onPress: () => alert(msg) }
  ]);
}

export default function Index() {
  const { t } = useTranslation();
  const [isVersionUsable, setIsVersionUsable] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const usableVersions: string[] = await ToplasDataProvider.getSupportedVersions();
        if (Application.nativeApplicationVersion) {
          const isVersionUsable = usableVersions.includes(Application.nativeApplicationVersion);
          setIsVersionUsable(isVersionUsable);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!isVersionUsable) {
      alert(t('versionNotSupported'))
    }
  }, [isVersionUsable]);

  return (
    <View style={styles.view}>
      <RecentsWidget />
    </View>
  );
}

function RecentsWidget() {
  const pathname = usePathname();
  const { bottom } = useSafeAreaInsets();
  const { t } = useTranslation([], { keyPrefix: "home" });

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
    <View style={[styles.view, { marginBottom: bottom }]}>
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
          headerRight: () => 
            <TouchableOpacity onPress={() => router.push("/settings")}>
              <MaterialIcons name="settings" size={24} style={{ color: "white" }}></MaterialIcons>
            </TouchableOpacity>
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
            <Text style={styles.subtitle}>{t("nearbyStops")}</Text>
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
            <Text style={styles.subtitle}>{t("findLines")}</Text>
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
            <Text style={styles.subtitle}>{t("findStops")}</Text>
          </View>
        </TouchableOpacity>
        <Divider height={20} />
        <TouchableOpacity onPress={() => router.push("/fleet")}>
          <View style={{ flexDirection: "row" }}>
            <FontAwesome5
              name="list-alt"
              size={24}
              style={{ width: 44, paddingLeft: 2, alignSelf: "center" }}
            />
            <Text style={styles.subtitle}>{t('viewFleet')}</Text>
          </View>
        </TouchableOpacity>
      </View>
      <Text style={[styles.title, { paddingTop: 10 }]}>
        {t("recents")} <FontAwesome name="history" size={24} />
      </Text>
      <Divider height={20} />
      <RecentLines lines={recentLines} />
      <Divider height={20} />
      <ScrollView style={{ flexGrow: 1 }}>
        {recentStops.length == 0 && (<Text style={styles.text}>{t('noStopsExplanation')}</Text>)}
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
              <Text style={styles.stopSubtitle}>
                {t("direction")}: {e.direction}
              </Text>
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
        {arrayPad(placeholders, 4, <View></View>).map(
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
