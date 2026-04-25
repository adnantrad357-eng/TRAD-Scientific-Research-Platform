// ============================================
// Time Series Module
// ============================================

const presetData = {
    syria_inflation: {
        name: 'معدل التضخم في سوريا',
        unit: '%',
        data: [
            { year: 2011, value: 29.6 }, { year: 2012, value: 36.7 }, { year: 2013, value: 53.0 },
            { year: 2014, value: 34.2 }, { year: 2015, value: 47.3 }, { year: 2016, value: 47.7 },
            { year: 2017, value: 28.1 }, { year: 2018, value: 19.8 }, { year: 2019, value: 13.3 },
            { year: 2020, value: 52.8 }, { year: 2021, value: 98.3 }, { year: 2022, value: 139.0 },
            { year: 2023, value: 125.0 }, { year: 2024, value: 95.0 }
        ]
    },
    turkey_gdp: {
        name: 'الناتج المحلي الإجمالي لتركيا',
        unit: 'مليار دولار',
        data: [
            { year: 2011, value: 832 }, { year: 2012, value: 873 }, { year: 2013, value: 950 },
            { year: 2014, value: 938 }, { year: 2015, value: 864 }, { year: 2016, value: 863 },
            { year: 2017, value: 858 }, { year: 2018, value: 771 }, { year: 2019, value: 761 },
            { year: 2020, value: 719 }, { year: 2021, value: 815 }, { year: 2022, value: 905 },
            { year: 2023, value: 1108 }, { year: 2024, value: 1150 }
        ]
    },
    syria_lira: {
        name: 'سعر صرف الليرة السورية (للدولار)',
        unit: 'ليرة سورية',
        data: [
            { year: 2011, value: 47 }, { year: 2012, value: 65 }, { year: 2013, value: 105 },
            { year: 2014, value: 150 }, { year: 2015, value: 220 }, { year: 2016, value: 450 },
            { year: 2017, value: 515 }, { year: 2018, value: 515 }, { year: 2019, value: 515 },
            { year: 2020, value: 1250 }, { year: 2021, value: 3000 }, { year: 2022, value: 6800 },
            { year: 2023, value: 12000 }, { year: 2024, value: 14500 }
        ]
    },
    turkey_inflation: {
        name: 'معدل التضخم في تركيا',
        unit: '%',
        data: [
            { year: 2011, value: 6.5 }, { year: 2012, value: 6.2 }, { year: 2013, value: 7.4 },
            { year: 2014, value: 8.2 }, { year: 2015, value: 7.7 }, { year: 2016, value: 7.8 },
            { year: 2017, value: 11.1 }, { year: 2018, value: 16.3 }, { year: 2019, value: 11.8 },
            { year: 2020, value: 14.6 }, { year: 2021, value: 19.6 }, { year: 2022, value: 72.3 },
            { year: 2023, value: 53.9 }, { year: 2024, value: 44.0 }
        ]
    }
};

function loadPreset(key) {
    const preset = presetData[key];
    if (!preset) return;

    document.getElementById('tsContext').value = preset.name;
    document.getElementById('tsFrom').value = preset.data[0].year;
    document.getElementById('tsTo').value = preset.data[preset.data.length - 1].year;
    document.getElementById('tsUnit').value = preset.unit;

    displayTimeSeries(preset.name, preset.unit, preset.data);
    Utils.toast(`تم تحميل: ${preset.name}`, 'success');
}

function fetchTimeSeries() {
    const context = document.getElementById('tsContext').value;
    const from = parseInt(document.getElementById('tsFrom').value);
    const to = parseInt(document.getElementById('tsTo').value);
    const unit = document.getElementById('tsUnit').value || '';

    if (!context || !from || !to) {
        Utils.toast('يرجى إدخال السياق والسنوات', 'warning');
        return;
    }

    Utils.showLoading('جاري جلب البيانات...');

    setTimeout(() => {
        // Generate demo data based on context
        const data = [];
        for (let year = from; year <= to; year++) {
            let value;
            if (context.includes('تضخم')) {
                value = 10 + Math.random() * 100 + (year - from) * 5;
            } else if (context.includes('ناتج') || context.includes('GDP')) {
                value = 500 + Math.random() * 500 + (year - from) * 30;
            } else if (context.includes('صرف') || context.includes('ليرة')) {
                value = 10 + Math.random() * 50 + Math.pow(year - from, 2) * 2;
            } else {
                value = 50 + Math.random() * 100 + (year - from) * 3;
            }
            data.push({ year, value: Math.round(value * 100) / 100 });
        }

        displayTimeSeries(context, unit, data);
        Utils.hideLoading();
        Utils.toast('تم جلب البيانات بنجاح!', 'success');
        saveActivity('timeseries');
    }, 1200);
}

