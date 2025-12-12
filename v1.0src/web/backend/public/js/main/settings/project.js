// [기능] 모든 페이지 삭제 (Soft Delete)
function deleteAllPage() {
    // 다국어 메시지가 로드되지 않았을 경우를 대비한 기본값 처리
    const title = (document.textData && document.textData['setting_projectDeletePageButtonMsg']) || 'Delete Pages';
    const msgText = (document.textData && document.textData['setting_projectDeletePagePopupMsg']) || 'Are you sure you want to delete all pages?';
    const noReturn = (document.textData && document.textData['noReturn']) || 'This action cannot be undone.';

    const popupHtml = `<p>${msgText}<br><i class="fi fi-tr-folder-xmark-circle danger"></i> ${noReturn}</p>`;

    window.openPopup(title, 'danger', popupHtml, () => {
        // window.sendData가 내부적으로 fetch를 사용한다고 가정 (POST 방식)
        window.sendData('/dashboard/settings/delete-all-pages', 'POST', 
            (data) => {
                if(data.success) {
                    alert("모든 페이지가 삭제되었습니다.");
                    window.location.reload(); // 새로고침하여 반영
                } else {
                    alert("실패: " + (data.message || "오류 발생"));
                }
            },
            (err) => {
                console.error(err);
                alert("서버 통신 오류가 발생했습니다.");
            }
        );
    });
}

// [기능] 모든 프로젝트 삭제 (Soft Delete)
function deleteAllProject() {
    const title = (document.textData && document.textData['setting_projectDeleteProjectButtonMsg']) || 'Delete Projects';
    const msgText = (document.textData && document.textData['setting_projectDeleteProjectPopupMsg']) || 'Are you sure you want to delete all projects?';
    const noReturn = (document.textData && document.textData['noReturn']) || 'This action cannot be undone.';

    const popupHtml = `<p>${msgText}<br><i class="fi fi-tr-folder-xmark-circle danger"></i> ${noReturn}</p>`;

    window.openPopup(title, 'danger', popupHtml, () => {
        window.sendData('/dashboard/settings/delete-all-projects', 'POST',
            (data) => {
                if(data.success) {
                    alert("모든 프로젝트가 삭제되었습니다.");
                    window.location.reload();
                } else {
                    alert("실패: " + (data.message || "오류 발생"));
                }
            },
            (err) => {
                console.error(err);
                alert("서버 통신 오류가 발생했습니다.");
            }
        );
    });
}