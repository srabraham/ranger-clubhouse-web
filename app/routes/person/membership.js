import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';
import Selectable from 'clubhouse/utils/selectable';
import {tracked} from '@glimmer/tracking';

class SelectItem extends Selectable {
  @tracked showRoles = false;

  constructor(group, selected) {
    super(group);
    this.selected = selected;
  }
}

export default class PersonMembershipRoute extends ClubhouseRoute {
  model() {
    return RSVP.hash({
      personMembership: this.ajax.request(`person/${this.modelFor('person').id}/membership`, {data: {include_management: 1}})
        .then(({membership}) => membership),
      roles: this.ajax.request('role').then(({role}) => role),
      positions: this.ajax.request('position', {
        data: {
          can_manage: 1,
          include_roles: 1
        }
      }).then(({position}) => position),
      teams: this.ajax.request('team', {data: {can_manage: 1, include_roles: 1}}).then(({team}) => team)
    })
  }

  setupController(controller, model) {
    controller.person = this.modelFor('person');

    const {personMembership, roles, positions, teams} = model;
    const positionsByIds = {}, teamsById = {};

    controller.canManageGeneralPositions = this.session.isAdmin;

    personMembership.teams.forEach((team) => teamsById[+team.id] = team);
    personMembership.positions.forEach((pp) => positionsByIds[pp.id] = true);

    controller.rolesById = roles.reduce((hash, role) => {
      hash[role.id] = role;
      return hash
    }, {});

    controller.teams = [];
    controller.generalPositions = [];

    positions.forEach((p) => p.roles = this.buildRoles(p.role_ids, controller.rolesById));

    teams.forEach((t) => {
      t.roles = this.buildRoles(t.role_ids, controller.rolesById);

      if (!t.can_manage) {
        return;
      }

      const teamId = +t.id;
      const teamMember = teamsById[teamId];
      const team = new SelectItem(t, !!teamMember);

      team.allMembers = [];
      team.allRangers = [];
      team.optional = [];
      team.positions = [];

      team.managerSelect = new SelectItem({}, teamMember?.is_manager);

      positions.forEach((p) => {
        if (teamId !== +p.team_id) {
          return;
        }

        const pid = +p.id;

        if (!p.active && !positionsByIds[pid]) {
          return;
        }

        (team.positions ??= []).push(p);

        const teamPosition = new SelectItem(p, !!positionsByIds[pid]);
        if (p.all_rangers || p.new_user_eligible || p.public_team_position) {
          team.allRangers.push(teamPosition);
        } else if (p.all_team_members) {
          team.allMembers.push(teamPosition);
        } else {
          team.optional.push(teamPosition);
        }
      });
      controller.teams.push(team);
    });

    controller.generalPositions = positions.filter((p) => !p.is_team && !p.team_id && (p.active || positionsByIds[p.id]))
      .map((p) => new SelectItem(p, !!positionsByIds[p.id]));
  }

  buildRoles(ids, rolesById) {
    if (!ids || !ids.length) {
      return [];
    }

    const roles = ids.map((id) => rolesById[id]?.title ?? `Role #${id}`);

    roles.sort((a, b) => a.localeCompare(b));

    return roles;
  }
}
