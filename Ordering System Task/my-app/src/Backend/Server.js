const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3000' }));

const PORT = 5000;
const ordersFilePath = 'orders.json'; // Assuming orders are stored in orders.json

app.post('/api/orders', (req, res) => {
  const orderData = req.body;

  // Logic to save orderData to a JSON file
  const data = JSON.parse(fs.readFileSync(ordersFilePath));
  data.orders.push(orderData);
  fs.writeFileSync(ordersFilePath, JSON.stringify(data, null, 2));

  res.status(200).send('Order successfully saved.');
});

app.get('/api/orders', (req, res) => {
  const data = JSON.parse(fs.readFileSync(ordersFilePath));
  res.json(data.orders);
});

app.delete('/api/orders/:orderId', (req, res) => {
  const orderId = req.params.orderId;
  console.log(orderId)
  // Read orders from the file
  const data = JSON.parse(fs.readFileSync(ordersFilePath));
  const orders = data.orders;

  const index = orders.findIndex((order) => order.orderId === orderId);

  if (index !== -1) {
    orders.splice(index, 1);

    // Write updated orders back to the file
    fs.writeFileSync(ordersFilePath, JSON.stringify(data, null, 2));

    res.sendStatus(204); // No Content - Successful deletion
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      window.alert("Order Updated Successfully!");
      // Redirect or update state as needed
    } else {
      console.error("Failed to update order.");
    }
  } catch (error) {
    console.error("Error updating order:", error);
  }
};



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
