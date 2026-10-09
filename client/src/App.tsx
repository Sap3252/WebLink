import { BrowserRouter, Routes, Route } from 'react-router'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<div>Login</div>} />
        <Route path="/" element={<div>Feed</div>} />
        <Route path="/u/:username" element={<div>Perfil</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
