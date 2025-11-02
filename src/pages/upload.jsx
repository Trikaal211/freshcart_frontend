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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("https://freshcart-backend-4wrc.onrender.com/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("❌ Category fetch error:", err);
        setError("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  // Handle input changes
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
    
    // Clear error when user types
    if (error) setError("");
  };

  // Handle image changes
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    
    // Create preview URLs
    const previewUrls = selectedFiles.map(f => URL.createObjectURL(f));
    setPreview(previewUrls);
    
    // Cleanup old preview URLs
    preview.forEach(url => URL.revokeObjectURL(url));
  };

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Auto-generate slug when title changes
  useEffect(() => {
    if (form.title && !form.slug) {
      setForm(prev => ({
        ...prev,
        slug: generateSlug(prev.title)
      }));
    }
  }, [form.title]);

  // Submit product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("⚠️ Please login first");
        setLoading(false);
        return;
      }

      // ✅ STRICT VALIDATION - Match schema requirements
      if (!form.title || !form.slug || !form.brand || !form.description || !form.price || !form.category) {
        setError("⚠️ Please fill in all required fields: Title, Slug, Brand, Description, Price, and Category");
        setLoading(false);
        return;
      }

      // Validate price
      if (parseFloat(form.price) < 0) {
        setError("⚠️ Price cannot be negative");
        setLoading(false);
        return;
      }

      // Validate discount price
      if (form.discountPrice && parseFloat(form.discountPrice) > parseFloat(form.price)) {
        setError("⚠️ Discount price cannot be greater than original price");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      
      // ✅ Append required fields
      formData.append("title", form.title);
      formData.append("slug", form.slug);
      formData.append("brand", form.brand);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category", form.category);

      // ✅ Append optional fields only if they have values
      if (form.subtitle) formData.append("subtitle", form.subtitle);
      if (form.discountPrice) formData.append("discountPrice", form.discountPrice);
      if (form.quantity) formData.append("quantity", form.quantity.toString());
      if (form.weight) formData.append("weight", form.weight);
      if (form.availability) formData.append("availability", form.availability);
      if (form.deliveryInfo) formData.append("deliveryInfo", form.deliveryInfo);
      if (form.features) formData.append("features", form.features);
      if (form.ingredients) formData.append("ingredients", form.ingredients);
      if (form.metaTitle) formData.append("metaTitle", form.metaTitle);
      if (form.metaDescription) formData.append("metaDescription", form.metaDescription);

      // ✅ Append array/object fields
      if (form.lifestyle.length > 0) {
        formData.append("lifestyle", JSON.stringify(form.lifestyle));
      }
      
      if (form.tags) {
        formData.append("tags", JSON.stringify([form.tags]));
      }

      if (form.nutritionalInfo && Object.values(form.nutritionalInfo).some(val => val !== "")) {
        formData.append("nutritionalInfo", JSON.stringify(form.nutritionalInfo));
      }

      if (form.shipping) {
        formData.append("shipping", JSON.stringify(form.shipping));
      }

      // ✅ Append images
      files.forEach(file => {
        formData.append("images", file);
      });

      console.log("📤 Sending product data to server...");
      
      const res = await axios.post(
        "https://freshcart-backend-4wrc.onrender.com/products",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000,
        }
      );

      alert("✅ Product uploaded successfully!");
      console.log("Server Response:", res.data);
      
      // Reset form
      setForm(initialForm);
      setFiles([]);
      setPreview([]);

    } catch (err) {
      console.error("❌ Upload error:", err);
      
      if (err.response?.data?.details) {
        // Show validation errors from backend
        setError(`Validation errors:\n${err.response.data.details.join('\n')}`);
      } else if (err.response?.data?.error) {
        setError(`Upload failed: ${err.response.data.error}`);
      } else if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        setError("Network error: Please check your internet connection");
      } else if (err.code === 'ECONNABORTED') {
        setError("Request timeout: Please try again");
      } else {
        setError("Upload failed. Please check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setForm(initialForm);
    setFiles([]);
    setPreview([]);
    setError("");
  };

  return (
    <div className="upload-wrapper">
      <div className="upload-header">
        <h2>🛍️ Upload New Product</h2>
        <p>Fill in the details below to add a new product to your store</p>
      </div>

      {error && (
        <div className="error-message">
          {error.split('\n').map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      )}

      <form className="upload-form" onSubmit={handleSubmit}>
        {/* Basic Information */}
        <fieldset className="form-section">
          <legend>📝 Basic Information</legend>
          
          <div className="form-group">
            <label htmlFor="title">Product Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Enter product title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="slug">Slug *</label>
            <input
              type="text"
              id="slug"
              name="slug"
              placeholder="product-url-slug"
              value={form.slug}
              onChange={handleChange}
              required
            />
            <small>Auto-generated from title, but you can customize it</small>
          </div>

          <div className="form-group">
            <label htmlFor="brand">Brand *</label>
            <input
              type="text"
              id="brand"
              name="brand"
              placeholder="Enter brand name"
              value={form.brand}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="subtitle">Subtitle</label>
            <input
              type="text"
              id="subtitle"
              name="subtitle"
              placeholder="Brief product subtitle"
              value={form.subtitle}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              placeholder="Detailed product description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>
        </fieldset>

        {/* Pricing & Inventory */}
        <fieldset className="form-section">
          <legend>💰 Pricing & Inventory</legend>
          
          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="price">Price (₹) *</label>
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="discountPrice">Discount Price (₹)</label>
              <input
                type="number"
                id="discountPrice"
                name="discountPrice"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.discountPrice}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                placeholder="1"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="weight">Weight</label>
              <input
                type="text"
                id="weight"
                name="weight"
                placeholder="e.g., 500g, 1kg"
                value={form.weight}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="availability">Availability</label>
            <select
              id="availability"
              name="availability"
              value={form.availability}
              onChange={handleChange}
            >
              {availabilityOptions.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        {/* Lifestyle & Tags */}
        <fieldset className="form-section">
          <legend>🏷️ Lifestyle & Tags</legend>
          
          <div className="form-group">
            <label>Lifestyle Options</label>
            <div className="checkboxes">
              {lifestyleOptions.map(opt => (
                <label key={opt} className="checkbox-label">
                  <input
                    type="checkbox"
                    name="lifestyle"
                    value={opt}
                    checked={form.lifestyle.includes(opt)}
                    onChange={handleChange}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              placeholder="Add tags separated by commas"
              value={form.tags}
              onChange={handleChange}
            />
          </div>
        </fieldset>

        {/* Nutritional Information */}
        <fieldset className="form-section">
          <legend>🍎 Nutritional Information</legend>
          
          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="calories">Calories</label>
              <input
                type="text"
                id="calories"
                name="nutritionalInfo.calories"
                placeholder="e.g., 100 kcal"
                value={form.nutritionalInfo.calories}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="protein">Protein</label>
              <input
                type="text"
                id="protein"
                name="nutritionalInfo.protein"
                placeholder="e.g., 10g"
                value={form.nutritionalInfo.protein}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="carbs">Carbs</label>
              <input
                type="text"
                id="carbs"
                name="nutritionalInfo.carbs"
                placeholder="e.g., 20g"
                value={form.nutritionalInfo.carbs}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fat">Fat</label>
              <input
                type="text"
                id="fat"
                name="nutritionalInfo.fat"
                placeholder="e.g., 5g"
                value={form.nutritionalInfo.fat}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="ingredients">Ingredients</label>
            <textarea
              id="ingredients"
              name="ingredients"
              placeholder="List of ingredients"
              value={form.ingredients}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="features">Features</label>
            <textarea
              id="features"
              name="features"
              placeholder="Key features of the product"
              value={form.features}
              onChange={handleChange}
              rows="3"
            />
          </div>
        </fieldset>

        {/* Shipping Information */}
        <fieldset className="form-section">
          <legend>🚚 Shipping Information</legend>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="shipping.freeShipping"
                checked={form.shipping.freeShipping}
                onChange={handleChange}
              />
              <span>Free Shipping Available</span>
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="shippingTime">Shipping Time</label>
            <input
              type="text"
              id="shippingTime"
              name="shipping.shippingTime"
              placeholder="e.g., 2-3 days"
              value={form.shipping.shippingTime}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="deliveryInfo">Delivery Information</label>
            <textarea
              id="deliveryInfo"
              name="deliveryInfo"
              placeholder="Additional delivery information"
              value={form.deliveryInfo}
              onChange={handleChange}
              rows="3"
            />
          </div>
        </fieldset>

        {/* Images */}
        <fieldset className="form-section">
          <legend>📸 Product Images</legend>
          
          <div className="form-group">
            <label htmlFor="images">Upload Images (Max 5)</label>
            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
            <small>You can select multiple images. First image will be the main product image.</small>
          </div>

          {preview.length > 0 && (
            <div className="preview-section">
              <label>Image Preview:</label>
              <div className="preview-grid">
                {preview.map((src, index) => (
                  <div key={index} className="preview-item">
                    <img src={src} alt={`Preview ${index + 1}`} />
                    <span>Image {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </fieldset>

        {/* SEO Information */}
        <fieldset className="form-section">
          <legend>🔍 SEO Information</legend>
          
          <div className="form-group">
            <label htmlFor="metaTitle">Meta Title</label>
            <input
              type="text"
              id="metaTitle"
              name="metaTitle"
              placeholder="SEO title for search engines"
              value={form.metaTitle}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="metaDescription">Meta Description</label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              placeholder="SEO description for search engines"
              value={form.metaDescription}
              onChange={handleChange}
              rows="3"
            />
          </div>
        </fieldset>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleReset}
            disabled={loading}
          >
            Reset Form
          </button>
          
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductUpload;