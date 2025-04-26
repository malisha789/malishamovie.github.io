document.addEventListener('DOMContentLoaded', function() {
    // Cart and Favorites Data
    let cart = [];
    let favorites = [];
    
    // DOM Elements
    const sidebar = document.querySelector('.sidebar');
    const cartTab = document.getElementById('cart-tab');
    const favoritesTab = document.getElementById('favorites-tab');
    const cartItemsContainer = document.querySelector('.cart-items');
    const favoritesContainer = document.querySelector('.favorites-items');
    const totalAmount = document.querySelector('.total-amount');
    const clearCartBtn = document.querySelector('.clear-cart-btn');
    const cartToggle = document.createElement('button');
    
    // Create cart toggle button
    cartToggle.className = 'cart-toggle';
    cartToggle.innerHTML = '<i class="fas fa-shopping-cart"></i>';
    const cartBadge = document.createElement('span');
    cartBadge.className = 'cart-badge';
    cartBadge.textContent = '0';
    cartToggle.appendChild(cartBadge);
    document.body.appendChild(cartToggle);
    
    // Toggle sidebar
    cartToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
      });
    });
    
    // Initialize all sliders
    const sliders = document.querySelectorAll('.food-slider-container');
    
    sliders.forEach(container => {
      const slider = container.querySelector('.food-slider');
      const track = container.querySelector('.food-slider-track');
      const cards = container.querySelectorAll('.food-card');
      const leftArrow = container.querySelector('.left-arrow');
      const rightArrow = container.querySelector('.right-arrow');
      
      // Calculate card width including gap
      const cardStyle = window.getComputedStyle(cards[0]);
      const cardWidth = cards[0].offsetWidth + parseFloat(cardStyle.marginRight || 0);
      
      // Infinite loop setup
      let currentPosition = 0;
      const totalCards = cards.length;
      
      // Clone cards for infinite loop
      cards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
      });
      
      // Add action buttons to each card
      container.querySelectorAll('.food-card').forEach((card, index) => {
        const actions = document.createElement('div');
        actions.className = 'food-card-actions';
        
        // Favorite button
        const favBtn = document.createElement('button');
        favBtn.className = 'food-card-btn favorite';
        favBtn.innerHTML = '<i class="far fa-heart"></i>';
        favBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const itemName = card.querySelector('.food-info').textContent.split(' - ')[0];
          const itemPrice = parseFloat(card.querySelector('.food-info').textContent.split(' - ')[1].replace('Rs. ', ''));
          const itemImage = card.querySelector('img').src;
          
          toggleFavorite(itemName, itemPrice, itemImage, favBtn);
        });
        
        // Add to cart button
        const cartBtn = document.createElement('button');
        cartBtn.className = 'food-card-btn';
        cartBtn.innerHTML = '<i class="fas fa-cart-plus"></i>';
        cartBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const quantitySelector = card.querySelector('.quantity-selector') || createQuantitySelector(card);
          quantitySelector.classList.toggle('active');
        });
        
        actions.appendChild(favBtn);
        actions.appendChild(cartBtn);
        card.appendChild(actions);
      });
      
      // Right arrow click - infinite loop
      rightArrow.addEventListener('click', function() {
        currentPosition -= cardWidth;
        track.style.transition = 'transform 0.5s ease';
        track.style.transform = `translateX(${currentPosition}px)`;
        
        // Check if we've reached the end (original cards)
        if (currentPosition <= -(totalCards * cardWidth)) {
          setTimeout(() => {
            track.style.transition = 'none';
            currentPosition = 0;
            track.style.transform = `translateX(${currentPosition}px)`;
          }, 500);
        }
      });
      
      // Left arrow click - infinite loop
      leftArrow.addEventListener('click', function() {
        if (currentPosition >= 0) {
          track.style.transition = 'none';
          currentPosition = -(totalCards * cardWidth);
          track.style.transform = `translateX(${currentPosition}px)`;
          setTimeout(() => {
            track.style.transition = 'transform 0.5s ease';
            currentPosition += cardWidth;
            track.style.transform = `translateX(${currentPosition}px)`;
          }, 10);
        } else {
          currentPosition += cardWidth;
          track.style.transition = 'transform 0.5s ease';
          track.style.transform = `translateX(${currentPosition}px)`;
        }
      });
      
      // Handle window resize
      window.addEventListener('resize', function() {
        track.style.transition = 'none';
        track.style.transform = `translateX(${currentPosition}px)`;
      });
    });
    
    // Create quantity selector
    function createQuantitySelector(card) {
      const selector = document.createElement('div');
      selector.className = 'quantity-selector';
      
      const minusBtn = document.createElement('button');
      minusBtn.textContent = '-';
      minusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const input = selector.querySelector('input');
        if (parseInt(input.value) > 1) {
          input.value = parseInt(input.value) - 1;
        }
      });
      
      const input = document.createElement('input');
      input.type = 'number';
      input.value = '1';
      input.min = '1';
      
      const plusBtn = document.createElement('button');
      plusBtn.textContent = '+';
      plusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const input = selector.querySelector('input');
        input.value = parseInt(input.value) + 1;
      });
      
      const addBtn = document.createElement('button');
      addBtn.textContent = 'Add';
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemName = card.querySelector('.food-info').textContent.split(' - ')[0];
        const itemPrice = parseFloat(card.querySelector('.food-info').textContent.split(' - ')[1].replace('Rs. ', ''));
        const quantity = parseInt(selector.querySelector('input').value);
        const itemImage = card.querySelector('img').src;
        
        addToCart(itemName, itemPrice, quantity, itemImage);
        selector.classList.remove('active');
      });
      
      selector.appendChild(minusBtn);
      selector.appendChild(input);
      selector.appendChild(plusBtn);
      selector.appendChild(addBtn);
      card.appendChild(selector);
      
      return selector;
    }
    
    // Add to cart function
    function addToCart(name, price, quantity, image) {
      const existingItem = cart.find(item => item.name === name);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({
          name,
          price,
          quantity,
          image
        });
      }
      
      updateCart();
    }
    
    // Toggle favorite function
    function toggleFavorite(name, price, image, button) {
      const existingIndex = favorites.findIndex(item => item.name === name);
      
      if (existingIndex >= 0) {
        favorites.splice(existingIndex, 1);
        button.innerHTML = '<i class="far fa-heart"></i>';
      } else {
        favorites.push({
          name,
          price,
          image
        });
        button.innerHTML = '<i class="fas fa-heart"></i>';
      }
      
      updateFavorites();
    }
    
    // Update cart display
    function updateCart() {
      cartItemsContainer.innerHTML = '';
      let total = 0;
      
      cart.forEach((item, index) => {
        total += item.price * item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        cartItem.innerHTML = `
          <img src="${item.image}" alt="${item.name}" width="50">
          <div>
            <p>${item.name}</p>
            <p>Rs. ${item.price} x ${item.quantity}</p>
          </div>
          <div class="cart-item-controls">
            <button class="qty-minus" data-index="${index}">-</button>
            <span class="cart-item-qty">${item.quantity}</span>
            <button class="qty-plus" data-index="${index}">+</button>
            <button class="remove-item" data-index="${index}"><i class="fas fa-trash"></i></button>
          </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
      });
      
      totalAmount.textContent = `Rs. ${total}`;
      cartBadge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
      
      // Add event listeners to new buttons
      document.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = e.target.dataset.index;
          if (cart[index].quantity > 1) {
            cart[index].quantity--;
            updateCart();
          }
        });
      });
      
      document.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = e.target.dataset.index;
          cart[index].quantity++;
          updateCart();
        });
      });
      
      document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = e.target.closest('button').dataset.index;
          cart.splice(index, 1);
          updateCart();
        });
      });
    }
    
    // Update favorites display
    function updateFavorites() {
      favoritesContainer.innerHTML = '';
      
      favorites.forEach((item, index) => {
        const favItem = document.createElement('div');
        favItem.className = 'favorite-item';
        
        favItem.innerHTML = `
          <img src="${item.image}" alt="${item.name}" width="50">
          <div>
            <p>${item.name}</p>
            <p>Rs. ${item.price}</p>
          </div>
          <button class="remove-favorite" data-index="${index}"><i class="fas fa-trash"></i></button>
        `;
        
        favoritesContainer.appendChild(favItem);
      });
      
      // Add event listeners to remove buttons
      document.querySelectorAll('.remove-favorite').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = e.target.closest('button').dataset.index;
          favorites.splice(index, 1);
          updateFavorites();
          
          // Also update the heart icon in the food cards
          document.querySelectorAll('.food-card').forEach(card => {
            const name = card.querySelector('.food-info').textContent.split(' - ')[0];
            if (name === favorites[index]?.name) {
              card.querySelector('.favorite').innerHTML = '<i class="far fa-heart"></i>';
            }
          });
        });
      });
    }
    
    // Clear cart
    clearCartBtn.addEventListener('click', () => {
      cart = [];
      updateCart();
    });
    
    // Checkout button
    document.querySelector('.checkout-btn').addEventListener('click', () => {
      if (cart.length > 0) {
        alert('Order placed successfully! Total: ' + totalAmount.textContent);
        cart = [];
        updateCart();
        sidebar.classList.remove('active');
      } else {
        alert('Your cart is empty!');
      }
    });
  });



  // Movie data
const moviesData = {
  movies: [
    {
      id: 1,
      title: "Dune: Part Two",
      image: "images/dune2.jpg",
      rating: "PG-13",
      duration: "2h 46m",
      showtimes: ["10:00 AM", "1:30 PM", "5:00 PM", "8:30 PM"],
      price: 1000
    },
    {
      id: 2,
      title: "Kung Fu Panda 4",
      image: "images/kungfupanda4.jpg",
      rating: "PG",
      duration: "1h 34m",
      showtimes: ["11:00 AM", "2:00 PM", "4:30 PM", "7:00 PM"],
      price: 1000
    },
    {
      id: 3,
      title: "Ghostbusters: Frozen Empire",
      image: "images/ghostbusters.jpg",
      rating: "PG-13",
      duration: "1h 55m",
      showtimes: ["10:30 AM", "1:00 PM", "4:00 PM", "7:30 PM"],
      price: 1000
    },
    {
      id: 4,
      title: "Godzilla x Kong: The New Empire",
      image: "images/godzillaxkong.jpg",
      rating: "PG-13",
      duration: "1h 55m",
      showtimes: ["11:30 AM", "3:00 PM", "6:30 PM", "9:00 PM"],
      price: 1000
    },
    {
      id: 5,
      title: "Oppenheimer",
      image: "images/oppenheimer.jpg",
      rating: "R",
      duration: "3h",
      showtimes: ["12:00 PM", "4:00 PM", "8:00 PM"],
      price: 1200
    },
    {
      id: 6,
      title: "Barbie",
      image: "images/barbie.jpg",
      rating: "PG-13",
      duration: "1h 54m",
      showtimes: ["11:00 AM", "2:00 PM", "5:00 PM", "8:00 PM"],
      price: 1000
    }
  ],
  premiumScreenings: [
    {
      id: 7,
      title: "Dune: Part Two (IMAX)",
      image: "images/dune2.jpg",
      type: "IMAX",
      showtimes: ["12:30 PM", "4:30 PM", "8:30 PM"],
      price: 1500
    },
    {
      id: 8,
      title: "Oppenheimer (70mm)",
      image: "images/oppenheimer.jpg",
      type: "70mm",
      showtimes: ["1:00 PM", "5:00 PM", "9:00 PM"],
      price: 1800
    },
    {
      id: 9,
      title: "Interstellar (IMAX)",
      image: "images/interstellar.jpg",
      type: "IMAX",
      showtimes: ["11:00 AM", "3:00 PM", "7:00 PM"],
      price: 1500
    },
    {
      id: 10,
      title: "Avatar (3D HFR)",
      image: "images/avatar.jpg",
      type: "3D HFR",
      showtimes: ["10:30 AM", "2:30 PM", "6:30 PM"],
      price: 1600
    }
  ],
  threeDImax: [
    {
      id: 11,
      title: "Avatar: The Way of Water (3D)",
      image: "images/avatar2.jpg",
      type: "3D",
      showtimes: ["11:30 AM", "3:30 PM", "7:30 PM"],
      price: 1400
    },
    {
      id: 12,
      title: "Spider-Man: Across the Spider-Verse (IMAX)",
      image: "images/spiderman.jpg",
      type: "IMAX",
      showtimes: ["10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM"],
      price: 1500
    },
    {
      id: 13,
      title: "Jurassic World Dominion (IMAX)",
      image: "images/jurassicworld.jpg",
      type: "IMAX",
      showtimes: ["12:00 PM", "3:00 PM", "6:00 PM", "9:00 PM"],
      price: 1500
    },
    {
      id: 14,
      title: "Doctor Strange in the Multiverse of Madness (3D)",
      image: "images/doctorstrange.jpg",
      type: "3D",
      showtimes: ["11:00 AM", "2:00 PM", "5:00 PM", "8:00 PM"],
      price: 1400
    }
  ],
  specialOffers: [
    {
      id: 15,
      title: "Family Package",
      description: "4 tickets + 2 large popcorns + 4 drinks",
      price: 4000,
      originalPrice: 5000
    },
    {
      id: 16,
      title: "Matinee Madness",
      description: "All shows before 2pm at 25% off",
      discount: "25% OFF"
    },
    {
      id: 17,
      title: "Student Special",
      description: "50% off on all shows with valid ID",
      discount: "50% OFF"
    }
  ]
};




document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const bookingModal = document.getElementById('bookingModal');
  const modalMovieTitle = document.getElementById('modalMovieTitle');
  const showtimeSelect = document.getElementById('showtime');
  const ticketTypeSelect = document.getElementById('ticketType');
  const quantityInput = document.getElementById('quantity');
  const seatsGrid = document.getElementById('seatsGrid');
  const bookingTable = document.querySelector('#bookingTable tbody');
  const totalPriceElement = document.getElementById('totalPrice');
  const closeBtn = document.querySelector('.close-btn');
  const saveFavoriteBtn = document.getElementById('saveFavorite');
  const applyFavoriteBtn = document.getElementById('applyFavorite');
  const proceedToCheckoutBtn = document.getElementById('proceedToCheckout');
  
  // Booking data
  let currentBooking = {
    movieId: null,
    movieTitle: '',
    showtime: '',
    ticketType: 'standard',
    quantity: 1,
    seats: [],
    price: 0,
    total: 0
  };
  
  // Prices
  const ticketPrices = {
    standard: 1000,
    premium: 1500,
    vip: 2000
  };
  
  // Initialize booking system
  initBookingSystem();
  
  function initBookingSystem() {
    // Add event listeners to all book buttons
    document.querySelectorAll('.book-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const movieCard = e.target.closest('.movie-card');
        const movieId = parseInt(movieCard.dataset.movieId);
        openBookingModal(movieId);
      });
    });
    
    // Add event listeners to offer buttons
    document.querySelectorAll('.offer-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const offerCard = e.target.closest('.offer-card');
        const offerTitle = offerCard.querySelector('h3').textContent;
        alert(`You selected the ${offerTitle} offer. Please select a movie to apply this offer.`);
      });
    });
    
    // Close modal when clicking X
    closeBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
      if (e.target === bookingModal) {
        closeModal();
      }
    });
    
    // Form change listeners
    showtimeSelect.addEventListener('change', updateBooking);
    ticketTypeSelect.addEventListener('change', updateBooking);
    quantityInput.addEventListener('change', updateBooking);
    
    // Action buttons
    saveFavoriteBtn.addEventListener('click', saveFavorite);
    applyFavoriteBtn.addEventListener('click', applyFavorite);
    proceedToCheckoutBtn.addEventListener('click', proceedToCheckout);
    
    // Generate seats
    generateSeats();
  }
  
  function openBookingModal(movieId) {
    // Find the movie in our data
    let movie = null;
    let category = '';
    
    // Check regular movies
    movie = moviesData.movies.find(m => m.id === movieId);
    if (movie) category = 'movies';
    
    // Check premium screenings if not found
    if (!movie) {
      movie = moviesData.premiumScreenings.find(m => m.id === movieId);
      if (movie) category = 'premiumScreenings';
    }
    
    // Check 3D/IMAX if still not found
    if (!movie) {
      movie = moviesData.threeDImax.find(m => m.id === movieId);
      if (movie) category = 'threeDImax';
    }
    
    if (!movie) {
      alert('Movie not found!');
      return;
    }
    
    // Set current booking
    currentBooking.movieId = movieId;
    currentBooking.movieTitle = movie.title;
    currentBooking.price = movie.price || ticketPrices.standard;
    
    // Update modal title
    modalMovieTitle.textContent = movie.title;
    
    // Populate showtimes
    showtimeSelect.innerHTML = '<option value="">Select a showtime</option>';
    movie.showtimes.forEach(time => {
      const option = document.createElement('option');
      option.value = time;
      option.textContent = time;
      showtimeSelect.appendChild(option);
    });
    
    // Reset form
    ticketTypeSelect.value = 'standard';
    quantityInput.value = 1;
    currentBooking.seats = [];
    currentBooking.total = 0;
    
    // Update display
    updateSeatsDisplay();
    updateBookingTable();
    
    // Show modal
    bookingModal.style.display = 'block';
  }
  
  function closeModal() {
    bookingModal.style.display = 'none';
  }
  
  function generateSeats() {
    seatsGrid.innerHTML = '';
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const cols = 10;
    
    rows.forEach(row => {
      for (let i = 1; i <= cols; i++) {
        const seat = document.createElement('div');
        seat.className = 'seat';
        seat.dataset.seat = `${row}${i}`;
        seat.textContent = `${row}${i}`;
        
        // Randomly mark some seats as occupied (for demo)
        if (Math.random() < 0.2) {
          seat.classList.add('occupied');
        }
        
        seat.addEventListener('click', function() {
          if (!this.classList.contains('occupied')) {
            this.classList.toggle('selected');
            updateSelectedSeats();
          }
        });
        
        seatsGrid.appendChild(seat);
      }
    });
  }
  
  function updateSelectedSeats() {
    const selectedSeats = document.querySelectorAll('.seat.selected');
    currentBooking.seats = Array.from(selectedSeats).map(seat => seat.dataset.seat);
    updateBooking();
  }
  
  function updateBooking() {
    currentBooking.showtime = showtimeSelect.value;
    currentBooking.ticketType = ticketTypeSelect.value;
    currentBooking.quantity = parseInt(quantityInput.value);
    
    // Update price based on ticket type
    currentBooking.price = ticketPrices[currentBooking.ticketType] || 1000;
    
    // Calculate total
    const seatCount = currentBooking.seats.length || currentBooking.quantity;
    currentBooking.total = currentBooking.price * seatCount;
    
    updateBookingTable();
  }
  
  function updateBookingTable() {
    bookingTable.innerHTML = '';
    
    if (!currentBooking.showtime) return;
    
    const seatCount = currentBooking.seats.length || currentBooking.quantity;
    const seatDescription = currentBooking.seats.length 
      ? currentBooking.seats.join(', ')
      : `${currentBooking.quantity} General Admission`;
    
    // Add movie row
    addBookingRow(
      currentBooking.movieTitle,
      seatDescription,
      `Rs. ${currentBooking.price}`,
      `Rs. ${currentBooking.price * seatCount}`
    );
    
    // Update total
    totalPriceElement.textContent = `Rs. ${currentBooking.total}`;
  }
  
  function addBookingRow(item, quantity, price, total) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item}</td>
      <td>${quantity}</td>
      <td>${price}</td>
      <td>${total}</td>
    `;
    bookingTable.appendChild(row);
  }
  
  function saveFavorite() {
    if (!currentBooking.showtime) {
      alert('Please complete your booking before saving as favorite.');
      return;
    }
    
    localStorage.setItem('favoriteBooking', JSON.stringify(currentBooking));
    alert('Booking saved as favorite!');
  }
  
  function applyFavorite() {
    const favorite = localStorage.getItem('favoriteBooking');
    
    if (!favorite) {
      alert('No favorite booking found.');
      return;
    }
    
    const favoriteBooking = JSON.parse(favorite);
    
    // Check if the favorite movie is still available
    const movieStillAvailable = [...moviesData.movies, ...moviesData.premiumScreenings, ...moviesData.threeDImax]
      .some(movie => movie.id === favoriteBooking.movieId);
    
    if (!movieStillAvailable) {
      alert('Sorry, your favorite movie is no longer available.');
      return;
    }
    
    // Apply favorite settings
    currentBooking = {...favoriteBooking};
    
    // Update form
    modalMovieTitle.textContent = currentBooking.movieTitle;
    
    // Find the movie to get showtimes
    let movie = null;
    movie = moviesData.movies.find(m => m.id === currentBooking.movieId) || 
            moviesData.premiumScreenings.find(m => m.id === currentBooking.movieId) || 
            moviesData.threeDImax.find(m => m.id === currentBooking.movieId);
    
    if (movie) {
      showtimeSelect.innerHTML = '<option value="">Select a showtime</option>';
      movie.showtimes.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        option.selected = time === currentBooking.showtime;
        showtimeSelect.appendChild(option);
      });
    }
    
    ticketTypeSelect.value = currentBooking.ticketType;
    quantityInput.value = currentBooking.quantity;
    
    // Update seats display
    updateSeatsDisplay();
    updateBookingTable();
    
    alert('Favorite booking applied!');
  }
  
  function updateSeatsDisplay() {
    // Reset all seats
    document.querySelectorAll('.seat').forEach(seat => {
      seat.classList.remove('selected');
      if (!seat.classList.contains('occupied')) {
        seat.classList.add('available');
      }
    });
    
    // Mark selected seats
    currentBooking.seats.forEach(seatId => {
      const seat = document.querySelector(`.seat[data-seat="${seatId}"]`);
      if (seat && !seat.classList.contains('occupied')) {
        seat.classList.add('selected');
      }
    });
  }
  
  function proceedToCheckout() {
    if (!currentBooking.showtime) {
      alert('Please select a showtime.');
      return;
    }
    
    if (currentBooking.seats.length === 0 && currentBooking.quantity <= 0) {
      alert('Please select at least one seat or quantity.');
      return;
    }
    
    // In a real app, this would redirect to a checkout page
    // For this demo, we'll show a confirmation
    
    const bookingDetails = `
      Movie: ${currentBooking.movieTitle}
      Showtime: ${currentBooking.showtime}
      Ticket Type: ${currentBooking.ticketType}
      ${currentBooking.seats.length ? 'Seats: ' + currentBooking.seats.join(', ') : 'Quantity: ' + currentBooking.quantity}
      Total: Rs. ${currentBooking.total}
      
      Booking Reference: ${generateBookingReference()}
    `;
    
    alert(`Booking Confirmed!\n\n${bookingDetails}`);
    closeModal();
  }
  
  function generateBookingReference() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
});


// Using fetch API to load the JSON data
fetch('nowshowing.json')
  .then(response => response.json())
  .then(data => {
    
    console.log(data.movies); // Access movies array
    console.log(data.premiumScreenings); // Access premium screenings
  })
  .catch(error => console.error('Error loading JSON:', error));

  