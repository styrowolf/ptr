/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../index";
import * as ToplasApi from "../../api/index";
import * as core from "../../core";
export declare const StopAnnouncement: core.serialization.ObjectSchema<serializers.StopAnnouncement.Raw, ToplasApi.StopAnnouncement>;
export declare namespace StopAnnouncement {
    interface Raw {
        line_code: string;
        information: string;
    }
}
