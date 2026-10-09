import {Link} from "react-router-dom";
import "./HomePage.css";

const stores = [
    {
        name: "SmartCommerce Demo",
        slug: "smartcommerce-demo",
        description: "Explore our electronics and office products.",
        icon: "💻",
    },
    {
        name: "Gaming Store",
        slug: "gaming-store",
        description: "Discover gaming accessories and equipment.",
        icon: "🎮",
    },
    {
        name: "Home Living Store",
        slug: "home-living-store",
        description: "Find useful products for your home.",
        icon: "🏠",
    },
];

function HomePage() {
    return (
        <main className="marketplace">
            <div className="marketplace__intro">
                <h1>Welcome to SmartCommerce</h1>
                <p>Explore our stores and find what you need.</p>
            </div>

            <div className="marketplace__grid">
                {stores.map((store) => (
                    <Link
                        key={store.slug}
                        to={`/shop/${store.slug}/products`}
                        className="marketplace__card"
                    >
            <span className="marketplace__icon" aria-hidden="true">
              {store.icon}
            </span>

                        <h2>{store.name}</h2>
                        <p>{store.description}</p>

                        <span className="marketplace__action">
              Visit store →
            </span>
                    </Link>
                ))}
            </div>
        </main>
    );
}

export default HomePage;
