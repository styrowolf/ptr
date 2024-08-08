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
    announcementItem: {
        padding: 4,
        fontSize: 16,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    },
})

export default function Announcements() {
    const insets = useSafeAreaInsets();
    const { code, name } = useLocalSearchParams();

    const [announcements, setAnnouncements] = useState<ToplasApi.LineAnnouncement[] | null>(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const client = new ToplasApiClient({ environment: () => "https://toplas.kurt.town/api"});
        client.lineAnnouncementsLiveLineLineCodeAnnouncementsGet(code as string).then((val) => { setAnnouncements(val) }).catch(setError);
    }, []);
    
    if (!announcements) {
        return <View>
            <Stack.Screen options={{ title: `Announcements`}} />
            <Text>Error</Text>
        </View>
    }

    return <View style={{ paddingBottom: insets.bottom, paddingTop: 10, paddingHorizontal: 10, flex: 1 }}>
    <Stack.Screen options={{ title: `Announcements`}} />
    <Text style={styles.title}>{`${code} (${name})`}</Text>
    <Divider height={20}/>
    <ScrollView>
        { announcements.map((announcement, i) => <View key={`${announcement.lineCode}-${i}`} style={{ flexDirection: "row" }}>
                                <Text style={[styles.announcementItem, { flex: 1 }]}>{announcement.information}</Text>
                            </View>) }
    </ScrollView>
</View>
}