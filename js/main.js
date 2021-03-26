const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});

//корзина

const buttonCart = document.querySelector('.button-cart');
const modalCart = document.querySelector('#modal-cart');
const modalClose = document.querySelector('.modal-close');
const btnDanger = document.querySelector('.btn-danger');

const openModal = () => {
	modalCart.classList.add('show');
	cart.renderCart();
}

const closeModal = () => {
	modalCart.classList.remove('show');
}

buttonCart.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
modalCart.addEventListener('click', (event) => {
	if(event.target.classList.contains('overlay')){
		closeModal();
	}
})

//прокрутка

const scrollLinks = document.querySelectorAll('a.scroll-link');

for(const scrollLink of scrollLinks){
	scrollLink.addEventListener('click', (event) => {
		event.preventDefault();
		const id = scrollLink.getAttribute('href');
		document.querySelector(id).scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
	})
}

//товары
const viewAll = document.querySelectorAll('.view-all');
const navigationLink = document.querySelectorAll('.navigation-link:not(.view-all)');
const longGoodsList = document.querySelector('.long-goods-list');

const showClothing = document.querySelectorAll('.show-clothing');
const showAcsessories = document.querySelectorAll('.show-acsessories');

const getGoods = async () => {
	const result = await fetch('db/db.json');

	if(!result.ok){
		throw 'Ошибка ' + result.status;
	}
	return await result.json();
};

const createCard = (objCard) => {
	const card = document.createElement('div');
	card.className = 'col-lg-3 col-sm-6';

	card.innerHTML = `
		<div class="goods-card">
			${objCard.label ? `<span class="label">${objCard.label}</span>` : ''}
			
			<img src="db/${objCard.img}" alt="${objCard.name}" class="goods-image">
			<h3 class="goods-title">${objCard.name}</h3>
			<p class="goods-description">${objCard.description}</p>
			<button class="button goods-card-btn add-to-cart" data-id="${objCard.id}">
				<span class="button-price">$${objCard.price}</span>
			</button>
		</div>
	`;

	return card;
};

const renderCards = (data) => {
	longGoodsList.textContent = '';
	const cards = data.map(createCard);
	cards.forEach(card => {
		longGoodsList.append(...cards);
	});
	document.body.classList.add('show-goods');
};

const showAll = (event) => {
	event.preventDefault();
	getGoods().then(renderCards);
}

viewAll.forEach((elem) => {
	elem.addEventListener('click',showAll);
})


const filterCards = (field, value) => {
	getGoods().then((data) => {
		const filteredGoods = data.filter((good) => {
			return good[field] === value;
		});
		return filteredGoods;
	})
		.then(renderCards);
};

navigationLink.forEach((link) => {
	link.addEventListener('click', (event) => {
		event.preventDefault();
		const field = link.dataset.field;
		const value = link.textContent;
		filterCards(field, value);
	});
})	


//корзина (таблица товаров)
const cartTableGoods = document.querySelector('.cart-table__goods');
const cardTableTotal = document.querySelector('.card-table__total');
const cartCount = document.querySelector('.cart-count');

const cart = {
	cartGoods: [],

	countQuantity() {
		
		let coun = this.cartGoods.reduce((sum, item) => {
			return sum + item.count;
		}, 0);

		if(coun === 0){
			cartCount.textContent = '';
		}else{
			cartCount.textContent = coun;
		}
	},

	clearCart() {
		this.cartGoods.length = 0;
		this.countQuantity();
		this.renderCart();
	},

	renderCart(){
		cartTableGoods.textContent = '';
		this.cartGoods.forEach(({id, name, price, count}) => {
			const trGood = document.createElement('tr');
			trGood.className = 'cart-item';
			trGood.dataset.id = id;

			trGood.innerHTML = `
				<td>${name}</td>
				<td>${price}</td>
				<td><button class="cart-btn-minus" data-set="${id}">-</button></td>
				<td>${count}</td>
				<td><button class="cart-btn-plus" data-set="${id}">+</button></td>
				<td>${price * count}</td>
				<td><button class="cart-btn-delete" data-set="${id}">x</button></td>
			`;
			cartTableGoods.append(trGood);
		});

		const totalPrice = this.cartGoods.reduce((sum, item) => {
			return sum + item.price * item.count;
		}, 0);
		cardTableTotal.textContent = totalPrice + '$';
		
	},
	deleteGood(id){
		this.cartGoods = this.cartGoods.filter((item) => item.id !== id);
		this.renderCart();
		this.countQuantity();
	},
	minusGood(id){
		for (const item of this.cartGoods){
			if(item.id === id){
				if(item.count <= 1){
					this.deleteGood(id)
				} else{
					item.count--;
				}
				break;
			}
		}
		this.renderCart();
		this.countQuantity();
	},
	plusGood(id){
		for (const item of this.cartGoods){
			if(item.id === id){
				item.count++;
				break;
			}
		}
		this.renderCart();
		this.countQuantity();
	},
	addCartGoods(id){
		const goodItem = this.cartGoods.find((item) => item.id === id);
		if(goodItem){
			this.plusGood(id);
		} else {
			getGoods()
				.then((data) => data.find((item) => item.id === id))
				.then(({id, name, price}) => {
					this.cartGoods.push({
						id, 
						name, 
						price, 
						count: 1
				});
				this.countQuantity();
			});
		
		};
	},
}

btnDanger.addEventListener('click', cart.clearCart.bind(cart));

document.body.addEventListener('click', (event) => {
	const addToCart = event.target.closest('.add-to-cart');
	if(addToCart){
		cart.addCartGoods(addToCart.dataset.id);
	}
})

cartTableGoods.addEventListener('click', (event) => {
	const target = event.target;
	if(target.classList.contains('cart-btn-delete')){
		//cart.deleteGood(target.dataset.id); вариант 1
		//вариант 2
		const parent = target.closest('.cart-item');
		cart.deleteGood(parent.dataset.id);
	};

	if(target.classList.contains('cart-btn-minus')){
		const parent = target.closest('.cart-item');
		cart.minusGood(parent.dataset.id);
	}

	if(target.classList.contains('cart-btn-plus')){
		const parent = target.closest('.cart-item');
		cart.plusGood(parent.dataset.id);
	}

});

showAcsessories.forEach((item) => {
	item.addEventListener('click', (event) =>{
		event.preventDefault();
		filterCards('category', 'Accessories');
	})
});

showClothing.forEach((item) => {
	item.addEventListener('click', (event) =>{
		event.preventDefault();
		filterCards('category', 'Clothing');
	})
});


//форма
const modalForm = document.querySelector('.modal-form');


//сервер, отправка данных с формы
const postData = (dataUser) => fetch('server.php', {
	method: 'POST',
	body: dataUser,
});


modalForm.addEventListener('submit', (event) => {
	event.preventDefault();
	const formData = new FormData(modalForm);
	formData.append('cart', JSON.stringify(cart.cartGoods));

	postData(formData)
		.then((response) => {
			if(!response.ok){
				throw new Error(response.status);
			}
			alert('Ваш заказ отправлен');
		})
		.catch((error)=> {
			alert('Произошла ошибка, повторите позже!');
			console.log(error);
		})
		.finally(()=> {
			closeModal();
			modalForm.reset();
			cart.cartGoods.length = 0;
		})
});



