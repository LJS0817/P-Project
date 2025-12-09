let showPwd = false;

function togglePassword(pw, icon) {
    const input = document.getElementById(pw);

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
}


const form = document.getElementById('userForm');
const messageBox = form.querySelector('p:nth-child(1)');

const formKeys = {
    'id': 'userid',
    'pwd': 'password',
    'mail': 'useremail',
    'name': 'username',
};

Object.values(formKeys).forEach((value) => {
    let ele = form[value];
    if(ele) {
        ele.addEventListener('input', (e) => {
            if(messageBox.classList.contains('active')) {
                console.log(e);
                messageBox.classList.remove('active');
            }
            if(ele.classList.contains('error')) ele.classList.remove("error");
        })
    }
});

// form.addEventListener('input', (e) => {
// });

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

        console.log('회원가입 성공:', response);
        if (response.ok) {
            const result = await response.json();

            console.log('회원가입 성공:', result);
            // console.log('회원가입 성공:', result.reason);

            window.location.href = result.redirectUrl;
        } else {
            const errorData = await response.json();
            messageBox.textContent = errorData.msg;
            messageBox.classList.add('active');
            errorData.reason.forEach((code) => {
                if(!form[formKeys[code]].classList.contains('error')) form[formKeys[code]].classList.add("error");
            });
            // console.error('회원가입 실패:', errorData);
            // console.log('회원가입 성공:', errorData.reason);
        }
    } catch (error) {
        console.error('네트워크 오류:', error);
    }
});