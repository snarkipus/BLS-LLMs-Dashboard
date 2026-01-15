import type { Domain, LayerCakeChartDatum, RegressionResult } from '$lib/types/layercake-chart';

type WeightedPoint = {
  x: number;
  y: number;
  weight: number;
};

type LogPoint = {
  x: number;
  y: number;
  w: number;
};

function isValidRegressionPoint(point: LayerCakeChartDatum): boolean {
  return Number.isFinite(point.x) && Number.isFinite(point.y) && point.y > 0;
}

export function computeLogWageRegressionLine(
  data: LayerCakeChartDatum[],
  xDomain: Domain
): RegressionResult | null {
  const validPoints = data.filter(isValidRegressionPoint).map(
    (point): WeightedPoint => ({
      x: point.x,
      y: point.y,
      weight: point.employment ?? 1,
    })
  );

  if (validPoints.length < 2) return null;

  const xValues = validPoints.map((point) => point.x);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);

  const xStart = xDomain[0] ?? minX;
  const xEnd = xDomain[1] ?? maxX;

  const logYValues = validPoints.map(
    (point): LogPoint => ({
      x: point.x,
      y: Math.log10(point.y),
      w: Math.max(point.weight, 0),
    })
  );

  let sumW = 0;
  let sumWX = 0;
  let sumWY = 0;
  let sumWXY = 0;
  let sumWX2 = 0;

  for (const point of logYValues) {
    sumW += point.w;
    sumWX += point.w * point.x;
    sumWY += point.w * point.y;
    sumWXY += point.w * point.x * point.y;
    sumWX2 += point.w * point.x * point.x;
  }

  if (sumW === 0) return null;

  const denominator = sumW * sumWX2 - sumWX * sumWX;
  if (denominator === 0) return null;

  const slope = (sumW * sumWXY - sumWX * sumWY) / denominator;
  const intercept = (sumWY - slope * sumWX) / sumW;

  const meanY = sumWY / sumW;
  let totalSumSquares = 0;
  let residualSumSquares = 0;

  for (const point of logYValues) {
    totalSumSquares += point.w * Math.pow(point.y - meanY, 2);
    residualSumSquares += point.w * Math.pow(point.y - (intercept + slope * point.x), 2);
  }

  const rSquared = totalSumSquares > 0 ? 1 - residualSumSquares / totalSumSquares : 0;

  const startY = Math.pow(10, intercept + slope * xStart);
  const endY = Math.pow(10, intercept + slope * xEnd);

  return {
    points: [
      { x: xStart, y: startY },
      { x: xEnd, y: endY },
    ],
    slope,
    intercept,
    rSquared,
  } satisfies RegressionResult;
}
