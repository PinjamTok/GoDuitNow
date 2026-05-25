// ===============================
// GoDuitNow - Main JavaScript
// ===============================

// LOGIN FUNCTION
function login() {
    const phone = document.getElementById('phone').value.trim();
    const pin = document.getElementById('pin').value.trim();
    const errorDiv = document.getElementById('errorMessage');

    // Validation
    if (!phone || !pin) {
        errorDiv.textContent = '❌ Sila isi nombor telefon dan PIN';
        errorDiv.style.display = 'block';
        return;
    }

    if (phone.length !== 10 && phone.length !== 11) {
        errorDiv.textContent = '❌ Nombor telefon tidak sah (10-11 digit)';
        errorDiv.style.display = 'block';
        return;
    }

    if (pin.length < 4 || pin.length > 6) {
        errorDiv.textContent = '❌ PIN mesti 4-6 digit';
        errorDiv.style.display = 'block';
        return;
    }

    // Get all registered users
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    
    // Find user with matching phone and PIN
    const user = allUsers.find(u => u.phone === phone && u.pin === pin);

    if (user) {
        // Login successful
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('currentUserPhone', phone);
        errorDiv.style.display = 'none';
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 500);
    } else {
        // Login failed
        errorDiv.textContent = '❌ Nombor telefon atau PIN tidak tepat';
        errorDiv.style.display = 'block';
    }
}

// REGISTER FUNCTION
function register() {
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const ic = document.getElementById('ic').value.trim();
    const pin = document.getElementById('pin').value.trim();
    const confirmPin = document.getElementById('confirmPin').value.trim();
    const terms = document.getElementById('terms').checked;

    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');

    // Reset messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';

    // Validation
    if (!fullName || !email || !phone || !ic || !pin || !confirmPin) {
        showError('❌ Sila isi semua medan', errorDiv);
        return;
    }

    if (!terms) {
        showError('❌ Sila setuju dengan Terma & Syarat', errorDiv);
        return;
    }

    if (phone.length !== 10 && phone.length !== 11) {
        showError('❌ Nombor telefon tidak sah (10-11 digit)', errorDiv);
        return;
    }

    if (ic.length !== 12) {
        showError('❌ MyKad mesti 12 digit', errorDiv);
        return;
    }

    if (pin.length < 4 || pin.length > 6) {
        showError('❌ PIN mesti 4-6 digit', errorDiv);
        return;
    }

    if (pin !== confirmPin) {
        showError('❌ PIN tidak sepadan', errorDiv);
        return;
    }

    if (!isValidEmail(email)) {
        showError('❌ Email tidak sah', errorDiv);
        return;
    }

    // Check if phone already registered
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    if (allUsers.some(u => u.phone === phone)) {
        showError('❌ Nombor telefon sudah didaftarkan', errorDiv);
        return;
    }

    // Create new user
    const newUser = {
        id: 'USER-' + Date.now(),
        fullName: fullName,
        email: email,
        phone: phone,
        ic: ic,
        pin: pin,
        dateRegistered: new Date().toLocaleDateString('ms-MY'),
        status: 'Active'
    };

    // Save user
    allUsers.push(newUser);
    localStorage.setItem('allUsers', JSON.stringify(allUsers));

    // Show success message
    successDiv.textContent = '✅ Pendaftaran berjaya! Anda boleh login sekarang.';
    successDiv.style.display = 'block';

    // Reset form
    document.getElementById('registerForm').reset();

    // Redirect to login after 2 seconds
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Helper function - Show error
function showError(message, errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// Helper function - Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Check if user is logged in (for dashboard)
function checkLogin() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'index.html';
    }
}

// Load dashboard data
function loadDashboardData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (document.getElementById('userName')) {
        document.getElementById('userName').textContent = 'Selamat Datang, ' + currentUser.fullName;
    }

    if (document.getElementById('profileName')) {
        document.getElementById('profileName').textContent = currentUser.fullName || '-';
    }

    if (document.getElementById('profileEmail')) {
        document.getElementById('profileEmail').textContent = currentUser.email || '-';
    }

    if (document.getElementById('profilePhone')) {
        document.getElementById('profilePhone').textContent = currentUser.phone || '-';
    }

    if (document.getElementById('profileIC')) {
        document.getElementById('profileIC').textContent = currentUser.ic || '-';
    }

    // Load loans data
    loadLoansData();
}

