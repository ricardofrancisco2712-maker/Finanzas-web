document.addEventListener('DOMContentLoaded', () => {
    // 1. Auth Check
    const username = localStorage.getItem('fincontrol_user');
    if (!username) {
        window.location.href = '/login.html';
        return;
    }

    // Populate username (using the logged in user)
    const nameInput = document.querySelector('input[type="text"]');
    if (nameInput) {
        // Retrieve saved config or default to username
        const savedName = localStorage.getItem('fincontrol_config_name');
        nameInput.value = savedName || username;
    }

    const emailInput = document.querySelector('input[type="email"]');
    if (emailInput) {
        const savedEmail = localStorage.getItem('fincontrol_config_email');
        if (savedEmail) emailInput.value = savedEmail;
    }

    // 2. Save Changes Logic
    const saveBtn = document.querySelector('button.bg-primary.text-on-primary');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const newName = nameInput ? nameInput.value : '';
            const newEmail = emailInput ? emailInput.value : '';
            
            localStorage.setItem('fincontrol_config_name', newName);
            localStorage.setItem('fincontrol_config_email', newEmail);
            
            // Simple visual feedback
            const originalText = saveBtn.textContent;
            saveBtn.textContent = '¡Guardado!';
            saveBtn.classList.add('bg-secondary');
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.classList.remove('bg-secondary');
            }, 2000);
        });
    }

    // 3. Logout Logic
    const setupLogout = () => {
        // Find any element containing "Cerrar Sesión" or "logout" icon
        const allDivs = document.querySelectorAll('div, a');
        allDivs.forEach(el => {
            const text = el.textContent.trim();
            // Checking if it's the logout button (using text or icon name)
            if(text.includes('Cerrar Sesión') || (el.querySelector && el.querySelector('.material-symbols-outlined') && el.querySelector('.material-symbols-outlined').textContent === 'logout')) {
                // Ensure we don't attach multiple events to parents
                if(el.classList.contains('nav-item') || el.closest('aside') || el.closest('nav')) {
                    el.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        localStorage.removeItem('fincontrol_user');
                        window.location.href = '/login.html';
                    });
                }
            }
        });
    };

    setupLogout();
});
