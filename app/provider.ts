import { ToplasApi, ToplasApiClient } from "@/sdks/typescript";

export class ToplasDataProvider {
  static client = new ToplasApiClient({
    environment: () => "https://toplas.kurt.town/api",
  });

  static async getLineInfo(code: string): Promise<ToplasApi.LineInfo> {
    return await this.client.lineInfo(code);
  }

  static async getStopInfo(code: number): Promise<ToplasApi.StopInfo> {
    return await this.client.stopInfo(code);
  }

  static async getNearbyStops(
    lat: number,
    lon: number,
  ): Promise<ToplasApi.NearbyStop[]> {
    return await this.client.nearbyStopsStopsGet({ lat, lon, radius: 1000 });
  }

  static async searchStops(query: string): Promise<ToplasApi.Stop[]> {
    return await this.client.searchStop({ query });
  }

  static async searchLines(query: string): Promise<ToplasApi.Line[]> {
    return await this.client.searchRoute({ query });
  }

  static async getArrivals(code: number): Promise<ToplasApi.Arrival[]> {
    return await this.client.stopArrivals(code);
  }

  static async getStopAnnouncements(
    code: number,
  ): Promise<ToplasApi.StopAnnouncement[]> {
    return await this.client.stopAnnouncementsLiveStopStopCodeAnnouncementsGet(
      code,
    );
  }

  static async getLineAnnouncements(
    code: string,
  ): Promise<ToplasApi.LineAnnouncement[]> {
    return await this.client.lineAnnouncementsLiveLineLineCodeAnnouncementsGet(
      code,
    );
  }

  static async getLiveBusesOnLine(code: string): Promise<ToplasApi.LiveBus[]> {
    return await this.client.liveBusesOnRoute(code);
  }

  static getLiveBusByVehicleDoorNo(vehicleDoorNo: string): Promise<ToplasApi.LiveBusIndividual> {
    return this.client.busLocationLiveBusVehicleDoorNoGet(vehicleDoorNo);
  }
}
