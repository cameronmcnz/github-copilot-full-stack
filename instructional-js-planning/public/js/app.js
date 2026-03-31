const { createApp, ref, computed, onMounted } = Vue;

const app = createApp({
  setup() {
    const apiBase = 'http://localhost:3066';
    const currentTab = ref('Play');
    const currentMatch = ref(null);
    const matches = ref([]);
    const selectedMatch = ref(null);
    const userId = ref('');
    const isLoading = ref(false);
    const errorMessage = ref('');
    const healthStatus = ref(null);

    const tabs = computed(() => ['Play', 'History', 'Match Detail', 'Troubleshooting']);

    const lastRound = computed(() => {
      if (!currentMatch.value || !currentMatch.value.rounds || currentMatch.value.rounds.length === 0) {
        return null;
      }
      return currentMatch.value.rounds[currentMatch.value.rounds.length - 1];
    });

    function getEmoji(choice) {
      const emojiMap = {
        'rock': '🪨',
        'paper': '📄',
        'scissors': '✂️'
      };
      return emojiMap[choice] || '❓';
    }

    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    function getRoundNumber() {
      if (!currentMatch.value || !currentMatch.value.rounds) {
        return 1;
      }
      return currentMatch.value.rounds.length + 1;
    }

    async function loadMatches() {
      try {
        const response = await fetch(`${apiBase}/api/matches`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to load matches');
        }

        const data = await response.json();
        matches.value = data.data || [];
      } catch (err) {
        console.error('Error loading matches:', err);
        errorMessage.value = 'Failed to load match history';
      }
    }

    async function startNewMatch() {
      try {
        isLoading.value = true;
        errorMessage.value = '';

        const response = await fetch(`${apiBase}/api/matches`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to start new match');
        }

        const data = await response.json();
        currentMatch.value = data.data;
        currentTab.value = 'Play';
      } catch (err) {
        console.error('Error starting match:', err);
        errorMessage.value = 'Failed to start a new match';
      } finally {
        isLoading.value = false;
      }
    }

    async function playMove(choice) {
      try {
        if (!currentMatch.value) {
          return;
        }

        isLoading.value = true;
        errorMessage.value = '';

        const response = await fetch(`${apiBase}/api/matches/${currentMatch.value.id}/moves`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ playerChoice: choice }),
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to submit move');
        }

        const data = await response.json();
        const result = data.data;

        currentMatch.value.player_score = result.playerScore;
        currentMatch.value.computer_score = result.computerScore;
        currentMatch.value.status = result.matchStatus;
        currentMatch.value.winner = result.matchWinner;

        if (!currentMatch.value.rounds) {
          currentMatch.value.rounds = [];
        }

        currentMatch.value.rounds.push({
          id: result.roundId,
          round_number: result.roundNumber,
          player_choice: result.playerChoice,
          computer_choice: result.computerChoice,
          winner: result.roundWinner
        });
      } catch (err) {
        console.error('Error playing move:', err);
        errorMessage.value = err.message || 'Failed to submit move';
      } finally {
        isLoading.value = false;
      }
    }

    async function selectMatch(match) {
      try {
        const response = await fetch(`${apiBase}/api/matches/${match.id}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to load match details');
        }

        const data = await response.json();
        selectedMatch.value = data.data;
        currentTab.value = 'Match Detail';
      } catch (err) {
        console.error('Error loading match details:', err);
        errorMessage.value = 'Failed to load match details';
      }
    }

    async function checkHealth() {
      try {
        const [liveResponse, readyResponse] = await Promise.all([
          fetch(`${apiBase}/health/live`, { credentials: 'include' }),
          fetch(`${apiBase}/health/ready`, { credentials: 'include' })
        ]);

        const liveData = liveResponse.ok ? await liveResponse.json() : null;
        const readyData = readyResponse.ok ? await readyResponse.json() : null;

        healthStatus.value = {
          live: !!liveData,
          ready: !!readyData
        };
      } catch (err) {
        console.error('Error checking health:', err);
        healthStatus.value = {
          live: false,
          ready: false
        };
      }
    }

    function extractUserIdFromCookie() {
      const cookieString = document.cookie;
      const cookies = cookieString.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'userId') {
          return decodeURIComponent(value);
        }
      }
      return 'Loading...';
    }

    async function loadCurrentMatch() {
      try {
        const response = await fetch(`${apiBase}/api/matches`, {
          credentials: 'include'
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const userMatches = data.data || [];

        const inProgressMatch = userMatches.find(m => m.status === 'in_progress');
        if (inProgressMatch) {
          const matchDetailResponse = await fetch(`${apiBase}/api/matches/${inProgressMatch.id}`, {
            credentials: 'include'
          });

          if (matchDetailResponse.ok) {
            const matchDetailData = await matchDetailResponse.json();
            currentMatch.value = matchDetailData.data;
          }
        }
      } catch (err) {
        console.error('Error loading current match:', err);
      }
    }

    onMounted(() => {
      userId.value = extractUserIdFromCookie();
      loadMatches();
      loadCurrentMatch();

      const polling = setInterval(() => {
        if (currentMatch.value && currentMatch.value.status === 'in_progress') {
          loadCurrentMatch();
        }
      }, 2000);

      return () => clearInterval(polling);
    });

    return {
      apiBase,
      currentTab,
      tabs,
      currentMatch,
      matches,
      selectedMatch,
      userId,
      isLoading,
      errorMessage,
      healthStatus,
      lastRound,
      getEmoji,
      formatDate,
      getRoundNumber,
      loadMatches,
      startNewMatch,
      playMove,
      selectMatch,
      checkHealth
    };
  }
});

app.mount('#app');
