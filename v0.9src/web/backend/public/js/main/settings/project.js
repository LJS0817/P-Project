function deleteAllProject() {
    window.openPopup(document.textData['setting_projectDeleteProjectButtonMsg'], 'danger', `<p>${document.textData['setting_projectDeleteProjectPopupMsg']}<i class="fi fi-tr-folder-xmark-circle danger"></i>${document.textData['noReturn']}</p>`, 
        () => {
            window.sendData('/dashboard/project/delete/all', 'GET')
        }
    )
    // window.openPopup('Delete all projects', 'danger', `<p>Are you sure you want to proceed<i class="fi fi-tr-folder-xmark-circle danger"></i>You can't undo this action</p>`, () => {
    //     fetch('/dashboard/project/delete/all', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' }
    //     })
    //         .then(res => res.json())
    //         .then(data => {
    //             if (data.success) {
    //                 window.endLoad();
    //             } else {
    //             }
    //         })
    //         .catch(err => {
    //             console.error(err);
    //         });
    // })
}

function deleteAllPage() {
    window.openPopup(document.textData['setting_projectDeletePageButtonMsg'], 'danger', `<p>${document.textData['setting_projectDeletePagePopupMsg']}<i class="fi fi-tr-folder-xmark-circle danger"></i>${document.textData['noReturn']}</p>`, () => {
        window.sendData('/dashboard/project/page/delete/all', 'GET')
    })
    // window.openPopup('Delete all pages', 'danger', `<p>Are you sure you want to proceed<i class="fi fi-tr-folder-xmark-circle danger"></i>You can't undo this action</p>`, () => {
    //     fetch('/dashboard/project/page/delete/all', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' }
    //     })
    //         .then(res => res.json())
    //         .then(data => {
    //             if (data.success) {
    //                 window.endLoad()
    //             } else {
    //                 // alert('안지워졌어' + data.message);
    //             }
    //         })
    //         .catch(err => {
    //             console.error(err);
    //             // alert('서버가 이상해용');
    //         });
    // })
}