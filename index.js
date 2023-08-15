import menu from './data.js'
import offer from './offer.js'

const formPaymentEl = document.getElementById('form-payment')
const modalEl = document.getElementById('modal')
const orderEl = document.getElementById('order')
const thanksEl = document.getElementById('thanks')
const order = {}

document.getElementById('percent').innerText = offer.percent
document.getElementById('price').innerText = offer.price
document.getElementById('menu').innerHTML = getMenuHtml()

document.addEventListener('click', e => {
    const { dataset, id } = e.target
    if (dataset.add)
        addItem(dataset.add)
    else if (dataset.remove)
        removeItem(dataset.remove)
    else if (id === 'order-complete')
        modalEl.showModal()
    else if (id === 'modal-close')
        modalEl.close()
})

formPaymentEl.addEventListener('keydown', e => {
    const { id } = e.target
    if (!(/[A-Za-z0-9 ]/).test(e.key))
        e.preventDefault()
    else if (!(/^[A-Za-z0-9 ]$/).test(e.key))
        return
    else if (id === 'full-name')
        validateFullName(e)
    else if (id === 'card-number')
        validateCardNumber(e)
    else if (id === 'cvv-number')
        validateCvvNumber(e)
})

formPaymentEl.addEventListener('keyup', e => {
    if (e.target.id === 'full-name') {
        const caret = e.target.selectionEnd
        const valueTrim = e.target.value.trimStart()
        e.target.value = valueTrim.replaceAll(/ +/g, ' ')
        e.target.selectionEnd = caret
    }
})

formPaymentEl.addEventListener('submit', e => {
    e.preventDefault()

    const cardNumberEl = document.getElementById('card-number')
    const cvvNumberEl = document.getElementById('cvv-number')

    if (cardNumberEl.value.length !== 16) {
        cardNumberEl.focus()
        return alert("Please, enter the correct card number.")
    } else if (cvvNumberEl.value.length !== 3) {
        cvvNumberEl.focus()
        return alert("Please, enter the correct CVV number.")
    }

    const fullName = document.getElementById('full-name').value
    const [firstName] = fullName.split(' ')

    orderEl.innerHTML = ''
    thanksEl.textContent = `Thanks, ${firstName}! Your order is on its way!`
    thanksEl.style.display = 'block'

    resetOrder()
    formPaymentEl.reset()
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
    thanksEl.style.display = 'none'
    orderEl.innerHTML = getOrderHtml()
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
    if (!(/[A-Za-z ]/).test(e.key))
        e.preventDefault()
    else if (e.key === ' ') {
        const caret = e.target.selectionStart
        const value = e.target.value

        if (caret === 0)
            e.preventDefault()
        else if (value.charAt(caret) === ' ')
            e.preventDefault()
        else if (value.charAt(caret - 1) === ' ')
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
