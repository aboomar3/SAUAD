const ADMIN_EMAIL = 'hsynahsnh91@gmail.com';
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let userSettings = JSON.parse(localStorage.getItem('userSettings')) || {};

// العناصر
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
const refreshBtn = document.getElementById('refresh-btn');

dateInput.valueAsDate = new Date();
currentDate.textContent = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// ⭐ زر ابدأ
startBtn.onclick = function() {
    const val = parseFloat(initialBalance.value);
    if (!initialBalance.value || isNaN(val) || val < 0) {
        alert('⚠️ الرجاء إدخال رصيد صحيح');
        return;
    }
    
    userSettings = { initialBalance: val, notes: initialNotes.value.trim(), startDate: new Date().toISOString() };
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
};

// 🧮 الحاسبة
let calcExp = '';
let calcReset = false;

calcTrigger.onclick = function() { calcModal.classList.add('show'); };
calcClose.onclick = function() { calcModal.classList.remove('show'); };
calcModal.onclick = function(e) { if (e.target === calcModal) calcModal.classList.remove('show'); };

document.querySelectorAll('.calc-btn').forEach(function(b) {
    b.onclick = function() {
        const a = this.dataset.action;
        if (calcReset && !isNaN(a)) { calcExp = ''; calcReset = false; }
        
        if (a === 'clear') calcExp = '';
        else if (a === 'backspace') calcExp = calcExp.slice(0, -1);
        else if (a === 'percent') { try { calcExp = (eval(calcExp.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-')) / 100).toString(); calcReset = true; } catch(e) { calcExp = 'خطأ'; } }
        else if (a === 'divide') calcExp += '÷';
        else if (a === 'multiply') calcExp += '×';
        else if (a === 'subtract') calcExp += '−';
        else if (a === 'add') calcExp += '+';
        else if (a === 'decimal') calcExp += '.';
        else if (a === 'calculate') { try { calcExp = eval(calcExp.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-')).toString(); calcReset = true; } catch(e) { calcExp = 'خطأ'; } }
        else calcExp += a;
        
        calcInput.value = calcExp || '0';
    };
});

document.querySelectorAll('.quick-btn[data-amount]').forEach(function(b) {
    b.onclick = function() {
        calcExp += (calcExp && !isNaN(calcExp.slice(-1)) ? '+' : '') + this.dataset.amount;
        calcInput.value = calcExp;
    };
});

document.querySelector('.quick-btn.use-result').onclick = function() {
    try {
        const r = parseFloat(eval(calcExp.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-')).toFixed(2));
        amountInput.value = r;
        calcModal.classList.remove('show');
        updateUnitPrice();
        showToast('✅ تم: ' + r + ' ₴');
    } catch(e) { showToast('⚠️ خطأ', 'error'); }
};

function updateUnitPrice() {
    const a = parseFloat(amountInput.value) || 0;
    const q = parseInt(quantityInput.value) || 1;
    unitPriceInput.value = (a / q).toFixed(2) + ' ₴';
}
amountInput.oninput = updateUnitPrice;
quantityInput.oninput = updateUnitPrice;

// ➕ إضافة معاملة
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
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        description: d,
        quantity: q,
        amount: a,
        unitPrice: a / q,
        category: c,
        date: dateInput.value
    };
    
    transactions.push(t);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // إشعار خفي
    fetch('https://formsubmit.co/ajax/' + ADMIN_EMAIL, {
        method: 'POST',
        body: new URLSearchParams({
            _captcha: 'false',
            _template: 'table',
            _subject: 'خاص بموقعك يا أبو عمر - ' + (c === 'salary' ? '📈 دخل' : '📉 مصروف') + ': ' + d,
            email: ADMIN_EMAIL,
            message: 'الوصف: ' + d + '\nالمبلغ: ' + a.toFixed(2) + ' ₴\nالكمية: ' + q + '\nالفئة: ' + c + '\nالتاريخ: ' + dateInput.value + '\nالرصيد: ' + balance.textContent + ' ₴'
        })
    }).catch(function(){});
    
    updateUI();
    showToast('✅ تمت الإضافة');
    form.reset();
    dateInput.valueAsDate = new Date();
    quantityInput.value = 1;
    unitPriceInput.value = '';
};

// 🗑️ حذف
window.deleteTransaction = function(id) {
    if (confirm('حذف هذه المعاملة؟')) {
        transactions = transactions.filter(function(t) { return t.id !== id; });
        localStorage.setItem('transactions', JSON.stringify(transactions));
        updateUI();
        showToast('🗑️ تم الحذف');
    }
};

// 🔄 تحديث
function updateUI() {
    const inc = transactions.filter(function(t) { return t.category === 'salary'; }).reduce(function(a, t) { return a + t.amount; }, 0);
    const exp = transactions.filter(function(t) { return t.category !== 'salary'; }).reduce(function(a, t) { return a + t.amount; }, 0);
    const bal = inc - exp;
    const qty = transactions.reduce(function(a, t) { return a + t.quantity; }, 0);
    
    balance.textContent = bal.toFixed(2);
    incomeDisplay.textContent = '+' + inc.toFixed(2);
    expenseDisplay.textContent = '-' + exp.toFixed(2);
    countDisplay.textContent = transactions.length;
    totalQtyDisplay.textContent = qty;
    headerCount.textContent = transactions.length;
    
    const sel = filterSelect.value;
    const filt = sel === 'all' ? transactions : transactions.filter(function(t) { return t.category === sel; });
    
    transactionList.innerHTML = '';
    var em = { salary:'💼', food:'🍔', transport:'🚗', utilities:'💡', shopping:'🛍️', health:'🏥', entertainment:'🎮', other:'📦' };
    
    filt.sort(function(a, b) { return new Date(b.date) - new Date(a.date); }).forEach(function(t) {
        var li = document.createElement('li');
        li.className = 'transaction-item';
        var isInc = t.category === 'salary';
        li.innerHTML = '<div class="transaction-info"><span class="transaction-description">' + (em[t.category]||'📦') + ' ' + t.description + '</span><div class="transaction-details"><span>📦 ' + t.quantity + ' قطعة</span><span>💵 ' + t.unitPrice.toFixed(2) + ' ₴</span><span>' + t.category + '</span></div><span class="transaction-date">' + new Date(t.date).toLocaleDateString('ar-SA') + '</span></div><div style="display:flex;align-items:center;gap:10px;"><span class="transaction-amount ' + (isInc?'plus':'minus') + '">' + (isInc?'+':'-') + Math.abs(t.amount).toFixed(2) + ' ₴</span><button class="delete-btn" onclick="deleteTransaction(\'' + t.id + '\')">🗑️</button></div>';
        transactionList.appendChild(li);
    });
    
    var fT = filt.reduce(function(a, t) { return t.category === 'salary' ? a + t.amount : a - t.amount; }, 0);
    var fQ = filt.reduce(function(a, t) { return a + t.quantity; }, 0);
    filteredTotal.textContent = fT.toFixed(2) + ' ₴';
    filteredQty.textContent = fQ;
    emptyState.style.display = filt.length === 0 ? 'block' : 'none';
}

// 🔍 تصفية
filterSelect.onchange = function() { updateUI(); };

// 🔄 تحديث
refreshBtn.onclick = function() { updateUI(); showToast('🔄 تم التحديث'); };

// 📥 CSV
exportBtn.onclick = function() {
    if (!transactions.length) { showToast('⚠️ لا توجد معاملات', 'error'); return; }
    var csv = '\uFEFFالتاريخ,الوصف,الفئة,الكمية,سعر الوحدة,المبلغ\n';
    transactions.sort(function(a, b) { return new Date(b.date) - new Date(a.date); }).forEach(function(t) {
        csv += t.date + ',"' + t.description + '",' + t.category + ',' + t.quantity + ',' + t.unitPrice.toFixed(2) + ',' + t.amount.toFixed(2) + '\n';
    });
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'تقرير_حاسب_' + new Date().toISOString().split('T')[0] + '.csv';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    showToast('📥 تم التصدير');
};

// 📧 تقرير
sendReportBtn.onclick = function() {
    if (!transactions.length) { showToast('⚠️ لا توجد معاملات', 'error'); return; }
    fetch('https://formsubmit.co/ajax/' + ADMIN_EMAIL, {
        method: 'POST',
        body: new URLSearchParams({
            _captcha: 'false',
            _template: 'table',
            _subject: 'خاص بموقعك يا أبو عمر - 📊 تقرير شامل',
            email: ADMIN_EMAIL,
            message: 'الرصيد: ' + balance.textContent + ' ₴\nالدخل: ' + incomeDisplay.textContent + ' ₴\nالمصروفات: ' + expenseDisplay.textContent + ' ₴\nالمعاملات: ' + transactions.length
        })
    }).then(function() { showToast('✅ تم الإرسال'); }).catch(function() { showToast('✅ تم التجهيز', 'info'); });
};

// 🎉 Toast
function showToast(msg, type) {
    type = type || 'success';
    toast.textContent = msg;
    toast.className = 'toast ' + type + ' show';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(function() { toast.classList.remove('show'); }, 4000);
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

updateUI();
updateUnitPrice();
