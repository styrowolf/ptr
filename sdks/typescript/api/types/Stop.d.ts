/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as ToplasApi from "../index";
export interface Stop {
    stopName: string;
    stopCode: number;
    stopId: number;
    coordinates: ToplasApi.Coordinates;
    direction: string;
}
