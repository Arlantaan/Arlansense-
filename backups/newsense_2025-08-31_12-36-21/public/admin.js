/**
 * Admin Panel JavaScript for Sensation by Sanu
 * Handles all admin functionality including orders, users, and analytics
 */

// Firebase configuration (using the one from admin.html)
const firebaseConfig = {
  apiKey: "AIzaSyBIFg1ZFGZ2k34Bc8hhhLKSf9ArnesiNhg",
  authDomain: "newsense-27a7a.firebaseapp.com",
  projectId: "newsense-27a7a",
  storageBucket: "newsense-27a7a.firebasestorage.app",
  messagingSenderId: "348185741664",
  appId: "1:348185741664:web:a2ff7676deec0cecaa3605",
  measurementId: "G-SZ18TF0YHW"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

const db = firebase.firestore();
const auth = firebase.auth();
console.log('Firebase services initialized:', { db: !!db, auth: !!auth });

// Global variables
let allPurchases = [];
let allUsers = [];
let allContacts = [];
let charts = {};

// Allowed admin emails
const allowedAdmins = [
  "haddybubacarr@gmail.com",
  "abdullaalami1@gmail.com"
];

// Initialize admin panel
function initAdmin() {
  console.log('Initializing admin panel...');
  
  // Set up event listeners
  setupEventListeners();
  
  // Load initial data
  loadDashboardData();
  loadUsers();
  loadContacts();
  
  // Set up real-time listeners
  setupRealTimeListeners();
  
  console.log('Admin panel initialized successfully');
}

// Set up event listeners
function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  // Login form
  const emailLoginForm = document.getElementById('emailLoginForm');
  console.log('Email login form found:', !!emailLoginForm);
  if (emailLoginForm) {
    emailLoginForm.onsubmit = handleEmailLogin;
    console.log('Email login form event listener attached');
  }
  
  // Google login button
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  console.log('Google login button found:', !!googleLoginBtn);
  if (googleLoginBtn) {
    googleLoginBtn.onclick = handleGoogleLogin;
    console.log('Google login button event listener attached');
  }
  
  // Export CSV
  const exportCsvBtn = document.getElementById('exportCsv');
  if (exportCsvBtn) {
    exportCsvBtn.onclick = exportToCSV;
  }
  
  // Apply filters
  const applyFiltersBtn = document.getElementById('applyFilters');
  if (applyFiltersBtn) {
    applyFiltersBtn.onclick = applyFilters;
  }
  
  // Generate report
  const generateReportBtn = document.getElementById('generateReport');
  if (generateReportBtn) {
    generateReportBtn.onclick = generateReport;
  }
  
  // Add new user
  const saveNewUserBtn = document.getElementById('saveNewUser');
  if (saveNewUserBtn) {
    saveNewUserBtn.onclick = saveNewUser;
  }
  
  // Export contacts CSV
  const exportContactsCsvBtn = document.getElementById('exportContactsCsv');
  if (exportContactsCsvBtn) {
    exportContactsCsvBtn.onclick = exportContactsToCSV;
  }
  
  // Contact filters
  const contactSearchInput = document.getElementById('contactSearchInput');
  if (contactSearchInput) {
    contactSearchInput.oninput = filterContacts;
  }
  
  const contactStatusFilter = document.getElementById('contactStatusFilter');
  if (contactStatusFilter) {
    contactStatusFilter.onchange = filterContacts;
  }
  
  const contactDateFrom = document.getElementById('contactDateFrom');
  if (contactDateFrom) {
    contactDateFrom.onchange = filterContacts;
  }
  
  const contactDateTo = document.getElementById('contactDateTo');
  if (contactDateTo) {
    contactDateTo.onchange = filterContacts;
  }
  
  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = handleLogout;
  }
  
  // Tab change events
  document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
    tab.addEventListener('shown.bs.tab', (e) => {
      if (e.target.id === 'analytics-tab') {
        initializeCharts();
        updateAnalyticsSummary(); // Update summary when tab is opened
      }
    });
  });
}

// Handle email/password login
async function handleEmailLogin(e) {
    e.preventDefault();
  console.log('Email login form submitted');
  
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;
  const errorDiv = document.getElementById('emailLoginError');
  
  console.log('Login attempt for email:', email);
  console.log('Auth object available:', !!auth);
  console.log('Auth methods available:', auth ? Object.keys(auth) : 'No auth object');
  
  try {
    // Clear previous errors
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
    
    // Sign in with email and password
    console.log('Attempting to sign in...');
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    console.log('Email login successful:', user.email);
    
    // Check if user is admin
    if (allowedAdmins.includes(user.email)) {
      console.log('User is admin, showing admin panel');
      showAdminPanel();
    } else {
      console.log('User is not admin, signing out');
      // Sign out if not admin
      await auth.signOut();
      errorDiv.textContent = 'Access denied. Admin privileges required.';
      errorDiv.style.display = 'block';
    }
    
  } catch (error) {
    console.error('Email login error:', error);
    errorDiv.textContent = error.message;
    errorDiv.style.display = 'block';
  }
}

