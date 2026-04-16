import { Component } from 'ape-ecs';

export class UserSession extends Component {}
UserSession.properties = {
  uid: '',
  email: '',
  status: 'online' // 'online' | 'offline'
};
