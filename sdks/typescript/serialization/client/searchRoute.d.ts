/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "..";
import * as ToplasApi from "../../api";
import * as core from "../../core";
export declare const Response: core.serialization.Schema<serializers.searchRoute.Response.Raw, ToplasApi.Line[]>;
export declare namespace Response {
    type Raw = serializers.Line.Raw[];
}
