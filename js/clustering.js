class ClusterManager {
  constructor() {
    this.busColors = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf'];
  }
  
  async clusterStudents(points, k) {
    try {
      const result = this.optimizedKMeans(points, k);
      
      const clusters = Array.from({length: k}, () => []);
      result.clusters.forEach((clusterIdx, pointIdx) => {
        clusters[clusterIdx].push(points[pointIdx]);
      });
      
      return clusters;
    } catch (error) {
      console.error("Optimized clustering failed, using fallback:", error);
      return this.geographicFallback(points, k);
    }
  }
  
  optimizedKMeans(points, k) {
    const mercatorPoints = points.map(p => this.latLngToMercator(p[0], p[1]));
    
    const result = mlKMeans(mercatorPoints, k, {
      initialization: 'kmeans++',
      maxIterations: 200,
      tolerance: 1e-4
    });
    
    return result;
  }
  
  latLngToMercator(lat, lng) {
    const earthRadius = 6378137;
    const x = lng * (Math.PI / 180) * earthRadius;
    const y = Math.log(Math.tan((90 + lat) * (Math.PI / 360))) * earthRadius;
    return [x, y];
  }
  
  geographicFallback(points, k) {
    const sortedPoints = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    
    const clusters = Array.from({length: k}, () => []);
    sortedPoints.forEach((point, i) => {
      clusters[i % k].push(point);
    });
    
    return clusters;
  }
  
  getBusColor(index) {
    return this.busColors[index % this.busColors.length];
  }
}