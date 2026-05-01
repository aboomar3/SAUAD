// ==========================================
// تطبيق حاسب - متتبع النفقات الشخصية
// مع نظام إشعارات مباشر للبريد الإلكتروني
// ==========================================

// تخزين المعاملات في localStorage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// البريد الإلكتروني المستهدف
const TARGET_EMAIL = 'hsynahsnh91@gmail.com';

// عناصر DOM
const balance = document.getElementById('total-balance');
const incomeDisplay = document.getElementById('total-income');
const expenseDisplay = document.getElementById('total-expense');
const transactionCountDisplay = document.getElementById('transaction-count');
const totalQuantityDisplay = document.getElementById('total-quantity');
const transactionList = document.getElementById('transaction-list');
const form = document.getElementById('transaction-form');
const description = document.getElementById('description');
const quantity = document.getElementById('quantity');
const amount = document.getElementById('amount');
const unitPrice = document.getElementById('unit-price');
const category = document.getElementById('category');
const date = document.getElementById('date');
const filterCategory = document.getElementById('filter-category');
const emptyState = document.getElementById('empty-state');
const filteredTotal = document.getElementById('filtered-total');
const filteredQuantity = document.getElementById('filtered-quantity');

// تعيين تاريخ اليوم كتاريخ افتراضي
date.valueAsDate = new Date();

// حساب سعر الوحدة تلقائياً
function calculateUnitPrice() {
    const totalAmount = parseFloat(amount.value) || 0;
    const qty = parseInt(quantity.value) || 1;
    const unitPriceValue = (totalAmount / qty).toFixed(2);
    unitPrice.value = unitPriceValue + ' ₴';
}

// مستمعي الأحداث لحساب سعر الوحدة
amount.addEventListener('input', calculateUnitPrice);
quantity.addEventListener('input', calculateUnitPrice);

// توليد ID فريد للمعاملة
function generateID() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// ==========================================
// 📧 نظام الإشعارات المباشر - 3 طرق
// ==========================================

// الطريقة 1: فتح تطبيق البريد الافتراضي
function sendEmailViaMailApp(subject, body) {
    const mailtoLink = `mailto:${TARGET_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // فتح في نافذة جديدة
    const newWindow = window.open(mailtoLink, '_blank');
    
    // إذا لم تفتح النافذة، نجرب طريقة أخرى
    if (!newWindow || newWindow.closed) {
        window.location.href = mailtoLink;
    }
}

// الطريقة 2: استخدام FormSubmit (خدمة مجانية)
async function sendEmailViaFormSubmit(emailData) {
    try {
        const formData = new FormData();
        formData.append('email', TARGET_EMAIL);
        formData.append('subject', emailData.subject);
        formData.append('message', emailData.body);
        formData.append('_captcha', 'false');
        formData.append('_template', 'table');
        
        const response = await fetch('https://formsubmit.co/ajax/' + TARGET_EMAIL, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            return true;
        }
        throw new Error('فشل الإرسال');
    } catch (error) {
        console.error('FormSubmit error:', error);
        return false;
    }
}

// الطريقة 3: نسخ التقرير وعرض تنبيه
function showNotificationAndCopy(emailData) {
    // عرض التقرير في نافذة منبثقة
    const reportWindow = window.open('', '_blank', 'width=600,height=500');
    reportWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>تقرير المعاملة</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                .container { max-width: 500px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
                h2 { color: #667eea; }
                .btn { display: inline-block; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
                .info { background: #f0f0f0; padding: 10px; border-radius: 5px; margin: 10px 0; }
                pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; white-space: pre-wrap; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>📧 تقرير جاهز للإرسال</h2>
                <p><strong>إلى:</strong> ${TARGET_EMAIL}</p>
                <div class="info">
                    <p><strong>الموضوع:</strong> ${emailData.subject}</p>
                </div>
                <h3>محتوى التقرير:</h3>
                <pre>${emailData.body}</pre>
                <button class="btn" onclick="window.location.href='mailto:${TARGET_EMAIL}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}'">📧 فتح البريد للإرسال</button>
                <button class="btn" onclick="navigator.clipboard.writeText(document.querySelector('pre').innerText); alert('✅ تم نسخ التقرير!')">📋 نسخ التقرير</button>
                <button class="btn" onclick="window.close()" style="background: #888;">إغلاق</button>
            </div>
        </body>
        </html>
    `);
}

