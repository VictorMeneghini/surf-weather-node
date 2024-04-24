import { BeachModel, BeachPosition } from "@src/models/beach";
import mockStormGlassResponse from "@test/fixtures/stormglass_weather_3.json"
import apiForecastResponse1BeachFixture from "@test/fixtures/api_forecast_response_1_beach.json"
import nock from "nock"

describe("Beach forecast functional tests", () => {
  beforeEach(async () => {
    await BeachModel.deleteMany({})
    const defaultBeach = {
      lat: -33.792726,
      lng: 151.289824,
      name: "Manly",
      position: BeachPosition.E
    }

    const beach = new BeachModel(defaultBeach)
    await beach.save()
  })

  it("should return a forecast with just a few times", async () => {

    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: () => true
      }
    })
      .defaultReplyHeaders({ "access-controll-allow-origin": "*" })
      .get("/v2/weather/point")
      .query({
        lat: -33.792726,
        lng: 151.289824,
        source: "noaa",
        params: /(.*)/
      })
      .reply(200, mockStormGlassResponse)

    const { body, status } = await global.testRequest.get("/forecast");

    expect(status).toBe(200);
    expect(body).toEqual(apiForecastResponse1BeachFixture);
  });

  it('should return 500 if something goes wrong during the processing', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({ lat: '-33.792726', lng: '151.289824' })
      .replyWithError('Something went wrong');

    const { status } = await global.testRequest.get(`/forecast`);

    expect(status).toBe(500);
  });
});
