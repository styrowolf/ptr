/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "..";
import * as ToplasApi from "../../api";
import * as core from "../../core";
export declare const LiveBusIndividual: core.serialization.ObjectSchema<serializers.LiveBusIndividual.Raw, ToplasApi.LiveBusIndividual>;
export declare namespace LiveBusIndividual {
    interface Raw {
        vehicle_door_no: string;
        last_location_time: string;
        last_location: serializers.Coordinates.Raw;
        vehicle_plate: string;
        speed: number;
    }
}
