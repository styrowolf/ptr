import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, Touchable, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import appStyles from "./styles"
import Divider from "./components/divider";
import { ToplasPreferences } from "./storage";
import { useEffect, useState } from "react";
import { Dropdown } from "react-native-element-dropdown";
import ToplasLanguageModule from "./languageProvider";
import i18n, { use } from "i18next";
import MapLibreGL from "@maplibre/maplibre-react-native";
import { ENABLE_OFFLINE_MAP_SETTINGS, MAP_BOUNDS } from "./utils";
import OfflinePack from "@maplibre/maplibre-react-native/javascript/modules/offline/OfflinePack";
import { OfflinePackError, OfflineProgressStatus } from "@maplibre/maplibre-react-native/javascript/modules/offline/offlineManager";
import ToplasOfflineManager from "./mapManager";
import * as WebBrowser from 'expo-web-browser';

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

const mapStyleOptions: { value: "light" | "dark" | "grayscale" }[] = [
    { value: "light" },
    { value: "dark" },
    { value: "grayscale" },
];

const offlineMapOptions: { value: "none" | "low" | "medium" | "high" }[] = [
    { value: "none" },
    { value: "low" },
    { value: "medium" },
    { value: "high" },
];

function nameToOptionValue(name: string): "none" | "low" | "medium" | "high" {
    if (name.includes("low")) {
        return "low";
    } else if (name.includes("medium")) {
        return "medium";
    } else if (name.includes("high")) {
        return "high";
    } else {
        return "none";
    }
}

function mapSizeFormat(num: number) {
    return (Math.round(num * 100) / 100).toFixed(2);
}

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
            <Text style={styles.text}>{t('mapStyle')}</Text>
            <Dropdown
                style={{ flex: 1 }}
                placeholderStyle={styles.text}
                placeholder={t('language')}
                itemTextStyle={styles.text}
                selectedTextStyle={styles.text}
                value={selectedMapStyle}
                data={mapStyleOptions.map((e) => ({ label: t(e.value), value: e.value }))}
                onChange={async (e) => {
                    mapStyleChangeCallback(e.value, setSelectedMapStyle);
                }} labelField={"label"} valueField={"value"} 
            />
            <Divider height={20} />
            { ENABLE_OFFLINE_MAP_SETTINGS && <>
                <OfflineMapSettings />
                <Divider height={20} />
            </>}
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
            <TouchableOpacity onPress={async () => {
                await WebBrowser.openBrowserAsync('https://toplas.xyz/data-attribution');
            }}><Text style={styles.text}>Data Attribution</Text></TouchableOpacity>
            <Divider height={20} />
            <TouchableOpacity onPress={async () => {
                await WebBrowser.openBrowserAsync('https://toplas.xyz/licenses');
            }}><Text style={styles.text}>Licenses</Text></TouchableOpacity>
        </ScrollView>
    );
}

export function OfflineMapSettings() {
    const { t } = useTranslation([], { keyPrefix: "settings" });
    const [pack, setPack] = useState<OfflinePack | null>(null);
    const [packStatus, setPackStatus] = useState<OfflineProgressStatus | null>(null);

    useEffect(() => {
        ToplasOfflineManager.subscribe((status) => {
            setPack(status?.pack ?? null);
            setPackStatus(status?.status ?? null);
        });
        return () => {
            (async () => { 
                await ToplasOfflineManager.unsubscribe();
            })()
        }
    }, []);

    return (<>
        <Text style={styles.text}>{t('offlineMap')}</Text>
        <Dropdown
            style={{ flex: 1 }}
            placeholderStyle={styles.text}
            placeholder="Offline map quality"
            itemTextStyle={styles.text}
            selectedTextStyle={styles.text}
            value={nameToOptionValue(pack?.name ?? "none")}
            data={offlineMapOptions.map((e) => ({ label: t(`${e.value}MapQuality`), value: e.value }))}
            onChange={async (e) => { await ToplasOfflineManager.onChange(e.value); }} 
            labelField={"label"} 
            valueField={"value"}
        />
        { pack && <Text style={styles.text}>{t('mapPercent')}: {packStatus?.percentage}%</Text> }
        { pack && <Text style={styles.text}>{t('mapDataSize')}: {mapSizeFormat((packStatus?.completedResourceSize ?? 0) / (Math.pow(10, 6)))}MB</Text> }
        { pack && <TouchableOpacity onPress={async () => await ToplasOfflineManager.invalidatePack()}><Text style={styles.text}>{t('invalidatePack')}</Text></TouchableOpacity>}
        <TouchableOpacity onPress={async () => await ToplasOfflineManager.resetDatabase()}><Text style={styles.text}>{t('deleteAllMapData')}</Text></TouchableOpacity>
        
    </>)
}