document.addEventListener('DOMContentLoaded', function() {
    // State management
    let state = {
      darkMode: false,
      currentMood: null,
      habits: [
        { 
          id: 1, 
          name: 'Meditate', 
          icon: '🧘', 
          days: 'Mon-Fri', 
          time: '08:00', 
          completed: false 
        },
        { 
          id: 2, 
          name: 'Walking', 
          icon: '🚶', 
          days: 'Daily', 
          time: '17:30', 
          completed: true 
        }
      ],
      selectedIcon: '📝',
      moods: ['😡', '😢', '😐', '😊', '🥰'],
      moodLabels: ['Angry', 'Sad', 'Neutral', 'Happy', 'Loving']
    };
  
    // Load saved data from Chrome storage
    chrome.storage.sync.get(['habeopraxState'], function(result) {
      if (result.habeopraxState) {
        state = { ...state, ...result.habeopraxState };
        
        // Apply dark mode if saved
        if (state.darkMode) {
          document.body.classList.add('dark-mode');
        }
        
        // Set current mood if saved
        if (state.currentMood !== null) {
          document.getElementById('currentMoodEmoji').textContent = state.moods[state.currentMood];
          document.getElementById('moodButton').classList.add('mood-button-active');
        }
        
        // Render habits
        renderHabits();
      }
    });
  
    // Save state to Chrome storage
    function saveState() {
      chrome.storage.sync.set({
        habeopraxState: {
          darkMode: state.darkMode,
          currentMood: state.currentMood,
          habits: state.habits
        }
      });
    }
  
    // DOM Elements
    const themeToggle = document.getElementById('themeToggle');
    const moodButton = document.getElementById('moodButton');
    const moodModal = document.getElementById('moodModal');
    const closeMoodModal = document.getElementById('closeMoodModal');
    const addHabitBtn = document.getElementById('addHabitBtn');
    const addHabitModal = document.getElementById('addHabitModal');
    const habitsList = document.getElementById('habitsList');
    const addHabitForm = document.getElementById('addHabitForm');
    const cancelAddHabit = document.getElementById('cancelAddHabit');
    const iconButtons = document.querySelectorAll('.icon-button');
    
    // Theme Toggle
    themeToggle.addEventListener('click', function() {
      state.darkMode = !state.darkMode;
      document.body.classList.toggle('dark-mode');
      saveState();
    });
    
    // Mood Modal
    moodButton.addEventListener('click', function() {
      moodModal.classList.remove('hidden');
    });
    
    closeMoodModal.addEventListener('click', function() {
      moodModal.classList.add('hidden');
    });
    
    document.querySelectorAll('.mood-item').forEach(item => {
      item.addEventListener('click', function() {
        const moodIndex = parseInt(this.dataset.mood);
        state.currentMood = moodIndex;
        document.getElementById('currentMoodEmoji').textContent = state.moods[moodIndex];
        moodButton.classList.add('mood-button-active');
        moodModal.classList.add('hidden');
        saveState();
      });
    });
    
    // Add Habit Modal
    addHabitBtn.addEventListener('click', function() {
      addHabitModal.classList.remove('hidden');
    });
    
    cancelAddHabit.addEventListener('click', function() {
      addHabitModal.classList.add('hidden');
      resetHabitForm();
    });
    
    // Icon Selection
    iconButtons.forEach(button => {
      button.addEventListener('click', function() {
        iconButtons.forEach(btn => btn.classList.remove('selected'));
        this.classList.add('selected');
        state.selectedIcon = this.dataset.icon;
        document.getElementById('habitIcon').value = state.selectedIcon;
      });
    });
    
    // Pre-select the first icon
    iconButtons[0].classList.add('selected');
    
    // Add Habit Form Submission
    addHabitForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const habitName = document.getElementById('habitName').value;
      const habitIcon = document.getElementById('habitIcon').value;
      const habitDays = document.getElementById('habitDays').value;
      const habitTime = document.getElementById('habitTime').value;
      
      if (!habitName) return;
      
      const newHabit = {
        id: Date.now(),
        name: habitName,
        icon: habitIcon,
        days: habitDays,
        time: habitTime,
        completed: false
      };
      
      state.habits.push(newHabit);
      renderHabits();
      addHabitModal.classList.add('hidden');
      resetHabitForm();
      saveState();
    });
    
    // Reset habit form
    function resetHabitForm() {
      document.getElementById('habitName').value = '';
      document.getElementById('habitDays').value = 'Daily';
      document.getElementById('habitTime').value = '09:00';
      state.selectedIcon = '📝';
      document.getElementById('habitIcon').value = '📝';
      
      iconButtons.forEach(btn => btn.classList.remove('selected'));
      iconButtons[0].classList.add('selected');
    }
    
    // Render habits list
    function renderHabits() {
      habitsList.innerHTML = '';
      
      state.habits.forEach(habit => {
        const li = document.createElement('li');
        li.className = 'habit-item';
        li.innerHTML = `
          <div class="habit-content">
            <span class="habit-icon">${habit.icon}</span>
            <div>
              <span class="habit-name">${habit.name}</span>
              <div class="habit-details">
                <span>${habit.days} · ${habit.time}</span>
              </div>
            </div>
          </div>
          <div class="habit-actions">
            <button class="habit-complete-toggle" aria-label="${habit.completed ? 'Mark as incomplete' : 'Mark as complete'}">
              <span class="habit-status">${habit.completed ? '✅' : '⬜'}</span>
            </button>
            <button class="habit-delete" aria-label="Delete habit">
              <span>❌</span>
            </button>
          </div>
        `;
        
        // Toggle completion
        li.querySelector('.habit-complete-toggle').addEventListener('click', function() {
          toggleHabitComplete(habit.id);
        });
        
        // Delete habit
        li.querySelector('.habit-delete').addEventListener('click', function() {
          deleteHabit(habit.id);
        });
        
        habitsList.appendChild(li);
      });
    }
    
    // Toggle habit completion
    function toggleHabitComplete(id) {
      state.habits = state.habits.map(habit => {
        if (habit.id === id) {
          return { ...habit, completed: !habit.completed };
        }
        return habit;
      });
      
      renderHabits();
      saveState();
    }
    
    // Delete habit
    function deleteHabit(id) {
      state.habits = state.habits.filter(habit => habit.id !== id);
      renderHabits();
      saveState();
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
      if (e.target === moodModal) {
        moodModal.classList.add('hidden');
      }
      if (e.target === addHabitModal) {
        addHabitModal.classList.add('hidden');
        resetHabitForm();
      }
    });
  
    // Initial render
    renderHabits();
  });