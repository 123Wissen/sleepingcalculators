document.addEventListener("DOMContentLoaded", () => {
  // Initialize notification permission
  let notificationPermission = "default";
  if ("Notification" in window) {
    Notification.requestPermission().then((permission) => {
      notificationPermission = permission;
    });
  }

  // Error handling wrapper with improved logging
  const handleError = (error, functionName) => {
    console.error(`Error in ${functionName}:`, error);
    // Optional: Send error to server
    if (window.errorLogger) {
      window.errorLogger.log(error, functionName);
    }
  };

  // Mobile Menu Toggle with improved touch handling
  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  const body = document.body;

  if (menuToggle && mainNav) {
    try {
      let isMenuAnimating = false;
      let touchStartY = 0;

      // Add touch handling for mobile devices
      mainNav.addEventListener(
        "touchstart",
        (e) => {
          touchStartY = e.touches[0].clientY;
        },
        { passive: true }
      );

      mainNav.addEventListener(
        "touchmove",
        (e) => {
          const touchY = e.touches[0].clientY;
          const scrollTop = mainNav.scrollTop;
          const scrollHeight = mainNav.scrollHeight;
          const clientHeight = mainNav.clientHeight;

          // Prevent body scroll only when menu is at top or bottom
          if (
            (scrollTop <= 0 && touchY > touchStartY) ||
            (scrollTop + clientHeight >= scrollHeight && touchY < touchStartY)
          ) {
            e.preventDefault();
          }
        },
        { passive: false }
      );

      menuToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        if (isMenuAnimating) return;

        isMenuAnimating = true;
        mainNav.classList.toggle("active");
        const icon = menuToggle.querySelector("i");
        if (icon) {
          icon.classList.toggle("fa-bars");
          icon.classList.toggle("fa-times");
        }

        // Prevent body scrolling when menu is open
        body.style.overflow = mainNav.classList.contains("active")
          ? "hidden"
          : "";

        // Reset animation flag after transition
        setTimeout(() => {
          isMenuAnimating = false;
        }, 300);
      });

      // Improved outside click handling
      document.addEventListener("click", (e) => {
        if (!menuToggle.contains(e.target) && !mainNav.contains(e.target)) {
          if (mainNav.classList.contains("active") && !isMenuAnimating) {
            mainNav.classList.remove("active");
            const icon = menuToggle.querySelector("i");
            if (icon) {
              icon.classList.remove("fa-times");
              icon.classList.add("fa-bars");
            }
            body.style.overflow = "";
          }
        }
      });

      // Close menu when clicking a nav link
      mainNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          mainNav.classList.remove("active");
          const icon = menuToggle.querySelector("i");
          if (icon) {
            icon.classList.remove("fa-times");
            icon.classList.add("fa-bars");
          }
          body.style.overflow = "";
        });
      });
    } catch (error) {
      handleError(error, "Mobile Menu Toggle");
    }
  }

  // Dark Mode Functionality
  const darkModeToggle = document.getElementById("darkModeToggle");

  // Check for saved dark mode preference
  const darkMode = localStorage.getItem("darkMode");

  // Apply dark mode if previously saved
  if (darkMode === "enabled") {
    document.body.classList.add("dark-mode");
    darkModeToggle.checked = true;
  }

  // Toggle dark mode
  if (darkModeToggle) {
    darkModeToggle.addEventListener("change", () => {
      if (darkModeToggle.checked) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("darkMode", "enabled");
      } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("darkMode", null);
      }
    });
  }

  // Get DOM elements
  const calculateBtn = document.getElementById("calculateBtn");
  const resultsDiv = document.getElementById("results");
  const napBtn = document.getElementById("napBtn");
  const reminderBtn = document.getElementById("reminderBtn");
  const napTimer = document.getElementById("napTimer");
  const startNapBtn = document.getElementById("startNapBtn");
  const reminderModal = document.getElementById("reminderModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const saveReminderBtn = document.getElementById("saveReminderBtn");

  // Sleep tips by age group
  const sleepTips = {
    teen: [
      "Avoid caffeine after 2 PM for better sleep quality",
      "Try to limit screen time before bed",
      "Keep a consistent sleep schedule, even on weekends",
      "Aim for 8-10 hours of sleep per night",
    ],
    adult: [
      "Create a relaxing bedtime routine",
      "Keep your bedroom cool and dark",
      "Avoid large meals close to bedtime",
      "Exercise regularly, but not too close to bedtime",
    ],
    senior: [
      "Consider reducing liquid intake before bed",
      "Stay active during the day for better sleep",
      "Keep naps short (20-30 minutes) and before 3 PM",
      "Maintain a consistent wake-up time",
    ],
  };

  // Sleep quality tracking
  let sleepHistory = JSON.parse(localStorage.getItem("sleepHistory")) || [];

  // Sleep recommendations by age
  const sleepRecommendations = {
    teen: { min: 8, max: 10, recommended: 9 },
    adult: { min: 7, max: 9, recommended: 8 },
    senior: { min: 7, max: 8, recommended: 7.5 },
  };

  // Calculate bedtime function
  function calculateBedtime() {
    const hour = parseInt(document.getElementById("hour").value) || 8;
    const minute = parseInt(document.getElementById("minute").value) || 0;
    const ampm = document.getElementById("ampm").value || "AM";
    const ageGroup = document.getElementById("age").value || "adult";

    let hours24 = hour;
    if (ampm === "PM" && hour !== 12) {
      hours24 += 12;
    } else if (ampm === "AM" && hour === 12) {
      hours24 = 0;
    }

    const wakeTime = new Date();
    wakeTime.setHours(hours24, minute, 0, 0);

    const bedtimes = [];
    const recommendation = sleepRecommendations[ageGroup];
    const cycles = Math.round((recommendation.recommended * 60) / 90);

    for (let i = cycles + 1; i >= cycles - 1; i--) {
      const bedtime = new Date(wakeTime);
      bedtime.setMinutes(bedtime.getMinutes() - (i * 90 + 15));
      bedtimes.push({
        time: formatTime(bedtime),
        cycles: i,
        duration: (i * 90) / 60,
      });
    }

    displayResults(bedtimes, recommendation, ageGroup);
  }

  // Add event listeners
  if (calculateBtn) {
    calculateBtn.addEventListener("click", calculateBedtime);
    calculateBedtime(); // Calculate on page load
  }

  if (napBtn) {
    napBtn.addEventListener("click", toggleNapTimer);
  }

  if (reminderBtn) {
    reminderBtn.addEventListener("click", () => {
      reminderModal.classList.remove("hidden");
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      reminderModal.classList.add("hidden");
    });
  }

  if (startNapBtn) {
    startNapBtn.addEventListener("click", startPowerNap);
  }

  if (saveReminderBtn) {
    saveReminderBtn.addEventListener("click", saveReminder);
  }

  // Sleep Quality tracking with improved data management
  window.saveSleepQuality = function () {
    try {
      const quality = document.getElementById("sleepQuality");
      const saveMessage = document.getElementById("saveMessage");

      if (!quality) {
        showSaveMessage(
          "Could not find sleep quality input. Please try again.",
          "error"
        );
        return;
      }

      const date = new Date().toISOString().split("T")[0];
      const qualityValue = parseInt(quality.value);

      if (isNaN(qualityValue) || qualityValue < 1 || qualityValue > 5) {
        showSaveMessage(
          "Please select a valid sleep quality rating between 1 and 5.",
          "error"
        );
        return;
      }

      // Get existing history or initialize new array
      let sleepHistory = [];
      try {
        const savedHistory = localStorage.getItem("sleepHistory");
        if (savedHistory) {
          sleepHistory = JSON.parse(savedHistory);
        }
      } catch (e) {
        console.warn("Error loading sleep history:", e);
        sleepHistory = [];
      }

      // Remove any existing entry for today
      sleepHistory = sleepHistory.filter((entry) => entry.date !== date);

      // Add new entry
      sleepHistory.push({
        date: date,
        quality: qualityValue,
      });

      // Sort by date descending and keep only last 30 days
      sleepHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
      sleepHistory = sleepHistory.slice(0, 30);

      // Save to localStorage
      try {
        localStorage.setItem("sleepHistory", JSON.stringify(sleepHistory));

        // Show success message with the rating description
        const ratingDescriptions = {
          1: "Poor",
          2: "Fair",
          3: "Good",
          4: "Very Good",
          5: "Excellent",
        };

        showSaveMessage(
          `Sleep quality saved as ${ratingDescriptions[qualityValue]}! Your sleep tracking helps improve your sleep habits.`,
          "success"
        );

        // Reset select to default after successful save
        quality.selectedIndex = 0;
      } catch (storageError) {
        if (storageError.name === "QuotaExceededError") {
          // If storage is full, clear old data and try again
          localStorage.clear();
          localStorage.setItem(
            "sleepHistory",
            JSON.stringify([
              {
                date: date,
                quality: qualityValue,
              },
            ])
          );
          showSaveMessage(
            "Sleep quality saved! (Old data was cleared due to storage limits)",
            "warning"
          );
        } else {
          throw storageError;
        }
      }
    } catch (error) {
      console.error("Error saving sleep quality:", error);
      showSaveMessage(
        "There was an error saving your sleep quality. Please try again.",
        "error"
      );
    }
  };

  // Helper function to show save message
  function showSaveMessage(message, type = "success") {
    const saveMessage = document.getElementById("saveMessage");
    if (saveMessage) {
      saveMessage.textContent = message;
      saveMessage.className = `save-message ${type}`;

      // Clear message after 3 seconds
      setTimeout(() => {
        saveMessage.textContent = "";
        saveMessage.className = "save-message";
      }, 3000);
    }
  }

  // Power Nap Timer with error handling
  let napInterval;
  let timerState = "initial"; // 'initial', 'ready', 'running'

  function toggleNapTimer() {
    if (napTimer) {
      if (timerState === "initial") {
        napTimer.classList.remove("hidden");
        timerState = "ready";
        if (startNapBtn) {
          startNapBtn.innerHTML = '<i class="fas fa-play"></i> Start Power Nap';
        }
        const display = document.querySelector(".timer-display");
        if (display) {
          display.textContent = "20:00";
        }
      } else {
        napTimer.classList.add("hidden");
        timerState = "initial";
        if (napInterval) {
          clearInterval(napInterval);
          napInterval = null;
        }
      }
    }
  }

  function startPowerNap() {
    try {
      if (!startNapBtn) return;

      // Add debugging logs for Power Nap Timer
      console.log('Current timer state:', timerState);

      // Ensure proper state reset
      if (timerState === "running") {
        clearInterval(napInterval);
        napInterval = null;
        timerState = "ready";
        startNapBtn.innerHTML = '<i class="fas fa-play"></i> Start Power Nap';
        const display = document.querySelector(".timer-display");
        if (display) {
          display.textContent = "20:00";
        }
        console.log('Timer stopped and reset to ready state.');
        return;
      }

      // Check for Save Rating section presence
      const saveRatingSection = document.querySelector('.sleep-tracking');
      if (!saveRatingSection) {
        console.error('Save Rating section is missing in the HTML.');
      } else {
        console.log('Save Rating section is present.');
      }

      // Start the timer
      let timeLeft = 20 * 60; // 20 minutes in seconds
      timerState = "running";
      startNapBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Nap Timer';

      napInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const display = document.querySelector(".timer-display");
        if (display) {
          display.textContent = `${minutes}:${seconds
            .toString()
            .padStart(2, "0")}`;
        }

        if (timeLeft <= 0) {
          clearInterval(napInterval);
          napInterval = null;
          timerState = "ready";
          startNapBtn.innerHTML = '<i class="fas fa-play"></i> Start Power Nap';

          if (notificationPermission === "granted") {
            try {
              new Notification("Power Nap Complete!", {
                body: "Time to wake up refreshed!",
                icon: `${ASSETS_PATH}/sleeping calculators.png`,
              });
            } catch (error) {
              console.warn("Notification failed:", error);
              alert("Power Nap Complete! Time to wake up refreshed!");
            }
          }
        }
      }, 1000);
    } catch (error) {
      handleError(error, "Start Power Nap");
    }
  }

  // Reminder functionality
  function saveReminder() {
    try {
      const enabled = document.getElementById("reminderEnabled");
      const reminderTime = document.getElementById("reminderTime");

      if (enabled && reminderTime) {
        if (enabled.checked) {
          if ("Notification" in window) {
            Notification.requestPermission()
              .then((permission) => {
                notificationPermission = permission;
                if (permission === "granted") {
                  localStorage.setItem("reminderEnabled", "true");
                  localStorage.setItem("reminderTime", reminderTime.value);
                  alert(
                    "Reminder settings saved! You will be notified before bedtime."
                  );
                } else {
                  alert(
                    "Please allow notifications to use the reminder feature."
                  );
                }
              })
              .catch((error) => {
                handleError(error, "Notification Permission");
                alert(
                  "There was an error setting up notifications. Please try again."
                );
              });
          } else {
            alert("Your browser does not support notifications.");
          }
        } else {
          localStorage.removeItem("reminderEnabled");
          localStorage.removeItem("reminderTime");
          alert("Reminders have been disabled.");
        }
      }

      if (reminderModal) {
        reminderModal.classList.add("hidden");
      }
    } catch (error) {
      handleError(error, "Save Reminder");
    }
  }

  // Helper function to format time
  function formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  }

  function displayResults(bedtimes, recommendation, ageGroup) {
    let html = `
            <h3>Recommended Bedtimes</h3>
            <p class="recommendation-text">
                Based on your age group, you should get ${recommendation.min}-${recommendation.max} hours of sleep.
            </p>
            <div class="bedtime-options">
        `;

    bedtimes.forEach((time, index) => {
      const isRecommended = index === 1;
      html += `
                <div class="bedtime-card ${isRecommended ? "recommended" : ""}">
                    <div class="bedtime-time">${time.time}</div>
                    <div class="bedtime-details">
                        <span>${time.duration.toFixed(1)} hours</span>
                        <span>${time.cycles} sleep cycles</span>
                        ${
                          isRecommended
                            ? '<span class="recommended-badge">Recommended</span>'
                            : ""
                        }
                    </div>
                </div>
            `;
    });

    html += "</div>";

    // Add personalized tips
    html += `
            <div class="sleep-tips">
                <h4>Personalized Sleep Tips</h4>
                <ul>
                    ${sleepTips[ageGroup]
                      .map((tip) => `<li>${tip}</li>`)
                      .join("")}
                </ul>
            </div>
            <div class="sleep-tracking">
                <h4>Track Your Sleep Quality</h4>
                <div class="rating-input">
                    <label>How did you sleep last night?</label>
                    <select id="sleepQuality">
                        <option value="1">1 - Poor</option>
                        <option value="2">2 - Fair</option>
                        <option value="3">3 - Good</option>
                        <option value="4">4 - Very Good</option>
                        <option value="5">5 - Excellent</option>
                    </select>
                    <button onclick="saveSleepQuality()" class="secondary-btn">Save Rating</button>
                    <div id="saveMessage" class="save-message"></div>
                </div>
            </div>
        `;

    resultsDiv.innerHTML = html;
  }

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all animated elements
  const animatedElements = document.querySelectorAll(
    ".feature-card, .team-card, .contact-card, .timeline-item"
  );
  animatedElements.forEach((element) => observer.observe(element));

  // FAQ Accordion
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Close all other items
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove("active");
          otherItem.querySelector(".faq-answer").style.maxHeight = "0px";
        }
      });

      // Toggle current item
      item.classList.toggle("active");
      answer.style.maxHeight = isActive ? "0px" : answer.scrollHeight + "px";
    });
  });

  // Contact Form Handling
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Disable submit button and show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      formStatus.innerHTML = '';
      
      try {
        const formData = new FormData(contactForm);
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
          formStatus.innerHTML = '<div class="success-message">Message sent successfully! We will get back to you soon.</div>';
          contactForm.reset();
        } else {
          throw new Error(data.message || 'Something went wrong');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        formStatus.innerHTML = '<div class="error-message">Failed to send message. Please try again later.</div>';
      } finally {
        // Re-enable submit button and restore original text
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      }
    });
  }

  // Contact Buttons Enhancement
  const contactButtons = document.querySelectorAll(
    ".hero-button, .contact-btn"
  );
  contactButtons.forEach((btn) => {
    if (!btn.hasAttribute("href")) {
      // Only add click handler if it's not already an anchor tag
      btn.addEventListener("click", () => {
        window.location.href = "contact.html";
      });
    }
  });

  // Learn More Buttons Enhancement
  const learnMoreButtons = document.querySelectorAll(".learn-more-btn");
  learnMoreButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const feature = btn.parentElement.querySelector("h3").textContent;
      // Implement feature details modal or redirect to feature page
      console.log(`Learning more about ${feature}...`);
    });
  });

  // Support Button Enhancement
  const supportBtn = document.querySelector(".contact-support-btn");
  if (supportBtn) {
    supportBtn.addEventListener("click", () => {
      window.location.href = "contact.html";
    });
  }

  // Stats Animation
  function animateStats() {
    const stats = document.querySelectorAll(".stat-number");

    stats.forEach((stat) => {
      const targetValue = parseInt(stat.getAttribute("data-value"));
      const increment = targetValue / 50; // Divide animation into 50 steps
      let currentValue = 0;

      const updateValue = () => {
        if (currentValue < targetValue) {
          currentValue += increment;
          stat.textContent = Math.round(currentValue).toLocaleString();
          requestAnimationFrame(updateValue);
        } else {
          stat.textContent = targetValue.toLocaleString();
        }
      };

      updateValue();
    });
  }

  // Intersection Observer for Stats Animation
  const statsSection = document.querySelector(".stats-section");
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateStats();
          observer.disconnect(); // Only animate once
        }
      });
    });

    observer.observe(statsSection);
  }

  // Initialize page-specific features
  try {
    // Load saved reminder settings
    const savedReminderEnabled = localStorage.getItem("reminderEnabled");
    const savedReminderTime = localStorage.getItem("reminderTime");
    if (savedReminderEnabled === "true") {
      const reminderEnabled = document.getElementById("reminderEnabled");
      const reminderTime = document.getElementById("reminderTime");
      if (reminderEnabled && reminderTime) {
        reminderEnabled.checked = true;
        reminderTime.value = savedReminderTime || "30";
      }
    }
  } catch (error) {
    handleError(error, "Page Initialization");
  }

  // Add path handling for assets
  const BASE_URL = window.location.origin;
  const ASSETS_PATH = `${BASE_URL}/Images`;

  // Add polyfill for smooth scrolling
  if (!("scrollBehavior" in document.documentElement.style)) {
    const smoothScroll = (target) => {
      const targetPosition =
        target.getBoundingClientRect().top + window.pageYOffset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      let startTime = null;

      const animation = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, 500);
        window.scrollTo(0, run);
        if (timeElapsed < 500) requestAnimationFrame(animation);
      };

      const ease = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
      };

      requestAnimationFrame(animation);
    };

    // Apply smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) smoothScroll(target);
      });
    });
  }

  // Add CORS handling for API calls
  const fetchWithTimeout = async (resource, options = {}) => {
    const { timeout = 8000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(resource, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };
});

// Register the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}
