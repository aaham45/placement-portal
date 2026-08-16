import React from 'react'
import { Users, Building2, Briefcase, Award, TrendingUp, DollarSign } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// ❌ Navbar aur Footer ka import HATA diya (Kyunki wo App.jsx se aa rahe hain)

function StatisticsPage() {
  const placementData = [
    { year: '2020', placed: 1200, package: 6.5 },
    { year: '2021', placed: 1500, package: 7.2 },
    { year: '2022', placed: 1800, package: 7.8 },
    { year: '2023', placed: 2200, package: 8.5 },
    { year: '2024', placed: 2450, package: 8.5 }
  ]

  const branchData = [
    { name: 'CSE', value: 45, color: '#3b82f6' },
    { name: 'IT', value: 24, color: '#10b981' },
    { name: 'ECE', value: 16, color: '#f59e0b' },
    { name: 'EE', value: 8, color: '#8b5cf6' },
    { name: 'ME', value: 5, color: '#ec4899' },
    { name: 'CE', value: 2, color: '#06b6d4' }
  ]

  const packageData = [
    { range: '3-6 LPA', count: 45, color: '#10b981' },
    { range: '6-10 LPA', count: 52, color: '#3b82f6' },
    { range: '10-15 LPA', count: 20, color: '#f59e0b' },
    { range: '15-20 LPA', count: 8, color: '#8b5cf6' },
    { range: '20+ LPA', count: 5, color: '#ec4899' }
  ]

  const companyData = [
    { name: 'Amazon', offers: 45 },
    { name: 'Google', offers: 28 },
    { name: 'Microsoft', offers: 35 },
    { name: 'TCS', offers: 120 },
    { name: 'Infosys', offers: 85 }
  ]

  const stats = [
    { value: '2,450+', label: 'Total Students', icon: Users, color: '#3b82f6' },
    { value: '200+', label: 'Companies', icon: Building2, color: '#10b981' },
    { value: '87+', label: 'Active Jobs', icon: Briefcase, color: '#8b5cf6' },
    { value: '85%', label: 'Placement Rate', icon: TrendingUp, color: '#f59e0b' },
    { value: '42 LPA', label: 'Highest Package', icon: Award, color: '#ec4899' },
    { value: '1,850+', label: 'Offers Made', icon: DollarSign, color: '#06b6d4' }
  ]

  const styles = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)', fontFamily: "'Inter', sans-serif" },
    hero: { background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' },
    heroTitle: { fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '800' },
    heroSubtitle: { fontSize: '1.1rem', opacity: 0.95, maxWidth: '600px', margin: '0 auto' },
    section: { padding: '60px 20px' },
    containerCenter: { maxWidth: '1200px', margin: '0 auto' },
    sectionTitle: { fontSize: '2rem', fontWeight: '700', textAlign: 'center', marginBottom: '2rem', color: '#1e293b' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '3rem' },
    statCard: { background: 'white', padding: '1rem', borderRadius: '16px', textAlign: 'center' },
    statValue: { fontSize: '1.3rem', fontWeight: '700', color: '#1e293b' },
    statLabel: { fontSize: '0.6rem', color: '#64748b' },
    statIconWrapper: { fontSize: '1.5rem', marginBottom: '0.5rem' },
    chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' },
    chartCard: { background: 'white', padding: '1.5rem', borderRadius: '20px' },
    chartTitle: { fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', textAlign: 'center' }
  }

  return (
    <div style={styles.container}>
      {/* ❌ Navbar ko yahan se hata diya, kyunki wo App.jsx se aa raha hai */}
      
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Placement Statistics</h1>
        <p style={styles.heroSubtitle}>Our achievements and placement trends over the years</p>
      </div>

      <div style={styles.section}>
        <div style={styles.containerCenter}>
          <div style={styles.statsGrid}>
            {stats.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} style={styles.statCard}>
                  <div style={styles.statIconWrapper}>
                    <Icon size={28} color={stat.color} />
                  </div>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              )
            })}
          </div>

          <div style={styles.chartsGrid}>
            {/* Placement Trends */}
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Placement Trends Over Years</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={placementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="placed" stroke="#3b82f6" name="Students Placed" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="package" stroke="#10b981" name="Avg Package (LPA)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Branch-wise Distribution */}
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Branch-wise Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={branchData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label>
                    {branchData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Package Distribution */}
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Package Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={packageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Number of Offers" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Recruiters */}
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Top Recruiters (Offers)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={companyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip />
                  <Bar dataKey="offers" fill="#10b981" name="Offers Made" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      {/* ❌ Footer ko yahan se bhi hata diya, kyunki wo App.jsx se aa raha hai */}
    </div>
  )
}

export default StatisticsPage