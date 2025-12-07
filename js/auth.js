function obtenirCleUtilisateur(email) {
    return `utilisateur_${email}`;
}

function obtenirListeUtilisateurs() {
    const cleUsers = localStorage.getItem("utilisateurs_emails");
    return cleUsers ? JSON.parse(cleUsers) : [];
}

function enregistrerListeUtilisateurs(emails) {
    localStorage.setItem("utilisateurs_emails", JSON.stringify(emails));
}

document.addEventListener("DOMContentLoaded", () => {

    const formInscription = document.getElementById("form-inscription");

    if (formInscription) {

        formInscription.addEventListener("submit", (e) => {
            e.preventDefault();

            const nom = document.getElementById("champ-nom").value.trim();
            const email = document.getElementById("champ-email").value.trim();
            const mdp = document.getElementById("champ-mdp").value.trim();

            if (!nom || !email || !mdp) {
                alert("Tous les champs sont obligatoires.");
                return;
            }

            const utilisateurs = obtenirListeUtilisateurs();
            if (utilisateurs.includes(email)) {
                alert("Cet email est déjà utilisé.");
                return;
            }

            const nouvelUtilisateur = {
                nom: nom,
                email: email,
                mdp: mdp,
                depenses: [],
                budget: { montant: 0, seuil: 85 }
            };

            const cleUtilisateur = obtenirCleUtilisateur(email);
            localStorage.setItem(cleUtilisateur, JSON.stringify(nouvelUtilisateur));

            utilisateurs.push(email);
            enregistrerListeUtilisateurs(utilisateurs);

            alert("Compte créé avec succès !");
            window.location = "connexion.html";
        });
    }


    const formConnexion = document.getElementById("form-connexion");

    if (formConnexion) {

        formConnexion.addEventListener("submit", (e) => {
            e.preventDefault();

            const email = document.getElementById("champ-email").value.trim();
            const mdp = document.getElementById("champ-mdp").value.trim();

            if (!email || !mdp) {
                alert("Veuillez remplir tous les champs.");
                return;
            }

            const cleUtilisateur = obtenirCleUtilisateur(email);
            const utilisateur = localStorage.getItem(cleUtilisateur);

            if (!utilisateur) {
                alert("Email ou mot de passe incorrect.");
                return;
            }

            const user = JSON.parse(utilisateur);

            if (mdp === user.mdp) {
                localStorage.setItem("connecte", "true");
                localStorage.setItem("utilisateurActif", email);

                window.location = "index.html";

            } else {
                alert("Email ou mot de passe incorrect.");
            }

        });
    }

});
