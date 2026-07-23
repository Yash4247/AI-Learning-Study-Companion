import { storageService } from './storageService';

export function getRoadmapShUrl(goalStr = '') {
  const g = (goalStr || '').toLowerCase().trim();
  if (g.includes('frontend') || g.includes('react') || g.includes('vue') || g.includes('angular') || g.includes('html') || g.includes('css') || g.includes('javascript') || g.includes('web')) {
    return 'https://roadmap.sh/frontend';
  }
  if (g.includes('backend') || g.includes('node') || g.includes('express') || g.includes('spring') || g.includes('django') || g.includes('laravel') || g.includes('golang') || g.includes('go ')) {
    return 'https://roadmap.sh/backend';
  }
  if (g.includes('fullstack') || g.includes('full stack') || g.includes('full-stack')) {
    return 'https://roadmap.sh/full-stack';
  }
  if (g.includes('ai') || g.includes('machine learning') || g.includes('data science') || g.includes('deep learning') || g.includes('ml') || g.includes('data engineer') || g.includes('prompt')) {
    return 'https://roadmap.sh/ai-data-scientist';
  }
  if (g.includes('devops') || g.includes('cloud') || g.includes('aws') || g.includes('docker') || g.includes('kubernetes') || g.includes('sysadmin')) {
    return 'https://roadmap.sh/devops';
  }
  if (g.includes('android') || g.includes('kotlin') || g.includes('flutter') || g.includes('mobile')) {
    return 'https://roadmap.sh/android';
  }
  if (g.includes('ios') || g.includes('swift')) {
    return 'https://roadmap.sh/ios';
  }
  if (g.includes('cyber') || g.includes('security') || g.includes('ethical hacking') || g.includes('infosec')) {
    return 'https://roadmap.sh/cyber-security';
  }
  if (g.includes('python')) {
    return 'https://roadmap.sh/python';
  }
  if (g.includes('java')) {
    return 'https://roadmap.sh/java';
  }
  if (g.includes('c++') || g.includes('cpp')) {
    return 'https://roadmap.sh/cpp';
  }
  if (g.includes('data structure') || g.includes('algorithm') || g.includes('dsa') || g.includes('computer science') || g.includes('cs')) {
    return 'https://roadmap.sh/computer-science';
  }
  if (g.includes('system design') || g.includes('architecture')) {
    return 'https://roadmap.sh/system-design';
  }
  
  return `https://roadmap.sh/roadmaps?q=${encodeURIComponent(goalStr)}`;
}

export function generateSubtopicsForTitle(title = '') {
  const t = title.toLowerCase();
  
  if (t.includes('html') || t.includes('semantic') || t.includes('a11y')) {
    return [
      'Semantic HTML5 structure (<header>, <main>, <article>, <footer>)',
      'Web Accessibility (a11y), ARIA attributes & screen readers',
      'Keyboard navigation, focus rings & form accessibility'
    ];
  }
  if (t.includes('css') || t.includes('flexbox') || t.includes('grid')) {
    return [
      'CSS Flexbox alignment (justify-content, align-items, flex-grow)',
      'CSS Grid container templates, gaps & implicit/explicit grids',
      'Mobile-first responsive media queries (@media breakpoints)'
    ];
  }
  if (t.includes('js') || t.includes('javascript') || t.includes('es6')) {
    return [
      'ES6+ syntax: Let/Const, Destructuring & Spread Operators',
      'Functional array helpers (map, filter, reduce, find)',
      'Scope, Closures, Hoisting & Event Loop mechanics'
    ];
  }
  if (t.includes('async') || t.includes('fetch') || t.includes('promise')) {
    return [
      'Promises syntax, resolve/reject & error handling',
      'Async / Await pattern & try-catch block wrapping',
      'Fetch API / Axios HTTP GET & POST data integration'
    ];
  }
  if (t.includes('react') || t.includes('jsx') || t.includes('component')) {
    return [
      'React JSX syntax, props passing & component modularity',
      'State management with useState & side-effects with useEffect',
      'Custom Hooks creation & Context API provider pattern'
    ];
  }
  if (t.includes('node') || t.includes('express') || t.includes('server')) {
    return [
      'Express app initialization, port listening & route definitions',
      'Custom middleware pipeline (CORS, body-parser, logger)',
      'REST API HTTP status codes & JSON payload responses'
    ];
  }
  if (t.includes('sql') || t.includes('database') || t.includes('postgres')) {
    return [
      'Relational schema design, primary keys & foreign key constraints',
      'SQL Queries: SELECT, INSERT, UPDATE, DELETE & JOIN operations',
      'Database Indexing & ACID transaction safety'
    ];
  }
  if (t.includes('docker') || t.includes('container') || t.includes('deploy')) {
    return [
      'Dockerfile creation, base images & layer optimization',
      'Docker Compose service orchestration & environment variables',
      'Cloud Deployment & Automated CI/CD pipeline triggers'
    ];
  }
  if (t.includes('git') || t.includes('github')) {
    return [
      'Git repository init, staging, commits & status inspection',
      'Branch creation, merging & conflict resolution protocols',
      'GitHub Pull Requests & collaborative code review workflows'
    ];
  }
  if (t.includes('python') || t.includes('numpy') || t.includes('pandas')) {
    return [
      'Python data structures: lists, dicts, tuples & comprehensions',
      'NumPy N-dimensional arrays, vectorization & math ops',
      'Pandas DataFrames: data cleaning, filtering & aggregation'
    ];
  }
  if (t.includes('auth') || t.includes('jwt') || t.includes('security')) {
    return [
      'Password hashing with bcrypt / argon2 algorithms',
      'JWT access & refresh token generation & verification',
      'Securing API endpoints with auth bearer middleware guards'
    ];
  }
  if (t.includes('test') || t.includes('vitest') || t.includes('jest')) {
    return [
      'Writing unit test assertions & mock function setups',
      'Component UI rendering tests & user event simulations',
      'Test coverage reporting & continuous testing integration'
    ];
  }

  const cleanTitle = title.replace(/\[.*?\]/g, '').trim();
  return [
    `Core Concepts & Theoretical Background of ${cleanTitle}`,
    `Practical Implementation & Code Examples for ${cleanTitle}`,
    `Self-Check & Hands-on Exercises for ${cleanTitle}`
  ];
}

