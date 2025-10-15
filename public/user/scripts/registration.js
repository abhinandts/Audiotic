const form = document.getElementById("form");
const usernameInput = document.getElementById("userName");
const emailInput = document.getElementById("email");
const numberInput = document.getElementById("mNumber");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

function validateUserName() {
  console.log("validateUserName function....");
  let username = usernameInput.value.trim();
  let userNameErr = document.getElementById("userNameErr");
  let regex = /^[a-zA-Z]{4,12}$/;

  if (username.length === 0) {
    userNameErr.innerHTML = "Please enter Username (a-z/A-Z)";
    usernameInput.style.borderColor = "red";
    return false;
  } else if (!regex.test(username)) {
    userNameErr.innerHTML = "Username should have 4-12 characters";
    usernameInput.style.borderColor = "red";
    return false;
  } else {
    usernameInput.style.borderColor = "green";
    userNameErr.innerHTML = "";
    return true;
  }
}

function validateEmail() {
  let email = emailInput.value.trim();
  let emailErr = document.getElementById("emailErr");
  let regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  if (email.length === 0) {
    emailErr.innerHTML = "Please enter valid email";
    emailInput.style.borderColor = "red";
    return false;
  } else if (!regex.test(email)) {
    emailErr.innerHTML =
      "Please enter a valid email address from the domain gmail.com";
    emailInput.style.borderColor = "red";
    return false;
  } else {
    emailInput.style.borderColor = "green";
    emailErr.innerHTML = "";
    return true;
  }
}

function validateNumber() {
  let number = numberInput.value.trim();
  let err = document.getElementById("mNumberErr");
  let regex = /^[0-9]{10}$/;

  if (number.length === 0) {
    err.innerHTML = "please enter 10 digits.";
    numberInput.style.borderColor = "red";
    return false;
  } else if (!regex.test(number)) {
    err.innerHTML = "Please enter valid 10-digit phone number";
    numberInput.style.borderColor = "red";
    return false;
  } else {
    numberInput.style.borderColor = "green";
    err.innerHTML = "";
    return true;
  }
}

function passwordVisibility() {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    confirmPasswordInput.type = "text";
  } else {
    passwordInput.type = "password";
    confirmPasswordInput.type = "password";
  }
}

function checkPasswords() {
  let password = passwordInput.value.trim();
  let confirmPassword = confirmPasswordInput.value.trim();
  let err = document.getElementById("passwordErr");
  let regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  if (password.length < 8) {
    err.innerHTML = "Passwords should be at least 8 characters long";
    passwordInput.style.borderColor = "red";
    confirmPasswordInput.style.borderColor = "red";
    return false;
  } else if (password !== confirmPassword) {
    err.innerHTML = "Passwords don't match";
    passwordInput.style.borderColor = "red";
    confirmPasswordInput.style.borderColor = "red";
    return false;
  } else if (!regex.test(password)) {
    err.innerHTML =
      "Your password should include at least 8 characters, one letter, and one number.";
    passwordInput.style.borderColor = "red";
    confirmPasswordInput.style.borderColor = "red";
    return false;
  } else {
    passwordInput.style.borderColor = "green";
    confirmPasswordInput.style.borderColor = "green";
    err.innerHTML = "";
    return true;
  }
}

form.addEventListener("submit", function (event) {
  const isUsernameValid = validateUserName();
  const isEmailValid = validateEmail();
  const isNumberValid = validateNumber();
  const arePasswordsValid = checkPasswords();

  if (
    !isUsernameValid ||
    !isEmailValid ||
    !isNumberValid ||
    !arePasswordsValid
  ) {
    event.preventDefault();
  }
});
