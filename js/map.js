class MapManager {
  constructor() {
    this.map = L.map('map', {
      preferCanvas: true,
      zoomControl: false
    }).setView([17.385, 78.486], 13);
    
    this.initBaseMap();
    this.studentMarkers = new Map();
    this.routeLayers = [];
    this.startMarker = null;
    this.endMarker = null;
  }
  
  initBaseMap() {
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      detectRetina: true
    }).addTo(this.map);
    
    tileLayer.on('tileerror', (error) => {
      console.error('Map tile error:', error);
      L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
        attribution: '© Stadia Maps',
        maxZoom: 20
      }).addTo(this.map);
    });
    
    this.map.on('click', (e) => {
      window.app.handleMapClick(e.latlng);
    });
  }
  
  addStudentToMap(student) {
    const icon = L.divIcon({
      className: 'student-marker',
      html: this.getStudentIcon(student.gender),
      iconSize: [30, 30]
    });

    const marker = L.marker(student.location, { icon })
      .addTo(this.map)
      .bindPopup(this.createStudentPopup(student));

    marker.studentId = student.id;
    this.studentMarkers.set(student.id, marker);

    marker.on('click', () => {
      if (window.app.currentState === 'erasing') {
        this.removeStudentMarker(student.id);
        window.app.removeStudent(student.id);
      } else {
        marker.openPopup();
      }
    });
  }
  
  removeStudentMarker(studentId) {
    if (this.studentMarkers.has(studentId)) {
      this.map.removeLayer(this.studentMarkers.get(studentId));
      this.studentMarkers.delete(studentId);
    }
  }
  
  createStudentPopup(student) {
    return `
      <div class="student-popup">
        <h3>${student.name}</h3>
        <p><strong>Gender:</strong> ${student.gender}</p>
        <p><strong>Phone:</strong> ${student.phone || 'Not provided'}</p>
        <p><strong>Address:</strong> ${student.address || 'Not provided'}</p>
        <div class="popup-meta">
          <span><i class="fas fa-map-marker-alt"></i> ${student.location.lat.toFixed(4)}, ${student.location.lng.toFixed(4)}</span>
        </div>
      </div>
    `;
  }
  
  getStudentIcon(gender) {
    switch(gender) {
      case 'Male': return '👦';
      case 'Female': return '👧';
      default: return '🧑';
    }
  }
  
  focusOnStudent(studentId) {
    const marker = this.studentMarkers.get(studentId);
    if (marker) {
      this.map.setView(marker.getLatLng(), 15);
      marker.openPopup();
    }
  }
  
  setStartLocation(latlng) {
    if (this.startMarker) this.map.removeLayer(this.startMarker);
    
    this.startMarker = L.marker(latlng, {
      icon: L.divIcon({
        className: 'terminal-marker',
        html: '🏫',
        iconSize: [40, 40]
      })
    }).addTo(this.map).bindPopup("School/Start Point");
    
    return this.startMarker.getLatLng();
  }
  
  setEndLocation(latlng) {
    if (this.endMarker) this.map.removeLayer(this.endMarker);
    
    this.endMarker = L.marker(latlng, {
      icon: L.divIcon({
        className: 'terminal-marker',
        html: '🚌',
        iconSize: [40, 40]
      })
    }).addTo(this.map).bindPopup("Depot/End Point");
    
    return this.endMarker.getLatLng();
  }
}