// Handle Google login
async function handleGoogleLogin() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    
    console.log('Google login successful:', user.email);
    
    // Check if user is admin
    if (allowedAdmins.includes(user.email)) {
      showAdminPanel();
    } else {
      // Sign out if not admin
      await auth.signOut();
      alert('Access denied. Admin privileges required.');
    }
    
  } catch (error) {
    console.error('Google login error:', error);
    alert('Google login failed: ' + error.message);
  }
}

// Show admin panel and hide login
function showAdminPanel() {
  document.getElementById('loginDiv').classList.add('hidden');
  document.getElementById('adminContainer').classList.remove('hidden');
}

// Hide admin panel and show login
function hideAdminPanel() {
  document.getElementById('adminContainer').classList.add('hidden');
  document.getElementById('loginDiv').classList.remove('hidden');
}

// Handle logout
async function handleLogout() {
  try {
    await auth.signOut();
    console.log('Admin logged out successfully');
    hideAdminPanel();
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Set up real-time listeners
function setupRealTimeListeners() {
  // Listen to orders collection
  const ordersCol = db.collection('orders');
  const ordersQuery = ordersCol.orderBy('created', 'desc').limit(200);
  
  ordersQuery.onSnapshot((snapshot) => {
    console.log(`Admin: Received ${snapshot.size} orders from Firestore`);
    allPurchases = [];
    
    snapshot.forEach(doc => {
      const d = doc.data();
      console.log('Order data:', doc.id, d);
      
      // Handle different timestamp formats
      let dateObj = null;
      if (d.created) {
        if (d.created.toDate) {
          dateObj = d.created.toDate(); // Firestore timestamp
        } else if (typeof d.created === 'string') {
          dateObj = new Date(d.created); // ISO string
        } else {
          dateObj = new Date(d.created); // Fallback
        }
      }
      
      const product = d.cart ? d.cart.map(i => `${i.name} x${i.qty || i.quantity}`).join('; ') : '';
      const amount = d.subtotal ? 'D' + d.subtotal.toLocaleString() : '';
      
      allPurchases.push({
        ...d,
        docId: doc.id,  // Add document ID for updates
        product,
        amount,
        status: d.status || 'pending',
        dateObj,
        dateStr: dateObj ? dateObj.toLocaleString() : 'No date'
      });
    });
    
    // Sort by date (newest first)
    allPurchases.sort((a, b) => {
      if (!a.dateObj && !b.dateObj) return 0;
      if (!a.dateObj) return 1;
      if (!b.dateObj) return -1;
      return b.dateObj - a.dateObj;
    });
    
    console.log(`Admin: Processed ${allPurchases.length} orders`);
    
    // Update UI
    renderTransactionsTable();
    updateDashboardStats();
    updateRecentTransactions();
    updateCharts(); // Update charts with new data
    updateAnalyticsSummary(); // Update analytics summary
  }, (error) => {
    console.error('Admin: Error listening to orders:', error);
  });
  
  // Listen to contacts collection
  const contactsCol = db.collection('contacts');
  const contactsQuery = contactsCol.orderBy('timestamp', 'desc').limit(200);
  
  contactsQuery.onSnapshot((snapshot) => {
    console.log(`Admin: Received ${snapshot.size} contacts from Firestore`);
    allContacts = [];
    
    snapshot.forEach(doc => {
      const d = doc.data();
      console.log('Contact data:', doc.id, d);
      
      // Handle different timestamp formats
      let dateObj = null;
      if (d.timestamp) {
        if (d.timestamp.toDate) {
          dateObj = d.timestamp.toDate(); // Firestore timestamp
        } else if (typeof d.timestamp === 'string') {
          dateObj = new Date(d.timestamp); // ISO string
        } else {
          dateObj = new Date(d.timestamp); // Fallback
        }
      }
      
      allContacts.push({
        ...d,
        docId: doc.id,  // Add document ID for updates
        dateObj,
        dateStr: dateObj ? dateObj.toLocaleString() : 'No date'
      });
    });
    
    // Sort by date (newest first)
    allContacts.sort((a, b) => {
      if (!a.dateObj && !b.dateObj) return 0;
      if (!a.dateObj) return 1;
      if (!b.dateObj) return -1;
      return b.dateObj - a.dateObj;
    });
    
    console.log(`Admin: Processed ${allContacts.length} contacts`);
    
    // Update UI
    renderContactsTable();
  }, (error) => {
    console.error('Admin: Error listening to contacts:', error);
  });
}

// Load dashboard data
function loadDashboardData() {
  updateDashboardStats();
  updateRecentTransactions();
  updateDashboardLastUpdate();
}

// Load contacts
function loadContacts() {
  console.log('Loading contacts...');
  // Contacts will be loaded via real-time listener
}

// Update dashboard statistics
function updateDashboardStats() {
  const totalOrders = document.getElementById('totalOrders');
  const totalRevenue = document.getElementById('totalRevenue');
  const pendingOrders = document.getElementById('pendingOrders');
  const totalCustomers = document.getElementById('totalCustomers');
  
  if (!totalOrders || !totalRevenue || !pendingOrders || !totalCustomers) return;
  
  const totalOrderCount = allPurchases.length;
  const totalRevenueAmount = allPurchases.reduce((sum, order) => sum + (order.subtotal || 0), 0);
  const pendingCount = allPurchases.filter(order => order.status === 'pending').length;
  const customerCount = new Set(allPurchases.map(order => order.email).filter(Boolean)).size;
  
  totalOrders.textContent = totalOrderCount;
  totalRevenue.textContent = 'D' + totalRevenueAmount.toLocaleString();
  pendingOrders.textContent = pendingCount;
  totalCustomers.textContent = customerCount;
}

// Update recent transactions
function updateRecentTransactions() {
  const recentTransactionsList = document.getElementById('recentTransactionsList');
  if (!recentTransactionsList) return;
  
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000); // 72 hours ago
  
  const recentOrders = allPurchases.filter(order => 
    order.dateObj && order.dateObj >= threeDaysAgo
  ).slice(0, 10);
  
  recentTransactionsList.innerHTML = '';
  
  if (recentOrders.length === 0) {
    recentTransactionsList.innerHTML = '<p class="text-muted">No recent transactions</p>';
    return;
  }
  
  recentOrders.forEach(order => {
    const date = order.dateStr;
    const amount = order.amount || 'N/A';
    const statusBadge = renderStatusBadge(order.status);
    
    recentTransactionsList.innerHTML += `
      <div class="transaction-item">
        <div class="transaction-info">
          <h6>${order.orderId || 'N/A'}</h6>
          <p>${order.name || 'N/A'} (${order.email || 'N/A'})</p>
        </div>
        <div class="transaction-amount">${amount}</div>
        <div class="transaction-info">
          <p>${date}</p>
          <div>${statusBadge}</div>
        </div>
      </div>
    `;
  });
}

// Render transactions table
function renderTransactionsTable() {
  const tbody = document.getElementById('purchaseList');
  if (!tbody) return;
  
  if (allPurchases.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No purchases found.</td></tr>';
      return;
    }

  tbody.innerHTML = '';
  allPurchases.forEach((order, index) => {
    const statusSelect = renderStatusSelect(order.status, order.orderId, order.docId, order.requiresShipping);
    
    tbody.innerHTML += `
      <tr>
        <td>${order.orderId || 'N/A'}</td>
        <td>${order.name || 'N/A'}</td>
        <td>${order.product || 'N/A'}</td>
        <td>${order.amount || 'N/A'}</td>
        <td>${statusSelect}</td>
        <td>${order.dateStr}</td>
        <td>
          <button class="btn btn-sm btn-outline-admin" onclick="viewOrderDetails('${order.docId}')">
            <i class="bi bi-eye"></i>
          </button>
        </td>
      </tr>
    `;
  });
}

// Render status select dropdown
function renderStatusSelect(status, orderId, docId, requiresShipping = false) {
  const statusOptions = requiresShipping ? 
    ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] :
    ['pending', 'processing', 'delivered', 'cancelled'];
  
  const currentStatus = status || 'pending';
  const shippingIcon = requiresShipping ? '<i class="bi bi-airplane me-1"></i>' : '<i class="bi bi-truck me-1"></i>';
  
  return `
    <div class="status-control">
      ${shippingIcon}
      <select class="form-select form-select-sm status-dropdown" 
              data-order-id="${orderId}" 
              data-doc-id="${docId}"
              data-requires-shipping="${requiresShipping}"
              onchange="updateOrderStatus(this)">
        ${statusOptions.map(option => `
          <option value="${option}" 
                  ${option === currentStatus ? 'selected' : ''}>
            ${option.charAt(0).toUpperCase() + option.slice(1)}
          </option>
        `).join('')}
      </select>
      <span class="status-badge status-${currentStatus}">
        ${currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
      </span>
    </div>
  `;
}

