// ============================================
// Authentication Module
// ============================================

const Auth = {
    currentUser: null,
    ADMIN_EMAIL: 'admin@economics-research.edu',
    ADMIN_PASSWORD: 'Admin@2024',

    init() {
        const saved = Utils.storage.get('currentUser');
        if (saved) {
            this.currentUser = saved;
            this.updateUI();
        }
        // Initialize demo users
        if (!Utils.storage.get('users')) {
            Utils.storage.set('users', [
                { id: '1', name: 'المدير', email: this.ADMIN_EMAIL, password: this.ADMIN_PASSWORD, role: 'admin', createdAt: new Date().toISOString() },
                { id: '2', name: 'محمد أحمد', email: 'mohamed@example.com', password: '123456', role: 'user', createdAt: new Date().toISOString() },
                { id: '3', name: 'سارة علي', email: 'sara@example.com', password: '123456', role: 'user', createdAt: new Date().toISOString() }
            ]);
        }
    },

    login(email, password) {
        const users = Utils.storage.get('users') || [];
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = { id: user.id, name: user.name, email: user.email, role: user.role };
            Utils.storage.set('currentUser', this.currentUser);
            this.updateUI();
            Utils.toast('تم تسجيل الدخول بنجاح!', 'success');
            return true;
        }
        Utils.toast('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
        return false;
    },

    register(name, email, password) {
        const users = Utils.storage.get('users') || [];
        if (users.find(u => u.email === email)) {
            Utils.toast('هذا البريد مسجل مسبقاً', 'error');
            return false;
        }
        const newUser = {
            id: Utils.generateId(),
            name, email, password,
            role: 'user',
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        Utils.storage.set('users', users);
        this.currentUser = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
        Utils.storage.set('currentUser', this.currentUser);
        this.updateUI();
        Utils.toast('تم إنشاء الحساب بنجاح!', 'success');
        return true;
    },

    logout() {
        this.currentUser = null;
        Utils.storage.remove('currentUser');
        this.updateUI();
        Utils.toast('تم تسجيل الخروج', 'info');
        // Hide admin section
        document.getElementById('admin').style.display = 'none';
        document.getElementById('adminLink').style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const adminLink = document.getElementById('adminLink');

        if (this.currentUser) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'flex';
            logoutBtn.innerHTML = `<i class="fas fa-user"></i> ${this.currentUser.name}`;
            if (this.currentUser.role === 'admin') {
                adminLink.style.display = 'flex';
            }
        } else {
            loginBtn.style.display = 'flex';
            logoutBtn.style.display = 'none';
            adminLink.style.display = 'none';
        }
    },

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    },

    getAllUsers() {
        return Utils.storage.get('users') || [];
    },

    deleteUser(userId) {
        let users = Utils.storage.get('users') || [];
        users = users.filter(u => u.id !== userId);
        Utils.storage.set('users', users);
    }
};

// Global functions for HTML onclick
function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
}

function showRegisterModal() {
    closeLoginModal();
    document.getElementById('registerModal').classList.add('active');
}

function closeRegisterModal() {
    document.getElementById('registerModal').classList.remove('active');
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    if (Auth.login(email, password)) {
        closeLoginModal();
        document.getElementById('loginForm').reset();
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    if (password !== confirm) {
        Utils.toast('كلمات المرور غير متطابقة', 'error');
        return;
    }
    if (Auth.register(name, email, password)) {
        closeRegisterModal();
        document.getElementById('registerForm').reset();
    }
}

function logout() {
    Auth.logout();
}

window.Auth = Auth;
