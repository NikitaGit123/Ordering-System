import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import productMasterData from "../Backend/ProductMaster";

// generte uniqur Id
const generateUniqueOrderId = () => {
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return `${randomNumber}`;
};

const UserForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(
    location.state ? location.state.order : {}
  );
  const isEditing = location.state ? location.state.isEditing : false;

  const [formData, setFormData] = useState({
    orderId: generateUniqueOrderId(),
    category: "",
    productName: "",
    sku: "",
    description: "",
    price: 0,
    discount: 0,
    netPrice: 0,
    tax: "",
    quantity: "",
    shippingType: "",
    shippingCharges: 0,
    totalAmountCharged: 0,
    estimatedDelivery: "",
    receiveStatusUpdates: false,
    deliverySignatureRequired: false,
    customerName: "",
    dob: "",
    phone: "",
    agreeToTerms: false,
  });

  const [productNames, setProductNames] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [uniqueCategories, setUniqueCategories] = useState([]);

  //Edint Form
  useEffect(() => {
    // If editing, populate form fields based on the selected product
    if (isEditing && location.state) {
      const { orderId, productName, category } = location.state;
      setSelectedProduct(
        productMasterData.find((product) => product.productName === productName)
      );
      setProductNames([productName]);
      setFormData((prevFormData) => ({
        ...prevFormData,
        orderId,
        productName,
        category,
        sku: selectedProduct?.sku || "",
        description: selectedProduct?.description || "",
        price: selectedProduct?.price || 0,
        discount: selectedProduct?.discount || 0,
      }));
    }
  }, [isEditing, location.state, selectedProduct]);

  const handleEditButtonClick = () => {
    navigate(-1); // Navigate back to the previous page
  };

  //get unique categories
  useEffect(() => {
    // Get unique categories from product master data
    const categories = [
      ...new Set(productMasterData.map((product) => product.category)),
    ];
    setUniqueCategories(categories);
  }, []);

  //Change category
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setFormData({
      ...formData,
      category: selectedCategory,
      productName: "",
      sku: "",
      description: "",
      price: 0,
      discount: 0,
    });

    const productsForCategory = productMasterData.filter(
      (product) => product.category === selectedCategory
    );
    const productNamesForCategory = productsForCategory.map(
      (product) => product.productName
    );
    setProductNames(productNamesForCategory);
  };

  //product name change base on catergory
  const handleProductNameChange = (e) => {
    const selectedProductName = e.target.value;
    const selectedProduct = productMasterData.find(
      (product) => product.productName === selectedProductName
    );
    setFormData((prevFormData) => ({
      ...prevFormData,
      productName: selectedProductName,
      sku: selectedProduct ? selectedProduct.sku : "",
      description: selectedProduct ? selectedProduct.description : "",
      price: selectedProduct ? selectedProduct.price : 0,
      discount: selectedProduct ? selectedProduct.discount : 0,
    }));
  };

  useEffect(() => {
    if (selectedProduct) {
      setFormData((prevData) => ({
        ...prevData,
        sku: selectedProduct.sku,
        description: selectedProduct.description,
        price: selectedProduct.price,
        discount: selectedProduct.discount,
      }));
    }
  }, [selectedProduct]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData({ ...formData, [name]: newValue });
  };

  useEffect(() => {
    // Calculate net price when price or discount changes
    const netPrice = (formData.price * (100 - formData.discount)) / 100;
    setFormData({
      ...formData,
      netPrice: netPrice.toFixed(2), // Round to 2 decimal places
    });
  }, [formData.price, formData.discount]);

  useEffect(() => {
    // Calculate tax based on the selected category
    let taxRate = 0;
    switch (formData.category) {
      case "Clothing":
        taxRate = 5;
        break;
      case "Cosmetics":
        taxRate = 10;
        break;
      case "Electronics":
        taxRate = 15;
        break;
      case "Medicines":
        taxRate = 18;
        break;
      default:
        taxRate = 0;
    }

    // Update tax in the form data
    setFormData({
      ...formData,
      tax: `${taxRate}%`,
    });
  }, [formData.category]);

  //change the quantity
  const handleQuantityChange = (e) => {
    const { value } = e.target;
    const netPrice = (formData.price * (100 - formData.discount)) / 100;
    const totalAmountCharged =
      netPrice * value * (1 + parseFloat(formData.tax) / 100) +
      formData.shippingCharges;
    setFormData({
      ...formData,
      quantity: value,
      netPrice,
      totalAmountCharged,
    });
  };

  //shipping type change
  const handleShippingTypeChange = (e) => {
    const shippingType = e.target.value;
    let shippingCharges = 0;
    let estimatedDelivery = "";

    switch (shippingType) {
      case "Standard":
        shippingCharges = 5;
        estimatedDelivery = calculateEstimatedDelivery(5);
        break;
      case "Two Days":
        shippingCharges = 10;
        estimatedDelivery = calculateEstimatedDelivery(2);
        break;
      case "Next Day":
        shippingCharges = 15;
        estimatedDelivery = calculateEstimatedDelivery(1);
        break;
      default:
        break;
    }

    // total charge count
    const totalAmountCharged =
      formData.netPrice *
        formData.quantity *
        (1 + parseFloat(formData.tax) / 100) +
      shippingCharges;

    setFormData((prevData) => ({
      ...prevData,
      shippingType,
      shippingCharges,
      totalAmountCharged,
      estimatedDelivery, // Update estimated delivery
    }));
  };

  //ca;lculate estiomate delivary
  const calculateEstimatedDelivery = (days) => {
    const today = new Date();
    const estimatedDate = new Date(today);
    estimatedDate.setDate(today.getDate() + days);

    const options = { year: "numeric", month: "short", day: "numeric" };
    return estimatedDate.toLocaleDateString(undefined, options);
  };

  const showTermsAndConditionsAlert = () => {
    alert(
      "Terms and Conditions:\n\n1. ... (add your terms and conditions here)\n\nClick OK to agree."
    );
  };


  const handleUpdate = async () => {
    try {
      // Check if order is defined and has an orderId
      if (!order || !order.orderId) {
        console.error('Invalid order for update.');
        return;
      }
  
      const response = await fetch(`http://localhost:5000/api/orders/${order.orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        window.alert("Order Updated Successfully!");
        navigate('/'); // Navigate to the home page after a successful update
      } else {
        console.error("Failed to update order.");
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };
  

  //form submit POST request
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditing) {
      handleUpdate();
      return; // Return early to prevent default submission for editing
    }

    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        window.alert("Order Placed Successfully!");
        setFormData({
          ...formData,
          orderId: generateUniqueOrderId(),
          category: "",
          productName: "",
          quantity: "",
        });
        console.log(formData.orderId);
      } else {
        console.error("Failed to submit order.");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
    }
  };


  return (
    <div className="container mt-4">
      <h2>{isEditing ? "Edit Order" : "Add Order"}</h2>
      <form onSubmit={handleSubmit} className="form-inline">
        {/* Order Id */}
        <div className="form-group row">
          <label htmlFor="orderId" class="col-sm-2 col-form-label">
            Order Id
          </label>
          <div class="col-sm-10">
            <input
              type="number"
              id="orderId"
              name="orderId"
              value={formData.orderId}
              onChange={handleInputChange}
              disabled
            />
          </div>
        </div>
        {/* Category */}
        <div className="form-group row">
          <label htmlFor="category" class="col-sm-2 col-form-label">
            Category
          </label>
          <div class="col-sm-10">
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
              required
            >
              <option value="">Select Category</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Product Name */}
        <div className="form-group row">
          <label htmlFor="productName" class="col-sm-2 col-form-label">
            Product Name
          </label>
          <div class="col-sm-10">
            <select
              id="productName"
              name="productName"
              value={formData.productName}
              onChange={handleProductNameChange}
              required
            >
              <option value="" disabled>
                Select Product Name
              </option>
              {productNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* SKU */}
        <div className="form-group row">
          <label htmlFor="sku" class="col-sm-2 col-form-label">
            SKU
          </label>
          <div class="col-sm-10">
            <input
              type="text"
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              readOnly
            />
          </div>
        </div>
        {/* Description */}
        <div className="form-group row">
          <label htmlFor="description" class="col-sm-2 col-form-label">
            Description
          </label>
          <div class="col-sm-10">
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        {/* Price */}
        <div className="form-group row">
          <label htmlFor="price" class="col-sm-2 col-form-label">
            Price ($)
          </label>
          <div class="col-sm-10">
            <input
              type="number"
              step="0.01"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              readOnly
            />
          </div>
        </div>
        {/* Discount */}
        <div className="form-group row">
          <label htmlFor="discount" class="col-sm-2 col-form-label">
            Discount (%)
          </label>
          <div class="col-sm-10">
            <input
              type="number"
              step="0.01"
              id="discount"
              name="discount"
              value={formData.discount}
              onChange={handleInputChange}
              readOnly
            />
          </div>
        </div>
        {/* Net Price */}
        <div className="form-group row">
          <label htmlFor="netPrice" class="col-sm-2 col-form-label">
            Net Price ($)
          </label>
          <div class="col-sm-10">
            <input
              type="number"
              step="0.01"
              id="netPrice"
              name="netPrice"
              value={formData.netPrice}
              onChange={handleInputChange}
              readOnly
            />
          </div>
        </div>
        {/* Tax */}
        <div className="form-group row">
          <label htmlFor="tax" class="col-sm-2 col-form-label">
            Tax
          </label>
          <div class="col-sm-10">
            <input
              type="text"
              id="tax"
              name="tax"
              value={formData.tax}
              onChange={handleInputChange}
              readOnly
            />
          </div>
        </div>
        {/* Quantity */}
        <div className="form-group row">
          <label htmlFor="quantity" class="col-sm-2 col-form-label">
            Quantity
          </label>
          <div class="col-sm-10">
            <select
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleQuantityChange}
              required
            >
              <option value="">Select Quantity</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
        </div>
        {/* Shipping Type */}
        <div className="form-group row">
          <label htmlFor="shippingType" class="col-sm-2 col-form-label">
            Shipping Type
          </label>
          <div class="col-sm-10">
            <select
              id="shippingType"
              name="shippingType"
              value={formData.shippingType}
              onChange={handleShippingTypeChange} // Call the function here
              required
            >
              <option value="">Select Shipping Type</option>
              <option value="Standard">Standard</option>
              <option value="Two Days">Two Days</option>
              <option value="Next Day">Next Day</option>
            </select>
          </div>
        </div>
        {/* Shipping Charges */}
        <div className="form-group row">
          <label htmlFor="shippingCharges" class="col-sm-2 col-form-label">
            Shipping Charges ($)
          </label>
          <div class="col-sm-10">
            <input
              type="number"
              step="0.01"
              id="shippingCharges"
              name="shippingCharges"
              value={formData.shippingCharges}
              onChange={handleInputChange}
              readOnly
            />
          </div>
        </div>

        <div className="form-group row">
          <label htmlFor="totalAmountCharged" class="col-sm-2 col-form-label">
            Total Amount Charged ($)
          </label>
          <div class="col-sm-10">
            <input
              type="text"
              id="totalAmountCharged"
              name="totalAmountCharged"
              value={`$${formData.totalAmountCharged.toFixed(2)}`}
              readOnly
            />
          </div>
        </div>

        {/* Estimated Delivery */}
        <div className="form-group row">
          <label htmlFor="estimatedDelivery" class="col-sm-2 col-form-label">
            Estimated Delivery
          </label>
          <div class="col-sm-10">
            <input
              type="text"
              id="estimatedDelivery"
              name="estimatedDelivery"
              value={formData.estimatedDelivery}
              readOnly
            />
          </div>
        </div>
        {/* Receive Status Updates */}
        <div className="form-group row">
          <label class="col-sm-2 col-form-label">Receive Status Updates</label>
          <div class="col-sm-10">
            <input
              type="checkbox"
              id="receiveStatusUpdates"
              name="receiveStatusUpdates"
              checked={formData.receiveStatusUpdates}
              onChange={handleInputChange}
            />
          </div>
        </div>
        {/* Delivery Signature Required */}
        <div className="form-group">
          <div class="col-sm-10">
            <label class="col-sm-2">
              Delivery Signature Required?{" "}
              <input
                type="radio"
                name="deliverySignatureRequired"
                value="Yes"
                checked={formData.deliverySignatureRequired}
                onChange={handleInputChange}
              />{" "}
              Yes{" "}
            </label>
            <label>
              <input
                type="radio"
                name="deliverySignatureRequired"
                value="No"
                checked={!formData.deliverySignatureRequired}
                onChange={handleInputChange}
              />{" "}
              No{" "}
            </label>
          </div>
        </div>
        {/* Customer Name */}
        <div className="form-group row">
          <label htmlFor="customerName" className="col-sm-2 col-form-label">
            Customer Name
          </label>
          <div class="col-sm-10">
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        {/* Date of Birth */}
        <div className="form-group row">
          <label htmlFor="dob" class="col-sm-2 col-form-label">
            DOB
          </label>
          <div class="col-sm-10">
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        {/* Phone */}
        <div className="form-group row">
          <label htmlFor="phone" class="col-sm-2 col-form-label">
            Phone
          </label>
          <div class="col-sm-10">
            <input
              type="tel"
              id="phone"
              name="phone"
              pattern="[0-9]{10}"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        {/* Agree to Terms */}
        <div className="form-group">
          <input
            type="checkbox"
            id="agreeToTerms"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            required
          />
          <span>
            By submitting, I agree to the{" "}
            <a href="#" onClick={showTermsAndConditionsAlert}>
              Terms & Conditions
            </a>
          </span>
        </div>
        {/* Edit Button for when editing */}
         {isEditing && (
          <div className="form-group row">
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleUpdate}
            >
              Update Order
            </button>
          </div>
        )}
        {/* Submit and Cancel Buttons */}
        <div className="form-group">
          <button
            className="btn btn-primary"
            type="submit"
            style={{ margin: "10px", width: "150px" }}
          >
            Submit Order
          </button>
          <Link to="/">
            <button
              className="btn btn-danger"
              type="button"
              style={{ margin: "10px", width: "150px" }}
            >
              Cancel
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
