import { Outlet } from "react-router-dom"
import './layout.css';

const Layout = () => {
  return (
    <div className="public-layout">
      <Outlet />
    </div>
  )
}

export default Layout