// Helper to construct exact target number of weeks (2, 4, 6, 8 weeks)
function buildPlanWeeks(baseWeeks = [], targetWeeks = 4, goal = 'Developer') {
  const numWeeks = parseInt(targetWeeks) || 4;

  const allTopics = [];
  (baseWeeks || []).forEach(w => {
    (w.topics || []).forEach(t => allTopics.push(t));
  });

  const resultWeeks = [];

  for (let w = 1; w <= numWeeks; w++) {
    let weekTitle = `Week ${w}: ${goal} Milestone ${w}`;
    let weekDesc = `Mastering Week ${w} core concepts and hands-on milestones for ${goal}.`;

    if (numWeeks === 8) {
      const titles8 = [
        "Internet, Systems & Environment Setup",
        "Syntax, Structural Architecture & Standards",
        "UI Layout Systems, Styling & Responsive Design",
        "Core Programming Logic, Functions & State",
        "Asynchronous Data Ingestion & API Integration",
        "Framework Architecture & Modular Components",
        "Advanced System Design & Security Standards",
        "Testing Frameworks, MLOps/DevOps & Cloud Launch"
      ];
      weekTitle = `Week ${w}: ${titles8[w - 1] || 'Milestone Module'}`;
      weekDesc = `In-depth deep-dive into ${titles8[w - 1] || 'milestone topics'} for ${goal}.`;
    } else if (numWeeks === 6) {
      const titles6 = [
        "Environment Setup & Core Fundamentals",
        "Data Architecture & Execution Mechanics",
        "UI Frameworks & State Management",
        "Backend REST APIs & Server Architecture",
        "Databases, ORM & Security Protocols",
        "Automated Testing & Production Deployment"
      ];
      weekTitle = `Week ${w}: ${titles6[w - 1] || 'Milestone Module'}`;
      weekDesc = `Mastering ${titles6[w - 1] || 'core modules'} for ${goal}.`;
    } else if (numWeeks === 2) {
      const titles2 = [
        "Intensive Core Fundamentals & API Setup",
        "Advanced System Integration & Capstone Launch"
      ];
      weekTitle = `Week ${w}: ${titles2[w - 1]}`;
      weekDesc = `Accelerated intensive mastery of ${goal}.`;
    } else if (numWeeks === 4 && baseWeeks.length === 4) {
      const existingWeek = baseWeeks[w - 1];
      if (existingWeek) {
        resultWeeks.push({ ...existingWeek, weekNumber: w });
        continue;
      }
    }

    const topicsForThisWeek = [];
    for (let tIdx = 1; tIdx <= 3; tIdx++) {
      const topicOffset = ((w - 1) * 3) + (tIdx - 1);
      const existingTopic = allTopics[topicOffset % allTopics.length];
      const cleanTitleName = existingTopic ? existingTopic.title.replace(/\[.*?\]/g, '').trim() : `${goal} Module ${tIdx}`;
      
      topicsForThisWeek.push({
        id: `w${w}-${tIdx}-${Date.now()}`,
        title: w > 4 ? `[Week ${w}: Deep Dive] Advanced ${cleanTitleName}` : (existingTopic ? existingTopic.title : `${goal} Topic ${tIdx}`),
        durationMins: existingTopic ? existingTopic.durationMins : 90,
        priority: tIdx === 1 ? 'High' : (tIdx === 2 ? 'Medium' : 'High'),
        resource: existingTopic ? existingTopic.resource : 'Official Documentation',
        completed: false
      });
    }

    resultWeeks.push({
      weekNumber: w,
      title: weekTitle,
      description: weekDesc,
      topics: topicsForThisWeek
    });
  }

  return resultWeeks;
}

