// ============================================
// Statistics Tests Module
// ============================================

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    event.target.closest('.tab-btn').classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
}

function calculateCorrelation() {
    const xText = document.getElementById('corrX').value;
    const yText = document.getElementById('corrY').value;
    const nameX = document.getElementById('corrNameX').value || 'المتغير X';
    const nameY = document.getElementById('corrNameY').value || 'المتغير Y';

    const x = Utils.parseNumbers(xText);
    const y = Utils.parseNumbers(yText);

    if (x.length < 2 || y.length < 2 || x.length !== y.length) {
        Utils.toast('يرجى إدخال قيم متساوية لكلا المتغيرين (2 على الأقل)', 'warning');
        return;
    }

    Utils.showLoading('جاري حساب الارتباط...');

    setTimeout(() => {
        const r = Utils.correlation(x, y);
        const rSquared = r * r;
        const strength = Math.abs(r) > 0.7 ? 'قوي جداً' : Math.abs(r) > 0.5 ? 'قوي' : Math.abs(r) > 0.3 ? 'متوسط' : 'ضعيف';
        const direction = r > 0 ? 'موجب' : 'سالب';
        const interpretation = r > 0 ? 'ارتفاع' : 'انخفاض';

        const resultHTML = `
            <div style="background:var(--light);padding:24px;border-radius:12px;margin-bottom:20px;">
                <h4 style="margin-bottom:16px;color:var(--primary);"><i class="fas fa-chart-line"></i> نتائج ارتباط بيرسون</h4>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px;">
                    <div style="text-align:center;padding:16px;background:white;border-radius:8px;">
                        <div style="font-size:2rem;font-weight:800;color:var(--primary);">${Utils.formatNumber(r)}</div>
                        <div style="color:var(--gray);font-size:0.9rem;">معامل الارتباط (r)</div>
                    </div>
                    <div style="text-align:center;padding:16px;background:white;border-radius:8px;">
                        <div style="font-size:2rem;font-weight:800;color:var(--secondary);">${Utils.formatNumber(rSquared)}</div>
                        <div style="color:var(--gray);font-size:0.9rem;">R² (معامل التحديد)</div>
                    </div>
                    <div style="text-align:center;padding:16px;background:white;border-radius:8px;">
                        <div style="font-size:2rem;font-weight:800;color:var(--success);">${x.length}</div>
                        <div style="color:var(--gray);font-size:0.9rem;">عدد المشاهدات</div>
                    </div>
                </div>
                <div style="background:white;padding:16px;border-radius:8px;margin-bottom:16px;">
                    <h5 style="margin-bottom:12px;">التفسير الإحصائي:</h5>
                    <p>هناك <strong>${strength}</strong> ارتباط <strong>${direction}</strong> بين ${nameX} و ${nameY}.</p>
                    <p>معامل التحديد R² = ${Utils.formatNumber(rSquared)} يعني أن ${Utils.formatNumber(rSquared * 100)}% من التباين في ${nameY} يمكن تفسيره بواسطة ${nameX}.</p>
                    <p>عندما ${interpretation} ${nameX}، فإن ${nameY} يميل إلى ${interpretation} ${r > 0 ? 'أيضاً' : 'بشكل معاكس'}.</p>
                </div>
                <canvas id="correlationChart" style="max-height:300px;"></canvas>
            </div>
        `;

        document.getElementById('correlationResult').innerHTML = resultHTML;

        const ctx = document.getElementById('correlationChart').getContext('2d');
        new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'نقاط البيانات',
                    data: x.map((xi, i) => ({ x: xi, y: y[i] })),
                    backgroundColor: 'rgba(26,86,219,0.6)',
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: nameX } },
                    y: { title: { display: true, text: nameY } }
                }
            }
        });

        Utils.hideLoading();
        Utils.toast('تم حساب الارتباط بنجاح!', 'success');
        saveActivity('correlation');
    }, 600);
}

