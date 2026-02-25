// Type declaration for d3-force-3d (no official @types package available)
// Declares it as a module that can be require()'d without TypeScript errors.
declare module 'd3-force-3d' {
    export function forceSimulation(nodes?: any[]): any;
    export function forceLink(links?: any[]): any;
    export function forceManyBody(): any;
    export function forceCenter(x?: number, y?: number, z?: number): any;
    export function forceZ(z?: number): any;
    export function forceX(x?: number): any;
    export function forceY(y?: number): any;
}
