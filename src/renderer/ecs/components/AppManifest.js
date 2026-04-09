export class AppManifest {
  constructor({ name, icon, permissions }) {
    this.name = name || "Unknown App";
    this.icon = icon || "";
    this.permissions = permissions || [];
  }
}
