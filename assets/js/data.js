/* ==========================================================================
   CONTENT MANAGER — Shoyaib Hasan
   Everything you can edit lives in this one file. No database needed.

   • site     → name, links, e-mail (used by the header, footer and terminal)
   • skills   → the four "modules" on the home page
   • projects → project cards + automatic detail pages (project.html?id=...)
   • posts    → journal entries + automatic article pages (post.html?id=...)

   Images go in assets/images/ and are referenced like:
     image: "assets/images/my-project.jpg"
   ========================================================================== */

window.PORTFOLIO = {
  /* ---------- Site-wide info ---------- */
  site: {
    author: "Shoyaib Hasan",
    handle: "shoyaib",
    brandSuffix: ".dev",
    role: "ICE student · builder · explorer",
    university: "Daffodil International University",
    location: "Bangladesh",
    email: "tamim4960@example.com",
    github: "Shtamim",               // GitHub username (used for links + live repo feed)
    legacy: "TeamPirates 🔱",
  },

  /* ---------- Home page: toolkit modules ---------- */
  skills: [
    {
      icon: "⌘",
      title: "Cybersecurity",
      text: "Networking fundamentals, Linux, reconnaissance, web security and hands-on lab practice.",
      tags: ["Nmap", "Burp Suite", "Kali Linux"," Wireshark", "Metasploit"],
    },
    {
      icon: "⌁",
      title: "Programming",
      text: "Building logic and practical tools with scripting, web technologies and backend fundamentals.",
      tags: ["Python", "JavaScript", "C / C++"],
    },
    {
      icon: "⌬",
      title: "Electronics & Robotics",
      text: "Microcontrollers, sensors, communication modules and prototype-driven learning.",
      tags: ["Arduino", "ESP32", "Embedded"],
    },
    {
      icon: "▤",
      title: "Web & Tools",
      text: "Responsive interfaces, APIs, version control and practical developer workflows.",
      tags: ["HTML / CSS", "Node.js", "Git"],
    },
  ],

  /* ---------- Projects ----------
     category: "embedded" | "robotics" | "software" | "security"            */
  projects: [
    {
      id: "strikescanx",
      title: "StrikeScanX — Radar Prototype",
      category: "embedded",
      status: "Prototype",
      year: "2026",
      image: "assets/images/radar.svg",
      summary: "An Arduino Nano-based ultrasonic radar concept with servo scanning and a visual display.",
      description:
        "StrikeScanX is an early-warning radar-style prototype built to explore distance sensing, servo control and real-time visualization. The project combines an ultrasonic sensor with an Arduino Nano and a scanning servo. A laptop visualization can be used to plot detected objects across the sweep.",
      stack: ["Arduino Nano", "HC-SR04", "SG90 Servo", "Processing"],
      links: [{ label: "Source code", url: "https://github.com/Shtamim" }],
    },
    {
      id: "wireless-rc-boat",
      title: "Wireless RC Boat",
      category: "robotics",
      status: "In progress",
      year: "2026",
      image: "assets/images/boat.svg",
      summary: "A radio-controlled boat concept using microcontrollers, wireless communication and motor control.",
      description:
        "A hands-on exploration of remote control systems, radio links, servo steering and DC motor propulsion. The design investigates a Nano-based transmitter and an ESP32 receiver with an NRF24L01 PA+LNA module.",
      stack: ["Arduino Nano", "ESP32", "NRF24L01", "Servo", "DC Motor"],
      links: [{ label: "Source code", url: "https://github.com/Shtamim" }],
    },
    {
      id: "calculator-app",
      title: "Calculator Web App ",
      category: "software",
      status: "Live build",
      year: "2024",
      image: "assets/images/calculator.jpg",
      summary: "A static, HTML,CSS,JS powered calculator app with basic arithmetic functions and a clean interface.",
      description:
        "This calculator app is intentionally built without a framework or backend. HTML, CSS and JavaScript are used to create a simple, responsive interface that performs basic arithmetic operations. The app is designed to be lightweight and easy to use, making it accessible on any device with a web browser.",
      stack: ["HTML", "CSS", "JavaScript"],
      links: [{ label: "GitHub profile", url: "https://github.com/Shtamim" }],
    },
    {
  id: "esp32-robotic-car",
  title: "ESP32 WiFi-Controlled Robotic Car",
  category: "robotics",
  status: "Live build",
  year: "2025",
  image: "assets/images/robotic-car.png",
  summary: "An ESP32-powered robotic car controlled wirelessly through a WiFi-based interface.",
  description:
    "A DIY robotic vehicle powered by the ESP32 microcontroller, featuring wireless WiFi control for real-time movement and navigation. The system uses a motor driver to control the DC motors, while the ESP32 handles wireless communication and movement commands. Designed as a compact robotics platform with potential for future upgrades such as obstacle avoidance, sensor integration, and autonomous navigation.",
  stack: ["ESP32", "Arduino IDE", "C++", "WiFi", "L298N Motor Driver", "DC Motors"],
  links: [
    { label: "GitHub profile", url: "https://github.com/Shtamim" }
  ],
},
  ],

  /* ---------- Journal posts ----------
     Each string in `content` becomes one paragraph.                        */
  posts: [
    {
      id: "welcome",
      date: "2026-11-20",
      category: "Site notes",
      title: "A new home for experiments and build logs",
      excerpt:
        "Why I’m turning this portfolio into a living record of projects, technical notes and things I learn along the way.",
      content: [
        "A portfolio should be more than a static list of skills. I want this space to document the process: the prototypes that work, the ones that fail, the ideas that need another attempt, and the lessons in between.",
        "The new version keeps the site lightweight and easy to maintain. It uses plain HTML, CSS and JavaScript, with project and journal content stored in one data file. GitHub Pages handles hosting, so there is no separate server or database to maintain.",
        "Expect notes from cybersecurity labs, embedded builds, robotics experiments and software projects as the work develops.",
      ],
    },
  ],
};
