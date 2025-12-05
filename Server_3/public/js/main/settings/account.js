// 저장 버튼
const saveBtnAccount = document.getElementById('saveSettingsBtn');

if (saveBtnAccount) {
    saveBtnAccount.addEventListener('click', (e) => {

        e.preventDefault();

        // account 페이지가 아니면 실행 방지
        const nameInput = document.getElementById('userName');
        const emailInput = document.getElementById('mail');

        if (!nameInput || !emailInput) return; // 다른 탭이면 무시

        fetch('/dashboard/settings/update-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nickname: nameInput.value,
                email: emailInput.value
            })
        })
        .then(res=>res.json())
        .then(data => {
            if(data.success) {
                alert('회원 정보 수정됨');
                location.reload()
            } else {
                alert('수정 실패');
            }
        })
        .catch(err => {
            console.error(err);
            alert('서버가 이상해용');
        });
    });
}

// 계정 삭제 버튼
const deleteBtn = document.getElementById('deleteAccountBtn');

if(deleteBtn) {
    deleteBtn.addEventListener('click', (e) => {
        e.preventDefault(); // 일단 막아

        window.openPopup('Delete your account', 'danger', `<p>계정을 삭제하시겠습니까</p>`, () => {
            fetch('/dashboard/settings/delete-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'}
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    location.href = '/';
                } else {
                    // alert('안지워졌어' + data.message);
                }
            })
            .catch(err => {
                console.error(err);
                // alert('서버가 이상해용');
            });
        })
    });
}