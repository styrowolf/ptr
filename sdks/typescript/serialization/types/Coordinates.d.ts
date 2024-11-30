/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../index";
import * as ToplasApi from "../../api/index";
import * as core from "../../core";
export declare const Coordinates: core.serialization.ObjectSchema<serializers.Coordinates.Raw, ToplasApi.Coordinates>;
export declare namespace Coordinates {
    interface Raw {
        x: number;
        y: number;
    }
}
