import { ToplasApi } from "@/sdks/typescript";
import { MMKV } from "react-native-mmkv";

export class ToplasAPICache {
  static storage = new MMKV({ id: "toplas-api-cache" });

  static get<T>(key: string): T | null {
    try {
      const jsonString = this.storage.getString(key);
      if (!jsonString) return null;
      return JSON.parse(jsonString) satisfies T;
    } catch {
      return null;
    }
  }

  static set(key: string, value: any) {
    this.storage.set(key, JSON.stringify(value));
  }

  public static clear() {
    this.storage.clearAll();
  }

  public static getLineInfo(code: string): ToplasApi.LineInfo | null {
    return this.get(`lineInfo:${code}`);
  }

  public static setLineInfo(code: string, lineInfo: ToplasApi.LineInfo) {
    this.set(`lineInfo:${code}`, lineInfo);
  }

  public static getArrivals(code: string): ToplasApi.Arrival[] | null {
    return this.get(`arrivals:${code}`);
  }

  public static setArrivals(code: string, arrivals: ToplasApi.Arrival[]) {
    this.set(`arrivals:${code}`, arrivals);
  }

  public static getLiveBuses(code: string): ToplasApi.LiveBus[] | null {
    return this.get(`liveBus:${code}`);
  }

  public static setLiveBuses(code: string, liveBuses: ToplasApi.LiveBus[]) {
    this.set(`liveBus:${code}`, liveBuses);
  }

  public static getStopInfo(code: string): ToplasApi.StopInfo | null {
    return this.get(`stopInfo:${code}`);
  }

  public static setStopInfo(code: string, stopInfo: ToplasApi.StopInfo) {
    this.set(`stopInfo:${code}`, stopInfo);
  }
}

export interface LineWithRoute
  extends Omit<ToplasApi.Line, "lineId" | "lineName"> {
  routeCode?: string;
}

export interface StopWithoutId extends Omit<ToplasApi.Stop, "stopId"> {}

export class ToplasPreferences {
  static storage = new MMKV({ id: "toplas-preferences" });

  static get<T>(key: string): T | null {
    try {
      const jsonString = this.storage.getString(key);
      if (!jsonString) return null;
      return JSON.parse(jsonString) satisfies T;
    } catch {
      return null;
    }
  }

  static set(key: string, value: any) {
    this.storage.set(key, JSON.stringify(value));
  }

  public static clear() {
    this.storage.clearAll();
  }

  public static getRecentStops(): StopWithoutId[] {
    return this.get("recentStops") ?? [];
  }

  public static setRecentStops(stops: StopWithoutId[]) {
    this.set("recentStops", stops);
  }

  public static appendRecentStop(stop: StopWithoutId) {
    const maxRecentStops = 10;
    let stops = this.getRecentStops();
    const index = stops.findIndex((e) => e.stopCode == stop.stopCode);
    if (index != -1) {
      stops.splice(index, 1);
    }
    const length = stops.unshift(stop);

    if (length > maxRecentStops) {
      stops = stops.slice(0, maxRecentStops - 1);
    }

    this.setRecentStops(stops);
  }

  public static clearRecentStops() {
    this.setRecentStops([]);
  }

  public static getRecentLines(): LineWithRoute[] {
    return this.get("recentLines") ?? [];
  }

  public static appendRecentLine(line: LineWithRoute) {
    const maxRecentLines = 12;
    let lines = this.getRecentLines();
    const index = lines.findIndex((e) => e.lineCode == line.lineCode);
    if (index != -1) {
      lines.splice(index, 1);
    }
    const length = lines.unshift(line);

    if (length > maxRecentLines) {
      lines = lines.slice(0, maxRecentLines - 1);
    }

    this.setRecentLines(lines);
  }

  public static setRecentLines(lines: LineWithRoute[]) {
    this.set("recentLines", lines);
  }

  public static clearRecentLines() {
    this.setRecentLines([]);
  }

  // Map style
  public static getMapStyle(): string {
    return this.get("mapStyle") ?? "light";
  }

  public static setMapStyle(style: "light" | "dark" | "grayscale") {
    this.set("mapStyle", style);
  }

  public static getMapStyleUrl(): string {
    const style = this.getMapStyle();
    return `https://fra-1.toplas.xyz/maplibre_styles/${style}.json`;
  }

  // Language
  public static getLanguage(): string {
    return this.get("language") ?? "system";
  }

  public static setLanguage(language: string) {
    this.set("language", language);
  }
}