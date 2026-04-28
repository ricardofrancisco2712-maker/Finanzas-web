document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('fincontrol_user')) {
        window.location.href = '/login.html';
        return;
    }

    // Referencias al DOM
    const transactionsList = document.getElementById('transactionsList');
    const totalBalanceEl = document.getElementById('totalBalance');
    const totalIncomeEl = document.getElementById('totalIncome');
    const totalExpensesEl = document.getElementById('totalExpenses');
    
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    const mobileAddBtn = document.getElementById('mobileAddBtn');
    const transactionModal = document.getElementById('transactionModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const transactionForm = document.getElementById('transactionForm');
    const modalTitle = document.getElementById('modalTitle');
    const searchInput = document.getElementById('searchInput');
    
    // Variables de estado
    let transactions = [];
    let currentFilter = '';
    const API_URL = '/api/transactions';

    // --- Cargar Transacciones ---
    const fetchTransactions = async () => {
        try {
            const res = await fetch(API_URL);
            transactions = await res.json();
            renderTransactions();
            updateDashboard();
        } catch (error) {
            console.error('Error fetching transactions:', error);
            alert('Hubo un error al cargar las transacciones');
        }
    };

    // --- Renderizar Transacciones ---
    const renderTransactions = () => {
        transactionsList.innerHTML = '';
        
        if (transactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="px-6 py-8 text-center text-slate-500">
                    <span class="material-symbols-outlined text-4xl mb-2">inbox</span>
                    <p>No hay transacciones registradas.</p>
                </div>
            `;
            return;
        }

        const filteredTransactions = transactions.filter(t => 
            t.descripcion.toLowerCase().includes(currentFilter.toLowerCase()) || 
            t.categoria.toLowerCase().includes(currentFilter.toLowerCase())
        );

        if (filteredTransactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="px-6 py-8 text-center text-slate-500">
                    <span class="material-symbols-outlined text-4xl mb-2">search_off</span>
                    <p>No se encontraron resultados para "${currentFilter}".</p>
                </div>
            `;
            return;
        }

        filteredTransactions.forEach(t => {
            const isIncome = t.tipo === 'ingreso';
            const icon = getIconForCategory(t.categoria);
            const formattedDate = new Date(t.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
            const amountClass = isIncome ? 'text-secondary' : 'text-slate-900';
            const amountPrefix = isIncome ? '+' : '-';
            
            const div = document.createElement('div');
            div.className = 'px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group relative';
            div.innerHTML = `
                <div class="flex items-center gap-4 cursor-pointer flex-1" onclick="editTransaction('${t._id}')">
                    <div class="w-10 h-10 rounded-full ${isIncome ? 'bg-secondary-container/30 text-secondary' : 'bg-slate-100 text-slate-600'} flex items-center justify-center group-hover:bg-white transition-colors">
                        <span class="material-symbols-outlined">${icon}</span>
                    </div>
                    <div>
                        <p class="text-body-md font-semibold text-slate-900">${t.descripcion}</p>
                        <p class="text-[12px] text-slate-400 font-label-md uppercase">${t.categoria} • ${formattedDate}</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <div class="text-right">
                        <p class="text-body-md font-bold ${amountClass}">${amountPrefix}$${t.monto.toFixed(2)}</p>
                        <p class="text-[12px] text-secondary font-label-md">Completado</p>
                    </div>
                    <button onclick="deleteTransaction('${t._id}')" class="p-2 text-slate-400 hover:text-error transition-colors rounded-full hover:bg-error/10">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            `;
            transactionsList.appendChild(div);
        });
    };

    // --- Actualizar Dashboard (Totales) ---
    const updateDashboard = () => {
        const ingresos = transactions.filter(t => t.tipo === 'ingreso').reduce((acc, t) => acc + t.monto, 0);
        const gastos = transactions.filter(t => t.tipo === 'gasto').reduce((acc, t) => acc + t.monto, 0);
        const balance = ingresos - gastos;

        totalIncomeEl.textContent = `$${ingresos.toFixed(2)}`;
        totalExpensesEl.textContent = `$${gastos.toFixed(2)}`;
        totalBalanceEl.textContent = `$${balance.toFixed(2)}`;
        
        // Actualizar contador de transacciones
        const txCounter = document.getElementById('txCounter');
        if (txCounter) txCounter.textContent = `(${transactions.length})`;
    };

    // --- Helpers ---
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

    // --- Modales y Formularios ---
    const openModal = (isEdit = false) => {
        modalTitle.textContent = isEdit ? 'Editar Transacción' : 'Añadir Transacción';
        transactionModal.classList.remove('hidden');
        transactionModal.classList.add('flex');
    };

    const closeModal = () => {
        transactionModal.classList.add('hidden');
        transactionModal.classList.remove('flex');
        transactionForm.reset();
        document.getElementById('transactionId').value = '';
    };

    addTransactionBtn.addEventListener('click', () => openModal(false));
    mobileAddBtn.addEventListener('click', () => openModal(false));
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Cerrar al clickear afuera
    transactionModal.addEventListener('click', (e) => {
        if (e.target === transactionModal) closeModal();
    });

    // --- Guardar (Crear o Editar) ---
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
                // Actualizar
                await fetch(`${API_URL}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } else {
                // Crear
                await fetch(API_URL, {
                    method: 'POST',
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

    // --- Eliminar ---
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

    // --- Editar ---
    window.editTransaction = (id) => {
        const t = transactions.find(tx => tx._id === id);
        if (!t) return;
        
        document.getElementById('transactionId').value = t._id;
        document.querySelector(`input[name="tipo"][value="${t.tipo}"]`).checked = true;
        document.getElementById('monto').value = t.monto;
        document.getElementById('categoria').value = t.categoria;
        document.getElementById('descripcion').value = t.descripcion;
        document.getElementById('fecha').value = t.fecha.split('T')[0];
        
        openModal(true);
    };

    // --- Filtrar ---
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentFilter = e.target.value;
            renderTransactions();
        });
    }

    // --- NUEVAS INTERACCIONES DE UI ---

    // 1. Sistema de Toasts (Notificaciones)
    const toastContainer = document.getElementById('toastContainer');
    const showToast = (message, icon = 'info') => {
        const toast = document.createElement('div');
        toast.className = 'bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 text-body-sm font-medium animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto';
        toast.innerHTML = `<span class="material-symbols-outlined text-[20px]">${icon}</span> ${message}`;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.replace('slide-in-from-bottom-5', 'slide-out-to-bottom-5');
            toast.classList.replace('fade-in', 'fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    // 2. Interacciones de Sidebar
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Remover estilos activos de todos
            navItems.forEach(nav => {
                nav.classList.remove('bg-slate-200/50', 'text-slate-900', 'font-semibold');
                nav.classList.add('text-slate-600', 'hover:text-slate-900', 'hover:bg-slate-100');
            });
            // Añadir estilos activos al clickeado
            const target = e.currentTarget;
            target.classList.remove('text-slate-600', 'hover:text-slate-900', 'hover:bg-slate-100');
            target.classList.add('bg-slate-200/50', 'text-slate-900', 'font-semibold');
            
            const sectionName = target.querySelector('span:nth-child(2)').textContent;
            if(sectionName !== 'Panel' && sectionName !== 'Transacciones') {
                showToast(`La sección "${sectionName}" estará disponible pronto.`, 'construction');
            }
        });
    });

    // 3. Descargar PDF
    const btnDownloadPDF = document.getElementById('btnDownloadPDF');
    if(btnDownloadPDF) {
        btnDownloadPDF.addEventListener('click', () => {
            showToast('Generando reporte en PDF...', 'picture_as_pdf');
            setTimeout(() => window.print(), 1000);
        });
    }

    // 4. Filtro de Gráficos (Diario, Semanal, Mensual)
    const chartFilterGroup = document.getElementById('chartFilterGroup');
    if(chartFilterGroup) {
        const buttons = chartFilterGroup.querySelectorAll('.chart-filter-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Quitar primary del resto
                buttons.forEach(b => {
                    b.classList.remove('bg-primary', 'text-white');
                    b.classList.add('bg-slate-100', 'text-slate-600');
                });
                // Añadir primary al actual
                e.target.classList.remove('bg-slate-100', 'text-slate-600');
                e.target.classList.add('bg-primary', 'text-white');
                
                // Animar barras de gráfica como simulación
                const bars = document.querySelectorAll('.chart-bar');
                bars.forEach(bar => {
                    const randomHeight = Math.floor(Math.random() * 60) + 30; // 30% a 90%
                    bar.style.height = `${randomHeight}%`;
                    const tooltip = bar.querySelector('.chart-tooltip');
                    if(tooltip) tooltip.textContent = `$${Math.floor(Math.random() * 3000)}`;
                });
            });
        });
    }

    // 5. Botones de Acción Extra
    document.getElementById('btnNotifications')?.addEventListener('click', () => showToast('No tienes nuevas notificaciones', 'notifications'));
    document.getElementById('btnHelp')?.addEventListener('click', () => showToast('Abriendo centro de ayuda...', 'help'));
    document.getElementById('btnProfileMobile')?.addEventListener('click', () => showToast('Abriendo perfil...', 'person'));
    document.getElementById('btnViewAllCats')?.addEventListener('click', () => showToast('Mostrando desglose detallado...', 'category'));
    document.getElementById('btnFilterTx')?.addEventListener('click', () => {
        const cat = prompt('Filtrar por categoría (ej. Comida, Vivienda, Salario):');
        if (cat) {
            currentFilter = cat;
            if(searchInput) searchInput.value = cat;
            renderTransactions();
            showToast(`Filtrado por: ${cat}`, 'filter_list');
        }
    });

    // Logout Logic
    document.querySelectorAll('.nav-item, div, a').forEach(el => {
        el.addEventListener('click', (e) => {
            const text = e.currentTarget.textContent.trim();
            if(text.includes('Cerrar Sesión') || text.includes('Logout')) {
                showToast('Cerrando sesión...', 'logout');
                setTimeout(() => {
                    localStorage.removeItem('fincontrol_user');
                    window.location.href = '/login.html';
                }, 1000);
            } else if (text.includes('Centro de Ayuda') || text.includes('Help Center')) {
                showToast('Redirigiendo a soporte técnico...', 'support');
            }
        });
    });

    // Mobile Bottom Nav
    document.querySelectorAll('nav.md\\:hidden > div:not(#mobileAddBtn)').forEach(div => {
        div.addEventListener('click', (e) => {
            const text = e.currentTarget.textContent.trim();
            showToast(`Navegando a ${text}...`, 'explore');
        });
    });

    // --- Inicializar ---
    fetchTransactions();
});
