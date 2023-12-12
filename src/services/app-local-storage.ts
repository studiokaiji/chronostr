export class AppLocalStorage {
  static readonly baseKey = "chronostr.studiokaiji.com";

  setItem(key: string, value: string) {
    return localStorage.setItem(`${AppLocalStorage.baseKey}:${key}`, value);
  }

  getItem(key: string) {
    return localStorage.getItem(`${AppLocalStorage.baseKey}:${key}`);
  }

  removeItem(key: string) {
    return localStorage.removeItem(`${AppLocalStorage.baseKey}:${key}`);
  }

  get length() {
    return localStorage.length;
  }
}
