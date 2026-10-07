import { useEffect, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
  type ChartOptions,
} from 'chart.js'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  Clock3,
  LayoutDashboard,
  MapPin,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import './App.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

type Status = 'Applied' | 'Interview' | 'Offer' | 'Rejected'
type User = {
  name: string
  email: string
}

type Application = {
  id: string
  company: string
  role: string
  location: string
  type: string
  appliedAt: string
  status: Status
  color: string
  mark: string
  interviewDate?: string
}

type ApplicationForm = Omit<Application, 'id' | 'color' | 'mark'>

const statusOrder: Status[] = ['Applied', 'Interview', 'Offer', 'Rejected']
const statusColors: Record<Status, string> = {
  Applied: '#4772e8',
  Interview: '#e99a3c',
  Offer: '#409b78',
  Rejected: '#dd6a59',
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const TEST_USER = {
  name: 'Jamie Davis',
  email: 'test@jobtracker.com',
  password: 'password123',
}

const starterApplications: Application[] = [
  { id: 'a1', company: 'Linear', role: 'Product Designer', location: 'Remote', type: 'Full-time', appliedAt: '2026-09-28', status: 'Interview', color: '#6957d9', mark: 'L', interviewDate: '2026-10-07' },
  { id: 'a2', company: 'Figma', role: 'Senior UX Designer', location: 'New York, NY', type: 'Full-time', appliedAt: '2026-09-25', status: 'Applied', color: '#262626', mark: 'F' },
  { id: 'a3', company: 'Notion', role: 'Product Designer', location: 'San Francisco, CA', type: 'Full-time', appliedAt: '2026-09-22', status: 'Offer', color: '#222222', mark: 'N' },
  { id: 'a4', company: 'Vercel', role: 'Design Engineer', location: 'Remote', type: 'Full-time', appliedAt: '2026-09-19', status: 'Interview', color: '#171717', mark: '▲', interviewDate: '2026-10-09' },
  { id: 'a5', company: 'Airtable', role: 'UX Designer', location: 'Remote', type: 'Contract', appliedAt: '2026-09-16', status: 'Rejected', color: '#e95645', mark: 'A' },
  { id: 'a6', company: 'Webflow', role: 'Product Designer', location: 'Remote', type: 'Full-time', appliedAt: '2026-09-12', status: 'Applied', color: '#4353ff', mark: 'W' },
  { id: 'a7', company: 'Ramp', role: 'Brand Designer', location: 'New York, NY', type: 'Full-time', appliedAt: '2026-09-08', status: 'Applied', color: '#111827', mark: 'R' },
]

const blankForm: ApplicationForm = {
  company: '', role: '', location: '', type: 'Full-time', appliedAt: new Date().toISOString().slice(0, 10), status: 'Applied',
}

function readApplications(): Application[] {
  try {
    const saved = localStorage.getItem('job-search-tracker-applications') ?? localStorage.getItem('daymark-applications')
    return saved ? JSON.parse(saved) as Application[] : starterApplications
  } catch {
    return starterApplications
  }
}

function readToken(): string | null {
  try {
    return localStorage.getItem('job-search-tracker-token')
  } catch {
    return null
  }
}

function readCurrentUser(): User | null {
  try {
    const saved = localStorage.getItem('job-search-tracker-user')
    return saved ? JSON.parse(saved) as User : null
  } catch {
    return null
  }
}

function mapApplicationFromBackend(item: any): Application {
  const baseDate = item.dateApplied ? new Date(item.dateApplied).toISOString().slice(0, 10) : new Date(item.createdAt ?? Date.now()).toISOString().slice(0, 10)
  const company = item.company || 'Unknown company'
  const firstLetter = company.trim().slice(0, 1).toUpperCase() || 'J'

  return {
    id: item._id || item.id,
    company,
    role: item.role || 'Role',
    location: item.location || 'Remote',
    type: item.type || 'Full-time',
    appliedAt: baseDate,
    status: item.status || 'Applied',
    color: item.color || '#476a60',
    mark: firstLetter,
    interviewDate: item.interviewDate ? new Date(item.interviewDate).toISOString().slice(0, 10) : undefined,
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`))
}

function App() {
  const [applications, setApplications] = useState<Application[]>(readApplications)
  const [user, setUser] = useState<User | null>(readCurrentUser)
  const [token, setToken] = useState<string | null>(readToken)
  const [loginForm, setLoginForm] = useState({ name: '', email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [isSignUp, setIsSignUp] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | Status>('All')
  const [activeNav, setActiveNav] = useState('Overview')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [editing, setEditing] = useState<Application | null>(null)
  const [form, setForm] = useState<ApplicationForm>(blankForm)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    localStorage.setItem('job-search-tracker-applications', JSON.stringify(applications))
  }, [applications])

  useEffect(() => {
    if (user) {
      localStorage.setItem('job-search-tracker-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('job-search-tracker-user')
    }
  }, [user])

  useEffect(() => {
    if (token) {
      localStorage.setItem('job-search-tracker-token', token)
    } else {
      localStorage.removeItem('job-search-tracker-token')
    }
  }, [token])

  useEffect(() => {
    if (!user || !token) return

    async function fetchApplications() {
      try {
        const response = await fetch(`${API_URL}/api/applications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to load applications')
        }

        const result = await response.json()
        setApplications(Array.isArray(result) ? result.map(mapApplicationFromBackend) : starterApplications)
      } catch {
        setNotice('Unable to load applications right now.')
      }
    }

    void fetchApplications()
  }, [user, token])

  const counts = useMemo(() => statusOrder.reduce((result, status) => {
    result[status] = applications.filter((application) => application.status === status).length
    return result
  }, {} as Record<Status, number>), [applications])

  const responseRate = applications.length
    ? Math.round(((counts.Interview + counts.Offer + counts.Rejected) / applications.length) * 100)
    : 0

  const visibleApplications = useMemo(() => applications
    .filter((application) => statusFilter === 'All' || application.status === statusFilter)
    .filter((application) => `${application.company} ${application.role} ${application.location}`.toLowerCase().includes(search.toLowerCase()))
    .sort((first, second) => second.appliedAt.localeCompare(first.appliedAt)), [applications, search, statusFilter])

  const upcomingInterviews = applications
    .filter((application) => application.status === 'Interview' && application.interviewDate)
    .sort((first, second) => (first.interviewDate ?? '').localeCompare(second.interviewDate ?? ''))

  const chartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { displayColors: false, backgroundColor: '#202b28', padding: 10, cornerRadius: 8 },
    },
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0, color: '#89918d', font: { family: 'DM Sans' } }, grid: { color: '#edf0ec' }, border: { display: false } },
      y: { ticks: { color: '#46524d', font: { family: 'DM Sans', size: 12 } }, grid: { display: false }, border: { display: false } },
    },
  }

  function openNewApplication() {
    setEditing(null)
    setForm({ ...blankForm, appliedAt: new Date().toISOString().slice(0, 10) })
    setIsFormOpen(true)
  }

  function openEditApplication(application: Application) {
    setEditing(application)
    setForm({ company: application.company, role: application.role, location: application.location, type: application.type, appliedAt: application.appliedAt, status: application.status, interviewDate: application.interviewDate })
    setIsFormOpen(true)
  }

  async function saveApplication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!token) {
      setNotice('Please sign in to save applications.')
      return
    }

    const payload = {
      company: form.company.trim(),
      role: form.role.trim(),
      location: form.location.trim(),
      type: form.type,
      status: form.status,
      dateApplied: form.appliedAt,
      interviewDate: form.interviewDate || undefined,
    }

    try {
      const method = editing ? 'PUT' : 'POST'
      const url = editing ? `${API_URL}/api/applications/${editing.id}` : `${API_URL}/api/applications`
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to save application')
      }

      const saved = await response.json()
      const nextApplication = mapApplicationFromBackend(saved)

      if (editing) {
        setApplications((current) => current.map((application) => application.id === editing.id ? nextApplication : application))
        setNotice(`${form.company} updated`)
      } else {
        setApplications((current) => [nextApplication, ...current])
        setNotice(`${form.company} added to your applications`)
      }
      setIsFormOpen(false)
    } catch {
      setNotice('Unable to save this application right now.')
    }
  }

  async function updateStatus(id: string, status: Status) {
    if (!token) return

    try {
      const response = await fetch(`${API_URL}/api/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      const updated = await response.json()
      const mapped = mapApplicationFromBackend(updated)
      setApplications((current) => current.map((application) => application.id === id ? mapped : application))
    } catch {
      setNotice('Unable to update the status right now.')
    }
  }

  async function removeApplication(application: Application) {
    if (!token) return

    if (window.confirm(`Remove ${application.company} from your applications?`)) {
      try {
        const response = await fetch(`${API_URL}/api/applications/${application.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to delete application')
        }

        setApplications((current) => current.filter((item) => item.id !== application.id))
        setNotice(`${application.company} removed`)
      } catch {
        setNotice('Unable to remove this application right now.')
      }
    }
  }

  function navigateTo(label: string, target: string) {
    setActiveNav(label)
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const email = loginForm.email.trim().toLowerCase()
    const password = loginForm.password

    if (!email || !password) {
      setLoginError('Email and password are required.')
      return
    }

    const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login'
    const body = isSignUp
      ? { name: loginForm.name.trim() || TEST_USER.name, email, password }
      : { email, password }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const responseBody = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(responseBody.message || 'Authentication failed')
      }

      const nextUser = {
        name: responseBody.user?.name || TEST_USER.name,
        email: responseBody.user?.email || email,
      }

      setUser(nextUser)
      setToken(responseBody.token || null)
      setLoginError('')
      setLoginForm({ name: '', email: '', password: '' })
      setNotice(isSignUp ? 'Account created successfully.' : 'Welcome back, Jamie.')
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Authentication failed. Please try again.')
    }
  }

  function handleLogout() {
    setIsUserMenuOpen(false)
    setUser(null)
    setToken(null)
    setNotice('Signed out successfully.')
  }

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(''), 2800)
    return () => window.clearTimeout(timeout)
  }, [notice])

  if (!user) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-topbar">
            <div className="brand auth-brand" aria-label="Job Search Tracker home">
              <span className="brand-mark"><span /></span>
              <span>Job Search Tracker</span>
            </div>
            <button
              type="button"
              className="auth-switch-button"
              onClick={() => {
                setIsSignUp((current) => !current)
                setLoginError('')
              }}
            >
              {isSignUp ? 'SIGN IN' : 'SIGN UP'}
            </button>
          </div>

          <div className="auth-content">
            <div className="auth-copy">
              <div className="auth-kicker">YOUR NEXT OPPORTUNITY</div>
              <h1>{isSignUp ? 'Welcome to your job search hub.' : 'Welcome back.'}</h1>
              <p>{isSignUp
                ? 'Create a free account to manage every application, interview, and next step.'
                : 'Sign in to continue tracking your job search and stay on top of every opportunity.'}</p>
            </div>

            <form className="auth-form" onSubmit={handleLogin}>
              <div className="auth-form-grid">
                {isSignUp && (
                  <label className="login-field">
                    <span>Full name</span>
                    <input
                      type="text"
                      value={loginForm.name}
                      onChange={(event) => setLoginForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Jamie Davis"
                      autoComplete="name"
                      required
                    />
                  </label>
                )}

                <label className={isSignUp ? 'login-field' : 'login-field full-width'}>
                  <span>Email</span>
                  <input
                    type="text"
                    value={loginForm.email}
                    onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="test@jobtracker.com"
                    autoComplete="email"
                    required
                  />
                </label>

                <label className={isSignUp ? 'login-field' : 'login-field full-width'}>
                  <span>Password</span>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="password123"
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    minLength={6}
                    required
                  />
                </label>
              </div>

              {loginError && <div className="login-error">{loginError}</div>}

              <button type="submit" className="primary-button auth-button">{isSignUp ? 'Create account' : 'Sign in'}</button>
            </form>

            <div className="auth-footer">
              <span>Test account</span>
              <strong>{TEST_USER.email}</strong>
              <small>Password: {TEST_USER.password}</small>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" onClick={() => setActiveNav('Overview')} aria-label="Job Search Tracker home">
          <span className="brand-mark"><span /></span>
          <span>Job Search Tracker</span>
        </a>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          <button className={activeNav === 'Overview' ? 'nav-item active' : 'nav-item'} onClick={() => navigateTo('Overview', 'top')}>
            <LayoutDashboard size={18} strokeWidth={1.8} /><span>Overview</span>
          </button>
          <button className={activeNav === 'Applications' ? 'nav-item active' : 'nav-item'} onClick={() => navigateTo('Applications', 'applications')}>
            <BriefcaseBusiness size={18} strokeWidth={1.8} /><span>Applications</span><span className="nav-count">{applications.length}</span>
          </button>
          <button className={activeNav === 'Insights' ? 'nav-item active' : 'nav-item'} onClick={() => navigateTo('Insights', 'insights')}>
            <ChartNoAxesColumnIncreasing size={18} strokeWidth={1.8} /><span>Insights</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="profile-button" aria-label="Account menu" style={{ border: 'none' }}>
            <span className="avatar">{user.name.split(' ').map((part) => part[0]).slice(0,2).join('').toUpperCase()}</span><span className="profile-copy"><strong>{user.name}</strong><small>{user.email}</small></span>
          </button>
        </div>
      </aside>

      <main className="main-area" id="top">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-divider">/</span><strong>{activeNav}</strong></div>
          <div className="topbar-actions">
            <span className="today-label">{new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</span>
            <div className="user-menu">
              <button className="top-avatar-button" aria-label="Open account menu" aria-expanded={isUserMenuOpen} onClick={() => setIsUserMenuOpen((current) => !current)}>
                <span className="top-avatar" aria-hidden="true">{user.name.split(' ').map((part) => part[0]).slice(0,2).join('').toUpperCase()}</span>
              </button>

              {isUserMenuOpen && (
                <div className="user-menu-panel" role="menu" aria-label="Account menu">
                  <div className="user-menu-header">
                    <span className="user-avatar-small">{user.name.split(' ').map((part) => part[0]).slice(0,2).join('').toUpperCase()}</span>
                    <div>
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                    </div>
                  </div>
                  <button className="user-menu-item" type="button" onClick={handleLogout}>Log out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-content">
              <br></br>
          <section className="metrics-grid" aria-label="Application summary">
            <article className="metric-card metric-total">
              <div className="metric-top"><span>Total applications</span><span className="metric-icon mint"><BriefcaseBusiness size={17} /></span></div>
              <div className="metric-value">{applications.length}<span className="metric-unit"> applications</span></div>
              <div className="metric-foot"><span>Applications saved to your tracker</span></div>
            </article>
            <article className="metric-card">
              <div className="metric-top"><span>In progress</span><span className="metric-icon peach"><Clock3 size={17} /></span></div>
              <div className="metric-value">{counts.Applied + counts.Interview}<span className="metric-unit"> active</span></div>
              <div className="metric-foot"><span>{counts.Interview} at interview stage</span></div>
            </article>
            <article className="metric-card">
              <div className="metric-top"><span>Offers received</span><span className="metric-icon lilac"><Sparkles size={17} /></span></div>
              <div className="metric-value">{counts.Offer}<span className="metric-unit"> offers</span></div>
              <div className="metric-foot"><span>Currently at offer stage</span></div>
            </article>
            <article className="metric-card metric-response">
              <div className="metric-top"><span>Response rate</span><span className="metric-icon blue"><ChartNoAxesColumnIncreasing size={17} /></span></div>
              <div className="metric-value">{responseRate}<span className="metric-unit">%</span></div>
              <div className="metric-foot"><span>Applications with a response</span></div>
            </article>
          </section>

          <section className="middle-grid" id="insights">
            <article className="panel pipeline-panel">
              <div className="section-heading">
                <div><div className="eyebrow small-eyebrow">THE BIG PICTURE</div><h2>Application pipeline</h2></div>
                <span className="period-select">All time</span>
              </div>
              <div className="pipeline-total"><strong>{applications.length}</strong><span>applications</span></div>
              <div className="chart-wrap">
                <Bar
                  data={{
                    labels: statusOrder,
                    datasets: [{ data: statusOrder.map((status) => counts[status]), backgroundColor: statusOrder.map((status) => statusColors[status]), borderRadius: 5, barThickness: 17, borderSkipped: false }],
                  }}
                  options={chartOptions}
                />
              </div>
              <div className="pipeline-legend">{statusOrder.map((status) => <span key={status}><i style={{ backgroundColor: statusColors[status] }} />{status}<strong>{counts[status]}</strong></span>)}</div>
            </article>

            <article className="panel interviews-panel">
              <div className="section-heading">
                <div><div className="eyebrow small-eyebrow">COMING UP</div><h2>Next interviews</h2></div>
                <button className="text-button" onClick={() => { setStatusFilter('Interview'); navigateTo('Applications', 'applications') }}>View all <ArrowUpRight size={14} /></button>
              </div>
              {upcomingInterviews.length ? (
                <div className="interview-list">
                  {upcomingInterviews.slice(0, 3).map((application) => (
                    <div className="interview-row" key={application.id}>
                      <div className="interview-date"><strong>{new Date(`${application.interviewDate}T12:00:00`).getDate()}</strong><span>{new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(`${application.interviewDate}T12:00:00`))}</span></div>
                      <div className="interview-details"><strong>{application.role}</strong><span>{application.company} · {application.location}</span></div>
                      <span className="interview-time"><CalendarDays size={14} /> Chat</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-interviews"><CalendarDays size={24} /><strong>No interviews on the calendar</strong><span>They’ll show up here once you add an interview date.</span></div>
              )}
            </article>
          </section>

          <section className="applications-section" id="applications">
            <div className="applications-heading">
              <div><div className="eyebrow small-eyebrow">YOUR OPPORTUNITIES</div><h2>Applications <span className="heading-count">{applications.length}</span></h2></div>
              <button className="secondary-button" onClick={openNewApplication}><Plus size={16} /> New application</button>
            </div>
            <div className="table-toolbar">
              <div className="filter-tabs" role="group" aria-label="Filter applications by status">
                {(['All', ...statusOrder] as const).map((status) => <button key={status} className={statusFilter === status ? 'filter-tab selected' : 'filter-tab'} onClick={() => setStatusFilter(status)}>{status}<span>{status === 'All' ? applications.length : counts[status]}</span></button>)}
              </div>
              <label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search applications" aria-label="Search applications" /></label>
            </div>
            <div className="table-scroll">
              <table className="applications-table">
                <thead><tr><th>COMPANY / ROLE</th><th>LOCATION</th><th>APPLIED</th><th>STATUS</th><th aria-label="Actions" /></tr></thead>
                <tbody>
                  {visibleApplications.map((application) => (
                    <tr key={application.id}>
                      <td><div className="company-cell"><span className="company-mark" style={{ backgroundColor: application.color }}>{application.mark}</span><span className="company-info"><strong>{application.company}</strong><small>{application.role}</small></span></div></td>
                      <td><span className="location-cell"><MapPin size={13} />{application.location}</span></td>
                      <td><span className="date-cell">{formatDate(application.appliedAt)}</span></td>
                      <td><label className={`status-select status-${application.status.toLowerCase()}`}><i /><select aria-label={`${application.company} status`} value={application.status} onChange={(event) => updateStatus(application.id, event.target.value as Status)}>{statusOrder.map((status) => <option key={status} value={status}>{status}</option>)}</select><ChevronDown size={13} /></label></td>
                      <td><div className="row-actions"><button aria-label={`Edit ${application.company}`} title="Edit application" onClick={() => openEditApplication(application)}><Pencil size={15} /></button><button aria-label={`Delete ${application.company}`} title="Delete application" onClick={() => removeApplication(application)}><Trash2 size={15} /></button></div></td>
                    </tr>
                  ))}
                  {!visibleApplications.length && <tr><td colSpan={5} className="empty-table">No applications match. Try another search or add a new one.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="table-footer"><span>Showing <strong>{visibleApplications.length}</strong> of <strong>{applications.length}</strong> applications</span></div>
          </section>

        </div>
      </main>

      {isFormOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsFormOpen(false) }}>
          <section className="application-modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
            <div className="modal-heading"><div><div className="eyebrow small-eyebrow">{editing ? 'KEEP IT CURRENT' : 'A NEW OPPORTUNITY'}</div><h2 id="form-title">{editing ? 'Edit application' : 'Add an application'}</h2></div><button className="icon-button modal-close" aria-label="Close dialog" onClick={() => setIsFormOpen(false)}><X size={19} /></button></div>
            <form onSubmit={saveApplication}>
              <label className="form-field"><span>Company</span><input required autoFocus value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} placeholder="e.g. Acme Studio" /></label>
              <label className="form-field"><span>Role title</span><input required value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} placeholder="e.g. Product Designer" /></label>
              <div className="form-row">
                <label className="form-field"><span>Location</span><input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Remote or city" /></label>
                <label className="form-field"><span>Work type</span><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option>Full-time</option><option>Contract</option><option>Part-time</option><option>Freelance</option></select></label>
              </div>
              <div className="form-row">
                <label className="form-field"><span>Date applied</span><input type="date" required value={form.appliedAt} onChange={(event) => setForm({ ...form, appliedAt: event.target.value })} /></label>
                <label className="form-field"><span>Status</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Status })}>{statusOrder.map((status) => <option key={status}>{status}</option>)}</select></label>
              </div>
              {form.status === 'Interview' && <label className="form-field"><span>Next interview date <small>(optional)</small></span><input type="date" value={form.interviewDate ?? ''} onChange={(event) => setForm({ ...form, interviewDate: event.target.value || undefined })} /></label>}
              <div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setIsFormOpen(false)}>Cancel</button><button type="submit" className="primary-button"><Plus size={16} />{editing ? 'Save changes' : 'Add application'}</button></div>
            </form>
          </section>
        </div>
      )}

      {notice && <div className="toast" role="status"><span className="toast-check">✓</span>{notice}</div>}
    </div>
  )
}

export default App
