import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BsClock } from "react-icons/bs";
import { IoFlashOutline } from "react-icons/io5";
import { FaUserFriends } from "react-icons/fa";
import './singleRecipe.css';

const SingleRecipe = () => {
  const { id } = useParams(); // URL se recipe id
  const [recipe, setRecipe] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
const res = await fetch(`https://freshcart-backend-4wrc.onrender.com/recipes/${id}`);
        const data = await res.json();
        setRecipe(data);
      } catch (err) {
        console.error("Error fetching recipe:", err);
      }
    };

    fetchRecipe();
  }, [id]);

  if (!recipe) return <p>Loading...</p>;

  //  Back button function
  const goBackToRecipes = () => {
  navigate("/home#recipes");
    setTimeout(() => {
      const section = document.querySelector("#recipes");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }, 200); // thoda delay taki DOM render ho jaye
  };

  return (
    <div className="single-recipe">
      <button onClick={goBackToRecipes} className="back-btn">
        ← Back to Recipes Section
      </button>

      <div className="recipe-header">
        <h1>{recipe.title}</h1>
        <div className="recipe-meta">
          <div><BsClock /> {recipe.time}</div>
          <div><IoFlashOutline /> {recipe.difficulty}</div>
          <div><FaUserFriends /> {recipe.servings} por</div>
        </div>
      </div>

      <div className="recipe-image">
        <img src={recipe.image} alt={recipe.title} />
      </div>

      <div className="recipe-description">
        <p>{recipe.description}</p>
      </div>
    </div>
  );
};

export default SingleRecipe;
