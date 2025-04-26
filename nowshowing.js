document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const nowShowingGrid = document.getElementById('nowShowingGrid');
  const upcomingMoviesGrid = document.getElementById('upcomingMoviesGrid');
  const premiumScreeningsGrid = document.getElementById('premiumScreeningsGrid');
  const threeDImaxGrid = document.getElementById('threeDImaxGrid');
  const specialOffersGrid = document.getElementById('specialOffersGrid');
  const bookingItems = document.getElementById('bookingItems');
  const grandTotal = document.getElementById('grandTotal');
  const saveFavoriteBtn = document.getElementById('saveFavorite');
  const applyFavoriteBtn = document.getElementById('applyFavorite');
  const proceedCheckoutBtn = document.getElementById('proceedCheckout');
  const modal = document.getElementById('bookingModal');
  const modalTitle = document.getElementById('modalTitle');
  const showtimeSelect = document.getElementById('showtimeSelect');
  const addToCartBtn = document.getElementById('addToCart');
  const closeBtn = document.querySelector('.close');
  
  // Booking data
  let cart = JSON.parse(localStorage.getItem('bookingCart')) || [];
  let currentMovie = null;
  
  // Load movie data
  fetch('nowshowing.json')
    .then(response => response.json())
    .then(data => {
      displayNowShowing(data.nowShowing);
      displayUpcomingMovies(data.upcomingMovies);
      displayPremiumScreenings(data.premiumScreenings);
      displayThreeDImax(data.threeDImax);
      displaySpecialOffers(data.specialOffers);
      updateBookingSummary();
    })
    .catch(error => console.error('Error loading movie data:', error));
  
  // Display Now Showing movies
  function displayNowShowing(movies) {
    nowShowingGrid.innerHTML = '';
    movies.forEach(movie => createMovieCard(movie, nowShowingGrid));
  }
  
  // Display Upcoming movies
  function displayUpcomingMovies(movies) {
    upcomingMoviesGrid.innerHTML = '';
    movies.forEach(movie => {
      const movieCard = document.createElement('div');
      movieCard.className = 'movie-card';
      
      movieCard.innerHTML = `
        <img src="${movie.image}" alt="${movie.title}">
        <div class="movie-info">
          <h3>${movie.title}</h3>
          <p>Rating: ${movie.rating}</p>
          <p>Release Date: ${movie.releaseDate}</p>
          <p>Genre: ${movie.genre.join(', ')}</p>
          <button class="btn-notify">Notify Me</button>
        </div>
      `;
      
      upcomingMoviesGrid.appendChild(movieCard);
    });
  }
  
  // Display Premium Screenings
  function displayPremiumScreenings(movies) {
    premiumScreeningsGrid.innerHTML = '';
    movies.forEach(movie => createMovieCard(movie, premiumScreeningsGrid));
  }
  
  // Display 3D & IMAX shows
  function displayThreeDImax(movies) {
    threeDImaxGrid.innerHTML = '';
    movies.forEach(movie => createMovieCard(movie, threeDImaxGrid));
  }
  
  // Display Special Offers
  function displaySpecialOffers(offers) {
    specialOffersGrid.innerHTML = '';
    offers.forEach(offer => {
      const offerCard = document.createElement('div');
      offerCard.className = 'offer-card';
      
      offerCard.innerHTML = `
        <div class="offer-header">
          <h3>${offer.title}</h3>
          ${offer.discount ? `<span class="discount-badge">${offer.discount} OFF</span>` : ''}
        </div>
        <div class="offer-body">
          <p>${offer.description}</p>
          ${offer.price ? `<p class="price">Rs. ${offer.price} <span class="original-price">Rs. ${offer.originalPrice}</span></p>` : ''}
          <p class="valid-for">Valid for: ${offer.validFor.join(', ')}</p>
          <button class="btn-apply">Apply Offer</button>
        </div>
        <div class="offer-terms">
          <small>${offer.terms}</small>
        </div>
      `;
      
      specialOffersGrid.appendChild(offerCard);
    });
  }
  
  // Create movie card (reusable function)
