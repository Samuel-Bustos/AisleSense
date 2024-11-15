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
  modal.style.opacity = 1;
  setTimeout(() => (modal.style.opacity = 1), 50);
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
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

let currentPage = 1;
const itemsPerPage = 12;

document.addEventListener("DOMContentLoaded", () => {
  fetchItems(); // Fetch items on page load
});

// Event listener for the search button
function searchItems() {
  const searchText = searchInput.value;
  const selectedCategory = categoryFilter.value;
  console.log(
    "Search clicked with text:",
    searchText,
    "and category:",
    selectedCategory
  );
  currentPage = 1; // Reset to the first page on a new search
  fetchItems(currentPage, 12, searchText, selectedCategory);
}

// General fetch function for items with pagination, search, and category
async function fetchItems(
  page = currentPage,
  limit = itemsPerPage,
  search = "",
  category = ""
) {
  const url = new URL("/api/items", window.location.origin);
  const params = new URLSearchParams();
  const token = localStorage.getItem("token");

  params.append("page", page);
  params.append("limit", limit);
  if (search) params.append("search", search);
  if (category) params.append("category", category);

  url.search = params.toString();

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    displayItems(data.items); // Display fetched items
    updatePageNumber(page); // Update page number display
    togglePaginationButtons(data.totalItems); // Enable/disable pagination as needed
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
            <button onclick="showUpdateForm('${item._id}', '${item.name}', '${item.quantity}',  '${item.price}', '${item.category}','${item.description}')">Edit</button>
            <button onclick="deleteItem('${item._id}')">Delete</button>`;
    itemsList.appendChild(itemCard);
    itemsList.style.height = "auto";
  });
}

// Update page number in UI
function updatePageNumber(page) {
  currentPage = page;
  document.getElementById("pageNumber").innerText = `Page ${page}`;
}

// Reset page number to 1 for a new search/filter
function resetPageNumber(page) {
  currentPage = page;
  document.getElementById("pageNumber").innerText = `Page ${page}`;
}

// Toggle pagination buttons
function togglePaginationButtons(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Enable or disable 'Previous' and 'Next' buttons
  document.getElementById("prevPage").disabled = currentPage <= 1;
  document.getElementById("nextPage").disabled = currentPage >= totalPages;
}

// Pagination button events
document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    fetchItems(
      currentPage - 1,
      itemsPerPage,
      searchInput.value,
      categoryFilter.value
    );
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  fetchItems(
    currentPage + 1,
    itemsPerPage,
    searchInput.value,
    categoryFilter.value
  );
});

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
      fetchItems();
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

// Add new item
async function addItem() {
  const name = document.getElementById("newItemName").value;
  const quantity = document.getElementById("newItemQuantity").value;
  const price = document.getElementById("newItemPrice").value;
  const category = document.getElementById("newItemCategory").value;
  const description = document.getElementById("newItemDescription").value;
  const token = localStorage.getItem("token");

  const response = await fetch("/api/items", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, quantity, price, category, description }),
  });

  if (response.ok) {
    alert("Item added successfully!");
    fetchItems(); // Refresh item list
    document.getElementById("addForm").style.display = "none";
  } else {
    alert("Failed to add item.");
  }
}

// Show update form with item details
function showUpdateForm(id, name, quantity, price, category, description) {
  document.getElementById("updateForm").style.display = "block";
  document.getElementById("updateForm").setAttribute("data-id", id);
  document.getElementById("updateItemName").value = name;
  document.getElementById("updateItemQuantity").value = quantity;
  document.getElementById("updateItemPrice").value = price;
  document.getElementById("updateItemCategory").value = category;
  document.getElementById("updateItemDescription").value = description;
}

// Show add form with item details
function showAddForm() {
  document.getElementById("addForm").style.display = "block";
  document.getElementById("newItemName").value = "";
  document.getElementById("newItemQuantity").value = "";
  document.getElementById("newItemPrice").value = "";
  document.getElementById("newItemCategory").value = "";
  document.getElementById("newItemDescription").value = "";
}

// Update item
async function updateItem() {
  const id = document.getElementById("updateForm").getAttribute("data-id");
  const name = document.getElementById("updateItemName").value;
  const quantity = document.getElementById("updateItemQuantity").value;
  const price = document.getElementById("updateItemPrice").value;
  const category = document.getElementById("updateItemCategory").value;
  const description = document.getElementById("updateItemDescription").value;
  const token = localStorage.getItem("token");

  // Validate token
  if (!token) {
    alert("User  not authenticated.");
    return;
  }

  const response = await fetch(`/api/items/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, quantity, price, category, description }),
  });

  if (response.ok) {
    alert("Item updated successfully!");
    fetchItems(); // Refresh item list
    document.getElementById("updateForm").style.display = "none";
  } else {
    const errorResponse = await response.json(); // Get error response
    console.error("Failed to update item:", errorResponse);
    alert(`Failed to update item: ${errorResponse.message || "Unknown error"}`);
  }
}

// Delete item
async function deleteItem(id) {
  const token = localStorage.getItem("token");

  const response = await fetch(`/api/items/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    alert("Item deleted successfully!");
    fetchItems(); // Refresh item list
  } else {
    alert("Failed to delete item.");
  }
}
