import { StormGlass } from "@src/clients/stormGlass"
import stormglassNormalizedResponseFixture from "@test/fixtures/stormglass_normalized_response_3_hours.json"
import * as stormglassWeatherPointFixture from "@test/fixtures/stormglass_weather_3.json"
import * as HTTPUtils from "@src/util/request"

jest.mock("@src/util/request");

// const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedRequest = new HTTPUtils.Request() as jest.Mocked<HTTPUtils.Request>;

describe('StormGlass client', () => {
  const lat = 10000
  const lng = 30000

  it("should return the normalized forecast from the StormGlass service", async () => {
    mockedRequest.get.mockResolvedValue({ data: stormglassWeatherPointFixture } as HTTPUtils.Response);

    const stormGlass = new StormGlass(mockedRequest)
    const response = await stormGlass.fetchPoints(lat, lng)

    expect(mockedRequest.get).toHaveBeenCalledTimes(1)
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

    mockedRequest.get.mockResolvedValue({ data: incompleteResponse } as HTTPUtils.Response);

    const stormGlass = new StormGlass(mockedRequest)
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

    mockedRequest.get.mockRejectedValue({ message: "Network Error" });

    const stormGlass = new StormGlass(mockedRequest)

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: {"message":"Network Error"}'
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

    mockedRequest.get.mockRejectedValue(
      new FakeAxiosError({
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      })
    );

    const stormGlass = new StormGlass(mockedRequest);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: {"response":{"status":429,"data":{"errors":["Rate Limit reached"]}}}'
    );
  });
});