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

    // ✅ Create FormData properly
    const formData = new FormData();
    
    // ✅ Append simple fields
    formData.append("title", form.title);
    formData.append("slug", form.slug);
    formData.append("brand", form.brand);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("discountPrice", form.discountPrice || "");
    formData.append("quantity", form.quantity);
    formData.append("weight", form.weight || "");
    formData.append("category", form.category);
    formData.append("availability", form.availability);
    formData.append("deliveryInfo", form.deliveryInfo || "");
    formData.append("ingredients", form.ingredients || "");
    formData.append("metaTitle", form.metaTitle || "");
    formData.append("metaDescription", form.metaDescription || "");

    // ✅ Append array/object fields as JSON strings
    if (form.lifestyle && form.lifestyle.length > 0) {
      formData.append("lifestyle", JSON.stringify(form.lifestyle));
    }
    
    if (form.tags) {
      formData.append("tags", JSON.stringify(form.tags.split(',').map(tag => tag.trim())));
    }
    
    if (form.nutritionalInfo) {
      formData.append("nutritionalInfo", JSON.stringify(form.nutritionalInfo));
    }
    
    if (form.shipping) {
      formData.append("shipping", JSON.stringify(form.shipping));
    }
    
    if (form.features) {
      formData.append("features", JSON.stringify(form.features.split(',').map(feature => feature.trim())));
    }

    // ✅ Append files
    files.forEach(file => {
      formData.append("images", file);
    });

    console.log("📦 Sending form data...");
    
    const res = await axios.post(
      "https://freshcart-backend-4wrc.onrender.com/products",
      formData,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    alert("✅ Product uploaded successfully!");
    console.log("Response:", res.data);
    
    // Reset form
    setForm(initialForm);
    setFiles([]);
    setPreview([]);
    
  } catch (err) {
    console.error("❌ Upload error:", err);
    console.error("Error response:", err.response?.data);
    alert(err.response?.data?.message || "Upload failed. Check console for details.");
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