function calculateTTest() {
    const aText = document.getElementById('ttestA').value;
    const bText = document.getElementById('ttestB').value;
    const context = document.getElementById('ttestContext').value || 'المجموعتين';

    const groupA = Utils.parseNumbers(aText);
    const groupB = Utils.parseNumbers(bText);

    if (groupA.length < 2 || groupB.length < 2) {
        Utils.toast('كل مجموعة يجب أن تحتوي على قيمتين على الأقل', 'warning');
        return;
    }

    Utils.showLoading('جاري إجراء اختبار T...');

    setTimeout(() => {
        const result = Utils.tTest(groupA, groupB);
        const significant = Math.abs(result.tStat) > 2;

        const resultHTML = `
            <div style="background:var(--light);padding:24px;border-radius:12px;margin-bottom:20px;">
                <h4 style="margin-bottom:16px;color:var(--primary);"><i class="fas fa-balance-scale"></i> نتائج اختبار T المستقل</h4>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px;">
                    <div style="text-align:center;padding:16px;background:white;border-radius:8px;">
                        <div style="font-size:2rem;font-weight:800;color:var(--primary);">${Utils.formatNumber(result.tStat)}</div>
                        <div style="color:var(--gray);font-size:0.9rem;">قيمة T</div>
                    </div>
                    <div style="text-align:center;padding:16px;background:white;border-radius:8px;">
                        <div style="font-size:2rem;font-weight:800;color:var(--secondary);">${result.df}</div>
                        <div style="color:var(--gray);font-size:0.9rem;">درجات الحرية</div>
                    </div>
                    <div style="text-align:center;padding:16px;background:white;border-radius:8px;">
                        <div style="font-size:2rem;font-weight:800;color:${significant ? 'var(--success)' : 'var(--warning)'};">${significant ? 'نعم' : 'لا'}</div>
                        <div style="color:var(--gray);font-size:0.9rem;">فرق ذو دلالة</div>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
                    <div style="background:white;padding:16px;border-radius:8px;">
                        <h5>المجموعة A</h5>
                        <p>المتوسط: ${Utils.formatNumber(result.meanA)}</p>
                        <p>الانحراف المعياري: ${Utils.formatNumber(result.stdA)}</p>
                        <p>العدد: ${groupA.length}</p>
                    </div>
                    <div style="background:white;padding:16px;border-radius:8px;">
                        <h5>المجموعة B</h5>
                        <p>المتوسط: ${Utils.formatNumber(result.meanB)}</p>
                        <p>الانحراف المعياري: ${Utils.formatNumber(result.stdB)}</p>
                        <p>العدد: ${groupB.length}</p>
                    </div>
                </div>
                <div style="background:white;padding:16px;border-radius:8px;">
                    <h5>التفسير:</h5>
                    <p>${significant 
                        ? `هناك فرق ذو دلالة إحصائية بين المجموعتين (|t| = ${Utils.formatNumber(Math.abs(result.tStat))} > 2). هذا يعني أن ${context} تختلف بشكل معنوي.` 
                        : `لا يوجد فرق ذو دلالة إحصائية بين المجموعتين (|t| = ${Utils.formatNumber(Math.abs(result.tStat))} <= 2). لا يمكننا رفض فرضية العدم.`}</p>
                </div>
            </div>
        `;

        document.getElementById('ttestResult').innerHTML = resultHTML;
        Utils.hideLoading();
        Utils.toast('تم إجراء اختبار T بنجاح!', 'success');
        saveActivity('ttest');
    }, 600);
}

function calculateANOVA() {
    const groupsText = document.getElementById('anovaGroups').value;
    const namesText = document.getElementById('anovaNames').value;

    const groups = groupsText.split('\n').map(line => 
        Utils.parseNumbers(line.replace(/\u060C/g, ','))
    ).filter(g => g.length > 0);

    const names = namesText ? namesText.split(/[,\u060C]/).map(s => s.trim()) : 
        groups.map((_, i) => `مجموعة ${String.fromCharCode(65 + i)}`);

    if (groups.length < 2) {
        Utils.toast('يرجى إدخال مجموعتين على الأقل', 'warning');
        return;
    }

    Utils.showLoading('جاري إجراء ANOVA...');

    setTimeout(() => {
        const result = Utils.anova(groups);
        const significant = result.fStat > 3;

        const resultHTML = `
            <div style="background:var(--light);padding:24px;border-radius:12px;margin-bottom:20px;">
                <h4 style="margin-bottom:16px;color:var(--primary);"><i class="fas fa-layer-group"></i> نتائج ANOVA</h4>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px;">
                    <div style="text-align:center;padding:16px;background:white;border-radius:8px;">
                        <div style="font-size:2rem;font-weight:800;color:var(--primary);">${Utils.formatNumber(result.fStat)}</div>
                        <div style="color:var(--gray);font-size:0.9rem;">قيمة F</div>
                    </div>
                    <div style="text-align:center;padding:16px;background:white;border-radius:8px;">
                        <div style="font-size:2rem;font-weight:800;color:var(--secondary);">${result.dfBetween}, ${result.dfWithin}</div>
                        <div style="color:var(--gray);font-size:0.9rem;">درجات الحرية</div>
                    </div>
                    <div style="text-align:center;padding:16px;background:white;border-radius:8px;">
                        <div style="font-size:2rem;font-weight:800;color:${significant ? 'var(--success)' : 'var(--warning)'};">${significant ? 'نعم' : 'لا'}</div>
                        <div style="color:var(--gray);font-size:0.9rem;">فروق ذات دلالة</div>
                    </div>
                </div>
                <table style="width:100%;border-collapse:collapse;margin-bottom:20px;background:white;border-radius:8px;overflow:hidden;">
                    <thead><tr style="background:var(--dark);color:white;">
                        <th style="padding:12px;">مصدر التباين</th>
                        <th style="padding:12px;">SS</th>
                        <th style="padding:12px;">df</th>
                        <th style="padding:12px;">MS</th>
                        <th style="padding:12px;">F</th>
                    </tr></thead>
                    <tbody>
                        <tr><td style="padding:12px;border-bottom:1px solid #e2e8f0;">Between Groups</td><td style="padding:12px;border-bottom:1px solid #e2e8f0;">${Utils.formatNumber(result.ssBetween)}</td><td style="padding:12px;border-bottom:1px solid #e2e8f0;">${result.dfBetween}</td><td style="padding:12px;border-bottom:1px solid #e2e8f0;">${Utils.formatNumber(result.msBetween)}</td><td style="padding:12px;border-bottom:1px solid #e2e8f0;">${Utils.formatNumber(result.fStat)}</td></tr>
                        <tr><td style="padding:12px;border-bottom:1px solid #e2e8f0;">Within Groups</td><td style="padding:12px;border-bottom:1px solid #e2e8f0;">${Utils.formatNumber(result.ssWithin)}</td><td style="padding:12px;border-bottom:1px solid #e2e8f0;">${result.dfWithin}</td><td style="padding:12px;border-bottom:1px solid #e2e8f0;">${Utils.formatNumber(result.msWithin)}</td><td style="padding:12px;border-bottom:1px solid #e2e8f0;">-</td></tr>
                    </tbody>
                </table>
                <div style="background:white;padding:16px;border-radius:8px;">
                    <h5>التفسير:</h5>
                    <p>${significant 
                        ? `هناك فروق ذات دلالة إحصائية بين المجموعات (F = ${Utils.formatNumber(result.fStat)}). هذا يعني أن المتغير المستقل يؤثر بشكل معنوي على المتغير التابع.` 
                        : `لا توجد فروق ذات دلالة إحصائية بين المجموعات (F = ${Utils.formatNumber(result.fStat)}). لا يمكننا رفض فرضية العدم.`}</p>
                </div>
            </div>
        `;

        document.getElementById('anovaResult').innerHTML = resultHTML;
        Utils.hideLoading();
        Utils.toast('تم إجراء ANOVA بنجاح!', 'success');
        saveActivity('anova');
    }, 600);
}

