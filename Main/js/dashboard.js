/* ============================================================
   DASHBOARD INTERACTIVE FUNCTIONALITY
   ============================================================ */

// DOM Elements
const filterButtons = document.querySelectorAll('.filter-btn');
const searchInput = document.querySelector('.search-input');
const btnNewCourse = document.querySelector('.btn-new-course');
const navItems = document.querySelectorAll('.nav-item');
const headerActions = document.querySelectorAll('.header-action');
const currentSemester = Number(document.getElementById("studentCount").textContent);
const currentOngoing = Number(document.getElementById("ongoingCount").textContent);
const currentCompleted = Number(document.getElementById("completedCount").textContent);
const previousSemester = 95;
const previousOngoing = 1;
const previousCompleted = 0;

// Modal Elements
const addCourseModal = document.getElementById('addCourseModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const addCourseForm = document.getElementById('addCourseForm');

// State
let currentFilter = 'ALL';
let currentSearch = '';

/* ============================================================
   HEADER ACTION MENUS
   ============================================================ */

function closeHeaderMenus() {
    headerActions.forEach(action => {
        action.classList.remove('active');
        const button = action.querySelector('.header-btn');
        if (button) {
            button.setAttribute('aria-expanded', 'false');
        }
    });
}

headerActions.forEach(action => {
    const button = action.querySelector('.header-btn');
    const menuItems = action.querySelectorAll('.header-menu-item');

    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isOpen = action.classList.contains('active');
        closeHeaderMenus();

        if (!isOpen) {
            action.classList.add('active');
            button.setAttribute('aria-expanded', 'true');
        }
    });

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            closeHeaderMenus();
        });
    });
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-action')) {
        closeHeaderMenus();
    }
});

/* ============================================================
   MODAL FUNCTIONS
   ============================================================ */

function openModal() {
    addCourseModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    addCourseModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    addCourseForm.reset();
}

/* ============================================================
   MODAL EVENT LISTENERS
   ============================================================ */

btnNewCourse.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
});

closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

// Close modal when clicking overlay
addCourseModal.addEventListener('click', (e) => {
    if (e.target === addCourseModal || e.target === addCourseModal.querySelector('.modal-overlay')) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && addCourseModal.classList.contains('active')) {
        closeModal();
    }

    if (e.key === 'Escape') {
        closeHeaderMenus();
    }
});

// Handle form submission
addCourseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const courseData = {
        name: document.getElementById('courseName').value.trim(),
        startDate: document.getElementById('startDate').value,
        duration: parseInt(document.getElementById('duration').value),
        participants: parseInt(document.getElementById('participants').value)
    };
    
    const validation = validateCourseData(courseData);
    if (!validation.isValid) {
        alert('Validation Error:\n' + validation.errors.join('\n'));
        return;
    }
    
    const result = createCourse(courseData);
    if (result.success) {
        console.log('Course created:', result.course);
        alert('✓ Course created successfully!');
        closeModal();
        // TODO: Refresh course display without full page reload
    } else {
        alert('Error:\n' + result.errors.join('\n'));
    }
});

/* ============================================================
   FILTER FUNCTIONALITY
   ============================================================ */

filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();

        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));

        // Add active class to clicked button
        button.classList.add('active');

        // Update current filter
        currentFilter = button.textContent.trim();

        // Apply filter
        filterCourses();
    });
});

function filterCourses() {
    const courseRows = document.querySelectorAll('.course-row');

    courseRows.forEach(row => {
        const badge = row.querySelector('.course-badge');
        const badgeText = badge.textContent.trim().toUpperCase();
        const title = row.querySelector('.course-title').textContent.toLowerCase();

        let showRow = true;

        // Check status filter
        if (currentFilter !== 'ALL') {
            const filterMap = {
                'UPCOMING': badgeText === 'UPCOMING',
                'ONGOING': badgeText === 'ONGOING',
                'COMPLETED': badgeText === 'COMPLETED'
            };
            showRow = filterMap[currentFilter] || false;
        }

        // Check search filter
        if (currentSearch) {
            showRow = showRow && title.includes(currentSearch.toLowerCase());
        }

        // Show or hide row
        row.style.display = showRow ? '' : 'none';
    });

    // Show "no results" message if needed
    updateNoResultsMessage();
}

/* ============================================================
   SEARCH FUNCTIONALITY
   ============================================================ */

searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value.trim();
    filterCourses();
});

/* ============================================================
   NO RESULTS MESSAGE
   ============================================================ */

