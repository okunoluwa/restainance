// ========== DARK MODE FUNCTION ==========
function initDarkMode() {
    const darkModeBtn = document.getElementById('darkModeSidebarBtn');
    if (!darkModeBtn) return;
    
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    }
    
    darkModeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        darkModeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i> Light Mode' : '<i class="fas fa-moon"></i> Dark Mode';
        
        // Update chart colors when dark mode toggles
        updateChart();
    });
}

// ========== TRANSACTION FUNCTIONS ==========
function getTransactions() {
    return JSON.parse(localStorage.getItem("transactions")) || [];
}

function saveTransactions(transactions) {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function addTransaction(transaction) {
    let transactions = getTransactions();
    transaction.id = Date.now();
    transaction.dateAdded = new Date().toLocaleString();
    transactions.unshift(transaction);
    saveTransactions(transactions);
    renderFinance();
}

function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        let transactions = getTransactions();
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions(transactions);
        renderFinance();
        alert('Transaction deleted successfully!');
    }
}

function calculateTotals() {
    const transactions = getTransactions();
    let totalIncome = 0;
    let totalExpense = 0;
    
    transactions.forEach(t => {
        const amount = parseFloat(t.amount);
        if (t.type === 'income') {
            totalIncome += amount;
        } else {
            totalExpense += amount;
        }
    });
    
    return { 
        totalIncome, 
        totalExpense, 
        totalBalance: totalIncome - totalExpense 
    };
}

// ========== ESCAPE HTML ==========
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== CHART FUNCTION ==========
let financeChart = null;

