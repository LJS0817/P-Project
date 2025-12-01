let showPwd = false;

const passwordInput = document.getElementById('password');
function togglePassword(icon) {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text'; 
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
}

const form = document.getElementById('userForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData);
    try {
        const response = await fetch(form.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            const result = await response.json();

            console.log('회원가입 성공:', result);
            console.log('회원가입 성공:', result.reason);

            window.location.href = '/dashboard';
        } else {
            const errorData = await response.json();
            console.error('회원가입 실패:', errorData);
            console.log('회원가입 성공:', errorData.reason);
        }
    } catch (error) {
        console.error('네트워크 오류:', error);
    }
});