class RouteManager {
  constructor() {
    this.routeLayers = [];
  }
  
  async generateRoutes(clusters, startPoint, endPoint, mapManager) {
    this.clearRoutes(mapManager);
    document.getElementById('loading').style.display = 'flex';
    
    try {
      const busCount = clusters.length;
      let hasValidRoute = false;
      
      for (let i = 0; i < busCount; i++) {
        if (clusters[i].length === 0) continue;
        
        try {
          const routeCoords = await this.calculateRoute(startPoint, endPoint, clusters[i]);
          const routeLayer = this.drawRoute(routeCoords, i, mapManager);
          
          if (!hasValidRoute) {
            mapManager.map.fitBounds(routeLayer.getBounds());
            hasValidRoute = true;
          }
        } catch (error) {
          console.error(`Route generation failed for bus ${i}:`, error);
          this.drawFallbackRoute(startPoint, endPoint, clusters[i], i, mapManager);
        }
      }
    } finally {
      document.getElementById('loading').style.display = 'none';
    }
  }
  
  async calculateRoute(startPoint, endPoint, waypoints) {
    const allWaypoints = [
      [startPoint.lat, startPoint.lng],
      ...waypoints,
      [endPoint.lat, endPoint.lng]
    ];
    
    const coordinates = this.coordinatesToLonLat(allWaypoints);
    const simplified = this.simplifyCoordinates(coordinates, 25);
    
    const coordString = simplified.map(coord => coord.join(',')).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.code !== 'Ok') {
      throw new Error(data.message || 'Routing failed');
    }
    
    return data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
  }
  
  drawRoute(coords, busIndex, mapManager) {
    const color = window.clusterManager.getBusColor(busIndex);
    const route = L.polyline(coords, {
      color,
      weight: 5,
      opacity: 0.8,
      smoothFactor: 1
    }).addTo(mapManager.map);
    
    this.routeLayers.push(route);
    return route;
  }
  
  drawFallbackRoute(startPoint, endPoint, waypoints, busIndex, mapManager) {
    const points = [
      [startPoint.lat, startPoint.lng],
      ...waypoints,
      [endPoint.lat, endPoint.lng]
    ];
    
    const color = window.clusterManager.getBusColor(busIndex);
    const route = L.polyline(points, {
      color,
      weight: 3,
      opacity: 0.6,
      dashArray: '5,5'
    }).addTo(mapManager.map);
    
    this.routeLayers.push(route);
    return route;
  }
  
  coordinatesToLonLat(coordinates) {
    return coordinates.map(coord => [coord[1], coord[0]]);
  }
  
  simplifyCoordinates(coordinates, maxPoints) {
    if (coordinates.length <= maxPoints) return coordinates;
    
    const step = Math.max(1, Math.floor((coordinates.length - 2) / (maxPoints - 2)));
    const simplified = [coordinates[0]];
    
    for (let i = 1; i < coordinates.length - 1; i += step) {
      simplified.push(coordinates[i]);
    }
    
    simplified.push(coordinates[coordinates.length - 1]);
    return simplified;
  }
  
  clearRoutes(mapManager) {
    this.routeLayers.forEach(layer => mapManager.map.removeLayer(layer));
    this.routeLayers = [];
  }
}