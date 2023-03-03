import { menuArray } from './data.js'
import { offer } from './offer.js'

const paymentForm = document.getElementById('payment-form')
const order = []

document.getElementById('percent').innerText = offer.percent
document.getElementById('price').innerText = offer.price

paymentForm.addEventListener('keydown', (e) => {
    if (e.target.id === 'full-name')
        validateFullName(e)
})

paymentForm.addEventListener('keyup', (e) => {
    if (e.key === 'Backspace' || e.key === ' ')
        e.target.value = e.target.value.replaceAll(/ +/g, ' ')
})

paymentForm.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') return
    
    if (e.target.id === 'card-number')
        validateCardNumber(e)
    else if (e.target.id === 'cvv-number')
        validateCvvNumber(e)
})

paymentForm.addEventListener('submit', (e) => {
    e.preventDefault()

    if (document.getElementById('card-number').value.length !== 16) {
        alert("Please, enter the correct card number.")
        return
    } else if (document.getElementById('cvv-number').value.length !== 3) {
        alert("Please, enter the correct CVV number.")
        return
    }

    const paymentFormData = new FormData(paymentForm)
    const fullName = paymentFormData.get('full-name')
    const firstName = fullName.split(' ')[0]

    document.getElementById('order').classList.add('hidden')
    document.querySelector('main').innerHTML += `
<div class="thanks">
    Thanks, ${firstName}! Your order is on its way!
</div>
`
    document.getElementById('modal').classList.add('hidden')
})

document.addEventListener('click', (e) => {
    if (e.target.dataset.add)
        handleAddClick(e.target.dataset.add)
    else if (e.target.dataset.remove)
        handleRemoveClick(e.target.dataset.remove)
    else if (e.target.id === 'complete-order')
        handleCompleteOrderClick()
    else if (e.target.id === 'close-modal')
        handleCloseModalClick()
})

function handleAddClick(itemId) {
    order.push(parseInt(itemId))
    renderOrder()
}

function handleRemoveClick(itemId) {
    const index = order.indexOf(parseInt(itemId))
    order.splice(index, 1)
    renderOrder()
}

function handleCompleteOrderClick() {
    document.querySelector('main').classList.add('disabled')
    document.getElementById('modal').classList.remove('hidden')
}

function handleCloseModalClick() {
    document.querySelector('main').classList.remove('disabled')
    document.getElementById('modal').classList.add('hidden')
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

function getMenuHtml() {
    let html = ''

    menuArray.forEach((item) => {
        html += `
<div class="display-flex">
    <img
        class="item-image"
        src="${item.image}"
        alt="${item.alt}">
    <div>
        <h1 class="item-name">${item.name}</h1>
        <p class="ingredients">${item.ingredients.join(", ")}</p>
        <p class="price">$${item.price.toFixed(2)}</p>
    </div>
    <button class="add-btn" data-add="${item.id}">+</button>
</div>
<hr></hr>
`
    })

    return html
}

function getOrderHtml() {
    if (order.length === 0) return ""

    let html = `<h1 class="order-title">Your order</h1>`
    let total = 0
    let discount = 0
    let discountHtml = ""


    menuArray.forEach((item) => {
        let quantity = 0

        for (let id of order) {
            if (id === item.id) {
                quantity++
            }
        }

        if (quantity > 0) {
            html += `
<div class="display-flex">
    <h1 class="item-name">${item.name} &times; ${quantity}</h1>
    <button class="remove-btn" data-remove="${item.id}">remove</button>
    <p class="price">
        $${item.price.toFixed(2)} &times; ${quantity} =
        $${(item.price * quantity).toFixed(2)}
    </p>
</div>
`
        }
    })

    total = getTotalPrice()

    if (total >= offer.price) {
        discount = getDiscount()
        discountHtml = `$${total} <span class="discount">- ${discount}</span> =`

        html += `
<div class="display-flex discount">
    <h1 class="item-name">${offer.percent}% discount</h1>
    <p class="price">- $${discount}</p>
</div>
`
    }

    html += `
<hr>
<div class="display-flex">
    <h1 class="order-total">Total price:</h1>
    <p class="price">
        ${discountHtml} $${(total - discount).toFixed(2)}
    </p>
</div>
<button id="complete-order" class="submit-btn">Complete order</button>
`

    return html
}

function getTotalPrice() {
    let total = 0

    order.forEach((id) => {
        const targetItemObj = menuArray.filter(function (item) {
            return item.id === id
        })[0]
        total += targetItemObj.price
    })

    return total.toFixed(2)
}

function getDiscount() {
    return (getTotalPrice() * offer.percent / 100).toFixed(2)
}

function renderMenu() {
    document.getElementById('menu').innerHTML = getMenuHtml()
}

function renderOrder() {
    document.getElementById('order').innerHTML = getOrderHtml()
}

renderMenu()
