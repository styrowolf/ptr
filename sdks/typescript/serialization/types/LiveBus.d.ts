/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "..";
import * as ToplasApi from "../../api";
import * as core from "../../core";
export declare const LiveBus: core.serialization.ObjectSchema<serializers.LiveBus.Raw, ToplasApi.LiveBus>;
export declare namespace LiveBus {
    interface Raw {
        line_id: number;
        route_code: string;
        vehicle_door_no: string;
        last_location_time: string;
        last_location: serializers.Coordinates.Raw;
        stop_order: number;
        stop_id: number;
        stop_enter_time?: string | null;
        stop_exit_time?: string | null;
    }
}
