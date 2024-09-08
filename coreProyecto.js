class Producto{
    constructor(name, id, type, price, stock, description){
        this.name = name;
        this.id = id;
        this.type = type;
        this.price = price;
        this.stock = stock;
        this.description = description;
    }
}

// Array de productos base
const productosBase = [
    {
        name:"Jabon", 
        id:"001",
        type:"Piel", 
        price:23, 
        stock:32, 
        description:"Jabon miracle  lorem impsum lorem impsum  lorem impsum lorem impsum"
    },
    {name:"snail", id:"002", type:"Piel", price:"210", stock:10, description:"lorem impsum lorem impsum  lorem impsum lorem impsum"},
    {name:"Gel cleanser", id:"003", type:"Piel", price:23, stock:15, description:"lorem impsum lorem impsum  lorem impsum lorem impsum"},
    {name:"Anuat", id:"004", type:"Cabello", price:24, stock:10, description:" lorem impsum lorem impsum  lorem impsum lorem impsum"},
    {name:"Eye serum", id:"005", type:"Cabello", price:23, stock:5, description:" lorem impsum lorem impsum  lorem impsum lorem impsum"},
    {name:"Camelia", id:"006", type:"Piel", price:15, stock:15, description:"lorem impsum lorem impsum  lorem impsum lorem impsum"},
    {name:"Making skin", id:"007", type:"Piel", price:11, stock:15, description:"lorem impsum lorem impsum  lorem impsum lorem impsum"},
    {name:"Ginseng", id:"008", type:"Piel", price:22, stock:15, description:" lorem impsum lorem impsum  lorem impsum lorem impsum"},
    {name:"product", id:"009", type:"Piel", price:10, stock:15, description:"lorem impsum lorem impsum  lorem impsum lorem impsum"},
]

// local storage
const productos = JSON.parse(localStorage.getItem("productos")) || [] 
let carrito = JSON.parse(localStorage.getItem("carrito")) || []
const pedidos = JSON.parse(localStorage.getItem("pedidos")) || []

const agregarProducto = ({name, id, type, price, stock, description})=>{
    if(productos.some(prod=>prod.id===id)){
    } else {
        const productoNuevo = new Producto(name, id, type, price, stock, description)
        productos.push(productoNuevo)
        localStorage.setItem('productos', JSON.stringify(productos))
    }
}

const productosPreexistentes = ()=>{
    if (productos.length===0){
        productosBase.forEach(prod=>{
            let dato = JSON.parse(JSON.stringify(prod))
                agregarProducto(dato)}
            )
    }
}

const totalCarrito = ()=>{
    let total = carrito.reduce((acumulador, {price, quantity})=>{
        return acumulador + (price*quantity)
    }, 0)
    return total
}
const totalCarritoRender = ()=>{
    const carritoTotal = document.getElementById("carritoTotal")
    carritoTotal.innerHTML=`Su Precio total a pagar es: $ ${totalCarrito()}`
}

const agregarCarrito = (objetoCarrito) => {
    const productoExistente = carrito.find(prod => prod.id === objetoCarrito.id);
    
    if (productoExistente) {
        // aumenta su cantidad
        productoExistente.quantity += objetoCarrito.quantity;
    } else {
        // Si no está, agrégalo al carrito
        carrito.push(objetoCarrito);
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
    totalCarritoRender();
};



const renderizarCarrito = ()=>{
    const listaCarrito = document.getElementById("listaCarrito")
    listaCarrito.innerHTML=""
    carrito.forEach(({name, price, quantity, id}) =>{
        let elementoLista = document.createElement("ul")
        elementoLista.innerHTML=`Producto:${name} - P/u: ${price} - Cant.:${quantity} <button id="eliminarCarrito${id}">X</button>`
        listaCarrito.appendChild(elementoLista)
        const botonBorrar = document.getElementById(`eliminarCarrito${id}`)
        botonBorrar.addEventListener("click",()=>{
            carrito = carrito.filter((elemento)=>{
                if(elemento.id !== id){
                    return elemento
                }
            })
            let carritoString = JSON.stringify(carrito)
            localStorage.setItem("carrito", carritoString)
            renderizarCarrito()
        })
        let carritoString = JSON.stringify(carrito)
        localStorage.setItem("carrito", carritoString)
    })
}

const borrarCarrito = ()=>{
    carrito.length = 0 
    let carritoString = JSON.stringify(carrito)
    localStorage.setItem("carrito", carritoString)
    renderizarCarrito()
}

//DOM
const renderizarProductos = (arrayUtilizado)=>{
    const contenedorProductos = document.getElementById("contenedorProductos")
    contenedorProductos.innerHTML = ""
    arrayUtilizado.forEach(({name, id, type, price, stock, description})=>{
        const prodCard = document.createElement("div")
        prodCard.classList.add("col-xs")
        prodCard.classList.add("card")
        prodCard.style = "width: 300px;height: 590px; margin:15px"
        prodCard.id = id
        prodCard.innerHTML = `
                <img src="./assets/${name+id}.png" class="card-img-top" alt="${name}">
                <div class="card-body">
                    <h5 class="card-title">${name}</h5>
                    <h7>${type}</h7>
                    <p class="card-text">${description}</p>
                    <span>Stock: ${stock}</span>
                    <span>$ ${price}</span>
                    <form id="form${id}">
                        <label for="contador${id}">Cantidad</label>
                        <input type="number" placeholder="0" id="contador${id}">
                        <button class="button2" id="botonProd${id}">Agregar</button>
                    </form>
                </div>`
        contenedorProductos.appendChild(prodCard)
        const btn = document.getElementById(`botonProd${id}`)
        btn.addEventListener("click",(evento)=>{
            evento.preventDefault()
            const contadorQuantity = Number(document.getElementById(`contador${id}`).value)
            if(contadorQuantity>0){
                agregarCarrito({name, id, type, price, stock, description, quantity:contadorQuantity})
                renderizarCarrito()
                const form = document.getElementById(`form${id}`)
                form.reset()
            }
        }) 
    })
}




const finalizarCompra = (event)=>{
    event.preventDefault()
    const data = new FormData(event.target)
    const cliente = Object.fromEntries(data)
    const ticket = {cliente: cliente, total:totalCarrito(),id:pedidos.length, productos:carrito} 
    pedidos.push(ticket)
    localStorage.setItem("pedidos", JSON.stringify(pedidos))
    borrarCarrito()
    let mensaje = document.getElementById("carritoTotal")
    mensaje.innerHTML = "Muchas gracias por su compra, los esperamos pronto"

}

// DOM
const compraFinal = document.getElementById("formCompraFinal")
compraFinal.addEventListener("submit",(event)=>{
    event.preventDefault()
    if(carrito.length>0){
        finalizarCompra(event)
    } else {
        
    }
})
const selectorTipo = document.getElementById("tipoProducto")
selectorTipo.onchange = (evt)=>{
    const tipoSeleccionado =  evt.target.value
    if(tipoSeleccionado === "0"){
        renderizarProductos(productos)
    } else {
        renderizarProductos(productos.filter(prod=>prod.type === tipoSeleccionado))
    }
}

const botondark = document.getElementById("botondark")
botondark.onclick = function(){
    document.body.classList.toggle("darkmode")
}

const app = ()=>{
    productosPreexistentes()
    renderizarProductos(productos)
    renderizarCarrito()
    totalCarritoRender()
}


app()