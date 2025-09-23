// Typing Effect
const typed = new Typed('.typing', {
  strings: ["Gamer 🎮", "Developer 💻", "Creator 🚀"],
  typeSpeed: 80,
  backSpeed: 50,
  loop: true
});

// EmailJS init
(function() {
  emailjs.init("YOUR_USER_ID"); // Replace with your EmailJS User ID
})();

const form = document.getElementById("contact-form");
form.addEventListener("submit", function(e) {
  e.preventDefault();

  emailjs.sendForm("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", this)
    .then(() => {
      document.getElementById("form-status").textContent = "✅ Message sent!";
      form.reset();
    }, (err) => {
      document.getElementById("form-status").textContent = "❌ Failed to send.";
      console.error(err);
    });
});
