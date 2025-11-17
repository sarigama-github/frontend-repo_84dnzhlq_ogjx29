import { useEffect, useState } from 'react'
import AuthForm from './components/AuthForm'
import Dashboard from './components/Dashboard'

function App() {
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    setAuthed(!!localStorage.getItem('token'))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 flex items-center justify-center p-6">
      {!authed ? (
        <AuthForm onSuccess={()=>setAuthed(true)} onSwitch={()=>{}} mode="login" />
      ) : (
        <Dashboard />)
      }
    </div>
  )
}

export default App
