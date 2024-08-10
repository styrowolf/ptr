import { ToplasApiClient, ToplasApi } from "@/sdks/typescript";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { ScrollView } from "react-native-gesture-handler";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { FontAwesome5, Octicons } from "@expo/vector-icons";
import Divider from "@/app/components/divider";
import { arrayPad, chunkArray } from "../../utils";
import { set } from "@/sdks/typescript/core/schemas";
import { ToplasAPICache } from "../../storage";

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
        fontWeight: 'bold',
    },
    dropdownText: {
        fontSize: 16,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    },
    text: {
        fontSize: 16,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    },
    subtitle: {
        fontSize: 16,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
        fontStyle: 'italic'
    },
    linesTableText: {
        fontSize: 20,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
        fontWeight: 'bold',
    },
    arrivalItem: {
        padding: 4,
        fontSize: 16,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    },
    arrivalsHeader: {
        fontSize: 16,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    },
});

export default function StopPage() {
    const { code, name, direction } = useLocalSearchParams();

    const [stopInfo, setStopInfo] = useState<ToplasApi.StopInfo | null>(null);
    const [error, setError] = useState(null);
    const [arrivals, setArrivals] = useState<ToplasApi.Arrival[]>([]);

    useEffect(() => {
        const client = new ToplasApiClient({ environment: () => "https://toplas.kurt.town/api"});

        const stopInfo = client.stopInfo(Number(code));

        stopInfo.then((val) => {
            ToplasAPICache.setStopInfo(code as string, val);
            setStopInfo(val);
        }).catch(setError);

        function getLiveData() {
            const liveData = client.stopArrivals(Number(code));
            
            liveData.then((val) => { 
                ToplasAPICache.setArrivals(code as string, val)
                setArrivals(val)
            }).catch((val) => ToplasAPICache.setArrivals(code as string, []));
        }

        getLiveData();

        const id = setInterval(getLiveData, 20000);
        return () => clearInterval(id);
    }, []);

    if (stopInfo) {
        const chunkedLines = chunkArray(stopInfo.lines, 4);
        return (<SafeAreaView style={[{ flex: 1}]}>
            <Stack.Screen
                options={{
                    title: `${name}`,
                }}
            />
            <View style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
                <Text style={styles.title}>{name}</Text>
                <Text style={styles.subtitle}>Direction: {direction}</Text>
                <Divider height={20}/>
                <Link href={{pathname: "/stops/[code]/announcements", params: { code: code as string, name: stopInfo.stopName, direction: stopInfo.direction }}} style={[styles.text]}>Announcements <Octicons name="report" size={16} color="black" /></Link>
                <Divider height={20}/>
                <View>
                    <Text style={styles.text}>Lines</Text>
                    {chunkedLines.map((chunk, i) => (
                        <View key={`${chunk.map((e) => e.routeCode).join("-")}-${i}`} style={{ flexDirection: "row" }}>
                            {arrayPad(chunk, 4, (<View style={{ flex: 1}}></View>)).map((line) => (<Link style={[{ flex: 1 }, styles.linesTableText]} href={{ pathname: "/lines/[code]", params: { code: line.lineCode } }}>{line.lineCode}</Link>))}
                        </View>
                    ))}
                </View>
                <Divider height={20}/>
                <Text style={[styles.text, { paddingBottom: 5 }]}>Arrivals</Text>
                <View style={{ flexDirection: "row" }}>
                    <Text style={[{ flex: 3 }, styles.arrivalsHeader]}>Line</Text>
                    <Text style={[{ flex: 12 }, styles.arrivalsHeader]}>Line Name</Text>
                    <Text style={[{ flex: 2 }, styles.arrivalsHeader]}>mins</Text>
                </View>
                <ScrollView style={{ paddingBottom: 10 }}>
                    {arrivals.map((arrival, i) => (
                        <View key={`${arrival.routeCode}-${i}`} style={{ flexDirection: "row" }}>
                            <Text style={[{ flex: 3 }, styles.linesTableText]}><Link href={{ pathname: "/lines/[code]", params: { code: arrival.lineCode, routeCode: arrival.routeCode }}}>{arrival.lineCode}</Link></Text>
                            <Text style={[{ flex: 12 }, styles.arrivalItem]} numberOfLines={1} ellipsizeMode="tail"><Link href={{ pathname: "/bus/[vehicleDoorNo]", params: { vehicleDoorNo: arrival.vehicleDoorNo, lineCode: arrival.lineCode, routeCode: arrival.routeCode }}}>{arrival.lineName}</Link></Text>
                            <Text style={[{ flex: 2 }, styles.arrivalItem]}>{arrival.minutesUntilArrival}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View> 
        </SafeAreaView>)
    } else if (error) {
        return (<SafeAreaView style={{ flex: 1 }}>
            <Stack.Screen
                options={{
                    title: `${name}`,
                }}
            />
            <View style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10}}>
                <Text style={styles.title}>{name}</Text>
                <Text style={styles.subtitle}>Direction: {direction}</Text>
                <Divider height={20}/>
                <Text style={styles.text}>Stop information cannot be retrieved at the moment.</Text>
            </View>
        </SafeAreaView>)
    } else {
        return (<SafeAreaView style={{ flex: 1 }}>
            <Stack.Screen
                options={{
                    title: `${name}`,
                }}
            />
            <View style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10}}>
                <Text style={styles.title}>{name}</Text>
                <Text style={styles.subtitle}>Direction: {direction}</Text>
                <Divider height={20}/>
                <Text style={styles.text}>Loading...</Text>
            </View>
        </SafeAreaView>)
    }
}