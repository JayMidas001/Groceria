const signUpTemplate = (verifyLink, fullName) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Groceria!</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            background-color: #fff;
          }
          .header {
            background: linear-gradient(90deg, #ff6600, #00cc66);
            padding: 10px;
            text-align: center;
            border-bottom: 1px solid #ddd;
            color: #fff;
            border-radius: 10px 10px 0 0;
          }
          .content {
            padding: 20px;
            color: #333;
          }
          .footer {
            background: #333;
            padding: 10px;
            text-align: center;
            border-top: 1px solid #ddd;
            font-size: 0.9em;
            color: #ccc;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background-color: #ff9900;
            color: #fff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Groceria!</h1>
          </div>
          <div class="content">
            <p>Hello, ${fullName},</p>
            <p>Thank you for joining our community! We're thrilled to have you on board.</p>
            <p>Please click the button below to verify your account:</p>
            <p>
              <a href="${verifyLink}" class="button">Verify My Account</a>
            </p>
            <p>If you did not create an account, please ignore this email.</p>
            <p>Best regards,<br>Groceria Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Groceria. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };
    
    
  const verifyTemplate = (verifyLink, fullName) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Account</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            background-color: #fff;
          }
          .header {
            background: linear-gradient(90deg, #ff6600, #00cc66);
            padding: 10px;
            text-align: center;
            border-bottom: 1px solid #ddd;
            color: #fff;
            border-radius: 10px 10px 0 0;
          }
          .content {
            padding: 20px;
            color: #333;
          }
          .footer {
            background: #333;
            padding: 10px;
            text-align: center;
            border-top: 1px solid #ddd;
            font-size: 0.9em;
            color: #ccc;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background-color: #ff9900;
            color: #fff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Account</h1>
          </div>
          <div class="content">
            <p>Hello, ${fullName},</p>
            <p>We're excited to have you on board! Please click the button below to verify your account:</p>
            <p>
              <a href="${verifyLink}" class="button">Verify My Account</a>
            </p>
            <p>If you did not create an account, please ignore this email.</p>
            <p>Best regards,<br>Groceria Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Groceria. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };
  
  const forgotPasswordTemplate = (resetLink, fullName) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            background-color: #fff;
          }
          .header {
            background: linear-gradient(90deg, #ff6600, #00cc66);
            padding: 10px;
            text-align: center;
            border-bottom: 1px solid #ddd;
            color: #fff;
            border-radius: 10px 10px 0 0;
          }
          .content {
            padding: 20px;
            color: #333;
          }
          .footer {
            background: #333;
            padding: 10px;
            text-align: center;
            border-top: 1px solid #ddd;
            font-size: 0.9em;
            color: #ccc;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background-color: #ff9900;
            color: #fff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Hello, ${fullName},</p>
            <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
            <p>Click the button below to reset your password:</p>
            <p>
              <a href="${resetLink}" class="button">Reset Password</a>
            </p>
            <p>Best regards,<br>Groceria Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Groceria. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };
  
  const passwordChangeTemplate = (fullName) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successfully</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            background-color: #fff;
          }
          .header {
            background: linear-gradient(90deg, #ff6600, #00cc66);
            padding: 10px;
            text-align: center;
            border-bottom: 1px solid #ddd;
            color: #fff;
            border-radius: 10px 10px 0 0;
          }
          .content {
            padding: 20px;
            color: #333;
          }
          .footer {
            background: #333;
            padding: 10px;
            text-align: center;
            border-top: 1px solid #ddd;
            font-size: 0.9em;
            color: #ccc;
            border-radius: 0 0 10px 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Changed Successfully</h1>
          </div>
          <div class="content">
            <p>Hello, ${fullName},</p>
            <p>We received a request to reset your password, and your password has been successfully changed.
            If you did not approve this change kindly reach out to the Admin.</p>
            <p>Best regards,<br>Groceria Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Groceria. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };
  
  const newOrderNotificationTemplate = (merchantName, userName, userEmail, userAddress, userOrderId, orderDate, items, totalPrice) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Notification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            background-color: #fff;
          }
          .header {
            background: linear-gradient(90deg, #ff6600, #00cc66);
            padding: 10px;
            text-align: center;
            border-bottom: 1px solid #ddd;
            color: #fff;
            border-radius: 10px 10px 0 0;
          }
          .content {
            padding: 20px;
            color: #333;
          }
          .order-details {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .order-details th, .order-details td {
            padding: 8px;
            border: 1px solid #ddd;
          }
          .order-details th {
            text-align: left;
            background-color: #f2f2f2;
          }
          .footer {
            background: #333;
            padding: 10px;
            text-align: center;
            font-size: 0.9em;
            color: #ccc;
            border-radius: 0 0 10px 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Order Notification</h1>
          </div>
          <div class="content">
            <p>Hello, ${merchantName},</p>
            <p>We are pleased to inform you that a new order has been placed by ${userName}, contact information: (${userEmail}).</p>
            <p>Order Details:</p>
            <table class="order-details">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Order Date</th>
                  <th>Total Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${userOrderId}</td>
                  <td>${orderDate}</td>
                  <td>₦${totalPrice}</td>
                </tr>
              </tbody>
            </table>
  
            <h2>Items Ordered</h2>
            <table class="order-details">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
  
            <h2>Shipping Address</h2>
            <p>${userAddress}</p>
  
            <p>Please take necessary actions to process this order.</p>
            <p>Best regards,<br>Groceria Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Groceria. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };
  const orderConfirmationTemplate = (fullName, userOrderId, orderDate, items, totalAmount, deliveryCharge) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f7f7f7;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 40px auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                background-color: #fff;
            }
            .header {
                background: linear-gradient(90deg, #00cc66, #ff6600);
                padding: 10px;
                text-align: center;
                border-bottom: 1px solid #ddd;
                color: #fff;
                border-radius: 10px 10px 0 0;
            }
            .content {
                padding: 20px;
                color: #333;
            }
            .order-details {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            .order-details th, .order-details td {
                padding: 8px;
                border: 1px solid #ddd;
            }
            .order-details th {
                text-align: left;
                background-color: #f2f2f2;
            }
            .items-ordered {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            .items-ordered th, .items-ordered td {
                padding: 8px;
                border: 1px solid #ddd;
            }
            .items-ordered th {
                text-align: left;
                background-color: #f2f2f2;
            }
            .footer {
                background: #333;
                padding: 10px;
                text-align: center;
                font-size: 0.9em;
                color: #ccc;
                border-radius: 0 0 10px 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Order Confirmation</h1>
            </div>
            <div class="content">
                <p>Hello, ${fullName},</p>
                <p>We are pleased to confirm that your order has been successfully placed. Below are the details of your order:</p>
                <table class="order-details">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Order Date</th>
                            <th>Total Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${userOrderId}</td>
                            <td>${orderDate}</td>
                            <td>₦${totalAmount}</td>
                        </tr>
                    </tbody>
                </table>

                <h2>Items Ordered</h2>
                <table class="items-ordered">
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Quantity</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td>${item.productName}</td>
                                <td>${item.quantity}</td>
                                <td>₦${item.price}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <h2>Order Summary</h2>
                <table class="order-details">
                    <tbody>
                        <tr>
                            <td>Subtotal:</td>
                            <td>₦${totalAmount - deliveryCharge}</td>
                        </tr>
                        <tr>
                            <td>Shipping Cost:</td>
                            <td>₦${deliveryCharge}</td>
                        </tr>
                        <tr>
                            <td><strong>Total:</strong></td>
                            <td><strong>₦${totalAmount}</strong></td>
                        </tr>
                    </tbody>
                </table>

                <p>Thank you for shopping with us!</p>
                <p>Best regards,<br>Groceria Team</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Groceria. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

    module.exports = { signUpTemplate, verifyTemplate, forgotPasswordTemplate, passwordChangeTemplate, orderConfirmationTemplate, newOrderNotificationTemplate};
    