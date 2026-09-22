import { Link, Outlet } from "react-router-dom";

function AppLayout() {
  return (
    <>
      <header>
        <nav>
          <Link to="/">SmartCommerce</Link>
          {" | "}
          <Link to="/products">Products</Link>
          {" | "}
          <Link to="/cart">Cart</Link>
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
