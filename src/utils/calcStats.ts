export function calcStats(values: number[]): { min: number, max: number, avg: number } {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((acc, v) => acc + v, 0);
  
    return {
      min,
      max,
      avg: sum / values.length
    };
  }
  