import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, TECH_NINJA} from 'clubhouse/constants/roles';
import RSVP from 'rsvp';
import _ from 'lodash';

export default class AdminPositionRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  model() {
    this.store.unloadAll('position');
    return RSVP.hash({
      positions: this.store.query('position', {include_roles: 1}),
      roles: this.ajax.request('role').then(({role}) => role),
      teams: this.ajax.request('team').then(({team}) => team),
    });
  }

  setupController(controller, model) {
    const {roles} = model;
    controller.setProperties(model);
    controller.setProperties({
      position: null,
      typeFilter: 'All',
      activeFilter: 'all',
      allRangersFilter: '-',
      viewAs: 'list'
    });
    controller.teamById = _.keyBy(model.teams, 'id');
    controller.roleById = _.keyBy(roles, 'id');
    controller.roleOptions = roles.filter((r) => (r.id !== ADMIN && r.id !== TECH_NINJA)).map((r) => ({
      id: r.id,
      title: r.title
    }));

  }
}
