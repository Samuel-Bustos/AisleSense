// JavaScript to handle frontend logic
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const searchBtn = document.getElementById("searchBtn");
const itemsList = document.querySelector(".items-list");

// Open and close modals
registerBtn.addEventListener("click", () => {
  container.classList.add("right-panel-active");
  openModal("modal-container");
});
loginBtn.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
  openModal("modal-container");
});

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
  fetchItemsByFilter(searchText, selectedCategory);
});

// Fetch items from the API by category and search
async function fetchItemsByFilter(search, category) {
  const url = new URL("/api/items", window.location.origin);
  const params = new URLSearchParams();

  if (search) params.append("search", search);
  if (category) params.append("category", category);

  url.search = params.toString();

  const response = await fetch(url);
  const data = await response.json();

  displayItems(data.items);
  const page = 1;
  resetPageNumber(page);
}
//Fetch items from API at Loading page
document.addEventListener("DOMContentLoaded", () => {
  fetchItems(currentPage, itemsPerPage);
});

let currentPage = 1;
const itemsPerPage = 12;
async function fetchItems(page = 1, limit = itemsPerPage) {
  try {
    const response = await fetch(`/api/items?page=${page}&limit=${limit}`);
    const data = await response.json();
    displayItems(data.items);
    updatePageNumber(page);
    togglePaginationButtons(data.totalItems);
  } catch (error) {
    console.error("Error fetching items:", error);
  }
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
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  if (!username || !email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const response = await fetch("/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Registration successful!");
      localStorage.setItem("token", data.token); // Store token in local storage
      closeModal("modal-container");
      updateView(); // Update the main view for logged-in state
    } else {
      alert(data.error || "An error occurred during registration");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred");
  }
}

//Login user
async function loginUser() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch("/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Login successful!");
      localStorage.setItem("token", data.token); // Store token in local storage
      closeModal("modal-container");
      updateView();
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
    updateView();
  }
});
//Update view after login/register
function updateView() {
  document.getElementById("loginBtn").style.display = "none";
  document.getElementById("registerBtn").style.display = "none";
}

//Pagination functions
function updatePageNumber(page) {
  const pageNumber = document.getElementById("pageNumber");
  pageNumber.textContent = `Page ${page}`;
}
function togglePaginationButtons(totalItems) {
  const prevPageButton = document.getElementById("prevPage");
  const nextPageButton = document.getElementById("nextPage");

  prevPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = currentPage * itemsPerPage >= totalItems;
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    fetchItems(currentPage, itemsPerPage);
  }
}

function nextPage() {
  currentPage++;
  fetchItems(currentPage, itemsPerPage);
}

function resetPageNumber(page) {
  const pageNumber = document.getElementById("pageNumber");
  pageNumber.textContent = `Page ${page}`;
}
