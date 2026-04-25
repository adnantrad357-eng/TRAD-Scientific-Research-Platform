// ============================================
// Data Analysis Module
// ============================================

let analysisCharts = {};

function analyzeData() {
    const valuesText = document.getElementById('dataValues').value;
    const labelsText = document.getElementById('dataLabels').value;
    const context = document.getElementById('dataContext').value || 'البيانات';

    const values = Utils.parseNumbers(valuesText);
    const labels = labelsText ? Utils.parseLabels(labelsText) : values.map((_, i) => (i + 1).toString());

    if (values.length < 2) {
        Utils.toast('يرجى إدخال على الأقل قيمتين', 'warning');
        return;
    }

    Utils.showLoading('جاري التحليل الإحصائي...');

    setTimeout(() => {
        // Calculate metrics
        const mean = Utils.mean(values);
        const median = Utils.median(values);
        const std = Utils.std(values);
        const variance = Utils.variance(values);
        const min = Utils.min(values);
        const max = Utils.max(values);
        const range = Utils.range(values);
        const cv = Utils.cv(values);

        // Update metrics display
        document.getElementById('metricMean').textContent = Utils.formatNumber(mean);
        document.getElementById('metricMedian').textContent = Utils.formatNumber(median);
        document.getElementById('metricStd').textContent = Utils.formatNumber(std);
        document.getElementById('metricVar').textContent = Utils.formatNumber(variance);
        document.getElementById('metricMax').textContent = Utils.formatNumber(max);
        document.getElementById('metricMin').textContent = Utils.formatNumber(min);
        document.getElementById('metricRange').textContent = Utils.formatNumber(range);
        document.getElementById('metricCV').textContent = Utils.formatNumber(cv) + '%';

        // Build analysis table
        const tbody = document.getElementById('analysisTableBody');
        tbody.innerHTML = '';
        values.forEach((val, i) => {
            const deviation = val - mean;
            const zScore = Utils.zScore(val, mean, std);
            const pctChange = i > 0 ? Utils.percentChange(val, values[i - 1]) : 0;
            const status = Math.abs(zScore) > 2 ? 'شاذ' : Math.abs(zScore) > 1 ? 'ملاحظ' : 'طبيعي';
            const statusClass = Math.abs(zScore) > 2 ? 'danger' : Math.abs(zScore) > 1 ? 'warning' : 'success';

            tbody.innerHTML += `<tr>
                <td>${i + 1}</td>
                <td>${labels[i] || i + 1}</td>
                <td><strong>${Utils.formatNumber(val)}</strong></td>
                <td>${deviation > 0 ? '+' : ''}${Utils.formatNumber(deviation)}</td>
                <td>${Utils.formatNumber(zScore)}</td>
                <td>${i > 0 ? (pctChange > 0 ? '+' : '') + Utils.formatNumber(pctChange) + '%' : '-'}</td>
                <td><span style="color:var(--${statusClass});font-weight:600;">${status}</span></td>
            </tr>`;
        });

        // AI Analysis
        const aiContent = document.getElementById('aiAnalysisContent');
        const trend = values[values.length - 1] > values[0] ? 'تصاعدي' : 'تنازلي';
        const volatility = cv > 30 ? 'مرتفع' : cv > 15 ? 'متوسط' : 'منخفض';
        aiContent.innerHTML = `
            <p><strong>📊 تحليل الاتجاه:</strong> يظهر البيانات اتجاهاً <strong>${trend}</strong> على مدى الفترة المدروسة. 
            ${trend === 'تصاعدي' ? 'هذا يشير إلى نمو أو زيادة في القيم المقاسة.' : 'هذا يشير إلى تراجع أو انخفاض في القيم المقاسة.'}</p>
            <p><strong>📈 التقلب:</strong> معامل الاختلاف (${Utils.formatNumber(cv)}%) يشير إلى تقلب <strong>${volatility}</strong> في البيانات.
            ${volatility === 'مرتفع' ? 'هذا يعني أن القيم تتغير بشكل كبير وقد تحتاج إلى مزيد من التحقق.' : 'هذا يعني استقراراً نسبياً في القيم.'}</p>
            <p><strong>🎯 النتائج الرئيسية:</strong> المتوسط (${Utils.formatNumber(mean)}) ${Math.abs(mean - median) > std * 0.5 ? 'يختلف بشكل ملحوظ عن الوسيط' : 'قريب من الوسيط'}، 
            مما يشير إلى ${Math.abs(mean - median) > std * 0.5 ? 'وجود قيم شاذة قد تؤثر على التوزيع.' : 'توزيع متوازن نسبياً للبيانات.'}</p>
            <p><strong>💡 التوصية:</strong> ${cv > 30 ? 'يُنصح بمراجعة مصادر البيانات والتحقق من القيم الشاذة.' : 'البيانات تبدو متسقة ويمكن الاعتماد عليها في التحليل.'}</p>
        `;

        // Create charts
        createTimeSeriesChart(labels, values, context);
        createHistogramChart(values, context);
        createBoxplotChart(values, context);
        createRegressionChart(values, context);

        // Show results
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('analysisResults').style.display = 'block';

        Utils.hideLoading();
        Utils.toast('تم التحليل بنجاح!', 'success');

        // Save activity
        saveActivity('data_analysis');
    }, 800);
}

