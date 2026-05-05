import { useState } from "react";
import usePayments from "../hooks/usePayments";

const AdminPayments = () => {
  const { payments, addPayment } = usePayments();

  const [bookingId, setBookingId] = useState("");
  const [amount, setAmount] = useState("");

  const handleAdd = () => {
    if (!bookingId || !amount) return;

    addPayment({
      bookingId,
      amount: Number(amount),
      paymentMethod: "cash",
    });

    setBookingId("");
    setAmount("");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Payments</h1>

      {/* Add Payment */}
      <div className="bg-white p-4 mb-6 rounded shadow">
        <h2 className="mb-3">Add Payment</h2>

        <input
          placeholder="Booking ID"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
          className="border p-2 mr-2"
        />

        <input
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 mr-2"
        />

        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-3 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* Payments Table */}
      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-200">
          <tr>
            <th>Booking</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {payments.map((p) => (
            <tr key={p._id} className="text-center border-t">
              <td>{p.bookingId?._id}</td>
              <td className="text-green-600">₹{p.amount}</td>
              <td>{p.paymentType}</td>
              <td>{new Date(p.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPayments;
