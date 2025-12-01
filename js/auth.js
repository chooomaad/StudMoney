// Enregistrer un utilisateur
document.addEventListener("DOMContentLoaded", () => {

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.onsubmit = (e) => {
      e.preventDefault();

      const user = {
        name: name.value,
        email: email.value,
        password: password.value
      };

      localStorage.setItem("studUser", JSON.stringify(user));
      alert("Compte créé !");
      window.location = "login.html";
    };
  }

  // Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.onsubmit = (e) => {
      e.preventDefault();

      const user = JSON.parse(localStorage.getItem("studUser") || "{}");

      if (email.value === user.email && password.value === user.password) {
        localStorage.setItem("loggedIn", "true");
        window.location = "index.html";
      } else {
        alert("Email ou mot de passe incorrect");
      }
    };
  }

});