function updateChart() {
    const transactions = getTransactions();
    const categories = {};
    
    transactions.forEach(t => {
        if (!categories[t.category]) {
            categories[t.category] = { income: 0, expense: 0 };
        }
        const amount = parseFloat(t.amount);
        if (t.type === 'income') {
            categories[t.category].income += amount;
        } else {
            categories[t.category].expense += amount;
        }
    });
    
    const labels = Object.keys(categories);
    const incomeData = labels.map(cat => categories[cat].income);
    const expenseData = labels.map(cat => categories[cat].expense);
    
    const ctx = document.getElementById('financeChart')?.getContext('2d');
    if (!ctx) return;
    
    if (financeChart) {
        financeChart.destroy();
    }
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#e0e0e0' : '#333';
    
    financeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income (R)',
                    data: incomeData,
                    backgroundColor: 'rgba(76, 175, 80, 0.7)',
                    borderColor: '#4caf50',
                    borderWidth: 1
                },
                {
                    label: 'Expenses (R)',
                    data: expenseData,
                    backgroundColor: 'rgba(220, 53, 69, 0.7)',
                    borderColor: '#dc3545',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: textColor }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount (R)',
                        color: textColor
                    },
                    ticks: { color: textColor }
                },
                x: {
                    ticks: { 
                        color: textColor,
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// ========== RENDER FINANCE ==========
function renderFinance() {
    let transactions = getTransactions();
    const filterType = document.getElementById('filterType')?.value || 'all';
    const searchTerm = document.getElementById('searchTransaction')?.value.toLowerCase() || '';
    
    // Apply filters
    if (filterType !== 'all') {
        transactions = transactions.filter(t => t.type === filterType);
    }
    
    if (searchTerm) {
        transactions = transactions.filter(t => 
            t.category.toLowerCase().includes(searchTerm) || 
            (t.description && t.description.toLowerCase().includes(searchTerm))
        );
    }
    
    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Update table
    const tbody = document.getElementById('transactionsList');
    if (tbody) {
        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;"><i class="fas fa-inbox"></i> No transactions found</td></tr>';
        } else {
            tbody.innerHTML = transactions.map(t => `
                <tr>
                    <td><i class="fas fa-calendar-alt"></i> ${t.date || 'N/A'}</td>
                    <td class="transaction-${t.type}">${t.type === 'income' ? '<i class="fas fa-arrow-up"></i> Income' : '<i class="fas fa-arrow-down"></i> Expense'}</td>
                    <td><i class="fas fa-folder"></i> ${escapeHtml(t.category)}</td>
                    <td><i class="fas fa-align-left"></i> ${escapeHtml(t.description || '-')}</td>
                    <td class="transaction-${t.type}">${t.type === 'income' ? '<i class="fas fa-plus-circle"></i>' : '<i class="fas fa-minus-circle"></i>'} R${parseFloat(t.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td><button class="delete-btn" onclick="deleteTransaction(${t.id})"><i class="fas fa-trash-alt"></i> Delete</button></td>
                </tr>
            `).join('');
        }
    }
    
    // Update summary cards
    const totals = calculateTotals();
    const balanceEl = document.getElementById('totalBalance');
    const incomeEl = document.getElementById('totalIncome');
    const expenseEl = document.getElementById('totalExpense');
    
    if (balanceEl) balanceEl.innerHTML = `R${totals.totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    if (incomeEl) incomeEl.innerHTML = `R${totals.totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    if (expenseEl) expenseEl.innerHTML = `R${totals.totalExpense.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    
    // Update chart
    updateChart();
}

// ========== EXPORT FINANCE TO PDF ==========
function exportFinanceToPDF() {
    const transactions = getTransactions();
    const totals = calculateTotals();
    
    let html = `<!DOCTYPE html>
    <html>
    <head>
        <title>Financial Report - Restainance</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 30px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #af954c; }
            .header h1 { color: #af954c; margin: 0; }
            .header p { color: #666; margin: 5px 0; }
            .summary { display: flex; justify-content: space-around; margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 10px; }
            .summary div { text-align: center; }
            .summary h3 { margin: 0; color: #666; }
            .summary p { font-size: 24px; font-weight: bold; margin: 10px 0 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f2f2f2; }
            .income { color: #4caf50; font-weight: bold; }
            .expense { color: #dc3545; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Restainance - Financial Report</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
        <div class="summary">
            <div><h3>Total Income</h3><p class="income">R${totals.totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}</p></div>
            <div><h3>Total Expenses</h3><p class="expense">R${totals.totalExpense.toLocaleString(undefined, {minimumFractionDigits: 2})}</p></div>
            <div><h3>Total Balance</h3><p>R${totals.totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</p></div>
        </div>
        <table>
            <thead>
                <tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th>Amount</th></tr>
            </thead>
            <tbody>
                ${transactions.map(t => `
                    <tr>
                        <td>${t.date || 'N/A'}</td>
                        <td class="${t.type}">${t.type === 'income' ? 'Income' : 'Expense'}</td>
                        <td>${escapeHtml(t.category)}</td>
                        <td>${escapeHtml(t.description || '-')}</td>
                        <td class="${t.type}">${t.type === 'income' ? '+' : '-'} R${parseFloat(t.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div class="footer">
            <p>Restainance - Student Residence Maintenance App</p>
        </div>
    </body>
    </html>`;
    
    const blob = new Blob([html], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `financial-report-${new Date().toISOString().split('T')[0]}.pdf`;
    link.click();
    alert('Financial report exported successfully!');
}

// ========== INITIALIZE PAGE ==========
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dark mode
    initDarkMode();
    
    // Set default date to today
    const dateInput = document.getElementById('transDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    
    // Add transaction button
    const addBtn = document.getElementById('addTransactionBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            const type = document.getElementById('transType').value;
            const category = document.getElementById('transCategory').value;
            const amount = parseFloat(document.getElementById('transAmount').value);
            const date = document.getElementById('transDate').value;
            const description = document.getElementById('transDescription').value.trim();
            
            // Validation
            if (!category) {
                alert('Please select a category');
                return;
            }
            if (isNaN(amount) || amount <= 0) {
                alert('Please enter a valid amount greater than 0');
                return;
            }
            if (!date) {
                alert('Please select a date');
                return;
            }
            
            // Add transaction
            addTransaction({
                type: type,
                category: category,
                amount: amount,
                date: date,
                description: description || ''
            });
            
            // Clear form (keep type and category for next entry)
            document.getElementById('transAmount').value = '';
            document.getElementById('transDescription').value = '';
            document.getElementById('transDate').value = new Date().toISOString().split('T')[0];
            
            alert('Transaction added successfully!');
        });
    }
    
    // Filter and search listeners
    const filterType = document.getElementById('filterType');
    const searchInput = document.getElementById('searchTransaction');
    const exportBtn = document.getElementById('exportFinancePDF');
    
    if (filterType) filterType.addEventListener('change', () => renderFinance());
    if (searchInput) searchInput.addEventListener('keyup', () => renderFinance());
    if (exportBtn) exportBtn.addEventListener('click', exportFinanceToPDF);
    
    // Initial render
    renderFinance();
});

// Make functions global for onclick
window.deleteTransaction = deleteTransaction;