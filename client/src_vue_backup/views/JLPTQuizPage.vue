<!--
  JLPTQuizPage.vue

  Premium-only JLPT Kanji reading quiz:
    - Gate non-premium users with an upgrade CTA
    - Level selector (N5–N1) with timed kanji-reading rounds
    - Tabs: Quiz / Similar Kanji / Dictionary Lookup / Leaderboard
    - Session stats, streak combos, and point rewards
-->

<template>
  <div class="quiz-page">
    <AppHeader />

    <!-- Premium Gate -->
    <div v-if="!isPremiumUser" class="premium-gate">
      <div class="premium-gate-card">
        <div class="premium-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2>{{ $t('jlpt.premiumOnly') }}</h2>
        <p>{{ $t('jlpt.premiumDesc') }}</p>
        <button class="btn-upgrade" @click="$router.push('/premium')">
          {{ $t('jlpt.upgradePremium') }}
        </button>
        <router-link to="/" class="back-link">{{ $t('auth.backToHome') }}</router-link>
      </div>
    </div>

    <!-- Quiz Content (for premium users) -->
    <div v-else class="quiz-content">
      <!-- Header Section -->
      <section class="quiz-hero">
        <div class="quiz-hero-inner">
          <!-- JLPT Level Selector -->
          <div class="level-selector">
            <label class="level-label">Select Level:</label>
            <div class="level-buttons">
              <button v-for="lvl in ['N5','N4','N3','N2','N1']" :key="lvl" class="level-btn" :class="{ active: selectedLevel === lvl }" @click="selectedLevel = lvl">
                {{ lvl }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Tabs: Quiz / Leaderboard -->
      <section class="quiz-main">
        <div class="quiz-container">
          <div class="tab-bar">
            <button class="tab-btn" :class="{ active: activeTab === 'quiz' }" @click="activeTab = 'quiz'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              Kanji Quiz
            </button>
            <button class="tab-btn" :class="{ active: activeTab === 'similar' }" @click="activeTab = 'similar'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              Similar Kanji
            </button>
            <button class="tab-btn" :class="{ active: activeTab === 'grammar' }" @click="activeTab = 'grammar'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              Grammar
            </button>
            <button class="tab-btn" :class="{ active: activeTab === 'leaderboard' }" @click="activeTab = 'leaderboard'; fetchLeaderboard()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 21V12H2L12 3l10 9h-6v9H8z"/>
              </svg>
              {{ $t('jlpt.leaderboardTab') }}
            </button>
            <button class="tab-btn" :class="{ active: activeTab === 'dictionary' }" @click="activeTab = 'dictionary'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Dictionary
            </button>
          </div>

          <!-- DICTIONARY TAB -->
          <div v-if="activeTab === 'dictionary'" class="quiz-panel">
          <div class="dictionary-card">
            <div class="dictionary-header">
              <div>
                <h3>Quick Dictionary</h3>
                <p class="dictionary-hint">Powered by Jisho — search words or kanji</p>
              </div>
              <div class="dictionary-actions">
                <input
                  v-model="dictionaryQuery"
                  class="dict-input"
                  type="text"
                  placeholder="Enter Japanese or English"
                  @keyup.enter="lookupWord"
                />
                <button class="btn-start" @click="lookupWord" :disabled="!dictionaryQuery.trim() || dictionaryLoading">
                  {{ dictionaryLoading ? 'Searching...' : 'Search' }}
                </button>
              </div>
            </div>

            <div v-if="dictionaryError" class="error">{{ dictionaryError }}</div>
            <div v-else-if="dictionaryLoading" class="loading">Fetching dictionary results...</div>
            <div v-else class="dictionary-results">
              <div v-if="dictionaryResults.length === 0" class="dictionary-empty">Try searching for a word like "食べる" or "study".</div>
              <div v-else class="dictionary-item" v-for="(item, idx) in dictionaryResults" :key="idx">
                <div class="dict-word">
                  <span class="dict-kanji">{{ item.japanese?.[0]?.word || item.japanese?.[0]?.reading || '—' }}</span>
                  <span class="dict-reading">{{ item.japanese?.[0]?.reading || '' }}</span>
                </div>
                <div class="dict-meaning">{{ item.senses?.[0]?.english_definitions?.join(', ') || 'No definition' }}</div>
                <div class="dict-tags">
                  <span v-for="(tag, tIdx) in (item.tags || []).slice(0, 3)" :key="tIdx" class="dict-tag">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>
          </div>

          <!-- QUIZ TAB -->
          <div v-if="activeTab === 'quiz'" class="quiz-panel">

            <!-- Start Screen -->
            <div v-if="gameState === 'idle'" class="start-screen">
              <div class="start-card">
                <div class="start-icon">🎴</div>
                <h2>{{ $t('jlpt.kanjiSoundQuiz') }}</h2>
                <p>{{ $t('jlpt.quizDescription') }}</p>
                
                <div class="quiz-rules">
                  <div class="rule">
                    <span class="rule-num">10</span>
                    <span>{{ $t('jlpt.rounds') }}</span>
                  </div>
                  <div class="rule">
                    <span class="rule-num">4</span>
                    <span>{{ $t('jlpt.choices') }}</span>
                  </div>
                  <div class="rule">
                    <span class="rule-num">⏱</span>
                    <span>{{ $t('jlpt.timeLimit') }}</span>
                  </div>
                </div>
                <button class="btn-start" @click="startGame">
                  {{ $t('jlpt.startQuiz') }}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Active Game -->
            <div v-else-if="gameState === 'playing'" class="game-area">
              <!-- Progress Bar -->
              <div class="progress-section">
                <div class="progress-info">
                  <span class="round-label">{{ $t('jlpt.round') }} {{ currentRound }}/10</span>
                  <span class="score-label">{{ $t('jlpt.score') }}: {{ score }}/{{ currentRound - 1 }}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: `${(currentRound / 10) * 100}%` }"></div>
                </div>
                <div class="timer-bar">
                  <div class="timer-fill" :class="{ warning: timeLeft <= 5, danger: timeLeft <= 3 }" :style="{ width: `${(timeLeft / 15) * 100}%` }"></div>
                </div>
                <span class="timer-text">{{ timeLeft }}s</span>
              </div>

              <!-- NEW: Combo Counter -->
              <Transition name="combo">
                <div v-if="comboCount >= 3" class="combo-badge" :class="{ 'mega-combo': comboCount >= 5 }">
                  <span class="combo-icon">🔥</span>
                  <span class="combo-text">{{ comboCount }}x COMBO!</span>
                </div>
              </Transition>

              <!-- NEW: Session Stats Widget -->
              <div class="session-stats-widget">
                <div class="stat-mini">
                  <span class="stat-icon">📊</span>
                  <span class="stat-value">{{ sessionStats.questionsAnswered > 0 ? Math.round((sessionStats.correctAnswers / sessionStats.questionsAnswered) * 100) : 0 }}%</span>
                </div>
                <div class="stat-mini">
                  <span class="stat-icon">⚡</span>
                  <span class="stat-value">{{ sessionStats.currentStreak }}</span>
                </div>
                <div class="stat-mini">
                  <span class="stat-icon">🏅</span>
                  <span class="stat-value">{{ sessionStats.bestStreak }}</span>
                </div>
              </div>

              <!-- Question Card -->
              <div class="question-card" :class="{ 'card-flip': isFlipping }">
                <div class="question-label">{{ $t('jlpt.whatReading') }}</div>
                <div class="kanji-display">{{ currentQuestion.kanji }}</div>
                <div class="kanji-meaning">({{ currentQuestion.meaning }})</div>
              </div>

              <!-- Answer Options -->
              <div class="answers-grid">
                <button
                  v-for="(option, idx) in currentQuestion.options"
                  :key="idx"
                  class="answer-btn"
                  :class="{
                    correct: answered && option === currentQuestion.correctReading,
                    wrong: answered && selectedAnswer === option && option !== currentQuestion.correctReading,
                    disabled: answered
                  }"
                  :disabled="answered"
                  @click="selectAnswer(option)"
                >
                  <span class="answer-key">{{ ['A', 'B', 'C', 'D'][idx] }}</span>
                  <span class="answer-text">{{ option }}</span>
                  <span class="answer-shortcut">{{ idx + 1 }}</span>
                </button>
              </div>

              <!-- Feedback -->
              <Transition name="fade">
                <div v-if="answered" class="feedback" :class="isCorrect ? 'correct' : 'wrong'">
                  <span class="feedback-icon">{{ isCorrect ? '✅' : '❌' }}</span>
                  <span>{{ isCorrect ? $t('jlpt.correct') : $t('jlpt.wrongAnswer') + ': ' + currentQuestion.correctReading }}</span>
                </div>
              </Transition>
            </div>

            <!-- Results Screen -->
            <div v-else-if="gameState === 'finished'" class="results-screen">
              <div class="results-card">
                <div class="results-emoji">{{ getResultEmoji() }}</div>
                <h2>{{ $t('jlpt.quizComplete') }}</h2>
                <div class="final-score">
                  <span class="score-number">{{ score }}</span>
                  <span class="score-divider">/</span>
                  <span class="score-total">10</span>
                </div>
                <p class="score-message">{{ getScoreMessage() }}</p>

                <div class="results-stats">
                  <div class="stat">
                    <span class="stat-val correct-val">{{ score }}</span>
                    <span class="stat-label">{{ $t('jlpt.correctAnswers') }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-val wrong-val">{{ 10 - score }}</span>
                    <span class="stat-label">{{ $t('jlpt.wrongAnswers') }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-val">{{ score * 10 }}%</span>
                    <span class="stat-label">{{ $t('jlpt.accuracy') }}</span>
                  </div>
                </div>

                <!-- Points Earned -->
                <div v-if="pointsEarned > 0" class="points-earned-banner">
                  <div class="points-icon">🪙</div>
                  <div class="points-info">
                    <span class="points-amount">+{{ pointsEarned }} {{ $t('jlpt.pointsEarned') }}</span>
                    <span class="points-total">{{ $t('jlpt.totalPoints') }}: {{ totalPoints }}</span>
                  </div>
                  <router-link to="/points-shop" class="points-shop-link">{{ $t('jlpt.redeemPoints') }} →</router-link>
                </div>

                <!-- Review Wrong Answers -->
                <div v-if="wrongAnswers.length > 0" class="review-section">
                  <h3>{{ $t('jlpt.reviewMistakes') }}</h3>
                  <div class="review-list">
                    <div v-for="(item, idx) in wrongAnswers" :key="idx" class="review-item">
                      <span class="review-kanji">{{ item.kanji }}</span>
                      <span class="review-wrong">✗ {{ item.userAnswer }}</span>
                      <span class="review-correct">✓ {{ item.correctReading }}</span>
                      <span class="review-meaning">{{ item.meaning }}</span>
                    </div>
                  </div>
                </div>

                <div class="results-actions">
                  <button class="btn-start" @click="startGame">
                    {{ $t('jlpt.playAgain') }}
                  </button>
                  <button class="btn-secondary" @click="activeTab = 'leaderboard'; fetchLeaderboard()">
                    {{ $t('jlpt.viewLeaderboard') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- LEADERBOARD TAB -->
          <div v-if="activeTab === 'leaderboard'" class="leaderboard-panel">
            <div class="leaderboard-header">
              <h2>🏆 {{ $t('jlpt.topPlayers') }}</h2>
              <p>{{ $t('jlpt.leaderboardDesc') }}</p>
            </div>

            <div v-if="leaderboardLoading" class="leaderboard-loading">
              <div class="loading-spinner"></div>
              <span>{{ $t('common.loading') }}</span>
            </div>

            <div v-else-if="leaderboard.length === 0" class="leaderboard-empty">
              <span class="empty-icon">🏅</span>
              <p>{{ $t('jlpt.noScoresYet') }}</p>
              <button class="btn-start" @click="activeTab = 'quiz'">{{ $t('jlpt.beFirst') }}</button>
            </div>

            <div v-else class="leaderboard-table">
              <div class="lb-row lb-header-row">
                <span class="lb-rank">#</span>
                <span class="lb-name">{{ $t('jlpt.player') }}</span>
                <span class="lb-score">Total</span>
                <span class="lb-date">Games</span>
              </div>
              <div
                v-for="(entry, idx) in leaderboard"
                :key="entry.id"
                class="lb-row"
                :class="{ 'lb-top1': idx === 0, 'lb-top2': idx === 1, 'lb-top3': idx === 2, 'lb-self': entry.user_id === authStore.user?.id }"
              >
                <span class="lb-rank">
                  <span v-if="idx === 0" class="medal">🥇</span>
                  <span v-else-if="idx === 1" class="medal">🥈</span>
                  <span v-else-if="idx === 2" class="medal">🥉</span>
                  <span v-else>{{ idx + 1 }}</span>
                </span>
                <span class="lb-name">
                  <span class="lb-avatar">{{ entry.user_name?.charAt(0).toUpperCase() || '?' }}</span>
                  {{ entry.user_name || 'Anonymous' }}
                </span>
                <span class="lb-score">{{ entry.total_score || entry.score || 0 }}</span>
                <span class="lb-date">{{ entry.quiz_types_played || 1 }} types</span>
              </div>
            </div>

            <!-- Personal Best -->
            <div v-if="personalBest !== null" class="personal-best">
              <span class="pb-label">Your Total Best</span>
              <span class="pb-score">{{ personalBest }} pts</span>
            </div>
          </div>

          <!-- SIMILAR KANJI QUIZ TAB -->
          <div v-if="activeTab === 'similar'" class="quiz-panel">
            <!-- Start Screen -->
            <div v-if="similarState === 'idle'" class="start-screen">
              <div class="start-card">
                <div class="start-icon">👀</div>
                <h2>Similar Kanji Quiz</h2>
                <p>Can you tell apart kanji that look almost identical? Pick the correct one!</p>

                <div class="quiz-rules">
                  <div class="rule"><span class="rule-num">10</span><span>Questions</span></div>
                  <div class="rule"><span class="rule-num">4</span><span>Look-alikes</span></div>
                  <div class="rule"><span class="rule-num">⏱</span><span>15s per Q</span></div>
                </div>
                <button class="btn-start" @click="startSimilarGame">
                  Start Quiz
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </div>
            </div>

            <!-- Playing -->
            <div v-else-if="similarState === 'playing'" class="game-area">
              <div class="progress-section">
                <div class="progress-info">
                  <span class="round-label">Question {{ similarRound }}/10</span>
                  <span class="score-label">Score: {{ similarScore }}/{{ similarRound - 1 }}</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" :style="{ width: `${(similarRound / 10) * 100}%` }"></div></div>
                <div class="timer-bar"><div class="timer-fill" :class="{ warning: similarTimeLeft <= 5, danger: similarTimeLeft <= 3 }" :style="{ width: `${(similarTimeLeft / 15) * 100}%` }"></div></div>
                <span class="timer-text">{{ similarTimeLeft }}s</span>
              </div>

              <div class="question-card">
                <div class="question-label">Which kanji means:</div>
                <div class="kanji-meaning-prompt">{{ similarQuestion.meaning }}</div>
                <div class="kanji-reading-hint">( {{ similarQuestion.reading }} )</div>
              </div>

              <div class="answers-grid">
                <button
                  v-for="(option, idx) in similarQuestion.options"
                  :key="idx"
                  class="answer-btn answer-btn-kanji"
                  :class="{
                    correct: similarAnswered && option === similarQuestion.correct,
                    wrong: similarAnswered && similarSelected === option && option !== similarQuestion.correct,
                    disabled: similarAnswered
                  }"
                  :disabled="similarAnswered"
                  @click="selectSimilarAnswer(option)"
                >
                  <span class="answer-key">{{ ['A','B','C','D'][idx] }}</span>
                  <span class="answer-text kanji-option">{{ option }}</span>
                </button>
              </div>

              <Transition name="fade">
                <div v-if="similarAnswered" class="feedback" :class="similarIsCorrect ? 'correct' : 'wrong'">
                  <span class="feedback-icon">{{ similarIsCorrect ? '✅' : '❌' }}</span>
                  <span>{{ similarIsCorrect ? 'Correct!' : 'Wrong! Answer: ' + similarQuestion.correct }}</span>
                </div>
              </Transition>
            </div>

            <!-- Results -->
            <div v-else-if="similarState === 'finished'" class="results-screen">
              <div class="results-card">
                <div class="results-emoji">{{ similarScore === 10 ? '🏆' : similarScore >= 8 ? '🌟' : similarScore >= 6 ? '👍' : '📚' }}</div>
                <h2>Quiz Complete!</h2>
                <div class="final-score">
                  <span class="score-number">{{ similarScore }}</span>
                  <span class="score-divider">/</span>
                  <span class="score-total">10</span>
                </div>

                <div v-if="similarWrong.length > 0" class="review-section">
                  <h3>Review Your Mistakes</h3>
                  <div class="review-list">
                    <div v-for="(item, idx) in similarWrong" :key="idx" class="review-item">
                      <span class="review-kanji">{{ item.correct }}</span>
                      <span class="review-wrong">✗ {{ item.userAnswer }}</span>
                      <span class="review-correct">✓ {{ item.correct }}</span>
                      <span class="review-meaning">{{ item.meaning }}</span>
                    </div>
                  </div>
                </div>

                <div class="results-actions">
                  <button class="btn-start" @click="startSimilarGame">Play Again</button>
                </div>
              </div>
            </div>
          </div>

          <!-- SENTENCE GRAMMAR TAB -->
          <div v-if="activeTab === 'grammar'" class="quiz-panel">
            <!-- Start Screen -->
            <div v-if="grammarState === 'idle'" class="start-screen">
              <div class="start-card">
                <div class="start-icon">📝</div>
                <h2>Sentence Rearrangement</h2>
                <p>Rearrange the scrambled words to form a correct Japanese sentence!</p>
                <div class="quiz-rules">
                  <div class="rule"><span class="rule-num">10</span><span>Sentences</span></div>
                  <div class="rule"><span class="rule-num">🔀</span><span>Drag / Tap</span></div>
                  <div class="rule"><span class="rule-num">⏱</span><span>30s per Q</span></div>
                </div>
                <button class="btn-start" @click="startGrammarGame">
                  Start Quiz
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </div>
            </div>

            <!-- Playing -->
            <div v-else-if="grammarState === 'playing'" class="game-area">
              <div class="progress-section">
                <div class="progress-info">
                  <span class="round-label">Sentence {{ grammarRound }}/10</span>
                  <span class="score-label">Score: {{ grammarScore }}/{{ grammarRound - 1 }}</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" :style="{ width: `${(grammarRound / 10) * 100}%` }"></div></div>
                <div class="timer-bar"><div class="timer-fill" :class="{ warning: grammarTimeLeft <= 10, danger: grammarTimeLeft <= 5 }" :style="{ width: `${(grammarTimeLeft / 30) * 100}%` }"></div></div>
                <span class="timer-text">{{ grammarTimeLeft }}s</span>
              </div>

              <div class="question-card">
                <div class="question-label">Rearrange to form a correct sentence:</div>
                <div class="grammar-english-hint">🇬🇧 {{ grammarQuestion.english }}</div>
              </div>

              <!-- Selected words (answer area) -->
              <div class="grammar-answer-area"
                :class="{ 'drag-over': answerDragOver }"
                @dragover.prevent
                @dragenter="answerDragOver = true"
                @dragleave="answerDragOver = false"
                @drop="answerDragOver = false; onDropToAnswer($event)"
              >
                <div class="answer-slots">
                  <button
                    v-for="(word, idx) in grammarSelected"
                    :key="'sel-' + idx"
                    class="word-chip selected"
                    draggable="true"
                    @dragstart="onDragStartFromAnswer($event, idx)"
                    @click="removeWord(idx)"
                  >
                    {{ word }}
                    <span class="chip-remove">✕</span>
                  </button>
                  <span v-if="grammarSelected.length === 0" class="placeholder-text">Drag or tap words to build the sentence...</span>
                </div>
              </div>

              <!-- Available words -->
              <div class="grammar-word-pool"
                @dragover.prevent
                @drop="onDropToPool($event)"
              >
                <button
                  v-for="(word, idx) in grammarPool"
                  :key="'pool-' + idx"
                  class="word-chip available"
                  :class="{ used: grammarSelected.includes(word) && grammarPool.filter(w => w === word).indexOf(word) === idx }"
                  :disabled="isWordUsed(word, idx)"
                  draggable="true"
                  @dragstart="onDragStartFromPool($event, word, idx)"
                  @click="addWord(word, idx)"
                >
                  {{ word }}
                </button>
              </div>

              <!-- Submit / Feedback -->
              <div class="grammar-actions">
                <button
                  class="btn-start"
                  :disabled="grammarSelected.length !== grammarQuestion.correct.length || grammarAnswered"
                  @click="checkGrammarAnswer"
                >
                  Check Answer ✓
                </button>
                <button class="btn-secondary" @click="clearGrammarSelection" :disabled="grammarAnswered">
                  Clear
                </button>
              </div>

              <Transition name="fade">
                <div v-if="grammarAnswered" class="feedback" :class="grammarIsCorrect ? 'correct' : 'wrong'">
                  <span class="feedback-icon">{{ grammarIsCorrect ? '✅' : '❌' }}</span>
                  <div class="grammar-feedback-detail">
                    <span>{{ grammarIsCorrect ? 'Correct!' : 'Incorrect!' }}</span>
                    <span v-if="!grammarIsCorrect" class="correct-sentence">Correct: {{ grammarQuestion.correct.join('') }}</span>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Results -->
            <div v-else-if="grammarState === 'finished'" class="results-screen">
              <div class="results-card">
                <div class="results-emoji">{{ grammarScore === 10 ? '🏆' : grammarScore >= 8 ? '🌟' : grammarScore >= 6 ? '👍' : '📚' }}</div>
                <h2>Quiz Complete!</h2>
                <div class="final-score">
                  <span class="score-number">{{ grammarScore }}</span>
                  <span class="score-divider">/</span>
                  <span class="score-total">10</span>
                </div>

                <div v-if="grammarWrong.length > 0" class="review-section">
                  <h3>Review Your Mistakes</h3>
                  <div class="review-list">
                    <div v-for="(item, idx) in grammarWrong" :key="idx" class="review-item review-item-grammar">
                      <div class="review-grammar-row">
                        <span class="review-wrong">✗ {{ item.userAnswer }}</span>
                      </div>
                      <div class="review-grammar-row">
                        <span class="review-correct">✓ {{ item.correct }}</span>
                      </div>
                      <div class="review-grammar-row">
                        <span class="review-meaning">🇬🇧 {{ item.english }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="results-actions">
                  <button class="btn-start" @click="startGrammarGame">Play Again</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Footer -->
    <footer class="quiz-footer">
      <p>{{ $t('footer.copyright') }}</p>
    </footer>
  </div>
</template>

<script setup>
/**
 * JLPTQuizPage script
 *
 * Timed kanji reading quiz with 5 JLPT levels (N5–N1).
 * Uses a local kanji bank; answers are shuffled each round.
 * Scores are submitted to the API for the leaderboard.
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../store/auth'
import api from '../services/api'
import { searchDictionary } from '../services/dictionaryService'
import AppHeader from '../components/layout/AppHeader.vue'

const { t } = useI18n()
const authStore = useAuthStore()

/* ---------- Access Control ---------- */
const isPremiumUser = computed(() => authStore.user?.is_premium || authStore.user?.is_admin)

/* ---------- Tab & Level ---------- */
const activeTab     = ref('quiz')
const selectedLevel = ref('N5')

/* ---------- Dictionary Lookup ---------- */
const dictionaryQuery   = ref('')
const dictionaryResults = ref([])
const dictionaryLoading = ref(false)
const dictionaryError   = ref('')

/* ---------- Game State ---------- */
const gameState       = ref('idle')   // idle | playing | finished
const currentRound    = ref(1)
const score           = ref(0)
const currentQuestion = ref({})
const selectedAnswer  = ref(null)
const answered        = ref(false)
const isCorrect       = ref(false)
const isFlipping      = ref(false)
const wrongAnswers    = ref([])
const timeLeft        = ref(15)       // seconds per question
let timerInterval     = null
let usedQuestionIndices = []

/* ---------- Session Statistics ---------- */
const sessionStats = ref({
  questionsAnswered: 0,
  correctAnswers:    0,
  currentStreak:     0,
  bestStreak:        0,
  averageTime:       0
})
const comboCount         = ref(0)
const showComboAnimation = ref(false)

/* ---------- Leaderboard ---------- */
const leaderboard        = ref([])
const leaderboardLoading = ref(false)
const personalBest       = ref(null)
const pointsEarned       = ref(0)
const totalPoints        = ref(0)

/* ==========================================================
 *  KANJI DATA BY JLPT LEVEL
 *  Each entry: { kanji, correctReading, meaning, wrongReadings[] }
 * ========================================================== */
const kanjiByLevel = {
  N5: [
    { kanji: '食べる', correctReading: 'たべる', meaning: 'To eat', wrongReadings: ['しょくべる', 'くべる', 'たぶる'] },
    { kanji: '飲む', correctReading: 'のむ', meaning: 'To drink', wrongReadings: ['いんむ', 'のめ', 'のぶ'] },
    { kanji: '見る', correctReading: 'みる', meaning: 'To see', wrongReadings: ['けんる', 'みえる', 'にる'] },
    { kanji: '聞く', correctReading: 'きく', meaning: 'To listen', wrongReadings: ['ぶんく', 'もんく', 'きこ'] },
    { kanji: '読む', correctReading: 'よむ', meaning: 'To read', wrongReadings: ['どくむ', 'よぶ', 'とむ'] },
    { kanji: '書く', correctReading: 'かく', meaning: 'To write', wrongReadings: ['しょく', 'がく', 'かき'] },
    { kanji: '話す', correctReading: 'はなす', meaning: 'To speak', wrongReadings: ['わす', 'かたす', 'はなし'] },
    { kanji: '買う', correctReading: 'かう', meaning: 'To buy', wrongReadings: ['ばいう', 'かい', 'まう'] },
    { kanji: '入る', correctReading: 'はいる', meaning: 'To enter', wrongReadings: ['いる', 'にゅうる', 'いれる'] },
    { kanji: '出る', correctReading: 'でる', meaning: 'To exit', wrongReadings: ['しゅつる', 'だる', 'だす'] },
    { kanji: '学校', correctReading: 'がっこう', meaning: 'School', wrongReadings: ['がくこう', 'がっきょう', 'まなこう'] },
    { kanji: '先生', correctReading: 'せんせい', meaning: 'Teacher', wrongReadings: ['さきせい', 'せんしょう', 'せいせん'] },
    { kanji: '大学', correctReading: 'だいがく', meaning: 'University', wrongReadings: ['おおがく', 'たいがく', 'だいまな'] },
    { kanji: '電話', correctReading: 'でんわ', meaning: 'Telephone', wrongReadings: ['でんは', 'てんわ', 'かみなりわ'] },
    { kanji: '時間', correctReading: 'じかん', meaning: 'Time', wrongReadings: ['ときま', 'しかん', 'じけん'] },
    { kanji: '友達', correctReading: 'ともだち', meaning: 'Friend', wrongReadings: ['ゆうだち', 'ゆうたつ', 'ともたち'] },
    { kanji: '天気', correctReading: 'てんき', meaning: 'Weather', wrongReadings: ['あまき', 'てんけ', 'てんぎ'] },
    { kanji: '毎日', correctReading: 'まいにち', meaning: 'Every day', wrongReadings: ['まいび', 'まいひ', 'まいじつ'] },
    { kanji: '今日', correctReading: 'きょう', meaning: 'Today', wrongReadings: ['こんにち', 'いまにち', 'こんじつ'] },
    { kanji: '来年', correctReading: 'らいねん', meaning: 'Next year', wrongReadings: ['きねん', 'くねん', 'らいとし'] },
  ],
  N4: [
    { kanji: '開ける', correctReading: 'あける', meaning: 'To open', wrongReadings: ['かいける', 'ひらける', 'あく'] },
    { kanji: '届ける', correctReading: 'とどける', meaning: 'To deliver', wrongReadings: ['かいける', 'つける', 'わたける'] },
    { kanji: '届く', correctReading: 'とどく', meaning: 'To arrive/reach', wrongReadings: ['かいく', 'つく', 'わたく'] },
    { kanji: '引っ越す', correctReading: 'ひっこす', meaning: 'To move (house)', wrongReadings: ['いんこす', 'ひきこす', 'ひこす'] },
    { kanji: '建てる', correctReading: 'たてる', meaning: 'To build', wrongReadings: ['けんてる', 'じてる', 'かてる'] },
    { kanji: '受ける', correctReading: 'うける', meaning: 'To receive', wrongReadings: ['じゅける', 'おける', 'つける'] },
    { kanji: '運転', correctReading: 'うんてん', meaning: 'Driving', wrongReadings: ['うんでん', 'うてん', 'えんてん'] },
    { kanji: '特別', correctReading: 'とくべつ', meaning: 'Special', wrongReadings: ['とっべつ', 'どくべつ', 'とくわけ'] },
    { kanji: '季節', correctReading: 'きせつ', meaning: 'Season', wrongReadings: ['きぶし', 'きせち', 'しせつ'] },
    { kanji: '文化', correctReading: 'ぶんか', meaning: 'Culture', wrongReadings: ['もんか', 'ぶんけ', 'もじか'] },
    { kanji: '番組', correctReading: 'ばんぐみ', meaning: 'TV program', wrongReadings: ['ばんくみ', 'ばんそ', 'はんくみ'] },
    { kanji: '国際', correctReading: 'こくさい', meaning: 'International', wrongReadings: ['くにさい', 'こくざい', 'こくせい'] },
    { kanji: '生活', correctReading: 'せいかつ', meaning: 'Life/Living', wrongReadings: ['しょうかつ', 'なまかつ', 'せいこう'] },
    { kanji: '理由', correctReading: 'りゆう', meaning: 'Reason', wrongReadings: ['りゅう', 'りゆ', 'わけゆう'] },
    { kanji: '世界', correctReading: 'せかい', meaning: 'World', wrongReadings: ['よかい', 'せいかい', 'しかい'] },
    { kanji: '台風', correctReading: 'たいふう', meaning: 'Typhoon', wrongReadings: ['だいかぜ', 'たいかぜ', 'だいふう'] },
    { kanji: '地震', correctReading: 'じしん', meaning: 'Earthquake', wrongReadings: ['ちしん', 'じふるえ', 'ちふるえ'] },
    { kanji: '経験', correctReading: 'けいけん', meaning: 'Experience', wrongReadings: ['きょうけん', 'けいげん', 'きけん'] },
    { kanji: '安全', correctReading: 'あんぜん', meaning: 'Safety', wrongReadings: ['やすぜん', 'あんせん', 'あんまん'] },
    { kanji: '無理', correctReading: 'むり', meaning: 'Impossible', wrongReadings: ['ぶり', 'なしり', 'むわり'] },
  ],
  N3: [
    { kanji: '会議', correctReading: 'かいぎ', meaning: 'Meeting', wrongReadings: ['かいき', 'かぎ', 'あいぎ'] },
    { kanji: '研究', correctReading: 'けんきゅう', meaning: 'Research', wrongReadings: ['けんく', 'げんきゅう', 'けんぐう'] },
    { kanji: '政治', correctReading: 'せいじ', meaning: 'Politics', wrongReadings: ['しょうじ', 'せいち', 'まさじ'] },
    { kanji: '産業', correctReading: 'さんぎょう', meaning: 'Industry', wrongReadings: ['さんごう', 'せんぎょう', 'さんきょう'] },
    { kanji: '自然', correctReading: 'しぜん', meaning: 'Nature', wrongReadings: ['じねん', 'しせん', 'じぜん'] },
    { kanji: '交通', correctReading: 'こうつう', meaning: 'Traffic', wrongReadings: ['こうとう', 'きょうつう', 'こうずう'] },
    { kanji: '制度', correctReading: 'せいど', meaning: 'System', wrongReadings: ['しど', 'せいと', 'さいど'] },
    { kanji: '技術', correctReading: 'ぎじゅつ', meaning: 'Technology', wrongReadings: ['きじゅつ', 'ぎじつ', 'きしゅつ'] },
    { kanji: '教育', correctReading: 'きょういく', meaning: 'Education', wrongReadings: ['きゅういく', 'きょうく', 'こういく'] },
    { kanji: '関係', correctReading: 'かんけい', meaning: 'Relationship', wrongReadings: ['かんかい', 'かんけ', 'がんけい'] },
    { kanji: '反対', correctReading: 'はんたい', meaning: 'Opposite', wrongReadings: ['はんだい', 'ほんたい', 'ばんたい'] },
    { kanji: '問題', correctReading: 'もんだい', meaning: 'Problem', wrongReadings: ['もだい', 'もんてい', 'とだい'] },
    { kanji: '決定', correctReading: 'けってい', meaning: 'Decision', wrongReadings: ['けつてい', 'けつじょう', 'きめてい'] },
    { kanji: '規則', correctReading: 'きそく', meaning: 'Rule', wrongReadings: ['きぞく', 'きのり', 'ぐそく'] },
    { kanji: '記念', correctReading: 'きねん', meaning: 'Memorial', wrongReadings: ['きめん', 'きなん', 'きえん'] },
    { kanji: '相談', correctReading: 'そうだん', meaning: 'Consultation', wrongReadings: ['あいだん', 'そうたん', 'しょうだん'] },
    { kanji: '設計', correctReading: 'せっけい', meaning: 'Design/Plan', wrongReadings: ['せつけい', 'もうけい', 'せきけい'] },
    { kanji: '調査', correctReading: 'ちょうさ', meaning: 'Investigation', wrongReadings: ['しらべさ', 'ちょうし', 'きょうさ'] },
    { kanji: '成功', correctReading: 'せいこう', meaning: 'Success', wrongReadings: ['なりこう', 'じょうこう', 'せいく'] },
    { kanji: '失敗', correctReading: 'しっぱい', meaning: 'Failure', wrongReadings: ['しつはい', 'しっぱ', 'しばい'] },
    { kanji: '練習', correctReading: 'れんしゅう', meaning: 'Practice', wrongReadings: ['ねりしゅう', 'れんしう', 'ねんしゅう'] },
    { kanji: '準備', correctReading: 'じゅんび', meaning: 'Preparation', wrongReadings: ['しゅんび', 'じゅんぴ', 'じゅんべ'] },
    { kanji: '説明', correctReading: 'せつめい', meaning: 'Explanation', wrongReadings: ['しょうめい', 'せつめ', 'せいめい'] },
    { kanji: '約束', correctReading: 'やくそく', meaning: 'Promise', wrongReadings: ['やくしょく', 'やくたば', 'わくそく'] },
    { kanji: '注意', correctReading: 'ちゅうい', meaning: 'Caution', wrongReadings: ['ちゅうぎ', 'そそい', 'じゅうい'] },
    { kanji: '想像', correctReading: 'そうぞう', meaning: 'Imagination', wrongReadings: ['しょうぞう', 'そうじょう', 'おもぞう'] },
    { kanji: '表現', correctReading: 'ひょうげん', meaning: 'Expression', wrongReadings: ['おもてげん', 'ひょうけん', 'ひょうえん'] },
    { kanji: '連絡', correctReading: 'れんらく', meaning: 'Contact', wrongReadings: ['つらなりらく', 'れんらき', 'ねんらく'] },
    { kanji: '努力', correctReading: 'どりょく', meaning: 'Effort', wrongReadings: ['ぬりょく', 'どりき', 'のりょく'] },
    { kanji: '確認', correctReading: 'かくにん', meaning: 'Confirmation', wrongReadings: ['たしにん', 'きゃくにん', 'かくじん'] },
    { kanji: '影響', correctReading: 'えいきょう', meaning: 'Influence', wrongReadings: ['かげひびき', 'えきょう', 'いんきょう'] },
    { kanji: '経済', correctReading: 'けいざい', meaning: 'Economy', wrongReadings: ['きょうざい', 'けいさい', 'けざい'] },
    { kanji: '選挙', correctReading: 'せんきょ', meaning: 'Election', wrongReadings: ['えらぶきょ', 'せんこ', 'ぜんきょ'] },
    { kanji: '比較', correctReading: 'ひかく', meaning: 'Comparison', wrongReadings: ['くらべかく', 'ひこう', 'ひがく'] },
    { kanji: '退院', correctReading: 'たいいん', meaning: 'Leave hospital', wrongReadings: ['たいえん', 'だいいん', 'しりぞきいん'] },
    { kanji: '貿易', correctReading: 'ぼうえき', meaning: 'Trade', wrongReadings: ['もうえき', 'ぼうやく', 'ぼうき'] },
    { kanji: '講演', correctReading: 'こうえん', meaning: 'Lecture', wrongReadings: ['きょうえん', 'こうべん', 'こえん'] },
    { kanji: '参加', correctReading: 'さんか', meaning: 'Participation', wrongReadings: ['さんが', 'まいか', 'しんか'] },
    { kanji: '複雑', correctReading: 'ふくざつ', meaning: 'Complicated', wrongReadings: ['おくざつ', 'ふくさつ', 'ふくぞう'] },
    { kanji: '環境', correctReading: 'かんきょう', meaning: 'Environment', wrongReadings: ['かんけい', 'わんきょう', 'かんぎょう'] },
    { kanji: '伝統', correctReading: 'でんとう', meaning: 'Tradition', wrongReadings: ['つたとう', 'でんすべ', 'てんとう'] },
    { kanji: '独立', correctReading: 'どくりつ', meaning: 'Independence', wrongReadings: ['ひとりりつ', 'どくり', 'どくだち'] },
    { kanji: '完成', correctReading: 'かんせい', meaning: 'Completion', wrongReadings: ['かんじょう', 'まんせい', 'がんせい'] },
    { kanji: '観光', correctReading: 'かんこう', meaning: 'Sightseeing', wrongReadings: ['みこう', 'かんみつ', 'がんこう'] },
    { kanji: '必要', correctReading: 'ひつよう', meaning: 'Necessary', wrongReadings: ['かなよう', 'ひつやく', 'びつよう'] },
    { kanji: '適当', correctReading: 'てきとう', meaning: 'Suitable', wrongReadings: ['まとあてる', 'てきど', 'できとう'] },
    { kanji: '発展', correctReading: 'はってん', meaning: 'Development', wrongReadings: ['はつてん', 'ほってん', 'はつのべ'] },
    { kanji: '判断', correctReading: 'はんだん', meaning: 'Judgment', wrongReadings: ['ばんだん', 'はんたん', 'はぜん'] },
    { kanji: '禁止', correctReading: 'きんし', meaning: 'Prohibition', wrongReadings: ['きんじ', 'ぎんし', 'こんし'] },
  ],
  N2: [
    { kanji: '維持', correctReading: 'いじ', meaning: 'Maintenance', wrongReadings: ['ゆいじ', 'いち', 'いし'] },
    { kanji: '概念', correctReading: 'がいねん', meaning: 'Concept', wrongReadings: ['がいめん', 'かいねん', 'がいなん'] },
    { kanji: '抽象', correctReading: 'ちゅうしょう', meaning: 'Abstract', wrongReadings: ['ちゅうぞう', 'ちゅうしゃ', 'ちゅうじょう'] },
    { kanji: '脅威', correctReading: 'きょうい', meaning: 'Threat', wrongReadings: ['きょうぎ', 'おどい', 'きょうえ'] },
    { kanji: '偏見', correctReading: 'へんけん', meaning: 'Prejudice', wrongReadings: ['へんみ', 'かたけん', 'へんげん'] },
    { kanji: '矛盾', correctReading: 'むじゅん', meaning: 'Contradiction', wrongReadings: ['ほこたて', 'ぼうじゅん', 'むたて'] },
    { kanji: '曖昧', correctReading: 'あいまい', meaning: 'Ambiguous', wrongReadings: ['あいばい', 'あいみ', 'あいむ'] },
    { kanji: '膨大', correctReading: 'ぼうだい', meaning: 'Enormous', wrongReadings: ['ぼだい', 'ふくだい', 'ほうだい'] },
    { kanji: '甚大', correctReading: 'じんだい', meaning: 'Immense', wrongReadings: ['はなだい', 'しんだい', 'じだい'] },
    { kanji: '慎重', correctReading: 'しんちょう', meaning: 'Cautious', wrongReadings: ['しんじゅう', 'ちんちょう', 'しんおも'] },
    { kanji: '把握', correctReading: 'はあく', meaning: 'Grasp/Understand', wrongReadings: ['ばあく', 'はにぎ', 'はおく'] },
    { kanji: '促進', correctReading: 'そくしん', meaning: 'Promotion', wrongReadings: ['しょくしん', 'そくすすむ', 'ぞくしん'] },
    { kanji: '崩壊', correctReading: 'ほうかい', meaning: 'Collapse', wrongReadings: ['くずかい', 'ほかい', 'ぼうかい'] },
    { kanji: '緊張', correctReading: 'きんちょう', meaning: 'Tension', wrongReadings: ['きんはり', 'ぎんちょう', 'きんちゅう'] },
    { kanji: '拡大', correctReading: 'かくだい', meaning: 'Expansion', wrongReadings: ['ひろだい', 'こうだい', 'がくだい'] },
    { kanji: '削減', correctReading: 'さくげん', meaning: 'Reduction', wrongReadings: ['けずげん', 'しゃくげん', 'さくかん'] },
    { kanji: '妥協', correctReading: 'だきょう', meaning: 'Compromise', wrongReadings: ['たきょう', 'できょう', 'だぎょう'] },
    { kanji: '範囲', correctReading: 'はんい', meaning: 'Scope/Range', wrongReadings: ['はんえ', 'ばんい', 'はんかこ'] },
    { kanji: '傾向', correctReading: 'けいこう', meaning: 'Tendency', wrongReadings: ['かたむこう', 'けいほう', 'けいきょう'] },
    { kanji: '圧倒', correctReading: 'あっとう', meaning: 'Overwhelming', wrongReadings: ['あつとう', 'あっだお', 'あっこう'] },
  ],
  N1: [
    { kanji: '憂鬱', correctReading: 'ゆううつ', meaning: 'Depression/Gloom', wrongReadings: ['うれうつ', 'ゆうつ', 'ゆうう'] },
    { kanji: '齟齬', correctReading: 'そご', meaning: 'Discrepancy', wrongReadings: ['しゃご', 'さご', 'そぐ'] },
    { kanji: '顛末', correctReading: 'てんまつ', meaning: 'Whole story', wrongReadings: ['てんばつ', 'でんまつ', 'てんすえ'] },
    { kanji: '怠惰', correctReading: 'たいだ', meaning: 'Laziness', wrongReadings: ['なまだ', 'たいな', 'おこたり'] },
    { kanji: '忌避', correctReading: 'きひ', meaning: 'Avoidance', wrongReadings: ['いみひ', 'きさけ', 'きび'] },
    { kanji: '恣意', correctReading: 'しい', meaning: 'Arbitrary', wrongReadings: ['じい', 'しぎ', 'しえ'] },
    { kanji: '稀有', correctReading: 'けう', meaning: 'Rare/Unusual', wrongReadings: ['きゆう', 'きう', 'まれゆう'] },
    { kanji: '瞬時', correctReading: 'しゅんじ', meaning: 'Instant', wrongReadings: ['またたきじ', 'しゅんし', 'じゅんじ'] },
    { kanji: '怒濤', correctReading: 'どとう', meaning: 'Surging waves', wrongReadings: ['いかなみ', 'ぬとう', 'どなみ'] },
    { kanji: '搾取', correctReading: 'さくしゅ', meaning: 'Exploitation', wrongReadings: ['しぼしゅ', 'さくとる', 'しゃくしゅ'] },
    { kanji: '疎外', correctReading: 'そがい', meaning: 'Alienation', wrongReadings: ['うとがい', 'そはず', 'そげ'] },
    { kanji: '逸脱', correctReading: 'いつだつ', meaning: 'Deviation', wrongReadings: ['いちだつ', 'いつぬけ', 'いだつ'] },
    { kanji: '薫陶', correctReading: 'くんとう', meaning: 'Mentoring', wrongReadings: ['かおとう', 'くんすえ', 'くんどう'] },
    { kanji: '凡庸', correctReading: 'ぼんよう', meaning: 'Mediocre', wrongReadings: ['はんよう', 'ぼんもち', 'ほんよう'] },
    { kanji: '辛辣', correctReading: 'しんらつ', meaning: 'Harsh/Biting', wrongReadings: ['かららつ', 'しんかつ', 'しんれつ'] },
    { kanji: '杞憂', correctReading: 'きゆう', meaning: 'Needless worry', wrongReadings: ['きうれ', 'きゆ', 'きいう'] },
    { kanji: '躊躇', correctReading: 'ちゅうちょ', meaning: 'Hesitation', wrongReadings: ['しゅうしょ', 'ちゅうしょ', 'ちゅうちゃ'] },
    { kanji: '傲慢', correctReading: 'ごうまん', meaning: 'Arrogance', wrongReadings: ['おごまん', 'こうまん', 'ごまん'] },
    { kanji: '貪欲', correctReading: 'どんよく', meaning: 'Greed', wrongReadings: ['たんよく', 'むさよく', 'とんよく'] },
    { kanji: '恩恵', correctReading: 'おんけい', meaning: 'Grace/Benefit', wrongReadings: ['おんえ', 'おんめぐ', 'いんけい'] },
  ],
}

// Computed: get kanjiData based on selected level
const kanjiData = computed(() => kanjiByLevel[selectedLevel.value] || kanjiByLevel.N5)

function shuffle(array) {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateQuestion() {
  // Pick a random kanji not yet used (from the selected level)
  const data = kanjiData.value
  let availableIndices = data
    .map((_, i) => i)
    .filter(i => !usedQuestionIndices.includes(i))

  if (availableIndices.length === 0) {
    // Reset if somehow exhausted
    usedQuestionIndices = []
    availableIndices = data.map((_, i) => i)
  }

  const idx = availableIndices[Math.floor(Math.random() * availableIndices.length)]
  usedQuestionIndices.push(idx)
  const item = data[idx]

  const options = shuffle([item.correctReading, ...item.wrongReadings])

  return {
    kanji: item.kanji,
    correctReading: item.correctReading,
    meaning: item.meaning,
    options
  }
}

function startGame() {
  gameState.value = 'playing'
  currentRound.value = 1
  score.value = 0
  wrongAnswers.value = []
  usedQuestionIndices = []
  
  // Reset session stats
  sessionStats.value = {
    questionsAnswered: 0,
    correctAnswers: 0,
    currentStreak: 0,
    bestStreak: 0,
    averageTime: 0
  }
  comboCount.value = 0
  
  loadQuestion()
}

function loadQuestion() {
  answered.value = false
  selectedAnswer.value = null
  isCorrect.value = false
  isFlipping.value = true
  setTimeout(() => { isFlipping.value = false }, 300)
  currentQuestion.value = generateQuestion()
  startTimer()
}

function startTimer() {
  clearInterval(timerInterval)
  timeLeft.value = 15
  timerInterval = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(timerInterval)
      // Time's up — auto-answer wrong
      if (!answered.value) {
        answered.value = true
        isCorrect.value = false
        wrongAnswers.value.push({
          kanji: currentQuestion.value.kanji,
          correctReading: currentQuestion.value.correctReading,
          meaning: currentQuestion.value.meaning,
          userAnswer: '⏰ Time up'
        })
        setTimeout(nextRound, 1500)
      }
    }
  }, 1000)
}

function selectAnswer(option) {
  if (answered.value) return
  clearInterval(timerInterval)
  answered.value = true
  selectedAnswer.value = option
  isCorrect.value = option === currentQuestion.value.correctReading

  // Update session stats
  sessionStats.value.questionsAnswered++

  if (isCorrect.value) {
    score.value++
    sessionStats.value.correctAnswers++
    sessionStats.value.currentStreak++
    comboCount.value++
    
    // Update best streak
    if (sessionStats.value.currentStreak > sessionStats.value.bestStreak) {
      sessionStats.value.bestStreak = sessionStats.value.currentStreak
    }
    
    // Show combo animation for 3+ streak
    if (comboCount.value >= 3) {
      showComboAnimation.value = true
      setTimeout(() => { showComboAnimation.value = false }, 1000)
    }
    
    // Play success sound (structure for future)
    playSound('correct')
  } else {
    sessionStats.value.currentStreak = 0
    comboCount.value = 0
    wrongAnswers.value.push({
      kanji: currentQuestion.value.kanji,
      correctReading: currentQuestion.value.correctReading,
      meaning: currentQuestion.value.meaning,
      userAnswer: option
    })
    // Play error sound (structure for future)
    playSound('wrong')
  }

  setTimeout(nextRound, 1500)
}

function nextRound() {
  if (currentRound.value >= 10) {
    finishGame()
  } else {
    currentRound.value++
    loadQuestion()
  }
}

async function finishGame() {
  gameState.value = 'finished'
  clearInterval(timerInterval)

  // Submit score to backend
  try {
    const res = await api.post('/quiz/scores', { score: score.value, total: 10, quiz_type: `jlpt_${selectedLevel.value.toLowerCase()}_kanji_reading` })
    pointsEarned.value = res.data.pointsEarned || 0
    totalPoints.value = res.data.totalPoints || 0
    // Update user points in store
    if (authStore.user) {
      authStore.user.points = res.data.totalPoints || authStore.user.points
      localStorage.setItem('user', JSON.stringify(authStore.user))
    }
  } catch (err) {
    console.error('Failed to save score:', err)
  }
}

function getResultEmoji() {
  if (score.value === 10) return '🏆'
  if (score.value >= 8) return '🌟'
  if (score.value >= 6) return '👍'
  if (score.value >= 4) return '📚'
  return '💪'
}

function getScoreMessage() {
  if (score.value === 10) return t('jlpt.perfect')
  if (score.value >= 8) return t('jlpt.excellent')
  if (score.value >= 6) return t('jlpt.good')
  if (score.value >= 4) return t('jlpt.keepPracticing')
  return t('jlpt.dontGiveUp')
}

// Leaderboard
async function fetchLeaderboard() {
  leaderboardLoading.value = true
  try {
    const res = await api.get('/quiz/leaderboard')
    leaderboard.value = res.data.leaderboard || []
    personalBest.value = res.data.personalBest ?? null
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err)
  } finally {
    leaderboardLoading.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Sound effects (placeholder for future audio implementation)
function playSound(type) {
  // Future: Add actual sound effects
  // const audio = new Audio(`/sounds/${type}.mp3`)
  // audio.play()
  console.log(`🔊 Sound: ${type}`)
}

// Keyboard shortcuts
function handleKeyPress(event) {
  if (gameState.value !== 'playing' || answered.value) return
  
  const key = event.key.toLowerCase()
  const options = currentQuestion.value.options || []
  
  // Number keys 1-4 or letters A-D
  if (['1', '2', '3', '4'].includes(key)) {
    const index = parseInt(key) - 1
    if (options[index]) {
      selectAnswer(options[index])
    }
  } else if (['a', 'b', 'c', 'd'].includes(key)) {
    const index = ['a', 'b', 'c', 'd'].indexOf(key)
    if (options[index]) {
      selectAnswer(options[index])
    }
  }
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  clearInterval(timerInterval)
  clearInterval(similarTimer)
  clearInterval(grammarTimer)
  window.removeEventListener('keydown', handleKeyPress)
})

// ==========================================
// SIMILAR KANJI QUIZ
// ==========================================
const similarState = ref('idle')
const similarRound = ref(1)
const similarScore = ref(0)
const similarQuestion = ref({})
const similarSelected = ref(null)
const similarAnswered = ref(false)
const similarIsCorrect = ref(false)
const similarWrong = ref([])
const similarTimeLeft = ref(15)
let similarTimer = null
let usedSimilarIndices = []

const similarKanjiByLevel = {
  N5: [
    { correct: '大', meaning: 'Big', reading: 'おおきい', similars: ['太', '犬', '天'] },
    { correct: '犬', meaning: 'Dog', reading: 'いぬ', similars: ['大', '太', '天'] },
    { correct: '太', meaning: 'Thick/Fat', reading: 'ふとい', similars: ['大', '犬', '天'] },
    { correct: '力', meaning: 'Power', reading: 'ちから', similars: ['刀', '刃', '万'] },
    { correct: '刀', meaning: 'Sword', reading: 'かたな', similars: ['力', '刃', '万'] },
    { correct: '千', meaning: 'Thousand', reading: 'せん', similars: ['干', '于', '午'] },
    { correct: '干', meaning: 'Dry', reading: 'ほす', similars: ['千', '于', '午'] },
    { correct: '午', meaning: 'Noon', reading: 'ご', similars: ['牛', '干', '千'] },
    { correct: '牛', meaning: 'Cow', reading: 'うし', similars: ['午', '半', '年'] },
    { correct: '右', meaning: 'Right', reading: 'みぎ', similars: ['左', '石', '台'] },
    { correct: '左', meaning: 'Left', reading: 'ひだり', similars: ['右', '石', '在'] },
    { correct: '日', meaning: 'Day/Sun', reading: 'ひ', similars: ['目', '白', '田'] },
    { correct: '目', meaning: 'Eye', reading: 'め', similars: ['日', '白', '田'] },
    { correct: '田', meaning: 'Rice field', reading: 'た', similars: ['日', '目', '由'] },
    { correct: '入', meaning: 'Enter', reading: 'はいる', similars: ['人', '八', '込'] },
    { correct: '人', meaning: 'Person', reading: 'ひと', similars: ['入', '八', '大'] },
    { correct: '土', meaning: 'Earth/Soil', reading: 'つち', similars: ['士', '工', '王'] },
    { correct: '士', meaning: 'Samurai', reading: 'し', similars: ['土', '工', '王'] },
    { correct: '水', meaning: 'Water', reading: 'みず', similars: ['氷', '永', '泉'] },
    { correct: '夕', meaning: 'Evening', reading: 'ゆう', similars: ['タ', '久', '多'] },
  ],
  N4: [
    { correct: '待', meaning: 'Wait', reading: 'まつ', similars: ['持', '特', '侍'] },
    { correct: '持', meaning: 'Hold', reading: 'もつ', similars: ['待', '特', '侍'] },
    { correct: '末', meaning: 'End', reading: 'すえ', similars: ['未', '本', '木'] },
    { correct: '未', meaning: 'Not yet', reading: 'み', similars: ['末', '木', '本'] },
    { correct: '方', meaning: 'Direction', reading: 'かた', similars: ['万', '刀', '力'] },
    { correct: '万', meaning: 'Ten thousand', reading: 'まん', similars: ['方', '刀', '力'] },
    { correct: '由', meaning: 'Reason', reading: 'よし', similars: ['田', '甲', '申'] },
    { correct: '申', meaning: 'Say/Monkey', reading: 'もうす', similars: ['由', '甲', '田'] },
    { correct: '氷', meaning: 'Ice', reading: 'こおり', similars: ['水', '永', '泉'] },
    { correct: '忙', meaning: 'Busy', reading: 'いそがしい', similars: ['忘', '忍', '忠'] },
    { correct: '忘', meaning: 'Forget', reading: 'わすれる', similars: ['忙', '忍', '忠'] },
    { correct: '暑', meaning: 'Hot (weather)', reading: 'あつい', similars: ['暮', '者', '署'] },
    { correct: '鳥', meaning: 'Bird', reading: 'とり', similars: ['烏', '島', '鴨'] },
    { correct: '島', meaning: 'Island', reading: 'しま', similars: ['鳥', '烏', '嶋'] },
    { correct: '署', meaning: 'Station/Office', reading: 'しょ', similars: ['暑', '暮', '者'] },
    { correct: '活', meaning: 'Life/Active', reading: 'かつ', similars: ['括', '話', '舌'] },
    { correct: '話', meaning: 'Talk', reading: 'はなし', similars: ['活', '括', '舌'] },
    { correct: '広', meaning: 'Wide', reading: 'ひろい', similars: ['拡', '鉱', '曠'] },
    { correct: '近', meaning: 'Near', reading: 'ちかい', similars: ['斤', '折', '所'] },
    { correct: '週', meaning: 'Week', reading: 'しゅう', similars: ['週', '遇', '道'] },
  ],
  N3: [
    { correct: '減', meaning: 'Decrease', reading: 'へる', similars: ['感', '威', '滅'] },
    { correct: '感', meaning: 'Feel', reading: 'かん', similars: ['減', '威', '滅'] },
    { correct: '議', meaning: 'Discuss', reading: 'ぎ', similars: ['義', '犠', '儀'] },
    { correct: '義', meaning: 'Righteousness', reading: 'ぎ', similars: ['議', '犠', '儀'] },
    { correct: '構', meaning: 'Structure', reading: 'こう', similars: ['講', '溝', '購'] },
    { correct: '講', meaning: 'Lecture', reading: 'こう', similars: ['構', '溝', '購'] },
    { correct: '防', meaning: 'Defend', reading: 'ぼう', similars: ['妨', '坊', '房'] },
    { correct: '妨', meaning: 'Obstruct', reading: 'ぼう', similars: ['防', '坊', '房'] },
    { correct: '複', meaning: 'Duplicate', reading: 'ふく', similars: ['復', '腹', '覆'] },
    { correct: '復', meaning: 'Restore', reading: 'ふく', similars: ['複', '腹', '覆'] },
    { correct: '精', meaning: 'Refined', reading: 'せい', similars: ['清', '晴', '情'] },
    { correct: '清', meaning: 'Clean', reading: 'せい', similars: ['精', '晴', '情'] },
    { correct: '絶', meaning: 'Sever', reading: 'ぜつ', similars: ['説', '脱', '税'] },
    { correct: '説', meaning: 'Theory', reading: 'せつ', similars: ['絶', '脱', '税'] },
    { correct: '状', meaning: 'Condition', reading: 'じょう', similars: ['況', '常', '情'] },
    { correct: '況', meaning: 'Situation', reading: 'きょう', similars: ['状', '常', '情'] },
    { correct: '退', meaning: 'Retreat', reading: 'たい', similars: ['褪', '腿', '追'] },
    { correct: '追', meaning: 'Chase', reading: 'つい', similars: ['退', '褪', '腿'] },
    { correct: '規', meaning: 'Standard', reading: 'き', similars: ['親', '観', '覚'] },
    { correct: '観', meaning: 'Observe', reading: 'かん', similars: ['親', '規', '覚'] },
  ],
  N2: [
    { correct: '壊', meaning: 'Destroy', reading: 'こわす', similars: ['懐', '壌', '塊'] },
    { correct: '懐', meaning: 'Nostalgia', reading: 'なつかしい', similars: ['壊', '壌', '塊'] },
    { correct: '繊', meaning: 'Slender', reading: 'せん', similars: ['織', '纏', '線'] },
    { correct: '織', meaning: 'Weave', reading: 'おる', similars: ['繊', '纏', '線'] },
    { correct: '微', meaning: 'Delicate', reading: 'び', similars: ['徴', '徹', '徳'] },
    { correct: '徴', meaning: 'Symptom/Sign', reading: 'ちょう', similars: ['微', '徹', '徳'] },
    { correct: '衝', meaning: 'Collision', reading: 'しょう', similars: ['衡', '街', '術'] },
    { correct: '衡', meaning: 'Balance', reading: 'こう', similars: ['衝', '街', '術'] },
    { correct: '漠', meaning: 'Vague', reading: 'ばく', similars: ['模', '膜', '幕'] },
    { correct: '模', meaning: 'Model', reading: 'も', similars: ['漠', '膜', '幕'] },
    { correct: '膜', meaning: 'Membrane', reading: 'まく', similars: ['漠', '模', '幕'] },
    { correct: '慌', meaning: 'Flustered', reading: 'あわてる', similars: ['荒', '慣', '惰'] },
    { correct: '荒', meaning: 'Rough/Wild', reading: 'あらい', similars: ['慌', '慣', '惰'] },
    { correct: '陰', meaning: 'Shadow', reading: 'かげ', similars: ['隠', '隣', '険'] },
    { correct: '隠', meaning: 'Hide', reading: 'かくす', similars: ['陰', '隣', '険'] },
    { correct: '賠', meaning: 'Compensate', reading: 'ばい', similars: ['培', '倍', '陪'] },
    { correct: '培', meaning: 'Cultivate', reading: 'ばい', similars: ['賠', '倍', '陪'] },
    { correct: '抑', meaning: 'Suppress', reading: 'おさえる', similars: ['仰', '迎', '柳'] },
    { correct: '仰', meaning: 'Look up', reading: 'あおぐ', similars: ['抑', '迎', '柳'] },
    { correct: '摘', meaning: 'Pick/Point out', reading: 'つむ', similars: ['適', '滴', '敵'] },
  ],
  N1: [
    { correct: '鬱', meaning: 'Depression', reading: 'うつ', similars: ['欝', '蔚', '鑿'] },
    { correct: '朦', meaning: 'Hazy', reading: 'もう', similars: ['朧', '矇', '蒙'] },
    { correct: '朧', meaning: 'Dim/Hazy', reading: 'おぼろ', similars: ['朦', '矇', '蒙'] },
    { correct: '鑑', meaning: 'Appraise', reading: 'かん', similars: ['鑒', '監', '艦'] },
    { correct: '監', meaning: 'Oversee', reading: 'かん', similars: ['鑑', '濫', '艦'] },
    { correct: '繕', meaning: 'Mend', reading: 'つくろう', similars: ['膳', '禅', '善'] },
    { correct: '膳', meaning: 'Meal tray', reading: 'ぜん', similars: ['繕', '禅', '善'] },
    { correct: '諮', meaning: 'Consult', reading: 'し', similars: ['諸', '誌', '諦'] },
    { correct: '諸', meaning: 'Various', reading: 'しょ', similars: ['諮', '誌', '諦'] },
    { correct: '遮', meaning: 'Intercept', reading: 'しゃ', similars: ['遭', '遡', '遜'] },
    { correct: '遭', meaning: 'Encounter', reading: 'そう', similars: ['遮', '遡', '遜'] },
    { correct: '嘱', meaning: 'Entrust', reading: 'しょく', similars: ['囑', '属', '燭'] },
    { correct: '属', meaning: 'Belong', reading: 'ぞく', similars: ['嘱', '囑', '燭'] },
    { correct: '戴', meaning: 'Receive humbly', reading: 'いただく', similars: ['載', '裁', '栽'] },
    { correct: '載', meaning: 'Load/Publish', reading: 'のせる', similars: ['戴', '裁', '栽'] },
    { correct: '裁', meaning: 'Judge/Cut', reading: 'さい', similars: ['戴', '載', '栽'] },
    { correct: '隷', meaning: 'Slave', reading: 'れい', similars: ['隸', '棣', '隶'] },
    { correct: '塡', meaning: 'Fill in', reading: 'てん', similars: ['填', '鎮', '慎'] },
    { correct: '彙', meaning: 'Collect/Category', reading: 'い', similars: ['彗', '彝', '彜'] },
    { correct: '頻', meaning: 'Frequent', reading: 'ひん', similars: ['瀕', '顰', '頒'] },
  ],
}

const similarKanjiData = computed(() => similarKanjiByLevel[selectedLevel.value] || similarKanjiByLevel.N5)

function generateSimilarQuestion() {
  const data = similarKanjiData.value
  let available = data.map((_, i) => i).filter(i => !usedSimilarIndices.includes(i))
  if (available.length === 0) { usedSimilarIndices = []; available = data.map((_, i) => i) }
  const idx = available[Math.floor(Math.random() * available.length)]
  usedSimilarIndices.push(idx)
  const d = data[idx]
  return { correct: d.correct, meaning: d.meaning, reading: d.reading, options: shuffle([d.correct, ...d.similars.slice(0, 3)]) }
}

function startSimilarGame() {
  similarState.value = 'playing'
  similarRound.value = 1
  similarScore.value = 0
  similarWrong.value = []
  usedSimilarIndices = []
  loadSimilarQuestion()
}

function loadSimilarQuestion() {
  similarAnswered.value = false
  similarSelected.value = null
  similarIsCorrect.value = false
  similarQuestion.value = generateSimilarQuestion()
  startSimilarTimer()
}

function startSimilarTimer() {
  clearInterval(similarTimer)
  similarTimeLeft.value = 15
  similarTimer = setInterval(() => {
    similarTimeLeft.value--
    if (similarTimeLeft.value <= 0) {
      clearInterval(similarTimer)
      if (!similarAnswered.value) {
        similarAnswered.value = true
        similarIsCorrect.value = false
        similarWrong.value.push({ correct: similarQuestion.value.correct, meaning: similarQuestion.value.meaning, userAnswer: '⏰ Time up' })
        setTimeout(nextSimilarRound, 1500)
      }
    }
  }, 1000)
}

function selectSimilarAnswer(option) {
  if (similarAnswered.value) return
  clearInterval(similarTimer)
  similarAnswered.value = true
  similarSelected.value = option
  similarIsCorrect.value = option === similarQuestion.value.correct
  if (similarIsCorrect.value) {
    similarScore.value++
  } else {
    similarWrong.value.push({ correct: similarQuestion.value.correct, meaning: similarQuestion.value.meaning, userAnswer: option })
  }
  setTimeout(nextSimilarRound, 1500)
}

function nextSimilarRound() {
  if (similarRound.value >= 10) {
    finishSimilarGame()
  } else {
    similarRound.value++
    loadSimilarQuestion()
  }
}

async function finishSimilarGame() {
  similarState.value = 'finished'
  clearInterval(similarTimer)
  // Submit score to backend
  try {
    const res = await api.post('/quiz/scores', { score: similarScore.value, total: 10, quiz_type: `jlpt_${selectedLevel.value.toLowerCase()}_similar_kanji` })
    // Update user points in store
    if (authStore.user && res.data.totalPoints) {
      authStore.user.points = res.data.totalPoints
      localStorage.setItem('user', JSON.stringify(authStore.user))
    }
  } catch (err) {
    console.error('Failed to save similar kanji score:', err)
  }
}

// ==========================================
// SENTENCE GRAMMAR REARRANGEMENT QUIZ
// ==========================================
const grammarState = ref('idle')
const grammarRound = ref(1)
const grammarScore = ref(0)
const grammarQuestion = ref({})
const grammarSelected = ref([])
const grammarPool = ref([])
const grammarAnswered = ref(false)
const grammarIsCorrect = ref(false)
const grammarWrong = ref([])
const grammarTimeLeft = ref(30)
let grammarTimer = null
let usedGrammarIndices = []
const grammarUsedPool = ref([]) // track which pool indices are used
const answerDragOver = ref(false)

const grammarByLevel = {
  N5: [
    { correct: ['私', 'は', '学生', 'です', '。'], english: 'I am a student.' },
    { correct: ['これ', 'は', '本', 'です', '。'], english: 'This is a book.' },
    { correct: ['毎日', '学校', 'に', '行きます', '。'], english: 'I go to school every day.' },
    { correct: ['水', 'を', '飲みます', '。'], english: 'I drink water.' },
    { correct: ['日本語', 'を', '勉強', 'します', '。'], english: 'I study Japanese.' },
    { correct: ['友達', 'と', '遊びます', '。'], english: 'I play with my friend.' },
    { correct: ['今日', 'は', '暑い', 'です', '。'], english: 'Today is hot.' },
    { correct: ['猫', 'が', '好き', 'です', '。'], english: 'I like cats.' },
    { correct: ['朝', 'ご飯', 'を', '食べます', '。'], english: 'I eat breakfast.' },
    { correct: ['あの', '人', 'は', '先生', 'です', '。'], english: 'That person is a teacher.' },
    { correct: ['駅', 'は', 'どこ', 'ですか', '？'], english: 'Where is the station?' },
    { correct: ['テレビ', 'を', '見ます', '。'], english: 'I watch television.' },
    { correct: ['明日', '来ます', '。'], english: 'I will come tomorrow.' },
    { correct: ['この', 'りんご', 'は', '赤い', 'です', '。'], english: 'This apple is red.' },
    { correct: ['部屋', 'に', '入ります', '。'], english: 'I enter the room.' },
  ],
  N4: [
    { correct: ['毎日', '日本語', 'を', '勉強', 'して', 'います', '。'], english: 'I study Japanese every day.' },
    { correct: ['東京', 'に', '行き', 'たい', 'です', '。'], english: 'I want to go to Tokyo.' },
    { correct: ['この', '本', 'は', 'とても', '面白い', 'です', '。'], english: 'This book is very interesting.' },
    { correct: ['昨日', '友達', 'と', '映画', 'を', '見ました', '。'], english: 'I watched a movie with a friend yesterday.' },
    { correct: ['日本', 'の', '食べ物', 'が', '好き', 'です', '。'], english: 'I like Japanese food.' },
    { correct: ['駅', 'まで', '歩いて', '10分', 'かかります', '。'], english: 'It takes 10 minutes to walk to the station.' },
    { correct: ['先生', 'に', '質問', 'を', 'しました', '。'], english: 'I asked the teacher a question.' },
    { correct: ['電車', 'の', '中', 'で', '本', 'を', '読みます', '。'], english: 'I read books on the train.' },
    { correct: ['母', 'が', '作った', '料理', 'は', 'おいしい', 'です', '。'], english: 'The food my mother made is delicious.' },
    { correct: ['彼', 'は', '英語', 'が', '上手', 'です', '。'], english: 'He is good at English.' },
    { correct: ['すみません', '、', 'トイレ', 'は', 'どこ', 'ですか', '？'], english: 'Excuse me, where is the toilet?' },
    { correct: ['寝る', '前', 'に', '歯', 'を', '磨きます', '。'], english: 'I brush my teeth before going to bed.' },
    { correct: ['来週', 'の', '月曜日', 'に', '会議', 'が', 'あります', '。'], english: 'There is a meeting next Monday.' },
    { correct: ['もし', '時間', 'が', 'あれば', '手伝って', 'ください', '。'], english: 'If you have time, please help.' },
    { correct: ['このレストラン', 'は', '予約', 'が', '必要', 'です', '。'], english: 'This restaurant requires a reservation.' },
  ],
  N3: [
    { correct: ['明日', '天気', 'が', 'よければ', '公園', 'に', '行きます', '。'], english: 'If the weather is good tomorrow, I will go to the park.' },
    { correct: ['雨', 'が', '降って', 'いる', 'から', '傘', 'を', '持って', 'いきましょう', '。'], english: "It's raining, so let's take an umbrella." },
    { correct: ['日本', 'に', '来て', 'から', '3年', 'に', 'なります', '。'], english: 'It has been 3 years since I came to Japan.' },
    { correct: ['彼女', 'は', 'ピアノ', 'を', '弾く', 'こと', 'が', 'できます', '。'], english: 'She can play the piano.' },
    { correct: ['この', '問題', 'は', '難しすぎて', '解けません', '。'], english: 'This problem is too difficult to solve.' },
    { correct: ['彼', 'が', '来る', 'かどうか', 'わかりません', '。'], english: "I don't know whether he will come." },
    { correct: ['毎朝', 'ジョギング', 'する', 'ように', 'して', 'います', '。'], english: 'I try to jog every morning.' },
    { correct: ['先生', 'に', '褒められて', 'うれしかった', 'です', '。'], english: 'I was happy to be praised by the teacher.' },
    { correct: ['この', '映画', 'は', '見る', '価値', 'が', 'あります', '。'], english: 'This movie is worth watching.' },
    { correct: ['忙しい', 'にもかかわらず', '手伝って', 'くれました', '。'], english: 'Despite being busy, they helped me.' },
    { correct: ['会議', 'の', '結果', 'について', '報告', 'します', '。'], english: 'I will report on the results of the meeting.' },
    { correct: ['経験', 'が', 'ない', 'わけでは', 'ありません', '。'], english: "It's not that I have no experience." },
    { correct: ['遅刻', 'しない', 'ように', '早く', '出ました', '。'], english: 'I left early so as not to be late.' },
    { correct: ['日本語', 'が', '上手', 'に', 'なる', 'ために', '毎日', '練習', 'します', '。'], english: 'I practice every day to become good at Japanese.' },
    { correct: ['田中さん', 'に', 'よると', '会議', 'は', '中止', 'だ', 'そうです', '。'], english: 'According to Mr. Tanaka, the meeting is cancelled.' },
  ],
  N2: [
    { correct: ['彼', 'は', '努力', 'した', 'にもかかわらず', '試験', 'に', '落ちて', 'しまった', '。'], english: 'Despite his efforts, he failed the exam.' },
    { correct: ['この', '計画', 'を', '実行', 'する', 'にあたって', '十分な', '準備', 'が', '必要', 'です', '。'], english: 'Sufficient preparation is necessary when carrying out this plan.' },
    { correct: ['彼女', 'の', '話', 'を', '聞く', 'につれて', '事情', 'が', 'わかって', 'きた', '。'], english: 'As I listened to her story, I came to understand the situation.' },
    { correct: ['環境', '問題', 'は', '深刻化', 'する', '一方', 'です', '。'], english: 'Environmental problems are only getting worse.' },
    { correct: ['経済', 'が', '悪化', 'した', '結果', '失業率', 'が', '上がった', '。'], english: 'As a result of the economic decline, the unemployment rate rose.' },
    { correct: ['あの', '映画', 'は', '見れば', '見る', 'ほど', '面白い', '。'], english: 'The more you watch that movie, the more interesting it is.' },
    { correct: ['この', '問題', 'に', '関して', 'は', '私', 'に', '任せて', 'ください', '。'], english: 'Please leave this problem to me.' },
    { correct: ['社長', 'として', 'の', '責任', 'を', '果たさ', 'なければ', 'なりません', '。'], english: 'I must fulfill my responsibilities as president.' },
    { correct: ['技術', 'の', '進歩', 'に', '伴い', '生活', 'が', '便利', 'に', 'なった', '。'], english: 'Life has become more convenient with advances in technology.' },
    { correct: ['結論', 'から', '言えば', 'この', '計画', 'は', '無理', 'です', '。'], english: 'In conclusion, this plan is impossible.' },
    { correct: ['予算', 'の', '関係', '上', '計画', 'を', '変更', 'せざるを得ない', '。'], english: 'Due to budget constraints, we have no choice but to change the plan.' },
    { correct: ['彼', 'は', '医者', 'で', 'ある', 'と同時に', '作家', 'でもある', '。'], english: 'He is a doctor and at the same time a writer.' },
    { correct: ['新しい', '法律', 'が', '施行', 'された', 'のを', 'きっかけに', '社会', 'が', '変わった', '。'], english: 'Society changed triggered by the new law.' },
    { correct: ['いくら', '説明', 'しても', '彼', 'は', '理解', 'しようと', 'しない', '。'], english: 'No matter how much I explain, he refuses to understand.' },
    { correct: ['この', '地域', 'は', '自然', 'が', '豊か', 'な', '反面', '交通', 'が', '不便', 'です', '。'], english: 'This area is rich in nature, but on the other hand transportation is inconvenient.' },
  ],
  N1: [
    { correct: ['彼', 'は', '天才', 'と', '言われる', 'だけ', 'あって', '発想', 'が', '独創的', 'だ', '。'], english: 'He is said to be a genius, and indeed his ideas are original.' },
    { correct: ['今更', '後悔', 'した', 'ところで', '取り返し', 'が', 'つかない', '。'], english: "Even if you regret it now, it's too late to fix." },
    { correct: ['国民', 'の', '安全', 'を', '確保', 'する', 'べく', '政府', 'は', '対策', 'を', '講じた', '。'], english: 'The government took measures to ensure the safety of citizens.' },
    { correct: ['彼女', 'は', '若い', 'ながら', 'も', '経営者', 'として', '手腕', 'を', '発揮', 'して', 'いる', '。'], english: 'Despite being young, she demonstrates her ability as a manager.' },
    { correct: ['この', '法案', 'が', '可決', 'された', '暁', 'には', '社会', 'が', '大きく', '変わる', 'だろう', '。'], english: 'When this bill is passed, society will change greatly.' },
    { correct: ['経済', '危機', 'を', '乗り越える', 'には', '官民', '一体', 'と', 'なって', '取り組む', '必要', 'が', 'ある', '。'], english: 'To overcome the economic crisis, public and private sectors must work together.' },
    { correct: ['先人', 'たち', 'の', '知恵', 'なくして', 'は', '今日', 'の', '繁栄', 'は', 'なかった', 'であろう', '。'], english: "Without the wisdom of our predecessors, today's prosperity would not have existed." },
    { correct: ['彼', 'の', '態度', 'たるや', '目', 'に', '余る', 'ものが', 'ある', '。'], english: 'His attitude is truly beyond tolerance.' },
    { correct: ['この', '作品', 'は', '芸術性', 'もさることながら', '社会的', 'メッセージ', 'が', '強い', '。'], english: "This work has a strong social message, not to mention its artistic value." },
    { correct: ['災害', 'に', '備え', 'て', 'おく', 'に', '越した', 'こと', 'は', 'ない', '。'], english: "It's best to prepare for disasters." },
    { correct: ['彼', 'は', '証拠', 'を', '突きつけ', 'られる', 'や', 'いなや', '自白', 'した', '。'], english: 'The moment the evidence was presented, he confessed.' },
    { correct: ['人口', '減少', '問題', 'は', '対岸', 'の', '火事', 'では', '済まされない', '。'], english: 'The population decline issue cannot be treated as someone else\'s problem.' },
    { correct: ['この', '小説', 'は', '読めば', '読む', 'ほど', '考えさせ', 'られる', '。'], english: 'The more you read this novel, the more it makes you think.' },
    { correct: ['政府', 'の', '方針', 'いかん', 'に', 'よっては', '今後', '大きな', '影響', 'が', '出る', '。'], english: "Depending on the government's policy, there may be significant impact." },
    { correct: ['彼', 'の', '功績', 'は', '称賛', 'に', '値する', '。'], english: 'His achievements deserve praise.' },
  ],
}

const grammarData = computed(() => grammarByLevel[selectedLevel.value] || grammarByLevel.N5)

function generateGrammarQuestion() {
  const data = grammarData.value
  let available = data.map((_, i) => i).filter(i => !usedGrammarIndices.includes(i))
  if (available.length === 0) { usedGrammarIndices = []; available = data.map((_, i) => i) }
  const idx = available[Math.floor(Math.random() * available.length)]
  usedGrammarIndices.push(idx)
  const d = data[idx]
  return { correct: d.correct, english: d.english }
}

function startGrammarGame() {
  grammarState.value = 'playing'
  grammarRound.value = 1
  grammarScore.value = 0
  grammarWrong.value = []
  usedGrammarIndices = []
  loadGrammarQuestion()
}

function loadGrammarQuestion() {
  grammarAnswered.value = false
  grammarIsCorrect.value = false
  grammarSelected.value = []
  grammarUsedPool.value = []
  const q = generateGrammarQuestion()
  grammarQuestion.value = q
  grammarPool.value = shuffle([...q.correct])
  startGrammarTimer()
}

function startGrammarTimer() {
  clearInterval(grammarTimer)
  grammarTimeLeft.value = 30
  grammarTimer = setInterval(() => {
    grammarTimeLeft.value--
    if (grammarTimeLeft.value <= 0) {
      clearInterval(grammarTimer)
      if (!grammarAnswered.value) {
        grammarAnswered.value = true
        grammarIsCorrect.value = false
        grammarWrong.value.push({
          correct: grammarQuestion.value.correct.join(''),
          english: grammarQuestion.value.english,
          userAnswer: grammarSelected.value.join('') || '⏰ Time up'
        })
        setTimeout(nextGrammarRound, 2000)
      }
    }
  }, 1000)
}

function addWord(word, idx) {
  if (grammarUsedPool.value.includes(idx)) return
  grammarSelected.value.push(word)
  grammarUsedPool.value.push(idx)
}

function removeWord(selectedIdx) {
  if (grammarAnswered.value) return
  const word = grammarSelected.value[selectedIdx]
  grammarSelected.value.splice(selectedIdx, 1)
  // Find the pool index to unmark
  const poolIdx = grammarUsedPool.value.find(pi => grammarPool.value[pi] === word)
  if (poolIdx !== undefined) {
    grammarUsedPool.value = grammarUsedPool.value.filter(pi => pi !== poolIdx)
  }
}

function isWordUsed(word, idx) {
  return grammarUsedPool.value.includes(idx)
}

function clearGrammarSelection() {
  grammarSelected.value = []
  grammarUsedPool.value = []
}

// Dictionary lookup (Jisho)
const lookupWord = async () => {
  const query = dictionaryQuery.value.trim()
  if (!query) return
  dictionaryLoading.value = true
  dictionaryError.value = ''
  dictionaryResults.value = []
  try {
    const data = await searchDictionary(query)
    dictionaryResults.value = data.slice(0, 5)
  } catch (err) {
    console.error('Dictionary lookup failed:', err)
    const message = err?.response?.data?.message || err?.message || 'Failed to fetch dictionary results'
    dictionaryError.value = message
    dictionaryResults.value = []
  } finally {
    dictionaryLoading.value = false
  }
}

// ==========================================
// DRAG AND DROP LOGIC
// ==========================================
let dragSource = null // { from: 'pool'|'answer', word, poolIdx, answerIdx }

function onDragStartFromPool(event, word, idx) {
  if (grammarAnswered.value || isWordUsed(word, idx)) return
  dragSource = { from: 'pool', word, poolIdx: idx }
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', word)
}

function onDragStartFromAnswer(event, idx) {
  if (grammarAnswered.value) return
  dragSource = { from: 'answer', answerIdx: idx, word: grammarSelected.value[idx] }
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', grammarSelected.value[idx])
}

function onDropToAnswer(event) {
  event.preventDefault()
  if (!dragSource || grammarAnswered.value) return
  if (dragSource.from === 'pool') {
    addWord(dragSource.word, dragSource.poolIdx)
  }
  // If dragging from answer to answer, it's a reorder — do nothing extra
  dragSource = null
}

function onDropToPool(event) {
  event.preventDefault()
  if (!dragSource || grammarAnswered.value) return
  if (dragSource.from === 'answer') {
    removeWord(dragSource.answerIdx)
  }
  dragSource = null
}

function checkGrammarAnswer() {
  if (grammarAnswered.value) return
  clearInterval(grammarTimer)
  grammarAnswered.value = true
  const userStr = grammarSelected.value.join('')
  const correctStr = grammarQuestion.value.correct.join('')
  grammarIsCorrect.value = userStr === correctStr
  if (grammarIsCorrect.value) {
    grammarScore.value++
  } else {
    grammarWrong.value.push({
      correct: correctStr,
      english: grammarQuestion.value.english,
      userAnswer: userStr
    })
  }
  setTimeout(nextGrammarRound, 2000)
}

function nextGrammarRound() {
  if (grammarRound.value >= 10) {
    finishGrammarGame()
  } else {
    grammarRound.value++
    loadGrammarQuestion()
  }
}

async function finishGrammarGame() {
  grammarState.value = 'finished'
  clearInterval(grammarTimer)
  // Submit score to backend
  try {
    const res = await api.post('/quiz/scores', { score: grammarScore.value, total: 10, quiz_type: `jlpt_${selectedLevel.value.toLowerCase()}_grammar` })
    // Update user points in store
    if (authStore.user && res.data.totalPoints) {
      authStore.user.points = res.data.totalPoints
      localStorage.setItem('user', JSON.stringify(authStore.user))
    }
  } catch (err) {
    console.error('Failed to save grammar score:', err)
  }
}
</script>

<style scoped>
.quiz-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

/* ===== Level Selector (centered clean design) ===== */
.quiz-hero-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.level-selector {
  text-align: center;
  flex-shrink: 0;
}

.level-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-tertiary);
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.level-buttons {
  display: inline-flex;
  gap: 0;
  background: var(--bg-tertiary);
  border-radius: 12px;
  padding: 4px;
  border: 1px solid var(--border-light);
}

.level-btn {
  padding: 0.5rem 1.25rem;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.level-btn:hover:not(.active) {
  color: var(--text-primary);
  background: rgba(212, 175, 55, 0.06);
}

.level-btn.active {
  background: linear-gradient(135deg, #c0392b, #e74c3c);
  color: white;
  box-shadow: 0 2px 12px rgba(231, 76, 60, 0.35);
}

/* ===== Premium Gate ===== */
.premium-gate {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 2rem;
}

.premium-gate-card {
  text-align: center;
  max-width: 480px;
  padding: 3rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 1.5rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.premium-icon {
  margin-bottom: 1.5rem;
  color: var(--color-primary);
}

.premium-gate-card h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.premium-gate-card p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.btn-upgrade {
  display: inline-block;
  padding: 0.875rem 2.5rem;
  background: linear-gradient(135deg, var(--color-primary), #d4a853);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-upgrade:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.back-link {
  display: block;
  margin-top: 1rem;
  color: var(--text-tertiary);
  font-size: 0.875rem;
}

/* ===== Quiz Hero ===== */
.quiz-hero {
  padding: 3.5rem 2rem 2.5rem;
  text-align: center;
  background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
  position: relative;
  overflow: hidden;
}

.quiz-hero::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -10%;
  width: 120%;
  height: 200%;
  background: radial-gradient(ellipse at 30% 20%, rgba(212, 175, 55, 0.04) 0%, transparent 60%),
              radial-gradient(ellipse at 70% 60%, rgba(231, 76, 60, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.quiz-hero-content {
  text-align: left;
  flex: 1;
}

.quiz-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.text-gold {
  background: linear-gradient(135deg, var(--color-primary), #d4a853);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.quiz-subtitle {
  font-size: 1.05rem;
  color: var(--text-secondary);
  max-width: 540px;
  margin: 0 auto;
  line-height: 1.7;
}

/* ===== Tabs ===== */
.quiz-main {
  padding: 2rem;
  max-width: 820px;
  margin: 0 auto;
}

.quiz-container {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
}

.tab-bar {
  display: flex;
  gap: 4px;
  padding: 8px;
  background: var(--bg-tertiary);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 0.5rem;
  background: transparent;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 10px;
  white-space: nowrap;
  min-width: 0;
}

.tab-btn.active {
  color: var(--text-primary);
  background: var(--bg-secondary);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

.tab-btn:hover:not(.active) {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.04);
}

/* ===== Start Screen ===== */
.start-screen {
  padding: 3rem 2rem;
  display: flex;
  justify-content: center;
}

.start-card {
  text-align: center;
  max-width: 440px;
}

.start-icon {
  font-size: 3.5rem;
  margin-bottom: 1.25rem;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
}

.start-card h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  letter-spacing: -0.3px;
}

.start-card p {
  color: var(--text-secondary);
  margin-bottom: 1.75rem;
  line-height: 1.7;
  font-size: 0.95rem;
}

.quiz-rules {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.rule {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 0.875rem 1.5rem;
  background: var(--bg-tertiary);
  border-radius: 12px;
  border: 1px solid var(--border-light);
  min-width: 80px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.rule:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.rule-num {
  font-size: 1.4rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--color-primary), #d4a853);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.rule span:last-child {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.75px;
  font-weight: 600;
}

.btn-start {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2.5rem;
  background: linear-gradient(135deg, var(--color-primary), #d4a853);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.2);
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(212, 175, 55, 0.35);
}

.btn-start:active {
  transform: translateY(0);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1rem;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-secondary:hover {
  background: var(--bg-elevated);
  border-color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

/* ===== Game Area ===== */
.game-area {
  padding: 2rem;
  position: relative;
}

.progress-section {
  margin-bottom: 1.75rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.round-label {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.score-label {
  font-weight: 700;
  color: var(--color-primary);
  font-size: 0.9rem;
}

.progress-bar {
  height: 5px;
  background: var(--bg-tertiary);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), #d4a853);
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.timer-bar {
  height: 3px;
  background: var(--bg-tertiary);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.timer-fill {
  height: 100%;
  background: #4ade80;
  border-radius: 999px;
  transition: width 1s linear;
}

.timer-fill.warning {
  background: #fbbf24;
}

.timer-fill.danger {
  background: #ef4444;
  animation: pulse-danger 0.5s ease infinite;
}

@keyframes pulse-danger {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.timer-text {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-align: right;
  display: block;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* ===== Question Card ===== */
.question-card {
  text-align: center;
  padding: 2.25rem 2rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  margin-bottom: 1.5rem;
  transition: transform 0.3s;
  position: relative;
  overflow: hidden;
}

.question-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), #d4a853, var(--color-primary));
  background-size: 200% 100%;
  animation: shimmer 3s ease infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.question-card.card-flip {
  transform: rotateY(10deg) scale(0.97);
}

.question-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 1rem;
}

.kanji-display {
  font-size: 4.5rem;
  font-weight: 900;
  color: var(--text-primary);
  line-height: 1.2;
  font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic Pro', 'Yu Gothic', sans-serif;
  letter-spacing: 2px;
}

.kanji-meaning {
  font-size: 0.95rem;
  color: var(--text-tertiary);
  margin-top: 0.75rem;
  font-weight: 500;
}

/* ===== Answer Grid ===== */
.answers-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
  margin-bottom: 1rem;
}

.answer-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: var(--bg-secondary);
  border: 1.5px solid var(--border-light);
  border-radius: 12px;
  font-size: 1.1rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  font-family: 'Noto Sans JP', sans-serif;
}

.answer-btn:hover:not(.disabled) {
  border-color: var(--color-primary);
  background: rgba(212, 175, 55, 0.06);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.answer-btn.correct {
  background: rgba(74, 222, 128, 0.12);
  border-color: #4ade80;
  color: #16a34a;
  box-shadow: 0 0 0 1px rgba(74, 222, 128, 0.2);
}

.answer-btn.wrong {
  background: rgba(239, 68, 68, 0.12);
  border-color: #ef4444;
  color: #dc2626;
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.2);
}

.answer-btn.disabled {
  cursor: default;
  opacity: 0.65;
}

.answer-key {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.answer-text {
  flex: 1;
}

.answer-shortcut {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-tertiary);
  flex-shrink: 0;
  opacity: 0.5;
}

/* ===== Combo Badge ===== */
.combo-badge {
  position: absolute;
  top: 6rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  border-radius: 999px;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.35);
  color: white;
  font-weight: 800;
  font-size: 0.95rem;
  animation: pulse-combo 0.6s ease-in-out infinite;
  z-index: 10;
}

.combo-badge.mega-combo {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  transform: scale(1.05);
  animation: pulse-mega 0.5s ease-in-out infinite;
}

.combo-icon {
  font-size: 1.25rem;
  animation: flame 0.3s ease-in-out infinite;
}

@keyframes pulse-combo {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}

@keyframes pulse-mega {
  0%, 100% { transform: scale(1.05); }
  50% { transform: scale(1.1); }
}

@keyframes flame {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.combo-enter-active,
.combo-leave-active {
  transition: all 0.3s ease;
}

.combo-enter-from {
  opacity: 0;
  transform: translateX(2rem) scale(0.8);
}

.combo-leave-to {
  opacity: 0;
  transform: translateY(-2rem) scale(0.8);
}

/* ===== Session Stats Widget ===== */
.session-stats-widget {
  display: flex;
  justify-content: center;
  gap: 0.625rem;
  margin-bottom: 1.25rem;
}

.stat-mini {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: 999px;
  font-size: 0.8rem;
}

.stat-icon {
  font-size: 0.875rem;
}

.stat-value {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-primary);
}

/* ===== Feedback ===== */
.feedback {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
}

.feedback.correct {
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.2);
  color: #16a34a;
}

.feedback.wrong {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* ===== Results ===== */
.results-screen {
  padding: 2.5rem 2rem;
}

.results-card {
  text-align: center;
}

.results-emoji {
  font-size: 3.5rem;
  margin-bottom: 0.75rem;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
}

.results-card h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.25rem;
  letter-spacing: -0.3px;
}

.final-score {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.score-number {
  font-size: 4rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--color-primary), #d4a853);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.score-divider {
  font-size: 2rem;
  color: var(--text-tertiary);
}

.score-total {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-tertiary);
}

.score-message {
  color: var(--text-secondary);
  font-size: 1.05rem;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.results-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
}

.stat-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
}

.stat-val.correct-val {
  color: #16a34a;
}

.stat-val.wrong-val {
  color: #dc2626;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.75px;
  font-weight: 600;
}

/* Points Earned Banner */
.points-earned-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, rgba(254, 243, 199, 0.8), rgba(253, 230, 138, 0.6));
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 14px;
  padding: 1rem 1.25rem;
  margin-bottom: 2rem;
}

.points-icon {
  font-size: 1.75rem;
}

.points-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.125rem;
}

.points-amount {
  font-size: 1.05rem;
  font-weight: 800;
  color: #92400e;
}

.points-total {
  font-size: 0.75rem;
  color: #b45309;
  font-weight: 500;
}

.points-shop-link {
  color: #92400e;
  font-weight: 700;
  font-size: 0.8rem;
  text-decoration: none;
  white-space: nowrap;
  padding: 0.375rem 0.75rem;
  background: rgba(146, 64, 14, 0.08);
  border-radius: 8px;
  transition: background 0.2s;
}

.points-shop-link:hover {
  background: rgba(146, 64, 14, 0.15);
}

.review-section {
  margin-bottom: 2rem;
  text-align: left;
}

.review-section h3 {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.review-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--bg-tertiary);
  border-radius: 10px;
  border: 1px solid var(--border-light);
  transition: transform 0.15s;
}

.review-item:hover {
  transform: translateX(2px);
}

.review-kanji {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
  min-width: 60px;
  font-family: 'Noto Sans JP', sans-serif;
}

.review-wrong {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #ef4444;
  font-family: 'Noto Sans JP', sans-serif;
  text-decoration: line-through;
  opacity: 0.8;
}

.review-correct {
  font-size: 1rem;
  font-weight: 700;
  color: #16a34a;
  font-family: 'Noto Sans JP', sans-serif;
}

.review-meaning {
  font-size: 0.825rem;
  color: var(--text-tertiary);
  margin-left: auto;
  font-weight: 500;
}

.results-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* ===== Similar Kanji Quiz ===== */
.kanji-meaning-prompt {
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--color-primary), #d4a853);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.375rem;
}

.kanji-reading-hint {
  font-size: 1.1rem;
  color: var(--text-secondary);
  font-family: 'Noto Sans JP', sans-serif;
  font-weight: 500;
}

.answer-btn-kanji .kanji-option {
  font-size: 2rem;
  font-family: 'Noto Sans JP', sans-serif;
  font-weight: 800;
}

/* ===== Sentence Grammar Quiz ===== */
.grammar-english-hint {
  font-size: 1.05rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  font-style: italic;
  font-weight: 500;
}

.grammar-answer-area {
  margin: 1.25rem 0 0.75rem;
  min-height: 60px;
  background: var(--bg-tertiary);
  border: 2px dashed rgba(212, 175, 55, 0.2);
  border-radius: 14px;
  padding: 0.875rem;
  display: flex;
  align-items: center;
  transition: border-color 0.2s, background 0.2s;
}

.grammar-answer-area:focus-within,
.grammar-answer-area.drag-over {
  border-color: rgba(212, 175, 55, 0.5);
  background: rgba(212, 175, 55, 0.04);
}

.answer-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  width: 100%;
  min-height: 36px;
  align-items: center;
}

.placeholder-text {
  color: var(--text-tertiary);
  font-size: 0.875rem;
  font-style: italic;
}

.grammar-word-pool {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  justify-content: center;
  margin-bottom: 1.25rem;
  padding: 0 0.75rem;
}

.word-chip {
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Noto Sans JP', sans-serif;
  cursor: grab;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1.5px solid transparent;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  user-select: none;
}

.word-chip:active {
  cursor: grabbing;
}

.word-chip.available {
  background: var(--bg-secondary);
  border-color: var(--border-light);
  color: var(--text-primary);
}

.word-chip.available:hover:not(:disabled) {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.15);
}

.word-chip.available:disabled {
  opacity: 0.25;
  cursor: not-allowed;
  transform: none;
}

.word-chip.selected {
  background: rgba(212, 175, 55, 0.1);
  border-color: rgba(212, 175, 55, 0.3);
  color: var(--color-primary);
}

.word-chip.selected:hover {
  background: rgba(212, 175, 55, 0.18);
}

.chip-remove {
  font-size: 0.7rem;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.word-chip.selected:hover .chip-remove {
  opacity: 1;
}

.grammar-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.grammar-feedback-detail {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.correct-sentence {
  font-size: 0.95rem;
  font-family: 'Noto Sans JP', sans-serif;
  font-weight: 600;
  color: #16a34a;
}

/* Dictionary lookup */
.dictionary-card {
  margin: 1.25rem 0 1.5rem;
  padding: 1rem 1.25rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.06);
}

.dictionary-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.dictionary-header h3 {
  margin: 0;
  font-size: 1.05rem;
}

.dictionary-hint {
  margin: 0;
  color: var(--text-tertiary);
  font-size: 0.9rem;
}

.dictionary-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.dict-input {
  min-width: 240px;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--border-light);
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.dictionary-results {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dictionary-item {
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid var(--border-light);
  background: var(--bg-tertiary);
}

.dict-word {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
  font-weight: 700;
}

.dict-kanji { font-size: 1.1rem; }
.dict-reading { color: var(--text-tertiary); font-size: 0.95rem; }
.dict-meaning { color: var(--text-secondary); margin-top: 0.25rem; }

.dict-tags { margin-top: 0.35rem; display: flex; gap: 0.35rem; flex-wrap: wrap; }
.dict-tag {
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: rgba(212, 175, 55, 0.08);
  color: var(--color-primary);
  font-size: 0.8rem;
  border: 1px solid rgba(212, 175, 55, 0.25);
}

.dictionary-empty {
  color: var(--text-tertiary);
  font-style: italic;
}

/* Grammar review items */
.review-item-grammar {
  flex-direction: column;
  align-items: flex-start !important;
  gap: 0.375rem !important;
}

.review-grammar-row {
  width: 100%;
}

/* ===== Leaderboard ===== */
.leaderboard-panel {
  padding: 2rem;
}

.leaderboard-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.leaderboard-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.375rem;
  letter-spacing: -0.3px;
}

.leaderboard-header p {
  color: var(--text-tertiary);
  font-size: 0.85rem;
}

.leaderboard-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--text-tertiary);
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 2.5px solid var(--border-light);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.leaderboard-empty {
  text-align: center;
  padding: 3rem;
}

.empty-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 1rem;
}

