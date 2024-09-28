import { Platform, StyleSheet } from "react-native";

const styles = StyleSheet.create({
    t16: {
        fontSize: 16,
        fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    },
    t16i: {
        fontSize: 16,
        fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
        fontStyle: "italic",
    },
    t20b: {
        fontSize: 20,
        fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
        fontWeight: "bold",
    },
    t24b: {
        fontSize: 24,
        fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
        fontWeight: "bold",
    },
    screenTitle: {
        fontSize: 24,
        fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
        fontWeight: "bold",
        fontStyle: "italic",
    },
});

export default styles;