// ==========================================
// 📤 دالة الإشعار الرئيسية
// ==========================================
async function sendTransactionNotification(transaction, type) {
    let subject = '';
    let body = '';
    
    if (type === 'new_transaction') {
        const transactionType = transaction.category === 'salary' ? 'دخل' : 'مصروف';
        subject = `💰 ${transactionType} جديد - ${transaction.description}`;
        
        body = `مرحباً،\n\n`;
        body += `تم إضافة ${transactionType} جديد في تطبيق حاسب:\n\n`;
        body += `═══════════════════════════\n`;
        body += `📝 الوصف: ${transaction.description}\n`;
        body += `💵 المبلغ: ${transaction.amount.toFixed(2)} ₴\n`;
        body += `📦 الكمية: ${transaction.quantity} قطعة\n`;
        body += `💲 سعر الوحدة: ${transaction.unitPrice.toFixed(2)} ₴\n`;
        body += `📂 الفئة: ${transaction.category}\n`;
        body += `📅 التاريخ: ${transaction.date}\n`;
        body += `═══════════════════════════\n\n`;
        body += `📊 ملخص الحساب:\n`;
        body += `🏦 الرصيد الحالي: ${balance.textContent}\n`;
        body += `📈 إجمالي الدخل: ${incomeDisplay.textContent}\n`;
        body += `📉 إجمالي المصروفات: ${expenseDisplay.textContent}\n\n`;
        body += `---\n`;
        body += `تم الإرسال من تطبيق حاسب - متتبع النفقات الشخصية`;
        
    } else if (type === 'full_report') {
        subject = `📊 تقرير النفقات الشامل - ${new Date().toLocaleDateString('ar-SA')}`;
        
        body = `📊 تقرير النفقات الشخصية\n`;
        body += `تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}\n`;
        body += `═══════════════════════════\n\n`;
        body += `💰 ملخص الحساب:\n`;
        body += `🏦 الرصيد: ${balance.textContent}\n`;
        body += `📈 الدخل: ${incomeDisplay.textContent}\n`;
        body += `📉 المصروفات: ${expenseDisplay.textContent}\n`;
        body += `📋 عدد المعاملات: ${transactions.length}\n`;
        body += `📦 إجمالي القطع: ${transactions.reduce((acc, t) => acc + t.quantity, 0)}\n\n`;
        body += `═══════════════════════════\n`;
        body += `📋 جميع المعاملات:\n\n`;
        
        transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach((t, index) => {
                const type = t.category === 'salary' ? '📈 دخل' : '📉 مصروف';
                body += `${index + 1}. ${type} | ${t.date} | ${t.description}\n`;
                body += `   المبلغ: ${t.amount.toFixed(2)} ₴ | الكمية: ${t.quantity} | الفئة: ${t.category}\n\n`;
            });
        
        body += `---\n`;
        body += `تم الإرسال من تطبيق حاسب - متتبع النفقات الشخصية`;
    }
    
    // محاولة الإرسال عبر FormSubmit أولاً
    const emailData = { subject, body, to: TARGET_EMAIL };
    
    try {
        const sent = await sendEmailViaFormSubmit(emailData);
        if (sent) {
            showToast('✅ تم إرسال الإشعار إلى بريدك الإلكتروني!', 'success');
            return;
        }
    } catch (e) {
        console.log('FormSubmit failed, trying alternative...');
    }
    
    // إذا فشل FormSubmit، نعرض نافذة التقرير
    showNotificationAndCopy(emailData);
    showToast('📧 تم فتح نافذة التقرير - يمكنك إرساله يدوياً', 'info');
}

