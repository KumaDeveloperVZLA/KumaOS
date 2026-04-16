import { Component } from 'ape-ecs';

export class ProcessState extends Component {}
ProcessState.properties = {
  state: 'STOPPED' // 'STOPPED', 'BOOTING', 'RUNNING', 'MINIMIZED'
};
