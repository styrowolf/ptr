/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as ToplasApi from "..";
export interface RouteInfo {
    lineCode: string;
    lineId: number;
    lineDescription?: string;
    lineName: string;
    routeCode: string;
    routeId: number;
    routeDescription?: string;
    routeName: string;
    routeDirection: ToplasApi.Direction;
    stops: ToplasApi.LineStop[];
    trips: ToplasApi.TimetableTrip[];
}
