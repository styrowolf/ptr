import Divider from "@/app/components/divider";
import { ToplasApi, ToplasApiClient } from "@/sdks/typescript";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ScrollView, Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
        fontStyle: 'italic'
    },
    announcementItem: {
        padding: 4,
        fontSize: 16,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    },
    announcementsHeader: {
        fontSize: 16,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    },
    linesTableText: {
        fontSize: 20,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
        fontWeight: 'bold',
    },
})

export default function Announcements() {
    const insets = useSafeAreaInsets();
    const { code, name, direction } = useLocalSearchParams();

    const [announcements, setAnnouncements] = useState<ToplasApi.LineAnnouncement[] | null>(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const client = new ToplasApiClient({ environment: () => "https://toplas.kurt.town/api"});
        client.stopAnnouncementsLiveStopStopCodeAnnouncementsGet(Number(code)).then((val) => { setAnnouncements(val) }).catch(setError);
    }, []);
    
    if (!announcements) {
        return <View>
            <Stack.Screen options={{ title: `Announcements`}} />
            <Text>Error</Text>
        </View>
    }

    return <View style={{ paddingBottom: insets.bottom, paddingTop: 10, paddingHorizontal: 10, flex: 1 }}>
    <Stack.Screen options={{ title: `Announcements`}} />
    <Text style={styles.title}>{name}</Text>
    <Text style={styles.subtitle}>Direction: {direction}</Text>
    <Divider height={20}/>
    <View style={{ flexDirection: "row", paddingBottom: 10 }}>
            <Text style={[styles.announcementsHeader, { flex: 2 }]}>Line</Text>
            <Text style={[styles.announcementsHeader, { flex: 7 }]}>Announcement</Text>
        </View>
    <ScrollView>
        { announcements.map((announcement, i) => (
            <View key={`${announcement.lineCode}-${i}`} style={{ flexDirection: "row" }}>
                <Link href={{ pathname: "/lines/[code]", params: { code: announcement.lineCode } }} style={[styles.linesTableText, { flex: 2 }]}>{announcement.lineCode}</Link>
                <Text style={[styles.announcementItem, { flex: 7 }]}>{announcement.information}</Text>
            </View>
        )) }
    </ScrollView>
</View>
}