// admin-housekeeping.js - Housekeeping Management

let housekeepingTasks = [];
let maintenanceRequests = [];
let currentTab = 'all';

// Sample room numbers
const ALL_ROOMS = [4, 5, 101, 102, 103, 104, 105, 106, 107, 108, 201, 202, 203, 204, 205, 206, 207, 208, 301, 302, 303, 304, 305, 306, 307, 308];

// Initialize housekeeping
async function initializeHousekeeping() {
    // Generate sample tasks
    generateSampleTasks();
    
    // Load maintenance requests
    loadMaintenanceRequests();
    
    // Update stats
    updateHousekeepingStats();
    
    // Display tasks
    displayTasks();
    
    // Populate room dropdown
    populateRoomDropdown();
}

// Generate sample cleaning tasks
function generateSampleTasks() {
    housekeepingTasks = [
        {
            id: 1,
            room: 108,
            type: 'Checkout Cleaning',
            priority: 'high',
            status: 'pending',
            assignedTo: 'Staff 1',
            notes: 'Guest checked out at 11:00 AM'
        },
        {
            id: 2,
            room: 208,
            type: 'Daily Cleaning',
            priority: 'medium',
            status: 'in-progress',
            assignedTo: 'Staff 2',
            notes: 'Guest requested extra towels'
        },
        {
            id: 3,
            room: 308,
            type: 'Deep Cleaning',
            priority: 'low',
            status: 'pending',
            assignedTo: 'Staff 3',
            notes: 'Scheduled deep clean'
        },
        {
            id: 4,
            room: 107,
            type: 'Checkout Cleaning',
            priority: 'high',
            status: 'completed',
            assignedTo: 'Staff 1',
            notes: 'Completed at 2:30 PM'
        },
        {
            id: 5,
            room: 207,
            type: 'Turndown Service',
            priority: 'medium',
            status: 'pending',
            assignedTo: 'Staff 4',
            notes: 'Scheduled for 7:00 PM'
        }
    ];
}

// Load maintenance requests
function loadMaintenanceRequests() {
    maintenanceRequests = [
        {
            id: 1,
            room: 105,
            type: 'Plumbing',
            priority: 'urgent',
            description: 'Leaking faucet in bathroom',
            status: 'open',
            reportedAt: new Date().toISOString()
        },
        {
            id: 2,
            room: 203,
            type: 'Electrical',
            priority: 'high',
            description: 'Light fixture not working',
            status: 'in-progress',
            reportedAt: new Date(Date.now() - 86400000).toISOString()
        }
    ];
    
    displayMaintenanceRequests();
}

// Update statistics
function updateHousekeepingStats() {
    const stats = {
        pending: housekeepingTasks.filter(t => t.status === 'pending').length,
        inProgress: housekeepingTasks.filter(t => t.status === 'in-progress').length,
        completed: housekeepingTasks.filter(t => t.status === 'completed').length,
        maintenance: maintenanceRequests.filter(r => r.status === 'open').length
    };
    
    document.getElementById('pendingTasks').textContent = stats.pending;
    document.getElementById('inProgressTasks').textContent = stats.inProgress;
    document.getElementById('completedTasks').textContent = stats.completed;
    document.getElementById('maintenanceIssues').textContent = stats.maintenance;
}

// Display tasks
function displayTasks() {
    const grid = document.getElementById('tasksGrid');
    
    let filteredTasks = housekeepingTasks;
    
    if (currentTab === 'priority') {
        filteredTasks = housekeepingTasks.filter(t => t.priority === 'high' || t.priority === 'urgent');
    } else if (currentTab === 'checkout') {
        filteredTasks = housekeepingTasks.filter(t => t.type.includes('Checkout'));
    } else if (currentTab === 'maintenance') {
        displayMaintenanceOnly();
        return;
    }
    
    if (filteredTasks.length === 0) {
        grid.innerHTML = '<div class="loading-container">No tasks found</div>';
        return;
    }
    
    grid.innerHTML = filteredTasks.map(task => `
        <div class="task-card priority-${task.priority}" onclick="viewTaskDetails(${task.id})">
            <div class="task-header">
                <div class="task-room-number">Room ${task.room}</div>
                <span class="task-priority-badge ${task.priority}">${task.priority}</span>
            </div>
            <div class="task-type">${task.type}</div>
            <div class="task-status ${task.status}">
                ${getStatusIcon(task.status)} ${formatStatus(task.status)}
            </div>
            ${task.notes ? `<p style="margin-top: 10px; font-size: 13px; color: var(--text-light);">${task.notes}</p>` : ''}
        </div>
    `).join('');
}

