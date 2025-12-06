document.addEventListener("DOMContentLoaded", () => {

    const formInscription = document.getElementById("form-inscription");

    if (formInscription) {

        formInscription.addEventListener("submit", (e) => {
            e.preventDefault();

            const utilisateur = {
                nom: document.getElementById("champ-nom").value,
                email: document.getElementById("champ-email").value,
                mdp: document.getElementById("champ-mdp").value
            };

            localStorage.setItem("utilisateur", JSON.stringify(utilisateur));

            alert("Compte créé avec succès !");
            window.location = "connexion.html";
        });
    }


    const formConnexion = document.getElementById("form-connexion");

    if (formConnexion) {

        formConnexion.addEventListener("submit", (e) => {
            e.preventDefault();

            const utilisateur = JSON.parse(localStorage.getItem("utilisateur") || "{}");

            const email = document.getElementById("champ-email").value;
            const mdp = document.getElementById("champ-mdp").value;

            if (email === utilisateur.email && mdp === utilisateur.mdp) {

                localStorage.setItem("connecte", "true");

                window.location = "index.html";

            } else {
                alert("Email ou mot de passe incorrect.");
            }

        });
    }

});
