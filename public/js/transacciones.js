document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('fincontrol_user')) {
        window.location.href = '/login.html';
        return;
    }

    const API_URL = '/api/transactions';
    let transactions = [];
    let currentFilter = '';

    const txTableBody = document.getElementById('txTableBody');
    const searchInput = document.getElementById('searchInputTx');
    
    // Totals elements
    const pageTotalIncome = document.getElementById('pageTotalIncome');
    const pageTotalExpenses = document.getElementById('pageTotalExpenses');
    const pageNetChange = document.getElementById('pageNetChange');
    const pageTxCount = document.getElementById('pageTxCount');

    const getIconForCategory = (categoria) => {
        const icons = {
            'Vivienda': 'home',
            'Comida': 'restaurant',
            'Entretenimiento': 'movie',
            'Tecnologia': 'devices',
            'Salario': 'payments',
            'Otros': 'category'
        };
        return icons[categoria] || 'shopping_bag';
    };

    const fetchTransactions = async () => {
        try {
            const res = await fetch(API_URL);
            transactions = await res.json();
            renderTable();
            updateTotals();
        } catch (error) {
            console.error('Error fetching transactions:', error);
            txTableBody.innerHTML = '<tr><td colspan="4" class="text-center py-6 text-error">Error al cargar datos</td></tr>';
        }
    };

    const updateTotals = () => {
        const ingresos = transactions.filter(t => t.tipo === 'ingreso').reduce((acc, t) => acc + t.monto, 0);
        const gastos = transactions.filter(t => t.tipo === 'gasto').reduce((acc, t) => acc + t.monto, 0);
        const balance = ingresos - gastos;

        if(pageTotalIncome) pageTotalIncome.textContent = `+$${ingresos.toFixed(2)}`;
        if(pageTotalExpenses) pageTotalExpenses.textContent = `-$${gastos.toFixed(2)}`;
        if(pageNetChange) {
            pageNetChange.textContent = `${balance >= 0 ? '+' : ''}$${balance.toFixed(2)}`;
            pageNetChange.className = `font-numeric-display text-h2 ${balance >= 0 ? 'text-on-surface' : 'text-error'}`;
        }
        if(pageTxCount) pageTxCount.textContent = `${transactions.length} TRANSACCIONES`;
    };

    const renderTable = () => {
        txTableBody.innerHTML = '';
        
        const filtered = transactions.filter(t => 
            t.descripcion.toLowerCase().includes(currentFilter.toLowerCase()) || 
            t.categoria.toLowerCase().includes(currentFilter.toLowerCase())
        );

        if (filtered.length === 0) {
            txTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-slate-500">No hay registros que coincidan.</td></tr>`;
            return;
        }

        filtered.forEach(t => {
            const isIncome = t.tipo === 'ingreso';
            const icon = getIconForCategory(t.categoria);
            const dateStr = new Date(t.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
            
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-50 transition-colors group';
            tr.innerHTML = `
                <td class="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant uppercase">${dateStr}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="h-8 w-8 rounded-full ${isIncome ? 'bg-secondary-container/20 text-secondary' : 'bg-slate-100 text-slate-500'} flex items-center justify-center">
                            <span class="material-symbols-outlined text-sm">${icon}</span>
                        </div>
                        <span class="font-body-md text-body-md font-medium text-on-surface">${t.descripcion}</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isIncome ? 'bg-secondary-container/30 text-on-secondary-container' : 'bg-slate-100 text-slate-800'}">
                        ${t.categoria}
                    </span>
                </td>
                <td class="px-6 py-4 text-right font-numeric-display font-semibold ${isIncome ? 'text-secondary' : 'text-error'}">
                    ${isIncome ? '+' : '-'}$${t.monto.toFixed(2)}
                </td>
                <td class="px-6 py-4 text-center">
                    <div class="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="editTransaction('${t._id}')" class="p-1 text-slate-400 hover:text-primary transition-colors">
                            <span class="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onclick="deleteTransaction('${t._id}')" class="p-1 text-slate-400 hover:text-error transition-colors">
                            <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                    </div>
                </td>
            `;
            txTableBody.appendChild(tr);
        });
    };

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentFilter = e.target.value;
            renderTable();
        });
    }

    // Event listener for Export CSV
    const btnExportCSV = document.getElementById('btnExportCSV');
    if (btnExportCSV) {
        btnExportCSV.addEventListener('click', () => {
            alert('Exportando a CSV... (Función en desarrollo)');
        });
    }

    // Modal Logic
    const transactionModal = document.getElementById('transactionModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const transactionForm = document.getElementById('transactionForm');
    
    const openModal = () => {
        transactionModal.classList.remove('hidden');
        transactionModal.classList.add('flex');
    };

    const closeModal = () => {
        transactionModal.classList.add('hidden');
        transactionModal.classList.remove('flex');
        transactionForm.reset();
        document.getElementById('transactionId').value = '';
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Edit Transaction
    window.editTransaction = (id) => {
        const t = transactions.find(tx => tx._id === id);
        if (!t) return;
        
        document.getElementById('transactionId').value = t._id;
        document.querySelector(`input[name="tipo"][value="${t.tipo}"]`).checked = true;
        document.getElementById('monto').value = t.monto;
        document.getElementById('categoria').value = t.categoria;
        document.getElementById('descripcion').value = t.descripcion;
        document.getElementById('fecha').value = t.fecha.split('T')[0];
        
        openModal();
    };

    // Delete Transaction
    window.deleteTransaction = async (id) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta transacción?')) return;
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            fetchTransactions();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Error al eliminar');
        }
    };

    // Submit Form (Only PUT since we only edit here, adding is in index.html, but we can support both)
    if (transactionForm) {
        transactionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const id = document.getElementById('transactionId').value;
            const tipo = document.querySelector('input[name="tipo"]:checked').value;
            const monto = parseFloat(document.getElementById('monto').value);
            const categoria = document.getElementById('categoria').value;
            const descripcion = document.getElementById('descripcion').value;
            const fecha = document.getElementById('fecha').value;

            const data = { tipo, monto, categoria, descripcion, fecha };

            try {
                if (id) {
                    await fetch(`${API_URL}/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                }
                closeModal();
                fetchTransactions();
            } catch (error) {
                console.error('Error saving transaction:', error);
                alert('Error al guardar la transacción');
            }
        });
    }

    // Logout Logic
    document.querySelectorAll('.nav-item, div, a').forEach(el => {
        el.addEventListener('click', (e) => {
            const text = e.currentTarget.textContent.trim();
            if(text.includes('Cerrar Sesión') || text.includes('Logout')) {
                localStorage.removeItem('fincontrol_user');
                window.location.href = '/login.html';
            }
        });
    });

    fetchTransactions();
});