// ==========================================
// 🎨 عرض تنبيه منبثق (Toast)
// ==========================================
function showToast(message, type = 'success') {
    // إزالة التنبيه السابق
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-size: 16px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease-out;
        text-align: center;
        min-width: 300px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // إزالة بعد 4 ثواني
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// إضافة أنيميشن CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from { transform: translate(-50%, 100px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes slideDown {
        from { transform: translate(-50%, 0); opacity: 1; }
        to { transform: translate(-50%, 100px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ==========================================
// ✨ إضافة معاملة جديدة
// ==========================================
function addTransaction(e) {
    e.preventDefault();
    
    const qty = parseInt(quantity.value) || 1;
    const totalAmount = parseFloat(amount.value);
    
    const transaction = {
        id: generateID(),
        description: description.value,
        quantity: qty,
        amount: totalAmount,
        unitPrice: totalAmount / qty,
        category: category.value,
        date: date.value
    };
    
    transactions.push(transaction);
    updateLocalStorage();
    updateUI();
    
    // إرسال إشعار
    sendTransactionNotification(transaction, 'new_transaction');
    
    // إعادة تعيين النموذج
    form.reset();
    date.valueAsDate = new Date();
    quantity.value = 1;
    unitPrice.value = '';
    description.focus();
}

// حذف معاملة
function deleteTransaction(id) {
    if (confirm('هل أنت متأكد من حذف هذه المعاملة؟')) {
        transactions = transactions.filter(transaction => transaction.id !== id);
        updateLocalStorage();
        updateUI();
        showToast('🗑️ تم حذف المعاملة', 'info');
    }
}

// تحديث الواجهة
function updateUI() {
    const totalIncome = transactions
        .filter(item => item.category === 'salary')
        .reduce((acc, item) => acc + item.amount, 0);
    
    const totalExpense = transactions
        .filter(item => item.category !== 'salary')
        .reduce((acc, item) => acc + item.amount, 0);
    
    const totalBalance = totalIncome - totalExpense;
    const totalQuantity = transactions.reduce((acc, item) => acc + item.quantity, 0);
    
    balance.textContent = `${totalBalance.toFixed(2)} ₴`;
    incomeDisplay.textContent = `+${totalIncome.toFixed(2)} ₴`;
    expenseDisplay.textContent = `-${totalExpense.toFixed(2)} ₴`;
    transactionCountDisplay.textContent = transactions.length;
    totalQuantityDisplay.textContent = totalQuantity;
    
    const selectedCategory = filterCategory.value;
    const filteredTransactions = selectedCategory === 'all' 
        ? transactions 
        : transactions.filter(item => item.category === selectedCategory);
    
    displayTransactions(filteredTransactions);
    
    const filteredTotalAmount = filteredTransactions.reduce((acc, item) => {
        return item.category === 'salary' ? acc + item.amount : acc - item.amount;
    }, 0);
    const filteredQty = filteredTransactions.reduce((acc, item) => acc + item.quantity, 0);
    
    filteredTotal.textContent = `${filteredTotalAmount.toFixed(2)} ₴`;
    filteredQuantity.textContent = filteredQty;
    
    emptyState.style.display = filteredTransactions.length === 0 ? 'block' : 'none';
}

// عرض المعاملات
function displayTransactions(transactionsToShow) {
    transactionList.innerHTML = '';
    
    const categoryEmojis = {
        food: '🍔', transport: '🚗', utilities: '💡',
        entertainment: '🎮', health: '🏥', shopping: '🛍️',
        salary: '💼', other: '📦'
    };
    
    transactionsToShow
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(transaction => {
            const li = document.createElement('li');
            li.className = 'transaction-item';
            
            const isIncome = transaction.category === 'salary';
            const sign = isIncome ? '+' : '-';
            const amountClass = isIncome ? 'plus' : 'minus';
            
            li.innerHTML = `
                <div class="transaction-info">
                    <span class="transaction-description">
                        ${categoryEmojis[transaction.category] || '📦'} ${transaction.description}
                    </span>
                    <div class="transaction-details">
                        <span>📦 ${transaction.quantity} قطعة</span>
                        <span>💵 ${transaction.unitPrice.toFixed(2)} ₴ للوحدة</span>
                        <span class="transaction-category">${transaction.category}</span>
                    </div>
                    <span class="transaction-date">${formatDate(transaction.date)}</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <span class="transaction-amount ${amountClass}">
                        ${sign}${Math.abs(transaction.amount).toFixed(2)} ₴
                    </span>
                    <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">
                        🗑️ حذف
                    </button>
                </div>
            `;
            
            transactionList.appendChild(li);
        });
}

// تنسيق التاريخ
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-SA', options);
}

// تحديث localStorage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// تصدير CSV
function exportToCSV() {
    if (transactions.length === 0) {
        alert('لا توجد معاملات للتصدير');
        return;
    }
    
    let csv = '\uFEFFالتاريخ,الوصف,الفئة,الكمية,سعر الوحدة,المبلغ الإجمالي\n';
    transactions.forEach(transaction => {
        csv += `${transaction.date},${transaction.description},${transaction.category},${transaction.quantity},${transaction.unitPrice.toFixed(2)},${transaction.amount.toFixed(2)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `تقرير_النفقات_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('✅ تم تصدير التقرير بنجاح!', 'success');
}

// إرسال تقرير كامل
function sendFullReport() {
    if (transactions.length === 0) {
        alert('لا توجد معاملات لإرسالها');
        return;
    }
    sendTransactionNotification(null, 'full_report');
}

// مستمعي الأحداث
form.addEventListener('submit', addTransaction);
filterCategory.addEventListener('change', updateUI);
document.getElementById('export-btn').addEventListener('click', exportToCSV);
document.getElementById('send-email-btn').addEventListener('click', sendFullReport);

// التهيئة الأولية
updateUI();
calculateUnitPrice();

console.log('✅ تطبيق حاسب جاهز!');
console.log('📧 سيتم إرسال الإشعارات إلى:', TARGET_EMAIL);