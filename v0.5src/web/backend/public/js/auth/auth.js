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

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData);

    const submitBtn = form.querySelector(".btn-submit");
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = "Processing...";
    submitBtn.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
        result.reason.forEach((code) => {
          if (!form[formKeys[code]].classList.contains('error')) form[formKeys[code]].classList.add("error");
        });
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
