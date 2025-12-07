if (localStorage.getItem("connecte") !== "true") {
    window.location = "connexion.html";
}


const etatFiltres = {
    recherche: "",
    categorie: "",
    date: "",
    tri: "date-desc"
};

let depensesAffichees = [];
let pageActuelle = 1;
const elementsParPage = 6;


document.addEventListener("DOMContentLoaded", () => {
    initialiserDonnees();
    initialiserInterface();
    afficherTableau();
});


function initialiserInterface() {

    document.getElementById("recherche").addEventListener("input", (e) => {
        etatFiltres.recherche = e.target.value.toLowerCase();
        pageActuelle = 1;
        afficherTableau();
    });

    document.getElementById("filtre-categorie").addEventListener("change", (e) => {
        etatFiltres.categorie = e.target.value;
        pageActuelle = 1;
        afficherTableau();
    });

    document.getElementById("filtre-date").addEventListener("change", (e) => {
        etatFiltres.date = e.target.value;
        pageActuelle = 1;
        afficherTableau();
    });

    const btnAjouter = document.getElementById("ouvrir-ajout");
    if (btnAjouter) {
        btnAjouter.addEventListener("click", afficherModalAjoutDepense);
    }
}


function obtenirDepensesFiltrees() {
    let toutesDepenses = lireDepenses();
    
    if (!toutesDepenses || toutesDepenses.length === 0) {
        return [];
    }

    let filtered = toutesDepenses.filter(dep => {
        const correspondRech = 
            dep.titre.toLowerCase().includes(etatFiltres.recherche) ||
            (dep.description && dep.description.toLowerCase().includes(etatFiltres.recherche));

        if (!correspondRech && etatFiltres.recherche) return false;

        if (etatFiltres.categorie && dep.categorie !== etatFiltres.categorie) {
            return false;
        }

        if (etatFiltres.date) {
            const dateDepense = dep.date.split("T")[0];
            if (dateDepense !== etatFiltres.date) {
                return false;
            }
        }

        return true;
    });

    filtered.sort((a, b) => {
        switch (etatFiltres.tri) {
            case "date-asc":
                return new Date(a.date) - new Date(b.date);
            case "date-desc":
                return new Date(b.date) - new Date(a.date);
            case "montant-asc":
                return a.montant - b.montant;
            case "montant-desc":
                return b.montant - a.montant;
            default:
                return 0;
        }
    });

    return filtered;
}


function afficherTableau() {
    depensesAffichees = obtenirDepensesFiltrees();
    
    const tbody = document.querySelector("#table-depenses tbody");
    tbody.innerHTML = "";

    if (depensesAffichees.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="5" style="text-align: center; padding: 20px; color: rgba(255,255,255,0.5);">Aucune dépense trouvée</td>`;
        tbody.appendChild(tr);
        afficherPagination();
        return;
    }

    const debut = (pageActuelle - 1) * elementsParPage;
    const fin = debut + elementsParPage;
    const depensesPage = depensesAffichees.slice(debut, fin);

    depensesPage.forEach(dep => {
        const tr = document.createElement("tr");
        const badgeClass = obtenirClasseCategorie(dep.categorie);
        tr.innerHTML = `
            <td>${dateLisible(dep.date)}</td>
            <td><span class="badge-categorie ${badgeClass}">${escapeHtml(dep.categorie)}</span></td>
            <td>
                <div class="desc-cell">
                    <strong>${escapeHtml(dep.titre)}</strong>
                    ${dep.description ? `<br><small>${escapeHtml(dep.description)}</small>` : ""}
                </div>
            </td>
            <td class="montant-cell">${formatCurrency(dep.montant)}</td>
            <td class="actions-cell">
                <button class="action-modifier" onclick="modifierDepense('${dep.id}')">Modifier</button>
                <button class="action-supprimer" onclick="supprimerDepense('${dep.id}')">Supprimer</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    afficherPagination();
}


function afficherPagination() {
    const paginationDiv = document.getElementById("pagination");
    paginationDiv.innerHTML = "";

    const totalPages = Math.ceil(depensesAffichees.length / elementsParPage);

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.className = `page-numero ${i === pageActuelle ? "active" : ""}`;
        btn.textContent = i;
        btn.addEventListener("click", () => {
            pageActuelle = i;
            afficherTableau();
        });
        paginationDiv.appendChild(btn);
    }
}


