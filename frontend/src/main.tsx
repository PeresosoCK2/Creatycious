import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Login from './pages/Login'
import Register from './pages/Register'
import ListAds from './pages/ads/ListAds'
import CreateAd from './pages/ads/CreateAd'
import EditAd from './pages/ads/EditAd'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/ads' element={<ListAds/>} />
        <Route path='/ads/create' element={<CreateAd/>} />
        <Route path='/ads/edit/:id' element={<EditAd/>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
