import {Link} from "react-router-dom";
import "./HomePage.css";

const stores = [
    {
        name: "SmartOffice Store",
        slug: "smartcommerce-demo",
        description:
            "Discover smart electronics, office essentials, and everything for a productive workspace.",
        image: "/images/stores/smartoffice.jpg",
    },
    {
        name: "Gaming Store",
        slug: "gaming-store",
        description:
            "Upgrade your gaming experience with accessories, gear, and equipment.",
        image: "/images/stores/gaming.jpg",
    },
    {
        name: "Home Living Store",
        slug: "home-living-store",
        description:
            "Make every space feel like home with practical and stylish essentials.",
        image: "/images/stores/home-living.jpg",
    },
];

function HomePage() {
    return (
        <div className="marketplace">
            <section className="marketplace__intro">
        <span className="marketplace__eyebrow">
          YOUR SHOPPING DESTINATION
        </span>
                <h1>Explore our stores</h1>
                <p>
                    Discover curated collections across technology, gaming,
                    and home living. Find your next favorite product.
                </p>
            </section>

            <section
                className="marketplace__stores"
                aria-label="Available stores"
            >
                <div className="marketplace__section-heading">
                    <h2>Shop by store</h2>
                    <p>Choose a store to start exploring.</p>
                </div>

                <div className="marketplace__grid">
                    {stores.map((store) => (
                        <Link
                            key={store.slug}
                            to={`/shop/${store.slug}/products`}
                            className="marketplace__card"
                        >
                            <div className="marketplace__image-wrap">
                                <img
                                    src={store.image}
                                    alt=""
                                    className="marketplace__image"
                                    loading="lazy"
                                />
                            </div>

                            <div className="marketplace__card-content">
                                <h3>{store.name}</h3>
                                <p>{store.description}</p>

                                <span className="marketplace__action">
                  Explore Store <span aria-hidden="true">→</span>
                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default HomePage;
