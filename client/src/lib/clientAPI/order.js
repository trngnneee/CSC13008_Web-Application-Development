const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const getMyWonOrders = async () => {
  const token = localStorage.getItem("clientToken");

  const res = await fetch(`${baseUrl}/order/won`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
  });

  const data = await res.json();
  return data;
};

export const getMySoldOrders = async () => {
  const token = localStorage.getItem("clientToken");

  const res = await fetch(`${baseUrl}/order/sold`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
  });

  const data = await res.json();
  return data;
};

export const getOrderByProduct = async (id_product) => {
  const token = localStorage.getItem("clientToken");

  const res = await fetch(`${baseUrl}/order/product/${id_product}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
  });

  const data = await res.json();
  return data;
};

export const submitPayment = async (id_order, payment_bill_file, address) => {
  const token = localStorage.getItem("clientToken");

  const formData = new FormData();
  formData.append("id_order", id_order);
  formData.append("address", address);
  if (payment_bill_file) {
    formData.append("payment_bill", payment_bill_file);
  }

  const res = await fetch(`${baseUrl}/order/payment`, {
    method: "POST",
    headers: {
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
    body: formData,
  });

  const data = await res.json();
  return data;
};

export const confirmPayment = async (id_order, b_l_file) => {
  const token = localStorage.getItem("clientToken");

  const formData = new FormData();
  formData.append("id_order", id_order);
  if (b_l_file) {
    formData.append("b_l", b_l_file);
  }

  const res = await fetch(`${baseUrl}/order/confirm-payment`, {
    method: "POST",
    headers: {
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
    body: formData,
  });

  const data = await res.json();
  return data;
};

export const confirmReceived = async (id_order) => {
  const token = localStorage.getItem("clientToken");

  const res = await fetch(`${baseUrl}/order/confirm-received`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
    body: JSON.stringify({ id_order }),
  });

  const data = await res.json();
  return data;
};

export const rateOrder = async (id_order, score, comment) => {
  const token = localStorage.getItem("clientToken");

  const res = await fetch(`${baseUrl}/order/rate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
    body: JSON.stringify({ id_order, score, comment }),
  });

  const data = await res.json();
  return data;
};

export const getRatingStatus = async (id_order) => {
  const token = localStorage.getItem("clientToken");

  const res = await fetch(`${baseUrl}/order/rating-status/${id_order}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
  });

  const data = await res.json();
  return data;
};

export const cancelOrder = async (id_order) => {
  const token = localStorage.getItem("clientToken");

  const res = await fetch(`${baseUrl}/order/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
    body: JSON.stringify({ id_order }),
  });

  const data = await res.json();
  return data;
};
