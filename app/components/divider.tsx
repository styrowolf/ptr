import { View, StyleSheet } from "react-native";

export default function Divider({ height }: { height?: number }) {
    const styles = StyleSheet.create({
        divider: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: "black",
        },
    });
    const halfHeight = (height || 10) / 2;
    return (
        <>
            <View style={{ height: halfHeight }} />
            <View style={styles.divider} />
            <View style={{ height: halfHeight }} />
        </>
    );
}