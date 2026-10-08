import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function AppLayout() {
  const { user, loading, logout } = useAuth();

  return (
    <>
      <header className="site-header">
        <nav className="site-nav" aria-label="Main navigation">
          <Link to="/" className="site-logo">
            SmartCommerce
          </Link>

          <div className="site-nav__links">
            <Link to="/products">Products</Link>
            <Link to="/cart">Cart</Link>
          </div>

          <div className="site-nav__user">
            {!loading &&
              (user ? (
                <>
                  <span className="site-nav__username">{user.name}</span>
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
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>© SmartCommerce</p>
      </footer>
    </>
  );
}

export default AppLayout;
