const fs = require("fs");
const { nanoid } = require("nanoid");

const inventoryFile = "inventory.json";
const cartFile = "cart.json";

// Helpers
const pricer = (input) =>
  (input / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

// Read and write functions
function readInventory() {
  try {
    const data = fs.readFileSync(inventoryFile, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading inventory file:", err);
    return [];
  }
}

function saveInventory(data) {
  try {
    fs.writeFileSync(inventoryFile, JSON.stringify(data, null, 2));
    console.log("Inventory saved successfully.");
  } catch (err) {
    console.error("Error saving inventory file:", err);
  }
}

function readCart() {
  try {
    const data = fs.readFileSync(cartFile, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading cart file:", err);
    return [];
  }
}

function saveCart(data) {
  try {
    fs.writeFileSync(cartFile, JSON.stringify(data, null, 2));
    console.log("Cart saved successfully.");
  } catch (err) {
    console.error("Error saving cart file:", err);
  }
}

// Inventory modifiers
function add(name, priceInCents, inStock, category) {
  const inventory = readInventory();
  const newItem = {
    id: nanoid(),
    name,
    priceInCents: parseInt(priceInCents),
    inStock: inStock === "true",
    category,
  };
  inventory.push(newItem);
  saveInventory(inventory);
}

function list() {
  const inventory = readInventory();
  inventory.forEach((item) => {
    console.log(
      `${item.name} -- Category: ${item.category} -- Price:${pricer(
        item.priceInCents
      )} -- ${item.inStock ? "In stock" : "Not in stock"} -- id: ${item.id}`
    );
  });
}

function view(id) {
  const inventory = readInventory();
  const item = inventory.find((item) => item.id === id);
  if (item) {
    console.log(`Name: ${item.name}`);
    console.log(`Price: ${pricer(item.priceInCents)}`);
    console.log(`In stock: ${item.inStock}`);
    console.log(`Category: ${item.category}`);
  } else {
    console.log("Item not found.");
  }
}

function update(id, name, priceInCents, inStock, category) {
  const inventory = readInventory();
  const item = inventory.find((item) => item.id === id);
  if (item) {
    item.name = name;
    item.priceInCents = parseInt(priceInCents);
    item.inStock = inStock === "true";
    item.category = category;
    saveInventory(inventory);
  } else {
    console.log("Item not found.");
  }
}

function remove(id) {
  const inventory = readInventory();
  const result = inventory.filter((item) => item.id !== id);
  if (result.length < inventory.length) {
    saveInventory(result);
  } else {
    console.log("Item not found.");
  }
}

// Cart functions
function addToCart(id, quantity) {
  const inventory = readInventory();
  const item = inventory.find((item) => item.id === id);
  if (!item) {
    console.log("Item not found.");
    return;
  }

  const cart = readCart();
  const cartItem = cart.find((item) => item.id === id);

  if (cartItem) {
    cartItem.quantity += parseInt(quantity);
  } else {
    cart.push({
      ...item,
      quantity: parseInt(quantity),
    });
  }

  saveCart(cart);
}

function viewCart() {
  const cart = readCart();
  if (cart.length === 0) {
    console.log("Cart is empty.");
    return;
  }

  let total = 0;
  cart.forEach((item) => {
    const itemTotal = item.priceInCents * item.quantity;
    total += itemTotal;
    console.log(
      `${item.name} -- ${item.quantity} x ${pricer(
        item.priceInCents
      )} = ${pricer(itemTotal)}`
    );
  });
  console.log(`Total: ${pricer(total)}`);
}

function cancelCart() {
  saveCart([]);
  console.log("Cart has been emptied.");
}

const args = process.argv.slice(2);

switch (process.argv[2]) {
  case "add":
    add(args[1], args[2], args[3], args[4]);
    break;
  case "list":
    list();
    break;
  case "view":
    view(args[1]);
    break;
  case "update":
    update(args[1], args[2], args[3], args[4], args[5]);
    break;
  case "remove":
    remove(args[1]);
    break;
  case "addToCart":
    addToCart(args[1], args[2]);
    break;
  case "viewCart":
    viewCart();
    break;
  case "cancelCart":
    cancelCart();
    break;
  default:
    console.log(
      "Invalid command. Use node index.js add, list, view, update, remove, addToCart, viewCart, or cancelCart along with arguments..."
    );
}