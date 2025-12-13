let state = '';
const btn = document.getElementById('submitBtn');
const myForm = document.getElementById('userForm');

myForm.onsubmit = async (e) => {
    e.preventDefault();
    console.log(state);
    if(state == "done") {
        location.href = '/auth/signin';
        return;
    }

    if(checkEmpty()) return;
    
    const myForm = e.target;
    const formData = new FormData(myForm);
    const payload = Object.fromEntries(formData);

    if(payload['newPassword'] != '') payload['newPassword'] = await hashPassword(payload['newPassword']);
    try {
        const response = await fetch(myForm.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.success) {
            state = result.status;
            console.log(result.postUrl);
            if (state === 'verify') {
                btn.innerText = document.textData['verifyButtonMsg']
                myForm.children[3].classList.remove('disable');
                myForm.children[3].children[0].type = 'text';
                myForm.children[3].children[0].focus();
                myForm.action = result.postUrl;
            } else if (state === 'newPwd') {
                btn.innerText = document.textData['verifyNewPasswordButtonMsg']
                myForm.children[4].classList.remove('disable');
                myForm.children[4].children[0].type = 'text';
                myForm.children[4].children[0].focus();
                myForm.action = result.postUrl;
            }
        } else {
            const errorP = myForm.querySelector('p');
            if (errorP) {
                errorP.classList.add('active');
                // errorP.style.display = 'block'; // CSS로 숨겨뒀다면 보이게 처리
                // errorP.style.color = 'red'; // 필요하다면 색상 강조
            }
            // 명확한 피드백을 위해 alert도 함께 사용 가능
            // alert("입력하신 정보와 일치하는 회원을 찾을 수 없습니다.");
        }
    } catch (error) {
        console.error('Fetch error:', error);
        // alert("서버와 통신 중 오류가 발생했습니다.");
    }
}