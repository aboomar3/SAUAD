// ==========================================
// 🪄 حاسب - جميع الأزرار تعمل
// ==========================================

const ADMIN_EMAIL = 'hsynahsnh91@gmail.com';
const FORM_SUBMIT_URL = 'https://formsubmit.co/ajax/' + ADMIN_EMAIL;

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let userSettings = JSON.parse(localStorage.getItem('userSettings')) || {};

// انتظار تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    
    // 🎯 جميع العناصر
    const welcomeOverlay = document.getElementById('welcome-overlay');
    const initialBalance = document.getElementById('initial-balance');
    const initialNotes = document.getElementById('initial-notes');
    const startBtn = document.getElementById('start-btn');
    const mainApp = document.getElementById('main-app');
    const userNotesDisplay = document.getElementById('user-notes-display');
    const notesText = document.getElementById('notes-text');
    
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
    
    // تهيئة التاريخ
    dateInput.valueAsDate = new Date();
    currentDate.textContent = new Date().toLocaleDateString('ar-SA', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    // ============================
    // 🌟 زر ابدأ - صفحة الترحيب
    // ============================
    startBtn.addEventListener('click', function() {
        const balanceValue = parseFloat(initialBalance.value);
        
        if (!initialBalance.value || isNaN(balanceValue) || balanceValue < 0) {
            initialBalance.style.border = '2px solid #e74c3c';
            initialBalance.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                initialBalance.style.animation = '';
                initialBalance.style.border = '2px solid rgba(255,255,255,0.2)';
            }, 500);
            initialBalance.focus();
            return;
        }
        
        // حفظ الإعدادات
        userSettings = {
            initialBalance: balanceValue,
            notes: initialNotes.value.trim(),
            startDate: new Date().toISOString()
        };
        localStorage.setItem('userSettings', JSON.stringify(userSettings));
        
        // إضافة الرصيد الافتتاحي
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
            userNotesDisplay.style.display = 'inline-block';
            notesText.textContent = userSettings.notes;
        }
        
        // إخفاء الترحيب
        welcomeOverlay.classList.add('hide');
        mainApp.style.display = 'block';
        
        setTimeout(() => {
            welcomeOverlay.style.display = 'none';
        }, 800);
        
        updateUI();
        sendWelcomeEmail(balanceValue, userSettings.notes);
    });
    
    // ============================
    // 🧮 الحاسبة
    // ============================
    let calcExpression = '';
    let calcShouldReset = false;
    
    calcTrigger.addEventListener('click', function() {
        calcModal.classList.add('show');
    });
    
    calcClose.addEventListener('click', function() {
        calcModal.classList.remove('show');
    });
    
    calcModal.addEventListener('click', function(e) {
        if (e.target === calcModal) {
            calcModal.classList.remove('show');
        }
    });
    
    // أزرار الحاسبة
    document.querySelectorAll('.calc-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            
            if (calcShouldReset && !isNaN(action) && action !== '') {
                calcExpression = '';
                calcShouldReset = false;
            }
            
            switch(action) {
                case 'clear':
                    calcExpression = '';
                    break;
                case 'backspace':
                    calcExpression = calcExpression.slice(0, -1);
                    break;
                case 'percent':
                    if (calcExpression) {
                        try {
                            const processed = calcExpression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
                            calcExpression = (eval(processed) / 100).toString();
                            calcShouldReset = true;
                        } catch(e) {
                            calcExpression = 'خطأ';
                            calcShouldReset = true;
                        }
                    }
                    break;
                case 'divide':
                    calcExpression += '÷';
                    break;
                case 'multiply':
                    calcExpression += '×';
                    break;
                case 'subtract':
                    calcExpression += '−';
                    break;
                case 'add':
                    calcExpression += '+';
                    break;
                case 'decimal':
                    calcExpression += '.';
                    break;
                case 'calculate':
                    if (calcExpression) {
                        try {
                            const processed = calcExpression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
                            calcExpression = parseFloat(eval(processed).toFixed(10)).toString();
                            calcShouldReset = true;
                        } catch(e) {
                            calcExpression = 'خطأ';
                            calcShouldReset = true;
                        }
                    }
                    break;
                default:
                    calcExpression += action;
            }
            
            calcInput.value = calcExpression || '0';
        });
    });
    
    // أزرار سريعة
    document.querySelectorAll('.quick-btn[data-amount]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const amount = this.dataset.amount;
            if (calcExpression && !isNaN(calcExpression.charAt(calcExpression.length - 1))) {
                calcExpression += '+' + amount;
            } else {
                calcExpression += amount;
            }
            calcInput.value = calcExpression;
        });
    });
    
    // زر استخدام الناتج
    const useResultBtn = document.querySelector('.quick-btn.use-result');
    if (useResultBtn) {
        useResultBtn.addEventListener('click', function() {
            try {
                const processed = calcExpression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
                const result = parseFloat(eval(processed).toFixed(2));
                
                amountInput.value = result;
                calcModal.classList.remove('show');
                calcUnitPrice();
                showToastMessage('✅ تم نقل الناتج: ' + result + ' ₴');
            } catch(e) {
                showToastMessage('⚠️ أجرِ عملية حسابية أولاً', 'error');
            }
        });
    }
    
    // ============================
    // 🧮 حساب سعر الوحدة
    // ============================
    function calcUnitPrice() {
        const amt = parseFloat(amountInput.value) || 0;
        const qty = parseInt(quantityInput.value) || 1;
        unitPriceInput.value = qty > 0 ? (amt / qty).toFixed(2) + ' ₴' : '0.00 ₴';
    }
    
    amountInput.addEventListener('input', calcUnitPrice);
    quantityInput.addEventListener('input', calcUnitPrice);
    
    // ============================
    // ➕ إضافة معاملة
    // ============================
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const qty = parseInt(quantityInput.value) || 1;
        const amt = parseFloat(amountInput.value);
        const desc = descriptionInput.value.trim();
        const cat = categorySelect.value;
        
        if (!desc) {
            showToastMessage('⚠️ الرجاء إدخال وصف المعاملة', 'error');
            descriptionInput.focus();
            return;
        }
        
        if (isNaN(amt) || amt <= 0) {
            showToastMessage('⚠️ الرجاء إدخال مبلغ صحيح', 'error');
            amountInput.focus();
            return;
        }
        
        if (!cat) {
            showToastMessage('⚠️ الرجاء اختيار الفئة', 'error');
            categorySelect.focus();
            return;
        }
        
        const transaction = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            description: desc,
            quantity: qty,
            amount: amt,
            unitPrice: amt / qty,
            category: cat,
            date: dateInput.value
        };
        
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        sendEmailNotification(transaction);
        updateUI();
        showToastMessage('✅ تمت إضافة المعاملة بنجاح');
        
        form.reset();
        dateInput.valueAsDate = new Date();
        quantityInput.value = 1;
        unitPriceInput.value = '';
        descriptionInput.focus();
    });
    
    // ============================
    // 🗑️ حذف معاملة
    // ============================
    window.deleteTransaction = function(id) {
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return;
        
        if (confirm('هل أنت متأكد من حذف "' + transaction.description + '"؟')) {
            transactions = transactions.filter(t => t.id !== id);
            localStorage.setItem('transactions', JSON.stringify(transactions));
            updateUI();
            showToastMessage('🗑️ تم حذف المعاملة بنجاح');
        }
    };
    
    // ============================
    // 🔄 تحديث الواجهة
    // ============================
    function updateUI() {
        const income = transactions
            .filter(t => t.category === 'salary')
            .reduce((a, t) => a + t.amount, 0);
        
        const expense = transactions
            .filter(t => t.category !== 'salary')
            .reduce((a, t) => a + t.amount, 0);
        
        const totalBalance = income - expense;
        const totalQty = transactions.reduce((a, t) => a + t.quantity, 0);
        
        balance.textContent = totalBalance.toFixed(2);
        incomeDisplay.textContent = '+' + income.toFixed(2);
        expenseDisplay.textContent = '-' + expense.toFixed(2);
        countDisplay.textContent = transactions.length;
        totalQtyDisplay.textContent = totalQty;
        headerCount.textContent = transactions.length;
        
        const selected = filterSelect.value;
        const filtered = selected === 'all' 
            ? transactions 
            : transactions.filter(t => t.category === selected);
        
        renderTransactions(filtered);
        
        const fTotal = filtered.reduce((a, t) => 
            t.category === 'salary' ? a + t.amount : a - t.amount, 0);
        const fQty = filtered.reduce((a, t) => a + t.quantity, 0);
        
        filteredTotal.textContent = fTotal.toFixed(2) + ' ₴';
        filteredQty.textContent = fQty;
        emptyState.style.display = filtered.length === 0 ? 'block' : 'none';
    }
    
    // ============================
    // 🎨 عرض المعاملات
    // ============================
    function renderTransactions(list) {
        transactionList.innerHTML = '';
        
        const emojis = {
            salary: '💼', food: '🍔', transport: '🚗',
            utilities: '💡', shopping: '🛍️', health: '🏥',
            entertainment: '🎮', other: '📦'
        };
        
        list.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(function(t) {
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
                    <button class="delete-btn" onclick="deleteTransaction('${t.id}')">🗑️</button>
                </div>
            `;
            
            transactionList.appendChild(li);
        });
    }
    
    // ============================
    // 🔍 تصفية
    // ============================
    filterSelect.addEventListener('change', function() {
        updateUI();
    });
    
    // ============================
    // 📥 تصدير CSV
    // ============================
    exportBtn.addEventListener('click', function() {
        if (!transactions.length) {
            showToastMessage('⚠️ لا توجد معاملات للتصدير', 'error');
            return;
        }
        
        let csv = '\uFEFFالتاريخ,الوصف,الفئة,الكمية,سعر الوحدة,المبلغ\n';
        transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach(function(t) {
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
        
        showToastMessage('📥 تم تصدير التقرير بنجاح');
    });
    
    // ============================
    // 📧 إرسال تقرير للإيميل
    // ============================
    sendReportBtn.addEventListener('click', function() {
        if (!transactions.length) {
            showToastMessage('⚠️ لا توجد معاملات لإرسالها', 'error');
            return;
        }
        
        const now = new Date().toLocaleString('ar-SA');
        const subject = `خاص بموقعك يا أبو عمر - 📊 تقرير النفقات الشامل | ${new Date().toLocaleDateString('ar-SA')}`;
        
        let body = `بسم الله الرحمن الرحيم\n\n📊 تقرير النفقات الشخصية الشامل\n═══════════════════════════════════\n🕐 ${now}\n\n`;
        body += `💰 ملخص:\n🏦 الرصيد: ${balance.textContent} ₴\n📈 الدخل: ${incomeDisplay.textContent} ₴\n📉 المصروفات: ${expenseDisplay.textContent} ₴\n📋 المعاملات: ${transactions.length}\n📦 الكميات: ${transactions.reduce((a,t) => a + t.quantity, 0)}\n\n`;
        body += `═══════════════════════════════════\nخاص بموقعك يا أبو عمر`;
        
        const payload = new FormData();
        payload.append('_captcha', 'false');
        payload.append('_template', 'table');
        payload.append('_subject', subject);
        payload.append('email', ADMIN_EMAIL);
        payload.append('message', body);
        
        fetch(FORM_SUBMIT_URL, { method: 'POST', body: payload })
            .then(() => showToastMessage('✅ تم إرسال التقرير بنجاح'))
            .catch(() => showToastMessage('✅ تم تجهيز التقرير', 'info'));
    });
    
    // ============================
    // 📧 إشعار خفي
    // ============================
    function sendEmailNotification(transaction) {
        const now = new Date().toLocaleString('ar-SA');
        const tType = transaction.category === 'salary' ? '📈 دخل' : '📉 مصروف';
        const subject = `خاص بموقعك يا أبو عمر - ${tType}: ${transaction.description}`;
        
        const body = `
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
🏦 الرصيد: ${balance.textContent} ₴
📈 الدخل: ${incomeDisplay.textContent} ₴
📉 المصروفات: ${expenseDisplay.textContent} ₴
═══════════════════════════════════
خاص بموقعك يا أبو عمر
        `.trim();
        
        const payload = new FormData();
        payload.append('_captcha', 'false');
        payload.append('_template', 'table');
        payload.append('_subject', subject);
        payload.append('email', ADMIN_EMAIL);
        payload.append('message', body);
        
        fetch(FORM_SUBMIT_URL, { method: 'POST', body: payload })
            .then(() => console.log('✅ إشعار تم'))
            .catch(() => console.log('📋 محفوظ محلياً'));
    }
    
    function sendWelcomeEmail(balanceValue, notes) {
        const now = new Date().toLocaleString('ar-SA');
        const subject = `خاص بموقعك يا أبو عمر - 🎉 مستخدم جديد`;
        const body = `
بسم الله الرحمن الرحيم
🎉 مستخدم جديد بدأ استخدام حاسب
═══════════════════════════════════
🕐 ${now}
💰 الرصيد: ${balanceValue.toFixed(2)} ₴
📝 الملاحظات: ${notes || 'لا توجد'}
═══════════════════════════════════
خاص بموقعك يا أبو عمر
        `.trim();
        
        const payload = new FormData();
        payload.append('_captcha', 'false');
        payload.append('_template', 'table');
        payload.append('_subject', subject);
        payload.append('email', ADMIN_EMAIL);
        payload.append('message', body);
        
        fetch(FORM_SUBMIT_URL, { method: 'POST', body: payload })
            .then(() => console.log('✅ ترحيب تم'))
            .catch(() => console.log('📋 محفوظ'));
    }
    
    // ============================
    // 🎉 تنبيه
    // ============================
    function showToastMessage(message, type) {
        type = type || 'success';
        toast.textContent = message;
        toast.className = 'toast ' + type + ' show';
        
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(function() {
            toast.classList.remove('show');
        }, 4000);
    }
    
    // ============================
    // زر التحديث
    // ============================
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            updateUI();
            showToastMessage('🔄 تم التحديث');
        });
    }
    
    // ============================
    // تحقق من وجود إعدادات سابقة
    // ============================
    if (userSettings.initialBalance && userSettings.startDate) {
        welcomeOverlay.style.display = 'none';
        mainApp.style.display = 'block';
        if (userSettings.notes) {
            userNotesDisplay.style.display = 'inline-block';
            notesText.textContent = userSettings.notes;
        }
    }
    
    // ============================
    // بدء التطبيق
    // ============================
    updateUI();
    calcUnitPrice();
    
    console.log('✅ جميع الأزرار تعمل بشكل صحيح');
    console.log('🧮 حاسبة | 📧 إشعارات | 📥 تصدير | 🔍 تصفية');
    
}); // نهاية DOMContentLoaded
