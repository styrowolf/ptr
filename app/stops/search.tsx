import { ToplasApi } from "@/sdks/typescript";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useDebounce } from "use-debounce";
import { useHeaderHeight } from "@react-navigation/elements";
import { ToplasDataProvider } from "../provider";
import { ToplasPreferences } from "../storage";
import { useTranslation } from "react-i18next";

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },
  errorText: {
    fontSize: 16,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },
  searchBox: {
    borderWidth: 2,
    borderColor: "black",
    height: 40,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },
  stopName: {
    fontSize: 20,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontStyle: "italic",
  },
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
  const { t } = useTranslation([], { keyPrefix: "searchStops" });
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const height = useHeaderHeight();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={height}
    >
      <Stack.Screen
        options={{
          title: t('title'),
        }}
      />
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10 }}>
        <TextInput
          style={styles.searchBox}
          placeholder={t('searchPlaceholder')}
          placeholderTextColor="black"
          onChangeText={(text) => setQuery(text)}
        ></TextInput>
        <SearchResults query={debouncedQuery}></SearchResults>
      </View>
    </KeyboardAvoidingView>
  );
}

function SearchResults({ query }: { query: string }) {
  const { t } = useTranslation([], { keyPrefix: "searchStops" });
  const [data, setData] = useState<ToplasApi.Stop[] | null>(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query == "") {
      setData([]);
      return;
    }
    const stops = ToplasDataProvider.searchStops(query);
    stops
      .then((val) => {
        setData(val);
      })
      .catch(setError);
  }, [query]);

  // TODO: there is always data (even if the request fails; there is an empty array), we should do a snackbar to show the error
  if (data) {
    return (
      <ScrollView style={{ paddingTop: 10 }}>
        {data.map((e) => (
          <View key={e.stopCode}>
            <SearchItem stop={e} />
            <View style={{ height: 10 }} />
          </View>
        ))}
      </ScrollView>
    );
  } else {
    return (
      <Text style={[styles.errorText, { marginTop: 10 }]}>
        {t('searchNotPossible')}
      </Text>
    );
  }
}

function SearchItem({ stop }: { stop: ToplasApi.Stop }) {
  const { t } = useTranslation([], { keyPrefix: "searchStops" });
  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: "/stops/[code]",
          params: {
            code: stop.stopCode,
            name: stop.stopName,
            direction: stop.direction,
          },
        });
        ToplasPreferences.appendRecentStop(stop);
      }}
    >
      <View style={styles.searchItemView}>
        <MaterialCommunityIcons
          name="bus-stop"
          size={36}
          style={{ paddingRight: 10 }}
          color="black"
        />
        <View>
          <Text style={styles.stopName}>{stop.stopName}</Text>
          <Text style={styles.subtitle}>{t('direction')}: {stop.direction}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
