if (localStorage.getItem("connecte") !== "true") {
  window.location = "connexion.html";
}

if (typeof formatCurrency === "undefined") {
  function formatCurrency(n){
    return new Intl.NumberFormat('fr-FR', {
      style:'currency',
      currency:'XOF',
      maximumFractionDigits:0
    }).format(n || 0);
  }
}

if (typeof escapeHtml === "undefined") {
  function escapeHtml(str){
    return String(str||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#039;"}[m]));
  }
}

if (typeof dateLisible === "undefined") {
  function dateLisible(iso){
    return new Date(iso).toLocaleDateString();
  }
}

function lireBudgetUnified() {
  return JSON.parse(localStorage.getItem("donnees_budget"))
      || JSON.parse(localStorage.getItem("gb_budget_v1"))
      || { montant: 1000, seuil: 85 };
}


let graphique = null;

document.addEventListener("DOMContentLoaded", () => {
  if (typeof initialiserDonnees === "function") initialiserDonnees();
  initialiserInterface();
  mettreAJourTableauBord();
});

function initialiserInterface(){
  const fenetre = document.getElementById("fenetre");
  const ouvrir = document.getElementById("ouvrir-ajout");
  const fermer = document.getElementById("fermer-ajout");
  const annuler = document.getElementById("annuler");
  const form = document.getElementById("form-depense");

  if (ouvrir) ouvrir.addEventListener("click", () => fenetre.classList.remove("cache"));
  if (fermer) fermer.addEventListener("click", () => fenetre.classList.add("cache"));
  if (annuler) annuler.addEventListener("click", () => fenetre.classList.add("cache"));

  if (form) {
    form.addEventListener("submit", (e)=>{
      e.preventDefault();
      ajouterDepenseDepuisForm();
      form.reset();
      if (fenetre) fenetre.classList.add("cache");
    });
  }

  const dateInput = document.getElementById("champ-date");
  if (dateInput && !dateInput.value) dateInput.value = (typeof dateISO === "function") ? dateISO(new Date()) : new Date().toISOString().slice(0,10);
}

function ajouterDepenseDepuisForm(){
  const montantEl = document.getElementById("champ-montant");
  const categorieEl = document.getElementById("champ-categorie");
  const dateEl = document.getElementById("champ-date");
  const descEl = document.getElementById("champ-description");

  const montant = parseFloat(montantEl ? montantEl.value : 0);
  const categorie = categorieEl ? categorieEl.value : "";
  const dateVal = (dateEl && dateEl.value) ? dateEl.value : ((typeof dateISO === "function") ? dateISO(new Date()) : new Date().toISOString().slice(0,10));
  const desc = descEl ? descEl.value : "";

  if (!montant || !categorie) {
    alert("Veuillez renseigner le montant et la catégorie.");
    return;
  }

  const nouvelle = {
    id: (typeof idAleatoire === "function") ? idAleatoire() : Math.random().toString(36).slice(2,9),
    titre: desc || categorie,
    categorie,
    date: dateVal,
    montant: Math.round(montant*100)/100,
    description: desc
  };

  const liste = (typeof lireDepenses === "function") ? (lireDepenses() || []) : [];
  liste.unshift(nouvelle);

  if (typeof enregistrerDepenses === "function") {
    enregistrerDepenses(liste);
  } else {
    localStorage.setItem("donnees_depenses", JSON.stringify(liste));
  }

  mettreAJourTableauBord();
}

function mettreAJourTableauBord(){
  const liste = (typeof lireDepenses === "function") ? (lireDepenses() || []) : JSON.parse(localStorage.getItem("donnees_depenses") || "[]");

  const aujourdHui = new Date(); aujourdHui.setHours(0,0,0,0);
  const debutSemaine = new Date(aujourdHui); debutSemaine.setDate(aujourdHui.getDate() - (aujourdHui.getDay() || 7) + 1);
  const debutMois = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), 1);

  let totalJour = 0, totalSemaine = 0, totalMois = 0;
  const parCategorie = {};
  if (Array.isArray(window.CATEGORIES)) {
    window.CATEGORIES.forEach(c => parCategorie[c] = 0);
  }

  liste.forEach(item => {
    const d = new Date(item.date);
    d.setHours(0,0,0,0);
    if (+d === +aujourdHui) totalJour += (item.montant || 0);
    if (d >= debutSemaine && d <= aujourdHui) totalSemaine += (item.montant || 0);
    if (d >= debutMois && d <= aujourdHui) totalMois += (item.montant || 0);

    if (parCategorie[item.categorie] !== undefined) parCategorie[item.categorie] += (item.montant || 0);
    else parCategorie[item.categorie] = (parCategorie[item.categorie] || 0) + (item.montant || 0);
  });

  const elSolde = document.getElementById("solde");
  const elJour = document.getElementById("montant-jour");
  const elSemaine = document.getElementById("montant-semaine");
  const elMois = document.getElementById("montant-mois");

  if (elSolde || elJour || elSemaine || elMois) {
    const budget = lireBudgetUnified();
    const montantBudget = Number(budget.montant ?? budget.amount ?? 0);
    const seuil = budget.seuil || budget.threshold || 85;

    const depensesMois = totalMois;
    const solde = montantBudget - depensesMois;

    if (elSolde) elSolde.textContent = formatCurrency(solde);
    if (elJour) elJour.textContent = formatCurrency(totalJour);
    if (elSemaine) elSemaine.textContent = formatCurrency(totalSemaine);
    if (elMois) elMois.textContent = formatCurrency(totalMois);

    const pct = Math.min(100, Math.round((depensesMois / (montantBudget || 1)) * 100));
    const elRemplissage = document.getElementById("remplissage");
    if (elRemplissage) elRemplissage.style.width = pct + "%";

    const elTexteDepense = document.getElementById("texte-depense");
    const elTexteBudget = document.getElementById("texte-budget");
    if (elTexteDepense) elTexteDepense.textContent = formatCurrency(depensesMois);
    if (elTexteBudget) elTexteBudget.textContent = formatCurrency(montantBudget);

    if (pct >= seuil) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Alerte budget", { body: `Vous avez atteint ${pct}% de votre budget mensuel.` });
      } else {
        console.warn(`Alerte budget : ${pct}% utilisé.`);
      }
    }
  }

  afficherRecents(liste.slice(0,6));

  afficherGraphique(parCategorie);
}

