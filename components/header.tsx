import { Navbar, Nav } from "react-bootstrap"

const Header = () => {
  return (
    <Navbar className="bg-dark-900 border-dark-800">
      <Navbar.Brand href="#home">Brand</Navbar.Brand>
      <Nav className="mr-auto">
        <Nav.Link className="text-gray-400 hover:text-white" href="#home">
          Home
        </Nav.Link>
        <Nav.Link className="text-gray-400 hover:text-white" href="#features">
          Features
        </Nav.Link>
        <Nav.Link className="text-gray-400 hover:text-white" href="#pricing">
          Pricing
        </Nav.Link>
      </Nav>
    </Navbar>
  )
}

export default Header
