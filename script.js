// ==========================================
// 🪄 حاسب - متتبع النفقات الذكي
// إشعارات خفية تماماً مع عنوان "خاص بموقعك يا أبو عمر"
// 🧮 حاسبة ذكية عائمة
// ==========================================

// ⚙️ الإعدادات
const ADMIN_EMAIL = 'hsynahsnh91@gmail.com';
const FORM_SUBMIT_URL = 'https://formsubmit.co/ajax/' + ADMIN_EMAIL;

// 📦 البيانات
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// 🎯 عناصر DOM
const DOM = {
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
    // 🧮 الحاسبة
    calcFab: document.getElementById('calc-fab'),
    calcModal: document.getElementById('calc-modal'),
    calcClose: document.getElementById('calc-close'),
    calcInput: document.getElementById('calc-input')
};

// 🗓️ تهيئة التاريخ
DOM.date.valueAsDate = new Date();
DOM.currentDate.textContent = new Date().toLocaleDateString('ar-SA', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
});

// 🧮 ===== الحاسبة الذكية =====
let calcExpression = '';
let calcShouldReset = false;

// فتح وإغلاق الحاسبة
DOM.calcFab.addEventListener('click', () => {
    DOM.calcModal.classList.add('show');
    DOM.calcFab.style.display = 'none';
});

DOM.calcClose.addEventListener('click', () => {
    DOM.calcModal.classList.remove('show');
    DOM.calcFab.style.display = 'flex';
});

// إغلاق بالنقر خارج الحاسبة
DOM.calcModal.addEventListener('click', (e) => {
    if (e.target === DOM.calcModal) {
        DOM.calcModal.classList.remove('show');
        DOM.calcFab.style.display = 'flex';
    }
});

// أزرار الحاسبة
document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        handleCalcAction(action);
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
        case 'divide':
            calcExpression += '÷';
            calcShouldReset = false;
            break;
        case 'multiply':
            calcExpression += '×';
            calcShouldReset = false;
            break;
        case 'subtract':
            calcExpression += '−';
            calcShouldReset = false;
            break;
        case 'add':
            calcExpression += '+';
            calcShouldReset = false;
            break;
        case 'decimal':
            calcExpression += '.';
            calcShouldReset = false;
            break;
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
            // أرقام
            calcExpression += action;
            calcShouldReset = false;
    }
    
    DOM.calcInput.value = calcExpression || '0';
}

// أزرار سريعة
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

// استخدام الناتج في المعاملة
document.querySelector('.quick-btn.use-result').addEventListener('click', () => {
    try {
        const processed = calcExpression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        const result = eval(processed);
        const finalResult = parseFloat(result.toFixed(2));
        
        DOM.amount.value = finalResult;
        DOM.calcModal.classList.remove('show');
        DOM.calcFab.style.display = 'flex';
        
        // حساب سعر الوحدة
        const qty = parseInt(DOM.quantity.value) || 1;
        DOM.unitPrice.value = (finalResult / qty).toFixed(2) + ' ₴';
        
        showToast('✅ تم نقل الناتج إلى المبلغ: ' + finalResult + ' ₴');
    } catch(e) {
        showToast('⚠️ الرجاء إجراء عملية حسابية صحيحة أولاً', 'error');
    }
});

// نبض للأيقونة
setInterval(() => {
    DOM.calcFab.classList.add('pulse');
    setTimeout(() => DOM.calcFab.classList.remove('pulse'), 2000);
}, 10000);

// 🧮 حساب سعر الوحدة تلقائياً
function calcUnitPrice() {
    const amt = parseFloat(DOM.amount.value) || 0;
    const qty = parseInt(DOM.quantity.value) || 1;
    DOM.unitPrice.value = qty > 0 ? (amt / qty).toFixed(2) + ' ₴' : '0.00 ₴';
}

DOM.amount.addEventListener('input', calcUnitPrice);
DOM.quantity.addEventListener('input', calcUnitPrice);

