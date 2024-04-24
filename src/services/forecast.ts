import { ForecastPoint, StormGlass } from "@src/clients/stormGlass";
import { Beach } from "@src/models/beach";
import { InternalError } from "@src/util/errors/internal-erros";

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint { }

export interface TimeForecast {
  time: string;
  forecast: BeachForecast[]
}

interface GroupedForecasts {
  [key: string]: BeachForecast[];
}

export class ForecastProcessingInternalError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error during the forecast processing: ${message}`)
  }
}

export class Forecast {
  constructor(protected stormGlass = new StormGlass()) { }

  public async processForecastForBeaches(beaches: Beach[]): Promise<TimeForecast[]> {
    try {
      const forecastPromises = beaches.map(beach =>
        this.stormGlass.fetchPoints(beach.lat, beach.lng).then(points =>
          points.map(point => ({
            time: point.time,
            forecast: [
              {
                lat: beach.lat,
                lng: beach.lng,
                name: beach.name,
                position: beach.position,
                rating: 1,
                ...point
              }
            ]
          }))
        )
      );

      const results = await Promise.all(forecastPromises);

      const grouped = this.groupForecastsByTime(results.flat());
      const formattedResult = this.transformGroupedData(grouped);

      return formattedResult;

    } catch (error) {
      throw new ForecastProcessingInternalError((error as Error).message)
    }
  }

  private groupForecastsByTime(data: TimeForecast[]) {
    return data.reduce<GroupedForecasts>((acc, item) => {
      item.forecast.forEach(forecastItem => {

        if (!acc[forecastItem.time]) {
          acc[forecastItem.time] = [];
        }

        acc[forecastItem.time].push(forecastItem);
      });
      return acc;
    }, {});
  }

  private transformGroupedData(grouped: GroupedForecasts) {
    return Object.keys(grouped).map(time => ({
      time: time,
      forecast: grouped[time]
    }));
  }

}