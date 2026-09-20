declare module 'bootstrap' {
  export class Tooltip {
    constructor(element: Element | string, options?: any);
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
    enable(): void;
    disable(): void;
    toggleEnabled(): void;
    update(): void;
    static getInstance(element: Element | string): Tooltip | null;
    static getOrCreateInstance(element: Element | string, options?: any): Tooltip;
  }
}
