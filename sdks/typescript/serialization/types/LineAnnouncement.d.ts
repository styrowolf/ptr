/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "..";
import * as ToplasApi from "../../api";
import * as core from "../../core";
export declare const LineAnnouncement: core.serialization.ObjectSchema<serializers.LineAnnouncement.Raw, ToplasApi.LineAnnouncement>;
export declare namespace LineAnnouncement {
    interface Raw {
        line_code: string;
        information: string;
    }
}
