"use strict";
/**
 * This file was auto-generated by Fern from our API Definition.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const core = __importStar(require("../../core"));
const Direction_1 = require("./Direction");
exports.Route = core.serialization.object({
    lineCode: core.serialization.property("line_code", core.serialization.string()),
    lineId: core.serialization.property("line_id", core.serialization.number()),
    lineDescription: core.serialization.property("line_description", core.serialization.string().optional()),
    lineName: core.serialization.property("line_name", core.serialization.string()),
    routeCode: core.serialization.property("route_code", core.serialization.string()),
    routeId: core.serialization.property("route_id", core.serialization.number()),
    routeDescription: core.serialization.property("route_description", core.serialization.string().optional()),
    routeName: core.serialization.property("route_name", core.serialization.string()),
    routeDirection: core.serialization.property("route_direction", Direction_1.Direction),
});
