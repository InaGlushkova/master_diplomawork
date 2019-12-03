export default class Cart {
    constructor() {
        this.cartItems = [];
        this.sumPrice = 0;
        this.cartFlag = 0;
    }

    addItemToCart(id, count, unit, ingredient) {
        const item = {
            id,
            ingredient,
            count,
            unit,
            price: createValue(),
            currency: 'EUR'
        };
        this.cartItems.push(item);
        return item;
    }

    deleteCartItem(id) {
        const index = this.cartItems.findIndex(el => el.id === id);
        this.cartItems.splice(index, 1);
    }

    updateCartCount(id, newCount) {
        this.cartItems.find(el => el.id === id).count = newCount;
    }

    persistData() {
        localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    }

    readStorage() {
        const storage = JSON.parse(localStorage.getItem('cartItems'));

        if (storage) {
            this.cartItems = storage;
        }
    }

    totalPrice() {
        this.cartItems.forEach(el => {
            this.sumPrice += parseInt(el.price);
        });

        return this.sumPrice;
    }
}

const createValue = () => {
    return (Math.random() * 20).toFixed(2);
}