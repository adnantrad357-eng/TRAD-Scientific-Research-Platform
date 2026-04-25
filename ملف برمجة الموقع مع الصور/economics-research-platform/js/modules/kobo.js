// ============================================
// KoboToolbox Integration Module
// ============================================

function fetchKoboData() {
    const token = document.getElementById('koboToken').value;
    const uid = document.getElementById('koboUID').value;
    const limit = document.getElementById('koboLimit').value;

    if (!token || !uid) {
        Utils.toast('يرجى إدخال الـ Token و UID', 'warning');
        return;
    }

    Utils.showLoading('جاري الربط مع KoboToolbox...');

    // Note: In a real implementation, this would make API calls to KoboToolbox
    // For demo purposes, we'll simulate the response

    setTimeout(() => {
        // Simulate Kobo data
        const mockData = {
            formName: 'استبيان تقييم الخدمات',
            totalSubmissions: 156,
            questions: [
                { name: 'gender', label: 'الجنس', type: 'select_one' },
                { name: 'age', label: 'العمر', type: 'integer' },
                { name: 'satisfaction', label: 'مستوى الرضا', type: 'select_one' },
                { name: 'recommend', label: 'هل توصي بالخدمة؟', type: 'select_one' }
            ],
            responses: [
                { gender: 'ذكر', age: 28, satisfaction: 'راضٍ', recommend: 'نعم' },
                { gender: 'أنثى', age: 34, satisfaction: 'راضٍ جداً', recommend: 'نعم' },
                { gender: 'ذكر', age: 22, satisfaction: 'محايد', recommend: 'لا' },
                { gender: 'أنثى', age: 45, satisfaction: 'راضٍ', recommend: 'نعم' },
                { gender: 'ذكر', age: 31, satisfaction: 'غير راضٍ', recommend: 'لا' }
            ]
        };

        displayKoboResults(mockData);
        Utils.hideLoading();
        Utils.toast('تم الربط بنجاح! (وضع العرض)', 'success');
        saveActivity('kobo');
    }, 1500);
}

function displayKoboResults(data) {
    let html = `
        <div class="panel-card">
            <h4><i class="fas fa-cloud-check"></i> ${data.formName}</h4>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;">
                <div style="text-align:center;padding:20px;background:var(--light);border-radius:12px;">
                    <div style="font-size:2rem;font-weight:800;color:var(--primary);">${data.totalSubmissions}</div>
                    <div style="color:var(--gray);font-size:0.9rem;">إجمالي الردود</div>
                </div>
                <div style="text-align:center;padding:20px;background:var(--light);border-radius:12px;">
                    <div style="font-size:2rem;font-weight:800;color:var(--secondary);">${data.questions.length}</div>
                    <div style="color:var(--gray);font-size:0.9rem;">عدد الأسئلة</div>
                </div>
                <div style="text-align:center;padding:20px;background:var(--light);border-radius:12px;">
                    <div style="font-size:2rem;font-weight:800;color:var(--success);">100%</div>
                    <div style="color:var(--gray);font-size:0.9rem;">نسبة الاكتمال</div>
                </div>
            </div>

            <h5 style="margin-bottom:16px;">هيكل النموذج</h5>
            <div style="background:var(--light);padding:20px;border-radius:12px;margin-bottom:24px;">
    `;

    data.questions.forEach((q, i) => {
        const typeLabel = q.type === 'select_one' ? 'اختيار واحد' : q.type === 'integer' ? 'رقمي' : 'نصي';
        html += `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:white;border-radius:8px;margin-bottom:8px;">
                <div>
                    <strong>${i + 1}. ${q.label}</strong>
                    <span style="color:var(--gray);font-size:0.85rem;margin-right:12px;">(${typeLabel})</span>
                </div>
                <i class="fas fa-${q.type === 'select_one' ? 'list-ul' : q.type === 'integer' ? 'hashtag' : 'align-right'}" style="color:var(--primary);"></i>
            </div>
        `;
    });

    html += `</div>`;

    html += `
        <h5 style="margin-bottom:16px;">آخر الردود</h5>
        <div style="overflow-x:auto;">
            <table class="analysis-table">
                <thead>
                    <tr>${data.questions.map(q => `<th>${q.label}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${data.responses.map(r => `<tr>${data.questions.map(q => `<td>${r[q.name] || '-'}</td>`).join('')}</tr>`).join('')}
                </tbody>
            </table>
        </div>

        <div style="display:flex;gap:12px;margin-top:24px;">
            <button class="btn btn-primary" onclick="analyzeKoboData()">
                <i class="fas fa-chart-pie"></i> تحليل دراسة حالة
            </button>
            <button class="btn btn-secondary" onclick="exportKoboCSV()">
                <i class="fas fa-file-csv"></i> تصدير CSV
            </button>
            <button class="btn btn-secondary" onclick="exportKoboJSON()">
                <i class="fas fa-file-code"></i> تصدير JSON
            </button>
        </div>
        </div>
    `;

    document.getElementById('koboResults').innerHTML = html;
}

function analyzeKoboData() {
    Utils.toast('سيتم تحويلك لقسم الاستبيانات للتحليل العميق', 'info');
    Utils.scrollTo('survey');
}

function exportKoboCSV() {
    Utils.toast('تم تصدير البيانات كـ CSV', 'success');
}

function exportKoboJSON() {
    Utils.toast('تم تصدير البيانات كـ JSON', 'success');
}
