// ==========================================
// 🪄 حاسب - جميع الأزرار تعمل 100%
// ==========================================

const ADMIN_EMAIL = 'hsynahsnh91@gmail.com';
const FORM_SUBMIT_URL = 'https://formsubmit.co/ajax/' + ADMIN_EMAIL;

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let userSettings = JSON.parse(localStorage.getItem('userSettings')) || {};

// 🎯 العناصر
const welcomeOverlay = document.getElementById('welcome-overlay');
const initialBalance = document.getElementById('initial-balance');
const initialNotes = document.getElementById('initial-notes');
const startBtn = document.getElementById('start-btn');
const mainApp = document.getElementById('main-app');
const balance = document.getElementById('total-balance');
const incomeDisplay = document.getElementById('total-income');
const expenseDisplay = document.getElementById('total-expense');
const countDisplay = document.getElementById('transaction-count');
const totalQtyDisplay = document.getElementById('total-quantity');
const headerCount = document.getElementById('header-count');
const currentDate = document.getElementById('current-date');
const transactionList = document.getElementById('transaction-list');
const form = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const quantityInput = document.getElementById('quantity');
const amountInput = document.getElementById('amount');
const unitPriceInput = document.getElementById('unit-price');
const categorySelect = document.getElementById('category');
const dateInput = document.getElementById('date');
const filterSelect = document.getElementById('filter-category');
const emptyState = document.getElementById('empty-state');
const filteredTotal = document.getElementById('filtered-total');
const filteredQty = document.getElementById('filtered-quantity');
const toast = document.getElementById('toast');
const calcTrigger = document.getElementById('calc-trigger');
const calcModal = document.getElementById('calc-modal');
const calcClose = document.getElementById('calc-close');
const calcInput = document.getElementById('calc-input');
const exportBtn = document.getElementById('export-btn');
const sendReportBtn = document.getElementById('send-report-btn');
const refreshBtn = document.querySelector('.refresh-btn');

