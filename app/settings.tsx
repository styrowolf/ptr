import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, Touchable, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import appStyles from "./styles"
import Divider from "./components/divider";
import { ToplasPreferences } from "./storage";
import { useState } from "react";
import { Dropdown } from "react-native-element-dropdown";
import ToplasLanguageModule from "./languageProvider";
import i18n from "i18next";
import { set } from "@/sdks/typescript/core/schemas";

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

const languageOptions = [
    { label: "English", value: "en" },
    { label: "Türkçe", value: "tr" },
];

export default function Settings() {
    const { t } = useTranslation([], { keyPrefix: "settings" });
    const [selectedMapStyle, setSelectedMapStyle] = useState(ToplasPreferences.getMapStyle());
    const [selectedLanguage, setSelectedLanguage] = useState(ToplasLanguageModule.detect() as string);

    return (
        <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10 }}>
            <Stack.Screen
                options={{
                title: t("title"),
                }}
            />
            <Text style={styles.sectionTitle}>{t('recents')}</Text>
            <TouchableOpacity onPress={() => ToplasPreferences.clearRecentLines()}>
                <Text style={styles.text}>{t('clearRecentLines')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => ToplasPreferences.clearRecentStops()}>
                <Text style={styles.text}>{t('clearRecentStops')}</Text>
            </TouchableOpacity>
            <Divider height={20} />
            <Text style={styles.sectionTitle}>{t('maps')}</Text>
            <View style={{ flex: 1, flexDirection: "row", gap: 20}}>
                <Text style={styles.text}>{t('mapStyle')}:</Text>
                <TouchableOpacity onPress={() => mapStyleChangeCallback("light", setSelectedMapStyle)}>
                    <Text style={[styles.text, selectedMapStyle === "light" && styles.selectedOpacity]}>{t('light')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => mapStyleChangeCallback("grayscale", setSelectedMapStyle)}>
                    <Text style={[styles.text, selectedMapStyle === "grayscale" && styles.selectedOpacity]}>{t('grayscale')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => mapStyleChangeCallback("dark", setSelectedMapStyle)}>
                    <Text style={[styles.text, selectedMapStyle === "dark" && styles.selectedOpacity]}>{t('dark')}</Text>
                </TouchableOpacity>
            </View>
            <Divider height={20} />
            <Text style={styles.sectionTitle}>{t('language')}</Text>
            <Dropdown
                style={{ flex: 1 }}
                placeholderStyle={styles.text}
                placeholder={t('language')}
                itemTextStyle={styles.text}
                selectedTextStyle={styles.text}
                value={selectedLanguage}
                data={languageOptions}
                onChange={async (e) => {
                    setSelectedLanguage(e.value);
                    ToplasPreferences.setLanguage(e.value);
                    await i18n.changeLanguage(e.value);
                }} labelField={"label"} valueField={"value"} 
            />
            <Divider height={20} />
        </ScrollView>
    );
}