// Display maintenance requests
function displayMaintenanceRequests() {
    const list = document.getElementById('maintenanceList');
    
    if (maintenanceRequests.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-light);">No maintenance requests</p>';
        return;
    }
    
    list.innerHTML = maintenanceRequests.map(req => `
        <div class="maintenance-item">
            <div class="maintenance-header">
                <span class="maintenance-room">Room ${req.room}</span>
                <span class="task-priority-badge ${req.priority}">${req.priority}</span>
            </div>
            <div class="maintenance-type">${req.type}</div>
            <div class="maintenance-description">${req.description}</div>
            <div class="maintenance-meta">
                <span>Status: ${req.status}</span>
                <span>${formatDate(req.reportedAt)}</span>
            </div>
        </div>
    `).join('');
}

// Display maintenance tab
function displayMaintenanceOnly() {
    const grid = document.getElementById('tasksGrid');
    grid.innerHTML = '<div class="loading-container">View maintenance requests below</div>';
}

// Format status
function formatStatus(status) {
    return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Get status icon
function getStatusIcon(status) {
    const icons = {
        'pending': '⏳',
        'in-progress': '🔄',
        'completed': '✅'
    };
    return icons[status] || '❓';
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// View task details
function viewTaskDetails(taskId) {
    const task = housekeepingTasks.find(t => t.id === taskId);
    if (!task) return;
    
    const modal = document.getElementById('taskModal');
    const modalBody = document.getElementById('taskModalBody');
    
    document.getElementById('taskModalTitle').textContent = `Room ${task.room} - ${task.type}`;
    
    modalBody.innerHTML = `
        <div class="booking-detail-grid">
            <div class="detail-group">
                <h4>Room Number</h4>
                <p>${task.room}</p>
            </div>
            <div class="detail-group">
                <h4>Task Type</h4>
                <p>${task.type}</p>
            </div>
            <div class="detail-group">
                <h4>Priority</h4>
                <p><span class="task-priority-badge ${task.priority}">${task.priority}</span></p>
            </div>
            <div class="detail-group">
                <h4>Status</h4>
                <p><span class="task-status ${task.status}">${getStatusIcon(task.status)} ${formatStatus(task.status)}</span></p>
            </div>
            <div class="detail-group">
                <h4>Assigned To</h4>
                <p>${task.assignedTo}</p>
            </div>
            <div class="detail-group" style="grid-column: 1 / -1;">
                <h4>Notes</h4>
                <p>${task.notes || 'No additional notes'}</p>
            </div>
        </div>
    `;
    
    modal.dataset.taskId = taskId;
    modal.style.display = 'flex';
}

// Mark task complete
document.getElementById('markTaskCompleteBtn')?.addEventListener('click', function() {
    const modal = document.getElementById('taskModal');
    const taskId = parseInt(modal.dataset.taskId);
    const task = housekeepingTasks.find(t => t.id === taskId);
    
    if (task) {
        task.status = 'completed';
        updateHousekeepingStats();
        displayTasks();
        modal.style.display = 'none';
        alert('Task marked as complete!');
    }
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentTab = this.dataset.tab;
        displayTasks();
    });
});

// Auto-assign rooms
function assignAllRooms() {
    alert('Auto-assigning cleaning tasks to available staff...');
    // In production, this would intelligently assign rooms to staff
}

// Populate room dropdown
function populateRoomDropdown() {
    const select = document.getElementById('maintenanceRoom');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select Room</option>' + 
        ALL_ROOMS.map(room => `<option value="${room}">Room ${room}</option>`).join('');
}

// Show maintenance form
function showMaintenanceForm() {
    document.getElementById('maintenanceModal').style.display = 'flex';
}

// Close maintenance form
function closeMaintenanceForm() {
    document.getElementById('maintenanceModal').style.display = 'none';
    document.getElementById('maintenanceForm').reset();
}

// Submit maintenance request
function submitMaintenanceRequest() {
    const room = document.getElementById('maintenanceRoom').value;
    const type = document.getElementById('maintenanceType').value;
    const priority = document.getElementById('maintenancePriority').value;
    const description = document.getElementById('maintenanceDescription').value;
    
    if (!room || !type || !description) {
        alert('Please fill in all required fields');
        return;
    }
    
    const newRequest = {
        id: maintenanceRequests.length + 1,
        room: parseInt(room),
        type: type,
        priority: priority,
        description: description,
        status: 'open',
        reportedAt: new Date().toISOString()
    };
    
    maintenanceRequests.push(newRequest);
    displayMaintenanceRequests();
    updateHousekeepingStats();
    closeMaintenanceForm();
    
    alert('Maintenance request submitted successfully!');
}

// Close task modal
document.getElementById('closeTaskModal')?.addEventListener('click', () => {
    document.getElementById('taskModal').style.display = 'none';
});

document.getElementById('closeTaskModalBtn')?.addEventListener('click', () => {
    document.getElementById('taskModal').style.display = 'none';
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('housekeeping')) {
        initializeHousekeeping();
    }
});

console.log('🧹 Housekeeping module loaded');