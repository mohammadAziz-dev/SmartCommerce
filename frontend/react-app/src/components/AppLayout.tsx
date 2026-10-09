import {Link, Outlet, useLocation} from "react-router-dom";
import {useAuth} from "../hooks/useAuth";

function AppLayout() {
    const {user, loading, logout} = useAuth();
    const {pathname} = useLocation();

    const businessSlug = pathname.match(
        /^\/shop\/([^/]+)(?:\/|$)/,
    )?.[1];

    const shopBase = businessSlug
        ? `/shop/${businessSlug}`
        : "";

    const productsPath = `${shopBase}/products`;
    const cartPath = `${shopBase}/cart`;

    return (
        <>
            <header className="site-header">
                <nav className="site-nav" aria-label="Main navigation">
                    <Link to="/" className="site-logo">
                        SmartCommerce
                    </Link>

                    <div className="site-nav__links">
                        <Link to={productsPath}>Products</Link>
                        <Link to={cartPath}>Cart</Link>
                    </div>

                    <div className="site-nav__user">
                        {!loading &&
                            (user ? (
                                <>
                  <span className="site-nav__username">
                    {user.name}
                  </span>
                                    <button type="button" onClick={logout}>
                                        Log out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login">Log in</Link>
                                    <Link to="/register">Register</Link>
                                </>
                            ))}
                    </div>
                </nav>
            </header>

            <main>
                <Outlet/>
            </main>

            <footer className="site-footer">
                <p>© SmartCommerce</p>
            </footer>
        </>
    );
}

export default AppLayout;
