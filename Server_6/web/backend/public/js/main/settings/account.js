// 저장 버튼
const saveBtnAccount = document.getElementById('saveSettingsBtn');
const userName = document.querySelector('.topbar .profile p')
if (saveBtnAccount) {
    saveBtnAccount.addEventListener('click', (e) => {

        e.preventDefault();

        // account 페이지가 아니면 실행 방지
        const nameInput = document.getElementById('userName');
        const emailInput = document.getElementById('mail');

        if (!nameInput || !emailInput) return;

        window.openPopup(document.textData['setting_accountSavePopupTitle'], '', `<p>${document.textData['setting_accountSavePopupMsg']}<i class="fi fi-tr-user-pen"></i></p>`, () => {
            window.sendData('/dashboard/settings/update-account', 'POST', 
                (data) => {
                    userName.innerText = nameInput.value;
                },
                (data) => { },
                {
                    nickname: nameInput.value,
                    email: emailInput.value
                }
            )
        })
        // fetch('/dashboard/settings/update-account', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         nickname: nameInput.value,
        //         email: emailInput.value
        //     })
        // })
        // .then(res=>res.json())
        // .then(data => {
        //     if(data.success) {
        //         window.endLoad();
        //         // alert('회원 정보 수정됨');
        //         location.reload()
        //     } else {
        //         // alert('수정 실패');
        //     }
        // })
        // .catch(err => {
        //     // console.error(err);
        //     // alert('서버가 이상해용');
        //     window.showErrorMsg(err)
        // });
    });
}

// 계정 삭제 버튼
const deleteBtn = document.getElementById('deleteAccountBtn');

if(deleteBtn) {
    deleteBtn.addEventListener('click', (e) => {
        e.preventDefault();

        window.openPopup(document.textData['setting_accountDeletePopupTitle'], 'danger', `<p class='danger'>${document.textData['setting_accountDeletePopupMsg']}<i class="fi fi-tr-user-slash danger"></i>${document.textData['noReturn']}</p>`, 
            () => {
                window.sendData('/dashboard/settings/delete-account', 'POST',
                    (data) => {
                        location.href = '/auth/signin';
                    }
                )
            },
            () => {
                
            }
        );

        // window.openPopup('Delete your account', 'danger', `<p class='danger'>Are you sure you want to delete your account?<i class="fi fi-tr-user-slash danger"></i>You cannot undo this action.</p>`, () => {
        //     fetch('/dashboard/settings/delete-account', {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json'}
        //     })
        //     .then(res => res.json())
        //     .then(data => {
        //         if (data.success) {
        //             location.href = '/';
        //         } else {
        //             // alert('안지워졌어' + data.message);
        //         }
        //     })
        //     .catch(err => {
        //         window.showErrorMsg(err);
        //         // alert('서버가 이상해용');
        //     });
        // })
    });
}