// app.js — fonctions globales (LocalStorage, utilitaires)
const STORAGE_KEY = 'gb_expenses_v1';
const STORAGE_BUDGET = 'gb_budget_v1';

const CATEGORIES = ['Alimentation','Transport','Logement','Loisirs','Autre'];

function readExpenses(){
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveExpenses(list){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function readBudget(){
  const raw = localStorage.getItem(STORAGE_BUDGET);
  return raw ? JSON.parse(raw) : { amount:50000, period:'monthly', threshold:85 };
}

function saveBudget(b){
  localStorage.setItem(STORAGE_BUDGET, JSON.stringify(b));
}

// si pas de données => seed
function ensureSeed(){
  if(!readExpenses()){
    const now = new Date();
    const sample = [
      {id:cryptoRandomId(),title:'Café',category:'Alimentation',date:formatDateISO(now),amount:5.00,desc:'Café campus'},
      {id:cryptoRandomId(),title:'Bus',category:'Transport',date:formatDateISO(now),amount:2.5,desc:'Bus retour'},
      {id:cryptoRandomId(),title:'Livre',category:'Autre',date:formatDateISO(addDays(now,-1)),amount:45.00,desc:'Manuel cours'}
    ];
    saveExpenses(sample);
  }
  if(!localStorage.getItem(STORAGE_BUDGET)){
    saveBudget({ amount:1000, period:'monthly', threshold:85 });
  }
}

function cryptoRandomId(){
  return Math.random().toString(36).slice(2,9);
}

function formatDateISO(d){
  const date = new Date(d);
  return date.toISOString().slice(0,10);
}

// parse ISO to readable
function formatDisplayDate(iso){
  const d = new Date(iso);
  return d.toLocaleDateString();
}

function addDays(date, days){
  const d = new Date(date);
  d.setDate(d.getDate()+days);
  return d;
}
