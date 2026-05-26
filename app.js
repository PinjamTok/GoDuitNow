// ===== CHECK LOGIN & LOAD DATA =====

// Check jika user sudah login
function checkLogin() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser && window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'index.html';
    }
}

// Load dashboard data
function loadDashboardData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (document.getElementById('userName')) {
        document.getElementById('userName').textContent = 'Selamat Datang, ' + (currentUser.fullName || 'User');
    }

    if (document.getElementById('profileName')) {
        document.getElementById('profileName').textContent = currentUser.fullName || '-';
        document.getElementById('profileEmail').textContent = currentUser.email || '-';
        document.getElementById('profilePhone').textContent = currentUser.phone || '-';
        document.getElementById('profileIC').textContent = currentUser.ic || '-';
    }
}

// ===== LOGIN FUNCTION =====

function login() {
    const phone = document.getElementById('phone').value;
    const pin = document.getElementById('pin').value;
    const errorDiv = document.getElementById('errorMessage');

    if (!phone || !pin) {
        errorDiv.textContent = '❌ Sila isi semua medan';
        errorDiv.style.display = 'block';
        return;
    }

    console.log('Searching for user with phone:', phone);

    // Cari user di Firebase
    database.ref('users').orderByChild('phone').equalTo(phone).once('value', function(snapshot) {
        console.log('Search result:', snapshot.val());
        
        let found = false;
        let user = null;

        snapshot.forEach(function(childSnapshot) {
            const userData = childSnapshot.val();
            console.log('Checking user:', userData);
            
            if (userData.pin === pin) {
                found = true;
                user = userData;
            }
        });

        if (found) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            errorDiv.style.display = 'none';
            alert('✅ Login berjaya! Selamat datang ' + user.fullName);
            window.location.href = 'dashboard.html';
        } else {
            errorDiv.textContent = '❌ Telefon atau PIN tidak tepat';
            errorDiv.style.display = 'block';
        }
    }).catch(function(error) {
        console.error('Error:', error);
        errorDiv.textContent = '❌ Error: ' + error.message;
        errorDiv.style.display = 'block';
    });
}

// ===== REGISTER FUNCTION =====

function register() {
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const ic = document.getElementById('ic').value;
    const pin = document.getElementById('pin').value;
    const confirmPin = document.getElementById('confirmPin').value;

    const messageDiv = document.getElementById('message');

    // Validasi
    if (!fullName || !email || !phone || !ic || !pin || !confirmPin) {
        messageDiv.textContent = '❌ Sila isi semua medan';
        messageDiv.style.display = 'block';
        return;
    }

    if (pin !== confirmPin) {
        messageDiv.textContent = '❌ PIN tidak sepadan';
        messageDiv.style.display = 'block';
        return;
    }

    if (ic.length !== 12) {
        messageDiv.textContent = '❌ MyKad mesti 12 digit';
        messageDiv.style.display = 'block';
        return;
    }

    if (phone.length < 10 || phone.length > 11) {
        messageDiv.textContent = '❌ Nombor telefon tidak sah';
        messageDiv.style.display = 'block';
        return;
    }

    console.log('Checking if phone already registered:', phone);

    // Cek jika nomor telefon sudah ada
    database.ref('users').orderByChild('phone').equalTo(phone).once('value', function(snapshot) {
        if (snapshot.exists()) {
            messageDiv.textContent = '❌ Nomor telefon sudah terdaftar';
            messageDiv.style.display = 'block';
            console.log('Phone already exists');
            return;
        }

        console.log('Phone is unique, creating new user');

        // Buat user baru
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

        // Simpan ke Firebase
        database.ref('users/' + newUser.id).set(newUser, function(error) {
            if (error) {
                messageDiv.textContent = '❌ Pendaftaran gagal: ' + error.message;
                messageDiv.style.display = 'block';
                console.error('Error:', error);
            } else {
                messageDiv.textContent = '✅ Pendaftaran berjaya! Redirect ke login...';
                messageDiv.style.color = 'green';
                messageDiv.style.display = 'block';
                console.log('User registered successfully');

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            }
        });
    }).catch(function(error) {
        console.error('Error checking phone:', error);
        messageDiv.textContent = '❌ Error: ' + error.message;
        messageDiv.style.display = 'block';
    });
}

// ===== DASHBOARD FUNCTIONS =====

function logout() {
    if (confirm('Adakah anda pasti ingin keluar?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

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
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

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

function submitLoanApplication() {
    const amount = document.getElementById('loanAmount').value;
    const duration = document.getElementById('loanDuration').value;
    const purpose = document.getElementById('loanPurpose').value;

    if (!amount || !duration || !purpose) {
        document.getElementById('loanMessage').innerHTML = '<p style="color: red;">❌ Sila isi semua medan</p>';
        return;
    }

    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Buat loan baru
    const newLoan = {
        id: 'LOAN-' + Date.now(),
        userId: userData.id,
        amount: parseFloat(amount),
        duration: parseInt(duration),
        purpose: purpose,
        status: 'Menunggu Ulasan',
        dateApplied: new Date().toLocaleDateString('ms-MY'),
        userName: userData.fullName
    };

    // Simpan loan ke Firebase
    database.ref('loans/' + newLoan.id).set(newLoan, function(error) {
        if (error) {
            document.getElementById('loanMessage').innerHTML = '<p style="color: red;">❌ Error: ' + error.message + '</p>';
        } else {
            document.getElementById('loanMessage').innerHTML = '<p style="color: green;">✅ Permohonan pinjaman berjaya dihantar!</p>';
            document.getElementById('loanApplicationForm').reset();
            calculateLoan();
        }
    });
}

// ===== EVENT LISTENERS =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded');
    
    // Check login jika di dashboard page
    checkLogin();
    
    // Load data jika ada
    loadDashboardData();
    
    // Login form listener
    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            login();
        });
    }

    // Register form listener
    if (document.getElementById('registerForm')) {
        document.getElementById('registerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            register();
        });
    }

    // Loan calculation listeners
    if (document.getElementById('loanAmount')) {
        document.getElementById('loanAmount').addEventListener('input', calculateLoan);
    }

    if (document.getElementById('loanDuration')) {
        document.getElementById('loanDuration').addEventListener('change', calculateLoan);
    }

    // Loan form listener
    if (document.getElementById('loanApplicationForm')) {
        document.getElementById('loanApplicationForm').addEventListener('submit', function(e) {
            e.preventDefault();
            submitLoanApplication();
        });
    }
});
