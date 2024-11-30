/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../index";
import * as ToplasApi from "../../api/index";
import * as core from "../../core";
import { Coordinates } from "./Coordinates";
import { Direction } from "./Direction";
export declare const LineStop: core.serialization.ObjectSchema<serializers.LineStop.Raw, ToplasApi.LineStop>;
export declare namespace LineStop {
    interface Raw {
        stop_name: string;
        stop_code: number;
        coordinates: Coordinates.Raw;
        direction: string;
        line_code: string;
        line_id: number;
        route_code: string;
        route_order: number;
        route_direction: Direction.Raw;
    }
}
