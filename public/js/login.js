document.addEventListener('DOMContentLoaded', () => {
    // Si ya hay sesión, redirigir al panel
    if (localStorage.getItem('fincontrol_user')) {
        window.location.href = '/index.html';
        return;
    }

    const authForm = document.getElementById('authForm');
    const authError = document.getElementById('authError');
    const toggleModeBtn = document.getElementById('toggleModeBtn');
    const toggleText = document.getElementById('toggleText');
    const formSubtitle = document.getElementById('formSubtitle');
    const submitBtn = document.getElementById('submitBtn');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const passwordInput = document.getElementById('password');

    let isLoginMode = true;

    // Alternar modo Login / Registro
    toggleModeBtn.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        
        if (isLoginMode) {
            formSubtitle.textContent = 'Bienvenido de nuevo';
            submitBtn.innerHTML = 'Iniciar Sesión <span class="material-symbols-outlined">arrow_forward</span>';
            toggleText.textContent = '¿No tienes una cuenta?';
            toggleModeBtn.textContent = 'Regístrate';
        } else {
            formSubtitle.textContent = 'Crea tu cuenta en FinControl';
            submitBtn.innerHTML = 'Crear Cuenta <span class="material-symbols-outlined">person_add</span>';
            toggleText.textContent = '¿Ya tienes una cuenta?';
            toggleModeBtn.textContent = 'Inicia Sesión';
        }
        
        authError.classList.add('hidden');
    });

    // Mostrar/Ocultar contraseña
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordBtn.innerHTML = type === 'password' 
            ? '<span class="material-symbols-outlined">visibility_off</span>' 
            : '<span class="material-symbols-outlined">visibility</span>';
    });

    // Enviar formulario
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = passwordInput.value.trim();

        const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            let data;
            try {
                data = await res.json();
            } catch (err) {
                showError('Error del servidor. Asegúrate de reiniciar el servidor (Ctrl+C y luego npm start).');
                return;
            }

            if (!res.ok) {
                showError(data.message || 'Error en la autenticación');
                return;
            }

            // Éxito: Guardar sesión y redirigir
            localStorage.setItem('fincontrol_user', JSON.stringify(data.user));
            window.location.href = '/index.html';

        } catch (error) {
            console.error('Auth error:', error);
            showError('Error de conexión con el servidor');
        }
    });

    const showError = (message) => {
        authError.textContent = message;
        authError.classList.remove('hidden');
        setTimeout(() => {
            authError.classList.add('hidden');
        }, 3000);
    };
});
