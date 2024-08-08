import { ToplasApi } from "@/sdks/typescript";
import { MMKV } from "react-native-mmkv";


export class ToplasAPICache {
    static storage = new MMKV({ id: "toplas-api-cache" });;

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