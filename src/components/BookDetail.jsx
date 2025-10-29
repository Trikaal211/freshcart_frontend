import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
fetch(`https://freshcart-backend-4wrc.onrender.com/books/${id}`)
      .then((res) => res.json())
      .then((data) => setBook(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!book) return <p>Loading...</p>;

  return (
    <div className="book-detail">
      <img src={book.image} alt={book.title} />
      <h1>{book.title}</h1>
      <p>Author: {book.author}</p>
      <p>{book.description}</p>
      <p>Price: {book.price}</p>
    </div>
  );
};

export default BookDetail;
