import React, { useState, useEffect } from "react";
import UserForm from "./UserForm";
import { Link, useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderIdSearch, setOrderIdSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const itemsPerPage = 5;
  const [productNameSortOrder, setProductNameSortOrder] = useState("asc");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/orders")
      .then((response) => response.json())
      .then((data) => setOrders(data))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleDeleteOrder = (orderId) => {
    const confirmed = window.confirm(
      "Are you sure, you want to remove this order?"
    );

    if (confirmed) {
      fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: "DELETE",
      })
        .then((response) => {
          console.log("Response status:", response.status);
          console.log("Response status text:", response.statusText);
          console.log(orderId);
          if (response.status === 204) {
            setOrders(orders.filter((order) => order.orderId !== orderId));
            return null;
          } else {
            return response.json();
          }
        })
        .then((data) => {
          if (data && !data.success) {
            throw new Error("Failed to delete order.");
          }
        })
        .catch((error) => console.error("Error deleting order:", error));
    }
  };

  const handleSaveOrder = (editedOrder) => {
    const updatedOrders = orders.map((order) =>
      order.orderId === editedOrder.orderId ? editedOrder : order
    );
    setOrders(updatedOrders);

    fetch(`http://localhost:5000/api/orders/${editedOrder.orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedOrder),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          throw new Error("Failed to update order.");
        }
      })
      .catch((error) => console.error("Error updating order:", error));

    setEditIndex(null);
    setSelectedOrder(null);
  };

  const handleEditOrder = (order, index) => {
    setSelectedOrder(order);
    setEditIndex(index);
    const { orderId, productName, category } = order;
    navigate('/userForm', { state: { orderId, productName, category, isEditing: true } });
  };
  

  const handleSort = (columnName) => {
    const newSortOrder = productNameSortOrder === "asc" ? "desc" : "asc";
    setProductNameSortOrder(newSortOrder);
    const sortedOrders = sortOrders(columnName, newSortOrder);
    setOrders(sortedOrders);
  };

  const sortOrders = (column, sortOrder) => {
    return orders.slice().sort((a, b) => {
      const valueA = a[column].toLowerCase();
      const valueB = b[column].toLowerCase();

      if (sortOrder === "asc") {
        return valueA < valueB ? -1 : 1;
      } else {
        return valueA > valueB ? -1 : 1;
      }
    });
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.productName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (orderIdSearch ? order.orderId.includes(orderIdSearch) : true) &&
      (categorySearch
        ? order.category.toLowerCase().includes(categorySearch.toLowerCase())
        : true)
  );
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredOrders.slice(startIndex, endIndex);

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Order List</h1>
      <Link to="/userForm">
        <button type="button" className="btn btn-primary">
          Add Order
        </button>
      </Link>
      <input
        type="text"
        placeholder="Search by product name"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginLeft: "200px", width: "500px" }}
      />
      <table className="table mt-4">
        <thead>
          <tr>
            <th>
              Order Id
              <span onClick={() => handleSort("orderId")}>
                {productNameSortOrder === "asc" ? " ▲" : " ▼"}
              </span>
              <input
                type="text"
                placeholder="Search by Order ID"
                value={orderIdSearch}
                onChange={(e) => setOrderIdSearch(e.target.value)}
              />
            </th>
            <th>
              SKU-Product Name[Product Cat.]
              <span onClick={() => handleSort("productName")}>
                {" "}
                {productNameSortOrder === "asc" ? " ▲" : " ▼"}
              </span>
              <input
                type="text"
                placeholder="Search by Category"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                style={{ marginLeft: "20px", width: "200px" }}
              />
            </th>
            <th>Qty.</th>
            <th>Shipping Type</th>
            <th>Total Amount</th>
            <th>Customer Name</th>
            <th>DOB</th>
            <th>Phone</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((order, index) => (
            <tr key={order.orderId}>
              <td>{order.orderId}</td>
              <td>
                {editIndex === index ? (
                  <UserForm
                    order={selectedOrder}
                    onSave={handleSaveOrder}
                    onCancel={() => {
                      setEditIndex(null);
                      setSelectedOrder(null);
                    }}
                  />
                ) : (
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => handleEditOrder(order, index)}
                  >
                    {order.sku}-{order.productName}-({order.category})
                  </span>
                )}
              </td>
              <td>{order.quantity}</td>
              <td>{order.shippingType}</td>
              <td>{order.totalAmountCharged}</td>
              <td>{order.customerName}</td>
              <td>{order.dob}</td>
              <td>{order.phone}</td>
              <td>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ margin: "10px", width: "150px" }}
                  onClick={() => handleEditOrder(order, index)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ margin: "10px", width: "150px" }}
                  onClick={() => handleDeleteOrder(order.orderId)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ReactPaginate
        previousLabel={"← Previous"}
        nextLabel={"Next →"}
        breakLabel={"..."}
        breakClassName={"break-me"}
        pageCount={Math.ceil(filteredOrders.length / itemsPerPage)}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={"pagination"}
        activeClassName={"active"}
      />
    </div>
  );
};

export default OrderPage;
