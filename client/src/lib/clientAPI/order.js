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

export const submitPayment = async (id_order, payment_bill, address) => {
  const token = localStorage.getItem("clientToken");

  const res = await fetch(`${baseUrl}/order/payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
    body: JSON.stringify({ id_order, payment_bill, address }),
  });

  const data = await res.json();
  return data;
};

export const confirmPayment = async (id_order, b_l) => {
  const token = localStorage.getItem("clientToken");

  const res = await fetch(`${baseUrl}/order/confirm-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
    body: JSON.stringify({ id_order, b_l }),
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

export const rateOrder = async (id_order, rating, comment) => {
  const token = localStorage.getItem("clientToken");

  const res = await fetch(`${baseUrl}/order/rate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
    body: JSON.stringify({ id_order, rating, comment }),
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
