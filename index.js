import menu from './data.js'
import offer from './offer.js'

const formPaymentEl = document.getElementById('form-payment')
const modalEl = document.getElementById('modal')
const order = {}

document.getElementById('percent').innerText = offer.percent
document.getElementById('price').innerText = offer.price
document.getElementById('menu').innerHTML = getMenuHtml()

document.addEventListener('click', e => {
    if (e.target.dataset.add)
        addItem(e.target.dataset.add)
    else if (e.target.dataset.remove)
        removeItem(e.target.dataset.remove)
    else if (e.target.id === 'order-complete')
        modalEl.showModal()
    else if (e.target.id === 'modal-close')
        modalEl.close()
})

formPaymentEl.addEventListener('keydown', (e) => {
    if (e.target.id === 'full-name')
        validateFullName(e)
})

formPaymentEl.addEventListener('keyup', (e) => {
    if (e.key === 'Backspace' || e.key === ' ')
        e.target.value = e.target.value.replaceAll(/ +/g, ' ')
})

formPaymentEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') return

    if (e.target.id === 'card-number')
        validateCardNumber(e)
    else if (e.target.id === 'cvv-number')
        validateCvvNumber(e)
})

formPaymentEl.addEventListener('submit', (e) => {
    e.preventDefault()

    if (document.getElementById('card-number').value.length !== 16)
        return alert("Please, enter the correct card number.")
    else if (document.getElementById('cvv-number').value.length !== 3)
        return alert("Please, enter the correct CVV number.")

    const fullName = document.getElementById('full-name').value
    const firstName = fullName.split(' ')[0]

    document.getElementById('order').innerHTML = ''
    document.querySelector('main').innerHTML += `
<div class="thanks">
    Thanks, ${firstName}! Your order is on its way!
</div>`

    resetOrder()
    modalEl.close()
})

function getMenuHtml() {
    return menu.map(item => `
    <div class="flex-row">
        <img
            src="${item.image}"
            alt="${item.alt}">
        <div>
            <h3 class="item-name">${item.name}</h3>
            <p class="ingredients">${item.ingredients.join(", ")}</p>
            <p class="price">$${item.price.toFixed(2)}</p>
        </div>
        <button class="btn btn-add" data-add="${item.id}">+</button>
    </div>
    <hr class="menu-hr">`
    ).join('')
}

function addItem(id) {
    order[id] = order[id] ? order[id] + 1 : 1
    renderOrder()
}

function removeItem(id) {
    !--order[id] && delete order[id]
    renderOrder()
}

function renderOrder() {
    document.getElementById('order').innerHTML = getOrderHtml()
}

function getOrderHtml() {
    if (!Object.keys(order).length) return ''

    const total = getTotalPrice()
    let orderHtml = `<h2 class="order-title">Your order</h2>`
    let discount = 0
    let discountHtml = ''


    menu.forEach(item => {
        const quantity = order[item.id]
        if (!quantity) return

        orderHtml += `
<div class="flex-row">
    <h3 class="item-name">${item.name} &times; ${quantity}</h3>
    <button class="btn btn-remove" data-remove="${item.id}">remove</button>
    <p class="price">
        $${item.price.toFixed(2)} &times; ${quantity} =
        $${(item.price * quantity).toFixed(2)}
    </p>
</div>`
    })

    if (total >= offer.price) {
        discount = getDiscount(total)
        discountHtml = `$${total} <span class="discount">- ${discount}</span> =`

        orderHtml += `
<div class="flex-row discount">
    <h3 class="item-name">${offer.percent}% discount</h3>
    <p class="price">- $${discount}</p>
</div>`
    }

    orderHtml += `
<hr class="order-hr">
<div class="flex-row">
    <h1 class="order-total">Total price:</h1>
    <p class="price">
        ${discountHtml} $${(total - discount).toFixed(2)}
    </p>
</div>
<button class="btn btn-submit" id="order-complete">Complete order</button>`

    return orderHtml
}

function getTotalPrice() {
    return menu.reduce((total, item) => {
        return (order[item.id] || 0) * item.price + total
    }, 0).toFixed(2)
}

function getDiscount(total) {
    return (total * offer.percent / 100).toFixed(2)
}

function validateFullName(e) {
    // Prevent user to enter anything other than [A-Za-z ]
    if (!(/[A-Za-z ]/g).test(e.key))
        e.preventDefault()
    else if (e.key === ' ') {
        const cursor = e.target.selectionStart
        const value = e.target.value

        // Prevent user to enter space at the start
        if (cursor === 0)
            e.preventDefault()

        // Prevent user to enter another adjacent space
        else if (value.charAt(cursor - 1) === ' ')
            e.preventDefault()
        else if (value.charAt(cursor) === ' ')
            e.preventDefault()

        // Prevent user to enter more than one space at the end
        else if (value.endsWith(' ') && cursor === value.length)
            e.preventDefault()
    }
}

function validateCardNumber(e) {
    if (!(/\d/).test(e.key) || e.target.value.length === 16)
        e.preventDefault()
}

function validateCvvNumber(e) {
    if (!(/\d/).test(e.key) || e.target.value.length === 3)
        e.preventDefault()
}

function resetOrder() {
    for (const id in order) delete order[id]
}
