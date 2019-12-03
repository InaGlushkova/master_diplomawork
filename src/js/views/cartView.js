import { elements } from './base';
import { limitResTitle } from './searchView';

export const renderCartItem = item => {
    const markup = `
        <li class="cart__item" data-itemid="${item.id}">
            <div class="cart__data">
                <p class="cart__ingredient">${limitResTitle(item.ingredient)}</p>
                <p class="cart__price">${item.price} ${item.currency}</p>
            </div>
            <button class="cart__delete btn-tiny">
                <svg>
                    <use href="img/icons.svg#icon-circle-with-cross"></use>
                </svg>
            </button>
        </li>
    `;

    elements.cartList.insertAdjacentHTML('beforeend', markup);
};

export const deleteCartItem = id => {
    const el = document.querySelector(`[data-itemid="${id}"]`);

    if (el) {
        el.parentElement.removeChild(el);
    }
};

// Cart page
export const renderTitle = state => {
    const markup = `
        <p class="cart__title">${state.recipe.title}</p>
    `;
    elements.cart.insertAdjacentHTML('afterbegin', markup);
}

export const renderCart = item => {
    const markup = `
        <li class="cart__item" data-itemid="${item.id}">
            <p class="cart__ingredient">${limitResTitle(item.ingredient)}</p>
            <p class="cart__price">${item.price} ${item.currency}</p>
        </li>
    `;

    elements.cartPage.insertAdjacentHTML('beforeend', markup);
}

// Shopping summary
export const renderSummary = state => {
    const markup = `
        <p>Your cart summary</p>
        <br>
        <p class="total">TOTAL: </p>
        <p class="cart__total">${state.cart.sumPrice} EUR </p>
        <br>
    `;

    elements.summary.insertAdjacentHTML('afterbegin', markup);
};
