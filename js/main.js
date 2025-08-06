class BusRoutingApp {
  constructor() {
    this.students = [];
    this.busRoutes = [];
    this.currentState = 'idle';
    this.requiredStudents = 0;
    this.pendingLocation = null;
    
    this.initEventListeners();
  }
  
  initEventListeners() {
    document.getElementById('mark-points-btn').addEventListener('click', (e) => {
      e.preventDefault();
      this.startMarkingPoints();
    });
    
    document.getElementById('erase-mode-btn').addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleEraseMode();
    });
    
    document.getElementById('student-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveStudent();
    });
    
    document.getElementById('cancel-student-btn').addEventListener('click', (e) => {
      e.preventDefault();
      this.closeStudentForm();
    });
    
    document.getElementById('set-start-btn').addEventListener('click', () => this.setStartPoint());
    document.getElementById('set-end-btn').addEventListener('click', () => this.setEndPoint());
    document.getElementById('generate-routes-btn').addEventListener('click', () => this.generateRoutes());
  }
  
  startMarkingPoints() {
    const totalStudents = parseInt(document.getElementById('total-students').value);
    if (isNaN(totalStudents)) {
      this.showAlert('Please enter a valid number of students', 'error');
      return;
    }
    this.requiredStudents = totalStudents;
    this.currentState = 'marking';
    this.showAlert(`Click on the map to add ${totalStudents} student locations`, 'info');
  }
  
  toggleEraseMode() {
    this.currentState = this.currentState === 'erasing' ? 'idle' : 'erasing';
    const eraseBtn = document.getElementById('erase-mode-btn');
    eraseBtn.classList.toggle('btn-danger', this.currentState === 'erasing');
    this.showAlert(`Erase mode ${this.currentState === 'erasing' ? 'ON' : 'OFF'}`, 'info');
  }
  
  handleMapClick(latlng) {
    switch(this.currentState) {
      case 'marking':
        if (this.students.length >= this.requiredStudents) {
          this.showAlert(`You've already marked ${this.requiredStudents} students`, 'info');
          return;
        }
        this.openStudentForm(latlng);
        break;
      case 'settingStart':
        this.setStartLocation(latlng);
        break;
      case 'settingEnd':
        this.setEndLocation(latlng);
        break;
    }
  }
  
  openStudentForm(latlng) {
    this.pendingLocation = latlng;
    document.getElementById('student-form-modal').style.display = 'flex';
    document.getElementById('student-name').focus();
  }
  
  saveStudent() {
    const name = document.getElementById('student-name').value.trim();
    if (!name) {
      this.showAlert('Please enter student name', 'error');
      return;
    }
    
    const student = {
      id: Date.now().toString(),
      name,
      phone: document.getElementById('student-phone').value.trim(),
      gender: document.getElementById('student-gender').value,
      address: document.getElementById('student-address').value.trim(),
      location: this.pendingLocation
    };
    
    this.students.push(student);
    window.mapManager.addStudentToMap(student);
    window.uiManager.addStudentToSidebar(student);
    this.closeStudentForm();
    
    if (this.students.length >= this.requiredStudents) {
      document.getElementById('route-controls').style.display = 'block';
      this.currentState = 'idle';
      this.showAlert(`All ${this.requiredStudents} students added successfully`, 'success');
    }
  }
  
  closeStudentForm() {
    document.getElementById('student-form-modal').style.display = 'none';
    document.getElementById('student-form').reset();
    this.pendingLocation = null;
  }
  
  removeStudent(studentId) {
    this.students = this.students.filter(s => s.id !== studentId);
    window.uiManager.removeStudentFromSidebar(studentId);
  }
  
  setStartLocation(latlng) {
    window.mapManager.setStartLocation(latlng);
    window.uiManager.updateTerminalStatus(latlng, window.mapManager.endMarker?.getLatLng());
    this.currentState = 'idle';
  }
  
  setEndLocation(latlng) {
    window.mapManager.setEndLocation(latlng);
    window.uiManager.updateTerminalStatus(window.mapManager.startMarker?.getLatLng(), latlng);
    this.currentState = 'idle';
  }
  
  showAlert(message, type = 'info') {
    alert(`${type.toUpperCase()}: ${message}`);
  }
  
  generateRoutes() {
    if (!window.mapManager.startMarker || !window.mapManager.endMarker) {
      this.showAlert('Please set both start and end points first', 'error');
      return;
    }
    
    const busCount = parseInt(document.getElementById('bus-count').value);
    const points = this.students.map(s => [s.location.lat, s.location.lng]);
    
    window.clusterManager.clusterStudents(points, busCount)
      .then(clusters => {
        return window.routeManager.generateRoutes(
          clusters,
          window.mapManager.startMarker.getLatLng(),
          window.mapManager.endMarker.getLatLng(),
          window.mapManager
        );
      })
      .catch(error => {
        console.error('Route generation failed:', error);
        this.showAlert('Failed to generate routes. Please try again.', 'error');
      });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('map')) {
    console.error('Map container element not found!');
    return;
  }
  
  window.mapManager = new MapManager();
  window.clusterManager = new ClusterManager();
  window.routeManager = new RouteManager();
  window.uiManager = new UIManager();
  window.app = new BusRoutingApp();
  
  setTimeout(() => {
    if (!window.mapManager?.map) {
      console.error('Map failed to initialize!');
      alert('Failed to load map. Please check your internet connection and try again.');
    }
  }, 1000);
});