function afficherModalAjoutDepense() {
    let modale = document.getElementById("modal-ajout-depense");
    
    if (!modale) {
        modale = document.createElement("div");
        modale.id = "modal-ajout-depense";
        modale.className = "modal-overlay";
        modale.innerHTML = `
            <div class="modal-contenu">
                <div class="modal-entete">
                    <h2>Ajouter une dépense</h2>
                    <button class="modal-fermer" aria-label="Fermer">&times;</button>
                </div>

                <form id="form-ajout-depense">
                    <div class="groupe-input">
                        <label for="input-titre">Titre *</label>
                        <input type="text" id="input-titre" required>
                    </div>

                    <div class="groupe-input">
                        <label for="input-description">Description</label>
                        <textarea id="input-description" rows="3"></textarea>
                    </div>

                    <div class="groupe-input">
                        <label for="input-categorie">Catégorie *</label>
                        <select id="input-categorie" required>
                            <option value="">-- Sélectionner --</option>
                            <option value="Alimentation">Alimentation</option>
                            <option value="Transport">Transport</option>
                            <option value="Logement">Logement</option>
                            <option value="Loisirs">Loisirs</option>
                            <option value="Autre">Autre</option>
                        </select>
                    </div>

                    <div class="groupe-input">
                        <label for="input-montant">Montant (FCFA) *</label>
                        <input type="number" id="input-montant" required min="1">
                    </div>

                    <div class="groupe-input">
                        <label for="input-date">Date *</label>
                        <input type="date" id="input-date" required>
                    </div>

                    <div class="modal-actions">
                        <button type="button" class="btn-annuler">Annuler</button>
                        <button type="submit" class="btn-valider">Ajouter</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modale);

        modale.querySelector(".modal-fermer").addEventListener("click", () => {
            modale.remove();
        });

        modale.querySelector(".btn-annuler").addEventListener("click", () => {
            modale.remove();
        });

        modale.addEventListener("click", (e) => {
            if (e.target === modale) {
                modale.remove();
            }
        });

        modale.querySelector("#form-ajout-depense").addEventListener("submit", (e) => {
            e.preventDefault();
            ajouterNouveauDepense();
            modale.remove();
        });
    }

    const dateInput = modale.querySelector("#input-date");
    const aujourd = dateISO(new Date());
    dateInput.value = aujourd;

    modale.style.display = "flex";
}


function ajouterNouveauDepense() {
    const titre = document.getElementById("input-titre").value.trim();
    const description = document.getElementById("input-description").value.trim();
    const categorie = document.getElementById("input-categorie").value;
    const montant = parseFloat(document.getElementById("input-montant").value);
    const date = document.getElementById("input-date").value;

    if (!titre || !categorie || !montant || !date) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
    }

    if (montant <= 0) {
        alert("Le montant doit être positif.");
        return;
    }

    const nouvelleDepense = {
        id: idAleatoire(),
        titre: titre,
        description: description,
        categorie: categorie,
        montant: montant,
        date: date
    };

    let depenses = lireDepenses() || [];
    depenses.push(nouvelleDepense);
    enregistrerDepenses(depenses);

    etatFiltres.recherche = "";
    etatFiltres.categorie = "";
    etatFiltres.date = "";
    pageActuelle = 1;

    document.getElementById("recherche").value = "";
    document.getElementById("filtre-categorie").value = "";
    document.getElementById("filtre-date").value = "";

    afficherTableau();

    alert("Dépense ajoutée avec succès !");
}


function formatCurrency(montant) {
    return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
        maximumFractionDigits: 0
    }).format(montant || 0);
}

function escapeHtml(str) {
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    };
    return String(str || "").replace(/[&<>"']/g, m => map[m]);
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

function obtenirClasseCategorie(categorie) {
    const classes = {
        "Alimentation": "badge-alimentation",
        "Transport": "badge-transport",
        "Logement": "badge-logement",
        "Loisirs": "badge-loisirs",
        "Autre": "badge-autre"
    };
    return classes[categorie] || "badge-autre";
}

function supprimerDepense(id) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) {
        return;
    }

    let depenses = lireDepenses() || [];
    depenses = depenses.filter(dep => dep.id !== id);
    enregistrerDepenses(depenses);

    pageActuelle = 1;
    afficherTableau();

    alert("Dépense supprimée avec succès !");
}

function modifierDepense(id) {
    let depenses = lireDepenses() || [];
    const depense = depenses.find(dep => dep.id === id);

    if (!depense) {
        alert("Dépense introuvable.");
        return;
    }

    const modale = document.createElement("div");
    modale.id = "modal-modifier-depense";
    modale.className = "modal-overlay";
    modale.innerHTML = `
        <div class="modal-contenu">
            <div class="modal-entete">
                <h2>Modifier une dépense</h2>
                <button class="modal-fermer" aria-label="Fermer">&times;</button>
            </div>

            <form id="form-modifier-depense">
                <div class="groupe-input">
                    <label for="mod-titre">Titre *</label>
                    <input type="text" id="mod-titre" value="${escapeHtml(depense.titre)}" required>
                </div>

                <div class="groupe-input">
                    <label for="mod-description">Description</label>
                    <textarea id="mod-description" rows="3">${escapeHtml(depense.description || "")}</textarea>
                </div>

                <div class="groupe-input">
                    <label for="mod-categorie">Catégorie *</label>
                    <select id="mod-categorie" required>
                        <option value="Alimentation" ${depense.categorie === "Alimentation" ? "selected" : ""}>Alimentation</option>
                        <option value="Transport" ${depense.categorie === "Transport" ? "selected" : ""}>Transport</option>
                        <option value="Logement" ${depense.categorie === "Logement" ? "selected" : ""}>Logement</option>
                        <option value="Loisirs" ${depense.categorie === "Loisirs" ? "selected" : ""}>Loisirs</option>
                        <option value="Autre" ${depense.categorie === "Autre" ? "selected" : ""}>Autre</option>
                    </select>
                </div>

                <div class="groupe-input">
                    <label for="mod-montant">Montant (FCFA) *</label>
                    <input type="number" id="mod-montant" value="${depense.montant}" required min="1">
                </div>

                <div class="groupe-input">
                    <label for="mod-date">Date *</label>
                    <input type="date" id="mod-date" value="${depense.date}" required>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-annuler">Annuler</button>
                    <button type="submit" class="btn-valider">Enregistrer</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modale);

    modale.querySelector(".modal-fermer").addEventListener("click", () => {
        modale.remove();
    });

    modale.querySelector(".btn-annuler").addEventListener("click", () => {
        modale.remove();
    });

    modale.addEventListener("click", (e) => {
        if (e.target === modale) {
            modale.remove();
        }
    });

    modale.querySelector("#form-modifier-depense").addEventListener("submit", (e) => {
        e.preventDefault();
        enregistrerModification(id);
        modale.remove();
    });

    modale.style.display = "flex";
}

function enregistrerModification(id) {
    const titre = document.getElementById("mod-titre").value.trim();
    const description = document.getElementById("mod-description").value.trim();
    const categorie = document.getElementById("mod-categorie").value;
    const montant = parseFloat(document.getElementById("mod-montant").value);
    const date = document.getElementById("mod-date").value;

    if (!titre || !categorie || !montant || !date) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
    }

    if (montant <= 0) {
        alert("Le montant doit être positif.");
        return;
    }

    let depenses = lireDepenses() || [];
    const index = depenses.findIndex(dep => dep.id === id);

    if (index !== -1) {
        depenses[index] = {
            id: id,
            titre: titre,
            description: description,
            categorie: categorie,
            montant: montant,
            date: date
        };
    }

    enregistrerDepenses(depenses);
    pageActuelle = 1;
    afficherTableau();

    alert("Dépense modifiée avec succès !");
}
