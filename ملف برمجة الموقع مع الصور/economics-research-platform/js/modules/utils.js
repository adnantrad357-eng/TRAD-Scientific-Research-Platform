// ============================================
// Utilities Module
// ============================================

const Utils = {
    // Toast notifications
    toast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
        toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(-20px)'; setTimeout(() => toast.remove(), 300); }, 4000);
    },

    // Loading overlay
    showLoading(text = 'جاري المعالجة...') {
        const overlay = document.getElementById('loadingOverlay');
        overlay.querySelector('p').textContent = text;
        overlay.classList.add('active');
    },

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('active');
    },

    // Parse numbers from text
    parseNumbers(text) {
        return text.split(/[
,،]+/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    },

    // Parse labels
    parseLabels(text) {
        return text.split(/[
,،]+/).map(s => s.trim()).filter(s => s);
    },

    // Format number
    formatNumber(num, decimals = 2) {
        if (isNaN(num)) return '-';
        return num.toLocaleString('ar-SA', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    },

    // Mean
    mean(arr) {
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    },

    // Median
    median(arr) {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    },

    // Standard deviation
    std(arr) {
        const m = this.mean(arr);
        return Math.sqrt(arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / arr.length);
    },

    // Variance
    variance(arr) {
        return Math.pow(this.std(arr), 2);
    },

    // Min/Max
    min(arr) { return Math.min(...arr); },
    max(arr) { return Math.max(...arr); },

    // Range
    range(arr) { return this.max(arr) - this.min(arr); },

    // Coefficient of variation
    cv(arr) { return (this.std(arr) / this.mean(arr)) * 100; },

    // Z-score
    zScore(value, mean, std) {
        return (value - mean) / std;
    },

    // Percent change
    percentChange(current, previous) {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    },

    // Moving average
    movingAverage(arr, period) {
        const result = [];
        for (let i = 0; i < arr.length; i++) {
            if (i < period - 1) { result.push(null); continue; }
            let sum = 0;
            for (let j = 0; j < period; j++) sum += arr[i - j];
            result.push(sum / period);
        }
        return result;
    },

    // Linear regression
    linearRegression(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        const rSquared = Math.pow(
            (n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX * sumX) * (n * y.reduce((sum, yi) => sum + yi * yi, 0) - sumY * sumY)),
            2
        );
        return { slope, intercept, rSquared };
    },

    // Pearson correlation
    correlation(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
        return (n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    },

    // T-test (independent samples)
    tTest(groupA, groupB) {
        const meanA = this.mean(groupA);
        const meanB = this.mean(groupB);
        const stdA = this.std(groupA);
        const stdB = this.std(groupB);
        const nA = groupA.length;
        const nB = groupB.length;
        const pooledStd = Math.sqrt(((nA - 1) * stdA * stdA + (nB - 1) * stdB * stdB) / (nA + nB - 2));
        const tStat = (meanA - meanB) / (pooledStd * Math.sqrt(1 / nA + 1 / nB));
        const df = nA + nB - 2;
        return { tStat, df, meanA, meanB, stdA, stdB };
    },

    // ANOVA
    anova(groups) {
        const all = groups.flat();
        const grandMean = this.mean(all);
        const n = all.length;
        const k = groups.length;
        let ssBetween = 0;
        groups.forEach(g => {
            const groupMean = this.mean(g);
            ssBetween += g.length * Math.pow(groupMean - grandMean, 2);
        });
        let ssWithin = 0;
        groups.forEach(g => {
            const groupMean = this.mean(g);
            g.forEach(val => { ssWithin += Math.pow(val - groupMean, 2); });
        });
        const dfBetween = k - 1;
        const dfWithin = n - k;
        const msBetween = ssBetween / dfBetween;
        const msWithin = ssWithin / dfWithin;
        const fStat = msBetween / msWithin;
        return { fStat, dfBetween, dfWithin, ssBetween, ssWithin, msBetween, msWithin };
    },

    // Chi-square
    chiSquare(observed) {
        const rows = observed.length;
        const cols = observed[0].length;
        const rowSums = observed.map(r => r.reduce((a, b) => a + b, 0));
        const colSums = [];
        for (let j = 0; j < cols; j++) {
            let sum = 0;
            for (let i = 0; i < rows; i++) sum += observed[i][j];
            colSums.push(sum);
        }
        const total = rowSums.reduce((a, b) => a + b, 0);
        let chi2 = 0;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const expected = (rowSums[i] * colSums[j]) / total;
                chi2 += Math.pow(observed[i][j] - expected, 2) / expected;
            }
        }
        const df = (rows - 1) * (cols - 1);
        return { chi2, df };
    },

    // Export to CSV
    exportCSV(data, filename) {
        const csv = data.map(row => row.join(',')).join('\n');
        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    },

    // Export to PDF
    async exportPDF(elementId, filename) {
        const element = document.getElementById(elementId);
        if (!element) return;
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(filename);
    },

    // Local Storage helpers
    storage: {
        set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
        get(key) { const val = localStorage.getItem(key); return val ? JSON.parse(val) : null; },
        remove(key) { localStorage.removeItem(key); }
    },

    // Generate ID
    generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); },

    // Scroll to element
    scrollTo(id) {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    // Debounce
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
};

// Global access
window.Utils = Utils;
