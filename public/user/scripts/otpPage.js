let timmerSpan = document.getElementById("timmer");
const resendButton = document.getElementById("resend");
let interval;

function startTimer() {
  resendButton.disabled = true;
  let counter = 10;
  timmerSpan.innerHTML = counter;

  interval = setInterval(function () {
    counter--;
    timmerSpan.innerHTML = counter;
    if (counter <= 0) {
      clearInterval(interval);
      timmerSpan.innerHTML = "";
      resendButton.disabled = false;
    }
  }, 1000);
}

async function resendOtp() {
  const response = await fetch("/api/resendOtp", {
    method: "POST",
  });
  const result = await response.json();
  if (result.success) {
    document.querySelector(".mb-50").innerHTML = `<H4 style="color: green;">${result.message}</H4>`;
    startTimer();
  } else {
    document.querySelector(".mb-50").innerHTML = `<H4 style="color: crimson;">${result.message}</H4>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  startTimer();

  const otpInputs = document.querySelectorAll(".otp-input");
  const submitBtn = document.getElementById("submitOtpBtn");

  otpInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/[^0-9]/g, "");

      if (input.value && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
      validateAndEnableButton();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });

    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
      pasteData.split("").forEach((char, i) => {
        if (index + i < otpInputs.length) {
          otpInputs[index + i].value = char;
        }
      });
      validateAndEnableButton();
      otpInputs[
        Math.min(otpInputs.length - 1, index + pasteData.length)
      ].focus();
    });
  });

  function validateAndEnableButton() {
    const isAllFilled = [...otpInputs].every(
      (input) => input.value.length === 1
    );
    submitBtn.disabled = !isAllFilled;
  }
});

async function verifyOtp() {
  const otpInputs = document.querySelectorAll(".otp-input");
  const otpError = document.getElementById("otpError");

  const otp = [...otpInputs].map((input) => input.value).join("");

  otpError.textContent = "";

  if (otp.length !== 4) {
    otpError.textContent = "Please enter a complete 4-digit OTP.";
    return;
  }

  try {
    const response = await fetch("/verifyOtp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp }),
    });
    const result = await response.json();
    if (result.success) {
      window.location.href = result.redirectUrl;
    } else {
      otpError.textContent = result.message;
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    otpError.textContent = "An error occurred. Please try again.";
  }
}
