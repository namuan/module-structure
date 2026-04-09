
export class ExtensionRegistry {
    private _registry: Record<string, Record<string, any>> = {};

    public register(extensionPoint: string, id: string, extension: any): void {
        let extensionMap = this._registry[extensionPoint];
        if (!extensionMap) {
            extensionMap = {};
            this._registry[extensionPoint] = extensionMap;
        }

        extensionMap[id] = extension;
    }

    public getExtensions(extensionPoint: string): Record<string, any> {
        return { ...this._registry[extensionPoint] };
    }
}
