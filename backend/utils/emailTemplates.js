// Payment Receipt (after advance payment)
export const paymentReceiptEmail = (booking, trek) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #EAB308; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
    .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .amount { font-size: 24px; color: #EAB308; font-weight: bold; }
    .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
      .booking-id {
      background: #FEF3C7;
      border: 2px dashed #EAB308;
      padding: 15px;
      text-align: center;
      border-radius: 8px;
      margin: 15px 0;
      font-size: 18px;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏔️ UK Hikers</h1>
      <p>Payment Receipt</p>
    </div>
    <div class="content">
      <p>Dear <strong>${booking.name}</strong>,</p>
      <p>Thank you for your advance payment! Your booking is now pending admin approval.</p>
      
      <div class="details">
        <h3>Booking Details</h3>
        <div class="booking-id">
  <p style="font-size: 12px; color: #666; margin-bottom: 5px;">YOUR BOOKING ID</p>
  <strong style="font-size: 16px; letter-spacing: 0.5px; word-break: break-all;">
    ${booking._id}
  </strong>
  <p style="font-size: 11px; color: #999; margin-top: 5px;">
    Use this full ID to track your booking status
  </p>
</div>
        <p><strong>Trek:</strong> ${trek.title}</p>
        <p><strong>Date:</strong> ${new Date(booking.slotId?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p><strong>Persons:</strong> ${booking.persons}</p>
        <hr>
        <p><strong>Total Amount:</strong> ₹${booking.totalAmount.toLocaleString()}</p>
        <p class="amount">Advance Paid: ₹${booking.amountPaid.toLocaleString()}</p>
        <p><strong>Remaining:</strong> ₹${booking.amountRemaining.toLocaleString()}</p>
      </div>
      
      <p>We'll send you a confirmation once your booking is approved.</p>
      <p>If you have any questions, contact us at ukhikers@gmail.com or +91-6397658159.</p>
    </div>
    <div class="footer">
      <p>UK Hikers | Saraswati Vihar, Ajabpur Khurd, Dehradun</p>
    </div>
  </div>
</body>
</html>
`;

// Booking Confirmation + Invoice (after approval)
export const bookingConfirmationEmail = (booking, trek) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #16A34A; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
    .badge { display: inline-block; background: #16A34A; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; }
    .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .paid { color: #16A34A; font-weight: bold; }
    .pending { color: #EAB308; font-weight: bold; }
    .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
      .booking-id {
      background: #FEF3C7;
      border: 2px dashed #EAB308;
      padding: 15px;
      text-align: center;
      border-radius: 8px;
      margin: 15px 0;
      font-size: 18px;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏔️ Booking Confirmed!</h1>
      <p>Your trek is approved</p>
    </div>
    <div class="content">
      <p>Dear <strong>${booking.name}</strong>,</p>
      <p>Great news! Your booking has been <span class="badge">APPROVED</span></p>
      
      <div class="details">
        <h3>📋 Invoice / Booking Details</h3>
        <div class="booking-id">
  <p style="font-size: 12px; color: #666; margin-bottom: 5px;">YOUR BOOKING ID</p>
  <strong style="font-size: 16px; letter-spacing: 0.5px; word-break: break-all;">
    ${booking._id}
  </strong>
  <p style="font-size: 11px; color: #999; margin-top: 5px;">
    Use this full ID to track your booking status
  </p>
</div>
        <p><strong>Trek:</strong> ${trek.title}</p>
        <p><strong>Date:</strong> ${new Date(booking.slotId?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p><strong>Persons:</strong> ${booking.persons}</p>
        <hr>
        <table width="100%">
          <tr>
            <td><strong>Total Amount</strong></td>
            <td align="right">₹${booking.totalAmount.toLocaleString()}</td>
          </tr>
          <tr>
            <td><strong>Advance Paid</strong></td>
            <td align="right" class="paid">₹${booking.amountPaid.toLocaleString()}</td>
          </tr>
          <tr>
            <td><strong>Remaining Balance</strong></td>
            <td align="right" class="pending">₹${booking.amountRemaining.toLocaleString()}</td>
          </tr>
        </table>
      </div>
      
      ${booking.amountRemaining > 0 ? `
        <p>⚠️ <strong>Remaining amount of ₹${booking.amountRemaining.toLocaleString()} is due before the trek date.</strong></p>
      ` : ''}
      
      <h4>What to Bring:</h4>
      <ul>
        <li>Comfortable trekking shoes</li>
        <li>Warm clothes (temperatures drop at altitude)</li>
        <li>Water bottle & snacks</li>
        <li>Sunscreen & sunglasses</li>
        <li>Personal medications (if any)</li>
      </ul>
      
      <p>We're excited to have you on this adventure! 🏔️</p>
    </div>
    <div class="footer">
      <p>UK Hikers | Saraswati Vihar, Ajabpur Khurd, Dehradun</p>
      <p>📞 +91-6397658159 | ✉️ ukhikers@gmail.com</p>
    </div>
  </div>
</body>
</html>
`;

// Booking Confirmation (when no payment made - Pay Later)
export const bookingConfirmationNoPaymentEmail = (booking, trek) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0EA5E9; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
      .booking-id {
      background: #FEF3C7;
      border: 2px dashed #EAB308;
      padding: 15px;
      text-align: center;
      border-radius: 8px;
      margin: 15px 0;
      font-size: 18px;
      word-break: break-all;
    }
    .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .important { background: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px; margin: 15px 0; border-radius: 4px; }
    .track-btn {
      display: inline-block;
      background: #EAB308;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 10px 0;
    }
    .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏔️ Booking Confirmed!</h1>
      <p>Your trek is booked - Payment pending</p>
    </div>
    <div class="content">
      <p>Dear <strong>${booking.name}</strong>,</p>
      <p>Your booking has been received and is pending admin approval.</p>
      
      <div class="booking-id">
        <p style="font-size: 12px; color: #666; margin-bottom: 5px;">YOUR BOOKING ID</p>
        <div class="booking-id">
  <p style="font-size: 12px; color: #666; margin-bottom: 5px;">YOUR BOOKING ID</p>
  <strong style="font-size: 16px; letter-spacing: 0.5px; word-break: break-all;">
    ${booking._id}
  </strong>
  <p style="font-size: 11px; color: #999; margin-top: 5px;">
    Use this full ID to track your booking status
  </p>
</div>
        <p style="font-size: 11px; color: #999; margin-top: 5px;">
          Save this ID to track your booking status
        </p>
      </div>
      
      <div class="details">
        <h3>📋 Booking Details</h3>
        <p><strong>Trek:</strong> ${trek.title}</p>
        <p><strong>Date:</strong> ${new Date(booking.slotId?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p><strong>Persons:</strong> ${booking.persons}</p>
        <hr>
        <table width="100%">
          <tr>
            <td><strong>Total Amount</strong></td>
            <td align="right" style="font-size: 18px; color: #EAB308;">₹${booking.totalAmount.toLocaleString()}</td>
          </tr>
        </table>
      </div>
      
      <div class="important">
        <p>⚠️ <strong>Payment Pending:</strong> Full amount of ₹${booking.totalAmount.toLocaleString()} is due. Our team will contact you for payment collection.</p>
      </div>
      
      <div style="text-align: center;">
        <p style="margin-bottom: 10px;">Track your booking status anytime:</p>
        <a href="https://yourwebsite.com/track-booking" class="track-btn">
          🔍 Track My Booking
        </a>
      </div>
      
      <p style="margin-top: 15px;">Need help? Contact us at <strong>ukhikers@gmail.com</strong> or <strong>+91-6397658159</strong></p>
    </div>
    <div class="footer">
      <p>UK Hikers | Saraswati Vihar, Ajabpur Khurd, Dehradun</p>
    </div>
  </div>
</body>
</html>
`;