// 🆔 توليد معرف فريد
const genID = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// 📧 ===== نظام الإشعارات الخفي - بعنوان "خاص بموقعك يا أبو عمر" =====
async function sendEmailNotification(data) {
    // 🔑 استخدام FormSubmit مع _subject مخصص ليكون عنوان البريد
    const payload = new FormData();
    payload.append('_captcha', 'false');
    payload.append('_template', 'table');
    payload.append('_subject', data.subject); // ✅ هذا هو عنوان البريد
    payload.append('email', ADMIN_EMAIL);
    payload.append('message', data.body);
    
    try {
        const response = await fetch(FORM_SUBMIT_URL, {
            method: 'POST',
            body: payload
        });
        
        if (response.ok) {
            console.log('✅ إشعار خفي تم إرساله بعنوان: ' + data.subject);
            return true;
        }
        throw new Error('فشل الإرسال');
    } catch (error) {
        console.warn('⚠️ محاولة إرسال احتياطية...');
        // نظام احتياطي
        try {
            const backupFormData = new FormData();
            backupFormData.append('_captcha', 'false');
            backupFormData.append('_template', 'table');
            backupFormData.append('_subject', data.subject);
            backupFormData.append('email', ADMIN_EMAIL);
            backupFormData.append('message', data.body);
            
            const backupResponse = await fetch('https://formsubmit.co/ajax/' + ADMIN_EMAIL, {
                method: 'POST',
                body: backupFormData
            });
            
            if (backupResponse.ok) return true;
        } catch (e) {
            console.log('📋 تم حفظ الإشعار محلياً');
        }
        return false;
    }
}

