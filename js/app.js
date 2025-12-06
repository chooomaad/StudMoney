const CLE_DEPENSES = "donnees_depenses";
const CLE_BUDGET = "donnees_budget";

const CATEGORIES = ["Alimentation", "Transport", "Logement", "Loisirs", "Autre"];


function lireDepenses() {
    const brut = localStorage.getItem(CLE_DEPENSES);
    return brut ? JSON.parse(brut) : null;
}

function enregistrerDepenses(liste) {
    localStorage.setItem(CLE_DEPENSES, JSON.stringify(liste));
}

function lireBudget() {
    const brut = localStorage.getItem(CLE_BUDGET);
    return brut ? JSON.parse(brut) : { montant: 50000, seuil: 85 };
}

function enregistrerBudget(budget) {
    localStorage.setItem(CLE_BUDGET, JSON.stringify(budget));
}

function initialiserDonnees(){
    if (!lireDepenses()) {
        const maintenant = new Date();

        const exemples = [
            {
                id: idAleatoire(),
                titre: "Café",
                categorie: "Alimentation",
                date: dateISO(maintenant),
                montant: 500,
                description: "Café campus"
            },
            {
                id: idAleatoire(),
                titre: "Bus",
                categorie: "Transport",
                date: dateISO(maintenant),
                montant: 300,
                description: "Trajet retour"
            },
            {
                id: idAleatoire(),
                titre: "Livre",
                categorie: "Autre",
                date: dateISO(ajouterJours(maintenant, -1)),
                montant: 4500,
                description: "Manuel de cours"
            }
        ];

        enregistrerDepenses(exemples);
    }

    if (!localStorage.getItem(CLE_BUDGET)) {
        enregistrerBudget({ montant: 1000, seuil: 85 });
    }
}

function idAleatoire() {
    return Math.random().toString(36).slice(2, 9);
}

function dateISO(date) {
    return new Date(date).toISOString().slice(0, 10);
}

function dateLisible(iso) {
    return new Date(iso).toLocaleDateString();
}

function ajouterJours(date, nb) {
    const d = new Date(date);
    d.setDate(d.getDate() + nb);
    return d;
}
