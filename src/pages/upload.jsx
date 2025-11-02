import React, { useState } from "react";
import axios from "axios";
import "./upload.css";

const Upload = () => {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    brand: "",
    subtitle: "",
    description: "",
    price: "",
    discountPrice: "",
    quantity: "",
    weight: "",
    category: "",
    lifestyle: "",
    deliveryInfo: "",
    uploadedBy: "", // required
  });

  const [images, setImages] = useState([]);

  // 🟢 Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🟢 Handle image files
  const handleFileChange = (e) => {
    setImages([...e.target.files]);
  };

  // 🟢 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      // Append required fields
      formData.append("title", form.title);
      formData.append("slug", form.slug);
      formData.append("brand", form.brand);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("uploadedBy", form.uploadedBy);

      // Optional fields
      if (form.subtitle) formData.append("subtitle", form.subtitle);
      if (form.discountPrice) formData.append("discountPrice", form.discountPrice);
      if (form.quantity) formData.append("quantity", form.quantity);
      if (form.weight) formData.append("weight", form.weight);
      if (form.lifestyle) formData.append("lifestyle", form.lifestyle);
      if (form.deliveryInfo) formData.append("deliveryInfo", form.deliveryInfo);

      // Append multiple images
      images.forEach((img) => {
        formData.append("images", img);
      });

      const res = await axios.post(
        "https://freshcart-backend-4wrc.onrender.com/products",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      alert("✅ Product uploaded successfully!");
      console.log("Response:", res.data);
    } catch (error) {
      console.error("❌ Upload error:", error.response?.data || error.message);
      alert("Error uploading product!");
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Product</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <input type="text" name="title" placeholder="Title" onChange={handleChange} required />
        <input type="text" name="slug" placeholder="Slug" onChange={handleChange} required />
        <input type="text" name="brand" placeholder="Brand" onChange={handleChange} required />
        <textarea name="description" placeholder="Description" onChange={handleChange} required />
        <input type="number" name="price" placeholder="Price" onChange={handleChange} required />
        <input type="text" name="category" placeholder="Category ID" onChange={handleChange} required />
        <input type="text" name="uploadedBy" placeholder="User ID (uploadedBy)" onChange={handleChange} required />

        <input type="text" name="subtitle" placeholder="Subtitle" onChange={handleChange} />
        <input type="number" name="discountPrice" placeholder="Discount Price" onChange={handleChange} />
        <input type="number" name="quantity" placeholder="Quantity" onChange={handleChange} />
        <input type="text" name="weight" placeholder="Weight" onChange={handleChange} />
        <input type="text" name="lifestyle" placeholder="Lifestyle" onChange={handleChange} />
        <input type="text" name="deliveryInfo" placeholder="Delivery Info" onChange={handleChange} />

        <input type="file" multiple onChange={handleFileChange} />

        <button type="submit">Upload Product</button>
      </form>
    </div>
  );
};

export default Upload;
