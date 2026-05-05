import { useEffect, useState } from "react";
import api from "../api/axios";

const usePayments = () => {
  const [payments, setPayments] = useState([]);

  const fetchPayments = async () => {
    try {
      const res = await api.get("/payments");
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addPayment = async (data) => {
    await api.post("/payments/add", data);
    fetchPayments();
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return { payments, addPayment };
};

export default usePayments;