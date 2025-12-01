document.addEventListener("DOMContentLoaded", () => {
  ensureSeed();
  initHistory();
  loadHistory();
});

let currentPage = 1;
const perPage = 10;

function initHistory(){
  document.getElementById("search").oninput = loadHistory;
  document.getElementById("filterCategory").onchange = loadHistory;
  document.getElementById("filterDate").onchange = loadHistory;
  document.getElementById("sort").onchange = loadHistory;
}

function filteredList(){
  let list = readExpenses();

  const search = document.getElementById("search").value.toLowerCase();
  const cat = document.getElementById("filterCategory").value;
  const d = document.getElementById("filterDate").value;
  const sort = document.getElementById("sort").value;

  list = list.filter(e =>
    (search === "" || e.title.toLowerCase().includes(search)) &&
    (cat === "" || e.category === cat) &&
    (d === "" || e.date === d)
  );

  if(sort === "date-desc") list.sort((a,b)=> new Date(b.date)-new Date(a.date));
  if(sort === "date-asc")  list.sort((a,b)=> new Date(a.date)-new Date(b.date));
  if(sort === "amount-desc") list.sort((a,b)=> b.amount - a.amount);
  if(sort === "amount-asc")  list.sort((a,b)=> a.amount - b.amount);

  return list;
}

function loadHistory(){
  const list = filteredList();
  const tbody = document.querySelector("#historyTable tbody");
  tbody.innerHTML = "";

  const totalPages = Math.ceil(list.length / perPage);
  const pageData = list.slice((currentPage-1)*perPage, currentPage*perPage);

  pageData.forEach(e=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatDisplayDate(e.date)}</td>
      <td>${e.category}</td>
      <td>${escapeHtml(e.title)}</td>
      <td>${formatCurrency(e.amount)}</td>
      <td>
        <span class="action-btn edit">✏️</span>
        <span class="action-btn delete" onclick="deleteExp('${e.id}')">🗑️</span>
      </td>`;
    tbody.appendChild(tr);
  });

  renderPagination(totalPages);
}

function deleteExp(id){
  const list = readExpenses().filter(e=>e.id !== id);
  saveExpenses(list);
  loadHistory();
}

function renderPagination(totalPages){
  const pag = document.getElementById("pagination");
  pag.innerHTML = "";

  for(let i=1; i<=totalPages; i++){
    const div = document.createElement("div");
    div.className = "page-number " + (i===currentPage?"active":"");
    div.textContent = i;
    div.onclick = ()=>{ currentPage=i; loadHistory(); };
    pag.appendChild(div);
  }
}
