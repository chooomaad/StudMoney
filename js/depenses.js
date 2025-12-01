document.addEventListener("DOMContentLoaded", () => {
  ensureSeed();
  initExpensesPage();
  loadTable();
});

let currentPage = 1;
const perPage = 6;

function initExpensesPage(){
  // Modal controls
  const modal = document.getElementById("modal");
  document.getElementById("openAdd").onclick = () => modal.classList.remove("hidden");
  document.getElementById("closeAdd").onclick =
    document.getElementById("cancel").onclick = () => modal.classList.add("hidden");

  document.getElementById("expenseForm").onsubmit = (e)=>{
    e.preventDefault();
    addExpense();
    modal.classList.add("hidden");
    loadTable();
  };

  document.getElementById("search").oninput = loadTable;
  document.getElementById("filterCategory").onchange = loadTable;
  document.getElementById("filterDate").onchange = loadTable;
}

function addExpense(){
  const amount = parseInt(amount.value);
  const category = category.value;
  const dateVal = date.value || formatDateISO(new Date());
  const desc = description.value || "(Aucune description)";
  
  const newExp = {
    id: cryptoRandomId(),
    title: desc,
    category,
    date: dateVal,
    amount,
    desc
  };

  const list = readExpenses() || [];
  list.unshift(newExp);
}