function updateNoResultsMessage() {
    const courseRows = document.querySelectorAll('.course-row');
    const visibleRows = Array.from(courseRows).filter(row => row.style.display !== 'none');

    // Remove existing no-results message
    const existingMessage = document.querySelector('.no-results-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Add no-results message if no courses visible
    if (visibleRows.length === 0) {
        const tableBody = document.querySelector('.courses-table tbody');
        const noResultsRow = document.createElement('tr');
        noResultsRow.className = 'no-results-message';
        noResultsRow.innerHTML = `
            <td colspan="7">No courses found. Try adjusting your search or filters.</td>
        `;
        tableBody.appendChild(noResultsRow);
    }
}

/* ============================================================
   ACTION BUTTONS
   ============================================================ */

document.querySelectorAll('.action-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();

        const row = button.closest('.course-row');
        const courseTitle = row.querySelector('.course-title').textContent;
        const action = button.classList[1]; // edit, delete, or report

        switch(action) {
            case 'edit':
                handleEditCourse(row);
                break;
            case 'delete':
                handleDeleteCourse(row, courseTitle);
                break;
            case 'report':
                handleGenerateReport(row);
                break;
        }
    });
});

function handleEditCourse(row) {
    const courseTitle = row.querySelector('.course-title').textContent;
    console.log(`Editing course: ${courseTitle}`);
    // Navigate to edit-course page with course data
    // window.location.href = `edit-course.html?course=${encodeURIComponent(courseTitle)}`;
    alert(`Edit functionality for "${courseTitle}" - Coming soon!`);
}

function handleDeleteCourse(row, courseTitle) {
    if (confirm(`Are you sure you want to delete "${courseTitle}"?`)) {
        row.style.animation = 'fadeOut 0.3s ease-in-out';
        setTimeout(() => {
            row.remove();
            filterCourses();
            console.log(`Deleted course: ${courseTitle}`);
        }, 300);
    }
}

function handleGenerateReport(row) {
    const courseTitle = row.querySelector('.course-title').textContent;
    console.log(`Generating report for: ${courseTitle}`);
    alert(`Report generation for "${courseTitle}" - Coming soon!`);
}

/* ============================================================
   SIDEBAR NAVIGATION
   ============================================================ */

navItems.forEach(item => {
    const link = item.querySelector('.nav-link');
    link.addEventListener('click', (e) => {
        e.preventDefault();

        // Remove active class from all items
        navItems.forEach(nav => nav.classList.remove('active'));

        // Add active class to clicked item
        item.classList.add('active');

        // Get the nav text
        const navText = item.querySelector('.nav-text').textContent.trim().toUpperCase();
        const filterMap = {
            'ALL COURSES': 'ALL',
            'UPCOMING': 'UPCOMING',
            'ONGOING': 'ONGOING',
            'COMPLETED': 'COMPLETED'
        };
 
        // Update filter buttons and current filter
        if (filterMap[navText]) {
            currentFilter = filterMap[navText];
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.textContent.trim() === currentFilter) {
                    btn.classList.add('active');
                }
            });
            filterCourses();
        }
    });
});

/* ============================================================
   INITIALIZATION
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard loaded successfully');
    // Initialize with default filter
    filterCourses();
    drawChart('semesterChart', previousSemester, currentSemester, {
        label: 'Total Courses',
        backgroundColor: ['#6c5ce7', '#00cec9']
    });
    drawChart('ongoingChart', previousOngoing, currentOngoing, {
        label: 'Ongoing Courses',
        backgroundColor: ['#0984e3', '#00b894']
    });
    drawChart('completedChart', previousCompleted, currentCompleted, {
        label: 'Completed Courses',
        backgroundColor: ['#636e72', '#fdcb6e']
    });
});

/* ============================================================
   STYLES FOR ANIMATIONS
   ============================================================ */

const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }

    .no-results-message {
        text-align: center;
    }

    .no-results-message td {
        padding: var(--spacing-2xl);
        color: var(--color-text-secondary);
        font-size: var(--font-size-base);
    }
`;
document.head.appendChild(style);

/* ============================================================
   chart.js initialization for semester chart
   ============================================================ */
const drawChart = (chartId, previous, current, options = {}) => {
  const chartCanvas = document.getElementById(chartId);

  if (!chartCanvas || typeof Chart === 'undefined') {
    return;
  }

  const ctx = chartCanvas.getContext("2d");

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Previous Semester', 'Current Semester'],
      datasets: [{
        label: options.label || 'Registrations',
        data: [previous, current],
        backgroundColor: options.backgroundColor || ['#6c5ce7', '#00cec9']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
};
