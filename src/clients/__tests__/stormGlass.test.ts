import { StormGlass } from "@src/clients/stormGlass"
import stormglassNormalizedResponseFixture from "@test/fixtures/stormglass_normalized_response_3_hours.json"
import * as stormglassWeatherPointFixture from "@test/fixtures/stormglass_weather_3.json"
import axios from "axios"

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('StormGlass client', () => {
  const lat = 10000
  const lng = 30000

  it("should return the normalized forecast from the StormGlass service", async () => {
    mockedAxios.get.mockResolvedValue({ data: stormglassWeatherPointFixture });

    const stormGlass = new StormGlass(mockedAxios)
    const response = await stormGlass.fetchPoints(lat, lng)

    expect(mockedAxios.get).toHaveBeenCalledTimes(1)
    expect(response).toEqual(stormglassNormalizedResponseFixture)
  })

  it("should exclude incomplete data points ", async () => {
    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300,
          },
          time: '2020-04-26T00:00:00+00:00',
        },
      ],
    };

    mockedAxios.get.mockResolvedValue({ data: incompleteResponse });

    const stormGlass = new StormGlass(mockedAxios)
    const response = await stormGlass.fetchPoints(lat, lng)

    expect(response).toEqual([])
  })

  it("should get a generic error from stormGlass service when the request fails before reach the server", async () => {
    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300,
          },
          time: '2020-04-26T00:00:00+00:00',
        },
      ],
    };

    mockedAxios.get.mockRejectedValue({ message: "Network Error" });

    const stormGlass = new StormGlass(mockedAxios)

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      "Unexpected error when trying to communicate to StormGlass: Network Error"
    )
  })

  it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    class FakeAxiosError extends Error {
      constructor(public response: object) {
        super();
      }
    }

    mockedAxios.get.mockRejectedValue(
      new FakeAxiosError({
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      })
    );

    const stormGlass = new StormGlass(mockedAxios);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
});