/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Readable } from 'svelte/store';

export interface LayerCakeContext<D = any> {
  // Data accessors
  data: Readable<D[]>;
  x: Readable<(d: D) => any>;
  y: Readable<(d: D) => any>;
  z: Readable<(d: D) => any>;
  r: Readable<(d: D) => any>;

  // Scales (keeping as any for flexibility with D3 types)
  xScale: Readable<any>;
  yScale: Readable<any>;
  zScale: Readable<any>;
  rScale: Readable<any>;

  // Accessors (computed from x/y/z/r and scales)
  xGet: Readable<(d: D) => number>;
  yGet: Readable<(d: D) => number>;
  zGet: Readable<(d: D) => number>;
  rGet: Readable<(d: D) => number>;

  // Dimensions
  width: Readable<number>;
  height: Readable<number>;
  containerWidth: Readable<number>;
  containerHeight: Readable<number>;
  aspectRatio: Readable<number>;

  // Domain/Range
  xDomain: Readable<any[]>;
  yDomain: Readable<any[]>;
  zDomain: Readable<any[]>;
  rDomain: Readable<any[]>;
  xRange: Readable<any[]>;
  yRange: Readable<any[]>;
  zRange: Readable<any[]>;
  rRange: Readable<any[]>;

  // Other properties
  padding: Readable<{ top: number; right: number; bottom: number; left: number }>;
  extents: Readable<{ x: any[]; y: any[] }>;
  flatData: Readable<D[]>;
  config: Readable<any>;
}
