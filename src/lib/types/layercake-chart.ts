export type LayerCakeChartDatum = {
  x: number;
  y: number;
  label?: string;
  color?: string;
  category?: string;
  r?: number;
  wage?: number;
  probability?: number;
  employment?: number;
};

export type Domain = [number | null, number | null];

export type RadiusScale = (value: number) => number;

export type LegendItem = {
  label: string;
  color: string;
  categories: string[];
  key: string;
};

export type RegressionPoint = { x: number; y: number };

export type RegressionResult = {
  points: [RegressionPoint, RegressionPoint];
  slope: number;
  intercept: number;
  rSquared: number;
};
