import { OfflineProgressStatus } from '@maplibre/maplibre-react-native/javascript/modules/offline/offlineManager';
import OfflinePack from '@maplibre/maplibre-react-native/javascript/modules/offline/OfflinePack';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { MAP_BOUNDS } from './utils';
import { ToplasPreferences } from './storage';

interface OfflineMapStatus {
    pack: OfflinePack;
    status: OfflineProgressStatus;
}

type OfflineMapStatusCallback = (status?: OfflineMapStatus) => void;

// this class is designed as a singleton
// it was designed to have only one listener at a time
class OfflineMapManager {
    initialized: boolean = false;
    isTherePack: boolean = false;
    lastPackName: string | null = null;
    listener?: OfflineMapStatusCallback;
    status?: OfflineMapStatus;

    async initialize() {
        if (this.initialized) {
            return;
        }
        const packs = await MapLibreGL.offlineManager.getPacks();
        if (packs.length === 0) {
            this.initialized = true;
            this.isTherePack = false;
        } else {
            this.initialized = true;
            this.isTherePack = true;
            this.lastPackName = this.isTherePack ? packs[0].name : null;
            this.status = { pack: packs[0], status: await packs[0].status() };
        }
    }

    async subscribe(listener: OfflineMapStatusCallback) {
        await this.initialize();
        this.listener = listener;
        this._notify();
    }

    async unsubscribe() {
        this.listener = undefined;
        await this._resetState();
    }

    async _resetState() {
        this.initialized = false;
        this.isTherePack = false;
        this.lastPackName = null;
        this.status = undefined;
    }

    async resetDatabase() {
        await this._none();
        await MapLibreGL.offlineManager.resetDatabase();
    }

    async onChange(option: "none" | "low" | "medium" | "high") {
        if (option === "none") {
            await this._none();
        } else {
            await this._createPack(option)
        }
    }

    async _none() {
        if (this.lastPackName) {
            await this._teardownMaplibreSubscription();
            await MapLibreGL.offlineManager.deletePack(this.lastPackName);
            this.lastPackName = null;
        }
        this.isTherePack = false;
        await this._notify();
    }

    async _createPack(detail: "low" | "medium" | "high") {
        if (this.lastPackName) {
            await this._teardownMaplibreSubscription();
            await MapLibreGL.offlineManager.deletePack(this.lastPackName);
            this.lastPackName = null;
        }
        const maxZoom = detail === "low" ? 13 : detail === "medium" ? 14 : 15;
        await MapLibreGL.offlineManager.createPack({
            name: `istanbulOffline-${detail}`,
            minZoom: 0,
            maxZoom: maxZoom,
            bounds: [MAP_BOUNDS.ne, MAP_BOUNDS.sw],
            styleURL: ToplasPreferences.getMapStyleUrl(),
        }, () => {}, () => {});
        const packs = await MapLibreGL.offlineManager.getPacks();
        this.lastPackName = packs[0].name;
        this.isTherePack = true;
        this.status = { pack: packs[0], status: await packs[0].status() };
        await this._notify();
        await this._setupMaplibreSubscription();
    }

    async _notify() {
        // for debugging: console.log("Notifying", this.isTherePack ? this.status : undefined);
        if (this.listener) {
            await this.listener(this.isTherePack ? this.status : undefined);
        }
    }

    async _teardownMaplibreSubscription() {
        if (this.lastPackName) {
            await MapLibreGL.offlineManager.unsubscribe(this.lastPackName);
        }
    }

    async _setupMaplibreSubscription() {
        if (this.lastPackName) {
            await MapLibreGL.offlineManager.subscribe(this.lastPackName, async (pack, status) => {
                this.status = { pack, status };
                await this._notify();
            }, async (error) => {});
        }
    }

    async invalidatePack() {
        if (this.lastPackName) {
            await MapLibreGL.offlineManager.invalidatePack(this.lastPackName);
        }
    }
}

export const ToplasOfflineManager = new OfflineMapManager();
export default ToplasOfflineManager;