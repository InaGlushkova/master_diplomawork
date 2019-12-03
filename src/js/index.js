// Controller 
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import Cart from './models/Cart';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import * as cartView from './views/cartView';
import { elements, renderLoader, clearLoader } from './views/base';


// Global state of the app - Search, Current recipe, Shopping list, Liked list
const state = {};

// for testing purposes
window.state = state;

/**
 * SEARCH CONTROLLER
 */
const controlSearch = async () => {
    const query = searchView.getInput();

    if (query) {
        state.search = new Search(query);

        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            await state.search.getResults();
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (error) {
            alert(error);
            clearLoader();
            console.log(error);
        }
    }
};

elements.searchForm.addEventListener('submit', event => {
    event.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', event => {
    const btn = event.target.closest('.btn-inline');
    
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});


/**
 * RECIPE CONTROLLER
 */

const controlRecipe = async () => {
    const id  = window.location.hash.replace('#', '');

    if (id) {
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        if (state.search) {
            searchView.highlightSelected(id);
        }

        state.recipe = new Recipe(id);

        try {
            await state.recipe.getRecipe();
            state.recipe.parseIngr();

            state.recipe.calcTime();
            state.recipe.calcServings();

            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        } catch (error) {
            alert('Error, processing recipe');
            console.log(error);
        }
        
    }
};

['hashchange', 'load'].forEach(event => {
    window.addEventListener(event, controlRecipe);
});


/**
 * LIST CONTROLLER
 */

const controlList = () => {
    if (!state.list) {
        state.list = new List();
    }

    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};

elements.shopping.addEventListener('click', event => {
    const id = event.target.closest('.shopping__item').dataset.itemid;

    if (event.target.matches('.shopping__delete, .shopping__delete *')) {
        state.list.deleteItem(id);
        listView.deleteItem(id);
    } else if (event.target.matches('.shopping__count-value')) {
        const val = parseFloat(event.target.value, 10);
        state.list.updateCount(id, val);
    }
});


/**
 * LIKE CONTROLLER
 */

const controlLike = () => {
    if (!state.likes) {
        state.likes = new Likes();
    }
    const curId = state.recipe.id;

    if (!state.likes.isLiked(curId)) {
        const newLike = state.likes.addLike(curId, state.recipe.title, state.recipe.author, state.recipe.image);
        likesView.toggleLikeBtn(true);
        likesView.renderLike(newLike);
    } else {
        state.likes.deleteLike(curId);
        likesView.toggleLikeBtn(false);
        likesView.deleteLike(curId);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// Restore liked recipes on page reloads
window.addEventListener('load', () => {
    state.likes = new Likes();
    state.likes.readStorage();
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

elements.recipe.addEventListener('click', event => {
    if (event.target.matches('.btn-decrease, .btn-decrease *')) {
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingIngr(state.recipe);
        }

    } else if (event.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingIngr(state.recipe);
    } else if (event.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    } else if (event.target.matches('.recipe__love, .recipe__love *')) {
        controlLike();
    }
});


/**
 * CART CONTROLLER
 */

const controlCart = () => {
    if (!state.cart) {
        state.cart = new Cart();
    }

    state.list.items.forEach(el => {
        let item = state.cart.addItemToCart(el.id, el.count, el.unit, el.ingredient);
        cartView.renderCartItem(item);

        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        
        document.querySelector('.cart').classList.add('hovered');
        document.querySelector('.cart__panel').classList.add('hovered__panel');
        setTimeout(() => (document.querySelector('.cart').classList.remove('hovered')), 1500);
        setTimeout(() => (document.querySelector('.cart__panel').classList.remove('hovered__panel')), 1500);
    });
};

elements.cartBtn.addEventListener('click', event => {
    if (event.target.matches('.addToCart__btn, .addToCart__btn *')) {
        controlCart();
    }
});

elements.cartList.addEventListener('click', event => {
    const id = event.target.closest('.cart__item').dataset.itemid;

    if (event.target.matches('.cart__delete, .cart__delete *')) {
        state.cart.deleteCartItem(id);
        cartView.deleteCartItem(id);
    }
});

const showCartPage = () => {
    if (elements.results && elements.recipe && elements.shopping) {
        elements.cart.style.display = 'block';
        elements.buySummary.style.display = 'block';
        elements.img.style.display = 'block';
    }
}

const hideMainPage = () => {
    if (elements.results && elements.recipe && elements.shopping) {
        elements.results.style.display = 'none';
        elements.recipe.style.display = 'none';
        elements.shoppingList.style.display = 'none';
    }
};

const hideCartPage = () => {
    elements.cart.style.display = 'none';
    elements.buySummary.style.display = 'none';
    elements.checkout.style.display = 'none';
}

const showMainPage = () => {
    elements.results.style.display = 'block';
    elements.recipe.style.display = 'block';
    elements.shoppingList.style.display = 'block';
}

elements.cartField.addEventListener('click', event => {
    if (event.target.matches('.cart__icon, .cart__icon *')) {
        showCartPage();
        hideMainPage();
        if (!state.cart.cartFlag) {
            cartView.renderTitle(state);
            state.cart.cartItems.forEach(el => {
                cartView.renderCart(el);
            });
            state.cart.totalPrice()
            cartView.renderSummary(state);
            state.cart.cartFlag = 1;
        }
    }
});

elements.home.addEventListener('click', event => {
    hideCartPage();
    showMainPage();
});

elements.cartPage.addEventListener('click', event => {
    const id = event.target.closest('.cart__item').dataset.itemid;

    if (event.target.matches('.remove__from_cart, .remove__from_cart *')) {
        state.cart.deleteCartItem(id);
        cartView.deleteCartItem(id);
    }
});

// BUY NOW button functionality
elements.buy.addEventListener('click', event => {
    if (event.target.matches('.buy__btn, .buy__btn *')) {
        elements.checkout.style.display = 'block';
    }
});

const showThankyouPage = () => {
    elements.cart.style.display = 'none';
    elements.summary.style.display = 'none';
    elements.checkout.style.display = 'none';

    elements.thankyouPage.style.display = 'block';
    elements.finalPage.style.backgroundImage = 'linear-gradient(to right bottom, #FBDB89, #F48982)';
};

// After order confirmation functionality
elements.checkout.addEventListener('submit', event => {
    event.preventDefault();
    setTimeout(showThankyouPage, 1000);

    setTimeout(() => {
        elements.form.submit();
    }, 15000);
})