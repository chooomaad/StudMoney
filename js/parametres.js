document.addEventListener("DOMContentLoaded", () => {
  const b = readBudget();

  document.getElementById("budgetAmount").value = b.amount;
  document.getElementById("threshold").value = b.threshold;
  document.getElementById("thresholdValue").textContent = b.threshold;

  document.getElementById("threshold").oninput = function(){
    document.getElementById("thresholdValue").textContent = this.value;
  };

  document.getElementById("saveBtn").onclick = saveSettings;
});

function saveSettings(){
  const amount = parseInt(document.getElementById("budgetAmount").value);
  const thr = parseInt(document.getElementById("threshold").value);

  saveBudget({ amount, threshold: thr });

  alert("Paramètres enregistrés !");
}
