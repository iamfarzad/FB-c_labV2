import type React from "react"
import { Link } from "react-router-dom"

const Header: React.FC = () => {
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {/* rest of code here */}
        </ul>
      </nav>
    </header>
  )
}

export default Header
