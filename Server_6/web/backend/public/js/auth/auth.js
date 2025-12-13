let showPwd = false;

const passwordInput = document.getElementById("password");
function togglePassword(icon) {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  } else {
    passwordInput.type = "password";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  }
}

const form = document.getElementById("userForm");
const messageBox = form.querySelector('p:nth-child(1)');

const formKeys = {
    'id': 'userid',
    'pwd': 'password',
    'mail': 'useremail',
    'name': 'username',
};

async function hashPassword(message) {
    if (window.crypto && window.crypto.subtle) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } 
    else if (window.CryptoJS) {
        return CryptoJS.SHA256(message).toString();
    } 
    else {
        console.warn("암호화 라이브러리를 찾을 수 없어 평문으로 전송합니다.");
        return message; 
    }
}

Object.values(formKeys).forEach((value) => {
    let ele = form[value];
    if(ele) {
        ele.addEventListener('input', (e) => {
            if(messageBox.classList.contains('active')) {
                // console.log(e);
                messageBox.classList.remove('active');
            }
            if(ele.classList.contains('error')) ele.classList.remove("error");
        })
    }
});

function checkEmpty() {
    let hasEmptyError = false;

    const inputs = form.querySelectorAll('input:not([type="submit"]):not([type="hidden"])');

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            hasEmptyError = true;
        }
    });

    if (hasEmptyError) {
        messageBox.textContent = document.textData['signEmptyError'];
        messageBox.classList.add('active');
        return true;
    }
    return false
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if(checkEmpty() || form.verifyCode) return;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData);

    const rememberCheckbox = document.getElementById('remember');
    payload.remember = rememberCheckbox ? rememberCheckbox.checked : false;
    
    // 2. [수정] 전송 전 비밀번호 필드가 있다면 해싱 적용
    // formKeys['pwd']가 실제 input name인 'password'와 매칭된다고 가정
    const pwdFieldName = formKeys['pwd']; 
    if (payload[pwdFieldName]) {
        try {
            // 사용자가 입력한 비밀번호를 SHA-256으로 변환하여 payload 덮어쓰기
            payload[pwdFieldName] = await hashPassword(payload[pwdFieldName]);
        } catch (err) {
            console.error("암호화 중 오류 발생:", err);
            return; // 오류 발생 시 전송 중단
        }
    }

    const submitBtn = form.querySelector(".btn-submit");
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = document.textData['popupProcessMsg'];
    submitBtn.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // 해싱된 비밀번호가 전송됨
      });

      const result = await response.json();

      if (response.ok) {
        if (result.message) {
          alert(result.message);
        }

        console.log("요청 성공:", result);
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        // console.error("요청 실패:", result);
        messageBox.textContent = result.msg;
        messageBox.classList.add('active');
        
        if (result.reason) {
            result.reason.forEach((code) => {
              if (form[formKeys[code]] && !form[formKeys[code]].classList.contains('error')) {
                  form[formKeys[code]].classList.add("error");
              }
            });
        }
        // alert(result.msg || "An error occurred.");
      }
    } catch (error) {
      console.error("네트워크 오류:", error);
      // alert("Network error occurred.");
    } finally {
      submitBtn.innerText = originalBtnText;
      submitBtn.disabled = false;
    }
  });
}