// تهيئة
dateInput.valueAsDate = new Date();
currentDate.textContent = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// ⭐⭐⭐ زر ابدأ - يعمل 100% ⭐⭐⭐
startBtn.onclick = function() {
    const val = parseFloat(initialBalance.value);
    
    if (!initialBalance.value || isNaN(val) || val < 0) {
        alert('⚠️ الرجاء إدخال رصيد صحيح');
        return;
    }
    
    userSettings = {
        initialBalance: val,
        notes: initialNotes.value.trim(),
        startDate: new Date().toISOString()
    };
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
    
    if (val > 0) {
        transactions.push({
            id: 'init-' + Date.now(),
            description: '💰 الرصيد الافتتاحي',
            quantity: 1,
            amount: val,
            unitPrice: val,
            category: 'salary',
            date: new Date().toISOString().split('T')[0]
        });
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
    
    if (userSettings.notes) {
        document.getElementById('user-notes-display').style.display = 'inline-block';
        document.getElementById('notes-text').textContent = userSettings.notes;
    }
    
    welcomeOverlay.style.display = 'none';
    mainApp.style.display = 'block';
    updateUI();
    
    // إشعار ترحيب
    const p = new FormData();
    p.append('_captcha', 'false');
    p.append('_template', 'table');
    p.append('_subject', 'خاص بموقعك يا أبو عمر - 🎉 مستخدم جديد');
    p.append('email', ADMIN_EMAIL);
    p.append('message', 'رصيد: ' + val + ' ₴\nملاحظات: ' + (userSettings.notes || 'لا توجد'));
    fetch(FORM_SUBMIT_URL, { method: 'POST', body: p }).catch(() => {});
};

// 🧮 الحاسبة
let calcExp = '';
let calcReset = false;

calcTrigger.onclick = () => calcModal.classList.add('show');
calcClose.onclick = () => calcModal.classList.remove('show');
calcModal.onclick = (e) => { if (e.target === calcModal) calcModal.classList.remove('show'); };

document.querySelectorAll('.calc-btn').forEach(b => {
    b.onclick = () => {
        const a = b.dataset.action;
        if (calcReset && !isNaN(a)) { calcExp = ''; calcReset = false; }
        switch(a) {
            case 'clear': calcExp = ''; break;
            case 'backspace': calcExp = calcExp.slice(0,-1); break;
            case 'percent': try { calcExp = (eval(calcExp.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-'))/100).toString(); calcReset=true; } catch(e) { calcExp='خطأ'; calcReset=true; } break;
            case 'divide': calcExp += '÷'; break;
            case 'multiply': calcExp += '×'; break;
            case 'subtract': calcExp += '−'; break;
            case 'add': calcExp += '+'; break;
            case 'decimal': calcExp += '.'; break;
            case 'calculate': try { calcExp = parseFloat(eval(calcExp.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-')).toFixed(10)).toString(); calcReset=true; } catch(e) { calcExp='خطأ'; calcReset=true; } break;
            default: calcExp += a;
        }
        calcInput.value = calcExp || '0';
    };
});

document.querySelectorAll('.quick-btn[data-amount]').forEach(b => {
    b.onclick = () => {
        calcExp += (calcExp && !isNaN(calcExp.slice(-1)) ? '+' : '') + b.dataset.amount;
        calcInput.value = calcExp;
    };
});

const useBtn = document.querySelector('.quick-btn.use-result');
if (useBtn) {
    useBtn.onclick = () => {
        try {
            const r = parseFloat(eval(calcExp.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-')).toFixed(2));
            amountInput.value = r;
            calcModal.classList.remove('show');
            calcUnitPrice();
            showToast('✅ تم: ' + r + ' ₴');
        } catch(e) { showToast('⚠️ خطأ', 'error'); }
    };
}

// 🧮 سعر الوحدة
function calcUnitPrice() {
    const a = parseFloat(amountInput.value) || 0;
    const q = parseInt(quantityInput.value) || 1;
    unitPriceInput.value = (a / q).toFixed(2) + ' ₴';
}
amountInput.oninput = calcUnitPrice;
quantityInput.oninput = calcUnitPrice;

// ➕ إضافة
form.onsubmit = function(e) {
    e.preventDefault();
    const q = parseInt(quantityInput.value) || 1;
    const a = parseFloat(amountInput.value);
    const d = descriptionInput.value.trim();
    const c = categorySelect.value;
    
    if (!d) { showToast('⚠️ أدخل الوصف', 'error'); return; }
    if (isNaN(a) || a <= 0) { showToast('⚠️ أدخل مبلغ صحيح', 'error'); return; }
    if (!c) { showToast('⚠️ اختر الفئة', 'error'); return; }
    
    const t = {
        id: Date.now().toString(36),
        description: d,
        quantity: q,
        amount: a,
        unitPrice: a / q,
        category: c,
        date: dateInput.value
    };
    
    transactions.push(t);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // إشعار
    const p = new FormData();
    p.append('_captcha', 'false');
    p.append('_template', 'table');
    p.append('_subject', 'خاص بموقعك يا أبو عمر - ' + (c === 'salary' ? '📈 دخل' : '📉 مصروف') + ': ' + d);
    p.append('email', ADMIN_EMAIL);
    p.append('message', 'الوصف: ' + d + '\nالمبلغ: ' + a.toFixed(2) + ' ₴\nالكمية: ' + q + '\nالفئة: ' + c + '\nالتاريخ: ' + dateInput.value + '\nالرصيد: ' + balance.textContent + ' ₴');
    fetch(FORM_SUBMIT_URL, { method: 'POST', body: p }).catch(() => {});
    
    updateUI();
    showToast('✅ تمت الإضافة');
    form.reset();
    dateInput.valueAsDate = new Date();
    quantityInput.value = 1;
    unitPriceInput.value = '';
    descriptionInput.focus();
};

// 🗑️ حذف
window.deleteTransaction = function(id) {
    if (confirm('حذف هذه المعاملة؟')) {
        transactions = transactions.filter(t => t.id !== id);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        updateUI();
        showToast('🗑️ تم الحذف');
    }
};

// 🔄 تحديث
function updateUI() {
    const inc = transactions.filter(t => t.category === 'salary').reduce((a,t) => a + t.amount, 0);
    const exp = transactions.filter(t => t.category !== 'salary').reduce((a,t) => a + t.amount, 0);
    const bal = inc - exp;
    const qty = transactions.reduce((a,t) => a + t.quantity, 0);
    
    balance.textContent = bal.toFixed(2);
    incomeDisplay.textContent = '+' + inc.toFixed(2);
    expenseDisplay.textContent = '-' + exp.toFixed(2);
    countDisplay.textContent = transactions.length;
    totalQtyDisplay.textContent = qty;
    headerCount.textContent = transactions.length;
    
    const sel = filterSelect.value;
    const filt = sel === 'all' ? transactions : transactions.filter(t => t.category === sel);
    
    transactionList.innerHTML = '';
    const em = { salary:'💼', food:'🍔', transport:'🚗', utilities:'💡', shopping:'🛍️', health:'🏥', entertainment:'🎮', other:'📦' };
    
    filt.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(t => {
        const li = document.createElement('li');
        li.className = 'transaction-item';
        li.innerHTML = `
            <div class="transaction-info">
                <span class="transaction-description">${em[t.category]||'📦'} ${t.description}</span>
                <div class="transaction-details">
                    <span>📦 ${t.quantity} قطعة</span>
                    <span>💵 ${t.unitPrice.toFixed(2)} ₴</span>
                    <span>${t.category}</span>
                </div>
                <span class="transaction-date">${new Date(t.date).toLocaleDateString('ar-SA')}</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
                <span class="transaction-amount ${t.category==='salary'?'plus':'minus'}">${t.category==='salary'?'+':'-'}${Math.abs(t.amount).toFixed(2)} ₴</span>
                <button class="delete-btn" onclick="deleteTransaction('${t.id}')">🗑️</button>
            </div>
        `;
        transactionList.appendChild(li);
    });
    
    const fT = filt.reduce((a,t) => t.category === 'salary' ? a + t.amount : a - t.amount, 0);
    const fQ = filt.reduce((a,t) => a + t.quantity, 0);
    filteredTotal.textContent = fT.toFixed(2) + ' ₴';
    filteredQty.textContent = fQ;
    emptyState.style.display = filt.length === 0 ? 'block' : 'none';
}

// 🔍 تصفية
filterSelect.onchange = () => updateUI();

// 🔄 تحديث
if (refreshBtn) refreshBtn.onclick = () => { updateUI(); showToast('🔄 تم التحديث'); };

// 📥 CSV
exportBtn.onclick = () => {
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
};

// 📧 تقرير
sendReportBtn.onclick = () => {
    if (!transactions.length) { showToast('⚠️ لا توجد معاملات', 'error'); return; }
    const p = new FormData();
    p.append('_captcha', 'false');
    p.append('_template', 'table');
    p.append('_subject', 'خاص بموقعك يا أبو عمر - 📊 تقرير شامل');
    p.append('email', ADMIN_EMAIL);
    p.append('message', 'الرصيد: ' + balance.textContent + ' ₴\nالدخل: ' + incomeDisplay.textContent + ' ₴\nالمصروفات: ' + expenseDisplay.textContent + ' ₴\nالمعاملات: ' + transactions.length);
    fetch(FORM_SUBMIT_URL, { method: 'POST', body: p }).then(() => showToast('✅ تم الإرسال')).catch(() => showToast('✅ تم التجهيز'));
};

// 🎉 Toast
function showToast(msg, type) {
    type = type || 'success';
    toast.textContent = msg;
    toast.className = 'toast ' + type + ' show';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('show'), 4000);
}

// 🚀 تحقق أولي
if (userSettings.initialBalance && userSettings.startDate) {
    welcomeOverlay.style.display = 'none';
    mainApp.style.display = 'block';
    if (userSettings.notes) {
        document.getElementById('user-notes-display').style.display = 'inline-block';
        document.getElementById('notes-text').textContent = userSettings.notes;
    }
}

// بدء
updateUI();
calcUnitPrice();
console.log('✅ جميع الأزرار تعمل - جاهز!');
