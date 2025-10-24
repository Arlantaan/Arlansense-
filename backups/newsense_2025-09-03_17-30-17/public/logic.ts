const products = [
  {
    name: "Valentino Donna Born In Roma",
    price: "GMD 17,000",
    image: "images/VALENTINO.png",
    link: "purchase.html?product=valentino"
  },
  {
    name: "Dior Sauvage Elixir",
    price: "GMD 18,500",
    image: "images/DIOR.png",
    link: "purchase.html?product=dior"
  },
  {
    name: "Gravity Signature Scent",
    price: "GMD 15,000",
    image: "images/GRAVITY.png",
    link: "purchase.html?product=gravity"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const productList = document.getElementById("product-list");

  products.forEach(product => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-4 mb-4";

    col.innerHTML = `
      <div class="card shadow-sm text-center h-100">
        <img src="${product.image}" class="card-img-top" alt="${product.name}">
        <div class="card-body">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text text-success fw-bold">${product.price}</p>
          <a href="${product.link}" class="btn btn-primary">Buy Now</a>
        </div>
      </div>
    `;
    productList.appendChild(col);
  });
});
