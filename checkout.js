document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const checkoutItems = document.getElementById('checkoutItems');
  const checkoutTotal = document.getElementById('checkoutTotal');
  const checkoutForm = document.getElementById('checkoutForm');
  const paymentMethod = document.getElementById('paymentMethod');
  const cardDetails = document.getElementById('cardDetails');
  const confirmation = document.getElementById('confirmation');
  
  // Load cart from localStorage
  const cart = JSON.parse(localStorage.getItem('bookingCart')) || [];
  
  // Display booking summary
  function displayBookingSummary() {
    checkoutItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.movieTitle}</td>
        <td>${item.showtime}</td>
        <td>${item.ticketType}</td>
        <td>${item.quantity}</td>
        <td>Rs. ${item.price}</td>
        <td>Rs. ${item.total}</td>
      `;
      checkoutItems.appendChild(row);
      
      total += item.total;
    });
    
    checkoutTotal.textContent = `Rs. ${total}`;
  }
  
  // Toggle card details based on payment method
  paymentMethod.addEventListener('change', function() {
    if (this.value === 'credit' || this.value === 'debit') {
      cardDetails.style.display = 'block';
    } else {
      cardDetails.style.display = 'none';
    }
  });
  
  // Form submission
  checkoutForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate form
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const paymentType = paymentMethod.value;
    const seatPreference = document.getElementById('seatPreference').value;
    
    if (!fullName || !email || !phone || !paymentType) {
      alert('Please fill in all required fields');
      return;
    }
    
    if ((paymentType === 'credit' || paymentType === 'debit') &&
        (!document.getElementById('cardNumber').value || 
         !document.getElementById('expiryDate').value || 
         !document.getElementById('cvv').value)) {
      alert('Please fill in all payment details');
      return;
    }
    
    // Process payment and show confirmation
    showConfirmation(fullName, email, phone, seatPreference);
  });
  
  // Show confirmation
  function showConfirmation(fullName, email, phone, seatPreference) {
    const total = cart.reduce((sum, item) => sum + item.total, 0);
    const bookingRef = generateBookingReference();
    
    checkoutForm.style.display = 'none';
    confirmation.style.display = 'block';
    
    confirmation.innerHTML = `
      <div class="confirmation-message">
        <h2>Booking Confirmed!</h2>
        <p>Thank you for your booking, ${fullName}!</p>
        <p>A confirmation has been sent to ${email}</p>
        
        <div class="booking-details">
          <h3>Booking Details</h3>
          <table>
            <thead>
              <tr>
                <th>Movie</th>
                <th>Showtime</th>
                <th>Seats</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${cart.map(item => `
                <tr>
                  <td>${item.movieTitle}</td>
                  <td>${item.showtime}</td>
                  <td>${item.quantity} ${item.ticketType} tickets</td>
                  <td>Rs. ${item.total}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3">Grand Total:</td>
                <td>Rs. ${total}</td>
              </tr>
            </tfoot>
          </table>
          
          <div class="confirmation-info">
            <p><strong>Booking Reference:</strong> ${bookingRef}</p>
            <p><strong>Seat Preference:</strong> ${seatPreference}</p>
            <p>Please present this reference at the theater to collect your tickets.</p>
          </div>
        </div>
        
        <div class="confirmation-actions">
          <button id="printTicket" class="btn">Print Ticket</button>
          <button id="returnHome" class="btn btn-primary">Return to Home</button>
        </div>
      </div>
    `;
    
    // Add event listeners to confirmation buttons
    document.getElementById('printTicket').addEventListener('click', function() {
      window.print();
    });
    
    document.getElementById('returnHome').addEventListener('click', function() {
      // Clear cart and return to home
      localStorage.removeItem('bookingCart');
      window.location.href = 'index.html';
    });
  }
  
  // Generate booking reference
  function generateBookingReference() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  // Initialize the page
  displayBookingSummary();
});