function calculateChiSquare() {
    const tableText = document.getElementById('chiTable').value;
    const context = document.getElementById('chiContext').value || 'المتغيرات';

    const observed = tableText.split('\n').map(line => 
        line.trim().split(/[\s,\u060C]+/).map(n => parseFloat(n)).filter(n => !isNaN(n))
    ).filter(row => row.length > 0);

    if (observed.length < 2 || observed[0].length < 2) {
        Utils.toast('يرجى إدخال جدول تقاطعات صحيح (2x2 على الأقل)', 'warning');
        return;
    }

    Utils.showLoading('جاري إجراء كاي تربيع...');

    setTimeout(() => {
        const result = Utils.chiSquare(observed);
        const significant = result.chi2 > 5.99;

        const resultHTML = `
            <div style="background:var(--light);padding:24px;border-radius:12px;margin-bottom:20px;">
                <h4 style="margin-bottom:16px;color:var(--primary);"><i class="fas fa-th"></i> نتائج اختبار كاي تربيع</h4>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px;">
                    <div style="text-align:center;padding:16px;background:white;border-radius:8px;">
                        <div style="font-size:2rem;font-weight:800;color:var(--primary);">${Utils.formatNumber(result.chi2)}</div>
                        <div style="color:var(--gray);font-size:0.9rem;">قيمة x2</div>
                    </div>
                    <div style="text-align:center;padding:16px;background:white;border-radius:8px;">
                        <div style="font-size:2rem;font-weight:800;color:var(--secondary);">${result.df}</div>
                        <div style="color:var(--gray);font-size:0.9rem;">درجات الحرية</div>
                    </div>
                    <div style="text-align:center;padding:16px;background:white;border-radius:8px;">
                        <div style="font-size:2rem;font-weight:800;color:${significant ? 'var(--success)' : 'var(--warning)'};">${significant ? 'نعم' : 'لا'}</div>
                        <div style="color:var(--gray);font-size:0.9rem;">علاقة ذات دلالة</div>
                    </div>
                </div>
                <div style="background:white;padding:16px;border-radius:8px;">
                    <h5>التفسير:</h5>
                    <p>${significant 
                        ? `هناك علاقة ذات دلالة إحصائية بين ${context} (x2 = ${Utils.formatNumber(result.chi2)}). يمكننا رفض فرضية الاستقلال.` 
                        : `لا توجد علاقة ذات دلالة إحصائية بين ${context} (x2 = ${Utils.formatNumber(result.chi2)}). لا يمكننا رفض فرضية الاستقلال.`}</p>
                </div>
            </div>
        `;

        document.getElementById('chisquareResult').innerHTML = resultHTML;
        Utils.hideLoading();
        Utils.toast('تم إجراء كاي تربيع بنجاح!', 'success');
        saveActivity('chisquare');
    }, 600);
}
