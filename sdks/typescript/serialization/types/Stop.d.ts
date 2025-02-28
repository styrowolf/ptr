/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../index";
import * as ToplasApi from "../../api/index";
import * as core from "../../core";
import { Coordinates } from "./Coordinates";
export declare const Stop: core.serialization.ObjectSchema<serializers.Stop.Raw, ToplasApi.Stop>;
export declare namespace Stop {
    interface Raw {
        stop_name: string;
        stop_code: number;
        stop_id: number;
        coordinates: Coordinates.Raw;
        direction: string;
    }
}
