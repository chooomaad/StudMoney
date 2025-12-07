function obtenirCleUtilisateur(email) {
    return `utilisateur_${email}`;
}

function obtenirUtilisateurConnecte() {
    const emailConnecte = localStorage.getItem("utilisateurActif");
    if (!emailConnecte) return null;
    
    const cle = obtenirCleUtilisateur(emailConnecte);
    const data = localStorage.getItem(cle);
    return data ? JSON.parse(data) : null;
}

function enregistrerUtilisateur(utilisateur) {
    if (!utilisateur || !utilisateur.email) return;
    
    const cle = obtenirCleUtilisateur(utilisateur.email);
    localStorage.setItem(cle, JSON.stringify(utilisateur));
}

function lireDepenses() {
    const user = obtenirUtilisateurConnecte();
    return user && user.depenses ? user.depenses : [];
}

function enregistrerDepenses(liste) {
    const user = obtenirUtilisateurConnecte();
    if (!user) return;
    
    user.depenses = liste;
    enregistrerUtilisateur(user);
}

function lireBudget() {
    const user = obtenirUtilisateurConnecte();
    if (!user || !user.budget) {
        return { montant: 0, seuil: 85 };
    }
    return user.budget;
}

function enregistrerBudget(budget) {
    const user = obtenirUtilisateurConnecte();
    if (!user) return;
    
    user.budget = budget;
    enregistrerUtilisateur(user);
}

const CLE_DEPENSES = "donnees_depenses";
const CLE_BUDGET = "donnees_budget";

const CATEGORIES = ["Alimentation", "Transport", "Logement", "Loisirs", "Autre"];

function initialiserDonnees(){
    return;
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