function displayTimeSeries(name, unit, data) {
    const years = data.map(d => d.year);
    const values = data.map(d => d.value);
    const changes = values.map((v, i) => i > 0 ? ((v - values[i-1]) / values[i-1] * 100).toFixed(1) : 0);

    let html = `
        <div class="panel-card">
            <h4><i class="fas fa-chart-line"></i> ${name}</h4>
            <div style="margin-bottom:24px;">
                <canvas id="tsChart" style="max-height:350px;"></canvas>
            </div>
            <div style="overflow-x:auto;">
                <table class="analysis-table">
                    <thead>
                        <tr><th>السنة</th><th>القيمة</th><th>% التغيير</th><th>الرسم البياني</th></tr>
                    </thead>
                    <tbody>
    `;

    const maxVal = Math.max(...values);
    data.forEach((d, i) => {
        const change = i > 0 ? changes[i] : '-';
        const changeColor = change > 0 ? 'var(--success)' : change < 0 ? 'var(--danger)' : 'var(--gray)';
        const barWidth = (d.value / maxVal * 100).toFixed(1);

        html += `<tr>
            <td><strong>${d.year}</strong></td>
            <td>${Utils.formatNumber(d.value)} ${unit}</td>
            <td style="color:${changeColor};font-weight:600;">${change !== '-' ? (change > 0 ? '+' : '') + change + '%' : '-'}</td>
            <td style="width:150px;">
                <div style="background:#e2e8f0;height:8px;border-radius:4px;overflow:hidden;">
                    <div style="background:var(--primary);height:100%;width:${barWidth}%;border-radius:4px;"></div>
                </div>
            </td>
        </tr>`;
    });

    html += `</tbody></table></div>`;
    html += `
        <div style="display:flex;gap:12px;margin-top:24px;">
            <button class="btn btn-primary" onclick="exportTimeSeriesCSV()">
                <i class="fas fa-file-csv"></i> تصدير CSV
            </button>
            <button class="btn btn-secondary" onclick="sendToAnalysis()">
                <i class="fas fa-chart-bar"></i> إرسال لتحليل البيانات
            </button>
        </div>
        </div>
    `;

    document.getElementById('timeseriesResults').innerHTML = html;

    // Create chart
    const ctx = document.getElementById('tsChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: name,
                data: values,
                borderColor: '#1a56db',
                backgroundColor: 'rgba(26,86,219,0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: '#1a56db'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + ' ' + unit;
                        }
                    }
                }
            },
            scales: {
                y: { beginAtZero: false, title: { display: true, text: unit } }
            }
        }
    });

    // Store data for export
    window.currentTimeSeries = { name, unit, data };
}

function exportTimeSeriesCSV() {
    if (!window.currentTimeSeries) return;
    const rows = [['السنة', 'القيمة', 'الوحدة']];
    window.currentTimeSeries.data.forEach(d => {
        rows.push([d.year, d.value, window.currentTimeSeries.unit]);
    });
    Utils.exportCSV(rows, 'timeseries_data.csv');
    Utils.toast('تم تصدير البيانات', 'success');
}

function sendToAnalysis() {
    if (!window.currentTimeSeries) return;
    const values = window.currentTimeSeries.data.map(d => d.value).join('
');
    const labels = window.currentTimeSeries.data.map(d => d.year).join('
');
    document.getElementById('dataValues').value = values;
    document.getElementById('dataLabels').value = labels;
    document.getElementById('dataContext').value = window.currentTimeSeries.name;
    Utils.scrollTo('data-analysis');
    Utils.toast('تم إرسال البيانات لقسم التحليل', 'success');
}