// Base Master Plans (sourced from official roadmap.sh standards)
const OFFICIAL_ROADMAP_SH_PLANS = {
  frontend: {
    title: "Frontend Developer Master Plan",
    roadmapUrl: "https://roadmap.sh/frontend",
    weeks: [
      {
        weekNumber: 1,
        title: "Internet & Web Fundamentals",
        description: "HTML5 semantic markup, CSS3 styling, Flexbox & Grid layouts, Responsive Design & Git basics.",
        topics: [
          { id: 'fe-1', title: 'HTML5 Semantic Elements & Accessibility (a11y)', durationMins: 90, priority: 'High', resource: 'MDN Web Docs', completed: false },
          { id: 'fe-2', title: 'CSS3 Flexbox, Grid & Mobile-First Media Queries', durationMins: 120, priority: 'High', resource: 'W3C CSS Specs', completed: false },
          { id: 'fe-3', title: 'Git & GitHub Version Control Workflow', durationMins: 90, priority: 'Medium', resource: 'Official Git Documentation', completed: false }
        ]
      },
      {
        weekNumber: 2,
        title: "JavaScript (ES6+) & DOM Manipulation",
        description: "Variables, Scope, Closures, Promises, Async/Await, Fetch API & DOM Event Handling.",
        topics: [
          { id: 'fe-4', title: 'ES6+ Syntax, Arrow Functions & Array Methods', durationMins: 120, priority: 'High', resource: 'Modern JS Tutorial', completed: false },
          { id: 'fe-5', title: 'DOM Events, Event Delegation & Web Storage API', durationMins: 90, priority: 'High', resource: 'MDN Web Storage API', completed: false },
          { id: 'fe-6', title: 'Asynchronous JS, Promises & Fetch API Integration', durationMins: 120, priority: 'High', resource: 'JavaScript.info Async', completed: false }
        ]
      },
      {
        weekNumber: 3,
        title: "React.js Framework & Modern Tooling",
        description: "Component Lifecycle, JSX, Hooks (useState, useEffect, useMemo), Vite & Tailwind CSS.",
        topics: [
          { id: 'fe-7', title: 'React Core Architecture, JSX & Custom Components', durationMins: 120, priority: 'High', resource: 'React Official Docs', completed: false },
          { id: 'fe-8', title: 'React Hooks: State, Side Effects & Context API', durationMins: 150, priority: 'High', resource: 'React Hooks Guide', completed: false },
          { id: 'fe-9', title: 'Modern Build Tools (Vite) & Tailwind CSS Styling', durationMins: 90, priority: 'Medium', resource: 'Vite & Tailwind Guide', completed: false }
        ]
      },
      {
        weekNumber: 4,
        title: "State Management, Testing & Production Launch",
        description: "Zustand / Redux Toolkit, Unit Testing with Vitest, Core Web Vitals & Vercel Deployment.",
        topics: [
          { id: 'fe-10', title: 'Global State Management (Zustand / Redux)', durationMins: 120, priority: 'Medium', resource: 'Zustand Documentation', completed: false },
          { id: 'fe-11', title: 'Component Testing with Vitest & Testing Library', durationMins: 120, priority: 'Medium', resource: 'Vitest Guide', completed: false },
          { id: 'fe-12', title: 'Core Web Vitals Optimization & Vercel Deployment', durationMins: 150, priority: 'High', resource: 'Web.dev Optimization', completed: false }
        ]
      }
    ]
  },

  backend: {
    title: "Backend Developer Master Plan",
    roadmapUrl: "https://roadmap.sh/backend",
    weeks: [
      {
        weekNumber: 1,
        title: "OS, Terminal & Networking Basics",
        description: "Linux CLI administration, Process Management, HTTP/HTTPS Protocols, Headers & CORS.",
        topics: [
          { id: 'be-1', title: 'Linux CLI & Terminal Commands', durationMins: 90, priority: 'High', resource: 'Linux Command Guide', completed: false },
          { id: 'be-2', title: 'HTTP/2, Rest APIs, Headers & Network Security', durationMins: 120, priority: 'High', resource: 'HTTP Protocol Guide', completed: false },
          { id: 'be-3', title: 'Git Branching & Code Review Workflows', durationMins: 90, priority: 'Medium', resource: 'Git Branching Guide', completed: false }
        ]
      },
      {
        weekNumber: 2,
        title: "Backend Language & API Architecture",
        description: "Node.js / Express or Python / FastAPI, Asynchronous I/O, Controller-Service Pattern.",
        topics: [
          { id: 'be-4', title: 'Express API Server Setup & Middleware Routing', durationMins: 120, priority: 'High', resource: 'Express.js Documentation', completed: false },
          { id: 'be-5', title: 'RESTful API Standards & Input Validation', durationMins: 120, priority: 'High', resource: 'REST API Best Practices', completed: false },
          { id: 'be-6', title: 'Authentication (JWT, OAuth2 & Password Hashing)', durationMins: 150, priority: 'High', resource: 'Auth Security Guide', completed: false }
        ]
      },
      {
        weekNumber: 3,
        title: "Databases (SQL & NoSQL) & ORM",
        description: "PostgreSQL schema design, Indexing, Transactions, Joins, Prisma ORM & MongoDB.",
        topics: [
          { id: 'be-7', title: 'Relational Database Design (PostgreSQL) & Normalization', durationMins: 150, priority: 'High', resource: 'PostgreSQL Manual', completed: false },
          { id: 'be-8', title: 'SQL Queries, Joins, Indexes & Transactions', durationMins: 120, priority: 'High', resource: 'SQL Performance Guide', completed: false },
          { id: 'be-9', title: 'Prisma ORM & Migration Workflows', durationMins: 120, priority: 'Medium', resource: 'Prisma Docs', completed: false }
        ]
      },
      {
        weekNumber: 4,
        title: "Caching, CI/CD & Cloud Deployment",
        description: "Redis caching, Docker containerization, GitHub Actions CI/CD pipelines, and cloud hosting.",
        topics: [
          { id: 'be-10', title: 'Redis Caching & In-Memory Rate Limiting', durationMins: 120, priority: 'Medium', resource: 'Redis University', completed: false },
          { id: 'be-11', title: 'Containerizing Backend Services with Docker', durationMins: 150, priority: 'High', resource: 'Docker Docs', completed: false },
          { id: 'be-12', title: 'CI/CD Automated Deployments on AWS / Render', durationMins: 180, priority: 'High', resource: 'GitHub Actions Guide', completed: false }
        ]
      }
    ]
  },

  fullstack: {
    title: "Full Stack Developer Master Plan",
    roadmapUrl: "https://roadmap.sh/full-stack",
    weeks: [
      {
        weekNumber: 1,
        title: "Frontend Architecture & Modern React",
        description: "HTML5/CSS3, JavaScript ES6+, React.js UI Components & Vite build system.",
        topics: [
          { id: 'fs-1', title: 'React Component Design & Interactive State', durationMins: 120, priority: 'High', resource: 'React Docs', completed: false },
          { id: 'fs-2', title: 'Tailwind CSS Layouts & Responsive UI Design', durationMins: 90, priority: 'Medium', resource: 'Tailwind CSS Guide', completed: false },
          { id: 'fs-3', title: 'Asynchronous API Consumption with Axios / React Query', durationMins: 120, priority: 'High', resource: 'TanStack Query Docs', completed: false }
        ]
      },
      {
        weekNumber: 2,
        title: "Backend API Server & Authentication",
        description: "Node.js, Express REST API development, JWT Authentication & Security.",
        topics: [
          { id: 'fs-4', title: 'Express API Server Architecture & Middleware', durationMins: 120, priority: 'High', resource: 'Node.js & Express Guide', completed: false },
          { id: 'fs-5', title: 'JWT Authentication & Protected Route Guards', durationMins: 150, priority: 'High', resource: 'JWT Security Standard', completed: false },
          { id: 'fs-6', title: 'CORS, Security Headers & Input Sanitization', durationMins: 90, priority: 'Medium', resource: 'OWASP Security Top 10', completed: false }
        ]
      },
      {
        weekNumber: 3,
        title: "Database Integration & Caching",
        description: "PostgreSQL, Prisma ORM, Database Migrations & Redis caching.",
        topics: [
          { id: 'fs-7', title: 'PostgreSQL Relational Schema & Table Relations', durationMins: 150, priority: 'High', resource: 'PostgreSQL Docs', completed: false },
          { id: 'fs-8', title: 'Prisma ORM Queries & Migration Scripts', durationMins: 120, priority: 'High', resource: 'Prisma Guide', completed: false },
          { id: 'fs-9', title: 'Redis Cache Integration for High-Performance Queries', durationMins: 90, priority: 'Medium', resource: 'Redis Docs', completed: false }
        ]
      },
      {
        weekNumber: 4,
        title: "Full Stack Integration, Docker & Deployment",
        description: "Docker Compose full stack orchestration, CI/CD pipeline, and Cloud deployment.",
        topics: [
          { id: 'fs-10', title: 'Connecting React Frontend & Express Backend', durationMins: 120, priority: 'High', resource: 'Full Stack Guide', completed: false },
          { id: 'fs-11', title: 'Docker Compose for Multi-Container Apps', durationMins: 150, priority: 'High', resource: 'Docker Compose Specs', completed: false },
          { id: 'fs-12', title: 'Full Stack Capstone Deployment to Vercel & Render', durationMins: 210, priority: 'High', resource: 'Deployment Checklist', completed: false }
        ]
      }
    ]
  },

  ai: {
    title: "AI & Data Scientist Master Plan",
    roadmapUrl: "https://roadmap.sh/ai-data-scientist",
    weeks: [
      {
        weekNumber: 1,
        title: "Python, Mathematics & Data Analysis",
        description: "Python data structures, Linear Algebra, Statistics, NumPy & Pandas.",
        topics: [
          { id: 'ai-1', title: 'Python for Data Science (NumPy & Pandas Manipulation)', durationMins: 120, priority: 'High', resource: 'Python Data Science Handbook', completed: false },
          { id: 'ai-2', title: 'Linear Algebra, Probability & Descriptive Statistics', durationMins: 120, priority: 'High', resource: 'Khan Academy Math', completed: false },
          { id: 'ai-3', title: 'Data Visualization with Matplotlib & Seaborn', durationMins: 90, priority: 'Medium', resource: 'Seaborn Documentation', completed: false }
        ]
      },
      {
        weekNumber: 2,
        title: "Classical Machine Learning Algorithms",
        description: "Scikit-Learn, Supervised Learning (Regression/Classification), Unsupervised Clustering.",
        topics: [
          { id: 'ai-4', title: 'Supervised Learning: Linear/Logistic Regression & Decision Trees', durationMins: 150, priority: 'High', resource: 'Scikit-Learn Guide', completed: false },
          { id: 'ai-5', title: 'Unsupervised Learning: K-Means Clustering & PCA', durationMins: 120, priority: 'Medium', resource: 'ML Algorithm Guide', completed: false },
          { id: 'ai-6', title: 'Model Evaluation: Cross-Validation, Precision/Recall & ROC', durationMins: 120, priority: 'High', resource: 'ML Evaluation Metrics', completed: false }
        ]
      },
      {
        weekNumber: 3,
        title: "Deep Learning & Neural Networks",
        description: "PyTorch / TensorFlow, Artificial Neural Networks (ANN), CNNs for Vision, RNNs.",
        topics: [
          { id: 'ai-7', title: 'PyTorch Fundamentals: Tensors, Autograd & Neural Layers', durationMins: 150, priority: 'High', resource: 'PyTorch Official Tutorials', completed: false },
          { id: 'ai-8', title: 'Convolutional Neural Networks (CNNs) & Computer Vision', durationMins: 150, priority: 'High', resource: 'CS231n Vision Guide', completed: false },
          { id: 'ai-9', title: 'Hyperparameter Tuning & Regularization (Dropout/Batch Normalization)', durationMins: 90, priority: 'Medium', resource: 'Deep Learning Specialization', completed: false }
        ]
      },
      {
        weekNumber: 4,
        title: "Generative AI, LLMs & MLOps Deployment",
        description: "Transformers, HuggingFace, RAG Vector Search (FAISS/Pinecone) & FastAPI MLOps.",
        topics: [
          { id: 'ai-10', title: 'Attention Mechanism, Transformers & HuggingFace Models', durationMins: 150, priority: 'High', resource: 'HuggingFace Course', completed: false },
          { id: 'ai-11', title: 'Building Retrieval-Augmented Generation (RAG) with Vector DBs', durationMins: 180, priority: 'High', resource: 'LangChain & Vector DB Guide', completed: false },
          { id: 'ai-12', title: 'Deploying AI Models with FastAPI & Docker Containers', durationMins: 180, priority: 'High', resource: 'FastAPI MLOps Guide', completed: false }
        ]
      }
    ]
  },

  devops: {
    title: "DevOps Engineer Master Plan",
    roadmapUrl: "https://roadmap.sh/devops",
    weeks: [
      {
        weekNumber: 1,
        title: "Linux Administration & Shell Scripting",
        description: "Linux system administration, File Permissions, Bash Scripting & Networking.",
        topics: [
          { id: 'do-1', title: 'Linux User Management, Systemd Services & File Permissions', durationMins: 120, priority: 'High', resource: 'Linux Admin Handbook', completed: false },
          { id: 'do-2', title: 'Automated Bash Scripting & System Health Automation', durationMins: 120, priority: 'High', resource: 'Bash Guide', completed: false },
          { id: 'do-3', title: 'Networking Fundamentals: DNS, SSH Keys, Firewalls & NGINX', durationMins: 120, priority: 'High', resource: 'NGINX Docs', completed: false }
        ]
      },
      {
        weekNumber: 2,
        title: "Containerization & CI/CD Automation",
        description: "Docker, Docker Compose, Multi-stage builds & GitHub Actions Pipelines.",
        topics: [
          { id: 'do-4', title: 'Docker Container Architecture & Image Optimization', durationMins: 150, priority: 'High', resource: 'Docker Manual', completed: false },
          { id: 'do-5', title: 'Multi-Container Orchestration with Docker Compose', durationMins: 120, priority: 'High', resource: 'Docker Compose Guide', completed: false },
          { id: 'do-6', title: 'Building Automated CI/CD Pipelines with GitHub Actions', durationMins: 150, priority: 'High', resource: 'GitHub Actions Docs', completed: false }
        ]
      },
      {
        weekNumber: 3,
        title: "Infrastructure as Code (IaC) & Cloud Provisioning",
        description: "Terraform HCL, AWS EC2/S3/VPC, and Ansible Configuration Management.",
        topics: [
          { id: 'do-7', title: 'Terraform HCL Syntax, Providers & State Management', durationMins: 150, priority: 'High', resource: 'HashiCorp Terraform Docs', completed: false },
          { id: 'do-8', title: 'AWS Cloud Architecture: VPC, EC2 Instances & Security Groups', durationMins: 180, priority: 'High', resource: 'AWS Cloud Guide', completed: false },
          { id: 'do-9', title: 'Ansible Playbooks for Automated Server Configuration', durationMins: 120, priority: 'Medium', resource: 'Ansible Docs', completed: false }
        ]
      },
      {
        weekNumber: 4,
        title: "Kubernetes Orchestration & Observability",
        description: "Kubernetes Pods/Deployments/Services, Helm Charts, Prometheus & Grafana Monitoring.",
        topics: [
          { id: 'do-10', title: 'Kubernetes Cluster Architecture: Pods, Deployments & Ingress', durationMins: 180, priority: 'High', resource: 'Kubernetes Docs', completed: false },
          { id: 'do-11', title: 'Helm Charts Package Manager for Kubernetes App Release', durationMins: 120, priority: 'Medium', resource: 'Helm Specs', completed: false },
          { id: 'do-12', title: 'Monitoring & Alerting with Prometheus & Grafana Dashboards', durationMins: 150, priority: 'High', resource: 'Prometheus & Grafana Docs', completed: false }
        ]
      }
    ]
  }
};

