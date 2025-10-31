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
    if (!token) {
      alert("⚠️ Please login first");
      return;
    }

    console.log("Starting upload process...");

    // Create FormData
    const formData = new FormData();
    
    // Append basic fields
    const basicFields = [
      'title', 'slug', 'brand', 'description', 'price', 'discountPrice',
      'quantity', 'weight', 'category', 'availability', 'deliveryInfo',
      'ingredients', 'metaTitle', 'metaDescription'
    ];

    basicFields.forEach(field => {
      if (form[field] !== undefined && form[field] !== '') {
        formData.append(field, form[field].toString());
      }
    });

    // Append JSON fields
    if (form.lifestyle.length > 0) {
      formData.append('lifestyle', JSON.stringify(form.lifestyle));
    }

    if (form.tags) {
      const tagsArray = form.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      formData.append('tags', JSON.stringify(tagsArray));
    }

    if (form.features) {
      const featuresArray = form.features.split(',').map(feature => feature.trim()).filter(feature => feature);
      formData.append('features', JSON.stringify(featuresArray));
    }

    formData.append('nutritionalInfo', JSON.stringify(form.nutritionalInfo));
    formData.append('shipping', JSON.stringify(form.shipping));

    // Append files
    if (files.length > 0) {
      files.forEach(file => {
        formData.append('images', file);
      });
    } else {
      console.log("No images selected");
    }

    console.log("Sending request to server...");

    const response = await fetch(
      "https://freshcart-backend-4wrc.onrender.com/products",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          // Don't set Content-Type for FormData - let browser set it with boundary
        },
        body: formData,
      }
    );

    console.log("Response status:", response.status);

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    alert("✅ Product uploaded successfully!");
    console.log("Success response:", data);
    
    // Reset form
    setForm(initialForm);
    setFiles([]);
    setPreview([]);
    
  } catch (err) {
    console.error("❌ UPLOAD ERROR DETAILS:", err);
    
    if (err.message.includes('JSON')) {
      console.error('JSON parsing error - likely HTML response from server');
      alert('Server error: Please check server logs and try again');
    } else {
      alert(err.message || "Upload failed. Check console for details.");
    }
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

<input type="file" multiple onChange={handleImageChange} name="images" />
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
