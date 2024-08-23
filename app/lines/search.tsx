import { ToplasApi } from "@/sdks/typescript";
import { FontAwesome6 } from "@expo/vector-icons";
import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, SafeAreaView, TextInput, StyleSheet, Platform, TouchableOpacity, KeyboardAvoidingView } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useDebounce } from "use-debounce";
import { useHeaderHeight } from '@react-navigation/elements'
import { ToplasDataProvider } from "../provider";
import { ToplasPreferences } from "../storage";

const styles = StyleSheet.create({
    text: {
        fontSize: 20,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    },
    errorText: {
        fontSize: 16,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    },
    searchBox: {
        borderWidth: 2,
        borderColor: "black",
        height: 40,
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    },
    lineCode: {
        fontSize: 20,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
        fontStyle: 'italic'
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
        paddingHorizontal: 10 
    }
});

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [debouncedQuery] = useDebounce(query, 300);
    const height = useHeaderHeight();

    return (<KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={height} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Stack.Screen
            options={{
                title: "Search Lines",
            }}
        />
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10}}>
            <TextInput style={styles.searchBox} placeholder="search by line name or code" placeholderTextColor="black" onChangeText={(text) => setQuery(text)}></TextInput>
            <SearchResults query={debouncedQuery}></SearchResults>
        </View>
    </KeyboardAvoidingView>)
}

function SearchResults({query}: {query: string}) {
    const [data, setData] = useState<ToplasApi.Line[] | null>(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (query == "") {
            setData([]);
            return;
        }
        const lines = ToplasDataProvider.searchLines(query);
        lines.then((val) => {
            setData(val);
        }).catch(setError);
    }, [query])

    if (data) {
        // TODO: same as TODO in stops/search.tsx 
        return <ScrollView style={{ paddingTop: 10, }}>
            {data.map((e, i) => (<View key={`${e.lineCode}-${i}`}><SearchItem line={e}/><View style={{ height: 10 }}/></View>))}
        </ScrollView>;
    } else {
        return <Text style={[styles.errorText, { marginTop: 10 }]}>Searching for lines is not possible at this moment.</Text>
    }
}

function SearchItem({ line }: { line: ToplasApi.Line }) {
    return <TouchableOpacity onPress={() => {
            router.push({ pathname: "/lines/[code]", params: { code: line.lineCode, name: line.lineName } });
            ToplasPreferences.appendRecentLine(line);
        }}>
        <View style={styles.searchItemView}>
            <View style={{ flex: 2 }}>
                <FontAwesome6 style={{}} name="bus-simple" size={24} />
            </View>
            <Text style={[styles.lineCode, { flex: 3, }]}>{line.lineCode}</Text>
            <Text style={[styles.subtitle, { flex: 10 }]}>{line.lineName}</Text>
        </View>
    </TouchableOpacity>
}