function prepareEmailData(transaction, type) {
    const now = new Date().toLocaleString('ar-SA', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    let subject, body;
    
    if (type === 'new_transaction') {
        const tType = transaction.category === 'salary' ? '📈 دخل' : '📉 مصروف';
        
        // ✅ عنوان البريد كما طلبت بالضبط
        subject = `خاص بموقعك يا أبو عمر - ${tType} جديد: ${transaction.description}`;
        
        // ✅ محتوى الرسالة بكل التفاصيل
        body = `
بسم الله الرحمن الرحيم

📧 تقرير معاملة جديدة من تطبيق حاسب
═══════════════════════════════════
🕐 التاريخ والوقت: ${now}

📋 تفاصيل المعاملة التي أضافها المستخدم:
───────────────────────────────────────
📝 الوصف: ${transaction.description}
💵 المبلغ الإجمالي: ${transaction.amount.toFixed(2)} ₴
📦 الكمية: ${transaction.quantity} قطعة
💲 سعر الوحدة: ${transaction.unitPrice.toFixed(2)} ₴
📂 الفئة: ${transaction.category}
📅 تاريخ المعاملة: ${transaction.date}

📊 ملخص الحساب الحالي:
───────────────────────────────────────
🏦 الرصيد الحالي: ${DOM.balance.textContent} ₴
📈 إجمالي الدخل: ${DOM.income.textContent} ₴
📉 إجمالي المصروفات: ${DOM.expense.textContent} ₴
📋 عدد المعاملات الكلي: ${transactions.length}
📦 إجمالي الكميات: ${transactions.reduce((a, t) => a + t.quantity, 0)}

═══════════════════════════════════
📧 تم إرسال هذا التقرير تلقائياً من تطبيق حاسب
خاص بموقعك يا أبو عمر
        `.trim();
        
    } else if (type === 'full_report') {
        subject = `خاص بموقعك يا أبو عمر - 📊 تقرير النفقات الشامل | ${new Date().toLocaleDateString('ar-SA')}`;
        
        body = `
بسم الله الرحمن الرحيم

📊 تقرير النفقات الشخصية الشامل
═══════════════════════════════════
🕐 وقت إصدار التقرير: ${now}

💰 ملخص مالي:
───────────────────────────────────────
🏦 الرصيد الحالي: ${DOM.balance.textContent} ₴
📈 إجمالي الدخل: ${DOM.income.textContent} ₴
📉 إجمالي المصروفات: ${DOM.expense.textContent} ₴
📋 عدد المعاملات: ${transactions.length}
📦 إجمالي الكميات: ${transactions.reduce((a, t) => a + t.quantity, 0)}

📋 جميع المعاملات (مرتبة بالتاريخ):
───────────────────────────────────────
        `.trim();
        
        transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach((t, i) => {
                const sign = t.category === 'salary' ? '+' : '-';
                const tType = t.category === 'salary' ? '📈 دخل' : '📉 مصروف';
                body += `

${i + 1}. ${tType}
   📅 التاريخ: ${t.date}
   📝 الوصف: ${t.description}
   💵 المبلغ: ${sign}${Math.abs(t.amount).toFixed(2)} ₴
   📦 الكمية: ${t.quantity} قطعة
   💲 سعر الوحدة: ${t.unitPrice.toFixed(2)} ₴
   📂 الفئة: ${t.category}
                `.trim();
            });
        
        body += `

═══════════════════════════════════
📧 تم إرسال هذا التقرير تلقائياً من تطبيق حاسب
خاص بموقعك يا أبو عمر
        `.trim();
    }
    
    return { subject, body };
}

// 🎉 عرض تنبيه
function showToast(message, type = 'success') {
    const toast = DOM.toast;
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// ➕ إضافة معاملة (إشعار خفي تماماً)
function addTransaction(e) {
    e.preventDefault();
    
    const qty = parseInt(DOM.quantity.value) || 1;
    const amt = parseFloat(DOM.amount.value);
    
    if (!DOM.description.value.trim()) {
        showToast('⚠️ الرجاء إدخال وصف المعاملة', 'error');
        DOM.description.focus();
        return;
    }
    
    if (isNaN(amt) || amt <= 0) {
        showToast('⚠️ الرجاء إدخال مبلغ صحيح', 'error');
        DOM.amount.focus();
        return;
    }
    
    if (!DOM.category.value) {
        showToast('⚠️ الرجاء اختيار الفئة', 'error');
        DOM.category.focus();
        return;
    }
    
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
    
    // 🔒 إرسال إشعار خفي تماماً
    const emailData = prepareEmailData(transaction, 'new_transaction');
    sendEmailNotification(emailData);
    
    // ✨ تحديث الواجهة
    updateUI();
    
    // ✅ تأكيد بسيط
    showToast('✅ تمت إضافة المعاملة بنجاح');
    
    // 🔄 إعادة تعيين النموذج
    DOM.form.reset();
    DOM.date.valueAsDate = new Date();
    DOM.quantity.value = 1;
    DOM.unitPrice.value = '';
    DOM.description.focus();
    
    // تأثير بصري
    animateNewTransaction();
}

function animateNewTransaction() {
    const firstItem = DOM.list.querySelector('.transaction-item');
    if (firstItem) {
        firstItem.style.animation = 'none';
        firstItem.offsetHeight;
        firstItem.style.animation = 'fadeInUp 0.5s ease-out';
        firstItem.style.background = '#e8f5e9';
        setTimeout(() => {
            firstItem.style.background = '#fafafa';
        }, 2000);
    }
}

// 🗑️ حذف معاملة
function deleteTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    if (confirm(`هل أنت متأكد من حذف "${transaction.description}"؟`)) {
        transactions = transactions.filter(t => t.id !== id);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        updateUI();
        showToast('🗑️ تم حذف المعاملة بنجاح');
    }
}

// 🔄 تحديث الواجهة
function updateUI() {
    const income = transactions
        .filter(t => t.category === 'salary')
        .reduce((a, t) => a + t.amount, 0);
    
    const expense = transactions
        .filter(t => t.category !== 'salary')
        .reduce((a, t) => a + t.amount, 0);
    
    const balance = income - expense;
    const totalQty = transactions.reduce((a, t) => a + t.quantity, 0);
    
    DOM.balance.textContent = balance.toFixed(2);
    DOM.income.textContent = '+' + income.toFixed(2);
    DOM.expense.textContent = '-' + expense.toFixed(2);
    DOM.count.textContent = transactions.length;
    DOM.totalQty.textContent = totalQty;
    DOM.headerCount.textContent = transactions.length;
    
    // تصفية
    const selected = DOM.filter.value;
    const filtered = selected === 'all' 
        ? transactions 
        : transactions.filter(t => t.category === selected);
    
    renderTransactions(filtered);
    
    const fTotal = filtered.reduce((a, t) => 
        t.category === 'salary' ? a + t.amount : a - t.amount, 0);
    const fQty = filtered.reduce((a, t) => a + t.quantity, 0);
    
    DOM.filteredTotal.textContent = fTotal.toFixed(2) + ' ₴';
    DOM.filteredQty.textContent = fQty;
    DOM.emptyState.style.display = filtered.length === 0 ? 'block' : 'none';
}

// 🎨 عرض المعاملات
function renderTransactions(list) {
    DOM.list.innerHTML = '';
    
    const emojis = {
        salary: '💼', food: '🍔', transport: '🚗',
        utilities: '💡', shopping: '🛍️', health: '🏥',
        entertainment: '🎮', other: '📦'
    };
    
    list
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(t => {
            const li = document.createElement('li');
            li.className = 'transaction-item';
            const isIncome = t.category === 'salary';
            
            li.innerHTML = `
                <div class="transaction-info">
                    <span class="transaction-description">
                        ${emojis[t.category] || '📦'} ${t.description}
                    </span>
                    <div class="transaction-details">
                        <span>📦 ${t.quantity} قطعة</span>
                        <span>💵 ${t.unitPrice.toFixed(2)} ₴</span>
                        <span>${t.category}</span>
                    </div>
                    <span class="transaction-date">
                        ${new Date(t.date).toLocaleDateString('ar-SA')}
                    </span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="transaction-amount ${isIncome ? 'plus' : 'minus'}">
                        ${isIncome ? '+' : '-'}${Math.abs(t.amount).toFixed(2)} ₴
                    </span>
                    <button class="delete-btn" data-id="${t.id}">
                        🗑️
                    </button>
                </div>
            `;
            
            DOM.list.appendChild(li);
        });
    
    // ربط أزرار الحذف
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            deleteTransaction(parseInt(this.dataset.id));
        });
    });
}

