/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as ToplasApi from "../index";
export interface LiveBusIndividual {
    vehicleDoorNo: string;
    lastLocationTime: string;
    lastLocation: ToplasApi.Coordinates;
    vehiclePlate: string;
    speed: number;
    amenities: ToplasApi.Amenities;
    vehicleInfo: ToplasApi.VehicleInfo;
}
