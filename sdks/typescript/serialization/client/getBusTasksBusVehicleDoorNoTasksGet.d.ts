/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../index";
import * as ToplasApi from "../../api/index";
import * as core from "../../core";
import { VehicleTask } from "../types/VehicleTask";
export declare const Response: core.serialization.Schema<serializers.getBusTasksBusVehicleDoorNoTasksGet.Response.Raw, ToplasApi.VehicleTask[]>;
export declare namespace Response {
    type Raw = VehicleTask.Raw[];
}
