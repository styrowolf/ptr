import Divider from "@/app/components/divider";
import { ToplasAPICache } from "@/app/storage";
import { chunkArray } from "@/app/utils";
import { ToplasApi } from "@/sdks/typescript";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  tableText: {
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontSize: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "bold",
  },
  selected: {
    opacity: 0.2,
  },
  dayButtons: {
    fontSize: 16,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },
});

export default function SchedulePage() {
  const { code, routeCode } = useLocalSearchParams();
  const [dayType, setDayType] = useState<ToplasApi.DayType>(
    ToplasApi.DayType.WorkingDay,
  );
  const insets = useSafeAreaInsets();

  const lineInfo: ToplasApi.LineInfo = ToplasAPICache.getLineInfo(
    code as string,
  )!;

  const selectedRoute = lineInfo.routes.find((e) => e.routeCode == routeCode)!;
  const trips = selectedRoute.trips.filter((e) => e.dayType == dayType);
  const rows = groupIntoHours(trips);

  return (
    <View
      style={{
        paddingBottom: insets.bottom,
        paddingTop: 10,
        paddingHorizontal: 10,
        flex: 1,
      }}
    >
      <Stack.Screen options={{ title: `${code}` }} />
      <Text style={styles.title}>{`${code} (${selectedRoute.routeName})`}</Text>
      <Divider height={20} />
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          onPress={() => setDayType(ToplasApi.DayType.WorkingDay)}
          style={[{ flex: 1 }]}
        >
          <Text
            style={[
              styles.dayButtons,
              dayType == ToplasApi.DayType.WorkingDay && styles.selected,
            ]}
          >
            Weekdays
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setDayType(ToplasApi.DayType.Saturday)}
          style={[{ flex: 1 }]}
        >
          <Text
            style={[
              styles.dayButtons,
              dayType == ToplasApi.DayType.Saturday && styles.selected,
            ]}
          >
            Saturday
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setDayType(ToplasApi.DayType.Sunday)}
          style={[{ flex: 1 }]}
        >
          <Text
            style={[
              styles.dayButtons,
              dayType == ToplasApi.DayType.Sunday && styles.selected,
            ]}
          >
            Sunday
          </Text>
        </TouchableOpacity>
      </View>
      <Divider height={20} />
      <ScrollView>
        {Object.entries(rows).map(([hour, minutes]) => (
          <ScheduleRow
            key={`${hour}${minutes}`}
            hour={hour}
            minutes={minutes}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function groupIntoHours(
  trips: ToplasApi.TimetableTrip[],
): Record<number, string[]> {
  const hours: Record<number, string[]> = {};
  for (const trip of trips) {
    const hour = Number(trip.time.split(":")[0]);
    let minute = trip.time.split(":")[1];
    if (minute.length < 2) {
      minute = `0${minute}`;
    }
    if (!hours[hour]) {
      hours[hour] = [minute];
    } else {
      hours[hour].push(minute);
    }
  }
  return hours;
}

function ScheduleRow({ hour, minutes }: { hour: string; minutes: string[] }) {
  const chunked = chunkArray(minutes, 5);
  const minutesText = chunked.map((chunk) => chunk.join(" | ")).join("\n");

  return (
    <>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <Text style={[{ flex: 2 }, styles.tableText]}>{hour}</Text>
        <Text style={[{ flex: 9 }, styles.tableText]}>{minutesText}</Text>
      </View>
      <Divider height={10} />
    </>
  );
}
