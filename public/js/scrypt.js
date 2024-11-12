// JavaScript to handle frontend logic
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const searchBtn = document.getElementById("searchBtn");
const itemsList = document.querySelector(".items-list");

// Open and close modals
document.getElementById("loginBtn").onclick = () =>
  openModal("modal-container");
document.getElementById("registerBtn").onclick = () =>
  openModal("modal-container");

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = "flex";
  modal.style.opacity = 0;
  setTimeout(() => (modal.style.opacity = 1), 50);
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.opacity = 0;
  setTimeout(() => (modal.style.display = "none"), 300);
}
//Login and Register js
const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("modalContainer");

signUpButton.addEventListener("click", () => {
  container.classList.add("right-panel-active");
});

signInButton.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
});

//Buttons

searchBtn.addEventListener("click", () => {
  const searchText = searchInput.value;
  const selectedCategory = categoryFilter.value;
  fetchItems(searchText, selectedCategory);
});

// Fetch items from the API
async function fetchItems(search, category) {
  const url = new URL("/api/items", window.location.origin);
  const params = new URLSearchParams();

  if (search) params.append("search", search);
  if (category) params.append("category", category);

  url.search = params.toString();

  const response = await fetch(url);
  const data = await response.json();

  displayItems(data.items);
}

// Display items dynamically
function displayItems(items) {
  itemsList.innerHTML = "";
  items.forEach((item) => {
    const itemCard = document.createElement("div");
    itemCard.classList.add("item-card");

    itemCard.innerHTML = `
            <h3>${item.name}</h3>
            <p>Category: ${item.category}</p>
            <p>Quantity: ${item.quantity}</p>
            <p class="item-price">$${item.price}</p>
            <button class="btn">Details</button> `;
    itemsList.appendChild(itemCard);
  });
}

//Register user
async function registerUser() {
  const username = document.getElementById("registerUsername").value;
  const password = document.getElementById("registerPassword").value;

  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert(data.message);
      closeModal("registerModal");
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred");
  }
}

//Login user
async function loginUser() {
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Login successful!");
      localStorage.setItem("token", data.token); // Store token in local storage
      closeModal("loginModal");
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred");
  }
}
// Check login status on load
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (token) {
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("registerBtn").style.display = "none";
  }
});
