/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../index";
import * as ToplasApi from "../../api/index";
import * as core from "../../core";
export declare const Line: core.serialization.ObjectSchema<serializers.Line.Raw, ToplasApi.Line>;
export declare namespace Line {
    interface Raw {
        line_name: string;
        line_id: number;
        line_code: string;
    }
}
