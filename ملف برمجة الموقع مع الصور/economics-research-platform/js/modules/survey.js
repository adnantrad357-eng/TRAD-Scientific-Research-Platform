// ============================================
// Survey Module
// ============================================

function loadSurveyExample() {
    const example = [
        { question: "ما هو مستوى رضاك عن الخدمة؟", type: "likert", options: ["غير راضٍ", "راضٍ قليلاً", "راضٍ", "راضٍ جداً", "ممتاز"] },
        { question: "هل توصي بالخدمة للآخرين؟", type: "yesno", options: ["نعم", "لا"] },
        { question: "كم مرة تستخدم الخدمة شهرياً؟", type: "numeric", options: [] },
        { question: "ما هي الجوانب التي تحتاج تحسيناً؟", type: "text", options: [] }
    ];
    document.getElementById('surveyQuestions').value = JSON.stringify(example, null, 2);
    Utils.toast('تم تحميل المثال', 'success');
}

function loadResponsesExample() {
    const example = `اسم,العمر,رضا,التوصية,الاستخدام,تحسين
أحمد,25,4,نعم,5,السرعة
محمد,30,3,نعم,3,السعر
سارة,22,5,نعم,8,الجودة
علي,35,2,لا,1,الدعم
فاطمة,28,4,نعم,4,الواجهة`;
    document.getElementById('surveyResponses').value = example;
    Utils.toast('تم تحميل المثال', 'success');
}

