/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as ToplasApi from "../index";
export interface Route {
    lineCode: string;
    lineId: number;
    lineDescription?: string;
    lineName: string;
    routeCode: string;
    routeId: number;
    routeDescription?: string;
    routeName: string;
    routeDirection: ToplasApi.Direction;
}
