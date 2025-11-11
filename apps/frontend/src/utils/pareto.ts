export interface Point {
  x: number;
  y: number;
  [key: string]: any;
}

/**
 * Calculates the Pareto frontier for a set of 2D points.
 * Assumes that for the x-axis, lower is better, and for the y-axis, higher is better.
 * 
 * @param points An array of data points, each with at least 'x' and 'y' properties.
 * @returns A new array of points that lie on the Pareto frontier.
 */
export function calculateParetoFrontier(points: Point[]): Point[] {
  if (points.length === 0) {
    return [];
  }

  // Sort points by x-axis (ascending), then by y-axis (descending) as a tie-breaker.
  const sortedPoints = [...points].sort((a, b) => {
    if (a.x !== b.x) {
      return a.x - b.x;
    }
    return b.y - a.y;
  });

  const frontier: Point[] = [];
  let maxY = -Infinity;

  for (const point of sortedPoints) {
    // A point is on the frontier if it has a better (higher) y-value 
    // than any point already on the frontier with a same or better (lower) x-value.
    if (point.y > maxY) {
      frontier.push(point);
      maxY = point.y;
    }
  }

  return frontier;
}
