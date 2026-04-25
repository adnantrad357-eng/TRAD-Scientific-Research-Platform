// ============================================
// Admin Dashboard Module
// ============================================

function switchAdminTab(tabName) {
    document.querySelectorAll('.admin-menu-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    event.target.closest('.admin-menu-item').classList.add('active');
    document.getElementById('admin' + tabName.charAt(0).toUpperCase() + tabName.slice(1)).classList.add('active');

    if (tabName === 'overview') loadAdminOverview();
    if (tabName === 'users') loadUsersTable();
    if (tabName === 'researches') loadResearchesTable();
    if (tabName === 'analytics') loadAnalytics();
}

function loadAdminOverview() {
    const users = Utils.storage.get('users') || [];
    const researches = Utils.storage.get('researches') || [];
    const activities = Utils.storage.get('activities') || [];

    document.getElementById('adminUserCount').textContent = users.length;
    document.getElementById('adminResearchCount').textContent = researches.length;
    document.getElementById('adminAnalysisCount').textContent = activities.filter(a => a.type === 'data_analysis').length;

    const today = new Date().toDateString();
    const todayActivities = activities.filter(a => new Date(a.timestamp).toDateString() === today);
    document.getElementById('adminActiveCount').textContent = todayActivities.length;

    // Activity chart
    const ctx = document.getElementById('adminActivityChart').getContext('2d');
    const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
    const dayCounts = days.map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return activities.filter(a => new Date(a.timestamp).toDateString() === d.toDateString()).length;
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'النشاط',
                data: dayCounts,
                borderColor: '#1a56db',
                backgroundColor: 'rgba(26,86,219,0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

function loadUsersTable() {
    const users = Utils.storage.get('users') || [];
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.email}</td>
            <td>${user.name}</td>
            <td><span style="color:${user.role === 'admin' ? 'var(--secondary)' : 'var(--primary)'};font-weight:600;">${user.role === 'admin' ? 'مدير' : 'مستخدم'}</span></td>
            <td>${new Date(user.createdAt).toLocaleDateString('ar-SA')}</td>
            <td>
                <button class="btn-icon" onclick="deleteUser('${user.id}')" ${user.role === 'admin' ? 'disabled' : ''}>
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteUser(userId) {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    Auth.deleteUser(userId);
    loadUsersTable();
    Utils.toast('تم حذف المستخدم', 'success');
}

function loadResearchesTable() {
    const researches = Utils.storage.get('researches') || [];
    const tbody = document.getElementById('researchesTableBody');
    tbody.innerHTML = '';

    researches.forEach(research => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${research.title}</strong></td>
            <td>${research.userName}</td>
            <td>${research.field}</td>
            <td>${new Date(research.createdAt).toLocaleDateString('ar-SA')}</td>
            <td><span style="color:var(--success);font-weight:600;"><i class="fas fa-check-circle"></i> مكتمل</span></td>
            <td>
                <button class="btn-icon" onclick="viewResearch('${research.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function viewResearch(id) {
    const researches = Utils.storage.get('researches') || [];
    const research = researches.find(r => r.id === id);
    if (research) {
        Utils.toast(`البحث: ${research.title}`, 'info');
    }
}

function loadAnalytics() {
    const activities = Utils.storage.get('activities') || [];
    const researches = Utils.storage.get('researches') || [];

    // Sections usage
    const sectionCounts = {};
    activities.forEach(a => {
        sectionCounts[a.type] = (sectionCounts[a.type] || 0) + 1;
    });

    const sectionCtx = document.getElementById('sectionsChart').getContext('2d');
    new Chart(sectionCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(sectionCounts).map(k => {
                const labels = { data_analysis: 'تحليل البيانات', correlation: 'ارتباط', ttest: 'اختبار T', anova: 'ANOVA', chisquare: 'كاي تربيع', survey: 'استبيان', timeseries: 'سلاسل زمنية', kobo: 'KoboToolbox' };
                return labels[k] || k;
            }),
            datasets: [{
                data: Object.values(sectionCounts),
                backgroundColor: ['#1a56db', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // Fields chart
    const fieldCounts = {};
    researches.forEach(r => {
        fieldCounts[r.field] = (fieldCounts[r.field] || 0) + 1;
    });

    const fieldCtx = document.getElementById('fieldsChart').getContext('2d');
    new Chart(fieldCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(fieldCounts).map(k => {
                const labels = { macro: 'اقتصاد كلي', micro: 'اقتصاد جزئي', development: 'تنمية', finance: 'مالية', trade: 'تجارة', labor: 'عمل', monetary: 'نقدية', other: 'أخرى' };
                return labels[k] || k;
            }),
            datasets: [{
                label: 'عدد الأبحاث',
                data: Object.values(fieldCounts),
                backgroundColor: '#1a56db',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

function saveSettings() {
    const settings = {
        siteName: document.getElementById('siteName').value,
        adminEmail: document.getElementById('adminEmail').value,
        maxReferences: document.getElementById('maxReferences').value,
        enableRegistration: document.getElementById('enableRegistration').checked
    };
    Utils.storage.set('settings', settings);
    Utils.toast('تم حفظ الإعدادات بنجاح!', 'success');
}
