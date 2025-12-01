if (localStorage.getItem("loggedIn") !== "true") {
   window.location = "connexion.html";
}

// tableau-bord.js — logique du dashboard + modal + chart
document.addEventListener('DOMContentLoaded', () => {
  ensureSeed();
  initUI();
  updateDashboard();
});

let chartInstance = null;

function initUI(){
  // modal controls
  const modal = document.getElementById('modal');
  const open = document.getElementById('openAdd');
  const close = document.getElementById('closeAdd');
  const cancel = document.getElementById('cancel');
  open.addEventListener('click', ()=> modal.classList.remove('hidden'));
  close.addEventListener('click', ()=> modal.classList.add('hidden'));
  cancel.addEventListener('click', ()=> modal.classList.add('hidden'));

  // submit form
  const form = document.getElementById('expenseForm');
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    addExpenseFromForm();
    form.reset();
    modal.classList.add('hidden');
  });

  // set default date today
  const dateInput = document.getElementById('date');
  dateInput.value = formatDateISO(new Date());
}

function addExpenseFromForm(){
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value || formatDateISO(new Date());
  const desc = document.getElementById('description').value || '';
  if(!amount || !category){
    alert('Veuillez renseigner le montant et la catégorie.');
    return;
  }
  const newExp = {
    id: cryptoRandomId(),
    title: desc || category,
    category,
    date,
    amount: Math.round(amount*100)/100,
    desc
  };
  const list = readExpenses() || [];
  list.unshift(newExp);
  saveExpenses(list);
  updateDashboard();
}

// calc totals and update UI
function updateDashboard(){
  const list = readExpenses() || [];
  // totals
  const today = new Date(); today.setHours(0,0,0,0);
  const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - (today.getDay()||7) + 1); // lundi
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  let todaySum=0, weekSum=0, monthSum=0;
  const catMap = {};
  CATEGORIES.forEach(c => catMap[c]=0);

  list.forEach(item=>{
    const d = new Date(item.date);
    d.setHours(0,0,0,0);
    if(+d === +today) todaySum += item.amount;
    if(d >= startOfWeek && d <= today) weekSum += item.amount;
    if(d >= startOfMonth && d <= today) monthSum += item.amount;
    if(catMap[item.category] !== undefined) catMap[item.category] += item.amount;
    else catMap['Autre'] = (catMap['Autre']||0) + item.amount;
  });

  document.getElementById('todayAmount').textContent = formatCurrency(todaySum);
  document.getElementById('weekAmount').textContent = formatCurrency(weekSum);
  document.getElementById('monthAmount').textContent = formatCurrency(monthSum);

  // recent table (last 6)
  renderRecent(list.slice(0,6));

  // chart
  renderChart(catMap);

  // budget progress
  const budget = readBudget();
  const spent = monthSum;
  const balance = budget.amount - spent;
  document.getElementById('balanceAmount').textContent = formatCurrency(balance);
  const pct = Math.min(100, Math.round((spent / (budget.amount || 1)) * 100));
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('spentText').textContent = formatCurrency(spent);
  document.getElementById('budgetText').textContent = formatCurrency(budget.amount);

  // alert if over threshold
  const threshold = budget.threshold || 85;
  if(pct >= threshold){
    // simple notification (peut être améliorée)
    if(Notification && Notification.permission === "granted"){
      new Notification("Alerte budget", { body:`Vous avez atteint ${pct}% de votre budget mensuel.` });
    } else {
      // petit badge visuel (ici alert simple)
      console.warn(`Alerte: ${pct}% du budget utilisé`);
    }
  }
}

function renderRecent(items){
  const tbody = document.querySelector('#recentTable tbody');
  tbody.innerHTML = '';
  items.forEach(it=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${escapeHtml(it.title)}</td>
      <td>${escapeHtml(it.category)}</td>
      <td>${formatDisplayDate(it.date)}</td>
      <td>${formatCurrency(it.amount)}</td>`;
    tbody.appendChild(tr);
  });
}



function renderChart(catMap){
  const ctx = document.getElementById('doughnutChart').getContext('2d');
  const labels = Object.keys(catMap);
  const data = labels.map(l => Math.round((catMap[l]||0) * 100) / 100);
  if(chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets:[{
        label: 'Dépenses',
        data,
        backgroundColor: [
          '#2ecc71','#27ae60','#1abc9c','#16a085','#95a5a6'
        ],
        hoverOffset: 8,
        borderWidth: 0
      }]
    },
    options:{
      responsive:true,
      plugins:{
        legend:{position:'bottom',labels:{color:'#cfead6'}},
        tooltip:{bodyColor:'#fff',titleColor:'#fff',backgroundColor:'#0b2419'}
      },
      cutout: '65%'
    }
  });
}

function formatCurrency(n){
  return new Intl.NumberFormat('fr-FR', {
    style:'currency',
    currency:'XOF',
    maximumFractionDigits:0
  }).format(n);
}


function escapeHtml(str){
  return String(str||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#039;"}[m]));
}

// ask notification permission once
if("Notification" in window){
  if(Notification.permission === "default"){
    Notification.requestPermission().then(()=>{/* noop */});
  }
}
