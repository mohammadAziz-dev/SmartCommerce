import {Route, Routes, useParams} from "react-router-dom";
import AppLayout from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import {CartPage} from "./pages/CartPage";
import {CheckoutPage} from "./pages/CheckoutPage";
import {RegisterPage} from "./pages/RegisterPage";
import {VerifyEmailPage} from "./pages/VerifyEmailPage";
import {LoginPage} from "./pages/LoginPage";

function BusinessCheckout() {
    const {businessSlug} = useParams<{ businessSlug: string }>();

    return <CheckoutPage key={businessSlug}/>;
}

function App() {
    return (
        <Routes>
            <Route element={<AppLayout/>}>
                <Route path="/" element={<HomePage/>}/>

                {/* Existing routes — backward compatibility */}
                <Route path="/products" element={<ProductPage/>}/>
                <Route path="/cart" element={<CartPage/>}/>
                <Route path="/checkout" element={<CheckoutPage/>}/>

                {/* Business-specific storefront routes */}
                <Route
                    path="/shop/:businessSlug/products"
                    element={<ProductPage/>}
                />
                <Route
                    path="/shop/:businessSlug/cart"
                    element={<CartPage/>}
                />
                <Route
                    path="/shop/:businessSlug/checkout"
                    element={<BusinessCheckout/>}
                />

                {/* Authentication */}
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/verify-email" element={<VerifyEmailPage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
            </Route>
        </Routes>
    );
}

export default App;