function analyzeSurvey() {
    const context = document.getElementById('surveyContext').value || 'دراسة الحالة';
    const questionsText = document.getElementById('surveyQuestions').value;
    const responsesText = document.getElementById('surveyResponses').value;
    const interviewsText = document.getElementById('surveyInterviews').value;

    if (!questionsText || !responsesText) {
        Utils.toast('يرجى إدخال الأسئلة والردود', 'warning');
        return;
    }

    Utils.showLoading('جاري تحليل الاستبيان...');

    setTimeout(() => {
        let questions;
        try {
            questions = JSON.parse(questionsText);
        } catch (e) {
            Utils.toast('صيغة JSON غير صحيحة للأسئلة', 'error');
            Utils.hideLoading();
            return;
        }

        // Parse CSV responses
        const lines = responsesText.trim().split('
');
        const headers = lines[0].split(',').map(h => h.trim());
        const responses = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj = {};
            headers.forEach((h, i) => obj[h] = values[i]);
            return obj;
        });

        // Generate analysis
        let analysisHTML = `
            <div class="panel-card" style="margin-bottom:24px;">
                <h4><i class="fas fa-chart-pie"></i> نتائج تحليل الاستبيان</h4>
                <div style="background:var(--light);padding:20px;border-radius:12px;margin-bottom:20px;">
                    <h5 style="margin-bottom:12px;">نظرة عامة</h5>
                    <p><strong>سياق الدراسة:</strong> ${context}</p>
                    <p><strong>عدد المشاركين:</strong> ${responses.length}</p>
                    <p><strong>عدد الأسئلة:</strong> ${questions.length}</p>
                </div>
        `;

        // Analyze each question
        questions.forEach((q, idx) => {
            const colName = headers[idx + 1] || headers[idx];
            const values = responses.map(r => r[colName]).filter(v => v);

            analysisHTML += `<div style="background:var(--light);padding:20px;border-radius:12px;margin-bottom:16px;">`;
            analysisHTML += `<h5 style="margin-bottom:12px;color:var(--primary);">${idx + 1}. ${q.question}</h5>`;

            if (q.type === 'likert' || q.type === 'yesno') {
                const counts = {};
                values.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
                const total = values.length;

                analysisHTML += `<div style="margin-bottom:12px;">`;
                Object.entries(counts).forEach(([option, count]) => {
                    const pct = (count / total * 100).toFixed(1);
                    analysisHTML += `
                        <div style="margin-bottom:8px;">
                            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                                <span>${option}</span>
                                <span><strong>${count}</strong> (${pct}%)</span>
                            </div>
                            <div style="background:#e2e8f0;height:8px;border-radius:4px;overflow:hidden;">
                                <div style="background:var(--primary);height:100%;width:${pct}%;border-radius:4px;transition:width 0.5s ease;"></div>
                            </div>
                        </div>
                    `;
                });
                analysisHTML += `</div>`;

                // Calculate mean for likert
                if (q.type === 'likert') {
                    const numericValues = values.map(v => q.options.indexOf(v) + 1).filter(n => n > 0);
                    if (numericValues.length > 0) {
                        const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
                        analysisHTML += `<p><strong>المتوسط:</strong> ${mean.toFixed(2)} / ${q.options.length}</p>`;
                    }
                }
            } else if (q.type === 'numeric') {
                const nums = values.map(v => parseFloat(v)).filter(n => !isNaN(n));
                if (nums.length > 0) {
                    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
                    const min = Math.min(...nums);
                    const max = Math.max(...nums);
                    analysisHTML += `<p><strong>المتوسط:</strong> ${mean.toFixed(2)} | <strong>الأدنى:</strong> ${min} | <strong>الأقصى:</strong> ${max}</p>`;
                }
            } else {
                analysisHTML += `<p><strong>عدد الردود:</strong> ${values.length}</p>`;
                analysisHTML += `<div style="max-height:150px;overflow-y:auto;background:white;padding:12px;border-radius:8px;">`;
                values.slice(0, 5).forEach(v => {
                    analysisHTML += `<div style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:0.9rem;">- ${v}</div>`;
                });
                if (values.length > 5) analysisHTML += `<div style="padding:8px;color:var(--gray);font-size:0.85rem;">... و ${values.length - 5} ردود أخرى</div>`;
                analysisHTML += `</div>`;
            }

            analysisHTML += `</div>`;
        });

        // Qualitative analysis
        if (interviewsText) {
            analysisHTML += `
                <div style="background:var(--light);padding:20px;border-radius:12px;margin-bottom:16px;">
                    <h5 style="margin-bottom:12px;color:var(--secondary);"><i class="fas fa-comments"></i> تحليل المقابلات النوعية</h5>
                    <div style="background:white;padding:16px;border-radius:8px;line-height:1.8;">
                        <p><strong>النص المدخل:</strong></p>
                        <div style="background:#f8fafc;padding:12px;border-radius:6px;font-size:0.9rem;margin-top:8px;">
                            ${interviewsText.substring(0, 500)}${interviewsText.length > 500 ? '...' : ''}
                        </div>
                        <p style="margin-top:16px;"><strong>الملاحظات الرئيسية:</strong></p>
                        <ul style="padding-right:20px;margin-top:8px;">
                            <li>تم تحليل ${interviewsText.split('
').filter(l => l.trim()).length} مقابلة/مدخل نوعي</li>
                            <li>يُنصح باستخدام التحليل الموضوعي للاستخراج الدقيق للأنماط</li>
                            <li>يمكن دمج هذه البيانات مع النتائج الكمية للحصول على رؤية شاملة</li>
                        </ul>
                    </div>
                </div>
            `;
        }

        analysisHTML += `
            <div style="display:flex;gap:12px;margin-top:24px;">
                <button class="btn btn-primary" onclick="exportSurveyReport()">
                    <i class="fas fa-file-pdf"></i> تصدير التقرير
                </button>
                <button class="btn btn-secondary" onclick="exportSurveyCSV()">
                    <i class="fas fa-file-csv"></i> تصدير CSV
                </button>
            </div>
            </div>
        `;

        document.getElementById('surveyResults').innerHTML = analysisHTML;
        Utils.hideLoading();
        Utils.toast('تم تحليل الاستبيان بنجاح!', 'success');
        saveActivity('survey');
    }, 1000);
}

function exportSurveyReport() {
    Utils.toast('سيتم تصدير التقرير قريباً', 'info');
}

function exportSurveyCSV() {
    const responsesText = document.getElementById('surveyResponses').value;
    if (responsesText) {
        const blob = new Blob(["﻿" + responsesText], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'survey_responses.csv';
        link.click();
        Utils.toast('تم تصدير الردود', 'success');
    }
}