// Load user's loans
function loadLoansData() {
    const currentUserPhone = localStorage.getItem('currentUserPhone');
    const allLoans = JSON.parse(localStorage.getItem('userLoans') || '[]');
    
    // Filter loans for current user
    const userLoans = allLoans.filter(loan => {
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        return loan.userName === userData.fullName;
    });

    const loansList = document.getElementById('loansList');
    
    if (userLoans.length === 0) {
        loansList.innerHTML = '<p>Tiada pinjaman buat masa ini</p>';
        document.getElementById('totalLoan').textContent = 'RM 0.00';
        document.getElementById('loanStatus').textContent = 'Tiada Pinjaman';
        return;
    }

    // Display loans
    loansList.innerHTML = '';
    let totalAmount = 0;

    userLoans.forEach(loan => {
        totalAmount += parseFloat(loan.amount);
        
        const loanHTML = `
            <div class="loan-item">
                <div class="loan-item-info">
                    <h4>Pinjaman ID: ${loan.id}</h4>
                    <p><strong>Jumlah:</strong> RM ${parseFloat(loan.amount).toFixed(2)}</p>
                    <p><strong>Tempoh:</strong> ${loan.duration} bulan</p>
                    <p><strong>Tujuan:</strong> ${loan.purpose}</p>
                    <p><strong>Tarikh Apply:</strong> ${loan.dateApplied}</p>
                </div>
                <div class="loan-item-status status-${loan.status.toLowerCase().replace(' ', '-')}">
                    ${loan.status}
                </div>
            </div>
        `;
        loansList.innerHTML += loanHTML;
    });

    document.getElementById('totalLoan').textContent = 'RM ' + totalAmount.toFixed(2);
    
    if (userLoans.some(l => l.status === 'Diluluskan')) {
        document.getElementById('loanStatus').textContent = 'Aktif';
    } else if (userLoans.some(l => l.status === 'Menunggu Ulasan')) {
        document.getElementById('loanStatus').textContent = 'Menunggu Ulasan';
    } else {
        document.getElementById('loanStatus').textContent = 'Tidak Diluluskan';
    }
}

// Logout function
function logout() {
    if (confirm('Adakah anda pasti ingin keluar?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentUserPhone');
        window.location.href = 'index.html';
    }
}

// Show section in dashboard
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));

    // Show selected section
    const selectedSection = document.getElementById(sectionName + '-section');
    if (selectedSection) {
        selectedSection.classList.add('active');
    }

    // Update menu active state
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));
    
    event.target.classList.add('active');
}

// Calculate loan
function calculateLoan() {
    const amount = parseFloat(document.getElementById('loanAmount').value) || 0;
    const duration = parseInt(document.getElementById('loanDuration').value) || 0;
    const interestRate = 0.08; // 8% annual

    if (document.getElementById('displayAmount')) {
        document.getElementById('displayAmount').textContent = 'RM ' + amount.toFixed(2);
        document.getElementById('displayRate').textContent = (interestRate * 100) + '%';
    }

    if (amount > 0 && duration > 0) {
        const monthlyRate = interestRate / 12;
        const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, duration)) / (Math.pow(1 + monthlyRate, duration) - 1);
        const totalPayback = monthlyPayment * duration;

        if (document.getElementById('monthlyPayment')) {
            document.getElementById('monthlyPayment').textContent = 'RM ' + monthlyPayment.toFixed(2);
            document.getElementById('totalPayback').textContent = 'RM ' + totalPayback.toFixed(2);
        }
    }
}

// Submit loan application
function submitLoanApplication() {
    const amount = document.getElementById('loanAmount').value;
    const duration = document.getElementById('loanDuration').value;
    const purpose = document.getElementById('loanPurpose').value;

    if (!amount || !duration || !purpose) {
        document.getElementById('loanMessage').innerHTML = '<p class="error">❌ Sila isi semua medan</p>';
        return;
    }

    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const loans = JSON.parse(localStorage.getItem('userLoans') || '[]');

    const newLoan = {
        id: 'LOAN-' + Date.now(),
        amount: amount,
        duration: duration,
        purpose: purpose,
        status: 'Menunggu Ulasan',
        dateApplied: new Date().toLocaleDateString('ms-MY'),
        userName: userData.fullName
    };

    loans.push(newLoan);
    localStorage.setItem('userLoans', JSON.stringify(loans));

    document.getElementById('loanMessage').innerHTML = '<p class="success">✅ Permohonan pinjaman berjaya dihantar! Status: Menunggu Ulasan</p>';
    document.getElementById('loanApplicationForm').reset();
    calculateLoan();

    // Refresh loans data
    loadLoansData();
}

// Event listeners (if needed)
document.addEventListener('DOMContentLoaded', function() {
    // Check login on dashboard pages
    if (document.querySelector('.dashboard-container')) {
        checkLogin();
        loadDashboardData();
    }

    // Add event listeners for loan calculation
    const loanAmount = document.getElementById('loanAmount');
    const loanDuration = document.getElementById('loanDuration');
    const loanForm = document.getElementById('loanApplicationForm');

    if (loanAmount) {
        loanAmount.addEventListener('input', calculateLoan);
    }

    if (loanDuration) {
        loanDuration.addEventListener('change', calculateLoan);
    }

    if (loanForm) {
        loanForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitLoanApplication();
        });
    }
});

// ===============================
// End of app.js
// ===============================