function createMovieCard(movie, container) {
  const movieCard = document.createElement('div');
  movieCard.className = 'movie-card';
  movieCard.dataset.movieId = movie.id;
  
  // Format showtimes for display
  const showtimes = movie.showtimes ? 
      movie.showtimes.map(st => `${st.time} (Rs.${st.price})`).join(', ') : 
      'Coming Soon';
  
  movieCard.innerHTML = `
      <img src="${movie.image}" alt="${movie.title}">
      <div class="movie-info">
          <h3>${movie.title}</h3>
          <div class="movie-details">
              <p><strong>Rating:</strong> ${movie.rating}</p>
              ${movie.duration ? `<p><strong>Duration:</strong> ${movie.duration}</p>` : ''}
              ${movie.genre ? `<p><strong>Genre:</strong> ${movie.genre.join(', ')}</p>` : ''}
          </div>
          ${movie.showtimes ? `<button class="btn-book">Book Now</button>` : 
            `<button class="btn-notify">Notify Me</button>`}
      </div>
  `;
  
  // Only add click handler if there are showtimes (for booking)
  if (movie.showtimes) {
      movieCard.addEventListener('click', (e) => {
          // Only open modal if clicking on the card, not the button
          if (!e.target.classList.contains('btn-book')) {
              openBookingModal(movie);
          }
      });
      
      // Add separate click handler for the book button
      movieCard.querySelector('.btn-book').addEventListener('click', () => {
          openBookingModal(movie);
      });
  }
  
  container.appendChild(movieCard);
}
  
  // Open booking modal
  function openBookingModal(movie) {
    currentMovie = movie;
    modalTitle.textContent = `Book Tickets: ${movie.title}`;
    
    // Populate showtimes
    showtimeSelect.innerHTML = '<option value="">Select a showtime</option>';
    movie.showtimes.forEach(showtime => {
      const option = document.createElement('option');
      option.value = showtime.time;
      option.textContent = `${showtime.time} (${showtime.type}) - Rs. ${showtime.price}`;
      option.dataset.price = showtime.price;
      showtimeSelect.appendChild(option);
    });
    
    modal.style.display = 'block';
  }
  
  // Close modal
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Add to cart
  addToCartBtn.addEventListener('click', () => {
    const showtime = showtimeSelect.value;
    const ticketType = document.getElementById('ticketType').value;
    const quantity = parseInt(document.getElementById('ticketQuantity').value);
    const price = parseInt(showtimeSelect.options[showtimeSelect.selectedIndex].dataset.price);
    
    if (!showtime || !ticketType || isNaN(quantity) || quantity < 1) {
      alert('Please complete all fields');
      return;
    }
    
    
    // Add to cart
    
    cart.push({
      movieId: currentMovie.id,
      movieTitle: currentMovie.title,
      showtime,
      ticketType,
      quantity,
      price,
      total: price * quantity
    });
    
    // Save to local storage
    localStorage.setItem('bookingCart', JSON.stringify(cart));
    
    // Update UI
    updateBookingSummary();
    modal.style.display = 'none';
  });
  
  // Update booking summary
  function updateBookingSummary() {
    bookingItems.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.movieTitle}</td>
        <td>${item.showtime}</td>
        <td>${item.ticketType}</td>
        <td>${item.quantity}</td>
        <td>Rs. ${item.price}</td>
        <td>Rs. ${item.total}</td>
        <td><button class="remove-btn" data-index="${index}">Remove</button></td>
      `;
      bookingItems.appendChild(row);
      
      total += item.total;
      
      // Add event listener to remove button
      row.querySelector('.remove-btn').addEventListener('click', () => {
        cart.splice(index, 1);
        localStorage.setItem('bookingCart', JSON.stringify(cart));
        updateBookingSummary();
      });
    });
    
    grandTotal.textContent = `Rs. ${total}`;
    proceedCheckoutBtn.disabled = cart.length === 0;
  }
  
  // Save favorite
  saveFavoriteBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Your cart is empty. Add tickets to save as favorite.');
      return;
    }
    
    localStorage.setItem('favoriteBooking', JSON.stringify(cart));
    alert('Booking saved as favorite!');
  });
  
  // Apply favorite
  applyFavoriteBtn.addEventListener('click', () => {
    const favorite = JSON.parse(localStorage.getItem('favoriteBooking'));
    
    if (!favorite) {
      alert('No favorite booking found.');
      return;
    }
    
    cart = [...favorite];
    localStorage.setItem('bookingCart', JSON.stringify(cart));
    updateBookingSummary();
    alert('Favorite booking applied!');
  });
  
  // Proceed to checkout
  proceedCheckoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Your cart is empty. Add tickets before checkout.');
      return;
    }
    
    window.location.href = 'checkout.html';
  });
});