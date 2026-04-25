// ============================================
// Research Builder Module
// ============================================

let currentStep = 1;
const totalSteps = 6;

function changeStep(direction) {
    const form = document.getElementById('researchForm');
    const currentStepEl = form.querySelector(`.form-step[data-step="${currentStep}"]`);

    // Validate current step
    if (direction > 0 && !validateStep(currentStep)) return;

    currentStepEl.classList.remove('active');
    currentStep += direction;

    const nextStepEl = form.querySelector(`.form-step[data-step="${currentStep}"]`);
    nextStepEl.classList.add('active');

    updateProgress();
    updateButtons();
}

function validateStep(step) {
    const stepEl = document.querySelector(`.form-step[data-step="${step}"]`);
    const required = stepEl.querySelectorAll('[required]');
    for (let input of required) {
        if (!input.value.trim()) {
            input.focus();
            Utils.toast('يرجى ملء جميع الحقول المطلوبة', 'warning');
            return false;
        }
    }
    return true;
}

function updateProgress() {
    const percent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    const circle = document.getElementById('progressCircle');
    const text = document.getElementById('progressText');
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
    text.textContent = Math.round(percent) + '%';

    document.querySelectorAll('.progress-steps .step').forEach((step, idx) => {
        step.classList.toggle('active', idx + 1 <= currentStep);
        const icon = step.querySelector('i');
        if (idx + 1 < currentStep) {
            icon.className = 'fas fa-check';
        } else if (idx + 1 === currentStep) {
            icon.className = 'fas fa-circle';
        } else {
            icon.className = 'far fa-circle';
        }
    });
}

function updateButtons() {
    document.getElementById('prevBtn').disabled = currentStep === 1;
    document.getElementById('nextBtn').style.display = currentStep === totalSteps ? 'none' : 'flex';
    document.getElementById('submitBtn').style.display = currentStep === totalSteps ? 'flex' : 'none';
}

function addQuestion() {
    const list = document.getElementById('questionsList');
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `<input type="text" placeholder="سؤال فرعي..." class="question-input"><button type="button" class="btn-icon" onclick="removeItem(this)"><i class="fas fa-trash"></i></button>`;
    list.appendChild(item);
}

function addHypothesis() {
    const list = document.getElementById('hypothesesList');
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `<input type="text" placeholder="فرضية..." class="hypothesis-input"><select class="hypothesis-type"><option value="main">رئيسية</option><option value="sub">فرعية</option></select><button type="button" class="btn-icon" onclick="removeItem(this)"><i class="fas fa-trash"></i></button>`;
    list.appendChild(item);
}

function addObjective() {
    const list = document.getElementById('objectivesList');
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `<input type="text" placeholder="هدف..." class="objective-input"><button type="button" class="btn-icon" onclick="removeItem(this)"><i class="fas fa-trash"></i></button>`;
    list.appendChild(item);
}

function removeItem(btn) {
    btn.closest('.list-item').remove();
}

