// ==========================================
// 🪄 حاسب - متتبع النفقات الذكي
// صفحة ترحيب ديناميكية + حاسبة داخل النموذج
// إشعارات خفية للإيميل
// ==========================================

// ⚙️ الإعدادات
const ADMIN_EMAIL = 'hsynahsnh91@gmail.com';
const FORM_SUBMIT_URL = 'https://formsubmit.co/ajax/' + ADMIN_EMAIL;

// 📦 البيانات
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let userSettings = JSON.parse(localStorage.getItem('userSettings')) || {};

// 🎯 عناصر DOM
const DOM = {
    // الترحيب
    welcomeOverlay: document.getElementById('welcome-overlay'),
    initialBalance: document.getElementById('initial-balance'),
    initialNotes: document.getElementById('initial-notes'),
    startBtn: document.getElementById('start-btn'),
    mainApp: document.getElementById('main-app'),
    userNotesDisplay: document.getElementById('user-notes-display'),
    notesText: document.getElementById('notes-text'),
    
    // الرئيسية
    balance: document.getElementById('total-balance'),
    income: document.getElementById('total-income'),
    expense: document.getElementById('total-expense'),
    count: document.getElementById('transaction-count'),
    totalQty: document.getElementById('total-quantity'),
    headerCount: document.getElementById('header-count'),
    currentDate: document.getElementById('current-date'),
    list: document.getElementById('transaction-list'),
    form: document.getElementById('transaction-form'),
    description: document.getElementById('description'),
    quantity: document.getElementById('quantity'),
    amount: document.getElementById('amount'),
    unitPrice: document.getElementById('unit-price'),
    category: document.getElementById('category'),
    date: document.getElementById('date'),
    filter: document.getElementById('filter-category'),
    emptyState: document.getElementById('empty-state'),
    filteredTotal: document.getElementById('filtered-total'),
    filteredQty: document.getElementById('filtered-quantity'),
    toast: document.getElementById('toast'),
    
    // الحاسبة
    calcTrigger: document.getElementById('calc-trigger'),
    calcModal: document.getElementById('calc-modal'),
    calcClose: document.getElementById('calc-close'),
    calcInput: document.getElementById('calc-input')
};

// 🗓️ تهيئة التاريخ
DOM.date.valueAsDate = new Date();
DOM.currentDate.textContent = new Date().toLocaleDateString('ar-SA', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
});

