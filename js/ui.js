class UIManager {
  constructor() {
    this.studentsContainer = document.getElementById('students-container');
  }
  
  addStudentToSidebar(student) {
    const studentEl = document.createElement('div');
    studentEl.className = 'student-card';
    studentEl.dataset.studentId = student.id;
    studentEl.innerHTML = `
      <h4><i class="fas fa-user"></i> ${student.name}</h4>
      <p><i class="fas fa-map-marker-alt"></i> ${student.location.lat.toFixed(4)}, ${student.location.lng.toFixed(4)}</p>
      <div class="student-meta">
        <span><i class="fas fa-${student.gender === 'Male' ? 'male' : student.gender === 'Female' ? 'female' : 'user'}"></i> ${student.gender}</span>
        ${student.phone ? `<span><i class="fas fa-phone"></i> ${student.phone}</span>` : ''}
      </div>
    `;
    
    studentEl.addEventListener('click', () => {
      window.mapManager.focusOnStudent(student.id);
    });
    
    this.studentsContainer.appendChild(studentEl);
  }
  
  removeStudentFromSidebar(studentId) {
    const studentEl = this.studentsContainer.querySelector(`[data-student-id="${studentId}"]`);
    if (studentEl) {
      studentEl.remove();
    }
  }
  
  updateTerminalStatus(startPoint, endPoint) {
    const startStatus = document.getElementById('start-status');
    const endStatus = document.getElementById('end-status');
    
    if (startPoint) {
      startStatus.innerHTML = `<i class="fas fa-school"></i> <span>Set at (${startPoint.lat.toFixed(4)}, ${startPoint.lng.toFixed(4)})</span>`;
    } else {
      startStatus.innerHTML = '<i class="fas fa-school"></i> <span>Not set</span>';
    }
    
    if (endPoint) {
      endStatus.innerHTML = `<i class="fas fa-warehouse"></i> <span>Set at (${endPoint.lat.toFixed(4)}, ${endPoint.lng.toFixed(4)})</span>`;
    } else {
      endStatus.innerHTML = '<i class="fas fa-warehouse"></i> <span>Not set</span>';
    }
  }
}