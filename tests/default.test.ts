import chai from 'chai';
import chaiHttp from 'chai-http';
import { serviceReady, Service } from '../src';
import { RouteDefinitions, getRouteDefinitions, RouteDefinition } from '../src/routing';
import { API } from '../src/models/API';

chai.use(chaiHttp);
const { expect } = chai;

let service: Service;
let routes: RouteDefinitions;

const endpoint = 'http://localhost';
const port = process.env.SERVER_PORT;
const baseURL = `${endpoint}:${port}`;

const testTrackerUid = 1;

describe('default handler group tests', () => {
  before(async () => {
    service = await serviceReady;
    routes = getRouteDefinitions(service.api);
  });

  after(() => {
    service.close();
  });

  it('should get ranks', async () => {
    // Given that some data exists
    // When ranks are requested
    const { path } = routes.GetRanks as RouteDefinition;
    const { status, body } = await chai.request(baseURL).get(path);

    // Then result should be successful
    expect(status).to.equal(200);
    // And result body should contain increasing ranks
    let rank = 0;
    (body as API.TrackerRank[]).forEach((data) => {
      expect(data.tracker_uid).to.not.equal(0);
      expect(data.max_speed_rank).to.be.at.least(rank);
      rank = data.max_speed_rank;
    });
  });

  it('should get events', async () => {
    // Given that some data exists
    // When events are requested
    let { path } = routes.GetTrackerEvents as RouteDefinition;
    path = path.replace(':tracker_uid', testTrackerUid.toString());
    const { status, body } = await chai.request(baseURL).get(path).query({ limit: 5 });

    // Then result should be successful
    expect(status).to.equal(200);
    // And result body be should be an array
    expect(JSON.stringify(body)).to.equal('[]');
  });
});
