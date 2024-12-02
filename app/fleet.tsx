import { Link, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { ToplasDataProvider } from "./provider";
import { chunkArray, arrayPad } from "./utils";
import appStyles from "./styles";
import {
    SafeAreaView,
    TextInput,
    StyleSheet,
    Platform,
    TouchableOpacity,
    KeyboardAvoidingView,
} from "react-native";
import { useDebounce } from "use-debounce";
import { useHeaderHeight } from "@react-navigation/elements";
import { useTranslation } from "react-i18next";

const styles = StyleSheet.create({
  searchBox: {
    borderWidth: 2,
    borderColor: "black",
    height: 40,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },
  stopName: appStyles.t20b,
  subtitle: appStyles.t16i,
  searchItemView: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    width: "100%",
    borderColor: "black",
    borderWidth: 3,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
});

export default function SearchPage() {
  const { t } = useTranslation([], { keyPrefix: "fleet" });
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const height = useHeaderHeight();

  const [fleet, setFleet] = useState<string[]>([]);
  const filteredFleet = useMemo(() => fleet.filter((e) => e.includes(debouncedQuery)), [fleet, debouncedQuery]);
  const fleetChunked: string[][] = useMemo(() => chunkArray(filteredFleet, 4), [filteredFleet]);

  useEffect(() => {
      ToplasDataProvider.getFleet().then(setFleet);
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={height}
    >
      <Stack.Screen
        options={{
          title: t("title"),
        }}
      />
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10 }}>
        <TextInput
          style={styles.searchBox}
          placeholder={t("searchPlaceholder")}
          placeholderTextColor="black"
          onChangeText={(text) => setQuery(text)}
        ></TextInput>
        <FlatList style={{ paddingTop: 10 }}
            data={fleetChunked}
            renderItem={({ item }) => <View style={{ flexDirection: "row" }}>{arrayPad(item, 4, "").map(e => <Link href={{ pathname: "/bus/[vehicleDoorNo]", params: { vehicleDoorNo: e }}} style={[appStyles.t20b, { flex: 1}]}>{e}</Link>)}</View>}
            keyExtractor={(item) => item.join("")}
        ></FlatList>
      </View>
    </KeyboardAvoidingView>
  );
}