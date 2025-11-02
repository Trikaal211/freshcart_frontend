import React, { useState, useEffect } from "react";
import axios from "axios";
import "./upload.css";

const initialForm = {
  title: "",
  slug: "",
  brand: "",
  subtitle: "",
  description: "",
  price: "",
  discountPrice: "",
  quantity: 1,
  weight: "",
  category: "",
  lifestyle: [],
  deliveryInfo: "",
  availability: "In Stock",
  features: "",
  ingredients: "",
  nutritionalInfo: {
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  },
  tags: "",
  shipping: {
    freeShipping: false,
    shippingTime: "",
  },
  metaTitle: "",
  metaDescription: "",
};

const lifestyleOptions = [
  "Gluten Free", "Vegan", "Keto", "Plant-based", "Sugar Free", "Nut Free"
];
const availabilityOptions = ["In Stock", "Out of Stock", "Pre-order"];

function ProductUpload() {
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState([]);

  // Fetch categories
  useEffect(() => {
    axios.get("https://freshcart-backend-4wrc.onrender.com/categories")
      .then(res => setCategories(res.data))
      .catch(err => console.error("❌ Category fetch error:", err));
  }, []);

  // Handle input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes("nutritionalInfo.")) {
      const key = name.split(".")[1];
      setForm(prev => ({
        ...prev,
        nutritionalInfo: { ...prev.nutritionalInfo, [key]: value },
      }));
    } else if (name.includes("shipping.")) {
      const key = name.split(".")[1];
      setForm(prev => ({
        ...prev,
        shipping: { ...prev.shipping, [key]: type === "checkbox" ? checked : value },
      }));
    } else if (type === "checkbox" && name === "lifestyle") {
      let updated = [...form.lifestyle];
      checked ? updated.push(value) : updated = updated.filter(item => item !== value);
      setForm(prev => ({ ...prev, lifestyle: updated }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle images
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setPreview(selectedFiles.map(f => URL.createObjectURL(f)));
  };

  // Submit product
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return alert("⚠️ Please login first");

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (typeof value === "object") formData.append(key, JSON.stringify(value));
        else formData.append(key, value);
      });

      files.forEach(file => formData.append("images", file));

      const res =await axios.post(
  "https://freshcart-backend-4wrc.onrender.com/products",
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  }
);


      alert("✅ Product uploaded successfully!");
      console.log("Response:", res.data);
      setForm(initialForm);
      setFiles([]);
      setPreview([]);
    } catch (err) {
      console.error("❌ Upload error:", err);
      alert(err.response?.data?.error || "Upload failed. Check console.");
    }
  };

  return (
    <div className="upload-wrapper">
      <h2>🛍️ Upload New Product</h2>

      <form className="upload-form" onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="Product Title" value={form.title} onChange={handleChange} required />
        <input type="text" name="slug" placeholder="Slug" value={form.slug} onChange={handleChange} required />
        <input type="text" name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />

        <div className="grid-2">
          <input type="number" name="price" min="0" placeholder="Price" value={form.price} onChange={handleChange} required />
          <input type="number" name="discountPrice" min="0" placeholder="Discount Price" value={form.discountPrice} onChange={handleChange} />
        </div>

        <input type="number" name="quantity" min="1" placeholder="Quantity" value={form.quantity} onChange={handleChange} />

        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>

        <select name="availability" value={form.availability} onChange={handleChange}>
          {availabilityOptions.map(opt => <option key={opt}>{opt}</option>)}
        </select>

        <div className="checkboxes">
          <label>Lifestyle:</label>
          {lifestyleOptions.map(opt => (
            <label key={opt}>
              <input type="checkbox" name="lifestyle" value={opt}
                checked={form.lifestyle.includes(opt)}
                onChange={handleChange} /> {opt}
            </label>
          ))}
        </div>

        <input type="file" multiple onChange={handleImageChange} />
        <div className="preview">
          {preview.map((src, i) => (
            <img key={i} src={src} alt="preview" />
          ))}
        </div>

        <button type="submit" className="upload-btn">Upload Product</button>
      </form>
    </div>
  );
}

export default ProductUpload;