.leaderboard-empty p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.leaderboard-table {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.lb-row {
  display: grid;
  grid-template-columns: 48px 1fr 72px 80px;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  gap: 0.5rem;
  transition: transform 0.15s;
}

.lb-row:not(.lb-header-row):hover {
  transform: translateX(2px);
}

.lb-header-row {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.75px;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-light);
}

.lb-row:not(.lb-header-row) {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
}

.lb-top1 {
  background: rgba(255, 215, 0, 0.06) !important;
  border-color: rgba(255, 215, 0, 0.25) !important;
}

.lb-top2 {
  background: rgba(192, 192, 192, 0.06) !important;
  border-color: rgba(192, 192, 192, 0.25) !important;
}

.lb-top3 {
  background: rgba(205, 127, 50, 0.06) !important;
  border-color: rgba(205, 127, 50, 0.25) !important;
}

.lb-self {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.2);
}

.lb-rank {
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  font-size: 0.9rem;
}

.medal {
  font-size: 1.2rem;
}

.lb-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9rem;
}

.lb-avatar {
  display: inline-flex;
  width: 26px;
  height: 26px;
  background: linear-gradient(135deg, var(--color-primary), #d4a853);
  color: white;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 700;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lb-score {
  font-weight: 700;
  color: var(--color-primary);
  text-align: center;
  font-size: 0.9rem;
}

.lb-date {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-align: right;
  font-weight: 500;
}

.personal-best {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding: 0.875rem 1.25rem;
  background: rgba(212, 175, 55, 0.06);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 12px;
}

.pb-label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.pb-score {
  font-size: 1.2rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--color-primary), #d4a853);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ===== Responsive ===== */
@media (max-width: 640px) {
  .quiz-hero {
    padding: 2.5rem 1.5rem 2rem;
  }

  .quiz-title {
    font-size: 1.75rem;
  }

  .quiz-subtitle {
    font-size: 0.9rem;
  }

  .quiz-main {
    padding: 1rem;
  }

  .kanji-display {
    font-size: 3.5rem;
  }

  .answers-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .quiz-rules {
    gap: 0.5rem;
  }

  .rule {
    padding: 0.625rem 1rem;
    min-width: 70px;
  }

  .lb-row {
    grid-template-columns: 40px 1fr 60px;
  }

  .lb-date {
    display: none;
  }

  .lb-header-row .lb-date {
    display: none;
  }

  .results-stats {
    gap: 1rem;
  }

  .final-score .score-number {
    font-size: 3rem;
  }

  .tab-btn {
    padding: 0.625rem 0.375rem;
    font-size: 0.7rem;
    gap: 0.25rem;
  }

  .tab-btn svg {
    width: 14px;
    height: 14px;
  }

  .game-area {
    padding: 1.25rem;
  }

  .grammar-answer-area {
    padding: 0.75rem;
  }

  .word-chip {
    padding: 0.375rem 0.75rem;
    font-size: 0.9375rem;
  }

  .answer-btn-kanji .kanji-option {
    font-size: 1.5rem;
  }

  .level-buttons {
    padding: 3px;
  }

  .level-btn {
    padding: 0.375rem 0.875rem;
    font-size: 0.8rem;
  }

  .start-screen {
    padding: 2rem 1.5rem;
  }

  .combo-badge {
    top: 4.5rem;
    right: 0.75rem;
    font-size: 0.8rem;
    padding: 0.375rem 0.75rem;
  }

  .session-stats-widget {
    gap: 0.375rem;
  }

  .stat-mini {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
}

.quiz-footer {
  text-align: center;
  padding: 2rem;
  color: var(--text-tertiary);
  font-size: 0.8rem;
  border-top: 1px solid var(--border-light);
  margin-top: 2rem;
  letter-spacing: 0.25px;
}
</style>
