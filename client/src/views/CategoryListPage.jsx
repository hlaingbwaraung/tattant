/**
 * CategoryListPage – Displays businesses filtered by category slug.
 * For job categories (jobs-fulltime / jobs-parttime), shows static job listings.
 */
import React, { useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import AppHeader from '../components/layout/AppHeader'
import './CategoryListPage.css'

/* ─── Static job data ─────────────────────────────────────────────────────── */

const FULLTIME_JOBS = [
    { id: 'ft-1', title: 'Software Engineer (Full-Stack)', company: 'SoftBank Corp', location: 'Shibuya, Tokyo', salary: '¥450,000 – ¥600,000 / month', type: 'Full-time', tags: ['React', 'Node.js', 'TypeScript'], urgent: false, logo: '💻', posted: '2 days ago', description: 'Build and maintain web applications for millions of users across Japan. Strong knowledge of modern JavaScript frameworks required.' },
    { id: 'ft-2', title: 'English Teacher (ALT)', company: 'Interac Co., Ltd.', location: 'Yokohama, Kanagawa', salary: '¥250,000 – ¥280,000 / month', type: 'Full-time', tags: ['English', 'Teaching', 'TESOL'], urgent: true, logo: '🎓', posted: '1 day ago', description: 'Assist Japanese teachers of English at public elementary and middle schools. No Japanese language skill required.' },
    { id: 'ft-3', title: 'Bilingual IT Support Specialist', company: 'Fujitsu Limited', location: 'Kawasaki, Kanagawa', salary: '¥320,000 – ¥400,000 / month', type: 'Full-time', tags: ['IT Support', 'English', 'Japanese N3+'], urgent: false, logo: '🖥️', posted: '3 days ago', description: 'Provide helpdesk support and system administration for internal and external clients across the Asia-Pacific region.' },
    { id: 'ft-4', title: 'Hotel Front Desk Staff (Night Shift)', company: 'APA Hotel Group', location: 'Shinjuku, Tokyo', salary: '¥230,000 – ¥270,000 / month', type: 'Full-time', tags: ['Hospitality', 'English', 'Customer Service'], urgent: true, logo: '🏨', posted: '5 hours ago', description: 'Welcome international guests, handle check-ins/check-outs, and coordinate with housekeeping. Night shift allowance included.' },
    { id: 'ft-5', title: 'Marketing Coordinator (Global)', company: 'Rakuten, Inc.', location: 'Setagaya, Tokyo', salary: '¥380,000 – ¥500,000 / month', type: 'Full-time', tags: ['Marketing', 'English', 'SNS'], urgent: false, logo: '📣', posted: '1 week ago', description: "Drive global marketing campaigns for Rakuten's e-commerce platform. Work with international teams across Europe and Asia." },
    { id: 'ft-6', title: 'Registered Nurse (Intl License)', company: 'Tokyo Medical Center', location: 'Meguro, Tokyo', salary: '¥350,000 – ¥420,000 / month', type: 'Full-time', tags: ['Nursing', 'JLPT N2', 'Healthcare'], urgent: true, logo: '🏥', posted: '2 days ago', description: 'Provide patient care in a busy metropolitan hospital. International nursing license recognition supported. Japanese N2 preferred.' },
    { id: 'ft-7', title: 'Restaurant Manager (Burmese Cuisine)', company: 'Yoma Kitchen Tokyo', location: 'Shin-Okubo, Tokyo', salary: '¥280,000 – ¥340,000 / month', type: 'Full-time', tags: ['Restaurant', 'Management', 'Burmese'], urgent: false, logo: '🍛', posted: '4 days ago', description: 'Oversee daily operations of a popular Burmese restaurant including staff management, food safety compliance, and customer service.' },
    { id: 'ft-8', title: 'Logistics Coordinator', company: 'Nippon Express', location: 'Koto, Tokyo', salary: '¥290,000 – ¥360,000 / month', type: 'Full-time', tags: ['Logistics', 'Forklift License', 'English'], urgent: false, logo: '🚚', posted: '3 days ago', description: 'Coordinate international freight shipments, manage customs documentation, and liaise with overseas partners.' },
    { id: 'ft-9', title: 'Financial Analyst', company: 'MUFG Bank', location: 'Chiyoda, Tokyo', salary: '¥500,000 – ¥700,000 / month', type: 'Full-time', tags: ['Finance', 'Excel', 'CFA preferred'], urgent: false, logo: '💹', posted: '6 days ago', description: 'Analyze financial data and prepare reports for senior management. MBA or CFA certification preferred. English required.' },
    { id: 'ft-10', title: 'Real Estate Agent (Expat Specialist)', company: 'Global Homes Japan', location: 'Minato, Tokyo', salary: '¥300,000 – ¥550,000 / month (+ commission)', type: 'Full-time', tags: ['Real Estate', 'English', 'Sales'], urgent: false, logo: '🏠', posted: '5 days ago', description: 'Help expats find apartments and homes across Tokyo. Strong English skills and knowledge of Japanese tenancy laws required.' },
    { id: 'ft-11', title: 'Warehouse Supervisor', company: 'Amazon Japan', location: 'Ichikawa, Chiba', salary: '¥310,000 – ¥390,000 / month', type: 'Full-time', tags: ['Warehouse', 'Team Lead', 'WMS'], urgent: true, logo: '📦', posted: '1 day ago', description: 'Supervise a team of 20+ warehouse associates, ensuring accurate order processing and adherence to safety standards.' },
    { id: 'ft-12', title: 'Interpreter / Translator (EN–MY–JP)', company: 'Freelance via TTM Agency', location: 'Remote / Tokyo hybrid', salary: '¥350,000 – ¥480,000 / month', type: 'Full-time', tags: ['Interpretation', 'Burmese', 'English', 'Japanese'], urgent: false, logo: '🌐', posted: '1 week ago', description: 'Provide simultaneous and consecutive interpretation for business meetings, legal proceedings, and medical consultations.' },
]

const PARTTIME_JOBS = [
    { id: 'pt-1', title: 'Convenience Store Staff (キャッシャー)', company: 'FamilyMart', location: 'Shibuya, Tokyo', salary: '¥1,113 – ¥1,200 / hr', type: 'Part-time', tags: ['No Japanese required', 'Night OK', 'Weekly pay'], urgent: true, logo: '🏪', posted: '1 day ago', description: 'Cashier duties, stocking shelves, and light cleaning. Morning and night shifts available. Training provided for foreign nationals.' },
    { id: 'pt-2', title: 'Restaurant Server (English-speaking)', company: 'TGI Fridays Japan', location: 'Roppongi, Tokyo', salary: '¥1,200 – ¥1,400 / hr', type: 'Part-time', tags: ['English OK', 'Tips', 'Flexible hours'], urgent: false, logo: '🍔', posted: '2 days ago', description: 'Serve food and drinks to international guests in a lively atmosphere. English fluency required. Weekend shifts preferred.' },
    { id: 'pt-3', title: 'Food Delivery Rider', company: 'Uber Eats Japan', location: 'Tokyo (Multiple Areas)', salary: '¥1,500 – ¥2,500 / hr (earnings vary)', type: 'Part-time', tags: ['Bike / Bicycle', 'Flexible', 'Cash weekly'], urgent: false, logo: '🛵', posted: 'just now', description: 'Deliver meals on your own schedule. Own a bicycle or scooter? Register now and start earning immediately. No Japanese required.' },
    { id: 'pt-4', title: 'English / Burmese Tutor (Online)', company: 'Self-employed via HelloTalk', location: 'Remote', salary: '¥1,500 – ¥3,000 / hr', type: 'Part-time', tags: ['Teaching', 'Online', 'Flexible'], urgent: false, logo: '📚', posted: '3 days ago', description: 'Tutor Japanese students in English or help Burmese expats learn Japanese. Set your own schedule. All levels welcome.' },
    { id: 'pt-5', title: 'Factory Line Worker (Afternoon Shift)', company: 'Toyota Boshoku', location: 'Ohbu, Aichi', salary: '¥1,050 – ¥1,250 / hr', type: 'Part-time', tags: ['No experience', 'Transportation paid', 'Dormitory available'], urgent: true, logo: '🏭', posted: '5 hours ago', description: 'Assemble automotive parts on a production line. Afternoon/evening shifts available. Dormitory housing offered for remote applicants.' },
    { id: 'pt-6', title: 'Hotel Housekeeping Staff', company: 'Dormy Inn Chain', location: 'Sapporo, Hokkaido', salary: '¥1,000 – ¥1,150 / hr', type: 'Part-time', tags: ['Morning shift', 'No Japanese required', 'Uniform provided'], urgent: false, logo: '🏨', posted: '4 days ago', description: 'Clean and prepare guest rooms to hotel standards. Morning shifts 8am–2pm. Beginner-friendly with full training provided.' },
    { id: 'pt-7', title: 'Event Crew / Venue Staff', company: 'Staff Service Holdings', location: 'Osaka & Kobe area', salary: '¥1,200 – ¥1,600 / hr', type: 'Part-time', tags: ['Weekends', 'Events', 'Physical work'], urgent: false, logo: '🎪', posted: '1 week ago', description: 'Help set up and manage events, concerts, and trade shows across the Kansai region. Weekends and holidays mainly. Fit and energetic.' },
    { id: 'pt-8', title: 'Customer Service Rep (Phone/Chat)', company: 'Transcosmos Inc.', location: 'Fukuoka (office)', salary: '¥1,150 – ¥1,350 / hr', type: 'Part-time', tags: ['English required', 'Sitting work', 'Training provided'], urgent: false, logo: '📞', posted: '2 days ago', description: 'Handle inbound customer inquiries for a global tech client. English fluency essential. Afternoon/evening shifts, 4–8 hrs per day.' },
    { id: 'pt-9', title: 'Grocery Store Stocker (Night)', company: 'AEON Group', location: 'Multiple locations', salary: '¥1,100 – ¥1,300 / hr (night premium)', type: 'Part-time', tags: ['Night shift', 'Physical work', 'Weekly pay'], urgent: true, logo: '🛒', posted: '6 hours ago', description: 'Stock shelves and organise produce sections overnight. No Japanese language required. Night shift premium pay included.' },
    { id: 'pt-10', title: 'Café Barista / Counter Staff', company: 'Doutor Coffee', location: 'Shibuya, Tokyo', salary: '¥1,050 – ¥1,200 / hr', type: 'Part-time', tags: ['Coffee', 'Customer-facing', 'Student OK'], urgent: false, logo: '☕', posted: '3 days ago', description: 'Prepare beverages and serve customers in a busy city centre café. Friendly personality and basic Japanese greeting skills helpful.' },
    { id: 'pt-11', title: 'Cleaning / Janitorial Staff', company: 'ISS Facility Services Japan', location: 'Yokohama, Kanagawa', salary: '¥1,000 – ¥1,100 / hr', type: 'Part-time', tags: ['Early morning', 'No experience', 'Stable hours'], urgent: false, logo: '🧹', posted: '5 days ago', description: 'Maintain cleanliness of office buildings and commercial facilities. Early morning shifts 5am–9am. Reliable schedule, perfect as a second job.' },
    { id: 'pt-12', title: 'Interpreter Assistant (Burmese)', company: 'Medical Interpreter Network Japan', location: 'Tokyo / Remote', salary: '¥1,500 – ¥2,200 / hr', type: 'Part-time', tags: ['Burmese', 'Medical', 'Flexible'], urgent: true, logo: '🌐', posted: '1 day ago', description: 'Assist Burmese-speaking patients communicate with Japanese medical staff. Freelance basis. Medical terminology training provided.' },
]

function seededShuffle(arr, seed) {
    const a = [...arr]
    let s = seed
    for (let i = a.length - 1; i > 0; i--) {
        s = (s * 1664525 + 1013904223) & 0xffffffff
        const j = Math.abs(s) % (i + 1);
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

/* ─── Component ───────────────────────────────────────────────────────────── */

export default function CategoryListPage() {
    const { slug } = useParams()
    const { t, i18n } = useTranslation()
    const currentLocale = i18n.language

    const isJobPage = slug === 'jobs-fulltime' || slug === 'jobs-parttime'

    const [businesses, setBusinesses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const categoryMap = {
        'phone-and-sim-cards': { name: t('category.simCards'), icon: '📱', description: t('category.simCardsDesc') },
        'restaurants': { name: t('category.restaurants'), icon: '🍽️', description: t('category.restaurantsDesc') },
        'real-estate': { name: t('category.realEstate'), icon: '🏠', description: t('category.realEstateDesc') },
        'book-stores': { name: t('category.bookstores'), icon: '📚', description: t('category.bookstoresDesc') },
        'currency-exchange': { name: t('category.currencyExchange'), icon: '💱', description: t('category.currencyExchangeDesc') },
        'jobs-fulltime': { name: t('category.jobsFulltime'), icon: '💼', description: t('category.jobsFulltimeDesc') },
        'jobs-parttime': { name: t('category.jobsParttime'), icon: '🕐', description: t('category.jobsParttimeDesc') },
    }

    const category = categoryMap[slug] || { name: slug, icon: '📂', description: '' }

    // Randomised but stable for this page session
    const jobListings = useMemo(() => {
        const seed = Date.now() % 100000
        const pool = slug === 'jobs-fulltime' ? FULLTIME_JOBS : PARTTIME_JOBS
        return seededShuffle(pool, seed)
    }, [slug])

    useEffect(() => {
        document.title = `${category.name} | Tattant`
        return () => { document.title = 'Tattant' }
    }, [slug, category.name])

    useEffect(() => {
        if (isJobPage) { setLoading(false); return }
        const fetchData = async () => {
            setLoading(true)
            setError('')
            try {
                const response = await api.get(`/businesses?category=${slug}`)
                setBusinesses(response.data.businesses || response.data)
            } catch (err) {
                setError('Failed to load businesses. Please try again later.')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [slug, isJobPage])

    return (
        <div className="category-list-page">
            <AppHeader />

            <section className="category-header">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">{t('common.home')}</Link>
                        <span className="separator">/</span>
                        <span className="current">{category.name}</span>
                    </div>
                    <div className="header-content">
                        <span className="category-icon">{category.icon}</span>
                        <div>
                            <h1 className="category-title">{category.name}</h1>
                            <p className="category-description">{category.description}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="businesses-section">
                <div className="container">
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>{t('business.loadingBusinesses')}</p>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <div className="error-icon">⚠️</div>
                            <p className="error">{error}</p>
                            <Link to="/" className="back-btn">{t('auth.backToHome')}</Link>
                        </div>
                    ) : isJobPage ? (
                        /* ── Job listings view ── */
                        <div>
                            <div className="job-list-meta">
                                <p className="results-count">{jobListings.length} jobs found</p>
                                <span className="job-demo-badge">📋 Sample Listings</span>
                            </div>
                            <div className="job-listings-grid">
                                {jobListings.map(job => (
                                    <div key={job.id} className="job-card">
                                        <div className="job-card-header">
                                            <span className="job-logo">{job.logo}</span>
                                            <div className="job-header-info">
                                                <h3 className="job-title">{job.title}</h3>
                                                <span className="job-company">{job.company}</span>
                                            </div>
                                            {job.urgent && <span className="job-urgent-badge">🔥 Urgent</span>}
                                        </div>
                                        <p className="job-desc">{job.description}</p>
                                        <div className="job-meta-row">
                                            <span className="job-meta-item">📍 {job.location}</span>
                                            <span className="job-meta-item">💴 {job.salary}</span>
                                            <span className="job-meta-item">🕐 {job.posted}</span>
                                        </div>
                                        <div className="job-tags">
                                            {job.tags.map(tag => <span key={tag} className="job-tag">{tag}</span>)}
                                        </div>
                                        <button className="job-apply-btn" onClick={() => alert('Job applications coming soon! Contact us via the Contact page.')}>
                                            Apply Now →
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : businesses.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📭</div>
                            <h2>{t('business.noResults')}</h2>
                            <p>{t('business.noResultsDesc')}</p>
                            <Link to="/" className="browse-btn">{t('business.browseAll')}</Link>
                        </div>
                    ) : (
                        <div>
                            <p className="results-count">{businesses.length} {t('business.businessesFound')}</p>
                            <div className="businesses-grid">
                                {businesses.map(business => (
                                    <Link key={business.id} to={`/businesses/${business.id}`} className="business-card">
                                        <div className="card-image">
                                            <img src={business.photos?.[0] || 'https://via.placeholder.com/400x250'} alt={business.name} />
                                            <span className="price-badge">{business.price_range}</span>
                                            {business.coupons?.length > 0 && (
                                                <span className="coupon-badge-overlay">🎟️ {business.coupons.length} {business.coupons.length === 1 ? 'Coupon' : 'Coupons'}</span>
                                            )}
                                        </div>
                                        <div className="card-content">
                                            <h3 className="business-name">{business.name}{business.is_premier && <svg className="verified-mark verified-mark-sm" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M20.396 11c0-.61-.208-1.18-.572-1.632.249-.467.39-.996.39-1.559 0-1.327-.795-2.467-1.934-2.971a3.174 3.174 0 0 0-.389-1.56A3.195 3.195 0 0 0 15.12.872a3.17 3.17 0 0 0-1.559.39A3.196 3.196 0 0 0 11 .396c-.61 0-1.18.208-1.632.572a3.174 3.174 0 0 0-1.559-.39A3.195 3.195 0 0 0 4.838 2.51a3.174 3.174 0 0 0-.389 1.56 3.195 3.195 0 0 0-1.933 2.97c0 .564.14 1.093.39 1.56A3.196 3.196 0 0 0 2.333 11c0 .61.208 1.18.572 1.632a3.174 3.174 0 0 0-.39 1.559c0 1.327.796 2.467 1.934 2.971.085.552.29 1.08.589 1.556a3.195 3.195 0 0 0 2.771 1.596c.564 0 1.093-.14 1.56-.39.452.364 1.022.572 1.631.572s1.18-.208 1.632-.572c.467.249.996.39 1.559.39a3.195 3.195 0 0 0 2.771-1.596c.3-.476.504-1.004.589-1.556a3.195 3.195 0 0 0 1.934-2.971c0-.564-.14-1.093-.39-1.56.364-.452.572-1.022.572-1.631Z" fill="#1d9bf0"/><path d="M9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246-5.683 6.206Z" fill="#fff"/></svg>}</h3>
                                            <p className="business-description">{currentLocale === 'my' ? (business.description_my || business.description_en) : business.description_en}</p>
                                            <div className="business-meta"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`} target="_blank" rel="noreferrer" className="address" onClick={e => e.stopPropagation()} style={{display:'inline-flex',alignItems:'center',gap:'4px',color:'#666',textDecoration:'none',cursor:'pointer',fontSize:'0.9rem',transition:'color 0.2s'}} onMouseEnter={e => e.currentTarget.style.color='#333'} onMouseLeave={e => e.currentTarget.style.color='#666'}><span style={{opacity:0.7}}>📍</span><span>{business.address}</span></a></div>
                                            <div className="business-tags">
                                                {business.tags?.slice(0, 3).map(tag => <span key={tag} className="tag">{tag}</span>)}
                                            </div>
                                            <span className="view-link">{t('business.viewDetails')} →</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
