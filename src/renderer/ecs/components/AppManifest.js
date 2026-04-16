import { Component } from 'ape-ecs';

export class AppManifest extends Component {}
AppManifest.properties = {
  id: '',
  name: 'Unknown App',
  iconColorClass: 'bg-gray-500',
  location: 'home', // 'home' or 'dock'
};
