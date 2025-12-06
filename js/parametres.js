if (localStorage.getItem("connecte") !== "true") {
    window.location = "connexion.html";
}


document.addEventListener("DOMContentLoaded", () => {
    chargerParametres();
    initialiserEcouteurs();
});


function chargerParametres() {
    const budget = lireBudget();

    const inputBudget = document.getElementById("champ-budget");
    if (inputBudget) {
        inputBudget.value = budget.montant || 50000;
    }

    const inputSeuil = document.getElementById("champ-seuil");
    if (inputSeuil) {
        inputSeuil.value = budget.seuil || 85;
        mettreAJourAffichageSeuil(budget.seuil || 85);
    }
}


function initialiserEcouteurs() {

    const inputSeuil = document.getElementById("champ-seuil");
    if (inputSeuil) {
        inputSeuil.addEventListener("input", (e) => {
            mettreAJourAffichageSeuil(e.target.value);
        });
    }

    const btnEnregistrer = document.getElementById("btn-enregistrer");
    if (btnEnregistrer) {
        btnEnregistrer.addEventListener("click", enregistrerParametres);
    }
}


function mettreAJourAffichageSeuil(valeur) {
    const affichageSeuil = document.getElementById("valeur-seuil");
    if (affichageSeuil) {
        affichageSeuil.textContent = valeur;
    }
}


function enregistrerParametres() {
    const inputBudget = document.getElementById("champ-budget");
    const inputSeuil = document.getElementById("champ-seuil");

    const montant = parseFloat(inputBudget?.value || 50000);
    const seuil = parseInt(inputSeuil?.value || 85);

    if (isNaN(montant) || montant <= 0) {
        alert("Le budget doit être un montant positif.");
        return;
    }

    if (isNaN(seuil) || seuil < 0 || seuil > 100) {
        alert("Le seuil doit être entre 0 et 100.");
        return;
    }

    const budget = {
        montant: montant,
        seuil: seuil
    };

    enregistrerBudget(budget);

    alert("Paramètres enregistrés !");

    if (typeof mettreAJourTableauBord === "function") {
        mettreAJourTableauBord();
    }
}