function afficherRecents(items){
  const tbody = document.querySelector("#table-recentes tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  items.forEach(it=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(it.titre)}</td>
      <td>${escapeHtml(it.categorie)}</td>
      <td>${dateLisible(it.date)}</td>
      <td>${formatCurrency(it.montant)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function obtenirCouleurCategorie(categorie) {
  const couleurs = {
    'Alimentation': '#2ecc71',
    'Transport': '#1abc9c',
    'Logement': '#3498db',
    'Loisirs': '#9b59b6',
    'Autre': '#e67e22'
  };
  return couleurs[categorie] || '#95a5a6';
}

function afficherGraphique(parCategorie){
  const canvas = document.getElementById("graphique");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const labels = Object.keys(parCategorie);
  const data = labels.map(l => Math.round((parCategorie[l]||0) * 100) / 100);
  
  const backgroundColor = labels.map(label => obtenirCouleurCategorie(label));

  if (graphique) graphique.destroy();

  graphique = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColor,
        hoverOffset: 10,
        borderWidth: 0
      }]
    },
    options:{
      responsive: true,
      plugins:{
        legend:{ position: 'bottom', labels: { color: '#cfead6' } },
        tooltip: { bodyColor:'#fff', titleColor:'#fff', backgroundColor:'#0b2419' }
      },
      cutout: '65%'
    }
  });
}

document.querySelector(".deconnexion")?.addEventListener("click", () => {
    localStorage.removeItem("connecte");
    window.location = "connexion.html";
});