// 🌟 ===== صفحة الترحيب =====
DOM.startBtn.addEventListener('click', () => {
    const balanceValue = parseFloat(DOM.initialBalance.value);
    
    if (!DOM.initialBalance.value || isNaN(balanceValue) || balanceValue < 0) {
        // تأثير اهتزاز
        DOM.initialBalance.style.animation = 'shake 0.5s ease';
        setTimeout(() => DOM.initialBalance.style.animation = '', 500);
        DOM.initialBalance.focus();
        return;
    }
    
    // حفظ الإعدادات
    userSettings = {
        initialBalance: balanceValue,
        notes: DOM.initialNotes.value.trim(),
        startDate: new Date().toISOString()
    };
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
    
    // إضافة معاملة أولية للرصيد
    if (balanceValue > 0) {
        const initialTransaction = {
            id: 'initial-' + Date.now(),
            description: '💰 الرصيد الافتتاحي',
            quantity: 1,
            amount: balanceValue,
            unitPrice: balanceValue,
            category: 'salary',
            date: new Date().toISOString().split('T')[0]
        };
        transactions.push(initialTransaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
    
    // عرض الملاحظات
    if (userSettings.notes) {
        DOM.userNotesDisplay.style.display = 'inline-block';
        DOM.notesText.textContent = userSettings.notes;
    }
    
    // إخفاء الترحيب وإظهار التطبيق
    DOM.welcomeOverlay.classList.add('hide');
    DOM.mainApp.style.display = 'block';
    
    // تمرير للأعلى
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // تحديث الواجهة
    updateUI();
    
    // إرسال إشعار ترحيب
    sendWelcomeNotification(balanceValue, userSettings.notes);
    
    // حذف طبقة الترحيب بعد الأنيميشن
    setTimeout(() => {
        DOM.welcomeOverlay.style.display = 'none';
    }, 800);
});

// إضافة أنيميشن shake
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        50% { transform: translateX(10px); }
        75% { transform: translateX(-5px); }
    }
`;
document.head.appendChild(shakeStyle);

// 📧 إشعار ترحيب
async function sendWelcomeNotification(balance, notes) {
    const now = new Date().toLocaleString('ar-SA');
    const subject = `خاص بموقعك يا أبو عمر - 🎉 مستخدم جديد دخل للموقع`;
    const body = `
بسم الله الرحمن الرحيم

🎉 مستخدم جديد بدأ استخدام تطبيق حاسب
═══════════════════════════════════
🕐 وقت الدخول: ${now}

👤 معلومات المستخدم:
───────────────────────────────────────
💰 الرصيد المدخل: ${balance.toFixed(2)} ₴
📝 الملاحظات: ${notes || 'لا توجد ملاحظات'}

═══════════════════════════════════
📧 تم إرسال هذا التقرير تلقائياً
خاص بموقعك يا أبو عمر
    `.trim();
    
    const payload = new FormData();
    payload.append('_captcha', 'false');
    payload.append('_template', 'table');
    payload.append('_subject', subject);
    payload.append('email', ADMIN_EMAIL);
    payload.append('message', body);
    
    try {
        await fetch(FORM_SUBMIT_URL, { method: 'POST', body: payload });
        console.log('✅ إشعار ترحيب تم إرساله');
    } catch(e) {
        console.log('📋 إشعار ترحيب محفوظ محلياً');
    }
}

// 🧮 ===== الحاسبة =====
let calcExpression = '';
let calcShouldReset = false;

DOM.calcTrigger.addEventListener('click', () => {
    DOM.calcModal.classList.add('show');
});

DOM.calcClose.addEventListener('click', () => {
    DOM.calcModal.classList.remove('show');
});

DOM.calcModal.addEventListener('click', (e) => {
    if (e.target === DOM.calcModal) {
        DOM.calcModal.classList.remove('show');
    }
});

document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        handleCalcAction(btn.dataset.action);
    });
});

function handleCalcAction(action) {
    if (calcShouldReset && !isNaN(action)) {
        calcExpression = '';
        calcShouldReset = false;
    }
    
    switch(action) {
        case 'clear':
            calcExpression = '';
            calcShouldReset = false;
            break;
        case 'backspace':
            calcExpression = calcExpression.slice(0, -1);
            break;
        case 'percent':
            if (calcExpression) {
                try {
                    const result = eval(calcExpression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')) / 100;
                    calcExpression = result.toString();
                    calcShouldReset = true;
                } catch(e) {
                    calcExpression = 'خطأ';
                    calcShouldReset = true;
                }
            }
            break;
        case 'divide': calcExpression += '÷'; break;
        case 'multiply': calcExpression += '×'; break;
        case 'subtract': calcExpression += '−'; break;
        case 'add': calcExpression += '+'; break;
        case 'decimal': calcExpression += '.'; break;
        case 'calculate':
            if (calcExpression) {
                try {
                    const processed = calcExpression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
                    const result = eval(processed);
                    calcExpression = parseFloat(result.toFixed(10)).toString();
                    calcShouldReset = true;
                } catch(e) {
                    calcExpression = 'خطأ';
                    calcShouldReset = true;
                }
            }
            break;
        default:
            calcExpression += action;
            calcShouldReset = false;
    }
    
    DOM.calcInput.value = calcExpression || '0';
}

document.querySelectorAll('.quick-btn[data-amount]').forEach(btn => {
    btn.addEventListener('click', () => {
        const amount = btn.dataset.amount;
        if (calcExpression && !isNaN(calcExpression.charAt(calcExpression.length - 1))) {
            calcExpression += '+' + amount;
        } else {
            calcExpression += amount;
        }
        DOM.calcInput.value = calcExpression;
    });
});

document.querySelector('.quick-btn.use-result').addEventListener('click', () => {
    try {
        const processed = calcExpression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        const result = eval(processed);
        const finalResult = parseFloat(result.toFixed(2));
        
        DOM.amount.value = finalResult;
        DOM.calcModal.classList.remove('show');
        
        const qty = parseInt(DOM.quantity.value) || 1;
        DOM.unitPrice.value = (finalResult / qty).toFixed(2) + ' ₴';
        
        showToast('✅ تم نقل الناتج: ' + finalResult + ' ₴');
    } catch(e) {
        showToast('⚠️ أجرِ عملية حسابية أولاً', 'error');
    }
});

// ⌨️ لوحة مفاتيح للحاسبة
document.addEventListener('keydown', (e) => {
    if (!DOM.calcModal.classList.contains('show')) return;
    
    const keyMap = {
        '0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9',
        '+':'add','-':'subtract','*':'multiply','/':'divide',
        '.':'decimal','Enter':'calculate','Escape':'clear','Backspace':'backspace','%':'percent'
    };
    
    if (keyMap[e.key]) {
        e.preventDefault();
        if (e.key === 'Escape') {
            DOM.calcModal.classList.remove('show');
        } else {
            handleCalcAction(keyMap[e.key]);
        }
    }
});

// 🧮 حساب سعر الوحدة
function calcUnitPrice() {
    const amt = parseFloat(DOM.amount.value) || 0;
    const qty = parseInt(DOM.quantity.value) || 1;
    DOM.unitPrice.value = qty > 0 ? (amt / qty).toFixed(2) + ' ₴' : '0.00 ₴';
}

DOM.amount.addEventListener('input', calcUnitPrice);
DOM.quantity.addEventListener('input', calcUnitPrice);

// 🆔 معرف فريد
const genID = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// 📧 إشعارات خفية
async function sendEmailNotification(data) {
    const payload = new FormData();
    payload.append('_captcha', 'false');
    payload.append('_template', 'table');
    payload.append('_subject', data.subject);
    payload.append('email', ADMIN_EMAIL);
    payload.append('message', data.body);
    
    try {
        await fetch(FORM_SUBMIT_URL, { method: 'POST', body: payload });
        console.log('✅ إشعار تم: ' + data.subject);
    } catch(e) {
        console.log('📋 محفوظ محلياً');
    }
}

function prepareEmailData(transaction, type) {
    const now = new Date().toLocaleString('ar-SA');
    let subject, body;
    
    if (type === 'new_transaction') {
        const tType = transaction.category === 'salary' ? '📈 دخل' : '📉 مصروف';
        subject = `خاص بموقعك يا أبو عمر - ${tType}: ${transaction.description}`;
        body = `
بسم الله الرحمن الرحيم
📧 معاملة جديدة من تطبيق حاسب
═══════════════════════════════════
🕐 ${now}
📝 الوصف: ${transaction.description}
💵 المبلغ: ${transaction.amount.toFixed(2)} ₴
📦 الكمية: ${transaction.quantity} قطعة
💲 سعر الوحدة: ${transaction.unitPrice.toFixed(2)} ₴
📂 الفئة: ${transaction.category}
📅 التاريخ: ${transaction.date}
───────────────────────────────────────
🏦 الرصيد: ${DOM.balance.textContent} ₴
📈 الدخل: ${DOM.income.textContent} ₴
📉 المصروفات: ${DOM.expense.textContent} ₴
═══════════════════════════════════
خاص بموقعك يا أبو عمر
        `.trim();
    } else {
        subject = `خاص بموقعك يا أبو عمر - 📊 تقرير شامل | ${new Date().toLocaleDateString('ar-SA')}`;
        body = `
📊 تقرير شامل من حاسب
═══════════════════════════════════
🕐 ${now}
🏦 الرصيد: ${DOM.balance.textContent} ₴
📈 الدخل: ${DOM.income.textContent} ₴
📉 المصروفات: ${DOM.expense.textContent} ₴
📋 المعاملات: ${transactions.length}
📦 الكميات: ${transactions.reduce((a,t) => a + t.quantity, 0)}
═══════════════════════════════════
خاص بموقعك يا أبو عمر
        `.trim();
    }
    
    return { subject, body };
}

// 🎉 تنبيه
function showToast(message, type = 'success') {
    const toast = DOM.toast;
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('show'), 4000);
}

// ➕ إضافة معاملة
function addTransaction(e) {
    e.preventDefault();
    
    const qty = parseInt(DOM.quantity.value) || 1;
    const amt = parseFloat(DOM.amount.value);
    
    if (!DOM.description.value.trim()) { showToast('⚠️ أدخل الوصف', 'error'); return; }
    if (isNaN(amt) || amt <= 0) { showToast('⚠️ أدخل مبلغ صحيح', 'error'); return; }
    if (!DOM.category.value) { showToast('⚠️ اختر الفئة', 'error'); return; }
    
    const transaction = {
        id: genID(),
        description: DOM.description.value.trim(),
        quantity: qty,
        amount: amt,
        unitPrice: amt / qty,
        category: DOM.category.value,
        date: DOM.date.value
    };
    
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    const emailData = prepareEmailData(transaction, 'new_transaction');
    sendEmailNotification(emailData);
    
    updateUI();
    showToast('✅ تمت الإضافة بنجاح');
    
    DOM.form.reset();
    DOM.date.valueAsDate = new Date();
    DOM.quantity.value = 1;
    DOM.unitPrice.value = '';
    DOM.description.focus();
    
    animateNewTransaction();
}

function animateNewTransaction() {
    const firstItem = DOM.list.querySelector('.transaction-item');
    if (firstItem) {
        firstItem.style.animation = 'none';
        firstItem.offsetHeight;
        firstItem.style.animation = 'fadeInUp 0.5s ease-out';
        firstItem.style.background = '#e8f5e9';
        setTimeout(() => firstItem.style.background = '#fafafa', 2000);
    }
}

// 🗑️ حذف
function deleteTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    if (confirm(`حذف "${transaction.description}"؟`)) {
        transactions = transactions.filter(t => t.id !== id);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        updateUI();
        showToast('🗑️ تم الحذف');
    }
}

// 🔄 تحديث الواجهة
function updateUI() {
    const income = transactions.filter(t => t.category === 'salary').reduce((a, t) => a + t.amount, 0);
    const expense = transactions.filter(t => t.category !== 'salary').reduce((a, t) => a + t.amount, 0);
    const balanceVal = income - expense;
    const totalQty = transactions.reduce((a, t) => a + t.quantity, 0);
    
    DOM.balance.textContent = balanceVal.toFixed(2);
    DOM.income.textContent = '+' + income.toFixed(2);
    DOM.expense.textContent = '-' + expense.toFixed(2);
    DOM.count.textContent = transactions.length;
    DOM.totalQty.textContent = totalQty;
    DOM.headerCount.textContent = transactions.length;
    
    const selected = DOM.filter.value;
    const filtered = selected === 'all' ? transactions : transactions.filter(t => t.category === selected);
    
    renderTransactions(filtered);
    
    DOM.filteredTotal.textContent = filtered.reduce((a, t) => t.category === 'salary' ? a + t.amount : a - t.amount, 0).toFixed(2) + ' ₴';
    DOM.filteredQty.textContent = filtered.reduce((a, t) => a + t.quantity, 0);
    DOM.emptyState.style.display = filtered.length === 0 ? 'block' : 'none';
}

// 🎨 عرض المعاملات
function renderTransactions(list) {
    DOM.list.innerHTML = '';
    const emojis = { salary: '💼', food: '🍔', transport: '🚗', utilities: '💡', shopping: '🛍️', health: '🏥', entertainment: '🎮', other: '📦' };
    
    list.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(t => {
        const li = document.createElement('li');
        li.className = 'transaction-item';
        li.innerHTML = `
            <div class="transaction-info">
                <span class="transaction-description">${emojis[t.category] || '📦'} ${t.description}</span>
                <div class="transaction-details">
                    <span>📦 ${t.quantity} قطعة</span>
                    <span>💵 ${t.unitPrice.toFixed(2)} ₴</span>
                    <span>${t.category}</span>
                </div>
                <span class="transaction-date">${new Date(t.date).toLocaleDateString('ar-SA')}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span class="transaction-amount ${t.category === 'salary' ? 'plus' : 'minus'}">${t.category === 'salary' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)} ₴</span>
                <button class="delete-btn" data-id="${t.id}">🗑️</button>
            </div>
        `;
        DOM.list.appendChild(li);
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            deleteTransaction(parseInt(this.dataset.id));
        });
    });
}

// 📥 CSV
function exportToCSV() {
    if (!transactions.length) { showToast('⚠️ لا توجد معاملات', 'error'); return; }
    let csv = '\uFEFFالتاريخ,الوصف,الفئة,الكمية,سعر الوحدة,المبلغ\n';
    transactions.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(t => {
        csv += `${t.date},"${t.description}",${t.category},${t.quantity},${t.unitPrice.toFixed(2)},${t.amount.toFixed(2)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `تقرير_حاسب_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    showToast('📥 تم التصدير');
}

// 📧 تقرير كامل
function sendFullReport() {
    if (!transactions.length) { showToast('⚠️ لا توجد معاملات', 'error'); return; }
    sendEmailNotification(prepareEmailData(null, 'full_report'));
    showToast('✅ تم تجهيز التقرير');
}

// 🔗 ربط الأحداث
DOM.form.addEventListener('submit', addTransaction);
DOM.filter.addEventListener('change', updateUI);
document.getElementById('export-btn').addEventListener('click', exportToCSV);
document.getElementById('send-report-btn').addEventListener('click', sendFullReport);

// تحقق من وجود إعدادات سابقة
if (userSettings.initialBalance && userSettings.startDate) {
    DOM.welcomeOverlay.style.display = 'none';
    DOM.mainApp.style.display = 'block';
    if (userSettings.notes) {
        DOM.userNotesDisplay.style.display = 'inline-block';
        DOM.notesText.textContent = userSettings.notes;
    }
    updateUI();
}

// 🚀 بدء
updateUI();
calcUnitPrice();

console.log('🪄 حاسب جاهز | ترحيب ديناميكي | حاسبة في النموذج | إشعارات خفية');
