const endpoint = "http://localhost:3000/products";

const $form = document.getElementById("form");
const $inputName = document.getElementById("product_name");
const $inputPrice = document.getElementById("product_price");
const $inputDescription = document.getElementById("product_description");
const $productList = document.getElementById("product-list");

let editingId = null;

// -- Handle form submission (create or update product)
$form.onsubmit = async (event) => {
  event.preventDefault();

  const rawName = $inputName.value.trim();
  const normalizedName = rawName.toLowerCase();

  const product = {
    name: rawName,
    price: Number($inputPrice.value),
    description: $inputDescription.value.trim()
  };

  if (!product.name || !product.price || !product.description) {
    alert("Todos los campos son obligatorios");
    return;
  }

  try {
    const allProducts = await fetch(endpoint).then(res => res.json());

    const duplicate = allProducts.find(p =>
      p.name.toLowerCase() === normalizedName &&
      p.id !== editingId
    );

    if (duplicate) {
      alert("Ya existe un producto con ese nombre en el inventario");
      return;
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${endpoint}/${editingId}` : endpoint;

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product)
    });

    if (!response.ok) throw new Error("Error al guardar el producto");

    $form.reset();
    editingId = null;
    loadProducts();
  } catch (error) {
    alert(error.message);
  }
};

// -- Load and display all products
async function loadProducts() {
  try {
    const response = await fetch(endpoint);
    const products = await response.json();

    $productList.innerHTML = "";

    products.forEach(product => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${product.name}</h3>
        <p><strong>Precio:</strong> $${product.price}</p>
        <p>${product.description}</p>
        <div class="btn-group">
          <button class="btn btn-primary edit-btn" data-id="${product.id}">Editar</button>
          <button class="btn btn-danger delete-btn" data-id="${product.id}">Eliminar</button>
        </div>
      `;
      $productList.appendChild(card);
    });

    attachEvents();
  } catch (error) {
    alert("No se pudo cargar el inventario");
  }
}

// -- Attach events to edit and delete buttons
function attachEvents() {
  document.querySelectorAll(".edit-btn").forEach(button => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;
      try {
        const response = await fetch(`${endpoint}/${id}`);
        const product = await response.json();

        $inputName.value = product.name;
        $inputPrice.value = product.price;
        $inputDescription.value = product.description;
        editingId = product.id;
      } catch (error) {
        alert("Error al cargar el producto");
      }
    });
  });

  document.querySelectorAll(".delete-btn").forEach(button => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;
      const confirmDelete = confirm("¿Eliminar este producto del inventario?");
      if (!confirmDelete) return;

      try {
        const response = await fetch(`${endpoint}/${id}`, {
          method: "DELETE"
        });
        if (!response.ok) throw new Error("Error al eliminar el producto");
        loadProducts();
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

// -- Initial load
loadProducts();
