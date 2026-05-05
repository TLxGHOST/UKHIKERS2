import useBookings from "../hooks/useBookings";

const AdminBookings = () => {
  const { bookings, loading, approveBooking, rejectBooking } = useBookings();

  if (loading) {
    return <p className="p-6">Loading bookings...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Bookings</h1>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-200">
          <tr>
            <th>Name</th>
            <th>Persons</th>
            <th>Paid</th>
            <th>Remaining</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((b) => (
            <tr key={b._id} className="text-center border-t">
              <td>{b.name}</td>
              <td>{b.persons}</td>

              <td className="text-green-600">₹{b.amountPaid}</td>
              <td className="text-red-500">₹{b.amountRemaining}</td>

              <td>{b.paymentStatus}</td>

              <td className="space-x-2">
                <button
                  onClick={() => approveBooking(b._id)}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() => rejectBooking(b._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBookings;
