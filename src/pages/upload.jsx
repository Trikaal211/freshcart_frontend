import React, { useState, useEffect } from "react";
import axios from "axios";
import "./upload.css";

const initialForm = {
  title: "",
  slug: "",
  brand: "",
  subtitle: "",
  description: "",
  price: 0,
  discountPrice: 0,
  discountPercentage: 0,
  quantity: 0,
  weight: "",
  category: "",
  lifestyle: [],
  deliveryInfo: "",
  availability: "In Stock",
  features: [],
  ingredients: "",
  nutritionalInfo: {
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  },
  tags: [],
  shipping: {
    freeShipping: false,
    shippingTime: "",
  },
  metaTitle: "",
  metaDescription: "",
};

const lifestyleOptions = [
  "Gluten Free",
  "Vegan",
  "Keto",
  "Plant-based",
  "Sugar Free",
  "Nut Free",
];
const availabilityOptions = ["In Stock", "Out of Stock", "Pre-order"];

function ProductUpload() {
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);

  // ✅ Fetch categories from backend
  useEffect(() => {
    axios
      .get("https://freshcart-backend-4wrc.onrender.com/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.log("Error fetching categories:", err));
  }, []);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes("nutritionalInfo.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        nutritionalInfo: { ...prev.nutritionalInfo, [key]: value },
      }));
    } else if (name.includes("shipping.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        shipping: { ...prev.shipping, [key]: type === "checkbox" ? checked : value },
      }));
    } else if (type === "checkbox" && name === "lifestyle") {
      let updatedLifestyle = [...form.lifestyle];
      if (checked) updatedLifestyle.push(value);
      else updatedLifestyle = updatedLifestyle.filter((item) => item !== value);
      setForm((prev) => ({ ...prev, lifestyle: updatedLifestyle }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Handle image upload
  const handleImageChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  // ✅ Handle form submit (with token)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Please login first!");
        return;
      }

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      files.forEach((file) => {
        formData.append("images", file);
      });

      // ✅ API call with Authorization header
      const res = await axios.post(
        "https://freshcart-backend-4wrc.onrender.com/products",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // ✅ send user token
          },
        }
      );

      alert("Product uploaded successfully!");
      console.log("Response:", res.data);
      setForm(initialForm);
      setFiles([]);
    } catch (err) {
      console.error("Error uploading product:", err);
      alert("Error uploading product");
    }
  };

  return (
    <div className="product-upload-container">
      <h1>Upload Product</h1>

      <form onSubmit={handleSubmit} className="product-form">
        <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <input type="text" name="slug" placeholder="Slug" value={form.slug} onChange={handleChange} required />
        <input type="text" name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />

        <input type="number" name="price" placeholder="Price" value={form.price} onChange={handleChange} />
        <input type="number" name="discountPrice" placeholder="Discount Price" value={form.discountPrice} onChange={handleChange} />
        <input type="number" name="quantity" placeholder="Quantity" value={form.quantity} onChange={handleChange} />

        <input type="file" name="photos" multiple onChange={handleImageChange} />

        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* ✅ Availability Dropdown */}
        <select name="availability" value={form.availability} onChange={handleChange}>
          {availabilityOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>

        <div>
          <label>Lifestyle:</label>
          {lifestyleOptions.map((opt) => (
            <label key={opt}>
              <input
                type="checkbox"
                name="lifestyle"
                value={opt}
                checked={form.lifestyle.includes(opt)}
                onChange={handleChange}
              />
              {opt}
            </label>
          ))}
        </div>

        <button type="submit">Upload Product</button>
      </form>
    </div>
  );
}

export default ProductUpload;