// Render status badge
function renderStatusBadge(status) {
  const statusClass = `status-${status || 'pending'}`;
  const statusLabel = (status || 'pending').charAt(0).toUpperCase() + (status || 'pending').slice(1);
  
  return `<span class="status-badge ${statusClass}">${statusLabel}</span>`;
}

// Update order status
async function updateOrderStatus(selectElement) {
  const newStatus = selectElement.value;
  const orderId = selectElement.dataset.orderId;
  const docId = selectElement.dataset.docId;
  
  try {
    // Update in Firestore
    const orderRef = db.collection('orders').doc(docId);
    await orderRef.update({
      status: newStatus,
      updated: firebase.firestore.FieldValue.serverTimestamp(),
      [`statusHistory.${newStatus}`]: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Order ${orderId} status updated to: ${newStatus}`);
    
    // Update the visual badge
    const statusBadge = selectElement.parentElement.querySelector('.status-badge');
    if (statusBadge) {
      statusBadge.className = `status-badge status-${newStatus}`;
      statusBadge.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    }
    
    // Update local data
    const order = allPurchases.find(p => p.docId === docId);
    if (order) {
      order.status = newStatus;
    }
    
  } catch (error) {
    console.error('Error updating order status:', error);
    alert('Failed to update order status. Please try again.');
    // Revert dropdown to previous value
    selectElement.value = selectElement.dataset.previousValue || 'pending';
  }
}

// Load users
async function loadUsers() {
  try {
    const usersCol = db.collection('users');
    const snapshot = await usersCol.orderBy('created', 'desc').get();
    
    allUsers = [];
    snapshot.forEach(doc => {
      const user = doc.data();
      allUsers.push({
        id: doc.id,
        ...user,
        created: user.created ? user.created.toDate() : new Date()
      });
    });
    
    renderUsers();
  } catch (error) {
    console.error('Error loading users:', error);
    // Fallback to sample users if Firestore fails
    allUsers = [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@sensation.com',
        role: 'admin',
        status: 'active',
        created: new Date('2024-01-01')
      }
    ];
    renderUsers();
  }
}

// Render users table
function renderUsers() {
  const tbody = document.getElementById('usersList');
  if (!tbody) return;
  
  const html = allUsers.map(u => `
    <tr>
      <td>
        <div class="d-flex align-items-center">
          <div class="user-avatar">
            <i class="bi bi-person"></i>
          </div>
          <div>
            <h6 class="mb-0">${u.name}</h6>
            <small class="text-muted">ID: ${u.id}</small>
          </div>
        </div>
      </td>
      <td>${u.email}</td>
      <td><span class="badge bg-primary">${u.role}</span></td>
      <td><span class="badge bg-success">${u.status}</span></td>
      <td>${u.created.toLocaleDateString()}</td>
      <td>
        <button class="btn btn-sm btn-outline-admin" onclick="editUser('${u.id}')">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${u.id}')">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
  
  tbody.innerHTML = html;
}

// Export to CSV
function exportToCSV() {
  const headers = ['Order ID', 'Customer', 'Email', 'Phone', 'Products', 'Amount', 'Status', 'Date'];
  const csvContent = [
    headers.join(','),
    ...allPurchases.map(p => [
      p.orderId || 'N/A',
      p.name || 'N/A',
      p.email || 'N/A',
      p.phone || 'N/A',
      p.product || 'N/A',
      p.amount || 'N/A',
      p.status || 'N/A',
      p.dateStr || 'N/A'
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sensation-orders-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Apply filters
function applyFilters() {
  const dateFrom = document.getElementById('filterDateFrom')?.value;
  const dateTo = document.getElementById('filterDateTo')?.value;
  const status = document.getElementById('filterStatus')?.value;
  const search = document.getElementById('searchInput')?.value.toLowerCase();
  
  let filtered = allPurchases;
  
  if (dateFrom) {
    filtered = filtered.filter(p => {
      if (!p.dateObj) return false;
      return p.dateObj >= new Date(dateFrom);
    });
  }
  
  if (dateTo) {
    filtered = filtered.filter(p => {
      if (!p.dateObj) return false;
      return p.dateObj <= new Date(dateTo);
    });
  }
  
  if (status) {
    filtered = filtered.filter(p => p.status === status);
  }
  
  if (search) {
    filtered = filtered.filter(p => 
      p.name?.toLowerCase().includes(search) ||
      p.email?.toLowerCase().includes(search) ||
      p.orderId?.toLowerCase().includes(search)
    );
  }
  
  renderFilteredTransactions(filtered);
}

// Render filtered transactions
function renderFilteredTransactions(filtered) {
  const tbody = document.getElementById('purchaseList');
  if (!tbody) return;
  
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No matching orders found.</td></tr>';
    return;
  }
  
  tbody.innerHTML = '';
  filtered.forEach(order => {
    const statusSelect = renderStatusSelect(order.status, order.orderId, order.docId, order.requiresShipping);
    
    tbody.innerHTML += `
      <tr>
        <td>${order.orderId || 'N/A'}</td>
        <td>${order.name || 'N/A'}</td>
        <td>${order.product || 'N/A'}</td>
        <td>${order.amount || 'N/A'}</td>
        <td>${statusSelect}</td>
        <td>${order.dateStr}</td>
        <td>
          <button class="btn btn-sm btn-outline-admin" onclick="viewOrderDetails('${order.docId}')">
            <i class="bi bi-eye"></i>
          </button>
        </td>
      </tr>
    `;
  });
}

// Generate report
function generateReport() {
  const reportType = document.getElementById('reportType')?.value;
  const dateRange = document.getElementById('reportDateRange')?.value;
  
  alert(`Generating ${reportType} report for last ${dateRange} days...`);
  // In a real app, this would generate and download a PDF report
}

// Save new user
async function saveNewUser() {
  const name = document.getElementById('newUserName')?.value;
  const email = document.getElementById('newUserEmail')?.value;
  const role = document.getElementById('newUserRole')?.value;
  
  if (!name || !email || !role) {
    alert('Please fill in all fields');
    return;
  }
  
  try {
    const userRef = db.collection('users').doc(email);
    await userRef.set({
        name,
      email,
      role,
      permissions: {
        canViewOrders: document.getElementById('canViewOrders')?.checked || false,
        canEditOrders: document.getElementById('canEditOrders')?.checked || false,
        canManageUsers: document.getElementById('canManageUsers')?.checked || false,
        canViewAnalytics: document.getElementById('canViewAnalytics')?.checked || false
      },
        created: firebase.firestore.FieldValue.serverTimestamp()
      });

    console.log(`User ${email} added successfully.`);
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
    if (modal) modal.hide();
    
    // Clear form
    document.getElementById('addUserForm')?.reset();
    
    // Refresh users list
    loadUsers();
    
    alert('User added successfully!');
  } catch (error) {
    console.error('Error adding user:', error);
    alert('Failed to add user. Email might already be in use or other error.');
  }
}

// Initialize charts
function initializeCharts() {
  if (charts.salesChart) return; // Already initialized
  
  // Create charts with real data
  createSalesChart();
  createProductsChart();
  createStatusChart();
  createRevenueChart();
}

// Create sales trend chart with real data
function createSalesChart() {
  const salesCtx = document.getElementById('salesChart')?.getContext('2d');
  if (!salesCtx) return;
  
  const salesData = processSalesData();
  
  charts.salesChart = new Chart(salesCtx, {
    type: 'line',
    data: {
      labels: salesData.labels,
      datasets: [{
        label: 'Sales (D)',
        data: salesData.data,
        borderColor: '#8B5C2A',
        backgroundColor: 'rgba(139, 92, 42, 0.1)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#fff' }
        }
      },
      scales: {
        y: {
          ticks: { color: '#fff' }
        },
        x: {
          ticks: { color: '#fff' }
        }
      }
    }
  });
  
  // Hide loading state and show chart
  const container = salesCtx.canvas.closest('.chart-container');
  if (container) {
    container.classList.add('charts-loaded');
  }
}

// Create products chart with real data
function createProductsChart() {
  const productsCtx = document.getElementById('productsChart')?.getContext('2d');
  if (!productsCtx) return;
  
  const productsData = processProductsData();
  
  charts.productsChart = new Chart(productsCtx, {
    type: 'doughnut',
    data: {
      labels: productsData.labels,
      datasets: [{
        data: productsData.data,
        backgroundColor: ['#8B5C2A', '#BF8B3A', '#D4AF37', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#fff' }
        }
      }
    }
  });
  
  // Hide loading state and show chart
  const container = productsCtx.canvas.closest('.chart-container');
  if (container) {
    container.classList.add('charts-loaded');
  }
}

// Create status chart with real data
function createStatusChart() {
  const statusCtx = document.getElementById('statusChart')?.getContext('2d');
  if (!statusCtx) return;
  
  const statusData = processStatusData();
  
  charts.statusChart = new Chart(statusCtx, {
    type: 'bar',
    data: {
      labels: statusData.labels,
      datasets: [{
        label: 'Orders',
        data: statusData.data,
        backgroundColor: ['#FFD700', '#17a2b8', '#007bff', '#28a745', '#6c757d']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#fff' }
        }
      },
      scales: {
        y: {
          ticks: { color: '#fff' }
        },
        x: {
          ticks: { color: '#fff' }
        }
      }
    }
  });
  
  // Hide loading state and show chart
  const container = statusCtx.canvas.closest('.chart-container');
  if (container) {
    container.classList.add('charts-loaded');
  }
}

// Create revenue chart with real data
function createRevenueChart() {
  const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
  if (!revenueCtx) return;
  
  const revenueData = processRevenueData();
  
  charts.revenueChart = new Chart(revenueCtx, {
    type: 'bar',
    data: {
      labels: revenueData.labels,
      datasets: [{
        label: 'Revenue (D)',
        data: revenueData.data,
        backgroundColor: '#8B5C2A'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#fff' }
        }
      },
      scales: {
        y: {
          ticks: { color: '#fff' }
        },
        x: {
          ticks: { color: '#fff' }
        }
      }
    }
  });
  
  // Hide loading state and show chart
  const container = revenueCtx.canvas.closest('.chart-container');
  if (container) {
    container.classList.add('charts-loaded');
  }
}

// Process sales data for the last 30 days
function processSalesData() {
  try {
    if (!allPurchases || allPurchases.length === 0) {
      return { labels: ['No Data'], data: [0] };
    }
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Group orders by date
    const dailySales = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailySales[dateStr] = 0;
    }
    
    // Calculate daily sales
    allPurchases.forEach(order => {
      if (order.dateObj && order.dateObj >= thirtyDaysAgo && order.subtotal) {
        const dateStr = order.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (dailySales[dateStr] !== undefined) {
          dailySales[dateStr] += order.subtotal;
        }
      }
    });
    
    // Convert to arrays for chart
    const labels = Object.keys(dailySales).reverse();
    const data = labels.map(date => dailySales[date]);
    
    return { labels, data };
  } catch (error) {
    console.error('Error processing sales data:', error);
    return { labels: ['Error'], data: [0] };
  }
}

// Process products data
function processProductsData() {
  try {
    if (!allPurchases || allPurchases.length === 0) {
      return { labels: ['No Data'], data: [1] };
    }
    
    const productCounts = {};
    
    allPurchases.forEach(order => {
      if (order.cart && Array.isArray(order.cart)) {
        order.cart.forEach(item => {
          const productName = item.name || 'Unknown Product';
          productCounts[productName] = (productCounts[productName] || 0) + (item.qty || item.quantity || 1);
        });
      }
    });
    
    // Sort by quantity and take top 8
    const sortedProducts = Object.entries(productCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8);
    
    const labels = sortedProducts.map(([name]) => name);
    const data = sortedProducts.map(([, count]) => count);
    
    return { labels, data };
  } catch (error) {
    console.error('Error processing products data:', error);
    return { labels: ['Error'], data: [1] };
  }
}

// Process order status data
function processStatusData() {
  try {
    if (!allPurchases || allPurchases.length === 0) {
      return { labels: ['No Data'], data: [0] };
    }
    
    const statusCounts = {};
    
    allPurchases.forEach(order => {
      const status = order.status || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);
    
    return { labels, data };
  } catch (error) {
    console.error('Error processing status data:', error);
    return { labels: ['Error'], data: [0] };
  }
}

// Process revenue data by month
function processRevenueData() {
  try {
    if (!allPurchases || allPurchases.length === 0) {
      return { labels: ['No Data'], data: [0] };
    }
    
    const monthlyRevenue = {};
    
    allPurchases.forEach(order => {
      if (order.dateObj && order.subtotal) {
        const monthYear = order.dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyRevenue[monthYear] = (monthlyRevenue[monthYear] || 0) + order.subtotal;
      }
    });
    
    // Sort by date and take last 6 months
    const sortedMonths = Object.entries(monthlyRevenue)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-6);
    
    const labels = sortedMonths.map(([month]) => month);
    const data = sortedMonths.map(([, revenue]) => revenue);
    
    return { labels, data };
  } catch (error) {
    console.error('Error processing revenue data:', error);
    return { labels: ['Error'], data: [0] };
  }
}

// Update all charts with fresh data
function updateCharts() {
  if (!charts.salesChart) return; // Charts not initialized yet
  
  // Update sales chart
  if (charts.salesChart) {
    const salesData = processSalesData();
    charts.salesChart.data.labels = salesData.labels;
    charts.salesChart.data.datasets[0].data = salesData.data;
    charts.salesChart.update();
  }
  
  // Update products chart
  if (charts.productsChart) {
    const productsData = processProductsData();
    charts.productsChart.data.labels = productsData.labels;
    charts.productsChart.data.datasets[0].data = productsData.data;
    charts.productsChart.update();
  }
  
  // Update status chart
  if (charts.statusChart) {
    const statusData = processStatusData();
    charts.statusChart.data.labels = statusData.labels;
    charts.statusChart.data.datasets[0].data = statusData.data;
    charts.statusChart.update();
  }
  
  // Update revenue chart
  if (charts.revenueChart) {
    const revenueData = processRevenueData();
    charts.revenueChart.data.labels = revenueData.labels;
    charts.revenueChart.data.datasets[0].data = revenueData.data;
    charts.revenueChart.update();
  }
}

// Refresh analytics manually
function refreshAnalytics() {
  console.log('Refreshing analytics charts...');
  updateCharts();
  updateAnalyticsSummary();
  
  // Show feedback to user
  const refreshBtn = document.getElementById('refreshAnalytics');
  if (refreshBtn) {
    const originalText = refreshBtn.innerHTML;
    refreshBtn.innerHTML = '<i class="bi bi-check-circle"></i> Updated!';
    refreshBtn.classList.add('btn-success');
    refreshBtn.classList.remove('btn-admin');
    
    setTimeout(() => {
      refreshBtn.innerHTML = originalText;
      refreshBtn.classList.remove('btn-success');
      refreshBtn.classList.add('btn-admin');
    }, 2000);
  }
}

// Update analytics summary cards
function updateAnalyticsSummary() {
  if (!allPurchases || allPurchases.length === 0) {
    document.getElementById('analyticsTotalOrders').textContent = '0';
    document.getElementById('analyticsTotalRevenue').textContent = 'D0';
    document.getElementById('analyticsAvgOrder').textContent = 'D0';
    document.getElementById('analyticsTopProduct').textContent = 'N/A';
    return;
  }
  
  // Total orders
  const totalOrders = allPurchases.length;
  document.getElementById('analyticsTotalOrders').textContent = totalOrders;
  
  // Total revenue
  const totalRevenue = allPurchases.reduce((sum, order) => sum + (order.subtotal || 0), 0);
  document.getElementById('analyticsTotalRevenue').textContent = 'D' + totalRevenue.toLocaleString();
  
  // Average order value
  const avgOrderValue = totalRevenue / totalOrders;
  document.getElementById('analyticsAvgOrder').textContent = 'D' + avgOrderValue.toFixed(2);
  
  // Top product
  const productCounts = {};
  allPurchases.forEach(order => {
    if (order.cart && Array.isArray(order.cart)) {
      order.cart.forEach(item => {
        const productName = item.name || 'Unknown Product';
        productCounts[productName] = (productCounts[productName] || 0) + (item.qty || item.quantity || 1);
      });
    }
  });
  
  const topProduct = Object.entries(productCounts)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (topProduct) {
    document.getElementById('analyticsTopProduct').textContent = topProduct[0];
  } else {
    document.getElementById('analyticsTopProduct').textContent = 'N/A';
  }
}

// Update dashboard last update time
function updateDashboardLastUpdate() {
  const element = document.getElementById('dashboardLastUpdate');
  if (element) {
    element.textContent = new Date().toLocaleString();
  }
}

// View order details
function viewOrderDetails(docId) {
  const order = allPurchases.find(p => p.docId === docId);
  if (order) {
    alert(`Order Details:\nCustomer: ${order.name}\nEmail: ${order.email}\nProducts: ${order.product}\nStatus: ${order.status}`);
  }
}

// Edit user
function editUser(userId) {
  const user = allUsers.find(u => u.id === userId);
  if (user) {
    alert(`Edit user: ${user.name} (${user.email})`);
    // In a real app, this would open an edit modal
  }
}

// Delete user
function deleteUser(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    allUsers = allUsers.filter(u => u.id !== userId);
    renderUsers();
    alert('User deleted successfully!');
  }
}

// Render contacts table
function renderContactsTable() {
  const tbody = document.getElementById('contactsList');
  if (!tbody) return;
  
  const html = allContacts.map(contact => `
    <tr>
      <td>${contact.dateStr || 'N/A'}</td>
      <td>${contact.name || 'N/A'}</td>
      <td>${contact.email || 'N/A'}</td>
      <td>
        <div class="text-truncate" style="max-width: 200px;" title="${contact.message || ''}">
          ${contact.message ? (contact.message.length > 50 ? contact.message.substring(0, 50) + '...' : contact.message) : 'N/A'}
        </div>
      </td>
      <td>
        <select class="form-select status-dropdown" onchange="updateContactStatus(this, '${contact.docId}')">
          <option value="new" ${contact.status === 'new' ? 'selected' : ''}>New</option>
          <option value="read" ${contact.status === 'read' ? 'selected' : ''}>Read</option>
          <option value="replied" ${contact.status === 'replied' ? 'selected' : ''}>Replied</option>
          <option value="archived" ${contact.status === 'archived' ? 'selected' : ''}>Archived</option>
        </select>
      </td>
      <td>
        <button class="btn btn-sm btn-outline-admin" onclick="viewContactDetails('${contact.docId}')">
          <i class="bi bi-eye"></i> View
        </button>
      </td>
    </tr>
  `).join('');
  
  tbody.innerHTML = html;
}

// Update contact status
async function updateContactStatus(selectElement, docId) {
  const newStatus = selectElement.value;
  const contact = allContacts.find(c => c.docId === docId);
  
  if (!contact) return;
  
  try {
    await db.collection('contacts').doc(docId).update({
      status: newStatus,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update local data
    contact.status = newStatus;
    
    console.log(`Contact ${docId} status updated to ${newStatus}`);
  } catch (error) {
    console.error('Error updating contact status:', error);
    alert('Failed to update contact status. Please try again.');
    
    // Revert select element
    selectElement.value = contact.status;
  }
}

// View contact details
function viewContactDetails(docId) {
  const contact = allContacts.find(c => c.docId === docId);
  if (!contact) return;
  
  const modal = new bootstrap.Modal(document.getElementById('contactDetailsModal'));
  const content = document.getElementById('contactDetailsContent');
  
  content.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <h6>Contact Information</h6>
        <p><strong>Name:</strong> ${contact.name || 'N/A'}</p>
        <p><strong>Email:</strong> ${contact.email || 'N/A'}</p>
        <p><strong>Date:</strong> ${contact.dateStr || 'N/A'}</p>
        <p><strong>Status:</strong> <span class="badge bg-${getStatusBadgeColor(contact.status)}">${contact.status || 'new'}</span></p>
      </div>
      <div class="col-md-6">
        <h6>Message</h6>
        <div class="border rounded p-3 bg-light text-dark">
          ${contact.message ? contact.message.replace(/\n/g, '<br>') : 'No message'}
        </div>
      </div>
    </div>
  `;
  
  // Set up modal button handlers
  const markAsReadBtn = document.getElementById('markAsReadBtn');
  const markAsRepliedBtn = document.getElementById('markAsRepliedBtn');
  
  markAsReadBtn.onclick = () => updateContactStatusFromModal(docId, 'read');
  markAsRepliedBtn.onclick = () => updateContactStatusFromModal(docId, 'replied');
  
  modal.show();
}

// Update contact status from modal
async function updateContactStatusFromModal(docId, newStatus) {
  try {
    await db.collection('contacts').doc(docId).update({
      status: newStatus,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update local data
    const contact = allContacts.find(c => c.docId === docId);
    if (contact) {
      contact.status = newStatus;
    }
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('contactDetailsModal'));
    modal.hide();
    
    // Refresh table
    renderContactsTable();
    
    console.log(`Contact ${docId} status updated to ${newStatus}`);
  } catch (error) {
    console.error('Error updating contact status from modal:', error);
    alert('Failed to update contact status. Please try again.');
  }
}

// Get status badge color
function getStatusBadgeColor(status) {
  switch (status) {
    case 'new': return 'primary';
    case 'read': return 'info';
    case 'replied': return 'success';
    case 'archived': return 'secondary';
    default: return 'secondary';
  }
}

// Filter contacts
function filterContacts() {
  const search = document.getElementById('contactSearchInput')?.value.toLowerCase() || '';
  const status = document.getElementById('contactStatusFilter')?.value || '';
  const dateFrom = document.getElementById('contactDateFrom')?.value || '';
  const dateTo = document.getElementById('contactDateTo')?.value || '';
  
  let filtered = allContacts;
  
  if (search) {
    filtered = filtered.filter(contact => 
      contact.name?.toLowerCase().includes(search) ||
      contact.email?.toLowerCase().includes(search) ||
      contact.message?.toLowerCase().includes(search)
    );
  }
  
  if (status) {
    filtered = filtered.filter(contact => contact.status === status);
  }
  
  if (dateFrom) {
    filtered = filtered.filter(contact => {
      if (!contact.dateObj) return false;
      return contact.dateObj >= new Date(dateFrom);
    });
  }
  
  if (dateTo) {
    filtered = filtered.filter(contact => {
      if (!contact.dateObj) return false;
      return contact.dateObj <= new Date(dateTo);
    });
  }
  
  renderFilteredContacts(filtered);
}

// Render filtered contacts
function renderFilteredContacts(filtered) {
  const tbody = document.getElementById('contactsList');
  if (!tbody) return;
  
  const html = filtered.map(contact => `
    <tr>
      <td>${contact.dateStr || 'N/A'}</td>
      <td>${contact.name || 'N/A'}</td>
      <td>${contact.email || 'N/A'}</td>
      <td>
        <div class="text-truncate" style="max-width: 200px;" title="${contact.message || ''}">
          ${contact.message ? (contact.message.length > 50 ? contact.message.substring(0, 50) + '...' : contact.message) : 'N/A'}
        </div>
      </td>
      <td>
        <select class="form-select status-dropdown" onchange="updateContactStatus(this, '${contact.docId}')">
          <option value="new" ${contact.status === 'new' ? 'selected' : ''}>New</option>
          <option value="read" ${contact.status === 'read' ? 'selected' : ''}>Read</option>
          <option value="replied" ${contact.status === 'replied' ? 'selected' : ''}>Replied</option>
          <option value="archived" ${contact.status === 'archived' ? 'selected' : ''}>Archived</option>
        </select>
      </td>
      <td>
        <button class="btn btn-sm btn-outline-admin" onclick="viewContactDetails('${contact.docId}')">
          <i class="bi bi-eye"></i> View
        </button>
        </td>
    </tr>
  `).join('');
  
  tbody.innerHTML = html;
}

// Export contacts to CSV
function exportContactsToCSV() {
  const headers = ['Date', 'Name', 'Email', 'Message', 'Status'];
  const csvContent = [
    headers.join(','),
    ...allContacts.map(contact => [
      contact.dateStr || 'N/A',
      contact.name || 'N/A',
      contact.email || 'N/A',
      `"${(contact.message || '').replace(/"/g, '""')}"`,
      contact.status || 'N/A'
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sensation-contacts-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Make functions globally available
window.updateOrderStatus = updateOrderStatus;
window.viewOrderDetails = viewOrderDetails;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.updateContactStatus = updateContactStatus;
window.viewContactDetails = viewContactDetails;
window.updateContactStatusFromModal = updateContactStatusFromModal;
window.filterContacts = filterContacts;
window.exportContactsToCSV = exportContactsToCSV;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Admin panel DOM loaded');
  
  // Set up event listeners first
  console.log('Setting up event listeners...');
  setupEventListeners();
  console.log('Event listeners set up complete');
  
  // Check if user is authenticated and is admin
  console.log('Setting up auth state listener...');
  auth.onAuthStateChanged(user => {
    console.log('Auth state changed:', user ? user.email : 'No user');
    if (user && allowedAdmins.includes(user.email)) {
      console.log('Admin authenticated:', user.email);
      showAdminPanel();
      initAdmin();
    } else {
      console.log('User not authenticated or not admin');
      hideAdminPanel();
    }
  });
  console.log('Auth state listener set up complete');
});
