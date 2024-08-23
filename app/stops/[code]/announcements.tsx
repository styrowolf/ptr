import Divider from "@/app/components/divider";
import { ToplasDataProvider } from "@/app/provider";
import { ToplasApi } from "@/sdks/typescript";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ScrollView, Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontStyle: "italic",
  },
  announcementItem: {
    padding: 4,
    fontSize: 16,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },
  announcementsHeader: {
    fontSize: 16,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },
  linesTableText: {
    fontSize: 20,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "bold",
  },
  view: {
    paddingTop: 10,
    paddingHorizontal: 10,
    flex: 1,
  },
});

export default function Announcements() {
  const insets = useSafeAreaInsets();
  const { code, name, direction } = useLocalSearchParams();

  const [announcements, setAnnouncements] = useState<
    ToplasApi.LineAnnouncement[] | null
  >(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    ToplasDataProvider.getStopAnnouncements(Number(code))
      .then((val) => {
        setAnnouncements(val);
      })
      .catch(setError);
  }, []);

  if (error) {
    return (
      <View style={[styles.view, { paddingBottom: insets.bottom }]}>
        <Stack.Screen options={{ title: `Announcements` }} />
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.subtitle}>Direction: {direction}</Text>
        <Divider height={20} />
        <Text style={styles.announcementItem}>
          Announcements for this stop cannot be retrieved at the moment.
        </Text>
      </View>
    );
  } else if (announcements?.length === 0) {
    return (
      <View style={[styles.view, { paddingBottom: insets.bottom }]}>
        <Stack.Screen options={{ title: `Announcements` }} />
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.subtitle}>Direction: {direction}</Text>
        <Divider height={20} />
        <Text style={styles.announcementItem}>
          No announcements for this stop.
        </Text>
      </View>
    );
  } else if (announcements) {
    return (
      <View style={[styles.view, { paddingBottom: insets.bottom }]}>
        <Stack.Screen options={{ title: `Announcements` }} />
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.subtitle}>Direction: {direction}</Text>
        <Divider height={20} />
        <View style={{ flexDirection: "row", paddingBottom: 10 }}>
          <Text style={[styles.announcementsHeader, { flex: 2 }]}>Line</Text>
          <Text style={[styles.announcementsHeader, { flex: 7 }]}>
            Announcement
          </Text>
        </View>
        <ScrollView>
          {announcements.map((announcement, i) => (
            <AnnouncementItem
              key={`${announcement.lineCode}-${i}`}
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
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.subtitle}>Direction: {direction}</Text>
        <Divider height={20} />
        <Text style={styles.announcementItem}>Loading...</Text>
      </View>
    );
  }
}

function AnnouncementItem({
  announcement,
}: {
  announcement: ToplasApi.StopAnnouncement;
}) {
  return (
    <View style={{ flexDirection: "row" }}>
      <Link
        href={{
          pathname: "/lines/[code]",
          params: { code: announcement.lineCode },
        }}
        style={[styles.linesTableText, { flex: 2 }]}
      >
        {announcement.lineCode}
      </Link>
      <Text style={[styles.announcementItem, { flex: 7 }]}>
        {announcement.information}
      </Text>
    </View>
  );
}
