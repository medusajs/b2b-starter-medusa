import { Module } from "@medusajs/framework/utils";
import { MonitoringSubscription } from "./models";
import SolarMonitoringModuleService from "./service";

export const SOLAR_MONITORING_MODULE = "solarMonitoring";

export default Module(SOLAR_MONITORING_MODULE, {
    service: SolarMonitoringModuleService,
});