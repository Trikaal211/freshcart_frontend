import React, { useState, useEffect } from "react";
import axios from "axios";
import "./upload.css";

const initialForm = {
  title: "",
  slug: "",
  brand: "",
  description: "",
  price: "",
  discountPrice: "",
  quantity: "1",
  weight: "",
  category: "",
  lifestyle: [],
  deliveryInfo: "",
  availability: "In Stock",
  features: "",
  ingredients: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  tags: "",
  freeShipping: false,
  shippingTime: "",
  metaTitle: "",
  metaDescription: "",
};

function ProductUpload() {
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories
  useEffect(() => {
    axios.get("https://freshcart-backend-4wrc.onrender.com/categories")
      .then(res => setCategories(res.data))
      .catch(err => console.error("Category fetch error:", err));
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name === 'lifestyle') {
      let updated = [...form.lifestyle];
      checked ? updated.push(value) : updated = updated.filter(item => item !== value);
      setForm(prev => ({ ...prev, lifestyle: updated }));
    } else if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate file types
    const validFiles = selectedFiles.filter(file => 
      file.type.startsWith('image/')
    );
    
    if (validFiles.length !== selectedFiles.length) {
      alert("Only image files are allowed!");
    }
    
    setFiles(validFiles);
    setPreview(validFiles.map(f => URL.createObjectURL(f)));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Please login first");
        setLoading(false);
        return;
      }

      console.log("Starting upload...");

      const formData = new FormData();
      
      // Append basic fields
      const fields = [
        'title', 'slug', 'brand', 'description', 'price', 'discountPrice',
        'quantity', 'weight', 'category', 'deliveryInfo', 'availability',
        'features', 'ingredients', 'calories', 'protein', 'carbs', 'fat',
        'tags', 'shippingTime', 'metaTitle', 'metaDescription'
      ];
      
      fields.forEach(field => {
        if (form[field] !== undefined && form[field] !== null) {
          formData.append(field, form[field].toString());
        }
      });

      // Append lifestyle as array
      form.lifestyle.forEach(item => {
        formData.append('lifestyle', item);
      });

      // Append checkbox
      formData.append('freeShipping', form.freeShipping.toString());

      // Append files
      files.forEach(file => {
        formData.append('images', file);
      });

      console.log("Sending request with", files.length, "images");

      const response = await axios.post(
        "https://freshcart-backend-4wrc.onrender.com/products",
        formData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30 second timeout
        }
      );

      console.log("✅ Success:", response.data);
      alert("Product uploaded successfully!");
      
      // Reset form
      setForm(initialForm);
      setFiles([]);
      setPreview([]);
      
    } catch (err) {
      console.error("❌ Upload error:", err);
      console.error("Error details:", err.response?.data);
      
      if (err.response?.data?.message) {
        alert(`Upload failed: ${err.response.data.message}`);
      } else if (err.code === 'ECONNABORTED') {
        alert("Request timeout - please try again");
      } else {
        alert("Upload failed. Please check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-wrapper">
      <h2>Upload New Product</h2>

      <form className="upload-form" onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          <input type="text" name="title" placeholder="Product Title *" value={form.title} onChange={handleChange} required />
          <input type="text" name="slug" placeholder="Slug *" value={form.slug} onChange={handleChange} required />
          <input type="text" name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows="3" />
        </div>

        {/* Pricing */}
        <div className="form-section">
          <h3>Pricing & Inventory</h3>
          <div className="grid-2">
            <input type="number" name="price" min="0" step="0.01" placeholder="Price *" value={form.price} onChange={handleChange} required />
            <input type="number" name="discountPrice" min="0" step="0.01" placeholder="Discount Price" value={form.discountPrice} onChange={handleChange} />
          </div>
          <input type="number" name="quantity" min="1" placeholder="Quantity" value={form.quantity} onChange={handleChange} />
        </div>

        {/* Category */}
        <div className="form-section">
          <h3>Category</h3>
          <select name="category" value={form.category} onChange={handleChange} required>
            <option value="">Select Category *</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Images */}
        <div className="form-section">
          <h3>Product Images</h3>
          <input 
            type="file" 
            multiple 
            onChange={handleImageChange} 
            accept="image/*"
            required
          />
          <div className="preview">
            {preview.map((src, i) => (
              <img key={i} src={src} alt={`Preview ${i}`} />
            ))}
          </div>
        </div>

        <button type="submit" className="upload-btn" disabled={loading}>
          {loading ? "Uploading..." : "Upload Product"}
        </button>
      </form>
    </div>
  );
}

export default ProductUpload;