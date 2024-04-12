import { StormGlass } from "@src/clients/stormGlass"
import stormglassNormalizedResponseFixture from "@test/fixtures/stormglass_normalized_response_3_hours.json"
import * as stormglassWeatherPointFixture from "@test/fixtures/stormglass_weather_3.json"
import axios from "axios"

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('StormGlass client', () => {
  it("should return the normalized forecast from the StormGlass service", async () => {
    const lat = 10000
    const lng = 30000

    mockedAxios.get.mockResolvedValue({ data: stormglassWeatherPointFixture });

    const stormGlass = new StormGlass(mockedAxios)
    const response = await stormGlass.fetchPoints(lat, lng)

    expect(mockedAxios.get).toHaveBeenCalledTimes(1)
    expect(response).toEqual(stormglassNormalizedResponseFixture)
  })
});