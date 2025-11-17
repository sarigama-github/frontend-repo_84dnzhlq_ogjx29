import { useState } from 'react'

export default function AuthForm({ mode = 'login', onSwitch, onSuccess }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        const res = await fetch(`${backend}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        })
        if (!res.ok) throw new Error((await res.json()).detail || 'Gagal daftar')
        // auto login
        const form = new URLSearchParams()
        form.append('username', email)
        form.append('password', password)
        const loginRes = await fetch(`${backend}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form.toString()
        })
        const token = await loginRes.json()
        localStorage.setItem('token', token.access_token)
        onSuccess && onSuccess()
      } else {
        const form = new URLSearchParams()
        form.append('username', email)
        form.append('password', password)
        const res = await fetch(`${backend}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form.toString()
        })
        if (!res.ok) throw new Error((await res.json()).detail || 'Gagal login')
        const token = await res.json()
        localStorage.setItem('token', token.access_token)
        onSuccess && onSuccess()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white/70 backdrop-blur p-6 rounded-xl shadow">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
        {mode === 'login' ? 'Masuk' : 'Daftar Akun'}
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nama Lengkap</label>
            <input value={name} onChange={e=>setName(e.target.value)} type="text" className="w-full border rounded px-3 py-2" placeholder="Nama kamu" required />
          </div>
        )}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="w-full border rounded px-3 py-2" placeholder="kamu@email.com" required />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Kata Sandi</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full border rounded px-3 py-2" placeholder="••••••" required />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition">
          {loading ? 'Memproses...' : (mode === 'login' ? 'Masuk' : 'Daftar')}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-4">
        {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
        <button className="text-blue-700 hover:underline" onClick={onSwitch}>
          {mode === 'login' ? 'Daftar' : 'Masuk'}
        </button>
      </p>
    </div>
  )
}
