import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';
import RSVP from 'rsvp';
import requestYear from 'clubhouse/utils/request-year';

export default class MeTimesheetRoute extends Route.extend(MeRouteMixin) {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);
    const person_id = this.session.user.id;
    const queryParams = {
      person_id,
      year,
    };

    return RSVP.hash({
      timesheets: this.store.query('timesheet', queryParams),
      timesheetInfo: this.ajax.request('timesheet/info', {
        method: 'GET',
        data: { person_id }
      }).then((result) => result.info),
      year: year,
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setProperties(model);
  }
}
