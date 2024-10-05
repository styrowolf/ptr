import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, Touchable, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import appStyles from "./styles"
import Divider from "./components/divider";
import { ToplasPreferences } from "./storage";
import { useState } from "react";

const styles = StyleSheet.create({
    sectionTitle: appStyles.t24b,
    subsectionTitle: appStyles.t20b,
    text: StyleSheet.flatten([appStyles.t16, { paddingVertical: 4 }]),
    selectedOpacity: {
        opacity: 0.5,
    }
});

function mapStyleChangeCallback(style: "light" | "dark" | "grayscale", setter: (style: string) => void) {
    setter(style);
    ToplasPreferences.setMapStyle(style);
}

export default function Settings() {
    const { t } = useTranslation([], { keyPrefix: "settings" });
    const [selectedMapStyle, setSelectedMapStyle] = useState(ToplasPreferences.getMapStyle());

    return (
        <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10 }}>
            <Stack.Screen
                options={{
                title: t("title"),
                }}
            />
            <Text style={styles.sectionTitle}>Recents</Text>
            <TouchableOpacity onPress={() => ToplasPreferences.clearRecentLines()}>
                <Text style={styles.text}>Clear recent lines</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => ToplasPreferences.clearRecentStops()}>
                <Text style={styles.text}>Clear recent stops</Text>
            </TouchableOpacity>
            <Divider height={20} />
            <Text style={styles.sectionTitle}>Maps</Text>
            <View style={{ flex: 1, flexDirection: "row", gap: 20}}>
                <Text style={styles.text}>Map style:</Text>
                <TouchableOpacity onPress={() => mapStyleChangeCallback("light", setSelectedMapStyle)}>
                    <Text style={[styles.text, selectedMapStyle === "light" && styles.selectedOpacity]}>Light</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => mapStyleChangeCallback("grayscale", setSelectedMapStyle)}>
                    <Text style={[styles.text, selectedMapStyle === "grayscale" && styles.selectedOpacity]}>Grayscale</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => mapStyleChangeCallback("dark", setSelectedMapStyle)}>
                    <Text style={[styles.text, selectedMapStyle === "dark" && styles.selectedOpacity]}>Dark</Text>
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1, flexDirection: "row", gap: 20}}>
                <Text style={styles.text}>Map style:</Text>
                <TouchableOpacity onPress={() => mapStyleChangeCallback("light", setSelectedMapStyle)}>
                    <Text style={[styles.text, selectedMapStyle === "light" && styles.selectedOpacity]}>Light</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => mapStyleChangeCallback("grayscale", setSelectedMapStyle)}>
                    <Text style={[styles.text, selectedMapStyle === "grayscale" && styles.selectedOpacity]}>Grayscale</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => mapStyleChangeCallback("dark", setSelectedMapStyle)}>
                    <Text style={[styles.text, selectedMapStyle === "dark" && styles.selectedOpacity]}>Dark</Text>
                </TouchableOpacity>
            </View>
            <Divider height={20} />
        </ScrollView>
    );
}