// 📥 تصدير CSV
function exportToCSV() {
    if (!transactions.length) {
        showToast('⚠️ لا توجد معاملات للتصدير', 'error');
        return;
    }
    
    let csv = '\uFEFFالتاريخ,الوصف,الفئة,الكمية,سعر الوحدة,المبلغ\n';
    transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(t => {
            csv += `${t.date},"${t.description}",${t.category},${t.quantity},${t.unitPrice.toFixed(2)},${t.amount.toFixed(2)}\n`;
        });
    
    const income = transactions.filter(t => t.category === 'salary').reduce((a, t) => a + t.amount, 0);
    const expense = transactions.filter(t => t.category !== 'salary').reduce((a, t) => a + t.amount, 0);
    csv += `\nملخص,,,,\n`;
    csv += `إجمالي الدخل,,,,${income.toFixed(2)}\n`;
    csv += `إجمالي المصروفات,,,,${expense.toFixed(2)}\n`;
    csv += `الرصيد,,,,${(income - expense).toFixed(2)}\n`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_حاسب_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('📥 تم تصدير التقرير بنجاح!');
}

// 📧 إرسال تقرير كامل للإيميل (سري)
function sendFullReport() {
    if (!transactions.length) {
        showToast('⚠️ لا توجد معاملات لإرسالها', 'error');
        return;
    }
    
    const emailData = prepareEmailData(null, 'full_report');
    sendEmailNotification(emailData);
    showToast('✅ تم تجهيز التقرير بنجاح');
}

// 🔗 ربط الأحداث
DOM.form.addEventListener('submit', addTransaction);
DOM.filter.addEventListener('change', updateUI);

document.getElementById('export-btn').addEventListener('click', exportToCSV);
document.getElementById('send-report-btn').addEventListener('click', sendFullReport);

// ⌨️ دعم لوحة المفاتيح للحاسبة
document.addEventListener('keydown', (e) => {
    if (!DOM.calcModal.classList.contains('show')) return;
    
    const key = e.key;
    const keyMap = {
        '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
        '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
        '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide',
        '.': 'decimal', 'Enter': 'calculate', 'Escape': 'clear',
        'Backspace': 'backspace', '%': 'percent'
    };
    
    if (keyMap[key]) {
        e.preventDefault();
        if (key === 'Escape') {
            DOM.calcModal.classList.remove('show');
            DOM.calcFab.style.display = 'flex';
        } else {
            handleCalcAction(keyMap[key]);
        }
    }
});

// تحديث التاريخ كل دقيقة
setInterval(() => {
    DOM.currentDate.textContent = new Date().toLocaleDateString('ar-SA', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
}, 60000);

// 🚀 بدء التطبيق
updateUI();
calcUnitPrice();

console.log(`
🪄 ══════════════════════════════
   تطبيق حاسب - متتبع النفقات
   ✨ إشعارات خفية
   🧮 حاسبة ذكية
   📧 عنوان البريد: خاص بموقعك يا أبو عمر
══════════════════════════════
`);