export const aiService = {
  // 1. Generate Learning Path (Live Gemini AI if API Key Set, Else Offline roadmap.sh Blueprint)
  async generateLearningPath({ goal, skills, hoursPerWeek, durationWeeks }) {
    const apiKey = storageService.getApiKey();
    const roadmapUrl = getRoadmapShUrl(goal);
    const targetNumWeeks = parseInt(durationWeeks) || 4;

    // 🌟 A TO Z GEMINI AI GENERATION (When API Key is Present)
    if (apiKey && apiKey.trim().length > 5) {
      try {
        const prompt = `You are an expert AI curriculum architect. Generate a highly structured, comprehensive EXACTLY ${targetNumWeeks}-week master learning path for the course/goal: "${goal}".
Student current background/skills: "${skills}". Available time: ${hoursPerWeek} hours/week.
Return ONLY valid JSON (no markdown formatting, no commentary) in this exact schema:
{
  "title": "${goal} (${targetNumWeeks}-Week Live Gemini AI Plan)",
  "goal": "${goal}",
  "durationWeeks": ${targetNumWeeks},
  "roadmapUrl": "${roadmapUrl}",
  "roadmapSource": "Generated Live via Gemini AI API",
  "weeks": [
    {
      "weekNumber": 1,
      "title": "Week 1 Title",
      "description": "Milestone description",
      "topics": [
        { "id": "w1-1", "title": "Topic name", "durationMins": 90, "priority": "High", "resource": "Official Documentation", "completed": false }
      ]
    }
  ]
}`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          console.warn('Gemini API returned status:', response.status, errData);
          throw new Error(`Gemini API Error ${response.status}: ${errData?.error?.message || 'Invalid API Key'}`);
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedJson);

        parsed.roadmapUrl = roadmapUrl;
        parsed.durationWeeks = targetNumWeeks;
        parsed.roadmapSource = "Live Gemini 1.5 Flash AI Engine";
        parsed.weeks = buildPlanWeeks(parsed.weeks || [], targetNumWeeks, goal);
        return parsed;
      } catch (err) {
        console.warn('Live Gemini API call failed or key error. Falling back to offline roadmap.sh engine:', err);
      }
    }

    // 🌐 OFFLINE MODE (Uses roadmap.sh reference blueprints)
    const gLower = (goal || '').toLowerCase();
    let matchedKey = null;
    if (gLower.includes('frontend') || gLower.includes('react') || gLower.includes('html')) matchedKey = 'frontend';
    else if (gLower.includes('backend') || gLower.includes('node') || gLower.includes('express')) matchedKey = 'backend';
    else if (gLower.includes('fullstack') || gLower.includes('full stack')) matchedKey = 'fullstack';
    else if (gLower.includes('ai') || gLower.includes('machine learning') || gLower.includes('data science')) matchedKey = 'ai';
    else if (gLower.includes('devops') || gLower.includes('cloud') || gLower.includes('docker')) matchedKey = 'devops';

    if (matchedKey && OFFICIAL_ROADMAP_SH_PLANS[matchedKey]) {
      const plan = OFFICIAL_ROADMAP_SH_PLANS[matchedKey];
      const builtWeeks = buildPlanWeeks(plan.weeks, targetNumWeeks, goal);

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            title: `${goal} (${targetNumWeeks}-Week Master Plan)`,
            goal,
            durationWeeks: targetNumWeeks,
            roadmapUrl: plan.roadmapUrl,
            roadmapSource: "roadmap.sh Benchmark Blueprint",
            weeks: builtWeeks
          });
        }, 600);
      });
    }

    // Default Offline Plan Fallback
    return new Promise((resolve) => {
      setTimeout(() => {
        const defaultBase = OFFICIAL_ROADMAP_SH_PLANS.frontend.weeks;
        const builtWeeks = buildPlanWeeks(defaultBase, targetNumWeeks, goal);

        resolve({
          title: `${goal} (${targetNumWeeks}-Week Master Plan)`,
          goal,
          durationWeeks: targetNumWeeks,
          roadmapUrl: roadmapUrl,
          roadmapSource: "roadmap.sh Benchmark Blueprint",
          weeks: builtWeeks
        });
      }, 700);
    });
  },

  // 2. Parse Course Syllabus (Live Gemini Multimodal Vision if API Key Set, Else Offline)
  async parseSyllabus(rawText, fileName = "Uploaded Course Syllabus", imageBase64 = null) {
    const apiKey = storageService.getApiKey();
    const cleanCourseTitle = fileName.includes('.') ? fileName.split('.')[0].toUpperCase() : fileName;

    // 🌟 A TO Z GEMINI AI MULTIMODAL VISION SYLLABUS PARSING
    if (apiKey && apiKey.trim().length > 5) {
      try {
        const parts = [];
        const promptText = `You are an AI syllabus extraction engine. Analyze this course syllabus ${imageBase64 ? 'image screenshot' : 'text'} for course "${cleanCourseTitle}" and extract all Units, Modules, Topics, and Contact Hours into JSON.
Return ONLY valid JSON in the exact format:
{
  "courseTitle": "${cleanCourseTitle}",
  "modules": [
    {
      "moduleNumber": 1,
      "title": "Unit Name / Module Title",
      "weight": "Hours / Weightage",
      "topics": [
        { "id": "s-1", "title": "Specific Topic Title from image", "durationMins": 90, "priority": "High" }
      ]
    }
  ]
}`;
        parts.push({ text: promptText });

        if (imageBase64 && imageBase64.startsWith('data:image/')) {
          const mimeType = imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';'));
          const base64Data = imageBase64.split(',')[1];
          parts.push({
            inlineData: {
              mimeType,
              data: base64Data
            }
          });
        } else if (rawText && !rawText.startsWith('[Image Uploaded')) {
          parts.push({ text: `Syllabus Text:\n${rawText}` });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts }] })
        });

        if (!response.ok) {
          throw new Error(`Gemini API Error ${response.status}`);
        }

        const data = await response.json();
        const resText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanedJson = resText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedJson);
        parsed.id = 'syl-' + Date.now();
        parsed.uploadedAt = new Date().toLocaleDateString();
        parsed.isLiveGeminiVision = Boolean(imageBase64);
        return parsed;
      } catch (err) {
        console.warn('Gemini API syllabus parsing failed, using smart offline extractor:', err);
      }
    }

    // Offline Syllabus Parser
    return new Promise((resolve) => {
      setTimeout(() => {
        const isImageUpload = Boolean(imageBase64);
        const parsed = {
          id: 'syl-' + Date.now(),
          courseTitle: cleanCourseTitle,
          uploadedAt: new Date().toLocaleDateString(),
          isImageOCR: isImageUpload,
          modules: [
            {
              moduleNumber: 1,
              title: isImageUpload ? "Module 1: Image Extracted Syllabus Core" : "Module 1: Fundamental Concepts & Theories",
              weight: "25%",
              topics: [
                { id: `s-1`, title: isImageUpload ? "Image OCR Topic 1: Core Principles" : "Introduction & Key Definitions", durationMins: 60, priority: "High" },
                { id: `s-2`, title: isImageUpload ? "Image OCR Topic 2: Fundamental Methodologies" : "Core Frameworks & Principles", durationMins: 90, priority: "Medium" }
              ]
            },
            {
              moduleNumber: 2,
              title: "Module 2: Practical Applications & Case Studies",
              weight: "35%",
              topics: [
                { id: `s-3`, title: "Problem Solving Protocols & Algorithms", durationMins: 120, priority: "High" },
                { id: `s-4`, title: "Midterm Exam Preparation & Practice Review", durationMins: 150, priority: "High" }
              ]
            },
            {
              moduleNumber: 3,
              title: "Module 3: Advanced Topics & Capstone Project",
              weight: "40%",
              topics: [
                { id: `s-5`, title: "Advanced Architecture Patterns", durationMins: 120, priority: "High" },
                { id: `s-6`, title: "Final Project Submission & Exam Defense", durationMins: 180, priority: "High" }
              ]
            }
          ]
        };
        resolve(parsed);
      }, 1200);
    });
  },

  // 3. Generate Daily Study Schedule - Consecutive Days 1 through (totalWeeks * 7)
  generateScheduleFromTopics(topics, dailyHours = 2, totalWeeks = 4) {
    const schedule = [];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weeksCount = parseInt(totalWeeks) || 4;
    const totalDaysCount = weeksCount * 7;

    let topicIndex = 0;

    for (let dayNum = 1; dayNum <= totalDaysCount; dayNum++) {
      const weekNum = Math.ceil(dayNum / 7);
      const dayInWeek = ((dayNum - 1) % 7) + 1;
      const dayOfWeekName = daysOfWeek[(dayNum - 1) % 7];
      const displayDay = `Week ${weekNum} - Day ${dayNum} (${dayOfWeekName})`;

      const startHour = 17; // 5 PM
      const formatTime = (h, m) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h > 12 ? h - 12 : h;
        return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
      };

      let currentTopic = null;

      if (dayInWeek === 6) {
        const prevTopic = topics[Math.min(topicIndex - 1, topics.length - 1)] || topics[0];
        const cleanPrevName = prevTopic ? prevTopic.title.replace(/\[.*?\]/g, '').trim() : `Week ${weekNum}`;
        currentTopic = {
          title: `[Week ${weekNum}: Consolidation] ${cleanPrevName} Review & Debugging`,
          durationMins: 60,
          priority: 'Medium',
          resource: 'Practice & Code Review',
          subtopics: [
            `Review key concepts learned during Week ${weekNum}`,
            `Refactor and clean up code examples from this week`,
            `Fix bugs & optimize solution performance`
          ]
        };
      } else if (dayInWeek === 7) {
        currentTopic = {
          title: `[Week ${weekNum}: Capstone] Week ${weekNum} Self-Check Quiz & Hands-on Challenge`,
          durationMins: 90,
          priority: 'High',
          resource: 'Self-Assessment & Project Defense',
          subtopics: [
            `Complete Week ${weekNum} self-assessment quiz`,
            `Build mini hands-on exercise integrating all topics`,
            `Prepare questions for upcoming week modules`
          ]
        };
      } else {
        if (topicIndex < topics.length) {
          currentTopic = topics[topicIndex];
          topicIndex++;
        } else {
          const baseTopic = topics[(dayNum - 1) % topics.length];
          const cleanBaseName = baseTopic ? baseTopic.title.replace(/\[.*?\]/g, '').trim() : 'Concept';
          currentTopic = {
            title: `[Week ${weekNum}: Deep Dive] Advanced ${cleanBaseName} Practice`,
            durationMins: 90,
            priority: 'Medium',
            resource: 'Official Documentation',
            subtopics: [
              `Deep dive into advanced edge cases`,
              `Practice real-world coding problems`,
              `Benchmark and test execution speed`
            ]
          };
        }
      }

      const durationMins = currentTopic.durationMins || 90;
      const endHour = startHour + Math.floor(durationMins / 60);
      const endMin = durationMins % 60;

      const subtopicTitles = currentTopic.subtopics && currentTopic.subtopics.length > 0 
        ? currentTopic.subtopics 
        : generateSubtopicsForTitle(currentTopic.title);

      schedule.push({
        id: `sched-${Date.now()}-${dayNum}`,
        topicId: currentTopic.id || `t-${dayNum}`,
        title: currentTopic.title,
        day: displayDay,
        dayNumber: dayNum,
        weekNumber: weekNum,
        timeSlot: `${formatTime(startHour, 0)} - ${formatTime(endHour, endMin)}`,
        durationMins: durationMins,
        priority: currentTopic.priority || 'Medium',
        resource: currentTopic.resource || 'Official Guide',
        completed: false,
        status: 'pending',
        subtopics: subtopicTitles.map((stTitle, sIdx) => ({
          id: `sub-${Date.now()}-${dayNum}-${sIdx}`,
          title: typeof stTitle === 'string' ? stTitle : (stTitle.title || 'Subtopic'),
          completed: false
        }))
      });
    }

    return schedule;
  },

  // 4. Adaptive Re-scheduler Engine (Live Gemini AI if API Key Set, Else Offline)
  async adaptivelyReschedule(currentSchedule, missedTaskIds, maxDailyHours = 2) {
    const apiKey = storageService.getApiKey();

    if (apiKey && apiKey.trim().length > 5) {
      try {
        const missedTasks = currentSchedule.filter(t => missedTaskIds.includes(t.id));
        const prompt = `Rebalance this student's schedule after missing ${missedTaskIds.length} tasks: ${JSON.stringify(missedTasks.map(t => t.title))}. Max daily study hours: ${maxDailyHours}.
Return ONLY valid JSON with structure: { "summary": "AI Reschedule Summary string" }`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedJson);
          
          // Rebalance locally
          const maxMinsPerDay = maxDailyHours * 60;
          const completedTasks = currentSchedule.filter(t => t.completed && !missedTaskIds.includes(t.id));
          const missedList = currentSchedule.filter(t => missedTaskIds.includes(t.id) || (!t.completed && t.status === 'overdue'));
          const pendingUpcoming = currentSchedule.filter(t => !t.completed && !missedTaskIds.includes(t.id));

          const uncompletedQueue = [...missedList, ...pendingUpcoming];
          let startDay = completedTasks.length > 0 ? Math.max(...completedTasks.map(t => t.dayNumber)) : 1;
          let currentDayMins = 0;
          let dayCounter = startDay;

          const rebalancedSchedule = [...completedTasks];

          uncompletedQueue.forEach((task) => {
            if (currentDayMins + task.durationMins > maxMinsPerDay && currentDayMins > 0) {
              dayCounter++;
              currentDayMins = 0;
            }

            const isOriginallyMissed = missedTaskIds.includes(task.id);
            
            rebalancedSchedule.push({
              ...task,
              id: isOriginallyMissed ? `resched-${task.id}` : task.id,
              day: `Day ${dayCounter} (Gemini AI Rebalanced)`,
              dayNumber: dayCounter,
              status: isOriginallyMissed ? 'rescheduled' : 'pending',
              completed: false
            });

            currentDayMins += task.durationMins;
          });

          return {
            updatedSchedule: rebalancedSchedule,
            summary: parsed.summary || `Live Gemini AI re-balanced ${missedTaskIds.length} missed sessions over ${dayCounter} study days!`
          };
        }
      } catch (err) {
        console.warn('Gemini AI reschedule failed, using local engine:', err);
      }
    }

    // Offline Rebalancer
    return new Promise((resolve) => {
      setTimeout(() => {
        const maxMinsPerDay = maxDailyHours * 60;
        
        const completedTasks = currentSchedule.filter(t => t.completed && !missedTaskIds.includes(t.id));
        const missedTasks = currentSchedule.filter(t => missedTaskIds.includes(t.id) || (!t.completed && t.status === 'overdue'));
        const pendingUpcoming = currentSchedule.filter(t => !t.completed && !missedTaskIds.includes(t.id));

        const uncompletedQueue = [...missedTasks, ...pendingUpcoming];
        
        let startDay = completedTasks.length > 0 ? Math.max(...completedTasks.map(t => t.dayNumber)) : 1;
        let currentDayMins = 0;
        let dayCounter = startDay;

        const rebalancedSchedule = [...completedTasks];

        uncompletedQueue.forEach((task) => {
          if (currentDayMins + task.durationMins > maxMinsPerDay && currentDayMins > 0) {
            dayCounter++;
            currentDayMins = 0;
          }

          const isOriginallyMissed = missedTaskIds.includes(task.id);
          
          rebalancedSchedule.push({
            ...task,
            id: isOriginallyMissed ? `resched-${task.id}` : task.id,
            day: `Day ${dayCounter} (Adjusted)`,
            dayNumber: dayCounter,
            status: isOriginallyMissed ? 'rescheduled' : 'pending',
            completed: false
          });

          currentDayMins += task.durationMins;
        });

        resolve({
          updatedSchedule: rebalancedSchedule,
          summary: `Successfully re-balanced ${missedTaskIds.length} missed sessions over ${dayCounter} total study days without exceeding ${maxDailyHours} hours/day.`
        });
      }, 1000);
    });
  },

  // 5. Generate AI Quiz & Flashcards for Focus Hub (Live Gemini AI if API Key Set, Else Offline)
  async generateTopicRetention(topicTitle) {
    const apiKey = storageService.getApiKey();

    if (apiKey && apiKey.trim().length > 5) {
      try {
        const prompt = `Generate retention flashcards and a practice quiz for the study topic: "${topicTitle}".
Return ONLY valid JSON in exact format:
{
  "topic": "${topicTitle}",
  "flashcards": [
    { "question": "Question 1", "answer": "Answer 1" },
    { "question": "Question 2", "answer": "Answer 2" },
    { "question": "Question 3", "answer": "Answer 3" }
  ],
  "quiz": [
    {
      "question": "Quiz Question 1?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0
    },
    {
      "question": "Quiz Question 2?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1
    }
  ]
}`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          return JSON.parse(cleanedJson);
        }
      } catch (err) {
        console.warn('Gemini API topic retention generation failed, using fallback:', err);
      }
    }

    // Offline Mode Fallback
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          topic: topicTitle,
          flashcards: [
            { question: `What is the core purpose of ${topicTitle}?`, answer: `To establish structured workflows and solve foundational execution challenges.` },
            { question: `What is a common best practice when implementing ${topicTitle}?`, answer: `Always break down complex tasks into modular components and verify outputs early.` },
            { question: `How do you measure success in ${topicTitle}?`, answer: `Through clean execution, comprehensive testing, and benchmark performance.` }
          ],
          quiz: [
            {
              question: `Which of the following best describes the primary advantage of ${topicTitle}?`,
              options: [
                "Improves predictability and structured learning speed",
                "Completely eliminates the need for practice",
                "Replaces underlying core programming logic",
                "Decreases system performance by 50%"
              ],
              correctIndex: 0
            },
            {
              question: `When applying ${topicTitle}, what should be done if a sub-task fails?`,
              options: [
                "Ignore the error and move forward",
                "Inspect failure tracebacks and re-balance workload dynamically",
                "Delete the entire project",
                "Wait 3 weeks before retrying"
              ],
              correctIndex: 1
            }
          ]
        });
      }, 600);
    });
  },

  // 6. Generate Live Gemini AI Sunday Retention Quiz
  async generateSundayQuiz(weekNumber = 1, taskTitle = '') {
    const apiKey = storageService.getApiKey();
    const cleanName = taskTitle.replace(/\[.*?\]/g, '').trim();

    if (apiKey && apiKey.trim().length > 5) {
      try {
        const prompt = `Generate a 3-question retention quiz for Week ${weekNumber} Sunday Assessment covering: "${cleanName}".
Return ONLY valid JSON in exact format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Detailed explanation of correct answer."
    },
    {
      "id": 2,
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 1,
      "explanation": "Detailed explanation of correct answer."
    },
    {
      "id": 3,
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Detailed explanation of correct answer."
    }
  ]
}`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedJson);
          return parsed.questions || null;
        }
      } catch (err) {
        console.warn('Gemini Sunday Quiz generation failed, using roadmap.sh benchmark quiz:', err);
      }
    }
    return null; // Signals SundayQuizModal to use roadmap.sh benchmark questions
  },

  // 7. V2: Post-Topic Completion Quiz Generator
  async generateTopicCompletionQuiz(topicTitle) {
    const apiKey = storageService.getApiKey();
    const cleanName = topicTitle.replace(/\[.*?\]/g, '').trim();

    if (apiKey && apiKey.trim().length > 5) {
      try {
        const prompt = `Create a 3-question quick mastery check quiz for completing the topic: "${cleanName}".
Return ONLY valid JSON in exact schema:
{
  "topic": "${cleanName}",
  "questions": [
    {
      "id": 1,
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Explanation for why Option A is correct."
    },
    {
      "id": 2,
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 1,
      "explanation": "Explanation for why Option B is correct."
    },
    {
      "id": 3,
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 2,
      "explanation": "Explanation for why Option C is correct."
    }
  ]
}`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          return JSON.parse(cleanedJson);
        }
      } catch (err) {
        console.warn('Gemini topic quiz generation error, fallback to offline:', err);
      }
    }

    // Offline Fallback Topic Completion Quiz
    return {
      topic: cleanName,
      questions: [
        {
          id: 1,
          question: `What is the key takeaway from studying ${cleanName}?`,
          options: [
            `Understanding core architectural principles and practical implementation of ${cleanName}`,
            "Avoiding documentation and guessing code syntax",
            "Deleting test coverage assertions",
            "Disabling error logging in production"
          ],
          correct: 0,
          explanation: `Mastering ${cleanName} involves understanding core concepts and applying them cleanly.`
        },
        {
          id: 2,
          question: `How do you verify your work after completing ${cleanName}?`,
          options: [
            "By running verification tests and inspecting output logs",
            "By closing the terminal without checking results",
            "By skipping review sessions",
            "By hardcoding static values"
          ],
          correct: 0,
          explanation: "Gathering empirical verification ensures fix correctness and prevents regressions."
        },
        {
          id: 3,
          question: `What is a best practice when building projects with ${cleanName}?`,
          options: [
            "Break tasks into sub-topics and maintain modular code structure",
            "Write monolithic code in a single file",
            "Ignore system warnings",
            "Bypass error handling"
          ],
          correct: 0,
          explanation: "Modular structure improves codebase maintainability and readability."
        }
      ]
    };
  },

  // 8. V2: Handwritten Notes OCR Pipeline (Gemini Multimodal Vision)
  async parseHandwrittenNotes(rawText, fileName = "Handwritten Notes", imageBase64 = null) {
    const apiKey = storageService.getApiKey();
    const cleanTitle = fileName.includes('.') ? fileName.split('.')[0].toUpperCase() : fileName;

    if (apiKey && apiKey.trim().length > 5) {
      try {
        const parts = [];
        const promptText = `You are an expert OCR & Educational AI Specialist. Analyze this handwritten notes/whiteboard image for subject "${cleanTitle}". Transcribe handwriting accurately, extract key formulas, definitions, and topics, and format into structured modules and flashcards.
Return ONLY valid JSON in exact schema:
{
  "courseTitle": "${cleanTitle} (Handwritten OCR)",
  "rawTranscribedText": "Full clean text transcription from handwriting...",
  "keyTakeaways": ["Key concept 1", "Key formula 2", "Key definition 3"],
  "modules": [
    {
      "moduleNumber": 1,
      "title": "Transcribed Topic / Module Title",
      "weight": "Core Focus",
      "topics": [
        { "id": "hn-1", "title": "Specific Handwritten Concept", "durationMins": 60, "priority": "High" }
      ]
    }
  ],
  "flashcards": [
    { "question": "Question based on handwritten formula/note?", "answer": "Explanation from notes" }
  ]
}`;
        parts.push({ text: promptText });

        if (imageBase64 && imageBase64.startsWith('data:image/')) {
          const mimeType = imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';'));
          const base64Data = imageBase64.split(',')[1];
          parts.push({
            inlineData: { mimeType, data: base64Data }
          });
        } else if (rawText) {
          parts.push({ text: `Handwritten Notes Raw Text:\n${rawText}` });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts }] })
        });

        if (response.ok) {
          const data = await response.json();
          const resText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedJson = resText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedJson);
          parsed.id = 'hn-' + Date.now();
          parsed.uploadedAt = new Date().toLocaleDateString();
          parsed.isHandwrittenOCR = true;
          return parsed;
        }
      } catch (err) {
        console.warn('Handwritten OCR error, using offline extractor:', err);
      }
    }

    // Offline Handwritten Notes Fallback
    return {
      id: 'hn-' + Date.now(),
      courseTitle: `${cleanTitle} (Handwritten Notes)`,
      uploadedAt: new Date().toLocaleDateString(),
      isHandwrittenOCR: Boolean(imageBase64),
      rawTranscribedText: rawText || "Handwritten notebook notes transcribed offline.",
      keyTakeaways: [
        "Handwritten Core Concepts & Definitions",
        "Key Formulas & Structural Methods",
        "Practice Exercises & Exam Target Notes"
      ],
      modules: [
        {
          moduleNumber: 1,
          title: "Handwritten Section 1: Transcribed Fundamentals",
          weight: "30%",
          topics: [
            { id: "hn-1", title: "Handwritten Concept: Definitions & Scope", durationMins: 60, priority: "High" },
            { id: "hn-2", title: "Handwritten Formula & Key Equation Review", durationMins: 90, priority: "High" }
          ]
        },
        {
          moduleNumber: 2,
          title: "Handwritten Section 2: Applied Examples & Proofs",
          weight: "40%",
          topics: [
            { id: "hn-3", title: "Worked Example Problems & Solutions", durationMins: 90, priority: "Medium" }
          ]
        }
      ],
      flashcards: [
        { question: `What is the primary formula recorded in ${cleanTitle}?`, answer: "The transcribed relationship between core components." },
        { question: "How should you apply this handwritten concept in practice?", answer: "Follow the step-by-step method outlined in the notes." }
      ]
    };
  },

  // 9. V2: AI Mentor Chat with Learning History Context
  async chatWithAIMentor(userMessage, conversationHistory = [], learningContext = {}) {
    const apiKey = storageService.getApiKey();

    const systemContext = `You are Apex Mentor AI, a supportive, elite academic coach & study companion.
Student Context:
- Target Goal: ${learningContext.goal || 'Software Engineering'}
- Current Skill Tier: ${learningContext.skills || 'Intermediate'}
- Active Roadmap: ${learningContext.roadmapTitle || 'Master Plan'} (${learningContext.durationWeeks || 4} Weeks)
- Study Streak: 🔥 ${learningContext.streak || 0} Days
- Total Study Time: ⏱️ ${learningContext.totalMinutes || 0} Minutes
- Completed Sessions: ✅ ${learningContext.completedSessions || 0}
- Current Level: ⚡ Level ${learningContext.level || 1} (${learningContext.totalXP || 0} XP)

Respond concisely (2-3 paragraphs max), encouragingly, and with clear actionable advice. Format output in clean Markdown.`;

    if (apiKey && apiKey.trim().length > 5) {
      try {
        const contents = [];

        // Add history
        conversationHistory.slice(-6).forEach(msg => {
          contents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          });
        });

        // Add current user message with system context prefix if empty
        contents.push({
          role: 'user',
          parts: [{ text: `[System Context: ${systemContext}]\n\nUser Question: ${userMessage}` }]
        });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          return reply;
        }
      } catch (err) {
        console.warn('Gemini Mentor Chat error, using intelligent offline response:', err);
      }
    }

    // Intelligent Offline Mentor Response
    const msgLower = userMessage.toLowerCase();
    if (msgLower.includes('streak') || msgLower.includes('habit')) {
      return `🔥 Great job maintaining your **${learningContext.streak || 0}-Day Streak**! Consistency is the single biggest factor in long-term mastery. Keep logging daily sessions—even 25 minutes a day keeps your streak alive!`;
    }
    if (msgLower.includes('behind') || msgLower.includes('reschedule') || msgLower.includes('missed')) {
      return ` don't worry if you fell behind on a few sessions! You can click the **"I Fell Behind" AI Re-Scheduler** button in your Daily Planner tab. It will automatically re-balance your missed sessions into your available study hours.`;
    }
    if (msgLower.includes('quiz') || msgLower.includes('test')) {
      return `🎯 To prepare for your quizzes: review your **Sub-topics Checklists** in the Daily Planner, and use the **Spaced Repetition Flashcards** in the Focus Study Hub. Testing yourself active-recall style gives 3x higher retention than passive reading!`;
    }
    return `👋 Hello! As your **Apex AI Mentor**, I'm keeping track of your **${learningContext.goal || 'Study Goal'}** roadmap. You've logged **${learningContext.completedSessions || 0} sessions** (${learningContext.totalMinutes || 0} mins) so far. What specific topic or concept would you like me to explain today?`;
  },

  // 10. V2: Predictive Analytics (Target Date vs Pace Estimation)
  predictTargetDateAnalytics(schedule = [], history = [], durationWeeks = 4) {
    const totalTasks = schedule.length || (durationWeeks * 7);
    const completedTasks = schedule.filter(t => t.completed).length;

    const startDate = history.length > 0 && history[history.length - 1].dateStr
      ? new Date(history[history.length - 1].dateStr)
      : new Date();

    const today = new Date();
    const daysElapsed = Math.max(1, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));

    const currentPacePerDay = (completedTasks / daysElapsed); // tasks per day
    const remainingTasks = Math.max(0, totalTasks - completedTasks);

    const targetDaysTotal = durationWeeks * 7;
    const targetDate = new Date(startDate);
    targetDate.setDate(targetDate.getDate() + targetDaysTotal);

    let projectedDaysRemaining = currentPacePerDay > 0 ? Math.ceil(remainingTasks / currentPacePerDay) : remainingTasks * 2;
    const projectedCompletionDate = new Date(today);
    projectedCompletionDate.setDate(projectedCompletionDate.getDate() + projectedDaysRemaining);

    const requiredPacePerDay = targetDaysTotal > daysElapsed ? (remainingTasks / (targetDaysTotal - daysElapsed)) : remainingTasks;

    let probabilityScore = 85;
    let riskLevel = 'Low Risk (On Track)';
    let statusColor = 'var(--accent-emerald)';

    if (currentPacePerDay === 0 && completedTasks < totalTasks) {
      probabilityScore = 25;
      riskLevel = 'High Risk (No Recent Activity)';
      statusColor = 'var(--accent-rose)';
    } else if (currentPacePerDay < requiredPacePerDay * 0.7) {
      probabilityScore = 45;
      riskLevel = 'Moderate Risk (Behind Schedule)';
      statusColor = 'var(--accent-amber)';
    } else if (currentPacePerDay >= requiredPacePerDay) {
      probabilityScore = 95;
      riskLevel = 'Optimal Pace (Ahead of Target)';
      statusColor = 'var(--accent-emerald)';
    }

    return {
      totalTasks,
      completedTasks,
      remainingTasks,
      daysElapsed,
      targetDaysTotal,
      currentPacePerDay: currentPacePerDay.toFixed(2),
      requiredPacePerDay: requiredPacePerDay.toFixed(2),
      targetDateStr: targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      projectedDateStr: projectedCompletionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      probabilityScore,
      riskLevel,
      statusColor,
      isAhead: projectedCompletionDate <= targetDate
    };
  }
};

