import React, { useState, useEffect } from "react";
import axios from "axios";
// import { useNavigate } from "react-router-dom";
import "./upload.css";

// Import modern alert icons
import { FaCheck, FaExclamationTriangle, FaTimes } from "react-icons/fa";

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
  const [isLoading, setIsLoading] = useState(false);
  // const navigate = useNavigate();
  
  // Modern Alert States
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState(""); // success, error
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertDuration, setAlertDuration] = useState(3000);

  // Fetch categories
  useEffect(() => {
    axios.get("https://freshcart-backend-4wrc.onrender.com/categories")
      .then(res => setCategories(res.data))
      .catch(err => console.error(" Category fetch error:", err));
  }, []);

  // Modern Alert Function - SIMPLIFIED
  const showModernAlert = (type, title, message, duration = 3000) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertDuration(duration);
    setShowAlert(true);
    
    setTimeout(() => {
      setShowAlert(false);
    }, duration);
  };

  // Close Alert Manually
  const closeAlert = () => {
    setShowAlert(false);
  };

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

  // Submit product - COMPLETELY FIXED
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        showModernAlert("error", "Login Required", "Please login to upload products", 4000);
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (typeof value === "object") formData.append(key, JSON.stringify(value));
        else formData.append(key, value);
      });

      files.forEach(file => formData.append("images", file));

      const res = await axios.post(
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

    const newProductId = res.data._id;      
      console.log("Product uploaded successfully! ID:", newProductId);
      
      // Show success alert
      showModernAlert(
        "success", 
        "Product Uploaded!", 
        "Product successfully uploaded. Redirecting...",
        2000
      );

      // Reset form after successful upload
      setForm(initialForm);
      setFiles([]);
      setPreview([]);

      // ✅ DIRECT REDIRECT - No dependency on state
      setTimeout(() => {
        console.log("Redirecting to all-products with ID:", newProductId);
      window.location.href = `/all-products#product-${newProductId}`;
      }, 2000);

    } catch (err) {
      console.error(" Upload error:", err);
      showModernAlert(
        "error", 
        "Upload Failed", 
        err.response?.data?.error || "Upload failed. Please try again.",
        4000
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      preview.forEach(url => URL.revokeObjectURL(url));
    };
  }, [preview]);

  return (
    <div className="upload-wrapper">
      {/* Modern Alert Component */}
      {showAlert && (
        <div className={`modern-alert ${alertType}-alert`}>
          <div className="alert-content">
            {/* Alert Icon */}
            <div className={`alert-icon ${alertType}-icon`}>
              {alertType === "success" && <FaCheck />}
              {alertType === "error" && <FaExclamationTriangle />}
            </div>
            
            {/* Alert Content */}
            <div className="alert-text">
              <div className="alert-title">{alertTitle}</div>
              <div className="alert-message">{alertMessage}</div>
            </div>
            
            {/* Close Button */}
            <button 
              onClick={closeAlert}
              className="alert-close"
            >
              <FaTimes size={14} />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="alert-progress-bar">
            <div 
              className={`progress-fill ${alertType}-fill`}
              style={{ animationDuration: `${alertDuration}ms` }}
            />
          </div>

          {/* Floating Particles */}
          <div className="alert-particle-1" />
          <div className="alert-particle-2" />
        </div>
      )}

      <h2> Upload New Product</h2>

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

        <button type="submit" className="upload-btn" disabled={isLoading}>
          {isLoading ? "Uploading..." : "Upload Product"}
        </button>
      </form>
    </div>
  );
}

export default ProductUpload;