function createTimeSeriesChart(labels, values, context) {
    const ctx = document.getElementById('timeSeriesChart').getContext('2d');
    if (analysisCharts.timeSeries) analysisCharts.timeSeries.destroy();

    const ma3 = Utils.movingAverage(values, 3);

    analysisCharts.timeSeries = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: context,
                    data: values,
                    borderColor: '#1a56db',
                    backgroundColor: 'rgba(26,86,219,0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#1a56db'
                },
                {
                    label: 'المتوسط المتحرك (3)',
                    data: ma3,
                    borderColor: '#f59e0b',
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: false } }
        }
    });
}

function createHistogramChart(values, context) {
    const ctx = document.getElementById('histogramChart').getContext('2d');
    if (analysisCharts.histogram) analysisCharts.histogram.destroy();

    const min = Utils.min(values);
    const max = Utils.max(values);
    const bins = 8;
    const binWidth = (max - min) / bins;
    const histogram = new Array(bins).fill(0);
    const binLabels = [];

    for (let i = 0; i < bins; i++) {
        const binStart = min + i * binWidth;
        const binEnd = binStart + binWidth;
        binLabels.push(`${Utils.formatNumber(binStart)} - ${Utils.formatNumber(binEnd)}`);
        values.forEach(v => { if (v >= binStart && v < binEnd) histogram[i]++; });
    }

    analysisCharts.histogram = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: binLabels,
            datasets: [{
                label: 'التكرار',
                data: histogram,
                backgroundColor: 'rgba(124,58,237,0.7)',
                borderColor: '#7c3aed',
                borderWidth: 1,
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

function createBoxplotChart(values, context) {
    const ctx = document.getElementById('boxplotChart').getContext('2d');
    if (analysisCharts.boxplot) analysisCharts.boxplot.destroy();

    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const median = Utils.median(values);
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    analysisCharts.boxplot = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [context],
            datasets: [
                { label: 'الحد الأدنى', data: [min], backgroundColor: '#3b82f6' },
                { label: 'Q1', data: [q1 - min], backgroundColor: '#60a5fa' },
                { label: 'الوسيط', data: [median - q1], backgroundColor: '#1a56db' },
                { label: 'Q3', data: [q3 - median], backgroundColor: '#60a5fa' },
                { label: 'الحد الأقصى', data: [max - q3], backgroundColor: '#3b82f6' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: { x: { stacked: true }, y: { stacked: true } }
        }
    });
}

function createRegressionChart(values, context) {
    const ctx = document.getElementById('regressionChart').getContext('2d');
    if (analysisCharts.regression) analysisCharts.regression.destroy();

    const x = values.map((_, i) => i);
    const regression = Utils.linearRegression(x, values);
    const trendLine = x.map(xi => regression.slope * xi + regression.intercept);

    // Predict next 3 values
    const futureX = [values.length, values.length + 1, values.length + 2];
    const predictions = futureX.map(xi => regression.slope * xi + regression.intercept);
    const allLabels = [...values.map((_, i) => i + 1), ...futureX.map(xi => `ت${xi + 1}`)];

    analysisCharts.regression = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allLabels,
            datasets: [
                {
                    label: 'القيم الفعلية',
                    data: [...values, null, null, null],
                    borderColor: '#1a56db',
                    backgroundColor: 'rgba(26,86,219,0.1)',
                    fill: false,
                    pointRadius: 5
                },
                {
                    label: 'خط الاتجاه',
                    data: [...trendLine, ...predictions],
                    borderColor: '#ef4444',
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0
                },
                {
                    label: 'التنبؤ',
                    data: [...new Array(values.length).fill(null), ...predictions],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16,185,129,0.1)',
                    fill: true,
                    pointRadius: 5,
                    pointStyle: 'triangle'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            if (context.datasetIndex === 1) {
                                return `R² = ${Utils.formatNumber(regression.rSquared)}`;
                            }
                        }
                    }
                }
            }
        }
    });
}

function clearData() {
    document.getElementById('dataValues').value = '';
    document.getElementById('dataLabels').value = '';
    document.getElementById('dataContext').value = '';
    document.getElementById('analysisResults').style.display = 'none';
    document.getElementById('emptyState').style.display = 'flex';
    Object.values(analysisCharts).forEach(chart => { if (chart) chart.destroy(); });
    analysisCharts = {};
}

function exportChart(format) {
    Object.values(analysisCharts).forEach((chart, idx) => {
        if (chart) {
            const link = document.createElement('a');
            link.download = `chart_${idx + 1}.${format}`;
            link.href = chart.toBase64Image();
            link.click();
        }
    });
    Utils.toast('تم تصدير الرسوم البيانية', 'success');
}

function exportTable(format) {
    const rows = [['#', 'التسمية', 'القيمة', 'الانحراف', 'Z-Score', 'التغيير %', 'الحالة']];
    document.querySelectorAll('#analysisTableBody tr').forEach(tr => {
        const cells = Array.from(tr.querySelectorAll('td')).map(td => td.textContent);
        rows.push(cells);
    });
    Utils.exportCSV(rows, 'analysis_data.csv');
    Utils.toast('تم تصدير الجدول', 'success');
}

function exportPDF() {
    Utils.exportPDF('analysisResults', 'analysis_report.pdf');
    Utils.toast('تم تصدير التقرير PDF', 'success');
}

function saveActivity(type) {
    const activities = Utils.storage.get('activities') || [];
    activities.push({ type, timestamp: new Date().toISOString(), userId: Auth.currentUser ? Auth.currentUser.id : null });
    Utils.storage.set('activities', activities);
}
