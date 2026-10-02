import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function AppLayout() {
  const { user, loading, logout } = useAuth();

  return (
    <>
      <header>
        <nav>
          <Link to="/">SmartCommerce</Link>
          {" | "}
          <Link to="/products">Products</Link>
          {" | "}
          <Link to="/cart">Cart</Link>

          {!loading && (
            <>
              {" | "}
              {user ? (
                <>
                  <span>{user.name}</span>
                  {" | "}
                  <button type="button" onClick={logout}>
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">Log in</Link>
                  {" | "}
                  <Link to="/register">Register</Link>
                </>
              )}
            </>
          )}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer>
        <p>© SmartCommerce</p>
      </footer>
    </>
  );
}

export default AppLayout;
