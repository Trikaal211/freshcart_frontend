import { BrowserRouter, Routes, Route } from "react-router-dom";
import  CartProvider  from "./components/CartProvider.jsx";
import Navbar from './components/Navbar.jsx';
import Footer from "./components/Footer.jsx";
import ProductDetail from "./components/Productdetail.jsx";
import User from "./pages/User.jsx";
import App from "./App.jsx";
import LifestyleProducts from "./components/Lifestyleproduct.jsx";
import Categories from "./components/Catagories.jsx";
import BookDetail from "./components/BookDetail.jsx";
import SingleRecipe from "./components/singleRecipe.jsx";
import ProductUpload from "./pages/upload.jsx";
import Wishlist from "./components/Wishlist.jsx";

function Routers() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/home" element={<App/>} />
          <Route path="/user" element={<User />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/lifestyle/:type" element={<LifestyleProducts />} />
              <Route path="/books/:id" element={<BookDetail />} />
                <Route path="/recipes/:id" element={<SingleRecipe />} />
            <Route path="/upload-product" element={<ProductUpload />} />
                    <Route path="/wishlist" element={<Wishlist />} />



        </Routes>
        <Footer />
      </BrowserRouter>
    </CartProvider>
  );
}

export default Routers;
