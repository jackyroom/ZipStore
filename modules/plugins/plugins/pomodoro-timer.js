/**
 * 番茄专注时钟 (Pomodoro Focus)
 * Features: Countdown/Stopwatch modes, Ambient Music Toggle, Minimalist UI
 */
(function () {
    'use strict';

    const PomodoroTimer = {
        state: {
            mode: 'focus', // 'focus' (countdown) or 'stopwatch' (count up)
            time: 25 * 60, // current seconds (default 25m)
            initialTime: 25 * 60, // for progress calculation or reset
            isRunning: false,
            intervalId: null,
            isMusicOn: false,
            audio: null
        },

        render: function (container) {
            container.innerHTML = `
                <div class="pomodoro-container">
                    <div class="pomodoro-bg"></div>
                    
                    <div class="pomodoro-content">
                        <!-- Mode Switcher -->
                        <div class="pomo-header">
                            <div class="pomo-tab active" data-mode="focus">专注倒计时</div>
                            <div class="pomo-tab" data-mode="stopwatch">正向计时</div>
                        </div>

                        <!-- Timer Display -->
                        <div class="pomo-timer-display">
                            <div id="pomo-digits" class="timer-digits">25:00</div>
                            <div id="pomo-label" class="timer-label">FOCUS TIME</div>
                        </div>

                        <!-- Quick Presets (Focus Mode Only) -->
                        <div id="pomo-presets" class="timer-presets">
                            <div class="preset-chip active" data-min="25">25m</div>
                            <div class="preset-chip" data-min="45">45m</div>
                            <div class="preset-chip" data-min="60">60m</div>
                        </div>
                    </div>

                    <!-- Bottom Controls -->
                    <div class="pomodoro-content" style="flex:0;">
                        <div class="pomo-controls">
                            <button id="pomo-reset" class="pomo-btn" title="重置">
                                <i class="fa-solid fa-rotate-left"></i>
                            </button>
                            <button id="pomo-toggle" class="pomo-btn main-action" title="开始/暂停">
                                <i class="fa-solid fa-play"></i>
                            </button>
                            <!-- Placeholder for settings or sound menu -->
                        </div>
                    </div>

                    <!-- Music Toggle (Corner) -->
                    <div id="pomo-music" class="music-toggle">
                        <div class="visualizer-bars">
                            <div class="v-bar"></div>
                            <div class="v-bar"></div>
                            <div class="v-bar"></div>
                        </div>
                        <span>白噪音</span>
                    </div>
                </div>
            `;

            // Init Audio (Placeholder)
            // Ideally this would be a real file. For demo, we just simulate the state.
            this.state.audio = new Audio('https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg');
            this.state.audio.loop = true;

            this.bindEvents();
            this.updateDisplay();
        },

        bindEvents: function () {
            const digits = document.getElementById('pomo-digits');
            const toggleBtn = document.getElementById('pomo-toggle');
            const resetBtn = document.getElementById('pomo-reset');
            const musicBtn = document.getElementById('pomo-music');
            const modeTabs = document.querySelectorAll('.pomo-tab');
            const presets = document.querySelectorAll('.preset-chip');
            const presetContainer = document.getElementById('pomo-presets');
            const label = document.getElementById('pomo-label');

            // Toggle Start/Stop
            toggleBtn.addEventListener('click', () => {
                if (this.state.isRunning) {
                    this.pause();
                } else {
                    this.start();
                }
                this.updateControls();
            });

            // Reset
            resetBtn.addEventListener('click', () => {
                this.pause();
                if (this.state.mode === 'focus') {
                    this.state.time = this.state.initialTime;
                } else {
                    this.state.time = 0;
                }
                this.updateDisplay();
                this.updateControls();
            });

            // Mode Switching
            modeTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    this.pause();
                    modeTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

                    this.state.mode = tab.dataset.mode;
                    if (this.state.mode === 'focus') {
                        presetContainer.style.display = 'flex';
                        this.state.time = 25 * 60;
                        this.state.initialTime = 25 * 60;
                        label.textContent = 'FOCUS TIME';
                        // Reset presets UI
                        presets.forEach(p => p.classList.remove('active'));
                        presets[0].classList.add('active'); // Default 25
                    } else {
                        presetContainer.style.display = 'none';
                        this.state.time = 0;
                        this.state.initialTime = 0;
                        label.textContent = 'ELAPSED TIME';
                    }
                    this.updateDisplay();
                    this.updateControls();
                });
            });

            // Presets (Focus Only)
            presets.forEach(chip => {
                chip.addEventListener('click', () => {
                    if (this.state.mode !== 'focus') return;
                    this.pause();
                    presets.forEach(p => p.classList.remove('active'));
                    chip.classList.add('active');

                    const min = parseInt(chip.dataset.min);
                    this.state.time = min * 60;
                    this.state.initialTime = this.state.time;
                    this.updateDisplay();
                    this.updateControls();
                });
            });

            // Music Toggle
            musicBtn.addEventListener('click', () => {
                this.state.isMusicOn = !this.state.isMusicOn;
                if (this.state.isMusicOn) {
                    musicBtn.classList.add('active');
                    this.state.audio.play().catch(e => console.log('Audio autoplay blocked or invalid URL', e));
                } else {
                    musicBtn.classList.remove('active');
                    this.state.audio.pause();
                }
            });
        },

        start: function () {
            if (this.state.isRunning) return;
            this.state.isRunning = true;

            this.state.intervalId = setInterval(() => {
                if (this.state.mode === 'focus') {
                    if (this.state.time > 0) {
                        this.state.time--;
                    } else {
                        this.pause(); // Timer done
                        // Minimal beep or alert could go here
                        alert("专注时间结束！");
                    }
                } else {
                    // Stopwatch
                    this.state.time++;
                }
                this.updateDisplay();
            }, 1000);
        },

        pause: function () {
            this.state.isRunning = false;
            clearInterval(this.state.intervalId);
        },

        updateControls: function () {
            const toggleBtn = document.getElementById('pomo-toggle');
            if (this.state.isRunning) {
                toggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                toggleBtn.classList.add('running');
            } else {
                toggleBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                toggleBtn.classList.remove('running');
            }
        },

        updateDisplay: function () {
            const digits = document.getElementById('pomo-digits');
            const time = this.state.time;

            const hours = Math.floor(time / 3600);
            const minutes = Math.floor((time % 3600) / 60);
            const seconds = time % 60;

            const format = (n) => n.toString().padStart(2, '0');

            if (hours > 0) {
                digits.textContent = `${hours}:${format(minutes)}:${format(seconds)}`;
                digits.style.fontSize = '6rem'; // Shrink slightly for longer text
            } else {
                digits.textContent = `${format(minutes)}:${format(seconds)}`;
                digits.style.fontSize = '8rem';
            }
        },

        // Clean up when plugin is closed/switched? 
        // Currently Plugin architecture doesn't have an explicit 'unmount' hook, 
        // but re-rendering overwrites container. 
        // We should ideally stop audio if the user navigates away, 
        // but within this simple architecture, we rely on the user stopping it 
        // or the browser pausing background tabs.
    };

    window.PomodoroTimer = PomodoroTimer;
})();
