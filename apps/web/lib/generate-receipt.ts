import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { formatPrice } from '@/lib/currency'

export async function generateOfficialReceipt(order: any, currentStore: any) {
  if (!order) return

  const receiptRef = (order.id || 'ATELIER').slice(-8).toUpperCase()
  const receiptClient = order.customerName || 'Valued Client'
  const receiptMethod = (order.paymentMethod || 'CARD').toUpperCase()
  const receiptDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
  const currency = currentStore?.currency || 'USD'

  const receiptItems = (order.items && order.items.length > 0)
    ? order.items.map((it: any) => ({
        name: it.productName || it.product_name || 'Garment Piece',
        size: it.selectedSize || it.size || '',
        quantity: Number(it.quantity) || 1,
        price: Number(it.totalPrice || (it.unitPrice * (it.quantity || 1)) || 0)
      }))
    : []

  const finalValuation = Number(order.total || 0)
  const taxRate = Number(currentStore?.taxRate || 0)
  const subtotalValuation = taxRate > 0 ? (finalValuation / (1 + taxRate / 100)) : finalValuation
  const taxValuation = finalValuation - subtotalValuation

  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.top = '-9999px'
  container.style.left = '-9999px'
  container.style.width = '800px'
  container.style.padding = '50px 60px'
  container.style.backgroundColor = '#ffffff'
  container.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  container.style.color = '#1C1917'
  container.setAttribute('dir', 'ltr')

  container.innerHTML = `
    <div style="direction: ltr !important; text-align: left !important;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 35px; border-bottom: 2px solid #E7E5E4; padding-bottom: 25px;">
        <div style="font-size: 26px; font-weight: 800; margin-bottom: 6px; color: #1C1917; text-transform: uppercase; letter-spacing: 2px;">${currentStore?.name || 'DIGITAL STORE'}</div>
        <div style="font-size: 12px; color: #78716C; text-transform: uppercase; letter-spacing: 3px; font-weight: 600;">Official Acquisition Invoice</div>
      </div>
      
      <!-- Meta Info Grid -->
      <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 35px; background-color: #FAFAF9; border-radius: 16px; border: 1px solid #E7E5E4; padding: 18px 24px;">
        <tr>
          <td style="width: 25%; text-align: left; vertical-align: top;">
            <div style="font-size: 10px; font-weight: 700; color: #78716C; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 1px;">Order Reference</div>
            <div style="font-weight: 800; font-size: 15px; font-family: monospace; color: #1C1917;">#${receiptRef}</div>
          </td>
          <td style="width: 25%; text-align: left; vertical-align: top;">
            <div style="font-size: 10px; font-weight: 700; color: #78716C; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 1px;">Date</div>
            <div style="font-weight: 700; font-size: 15px; color: #1C1917;">${receiptDate}</div>
          </td>
          <td style="width: 25%; text-align: left; vertical-align: top;">
            <div style="font-size: 10px; font-weight: 700; color: #78716C; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 1px;">Client</div>
            <div style="font-weight: 700; font-size: 15px; color: #1C1917;">${receiptClient}</div>
          </td>
          <td style="width: 25%; text-align: left; vertical-align: top;">
            <div style="font-size: 10px; font-weight: 700; color: #78716C; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 1px;">Payment Method</div>
            <div style="font-weight: 700; font-size: 15px; color: #1C1917;">${receiptMethod}</div>
          </td>
        </tr>
      </table>
      
      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 35px;">
        <thead>
          <tr style="border-bottom: 2px solid #E7E5E4;">
            <th style="text-align: left; padding: 12px 0; font-size: 11px; font-weight: 700; color: #78716C; text-transform: uppercase; letter-spacing: 1px;">Garment Item</th>
            <th style="text-align: center; padding: 12px 0; font-size: 11px; font-weight: 700; color: #78716C; text-transform: uppercase; letter-spacing: 1px; width: 80px;">Qty</th>
            <th style="text-align: right; padding: 12px 0; font-size: 11px; font-weight: 700; color: #78716C; text-transform: uppercase; letter-spacing: 1px; width: 140px;">Valuation</th>
          </tr>
        </thead>
        <tbody>
          ${receiptItems.map((item: any) => `
            <tr style="border-bottom: 1px solid #F5F5F4;">
              <td style="padding: 16px 0; text-align: left;">
                <div style="font-weight: 700; font-size: 15px; color: #1C1917;">${item.name}</div>
                ${item.size ? `<div style="font-size: 11px; color: #78716C; margin-top: 3px; font-weight: 600;">Size: ${item.size}</div>` : ''}
              </td>
              <td style="padding: 16px 0; text-align: center; font-weight: 600; font-size: 14px; color: #1C1917;">${item.quantity}</td>
              <td style="padding: 16px 0; text-align: right; font-weight: 700; font-size: 15px; color: #1C1917;">${formatPrice(item.price, currency)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <!-- Summary Card -->
      <div style="margin-left: auto; width: 340px; background-color: #FAFAF9; padding: 22px; border-radius: 16px; border: 1px solid #E7E5E4;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px;">
          <span style="color: #78716C; font-weight: 600;">Subtotal</span>
          <span style="font-weight: 700; color: #1C1917;">${formatPrice(subtotalValuation, currency)}</span>
        </div>
        ${taxRate > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px;">
          <span style="color: #78716C; font-weight: 600;">Tax (${taxRate}%)</span>
          <span style="font-weight: 700; color: #1C1917;">${formatPrice(taxValuation, currency)}</span>
        </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px;">
          <span style="color: #78716C; font-weight: 600;">Express Logistics</span>
          <span style="font-weight: 700; color: #047857;">COMPLIMENTARY</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 16px; padding-top: 16px; border-top: 2px solid #E7E5E4; font-size: 20px; font-weight: 800;">
          <span style="color: #1C1917;">Total Valuation</span>
          <span style="color: #CA8A04;">${formatPrice(finalValuation, currency)}</span>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; margin-top: 50px; color: #78716C; font-size: 12px; line-height: 1.6;">
        Thank you for acquiring from <span style="color: #1C1917; font-weight: 700;">${currentStore?.name || 'DIGITAL STORE'}</span>.<br/>
        For private concierge assistance, reach us at <span style="color: #1C1917; font-weight: 600;">${currentStore?.whatsappNumber || 'our atelier concierge'}</span>.
      </div>
    </div>
  `

  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    const imgData = canvas.toDataURL('image/jpeg', 1.0)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`Atelier_Invoice_${receiptRef}.pdf`)
  } catch (error) {
    console.error('Failed to generate PDF:', error)
    alert('Failed to generate invoice PDF.')
  } finally {
    document.body.removeChild(container)
  }
}
