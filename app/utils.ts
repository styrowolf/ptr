import { ToplasApi } from "@/sdks/typescript";
import MapLibreGL from "@maplibre/maplibre-react-native";
import OnPressEvent from "@maplibre/maplibre-react-native/javascript/types/OnPressEvent";

export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        chunks.push(chunk);
    }
    return chunks;
}

export function arrayPad(array: any[], length: number, padding: any): any[] {
    const paddingNeeded = length - array.length;
    return [...array, ...Array(paddingNeeded).fill(padding)];
}

export function isDeparRoute(routeCode: string): boolean {
    return routeCode.split("_")[2] != "D0";
}

export function isOppositeDirection(r1: ToplasApi.RouteInfo, r2: ToplasApi.RouteInfo): boolean {
    if (r1.routeCode == r2.routeCode) return false;

    const splits1 = r1.routeCode.split("_");
    const splits2 = r2.routeCode.split("_");

    const oppositeByCode = splits1[0] == splits2[0] && splits1[1] != splits2[1] && splits1[2] == splits2[2];

    if (oppositeByCode) return true;

    const isDepar1 = isDeparRoute(r1.routeCode);
    const isDepar2 = isDeparRoute(r2.routeCode);

    if (isDepar1 != isDepar2) return false;

    const nameSplits1 = r1.routeName.split("-").map((e) => e.trim());
    const nameSplits2 = r2.routeName.split("-").map((e) => e.trim());
    const sameName = r1.routeName == r2.routeName;

    const oppositeByName = nameSplits1[0] == nameSplits2[1] && nameSplits1[1] == nameSplits2[0] && !sameName;

    return oppositeByName;
}

export const MAP_BOUNDS = { ne: [27.970848, 40.737673], sw: [29.958805, 41.671000] };
export const MAP_PADDING = 50;
export const MAX_ZOOM = 15;
export const MAP_STYLE_URL = "https://0x0.st/XVue.json";
//export const MAP_STYLE_URL = "https://0x0.st/XVuj.json";

export function getBounds(stops: ToplasApi.LineStop[]): MapLibreGL.CameraBounds {
    const min = { x: Infinity, y: Infinity };
    const max = { x: -Infinity, y: -Infinity };

    stops.forEach((e) => {
        min.x = Math.min(min.x, e.coordinates.x);
        min.y = Math.min(min.y, e.coordinates.y);
        max.x = Math.max(max.x, e.coordinates.x);
        max.y = Math.max(max.y, e.coordinates.y);
    });

    return { ne: [max.x, max.y], sw: [min.x, min.y] };
}

export function getPadding(padding: number): MapLibreGL.CameraPadding {
    return { paddingBottom: padding, paddingLeft: padding, paddingRight: padding, paddingTop: padding };
}

export function selectClosestFeature(onPressEvent: OnPressEvent): GeoJSON.Feature {
    let minDist = 0;
    let closestFeature = null;
    
    onPressEvent.features.forEach((feature) => {
      // @ts-ignore
      const x = feature.geometry.coordinates[0];
      // @ts-ignore
      const y = feature.geometry.coordinates[1];

      // @ts-ignore
      const dist = (onPressEvent.coordinates.longitude - x) ** 2 + (onPressEvent.coordinates.latitude - y) ** 2;
      if (minDist == 0 || dist < minDist) {
        minDist = dist;
        closestFeature = feature;
      }
    });
    // @ts-ignore
    return closestFeature;
  }

export const stopLayerStyle = {
    circleRadius: 8,
    circleColor: "white",
    circleStrokeColor: "black",
    circleStrokeWidth: 3,
} satisfies MapLibreGL.CircleLayerStyle;