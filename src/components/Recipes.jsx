import React, { useEffect, useState } from 'react';
import { BsClock } from "react-icons/bs";
import { IoFlashOutline } from "react-icons/io5";
import { FaUserFriends } from "react-icons/fa";
import { Link } from "react-router-dom";
import './recipes.css';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [books, setBooks] = useState([]);

  // Fetch recipes from backend
  const fetchRecipes = async () => {
    try {
      const res = await fetch("http://localhost:3000/recipes"); // backend endpoint
      const data = await res.json();
      setRecipes(data);
    } catch (err) {
      console.error("Error fetching recipes:", err);
    }
  };

  // Fetch books from backend
  const fetchBooks = async () => {
    try {
      const res = await fetch("http://localhost:3000/books"); // backend endpoint
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  };

  useEffect(() => {
    fetchRecipes();
    fetchBooks();
  }, []);

  return (
    <div  className='reci-main'>
      <h2>Recipes</h2>
      <div className='mauka'>
        {/* Left side - Recipes */}
        <div className='left-cover'>
          <div className='left'>
            <div className="rc-list">
            {recipes.map((r) => (
  <Link to={`/recipes/${r._id}`} key={r._id} className="rc-card-link">
    <article className="rc-card">
      <div className="rc-image">
        <img src={r.image} alt={r.title} loading="lazy"/>
      </div>
      <div className="rc-body">
        <h3 className="rc-title">{r.title}</h3>
        <div className="rc-meta">
          <div className="rc-meta-item">
            <BsClock className="rc-icon" />
            <span>{r.time}</span>
          </div>
          <div className="rc-meta-item">
            <IoFlashOutline className="rc-icon" />
            <span>{r.difficulty}</span>
          </div>
          <div className="rc-meta-item">
            <FaUserFriends className="rc-icon" />
            <span>{r.servings} por</span>
          </div>
        </div>
      </div>
    </article>
  </Link>
))}
            </div>
          </div>
        </div>

        {/* Right side - Books */}
        <div className='right-cover'>
          <div className='right'>
            {books.map((b) => (      
              <Link to={`/books/${b._id}`} key={b._id} className="book-card">
                <div className="book-image">
                  <img src={b.image} alt={b.title} />
                </div>
                <div className="book-info">
                  <span className="tag">{b.tag}</span>
                  <h2 className="title">{b.title}</h2>
                  <p className="author">Author: <span>{b.author}</span></p>
                  <p className="price">{b.price}</p>
                  <p className="desc">{b.description.slice(0, 100)}...</p> {/* short preview */}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


export default Recipes;
