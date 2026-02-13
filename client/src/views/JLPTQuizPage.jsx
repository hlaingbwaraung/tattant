/**
 * JLPTQuizPage – Premium JLPT learning hub
 *
 * Tabs: Kanji Quiz | Similar Kanji | Grammar | Leaderboard | Dictionary
 * Features: timed rounds, combo streaks, session stats, point rewards
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../store/useAuthStore'
import api from '../services/api'
import { searchDictionary } from '../services/dictionaryService'
import AppHeader from '../components/layout/AppHeader'
import { kanjiByLevel, similarKanjiByLevel, grammarByLevel } from './jlptQuizData'
import './JLPTQuizPage.css'

/* ---------- helpers ---------- */
function shuffle(array) {
    const a = [...array]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

function playSound(type) {
    console.log(`🔊 Sound: ${type}`)
}

export default function JLPTQuizPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const user = useAuthStore(s => s.user)

    /* ---------- Access Control ---------- */
    const isPremiumUser = user?.is_premium || user?.is_admin

    /* ---------- Tab & Level ---------- */
    const [activeTab, setActiveTab] = useState('quiz')
    const [selectedLevel, setSelectedLevel] = useState('N5')

    /* ---------- Dictionary ---------- */
    const [dictionaryQuery, setDictionaryQuery] = useState('')
    const [dictionaryResults, setDictionaryResults] = useState([])
    const [dictionaryLoading, setDictionaryLoading] = useState(false)
    const [dictionaryError, setDictionaryError] = useState('')

    /* ---------- Kanji Quiz State ---------- */
    const [gameState, setGameState] = useState('idle')
    const [currentRound, setCurrentRound] = useState(1)
    const [score, setScore] = useState(0)
    const [currentQuestion, setCurrentQuestion] = useState({})
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [answered, setAnswered] = useState(false)
    const [isCorrect, setIsCorrect] = useState(false)
    const [isFlipping, setIsFlipping] = useState(false)
    const [wrongAnswers, setWrongAnswers] = useState([])
    const [timeLeft, setTimeLeft] = useState(15)

    /* ---------- Session Stats ---------- */
    const [sessionStats, setSessionStats] = useState({
        questionsAnswered: 0, correctAnswers: 0,
        currentStreak: 0, bestStreak: 0, averageTime: 0
    })
    const [comboCount, setComboCount] = useState(0)

    /* ---------- Leaderboard ---------- */
    const [leaderboard, setLeaderboard] = useState([])
    const [leaderboardLoading, setLeaderboardLoading] = useState(false)
    const [personalBest, setPersonalBest] = useState(null)
    const [pointsEarned, setPointsEarned] = useState(0)
    const [totalPoints, setTotalPoints] = useState(0)

    /* ---------- Similar Kanji Quiz ---------- */
    const [similarState, setSimilarState] = useState('idle')
    const [similarRound, setSimilarRound] = useState(1)
    const [similarScore, setSimilarScore] = useState(0)
    const [similarQuestion, setSimilarQuestion] = useState({})
    const [similarSelected, setSimilarSelected] = useState(null)
    const [similarAnswered, setSimilarAnswered] = useState(false)
    const [similarIsCorrect, setSimilarIsCorrect] = useState(false)
    const [similarWrong, setSimilarWrong] = useState([])
    const [similarTimeLeft, setSimilarTimeLeft] = useState(15)

    /* ---------- Grammar Quiz ---------- */
    const [grammarState, setGrammarState] = useState('idle')
    const [grammarRound, setGrammarRound] = useState(1)
    const [grammarScore, setGrammarScore] = useState(0)
    const [grammarQuestion, setGrammarQuestion] = useState({})
    const [grammarSelectedWords, setGrammarSelectedWords] = useState([])
    const [grammarPool, setGrammarPool] = useState([])
    const [grammarAnswered, setGrammarAnswered] = useState(false)
    const [grammarIsCorrect, setGrammarIsCorrect] = useState(false)
    const [grammarWrong, setGrammarWrong] = useState([])
    const [grammarTimeLeft, setGrammarTimeLeft] = useState(30)
    const [grammarUsedPool, setGrammarUsedPool] = useState([])
    const [answerDragOver, setAnswerDragOver] = useState(false)

    /* ---------- Refs for mutable state ---------- */
    const timerRef = useRef(null)
    const similarTimerRef = useRef(null)
    const grammarTimerRef = useRef(null)
    const usedQuestionIndicesRef = useRef([])
    const usedSimilarIndicesRef = useRef([])
    const usedGrammarIndicesRef = useRef([])
    const dragSourceRef = useRef(null)

    // Refs to track latest state in callbacks/timers
    const answeredRef = useRef(false)
    const similarAnsweredRef = useRef(false)
    const grammarAnsweredRef = useRef(false)
    const currentRoundRef = useRef(1)
    const similarRoundRef = useRef(1)
    const grammarRoundRef = useRef(1)
    const scoreRef = useRef(0)
    const similarScoreRef = useRef(0)
    const grammarScoreRef = useRef(0)

    /* ---------- Derived Data ---------- */
    const kanjiData = useMemo(() => kanjiByLevel[selectedLevel] || kanjiByLevel.N5, [selectedLevel])
    const similarKanjiData = useMemo(() => similarKanjiByLevel[selectedLevel] || similarKanjiByLevel.N5, [selectedLevel])
    const grammarData = useMemo(() => grammarByLevel[selectedLevel] || grammarByLevel.N5, [selectedLevel])

    /* ---------- Cleanup on unmount ---------- */
    useEffect(() => {
        return () => {
            clearInterval(timerRef.current)
            clearInterval(similarTimerRef.current)
            clearInterval(grammarTimerRef.current)
        }
    }, [])

    /* ==========================================
     * KANJI READING QUIZ
     * ========================================== */

    function generateQuestion() {
        let available = kanjiData.map((_, i) => i).filter(i => !usedQuestionIndicesRef.current.includes(i))
        if (available.length === 0) {
            usedQuestionIndicesRef.current = []
            available = kanjiData.map((_, i) => i)
        }
        const idx = available[Math.floor(Math.random() * available.length)]
        usedQuestionIndicesRef.current.push(idx)
        const item = kanjiData[idx]
        return { kanji: item.kanji, correctReading: item.correctReading, meaning: item.meaning, options: shuffle([item.correctReading, ...item.wrongReadings]) }
    }

    function startTimer(setTime, timerRefObj, maxTime, onTimeout) {
        clearInterval(timerRefObj.current)
        setTime(maxTime)
        let t = maxTime
        timerRefObj.current = setInterval(() => {
            t--
            setTime(t)
            if (t <= 0) {
                clearInterval(timerRefObj.current)
                onTimeout()
            }
        }, 1000)
    }

    function startGame() {
        setGameState('playing')
        setCurrentRound(1); currentRoundRef.current = 1
        setScore(0); scoreRef.current = 0
        setWrongAnswers([])
        usedQuestionIndicesRef.current = []
        setSessionStats({ questionsAnswered: 0, correctAnswers: 0, currentStreak: 0, bestStreak: 0, averageTime: 0 })
        setComboCount(0)

        const q = generateQuestionForStart()
        setCurrentQuestion(q)
        setAnswered(false); answeredRef.current = false
        setSelectedAnswer(null); setIsCorrect(false)
        setIsFlipping(true)
        setTimeout(() => setIsFlipping(false), 300)
        startKanjiTimer()
    }

    function generateQuestionForStart() {
        // Reset used indices when starting fresh
        usedQuestionIndicesRef.current = []
        return generateQuestion()
    }

    function startKanjiTimer() {
        startTimer(setTimeLeft, timerRef, 15, () => {
            if (!answeredRef.current) {
                answeredRef.current = true
                setAnswered(true)
                setIsCorrect(false)
                setWrongAnswers(prev => [...prev, { kanji: '?', correctReading: '?', meaning: '?', userAnswer: '⏰ Time up' }])
                setTimeout(() => nextRound(), 1500)
            }
        })
    }

    function selectAnswer(option) {
        if (answeredRef.current) return
        clearInterval(timerRef.current)
        answeredRef.current = true
        setAnswered(true)
        setSelectedAnswer(option)
        const correct = option === currentQuestion.correctReading
        setIsCorrect(correct)

        setSessionStats(prev => {
            const updated = { ...prev, questionsAnswered: prev.questionsAnswered + 1 }
            if (correct) {
                updated.correctAnswers = prev.correctAnswers + 1
                updated.currentStreak = prev.currentStreak + 1
                if (updated.currentStreak > prev.bestStreak) updated.bestStreak = updated.currentStreak
            } else {
                updated.currentStreak = 0
            }
            return updated
        })

        if (correct) {
            scoreRef.current++
            setScore(scoreRef.current)
            setComboCount(prev => prev + 1)
            playSound('correct')
        } else {
            setComboCount(0)
            setWrongAnswers(prev => [...prev, {
                kanji: currentQuestion.kanji,
                correctReading: currentQuestion.correctReading,
                meaning: currentQuestion.meaning,
                userAnswer: option
            }])
            playSound('wrong')
        }

        setTimeout(() => nextRound(), 1500)
    }

    function nextRound() {
        if (currentRoundRef.current >= 10) {
            finishGame()
        } else {
            currentRoundRef.current++
            setCurrentRound(currentRoundRef.current)
            const q = generateQuestion()
            setCurrentQuestion(q)
            setAnswered(false); answeredRef.current = false
            setSelectedAnswer(null); setIsCorrect(false)
            setIsFlipping(true)
            setTimeout(() => setIsFlipping(false), 300)
            startKanjiTimer()
        }
    }

    async function finishGame() {
        setGameState('finished')
        clearInterval(timerRef.current)
        try {
            const res = await api.post('/quiz/scores', { score: scoreRef.current, total: 10, quiz_type: `jlpt_${selectedLevel.toLowerCase()}_kanji_reading` })
            setPointsEarned(res.data.pointsEarned || 0)
            setTotalPoints(res.data.totalPoints || 0)
            if (user) {
                user.points = res.data.totalPoints || user.points
                localStorage.setItem('user', JSON.stringify(user))
            }
        } catch (err) {
            console.error('Failed to save score:', err)
        }
    }

    function getResultEmoji() {
        if (score === 10) return '🏆'
        if (score >= 8) return '🌟'
        if (score >= 6) return '👍'
        if (score >= 4) return '📚'
        return '💪'
    }

    function getScoreMessage() {
        if (score === 10) return t('jlpt.perfect')
        if (score >= 8) return t('jlpt.excellent')
        if (score >= 6) return t('jlpt.good')
        if (score >= 4) return t('jlpt.keepPracticing')
        return t('jlpt.dontGiveUp')
    }

    /* ---------- Leaderboard ---------- */
    async function fetchLeaderboard() {
        setLeaderboardLoading(true)
        try {
            const res = await api.get('/quiz/leaderboard')
            setLeaderboard(res.data.leaderboard || [])
            setPersonalBest(res.data.personalBest ?? null)
        } catch (err) {
            console.error('Failed to fetch leaderboard:', err)
        } finally {
            setLeaderboardLoading(false)
        }
    }

    /* ---------- Keyboard shortcuts ---------- */
    useEffect(() => {
        function handleKeyPress(event) {
            if (gameState !== 'playing' || answeredRef.current) return
            const key = event.key.toLowerCase()
            const options = currentQuestion.options || []
            if (['1', '2', '3', '4'].includes(key)) {
                const index = parseInt(key) - 1
                if (options[index]) selectAnswer(options[index])
            } else if (['a', 'b', 'c', 'd'].includes(key)) {
                const index = ['a', 'b', 'c', 'd'].indexOf(key)
                if (options[index]) selectAnswer(options[index])
            }
        }
        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [gameState, currentQuestion])

    /* ==========================================
     * SIMILAR KANJI QUIZ
     * ========================================== */

    function generateSimilarQuestion() {
        let available = similarKanjiData.map((_, i) => i).filter(i => !usedSimilarIndicesRef.current.includes(i))
        if (available.length === 0) { usedSimilarIndicesRef.current = []; available = similarKanjiData.map((_, i) => i) }
        const idx = available[Math.floor(Math.random() * available.length)]
        usedSimilarIndicesRef.current.push(idx)
        const d = similarKanjiData[idx]
        return { correct: d.correct, meaning: d.meaning, reading: d.reading, options: shuffle([d.correct, ...d.similars.slice(0, 3)]) }
    }

    function startSimilarGame() {
        setSimilarState('playing')
        setSimilarRound(1); similarRoundRef.current = 1
        setSimilarScore(0); similarScoreRef.current = 0
        setSimilarWrong([])
        usedSimilarIndicesRef.current = []
        loadSimilarQuestion()
    }

    function loadSimilarQuestion() {
        setSimilarAnswered(false); similarAnsweredRef.current = false
        setSimilarSelected(null); setSimilarIsCorrect(false)
        setSimilarQuestion(generateSimilarQuestion())
        startTimer(setSimilarTimeLeft, similarTimerRef, 15, () => {
            if (!similarAnsweredRef.current) {
                similarAnsweredRef.current = true
                setSimilarAnswered(true); setSimilarIsCorrect(false)
                setSimilarWrong(prev => [...prev, { correct: '?', meaning: '?', userAnswer: '⏰ Time up' }])
                setTimeout(() => nextSimilarRound(), 1500)
            }
        })
    }

    function selectSimilarAnswer(option) {
        if (similarAnsweredRef.current) return
        clearInterval(similarTimerRef.current)
        similarAnsweredRef.current = true
        setSimilarAnswered(true); setSimilarSelected(option)
        const correct = option === similarQuestion.correct
        setSimilarIsCorrect(correct)
        if (correct) { similarScoreRef.current++; setSimilarScore(similarScoreRef.current) }
        else { setSimilarWrong(prev => [...prev, { correct: similarQuestion.correct, meaning: similarQuestion.meaning, userAnswer: option }]) }
        setTimeout(() => nextSimilarRound(), 1500)
    }

    function nextSimilarRound() {
        if (similarRoundRef.current >= 10) {
            finishSimilarGame()
        } else {
            similarRoundRef.current++; setSimilarRound(similarRoundRef.current)
            loadSimilarQuestion()
        }
    }

    async function finishSimilarGame() {
        setSimilarState('finished')
        clearInterval(similarTimerRef.current)
        try {
            const res = await api.post('/quiz/scores', { score: similarScoreRef.current, total: 10, quiz_type: `jlpt_${selectedLevel.toLowerCase()}_similar_kanji` })
            if (user && res.data.totalPoints) { user.points = res.data.totalPoints; localStorage.setItem('user', JSON.stringify(user)) }
        } catch (err) { console.error('Failed to save similar kanji score:', err) }
    }

    /* ==========================================
     * GRAMMAR REARRANGEMENT QUIZ
     * ========================================== */

    function generateGrammarQuestion() {
        let available = grammarData.map((_, i) => i).filter(i => !usedGrammarIndicesRef.current.includes(i))
        if (available.length === 0) { usedGrammarIndicesRef.current = []; available = grammarData.map((_, i) => i) }
        const idx = available[Math.floor(Math.random() * available.length)]
        usedGrammarIndicesRef.current.push(idx)
        const d = grammarData[idx]
        return { correct: d.correct, english: d.english }
    }

    function startGrammarGame() {
        setGrammarState('playing')
        setGrammarRound(1); grammarRoundRef.current = 1
        setGrammarScore(0); grammarScoreRef.current = 0
        setGrammarWrong([])
        usedGrammarIndicesRef.current = []
        loadGrammarQuestion()
    }

    function loadGrammarQuestion() {
        setGrammarAnswered(false); grammarAnsweredRef.current = false
        setGrammarIsCorrect(false); setGrammarSelectedWords([]); setGrammarUsedPool([])
        const q = generateGrammarQuestion()
        setGrammarQuestion(q)
        setGrammarPool(shuffle([...q.correct]))
        startTimer(setGrammarTimeLeft, grammarTimerRef, 30, () => {
            if (!grammarAnsweredRef.current) {
                grammarAnsweredRef.current = true
                setGrammarAnswered(true); setGrammarIsCorrect(false)
                setGrammarWrong(prev => [...prev, { correct: q.correct.join(''), english: q.english, userAnswer: '⏰ Time up' }])
                setTimeout(() => nextGrammarRound(), 2000)
            }
        })
    }

    function addWord(word, idx) {
        if (grammarUsedPool.includes(idx)) return
        setGrammarSelectedWords(prev => [...prev, word])
        setGrammarUsedPool(prev => [...prev, idx])
    }

    function removeWord(selectedIdx) {
        if (grammarAnswered) return
        const word = grammarSelectedWords[selectedIdx]
        setGrammarSelectedWords(prev => prev.filter((_, i) => i !== selectedIdx))
        setGrammarUsedPool(prev => {
            const poolIdx = prev.find(pi => grammarPool[pi] === word)
            return poolIdx !== undefined ? prev.filter(pi => pi !== poolIdx) : prev
        })
    }

    function clearGrammarSelection() {
        setGrammarSelectedWords([])
        setGrammarUsedPool([])
    }

    function checkGrammarAnswer() {
        if (grammarAnsweredRef.current) return
        clearInterval(grammarTimerRef.current)
        grammarAnsweredRef.current = true
        setGrammarAnswered(true)
        const userStr = grammarSelectedWords.join('')
        const correctStr = grammarQuestion.correct.join('')
        const correct = userStr === correctStr
        setGrammarIsCorrect(correct)
        if (correct) { grammarScoreRef.current++; setGrammarScore(grammarScoreRef.current) }
        else { setGrammarWrong(prev => [...prev, { correct: correctStr, english: grammarQuestion.english, userAnswer: userStr }]) }
        setTimeout(() => nextGrammarRound(), 2000)
    }

    function nextGrammarRound() {
        if (grammarRoundRef.current >= 10) {
            finishGrammarGame()
        } else {
            grammarRoundRef.current++; setGrammarRound(grammarRoundRef.current)
            loadGrammarQuestion()
        }
    }

    async function finishGrammarGame() {
        setGrammarState('finished')
        clearInterval(grammarTimerRef.current)
        try {
            const res = await api.post('/quiz/scores', { score: grammarScoreRef.current, total: 10, quiz_type: `jlpt_${selectedLevel.toLowerCase()}_grammar` })
            if (user && res.data.totalPoints) { user.points = res.data.totalPoints; localStorage.setItem('user', JSON.stringify(user)) }
        } catch (err) { console.error('Failed to save grammar score:', err) }
    }

    /* ---------- Drag & Drop ---------- */
    function onDragStartFromPool(e, word, idx) {
        if (grammarAnswered || grammarUsedPool.includes(idx)) return
        dragSourceRef.current = { from: 'pool', word, poolIdx: idx }
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', word)
    }

    function onDragStartFromAnswer(e, idx) {
        if (grammarAnswered) return
        dragSourceRef.current = { from: 'answer', answerIdx: idx, word: grammarSelectedWords[idx] }
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', grammarSelectedWords[idx])
    }

    function onDropToAnswer(e) {
        e.preventDefault(); setAnswerDragOver(false)
        if (!dragSourceRef.current || grammarAnswered) return
        if (dragSourceRef.current.from === 'pool') addWord(dragSourceRef.current.word, dragSourceRef.current.poolIdx)
        dragSourceRef.current = null
    }

    function onDropToPool(e) {
        e.preventDefault()
        if (!dragSourceRef.current || grammarAnswered) return
        if (dragSourceRef.current.from === 'answer') removeWord(dragSourceRef.current.answerIdx)
        dragSourceRef.current = null
    }

    /* ---------- Dictionary Lookup ---------- */
    async function lookupWord() {
        const query = dictionaryQuery.trim()
        if (!query) return
        setDictionaryLoading(true); setDictionaryError(''); setDictionaryResults([])
        try {
            const data = await searchDictionary(query)
            setDictionaryResults(data.slice(0, 5))
        } catch (err) {
            console.error('Dictionary lookup failed:', err)
            setDictionaryError(err?.response?.data?.message || err?.message || 'Failed to fetch dictionary results')
        } finally {
            setDictionaryLoading(false)
        }
    }

    /* ==========================================
     * RENDER
     * ========================================== */

    if (!isPremiumUser) {
        return (
            <div className="quiz-page">
                <AppHeader />
                <div className="premium-gate">
                    <div className="premium-gate-card">
                        <div className="premium-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h2>{t('jlpt.premiumOnly')}</h2>
                        <p>{t('jlpt.premiumDesc')}</p>
                        <button className="btn-upgrade" onClick={() => navigate('/premium')}>{t('jlpt.upgradePremium')}</button>
                        <Link to="/" className="back-link">{t('auth.backToHome')}</Link>
                    </div>
                </div>
                <footer className="quiz-footer"><p>{t('footer.copyright')}</p></footer>
            </div>
        )
    }

    return (
        <div className="quiz-page">
            <AppHeader />

            <div className="quiz-content">
                {/* Hero / Level Selector */}
                <section className="quiz-hero">
                    <div className="quiz-hero-inner">
                        <div className="level-selector">
                            <label className="level-label">Select Level:</label>
                            <div className="level-buttons">
                                {['N5', 'N4', 'N3', 'N2', 'N1'].map(lvl => (
                                    <button key={lvl} className={`level-btn ${selectedLevel === lvl ? 'active' : ''}`} onClick={() => setSelectedLevel(lvl)}>{lvl}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="quiz-main">
                    <div className="quiz-container">
                        {/* Tab Bar */}
                        <div className="tab-bar">
                            <button className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => setActiveTab('quiz')}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><path d="M9 12l2 2 4-4" /></svg>
                                Kanji Quiz
                            </button>
                            <button className={`tab-btn ${activeTab === 'similar' ? 'active' : ''}`} onClick={() => setActiveTab('similar')}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                                Similar Kanji
                            </button>
                            <button className={`tab-btn ${activeTab === 'grammar' ? 'active' : ''}`} onClick={() => setActiveTab('grammar')}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                                Grammar
                            </button>
                            <button className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`} onClick={() => { setActiveTab('leaderboard'); fetchLeaderboard() }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 21V12H2L12 3l10 9h-6v9H8z" /></svg>
                                {t('jlpt.leaderboardTab')}
                            </button>
                            <button className={`tab-btn ${activeTab === 'dictionary' ? 'active' : ''}`} onClick={() => setActiveTab('dictionary')}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                Dictionary
                            </button>
                        </div>

                        {/* ---- DICTIONARY TAB ---- */}
                        {activeTab === 'dictionary' && (
                            <div className="quiz-panel">
                                <div className="dictionary-card">
                                    <div className="dictionary-header">
                                        <div>
                                            <h3>Quick Dictionary</h3>
                                            <p className="dictionary-hint">Powered by Jisho — search words or kanji</p>
                                        </div>
                                        <div className="dictionary-actions">
                                            <input className="dict-input" type="text" placeholder="Enter Japanese or English" value={dictionaryQuery} onChange={e => setDictionaryQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && lookupWord()} />
                                            <button className="btn-start" onClick={lookupWord} disabled={!dictionaryQuery.trim() || dictionaryLoading}>{dictionaryLoading ? 'Searching...' : 'Search'}</button>
                                        </div>
                                    </div>
                                    {dictionaryError ? <div className="error">{dictionaryError}</div>
                                        : dictionaryLoading ? <div className="loading">Fetching dictionary results...</div>
                                            : <div className="dictionary-results">
                                                {dictionaryResults.length === 0
                                                    ? <div className="dictionary-empty">Try searching for a word like "食べる" or "study".</div>
                                                    : dictionaryResults.map((item, idx) => (
                                                        <div key={idx} className="dictionary-item">
                                                            <div className="dict-word">
                                                                <span className="dict-kanji">{item.japanese?.[0]?.word || item.japanese?.[0]?.reading || '—'}</span>
                                                                <span className="dict-reading">{item.japanese?.[0]?.reading || ''}</span>
                                                            </div>
                                                            <div className="dict-meaning">{item.senses?.[0]?.english_definitions?.join(', ') || 'No definition'}</div>
                                                            <div className="dict-tags">{(item.tags || []).slice(0, 3).map((tag, tIdx) => <span key={tIdx} className="dict-tag">{tag}</span>)}</div>
                                                        </div>
                                                    ))}
                                            </div>}
                                </div>
                            </div>
                        )}

                        {/* ---- QUIZ TAB ---- */}
                        {activeTab === 'quiz' && (
                            <div className="quiz-panel">
                                {gameState === 'idle' && (
                                    <div className="start-screen">
                                        <div className="start-card">
                                            <div className="start-icon">🎴</div>
                                            <h2>{t('jlpt.kanjiSoundQuiz')}</h2>
                                            <p>{t('jlpt.quizDescription')}</p>
                                            <div className="quiz-rules">
                                                <div className="rule"><span className="rule-num">10</span><span>{t('jlpt.rounds')}</span></div>
                                                <div className="rule"><span className="rule-num">4</span><span>{t('jlpt.choices')}</span></div>
                                                <div className="rule"><span className="rule-num">⏱</span><span>{t('jlpt.timeLimit')}</span></div>
                                            </div>
                                            <button className="btn-start" onClick={startGame}>
                                                {t('jlpt.startQuiz')}
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {gameState === 'playing' && (
                                    <div className="game-area">
                                        <div className="progress-section">
                                            <div className="progress-info">
                                                <span className="round-label">{t('jlpt.round')} {currentRound}/10</span>
                                                <span className="score-label">{t('jlpt.score')}: {score}/{currentRound - 1}</span>
                                            </div>
                                            <div className="progress-bar"><div className="progress-fill" style={{ width: `${(currentRound / 10) * 100}%` }} /></div>
                                            <div className="timer-bar"><div className={`timer-fill ${timeLeft <= 5 ? 'warning' : ''} ${timeLeft <= 3 ? 'danger' : ''}`} style={{ width: `${(timeLeft / 15) * 100}%` }} /></div>
                                            <span className="timer-text">{timeLeft}s</span>
                                        </div>

                                        {comboCount >= 3 && (
                                            <div className={`combo-badge ${comboCount >= 5 ? 'mega-combo' : ''}`}>
                                                <span className="combo-icon">🔥</span>
                                                <span className="combo-text">{comboCount}x COMBO!</span>
                                            </div>
                                        )}

                                        <div className="session-stats-widget">
                                            <div className="stat-mini"><span className="stat-icon">📊</span><span className="stat-value">{sessionStats.questionsAnswered > 0 ? Math.round((sessionStats.correctAnswers / sessionStats.questionsAnswered) * 100) : 0}%</span></div>
                                            <div className="stat-mini"><span className="stat-icon">⚡</span><span className="stat-value">{sessionStats.currentStreak}</span></div>
                                            <div className="stat-mini"><span className="stat-icon">🏅</span><span className="stat-value">{sessionStats.bestStreak}</span></div>
                                        </div>

                                        <div className={`question-card ${isFlipping ? 'card-flip' : ''}`}>
                                            <div className="question-label">{t('jlpt.whatReading')}</div>
                                            <div className="kanji-display">{currentQuestion.kanji}</div>
                                            <div className="kanji-meaning">({currentQuestion.meaning})</div>
                                        </div>

                                        <div className="answers-grid">
                                            {(currentQuestion.options || []).map((option, idx) => (
                                                <button key={idx} className={`answer-btn ${answered && option === currentQuestion.correctReading ? 'correct' : ''} ${answered && selectedAnswer === option && option !== currentQuestion.correctReading ? 'wrong' : ''} ${answered ? 'disabled' : ''}`} disabled={answered} onClick={() => selectAnswer(option)}>
                                                    <span className="answer-key">{['A', 'B', 'C', 'D'][idx]}</span>
                                                    <span className="answer-text">{option}</span>
                                                    <span className="answer-shortcut">{idx + 1}</span>
                                                </button>
                                            ))}
                                        </div>

                                        {answered && (
                                            <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}>
                                                <span className="feedback-icon">{isCorrect ? '✅' : '❌'}</span>
                                                <span>{isCorrect ? t('jlpt.correct') : t('jlpt.wrongAnswer') + ': ' + currentQuestion.correctReading}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {gameState === 'finished' && (
                                    <div className="results-screen">
                                        <div className="results-card">
                                            <div className="results-emoji">{getResultEmoji()}</div>
                                            <h2>{t('jlpt.quizComplete')}</h2>
                                            <div className="final-score">
                                                <span className="score-number">{score}</span>
                                                <span className="score-divider">/</span>
                                                <span className="score-total">10</span>
                                            </div>
                                            <p className="score-message">{getScoreMessage()}</p>
                                            <div className="results-stats">
                                                <div className="stat"><span className="stat-val correct-val">{score}</span><span className="stat-label">{t('jlpt.correctAnswers')}</span></div>
                                                <div className="stat"><span className="stat-val wrong-val">{10 - score}</span><span className="stat-label">{t('jlpt.wrongAnswers')}</span></div>
                                                <div className="stat"><span className="stat-val">{score * 10}%</span><span className="stat-label">{t('jlpt.accuracy')}</span></div>
                                            </div>
                                            {pointsEarned > 0 && (
                                                <div className="points-earned-banner">
                                                    <div className="points-icon">🪙</div>
                                                    <div className="points-info">
                                                        <span className="points-amount">+{pointsEarned} {t('jlpt.pointsEarned')}</span>
                                                        <span className="points-total">{t('jlpt.totalPoints')}: {totalPoints}</span>
                                                    </div>
                                                    <Link to="/points-shop" className="points-shop-link">{t('jlpt.redeemPoints')} →</Link>
                                                </div>
                                            )}
                                            {wrongAnswers.length > 0 && (
                                                <div className="review-section">
                                                    <h3>{t('jlpt.reviewMistakes')}</h3>
                                                    <div className="review-list">
                                                        {wrongAnswers.map((item, idx) => (
                                                            <div key={idx} className="review-item">
                                                                <span className="review-kanji">{item.kanji}</span>
                                                                <span className="review-wrong">✗ {item.userAnswer}</span>
                                                                <span className="review-correct">✓ {item.correctReading}</span>
                                                                <span className="review-meaning">{item.meaning}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="results-actions">
                                                <button className="btn-start" onClick={startGame}>{t('jlpt.playAgain')}</button>
                                                <button className="btn-secondary" onClick={() => { setActiveTab('leaderboard'); fetchLeaderboard() }}>{t('jlpt.viewLeaderboard')}</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ---- SIMILAR KANJI TAB ---- */}
                        {activeTab === 'similar' && (
                            <div className="quiz-panel">
                                {similarState === 'idle' && (
                                    <div className="start-screen"><div className="start-card">
                                        <div className="start-icon">👀</div>
                                        <h2>Similar Kanji Quiz</h2>
                                        <p>Can you tell apart kanji that look almost identical? Pick the correct one!</p>
                                        <div className="quiz-rules">
                                            <div className="rule"><span className="rule-num">10</span><span>Questions</span></div>
                                            <div className="rule"><span className="rule-num">4</span><span>Look-alikes</span></div>
                                            <div className="rule"><span className="rule-num">⏱</span><span>15s per Q</span></div>
                                        </div>
                                        <button className="btn-start" onClick={startSimilarGame}>Start Quiz <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                                    </div></div>
                                )}
                                {similarState === 'playing' && (
                                    <div className="game-area">
                                        <div className="progress-section">
                                            <div className="progress-info"><span className="round-label">Question {similarRound}/10</span><span className="score-label">Score: {similarScore}/{similarRound - 1}</span></div>
                                            <div className="progress-bar"><div className="progress-fill" style={{ width: `${(similarRound / 10) * 100}%` }} /></div>
                                            <div className="timer-bar"><div className={`timer-fill ${similarTimeLeft <= 5 ? 'warning' : ''} ${similarTimeLeft <= 3 ? 'danger' : ''}`} style={{ width: `${(similarTimeLeft / 15) * 100}%` }} /></div>
                                            <span className="timer-text">{similarTimeLeft}s</span>
                                        </div>
                                        <div className="question-card">
                                            <div className="question-label">Which kanji means:</div>
                                            <div className="kanji-meaning-prompt">{similarQuestion.meaning}</div>
                                            <div className="kanji-reading-hint">( {similarQuestion.reading} )</div>
                                        </div>
                                        <div className="answers-grid">
                                            {(similarQuestion.options || []).map((option, idx) => (
                                                <button key={idx} className={`answer-btn answer-btn-kanji ${similarAnswered && option === similarQuestion.correct ? 'correct' : ''} ${similarAnswered && similarSelected === option && option !== similarQuestion.correct ? 'wrong' : ''} ${similarAnswered ? 'disabled' : ''}`} disabled={similarAnswered} onClick={() => selectSimilarAnswer(option)}>
                                                    <span className="answer-key">{['A', 'B', 'C', 'D'][idx]}</span>
                                                    <span className="answer-text kanji-option">{option}</span>
                                                </button>
                                            ))}
                                        </div>
                                        {similarAnswered && (
                                            <div className={`feedback ${similarIsCorrect ? 'correct' : 'wrong'}`}>
                                                <span className="feedback-icon">{similarIsCorrect ? '✅' : '❌'}</span>
                                                <span>{similarIsCorrect ? 'Correct!' : 'Wrong! Answer: ' + similarQuestion.correct}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {similarState === 'finished' && (
                                    <div className="results-screen"><div className="results-card">
                                        <div className="results-emoji">{similarScore === 10 ? '🏆' : similarScore >= 8 ? '🌟' : similarScore >= 6 ? '👍' : '📚'}</div>
                                        <h2>Quiz Complete!</h2>
                                        <div className="final-score"><span className="score-number">{similarScore}</span><span className="score-divider">/</span><span className="score-total">10</span></div>
                                        {similarWrong.length > 0 && (
                                            <div className="review-section"><h3>Review Your Mistakes</h3><div className="review-list">
                                                {similarWrong.map((item, idx) => (
                                                    <div key={idx} className="review-item">
                                                        <span className="review-kanji">{item.correct}</span>
                                                        <span className="review-wrong">✗ {item.userAnswer}</span>
                                                        <span className="review-correct">✓ {item.correct}</span>
                                                        <span className="review-meaning">{item.meaning}</span>
                                                    </div>
                                                ))}
                                            </div></div>
                                        )}
                                        <div className="results-actions"><button className="btn-start" onClick={startSimilarGame}>Play Again</button></div>
                                    </div></div>
                                )}
                            </div>
                        )}

                        {/* ---- GRAMMAR TAB ---- */}
                        {activeTab === 'grammar' && (
                            <div className="quiz-panel">
                                {grammarState === 'idle' && (
                                    <div className="start-screen"><div className="start-card">
                                        <div className="start-icon">📝</div>
                                        <h2>Sentence Rearrangement</h2>
                                        <p>Rearrange the scrambled words to form a correct Japanese sentence!</p>
                                        <div className="quiz-rules">
                                            <div className="rule"><span className="rule-num">10</span><span>Sentences</span></div>
                                            <div className="rule"><span className="rule-num">🔀</span><span>Drag / Tap</span></div>
                                            <div className="rule"><span className="rule-num">⏱</span><span>30s per Q</span></div>
                                        </div>
                                        <button className="btn-start" onClick={startGrammarGame}>Start Quiz <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                                    </div></div>
                                )}
                                {grammarState === 'playing' && (
                                    <div className="game-area">
                                        <div className="progress-section">
                                            <div className="progress-info"><span className="round-label">Sentence {grammarRound}/10</span><span className="score-label">Score: {grammarScore}/{grammarRound - 1}</span></div>
                                            <div className="progress-bar"><div className="progress-fill" style={{ width: `${(grammarRound / 10) * 100}%` }} /></div>
                                            <div className="timer-bar"><div className={`timer-fill ${grammarTimeLeft <= 10 ? 'warning' : ''} ${grammarTimeLeft <= 5 ? 'danger' : ''}`} style={{ width: `${(grammarTimeLeft / 30) * 100}%` }} /></div>
                                            <span className="timer-text">{grammarTimeLeft}s</span>
                                        </div>
                                        <div className="question-card">
                                            <div className="question-label">Rearrange to form a correct sentence:</div>
                                            <div className="grammar-english-hint">🇬🇧 {grammarQuestion.english}</div>
                                        </div>
                                        <div className={`grammar-answer-area ${answerDragOver ? 'drag-over' : ''}`} onDragOver={e => e.preventDefault()} onDragEnter={() => setAnswerDragOver(true)} onDragLeave={() => setAnswerDragOver(false)} onDrop={onDropToAnswer}>
                                            <div className="answer-slots">
                                                {grammarSelectedWords.map((word, idx) => (
                                                    <button key={'sel-' + idx} className="word-chip selected" draggable onDragStart={e => onDragStartFromAnswer(e, idx)} onClick={() => removeWord(idx)}>
                                                        {word}<span className="chip-remove">✕</span>
                                                    </button>
                                                ))}
                                                {grammarSelectedWords.length === 0 && <span className="placeholder-text">Drag or tap words to build the sentence...</span>}
                                            </div>
                                        </div>
                                        <div className="grammar-word-pool" onDragOver={e => e.preventDefault()} onDrop={onDropToPool}>
                                            {grammarPool.map((word, idx) => (
                                                <button key={'pool-' + idx} className={`word-chip available`} disabled={grammarUsedPool.includes(idx)} draggable onDragStart={e => onDragStartFromPool(e, word, idx)} onClick={() => addWord(word, idx)}>
                                                    {word}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="grammar-actions">
                                            <button className="btn-start" disabled={grammarSelectedWords.length !== (grammarQuestion.correct || []).length || grammarAnswered} onClick={checkGrammarAnswer}>Check Answer ✓</button>
                                            <button className="btn-secondary" onClick={clearGrammarSelection} disabled={grammarAnswered}>Clear</button>
                                        </div>
                                        {grammarAnswered && (
                                            <div className={`feedback ${grammarIsCorrect ? 'correct' : 'wrong'}`}>
                                                <span className="feedback-icon">{grammarIsCorrect ? '✅' : '❌'}</span>
                                                <div className="grammar-feedback-detail">
                                                    <span>{grammarIsCorrect ? 'Correct!' : 'Incorrect!'}</span>
                                                    {!grammarIsCorrect && <span className="correct-sentence">Correct: {(grammarQuestion.correct || []).join('')}</span>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {grammarState === 'finished' && (
                                    <div className="results-screen"><div className="results-card">
                                        <div className="results-emoji">{grammarScore === 10 ? '🏆' : grammarScore >= 8 ? '🌟' : grammarScore >= 6 ? '👍' : '📚'}</div>
                                        <h2>Quiz Complete!</h2>
                                        <div className="final-score"><span className="score-number">{grammarScore}</span><span className="score-divider">/</span><span className="score-total">10</span></div>
                                        {grammarWrong.length > 0 && (
                                            <div className="review-section"><h3>Review Your Mistakes</h3><div className="review-list">
                                                {grammarWrong.map((item, idx) => (
                                                    <div key={idx} className="review-item review-item-grammar">
                                                        <div className="review-grammar-row"><span className="review-wrong">✗ {item.userAnswer}</span></div>
                                                        <div className="review-grammar-row"><span className="review-correct">✓ {item.correct}</span></div>
                                                        <div className="review-grammar-row"><span className="review-meaning">🇬🇧 {item.english}</span></div>
                                                    </div>
                                                ))}
                                            </div></div>
                                        )}
                                        <div className="results-actions"><button className="btn-start" onClick={startGrammarGame}>Play Again</button></div>
                                    </div></div>
                                )}
                            </div>
                        )}

                        {/* ---- LEADERBOARD TAB ---- */}
                        {activeTab === 'leaderboard' && (
                            <div className="leaderboard-panel">
                                <div className="leaderboard-header">
                                    <h2>🏆 {t('jlpt.topPlayers')}</h2>
                                    <p>{t('jlpt.leaderboardDesc')}</p>
                                </div>
                                {leaderboardLoading ? (
                                    <div className="leaderboard-loading"><div className="loading-spinner" /><span>{t('common.loading')}</span></div>
                                ) : leaderboard.length === 0 ? (
                                    <div className="leaderboard-empty"><span className="empty-icon">🏅</span><p>{t('jlpt.noScoresYet')}</p><button className="btn-start" onClick={() => setActiveTab('quiz')}>{t('jlpt.beFirst')}</button></div>
                                ) : (
                                    <div className="leaderboard-table">
                                        <div className="lb-row lb-header-row">
                                            <span className="lb-rank">#</span><span className="lb-name">{t('jlpt.player')}</span><span className="lb-score">Total</span><span className="lb-date">Games</span>
                                        </div>
                                        {leaderboard.map((entry, idx) => (
                                            <div key={entry.id || idx} className={`lb-row ${idx === 0 ? 'lb-top1' : ''} ${idx === 1 ? 'lb-top2' : ''} ${idx === 2 ? 'lb-top3' : ''} ${entry.user_id === user?.id ? 'lb-self' : ''}`}>
                                                <span className="lb-rank">{idx === 0 ? <span className="medal">🥇</span> : idx === 1 ? <span className="medal">🥈</span> : idx === 2 ? <span className="medal">🥉</span> : idx + 1}</span>
                                                <span className="lb-name"><span className="lb-avatar">{entry.user_name?.charAt(0).toUpperCase() || '?'}</span>{entry.user_name || 'Anonymous'}</span>
                                                <span className="lb-score">{entry.total_score || entry.score || 0}</span>
                                                <span className="lb-date">{entry.quiz_types_played || 1} types</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {personalBest !== null && (
                                    <div className="personal-best"><span className="pb-label">Your Total Best</span><span className="pb-score">{personalBest} pts</span></div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <footer className="quiz-footer"><p>{t('footer.copyright')}</p></footer>
        </div>
    )
}
