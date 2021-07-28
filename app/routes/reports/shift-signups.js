import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import _ from "lodash";

export default class ReportsShiftSignupsRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    return this.ajax.request('slot/shift-signups-report', {data: {year: requestYear(params)}});
  }

  setupController(controller, model) {
    const {positions} = model;
    controller.set('positions', positions);
    controller.set('emptyPositions', _.orderBy(positions.filter((p) => p.total_empty > 0),
      ['total_empty'], ['desc']));
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
