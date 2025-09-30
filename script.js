// EmailJS init (replace with your public key)
emailjs.init("nUhaqpucV7T70XrYE");

// Contact form
document.getElementById("contact-form").addEventListener("submit", function(e) {
  e.preventDefault();
  const status = document.getElementById("form-status");

  emailjs.sendForm("service_cjrpe74", "template_67nb6zm", this)
    .then(() => {
      status.textContent = "Message sent successfully! 🎉";
      status.style.color = "lightgreen";
      this.reset();
    }, (err) => {
      console.error(err);
      status.textContent = "Failed to send. Please try again.";
      status.style.color = "red";
    });
});

// Typing effect
const words = ["gamer 🎮", "developer 💻", "creator ✨"];
let i = 0, j = 0, current = words[0], isDeleting = false;
const typed = document.getElementById("typed");

function type() {
  typed.textContent = current.substring(0, j);

  if (!isDeleting && j < current.length) {
    j++;
    setTimeout(type, 100);
  } else if (isDeleting && j > 0) {
    j--;
    setTimeout(type, 50);
  } else {
    isDeleting = !isDeleting;
    if (!isDeleting) {
      i = (i + 1) % words.length;
      current = words[i];
    }
    setTimeout(type, 800);
  }
}
type();

// Year auto-update
document.getElementById("year").textContent = new Date().getFullYear();
