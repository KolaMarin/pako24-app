import nodemailer from 'nodemailer';

export interface OrderNotificationData {
  orderId: string;
  customerEmail: string;
  customerPhone: string;
  products: {
    url: string;
    quantity: number;
    size: string;
    color: string;
    priceEUR: number;
    priceGBP: number;
    customsFee: number;
    transportFee: number;
    title?: string;
  }[];
  totalPriceEUR: number;
  totalPriceGBP: number;
  totalCustomsFee: number;
  totalTransportFee: number;
  totalFinalPriceEUR: number;
  createdAt: Date;
}

export interface CustomerConfirmationData {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  products: {
    url: string;
    quantity: number;
    size: string;
    color: string;
    priceEUR: number;
    title?: string;
  }[];
  totalFinalPriceEUR: number;
  createdAt: Date;
}

// Create reusable transporter object using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

// Generate HTML template for admin order notification
const generateAdminOrderNotificationHTML = (data: OrderNotificationData): string => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('sq-AL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const productRows = data.products.map((product, index) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 8px; font-size: 14px;">${index + 1}</td>
      <td style="padding: 12px 8px; font-size: 14px;">
        <a href="${product.url}" target="_blank" style="color: #2563eb; text-decoration: none; word-break: break-all;">
          ${product.title || (product.url.length > 50 ? product.url.substring(0, 50) + '...' : product.url)}
        </a>
        <br>
        <small style="color: #6b7280;">
          Madhësia: ${product.size} | Ngjyra: ${product.color}
        </small>
      </td>
      <td style="padding: 12px 8px; font-size: 14px; text-align: center;">${product.quantity}</td>
      <td style="padding: 12px 8px; font-size: 14px; text-align: right;">
        €${product.priceEUR.toFixed(2)}
        <br>
        <small style="color: #6b7280;">£${product.priceGBP.toFixed(2)}</small>
      </td>
      <td style="padding: 12px 8px; font-size: 14px; text-align: right;">
        €${product.customsFee.toFixed(2)}
      </td>
      <td style="padding: 12px 8px; font-size: 14px; text-align: right;">
        €${product.transportFee.toFixed(2)}
      </td>
      <td style="padding: 12px 8px; font-size: 14px; text-align: right; font-weight: 600;">
        €${(product.priceEUR * product.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Porosi e Re - PAKO24</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #374151;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          color: white;
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .header p {
          margin: 10px 0 0 0;
          opacity: 0.9;
        }
        .order-info {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .order-info h2 {
          margin-top: 0;
          color: #1f2937;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        .info-item {
          background: white;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }
        .info-label {
          font-weight: 600;
          color: #6b7280;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .info-value {
          color: #1f2937;
          font-size: 16px;
          margin-top: 5px;
        }
        .products-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .products-table th {
          background: #f3f4f6;
          padding: 15px 8px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }
        .totals {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .total-final {
          font-weight: 700;
          font-size: 18px;
          color: #2563eb;
          border-top: 2px solid #e5e7eb;
          padding-top: 15px;
          margin-top: 10px;
        }
        .action-buttons {
          text-align: center;
          margin: 30px 0;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background: #2563eb;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 0 10px;
        }
        .btn:hover {
          background: #1d4ed8;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚀 Porosi e Re!</h1>
        <p>Një klient i ri ka bërë një porosi në PAKO24</p>
      </div>

      <div class="order-info">
        <h2>Detajet e Porosisë</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">ID e Porosisë</div>
            <div class="info-value">#${data.orderId.slice(0, 8)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Data e Porosisë</div>
            <div class="info-value">${formatDate(data.createdAt)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email i Klientit</div>
            <div class="info-value">${data.customerEmail}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Telefoni i Klientit</div>
            <div class="info-value">${data.customerPhone || 'N/A'}</div>
          </div>
        </div>
      </div>

      <h2>Produktet e Porosisë (${data.products.length} artikuj)</h2>
      <table class="products-table">
        <thead>
          <tr>
            <th>Nr.</th>
            <th>Produkti</th>
            <th style="text-align: center;">Sasia</th>
            <th style="text-align: right;">Çmimi</th>
            <th style="text-align: right;">Dogana</th>
            <th style="text-align: right;">Transport</th>
            <th style="text-align: right;">Totali</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Totali i Produkteve:</span>
          <span>€${data.totalPriceEUR.toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>Dogana:</span>
          <span>€${data.totalCustomsFee.toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>Menaxhimi dhe Transporti:</span>
          <span>€${data.totalTransportFee.toFixed(2)}</span>
        </div>
        <div class="total-row total-final">
          <span>TOTALI PËRFUNDIMTAR:</span>
          <span>€${data.totalFinalPriceEUR.toFixed(2)}</span>
        </div>
      </div>

      <div class="action-buttons">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/orders" class="btn">
          Shiko në Admin Panel
        </a>
      </div>

      <div class="footer">
        <p>Kjo është një njoftim automatik nga sistemi i PAKO24</p>
        <p>Ju lutemi mos përgjigjuni në këtë email</p>
      </div>
    </body>
    </html>
  `;
};

// Generate HTML template for customer confirmation email
const generateCustomerConfirmationHTML = (data: CustomerConfirmationData): string => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('sq-AL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const productRows = data.products.map((product, index) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 8px; font-size: 14px;">${index + 1}</td>
      <td style="padding: 12px 8px; font-size: 14px;">
        <a href="${product.url}" target="_blank" style="color: #2563eb; text-decoration: none; word-break: break-all;">
          ${product.title || (product.url.length > 50 ? product.url.substring(0, 50) + '...' : product.url)}
        </a>
        <br>
        <small style="color: #6b7280;">
          Madhësia: ${product.size} | Ngjyra: ${product.color}
        </small>
      </td>
      <td style="padding: 12px 8px; font-size: 14px; text-align: center;">${product.quantity}</td>
      <td style="padding: 12px 8px; font-size: 14px; text-align: right;">
        €${product.priceEUR.toFixed(2)}
      </td>
      <td style="padding: 12px 8px; font-size: 14px; text-align: right; font-weight: 600;">
        €${(product.priceEUR * product.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Konfirmim Porosie - PAKO24</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #374151;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .header p {
          margin: 10px 0 0 0;
          opacity: 0.9;
        }
        .order-info {
          background: #f0fdf4;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          border-left: 4px solid #10b981;
        }
        .order-info h2 {
          margin-top: 0;
          color: #1f2937;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        .info-item {
          background: white;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #d1fae5;
        }
        .info-label {
          font-weight: 600;
          color: #6b7280;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .info-value {
          color: #1f2937;
          font-size: 16px;
          margin-top: 5px;
        }
        .products-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .products-table th {
          background: #f3f4f6;
          padding: 15px 8px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }
        .total-final {
          background: #f0fdf4;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
          text-align: center;
          font-weight: 700;
          font-size: 24px;
          color: #10b981;
        }
        .message {
          background: #fef3c7;
          padding: 20px;
          border-radius: 8px;
          margin: 30px 0;
          border-left: 4px solid #f59e0b;
        }
        .message h3 {
          margin-top: 0;
          color: #92400e;
        }
        .message p {
          color: #92400e;
          margin-bottom: 0;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>✅ Porosia juaj u konfirmua!</h1>
        <p>Faleminderit për besimin që na tregoni</p>
      </div>

      <div class="order-info">
        <h2>Detajet e Porosisë</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">ID e Porosisë</div>
            <div class="info-value">#${data.orderId.slice(0, 8)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Data e Porosisë</div>
            <div class="info-value">${formatDate(data.createdAt)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email</div>
            <div class="info-value">${data.customerEmail}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Statusi</div>
            <div class="info-value" style="color: #10b981; font-weight: 600;">✅ Konfirmuar</div>
          </div>
        </div>
      </div>

      <h2>Produktet e Porosisë (${data.products.length} artikuj)</h2>
      <table class="products-table">
        <thead>
          <tr>
            <th>Nr.</th>
            <th>Produkti</th>
            <th style="text-align: center;">Sasia</th>
            <th style="text-align: right;">Çmimi</th>
            <th style="text-align: right;">Totali</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
      </table>

      <div class="total-final">
        TOTALI PËRFUNDIMTAR: €${data.totalFinalPriceEUR.toFixed(2)}
      </div>

      <div class="message">
        <h3>📞 Kontakti nga Ekipi</h3>
        <p>Ekipi ynë do t'ju kontaktojë së shpejti për të koordinuar detajet e dërgesës dhe për t'ju dhënë më shumë informacion rreth porosisë suaj.</p>
      </div>

      <div class="footer">
        <p><strong>PAKO24 - Shërbimi juaj i besuar për blerje nga jashtë</strong></p>
        <p>Për çdo pyetje: info.pako24@gmail.com</p>
        <p>Faleminderit për zgjedhjen tuaj!</p>
      </div>
    </body>
    </html>
  `;
};

// Send order notification to admin
export const sendOrderNotificationToAdmin = async (data: OrderNotificationData): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.ADMIN_EMAIL || 'info.pako24@gmail.com',
      subject: `🚀 Porosi e Re #${data.orderId.slice(0, 8)} - €${data.totalFinalPriceEUR.toFixed(2)}`,
      html: generateAdminOrderNotificationHTML(data),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Order notification sent to admin:', result.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send order notification to admin:', error);
    return false;
  }
};

// Send confirmation email to customer
export const sendOrderConfirmationToCustomer = async (data: CustomerConfirmationData): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: data.customerEmail,
      subject: `✅ Porosia juaj u konfirmua - PAKO24 #${data.orderId.slice(0, 8)}`,
      html: generateCustomerConfirmationHTML(data),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Order confirmation sent to customer:', result.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send order confirmation to customer:', error);
    return false;
  }
};

// Test email configuration
export const testEmailConfiguration = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration is invalid:', error);
    return false;
  }
};
