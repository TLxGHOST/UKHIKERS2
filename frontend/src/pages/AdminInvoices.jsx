import { useEffect, useState } from "react";
import { FileText, Printer, Search, RefreshCw } from "lucide-react";
import api from "../api/axios";

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value || 0));
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const dateLabel = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const AdminInvoices = () => {
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadBookings = async () => {
    setLoading(true); setError("");
    try {
      const response = await api.get("/admin/bookings");
      const rows = response.data?.data || [];
      setBookings(rows);
      const results = await Promise.all(rows.map(async (booking) => {
        try {
          const result = await api.get(`/admin/bookings/${booking._id}/invoice`);
          return [booking._id, result.data?.invoice || null];
        } catch (requestError) {
          if (requestError.response?.status === 404) return [booking._id, null];
          throw requestError;
        }
      }));
      setInvoices(Object.fromEntries(results));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load bookings and invoices.");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadBookings(); }, []);

  const generateInvoice = async (bookingId) => {
    setWorkingId(bookingId); setError(""); setNotice("");
    try {
      const response = await api.post(`/admin/bookings/${bookingId}/invoice`);
      setInvoices((current) => ({ ...current, [bookingId]: response.data.invoice }));
      setNotice(response.data.existing ? "This booking already has an invoice." : "Invoice created successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not generate invoice.");
    } finally { setWorkingId(""); }
  };

  const openInvoice = (invoice) => {
    if (!invoice) return;
    const customer = invoice.customer || {};
    const trek = invoice.trek || {};
    const amounts = invoice.amounts || {};
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(invoice.invoiceNumber)}</title>
<style>body{font-family:Arial,sans-serif;color:#172033;margin:40px;line-height:1.5}header{display:flex;justify-content:space-between;border-bottom:2px solid #172033;padding-bottom:18px}h1{margin:0;font-size:26px}h2{margin-top:30px;font-size:16px}.meta,footer{color:#667085;font-size:12px}.panel{background:#f5f7fa;padding:16px;border-radius:8px;margin-top:22px}table{width:100%;border-collapse:collapse;margin-top:10px}td,th{text-align:left;padding:12px;border-bottom:1px solid #d9dee7}.amount{text-align:right}.total{font-weight:bold;font-size:18px}@media print{body{margin:16mm}.no-print{display:none}}</style></head><body>
<header><div><h1>UK Hikers</h1><div class="meta">Trek booking invoice</div></div><div style="text-align:right"><h1>INVOICE</h1><strong>${escapeHtml(invoice.invoiceNumber)}</strong><div class="meta">Generated: ${escapeHtml(dateLabel(invoice.generatedAt))}</div></div></header>
<div class="panel"><strong>Bill to</strong><div>${escapeHtml(customer.name || "Customer")}</div><div>${escapeHtml(customer.email || "")}</div><div>${escapeHtml(customer.phone || "")}</div></div>
<h2>Booking details</h2><table><tr><th>Trek</th><td>${escapeHtml(trek.name || "Trek booking")}</td></tr><tr><th>Date</th><td>${escapeHtml(dateLabel(trek.date))}</td></tr><tr><th>Participants</th><td>${escapeHtml(trek.persons || 1)}</td></tr><tr><th>Booking status at issue</th><td>${escapeHtml(invoice.bookingStatusAtGeneration || "pending")}</td></tr></table>
<h2>Amount summary</h2><table><tr><th>Total booking amount</th><td class="amount">${escapeHtml(money(amounts.totalAmount))}</td></tr><tr><th>Paid at invoice generation</th><td class="amount">${escapeHtml(money(amounts.amountPaidAtGeneration))}</td></tr><tr><th>Remaining at invoice generation</th><td class="amount">${escapeHtml(money(amounts.amountRemainingAtGeneration))}</td></tr><tr><td class="total">Payment status at issue: ${escapeHtml(invoice.paymentStatusAtGeneration || "pending")}</td><td class="amount total">${escapeHtml(money(amounts.totalAmount))}</td></tr></table>
<footer>This invoice records booking and payment values at the time it was generated. It is not proof of payment by itself.</footer><p class="no-print"><button onclick="window.print()">Print / Save as PDF</button></p></body></html>`;
    const printWindow = window.open("", "_blank");
    if (!printWindow) { setError("Your browser blocked the invoice window. Allow pop-ups for this site and try again."); return; }
    printWindow.opener = null;
    printWindow.document.open(); printWindow.document.write(html); printWindow.document.close();
  };

  const query = search.trim().toLowerCase();
  const filtered = bookings.filter((booking) => !query || booking.name?.toLowerCase().includes(query) || booking.email?.toLowerCase().includes(query) || booking._id?.toLowerCase().includes(query) || booking.trekId?.title?.toLowerCase().includes(query));

  return <section className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-gray-900">Invoices</h1><p className="mt-1 text-sm text-gray-500">Invoices are available only after booking approval and successful confirmation email delivery.</p></div><button onClick={loadBookings} className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50"><RefreshCw className="h-4 w-4" /> Refresh</button></div>
    {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {notice && <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{notice}</div>}
    <div className="flex items-center gap-2 rounded-lg border bg-white px-3"><Search className="h-4 w-4 text-gray-400" /><input className="w-full py-3 outline-none" placeholder="Search customer, trek, email, or booking ID" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
    {loading ? <p className="py-10 text-center text-gray-500">Loading bookings and invoices…</p> : filtered.length === 0 ? <p className="rounded-xl border bg-white p-10 text-center text-gray-500">No bookings found.</p> : <div className="overflow-x-auto rounded-xl border bg-white"><table className="min-w-full divide-y divide-gray-200 text-sm"><thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-4 py-3">Customer / Trek</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Paid</th><th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{filtered.map((booking) => { const invoice = invoices[booking._id]; return <tr key={booking._id}><td className="px-4 py-4"><div className="font-medium text-gray-900">{booking.name || "Customer"}</div><div className="text-gray-500">{booking.trekId?.title || "Trek booking"}</div><div className="mt-1 max-w-xs truncate font-mono text-xs text-gray-400">{booking._id}</div></td><td className="whitespace-nowrap px-4 py-4">{money(booking.totalAmount)}</td><td className="whitespace-nowrap px-4 py-4">{money(booking.amountPaid)}</td><td className="px-4 py-4">{invoice ? <span className="font-mono text-xs text-green-700">{invoice.invoiceNumber}</span> : <span className="text-gray-400">Not generated</span>}</td><td className="px-4 py-4"><div className="flex flex-wrap gap-2">{invoice ? <button onClick={() => openInvoice(invoice)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 hover:bg-gray-50"><Printer className="h-4 w-4" /> Print</button> : booking.bookingStatus !== "approved" ? <span className="text-xs text-gray-500">Available after approval</span> : !booking.approvalEmailSentAt ? <span className="max-w-48 text-xs text-amber-700">Confirmation email not sent. Retry it from Bookings.</span> : <button disabled={workingId === booking._id} onClick={() => generateInvoice(booking._id)} className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-2 text-white hover:bg-gray-700 disabled:opacity-50"><FileText className="h-4 w-4" /> {workingId === booking._id ? "Generating…" : "Generate"}</button>}</div></td></tr>; })}</tbody></table></div>}
  </section>;
};

export default AdminInvoices;
