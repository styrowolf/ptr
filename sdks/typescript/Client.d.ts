/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as environments from "./environments";
import * as core from "./core";
import * as ToplasApi from "./api/index";
export declare namespace ToplasApiClient {
    interface Options {
        environment?: core.Supplier<environments.ToplasApiEnvironment | string>;
    }
    interface RequestOptions {
        /** The maximum time to wait for a response in seconds. */
        timeoutInSeconds?: number;
        /** The number of times to retry the request. Defaults to 2. */
        maxRetries?: number;
        /** A hook to abort the request. */
        abortSignal?: AbortSignal;
    }
}
export declare class ToplasApiClient {
    protected readonly _options: ToplasApiClient.Options;
    constructor(_options?: ToplasApiClient.Options);
    /**
     * @param {ToplasApiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.readRootGet()
     */
    readRootGet(requestOptions?: ToplasApiClient.RequestOptions): Promise<unknown>;
    /**
     * @param {string} lineCode
     * @param {ToplasApi.LineStopsLineLineCodeStopsGetRequest} request
     * @param {ToplasApiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link ToplasApi.UnprocessableEntityError}
     *
     * @example
     *     await client.lineStopsLineLineCodeStopsGet("line_code")
     */
    lineStopsLineLineCodeStopsGet(lineCode: string, request?: ToplasApi.LineStopsLineLineCodeStopsGetRequest, requestOptions?: ToplasApiClient.RequestOptions): Promise<ToplasApi.LineStop[]>;
    /**
     * @param {string} lineCode
     * @param {ToplasApiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link ToplasApi.UnprocessableEntityError}
     *
     * @example
     *     await client.routesLineLineCodeRoutesGet("line_code")
     */
    routesLineLineCodeRoutesGet(lineCode: string, requestOptions?: ToplasApiClient.RequestOptions): Promise<ToplasApi.Route[]>;
    /**
     * @param {string} lineCode
     * @param {ToplasApiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link ToplasApi.UnprocessableEntityError}
     *
     * @example
     *     await client.timetableLineLineCodeTimetableGet("line_code")
     */
    timetableLineLineCodeTimetableGet(lineCode: string, requestOptions?: ToplasApiClient.RequestOptions): Promise<ToplasApi.TimetableTrip[]>;
    /**
     * @param {string} lineCode
     * @param {ToplasApiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link ToplasApi.UnprocessableEntityError}
     *
     * @example
     *     await client.lineInfo("line_code")
     */
    lineInfo(lineCode: string, requestOptions?: ToplasApiClient.RequestOptions): Promise<ToplasApi.LineInfo>;
    /**
     * @param {string} routeCode
     * @param {ToplasApiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link ToplasApi.UnprocessableEntityError}
     *
     * @example
     *     await client.routeStopsRouteRouteCodeStopsGet("route_code")
     */
    routeStopsRouteRouteCodeStopsGet(routeCode: string, requestOptions?: ToplasApiClient.RequestOptions): Promise<ToplasApi.LineStop[]>;
    /**
     * @param {string} routeCode
     * @param {ToplasApiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link ToplasApi.UnprocessableEntityError}
     *
     * @example
     *     await client.routeTimetableRouteRouteCodeTimetableGet("route_code")
     */
    routeTimetableRouteRouteCodeTimetableGet(routeCode: string, requestOptions?: ToplasApiClient.RequestOptions): Promise<ToplasApi.TimetableTrip[]>;
    /**
     * @param {string} routeCode
     * @param {ToplasApiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link ToplasApi.UnprocessableEntityError}
     *
     * @example
     *     await client.routeInfo("route_code")
     */
    routeInfo(routeCode: string, requestOptions?: ToplasApiClient.RequestOptions): Promise<ToplasApi.RouteInfo>;
    /**
     * @param {ToplasApi.NearbyStopsStopsGetRequest} request
     * @param {ToplasApiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link ToplasApi.UnprocessableEntityError}
     *
     * @example
     *     await client.nearbyStopsStopsGet({
     *         lat: 1.1,
     *         lon: 1.1
     *     })
     */
    nearbyStopsStopsGet(request: ToplasApi.NearbyStopsStopsGetRequest, requestOptions?: ToplasApiClient.RequestOptions): Promise<ToplasApi.NearbyStop[]>;
    /**
     * @param {string} stopCode
     * @param {ToplasApi.LinesOnStopStopStopCodeLinesGetRequest} request
     * @param {ToplasApiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link ToplasApi.UnprocessableEntityError}
     *
     * @example
     *     await client.linesOnStopStopStopCodeLinesGet("stop_code")
     */
    linesOnStopStopStopCodeLinesGet(stopCode: string, request?: ToplasApi.LinesOnStopStopStopCodeLinesGetRequest, requestOptions?: ToplasApiClient.RequestOptions): Promise<ToplasApi.LineOnStop[]>;
    /**
     * @param {number} stopCode
     * @param {ToplasApiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link ToplasApi.UnprocessableEntityError}
     *
     * @example
     *     await client.stopInfo(1)
     */
    stopInfo(stopCode: number, requestOptions?: ToplasApiClient.RequestOptions): Promise<ToplasApi.StopInfo>;
    /**
     * @param {string} lineCode
     * @param {ToplasApiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link ToplasApi.UnprocessableEntityError}
     *
     * @example
     *     await client.liveBusesOnRoute("line_code")
     */
    liveBusesOnRoute(lineCode: string, requestOptions?: ToplasApiClient.RequestOptions): Promise<ToplasApi.LiveBus[]>;
    /**
     * @param {string} lineCode
     * @param {ToplasApiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link ToplasApi.UnprocessableEntityError}
     *
     * @example
     *     await client.lineAnnouncementsLiveLineLineCodeAnnouncementsGet("line_code")
     */
    lineAnnouncementsLiveLineLineCodeAnnouncementsGet(lineCode: string, requestOptions?: ToplasApiClient.RequestOptions): Promise<ToplasApi.LineAnnouncement[]>;
    /**
     * @param {number} stopCode
     * @param {ToplasApiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link ToplasApi.UnprocessableEntityError}
     *
     * @example
     *     await client.stopArrivals(1)
     */
    stopArrivals(stopCode: number, requestOptions?: ToplasApiClient.RequestOptions): Promise<ToplasApi.Arrival[]>;
    /**
     * @param {number} stopCode
     * @param {ToplasApiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link ToplasApi.UnprocessableEntityError}
     *
     * @example
     *     await client.stopAnnouncementsLiveStopStopCodeAnnouncementsGet(1)
     */
    stopAnnouncementsLiveStopStopCodeAnnouncementsGet(stopCode: number, requestOptions?: ToplasApiClient.RequestOptions): Promise<ToplasApi.StopAnnouncement[]>;
    /**
     * @param {string} vehicleDoorNo
     * @param {ToplasApiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link ToplasApi.UnprocessableEntityError}
     *
     * @example
     *     await client.busLocationLiveBusVehicleDoorNoGet("vehicle_door_no")
     */
    busLocationLiveBusVehicleDoorNoGet(vehicleDoorNo: string, requestOptions?: ToplasApiClient.RequestOptions): Promise<ToplasApi.LiveBusIndividual>;
    /**
     * @param {ToplasApiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.getFleetFleetGet()
     */
    getFleetFleetGet(requestOptions?: ToplasApiClient.RequestOptions): Promise<string[]>;
    /**
     * @param {string} vehicleDoorNo
     * @param {ToplasApiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link ToplasApi.UnprocessableEntityError}
     *
     * @example
     *     await client.getBusTasksBusVehicleDoorNoTasksGet("vehicle_door_no")
     */
    getBusTasksBusVehicleDoorNoTasksGet(vehicleDoorNo: string, requestOptions?: ToplasApiClient.RequestOptions): Promise<ToplasApi.VehicleTask[]>;
    /**
     * @param {ToplasApi.SearchRouteRequest} request
     * @param {ToplasApiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link ToplasApi.UnprocessableEntityError}
     *
     * @example
     *     await client.searchRoute({
     *         query: "query"
     *     })
     */
    searchRoute(request: ToplasApi.SearchRouteRequest, requestOptions?: ToplasApiClient.RequestOptions): Promise<ToplasApi.Line[]>;
    /**
     * @param {ToplasApi.SearchStopRequest} request
     * @param {ToplasApiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link ToplasApi.UnprocessableEntityError}
     *
     * @example
     *     await client.searchStop({
     *         query: "query"
     *     })
     */
    searchStop(request: ToplasApi.SearchStopRequest, requestOptions?: ToplasApiClient.RequestOptions): Promise<ToplasApi.Stop[]>;
}
