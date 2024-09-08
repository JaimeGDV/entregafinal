class Producto {
    constructor(name, id, type, price, stock, description) {
        this.name = name;
        this.id = id;
        this.type = type;
        this.price = price;
        this.stock = stock;
        this.description = description;
    }
}

// Inicializamos productos como un array vacío
let productos = [];

// Cargar productos desde el archivo JSON
fetch('productos.json')
    .then(response => response.json())
    .then(data => {
        productos = data;  // Guardamos los productos en la variable
        renderizarProductos(productos);  // Renderizamos los productos
    })
    .catch(error => console.error('Error al cargar los productos:', error));

// local storage para el carrito y pedidos
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

// Función para agregar un nuevo producto (si no existe ya)
const agregarProducto = ({ name, id, type, price, stock, description }) => {
    if (productos.some(prod => prod.id === id)) {
        // Producto ya existe
    } else {
        const productoNuevo = new Producto(name, id, type, price, stock, description);
        productos.push(productoNuevo);
        localStorage.setItem('productos', JSON.stringify(productos));
    }
};

// Calcular el total del carrito
const totalCarrito = () => {
    let total = carrito.reduce((acumulador, { price, quantity }) => {
        return acumulador + (price * quantity);
    }, 0);
    return total;
};

// Renderizar el total del carrito
const totalCarritoRender = () => {
    const carritoTotal = document.getElementById("carritoTotal");
    carritoTotal.innerHTML = `Su Precio total a pagar es: $ ${totalCarrito()}`;
};

// Agregar producto al carrito
const agregarCarrito = (objetoCarrito) => {
    const productoExistente = carrito.find(prod => prod.id === objetoCarrito.id);
    
    if (productoExistente) {
        productoExistente.quantity += objetoCarrito.quantity;
    } else {
        carrito.push(objetoCarrito);
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
    totalCarritoRender(); // Actualizamos el total al agregar producto
};

// Renderizar el carrito
const renderizarCarrito = () => {
    const listaCarrito = document.getElementById("listaCarrito");
    listaCarrito.innerHTML = "";
    carrito.forEach(({ name, price, quantity, id }) => {
        let elementoLista = document.createElement("ul");
        elementoLista.innerHTML = `Producto: ${name} - P/u: ${price} - Cant.: ${quantity} <button id="eliminarCarrito${id}">X</button>`;
        listaCarrito.appendChild(elementoLista);
        
        const botonBorrar = document.getElementById(`eliminarCarrito${id}`);
        botonBorrar.addEventListener("click", () => {
            carrito = carrito.filter(elemento => elemento.id !== id);
            localStorage.setItem("carrito", JSON.stringify(carrito));
            renderizarCarrito();
            totalCarritoRender();  // Actualizamos el total al eliminar producto
        });
    });
};

// Borrar carrito
const borrarCarrito = () => {
    carrito.length = 0;
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
    totalCarritoRender();  // Aseguramos que el total del carrito sea $0
};

// Renderizar productos
const renderizarProductos = (productos) => {
    const contenedorProductos = document.getElementById("contenedorProductos");
    contenedorProductos.innerHTML = "";

    productos.forEach(({ name, id, type, price, stock, description }) => {
        const prodCard = document.createElement("div");
        prodCard.classList.add("col-xs", "card");
        prodCard.style = "width: 300px;height: 590px; margin:15px";
        prodCard.id = id;

        const formattedName = name.replace(/\s+/g, '-');
        const imageUrl = `./assets/${formattedName + id}.png`;

        const img = new Image();
        img.src = imageUrl;
        img.alt = name;
        img.classList.add("card-img-top");

        img.onerror = function () {
            img.src = './assets/default.png';
        };

        prodCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${name}</h5>
                <span>${type}</span>
                <p class="card-text">${description}</p>
                <span>Stock: ${stock}</span>
                <span>$ ${price}</span>
                <form id="form${id}">
                    <label for="contador${id}">Cantidad</label>
                    <input type="number" placeholder="0" id="contador${id}">
                    <button class="button2" id="botonProd${id}">Agregar</button>
                </form>
            </div>
        `;

        prodCard.insertBefore(img, prodCard.firstChild);
        contenedorProductos.appendChild(prodCard);

        const btn = document.getElementById(`botonProd${id}`);
        btn.addEventListener("click", (evento) => {
            evento.preventDefault();
            const contadorQuantity = Number(document.getElementById(`contador${id}`).value);
            if (contadorQuantity > 0) {
                agregarCarrito({ name, id, type, price, stock, description, quantity: contadorQuantity });
                renderizarCarrito();
                const form = document.getElementById(`form${id}`);
                form.reset();
            }
        });
    });
};

// Finalizar compra
const finalizarCompra = (event) => {
    event.preventDefault();

    const totalCompra = totalCarrito(); // Capturamos el total
    const data = new FormData(event.target);  // Capturamos los datos del formulario
    const cliente = Object.fromEntries(data);  // Convertimos los datos en un objeto

    const ticket = { cliente: cliente, total: totalCompra, id: pedidos.length, productos: carrito };
    pedidos.push(ticket);  // Añadimos el ticket al array de pedidos
    localStorage.setItem("pedidos", JSON.stringify(pedidos));  // Guardamos en localStorage

    Swal.fire({
        title: '¡Compra exitosa!',
        text: `Muchas gracias por su compra, su total es de $${totalCompra}.`,
        icon: 'success',
        confirmButtonText: 'Aceptar'
    }).then(() => {
        borrarCarrito();  // Vaciamos el carrito
        renderizarCarrito();  // Renderizamos el carrito vacío
        totalCarritoRender();  // Actualizamos el total del carrito
    });
};

// Filtrar productos por tipo
const selectorTipo = document.getElementById("tipoProducto");

selectorTipo.onchange = (evt) => {
    const tipoSeleccionado = evt.target.value;

    if (tipoSeleccionado === "0") {
        renderizarProductos(productos);
    } else {
        const productosFiltrados = productos.filter(prod => prod.type === tipoSeleccionado);
        renderizarProductos(productosFiltrados);
    }
};

// Manejar el formulario de compra final
const compraFinal = document.getElementById("formCompraFinal");
compraFinal.addEventListener("submit", (event) => {
    event.preventDefault();
    if (carrito.length > 0) {
        finalizarCompra(event);  // Finaliza la compra si hay productos en el carrito
    } else {
        Swal.fire({
            title: 'Carrito vacío',
            text: 'No hay productos en el carrito para finalizar la compra.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }
});

const app = () => {
    renderizarProductos(productos);
    renderizarCarrito();
    totalCarritoRender();
};

// Iniciar la aplicación al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    app();  // Llamamos a la función `app` para inicializar
});
