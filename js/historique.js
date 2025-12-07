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
const elementsParPage = 8;


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

    document.getElementById("tri").addEventListener("change", (e) => {
        etatFiltres.tri = e.target.value;
        pageActuelle = 1;
        afficherTableau();
    });
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
    
    const tbody = document.querySelector("#table-historique tbody");
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