// Handle form submission
document.getElementById('researchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    Utils.showLoading('جاري إنشاء البحث...');

    const researchData = {
        id: Utils.generateId(),
        title: document.getElementById('researchTitle').value,
        description: document.getElementById('researchDesc').value,
        field: document.getElementById('researchField').value,
        questions: Array.from(document.querySelectorAll('.question-input')).map(i => i.value).filter(v => v),
        hypotheses: Array.from(document.querySelectorAll('.hypothesis-input')).map((i, idx) => ({
            text: i.value,
            type: document.querySelectorAll('.hypothesis-type')[idx]?.value || 'main'
        })).filter(h => h.text),
        objectives: Array.from(document.querySelectorAll('.objective-input')).map(i => i.value).filter(v => v),
        methodology: document.getElementById('methodology').value,
        writingStyle: document.getElementById('writingStyle').value,
        depth: document.getElementById('depth').value,
        language: document.getElementById('language').value,
        referencesCount: document.getElementById('referencesCount').value,
        citationStyle: document.getElementById('citationStyle').value,
        includeAbstract: document.getElementById('includeAbstract').checked,
        includeEquations: document.getElementById('includeEquations').checked,
        includeTables: document.getElementById('includeTables').checked,
        includeCaseStudies: document.getElementById('includeCaseStudies').checked,
        includeHypothesisTest: document.getElementById('includeHypothesisTest').checked,
        includeLiterature: document.getElementById('includeLiterature').checked,
        includeResults: document.getElementById('includeResults').checked,
        includeConclusions: document.getElementById('includeConclusions').checked,
        includeLimitations: document.getElementById('includeLimitations').checked,
        includeFuture: document.getElementById('includeFuture').checked,
        includeGlossary: document.getElementById('includeGlossary').checked,
        includeAppendix: document.getElementById('includeAppendix').checked,
        yearFrom: document.getElementById('yearFrom').value,
        yearTo: document.getElementById('yearTo').value,
        geographicScope: document.getElementById('geographicScope').value,
        userId: Auth.currentUser ? Auth.currentUser.id : null,
        userName: Auth.currentUser ? Auth.currentUser.name : 'زائر',
        createdAt: new Date().toISOString(),
        status: 'completed'
    };

    // Save to local storage
    const researches = Utils.storage.get('researches') || [];
    researches.push(researchData);
    Utils.storage.set('researches', researches);

    setTimeout(() => {
        Utils.hideLoading();
        Utils.toast('تم إنشاء البحث بنجاح!', 'success');
        generateResearchOutput(researchData);

        // Reset form
        currentStep = 1;
        document.querySelectorAll('.form-step').forEach((el, idx) => {
            el.classList.toggle('active', idx === 0);
        });
        updateProgress();
        updateButtons();
        this.reset();
    }, 1500);
});

function generateResearchOutput(data) {
    const output = document.createElement('div');
    output.className = 'research-output-modal';
    output.innerHTML = `
        <div class="modal active" style="display:flex;z-index:5000;">
            <div class="modal-overlay" onclick="this.closest('.research-output-modal').remove()"></div>
            <div class="modal-content" style="max-width:800px;max-height:90vh;overflow-y:auto;">
                <button class="modal-close" onclick="this.closest('.research-output-modal').remove()"><i class="fas fa-times"></i></button>
                <div style="padding:20px 0;">
                    <h2 style="color:var(--primary);margin-bottom:20px;"><i class="fas fa-file-alt"></i> ${data.title}</h2>
                    <div style="background:var(--light);padding:20px;border-radius:12px;margin-bottom:20px;">
                        <p><strong>المجال:</strong> ${data.field}</p>
                        <p><strong>المنهجية:</strong> ${data.methodology}</p>
                        <p><strong>اللغة:</strong> ${data.language}</p>
                        <p><strong>عدد المراجع:</strong> ${data.referencesCount}</p>
                        <p><strong>نمط التوثيق:</strong> ${data.citationStyle}</p>
                    </div>
                    <h3>أسئلة البحث:</h3>
                    <ul style="margin-bottom:20px;padding-right:20px;">
                        ${data.questions.map(q => `<li>${q}</li>`).join('')}
                    </ul>
                    <h3>الفرضيات:</h3>
                    <ul style="margin-bottom:20px;padding-right:20px;">
                        ${data.hypotheses.map(h => `<li><strong>${h.type === 'main' ? 'رئيسية' : 'فرعية'}:</strong> ${h.text}</li>`).join('')}
                    </ul>
                    <h3>الأهداف:</h3>
                    <ul style="margin-bottom:20px;padding-right:20px;">
                        ${data.objectives.map(o => `<li>${o}</li>`).join('')}
                    </ul>
                    <div style="display:flex;gap:12px;margin-top:24px;">
                        <button class="btn btn-primary" onclick="Utils.toast('سيتم توجيهك لصفحة البحث الكامل قريباً','info')">
                            <i class="fas fa-eye"></i> عرض البحث الكامل
                        </button>
                        <button class="btn btn-secondary" onclick="this.closest('.research-output-modal').remove()">
                            <i class="fas fa-times"></i> إغلاق
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(output);
}
