/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../index";
import * as ToplasApi from "../../api/index";
import * as core from "../../core";
export declare const Amenities: core.serialization.ObjectSchema<serializers.Amenities.Raw, ToplasApi.Amenities>;
export declare namespace Amenities {
    interface Raw {
        wheelchair_accessible: boolean;
        wifi: boolean;
        air_conditioning: boolean;
        usb: boolean;
        bicycle: boolean;
    }
}
