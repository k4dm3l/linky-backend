export class Container {
  private services: Map<string, unknown>;
  private factories: Map<string, () => unknown>;

  constructor() {
    this.services = new Map();
    this.factories = new Map();
  }

  register<T>(key: string, factory: () => T): void {
    this.factories.set(key, factory);
  }

  registerSingleton<T>(key: string, factory: () => T): void {
    this.factories.set(key, factory);
  }

  resolve<T>(key: string): T {
    // Check if service is already instantiated
    if (this.services.has(key)) {
      return this.services.get(key) as T;
    }

    // Check if factory exists
    const factory = this.factories.get(key);
    if (!factory) {
      throw new Error(`Service ${key} not registered`);
    }

    // Create instance
    const instance = factory();

    // Store as singleton
    this.services.set(key, instance);

    return instance as T;
  }

  clear(): void {
    this.services.clear();
    this.factories.clear();
  }

  has(key: string): boolean {
    return this.factories.has(key);
  }
}
