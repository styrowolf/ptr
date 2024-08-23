import Divider from "@/app/components/divider";
import { ToplasDataProvider } from "@/app/provider";
import { ToplasApi } from "@/sdks/typescript";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ScrollView, Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "bold",
  },
  announcementItem: {
    padding: 4,
    fontSize: 16,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },
  view: {
    paddingTop: 10,
    paddingHorizontal: 10,
    flex: 1,
  },
});

export default function Announcements() {
  const insets = useSafeAreaInsets();
  const { code, name } = useLocalSearchParams();

  const [announcements, setAnnouncements] = useState<
    ToplasApi.LineAnnouncement[] | null
  >(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    ToplasDataProvider.getLineAnnouncements(code as string)
      .then((val) => {
        setAnnouncements(val);
      })
      .catch(setError);
  }, []);

  if (error) {
    return (
      <View style={[styles.view, { paddingBottom: insets.bottom }]}>
        <Stack.Screen options={{ title: `Announcements` }} />
        <Text style={styles.title}>{`${code} (${name})`}</Text>
        <Divider height={20} />
        <Text style={styles.announcementItem}>
          Announcements for this line cannot be retrieved at the moment.
        </Text>
      </View>
    );
  } else if (announcements?.length === 0) {
    return (
      <View style={[styles.view, { paddingBottom: insets.bottom }]}>
        <Stack.Screen options={{ title: `Announcements` }} />
        <Text style={styles.title}>{`${code} (${name})`}</Text>
        <Divider height={20} />
        <Text style={styles.announcementItem}>
          No announcements for this line.
        </Text>
      </View>
    );
  } else if (announcements) {
    return (
      <View style={[styles.view, { paddingBottom: insets.bottom }]}>
        <Stack.Screen options={{ title: `Announcements` }} />
        <Text style={styles.title}>{`${code} (${name})`}</Text>
        <Divider height={20} />
        <ScrollView>
          {announcements.map((announcement, i) => (
            <AnnouncementItem
              key={`${announcement}-${i}`}
              announcement={announcement}
            />
          ))}
        </ScrollView>
      </View>
    );
  } else {
    return (
      <View style={[styles.view, { paddingBottom: insets.bottom }]}>
        <Stack.Screen options={{ title: `Announcements` }} />
        <Text style={styles.title}>{`${code} (${name})`}</Text>
        <Divider height={20} />
        <Text style={styles.announcementItem}>Loading...</Text>
      </View>
    );
  }
}

function AnnouncementItem({
  announcement,
}: {
  announcement: ToplasApi.LineAnnouncement;
}) {
  return (
    <View style={{ flexDirection: "row" }}>
      <Text style={[styles.announcementItem, { flex: 1 }]}>
        {announcement.information}
      </Text>
    </View>
  );
}
