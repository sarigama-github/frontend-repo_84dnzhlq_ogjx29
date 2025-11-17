import { useEffect, useMemo, useState } from 'react'
import { BarChart3, LogOut, Plus, Wallet } from 'lucide-react'

export default function Dashboard() {
  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ type: 'expense', category: '', amount: '', date: new Date().toISOString().slice(0,10), note: ''})
  const [period, setPeriod] = useState('monthly')
  const [summary, setSummary] = useState([])

  const token = localStorage.getItem('token')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${backend}/transactions`, { headers: { Authorization: `Bearer ${token}` }})
      if (!res.ok) throw new Error('Gagal memuat transaksi')
      const data = await res.json()
      setItems(data)
      const rep = await fetch(`${backend}/reports/summary?period=${period}`, { headers: { Authorization: `Bearer ${token}` }})
      setSummary(await rep.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [period])

  const totals = useMemo(() => {
    const inc = items.filter(i=>i.type==='income').reduce((a,b)=>a+Number(b.amount||0),0)
    const exp = items.filter(i=>i.type==='expense').reduce((a,b)=>a+Number(b.amount||0),0)
    return { income: inc, expense: exp, balance: inc-exp }
  }, [items])

  const addTx = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch(`${backend}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, amount: Number(form.amount) })
      })
      if (!res.ok) throw new Error('Gagal menambah transaksi')
      setForm({ type: 'expense', category: '', amount: '', date: new Date().toISOString().slice(0,10), note: ''})
      fetchData()
    } catch (e) {
      setError(e.message)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      <header className="flex items-center justify-between max-w-5xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2">
          <Wallet className="text-indigo-600" />
          <h1 className="text-xl font-semibold">KeuanganKu</h1>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-sm text-gray-700 hover:text-red-600"><LogOut size={16}/> Keluar</button>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-12">
        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-sm text-gray-500">Pemasukan</p>
            <p className="text-2xl font-semibold text-emerald-600">Rp {totals.income.toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-sm text-gray-500">Pengeluaran</p>
            <p className="text-2xl font-semibold text-rose-600">Rp {totals.expense.toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-sm text-gray-500">Saldo</p>
            <p className={`text-2xl font-semibold ${totals.balance>=0?'text-indigo-700':'text-rose-700'}`}>Rp {totals.balance.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Add Form */}
        <div className="bg-white rounded-xl p-4 shadow mb-6">
          <form onSubmit={addTx} className="grid sm:grid-cols-6 gap-3 items-end">
            <div className="sm:col-span-1">
              <label className="block text-sm mb-1">Tipe</label>
              <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} className="w-full border rounded px-3 py-2">
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Kategori</label>
              <input value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="w-full border rounded px-3 py-2" placeholder="gaji, makan, sewa" required />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm mb-1">Jumlah</label>
              <input type="number" step="0.01" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} className="w-full border rounded px-3 py-2" placeholder="0" required />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm mb-1">Tanggal</label>
              <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="sm:col-span-1">
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded flex items-center justify-center gap-2"><Plus size={16}/> Tambah</button>
            </div>
          </form>
          {error && <p className="text-sm text-rose-600 mt-2">{error}</p>}
        </div>

        {/* Filter & Chart Placeholder */}
        <div className="bg-white rounded-xl p-4 shadow mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-indigo-600"/>
              <p className="font-medium">Ringkasan</p>
            </div>
            <select value={period} onChange={e=>setPeriod(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="daily">Harian</option>
              <option value="monthly">Bulanan</option>
              <option value="yearly">Tahunan</option>
            </select>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {summary.map((s) => (
              <div key={s.label} className="border rounded-lg p-3">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-sm text-emerald-600">+ Rp {Number(s.income).toLocaleString('id-ID')}</p>
                <p className="text-sm text-rose-600">- Rp {Number(s.expense).toLocaleString('id-ID')}</p>
                <p className="text-sm font-medium">= Rp {Number(s.balance).toLocaleString('id-ID')}</p>
              </div>
            ))}
            {summary.length===0 && <p className="text-sm text-gray-500">Belum ada data.</p>}
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-medium mb-3">Transaksi Terbaru</p>
          <div className="space-y-2 max-h-96 overflow-auto pr-1">
            {items.map((t)=> (
              <div key={t.id} className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <p className="font-medium">{t.category}</p>
                  <p className="text-xs text-gray-500">{t.date}</p>
                </div>
                <p className={`font-semibold ${t.type==='income' ? 'text-emerald-600' : 'text-rose-600'}`}>{t.type==='income' ? '+' : '-'} Rp {Number(t.amount).toLocaleString('id-ID')}</p>
              </div>
            ))}
            {items.length===0 && <p className="text-sm text-gray-500">Belum ada transaksi</p>}
          </div>
        </div>
      </main>
    </div>
  )
}
