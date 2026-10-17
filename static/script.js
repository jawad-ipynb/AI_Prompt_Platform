fetch("http://127.0.0.1:5000/login")
fetch("http://127.0.0.1:5000/signup")
fetch("http://127.0.0.1:5000/add_prompt")
fetch("http://127.0.0.1:5000/predict")
fetch("http://127.0.0.1:5000/feed")
.then(res => res.json())
.then(data => {
    console.log(data); // show prompts
});
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. EMAIL / PHONE TAB TOGGLE ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabSlider = document.getElementById('tab-slider');
    const tabContents = document.querySelectorAll('.tab-content');
    let isPhoneActive = false;

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button styling
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Slide the indicator
            isPhoneActive = btn.dataset.tab === 'phone';
            if (isPhoneActive) {
                tabSlider.classList.add('right');
            } else {
                tabSlider.classList.remove('right');
            }

            // Show correct input
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.classList.add('hidden');
            });

            const targetInput = document.querySelector(`.tab-content[data-input="${btn.dataset.tab}"]`);
            if (targetInput) {
                targetInput.classList.remove('hidden');
                // Slight delay for animation trigger
                setTimeout(() => targetInput.classList.add('active'), 10);
            }
            
            clearErrors();
        });
    });

    // --- 2. UTILITY FUNCTIONS ---
    function showError(message) {
        const errDiv = document.getElementById('login-error');
        errDiv.innerHTML = `<span class="flex items-center gap-2"><iconify-icon icon="lucide:alert-circle" class="text-sm shrink-0"></iconify-icon>${message}</span>`;
        errDiv.classList.remove('hidden');
    }

    function clearErrors() {
        const errDiv = document.getElementById('login-error');
        errDiv.classList.add('hidden');
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    }

    function setInputError(inputEl) {
        if(inputEl) inputEl.closest('.input-group')?.classList.add('input-error');
    }

    // Live clearing of errors when user types
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            clearErrors();
        });
    });

    function simulateLoading(btnId) {
        const btn = document.getElementById(btnId);
        btn.classList.add('is-loading');
        return new Promise(resolve => setTimeout(() => {
            btn.classList.remove('is-loading');
            resolve();
        }, 1500)); // Simulate network request
    }

    // --- 3. FORM VALIDATION & SUBMISSION ---
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearErrors();

        const email = document.getElementById('login-email').value.trim();
        const phone = document.getElementById('login-phone').value.trim();
        const password = document.getElementById('login-password').value;

        // Dynamic Validation based on active tab
        if (isPhoneActive) {
            if (!phone) {
                showError('Phone number is required.');
                setInputError(document.getElementById('login-phone'));
                return;
            }
            if (!/^\+?\d{7,15}$/.test(phone)) {
                showError('Please enter a valid phone number (7-15 digits).');
                setInputError(document.getElementById('login-phone'));
                return;
            }
        } else {
            if (!email) {
                showError('Email address is required.');
                setInputError(document.getElementById('login-email'));
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showError('Please enter a valid email address.');
                setInputError(document.getElementById('login-email'));
                return;
            }
        }

        if (!password) {
            showError('Password is required.');
            setInputError(document.getElementById('login-password'));
            return;
        }
        if (password.length < 6) {
            showError('Password must be at least 6 characters.');
            setInputError(document.getElementById('login-password'));
            return;
        }

        // Simulate API Call
        await simulateLoading('login-btn');
        
        // Success Action (Replace with actual backend redirect)
        alert(`Login Successful! (Simulated)\nCredentials: ${isPhoneActive ? phone : email}`);
        
    });

});
// ========== DATA (from dolly_15k.csv sample + custom) ==========
const mlCategories = [
    { name: 'Open QA', slug: 'open_qa', icon: 'lucide:message-circle', color: 'bg-blue-50 text-blue-600 border-blue-200', desc: 'Open-ended questions' },
    { name: 'Closed QA', slug: 'closed_qa', icon: 'lucide:book-open', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', desc: 'Context-based QA' },
    { name: 'Classification', slug: 'classification', icon: 'lucide:layers', color: 'bg-purple-50 text-purple-600 border-purple-200', desc: 'Categorize items' },
    { name: 'Information Extraction', slug: 'information_extraction', icon: 'lucide:file-search', color: 'bg-amber-50 text-amber-600 border-amber-200', desc: 'Extract specific data' },
    { name: 'Brainstorming', slug: 'brainstorming', icon: 'lucide:lightbulb', color: 'bg-yellow-50 text-yellow-600 border-yellow-200', desc: 'Generate ideas' },
    { name: 'General QA', slug: 'general_qa', icon: 'lucide:help-circle', color: 'bg-sky-50 text-sky-600 border-sky-200', desc: 'General knowledge' },
    { name: 'Summarization', slug: 'summarization', icon: 'lucide:file-text', color: 'bg-rose-50 text-rose-600 border-rose-200', desc: 'Summarize text' },
    { name: 'Creative Writing', slug: 'creative_writing', icon: 'lucide:pen-tool', color: 'bg-orange-50 text-orange-600 border-orange-200', desc: 'Creative content' },
];

const prompts = [
    {
        id: 1, title: 'When did Virgin Australia start operating?',
        desc: 'Context-based question about Virgin Australia airline history with detailed reference text.',
        prompt: 'When did Virgin Australia start operating?', context: 'Virgin Australia, the trading name of Virgin Australia Airlines Pty Ltd, is an Australian-based airline. It is the largest airline by fleet size to use the Virgin brand. It commenced services on 31 August 2000 as Virgin Blue, with two aircraft on a single route.',
        category: 'closed_qa', likes: 47, copies: 312, comments: [{user:'Sarah K.', text:'Great QA prompt!', time:'2h ago'},{user:'Ali M.', text:'Very accurate extraction', time:'5h ago'}],
        author: 'Jawad Ahmad', authorImg: 'jawad-1', time: '2 days ago', userId: null, saved: false
    },
    {
        id: 2, title: 'Which is a species of fish: Tope or Rope?',
        desc: 'Binary classification prompt distinguishing between a fish species and a non-fish word.',
        prompt: 'Which is a species of fish? Tope or Rope', context: '',
        category: 'classification', likes: 23, copies: 189, comments: [{user:'Zoya F.', text:'Clean classification example', time:'1d ago'}],
        author: 'Khadija Ahmad', authorImg: 'khadija-2', time: '3 days ago', userId: null, saved: false
    },
    {
        id: 3, title: 'Why can camels survive for long without water?',
        desc: 'Open-ended question about camel biology and survival mechanisms.',
        prompt: 'Why can camels survive for long without water?', context: '',
        category: 'open_qa', likes: 56, copies: 423, comments: [{user:'Sadia A.', text:'Good open QA sample', time:'3h ago'},{user:'Bilal R.', text:'Useful for testing', time:'1d ago'}],
        author: 'Ayesha Saeed', authorImg: 'ayesha-3', time: '1 day ago', userId: null, saved: false
    },
    {
        id: 4, title: 'Alice\'s parents have three daughters',
        desc: 'Trick question testing logical reasoning — the answer is in the question itself.',
        prompt: 'Alice\'s parents have three daughters: Amy, Jessy, and what\'s the name of the third daughter?', context: '',
        category: 'open_qa', likes: 89, copies: 678, comments: [{user:'Hina T.', text:'Classic riddle! Love it', time:'4h ago'}],
        author: 'Sadia Abbasi', authorImg: 'sadia-4', time: '5 days ago', userId: null, saved: false
    },
    {
        id: 5, title: 'Tomoaki Komorida birth date extraction',
        desc: 'Extract specific information from a detailed biographical text about a Japanese footballer.',
        prompt: 'When was Tomoaki Komorida born?', context: 'Komorida was born in Kumamoto Prefecture on July 10, 1981. After graduating from high school, he joined the J1 League club Avispa Fukuoka in 2000...',
        category: 'information_extraction', likes: 34, copies: 245, comments: [],
        author: 'Jawad Ahmad', authorImg: 'jawad-5', time: '4 days ago', userId: null, saved: false
    },
    {
        id: 6, title: 'Chess stalemate rules explanation',
        desc: 'Extract whether having more pieces at stalemate means winning, from chess rules context.',
        prompt: 'If I have more pieces at the time of stalemate, have I won?', context: 'Stalemate is a situation in chess where the player whose turn it is to move is not in check and has no legal move. Stalemate results in a draw...',
        category: 'information_extraction', likes: 41, copies: 298, comments: [{user:'Usman K.', text:'Clear extraction task', time:'6h ago'}],
        author: 'Zoya Fatima', authorImg: 'zoya-6', time: '6 days ago', userId: null, saved: false
    },
    {
        id: 7, title: 'Lollapalooza festival details extraction',
        desc: 'Multi-part information extraction about location, founder, and description from reference text.',
        prompt: 'Given a reference text about Lollapalooza, where does it take place, who started it and what is it?', context: 'Lollapalooza is an annual American four-day music festival held in Grant Park in Chicago...',
        category: 'closed_qa', likes: 28, copies: 167, comments: [],
        author: 'Khadija Ahmad', authorImg: 'khadija-7', time: '1 week ago', userId: null, saved: false
    },
    {
        id: 8, title: 'Unique curtain tie backs ideas',
        desc: 'Brainstorming prompt for creative DIY curtain tie back ideas using household items.',
        prompt: 'What are some unique curtain tie backs that you can make yourself?', context: '',
        category: 'brainstorming', likes: 67, copies: 534, comments: [{user:'Ayesha S.', text:'So creative!', time:'2d ago'},{user:'Farhan J.', text:'Used 3 of these ideas already', time:'3d ago'}],
        author: 'Ayesha Saeed', authorImg: 'ayesha-8', time: '3 days ago', userId: null, saved: false
    },
    {
        id: 9, title: 'What is a dispersive prism?',
        desc: 'Summarize the concept of a dispersive prism from a detailed optics explanation.',
        prompt: 'What is a dispersive prism?', context: 'In optics, a dispersive prism is an optical prism that is used to disperse light, that is, to separate light into its spectral components...',
        category: 'summarization', likes: 19, copies: 134, comments: [],
        author: 'Sadia Abbasi', authorImg: 'sadia-9', time: '5 days ago', userId: null, saved: false
    },
    {
        id: 10, title: 'String vs Percussion: Cantaro, Gudok',
        desc: 'Classify musical instruments into string or percussion categories.',
        prompt: 'Identify which instrument is string or percussion: Cantaro, Gudok', context: '',
        category: 'classification', likes: 15, copies: 98, comments: [],
        author: 'Jawad Ahmad', authorImg: 'jawad-10', time: '1 week ago', userId: null, saved: false
    },
    {
        id: 11, title: 'Top 5 golf equipment companies',
        desc: 'Brainstorming prompt to generate a list of leading golf equipment brands.',
        prompt: 'Give me the top 5 golf equipment company names.', context: '',
        category: 'brainstorming', likes: 22, copies: 156, comments: [],
        author: 'Khadija Ahmad', authorImg: 'khadija-11', time: '4 days ago', userId: null, saved: false
    },
    {
        id: 12, title: 'Michael Phelps Olympic record',
        desc: 'Open QA about the most Olympic gold medals won in history.',
        prompt: 'What individual has won the most Olympic gold medals in the history of the games?', context: '',
        category: 'open_qa', likes: 73, copies: 567, comments: [{user:'Zoya F.', text:'Goat! 🐐', time:'1d ago'}],
        author: 'Zoya Fatima', authorImg: 'zoya-12', time: '2 days ago', userId: null, saved: false
    },
    {
        id: 13, title: 'LinkedIn summarization',
        desc: 'Summarize what LinkedIn does from a comprehensive company description.',
        prompt: 'Please summarize what Linkedin does.', context: 'LinkedIn is a business and employment-focused social media platform that works through websites and mobile apps. It launched on May 5, 2003...',
        category: 'summarization', likes: 38, copies: 278, comments: [],
        author: 'Ayesha Saeed', authorImg: 'ayesha-13', time: '6 days ago', userId: null, saved: false
    },
    {
        id: 14, title: 'Inception movie discussion scene',
        desc: 'Creative writing prompt generating a dialogue between two actors discussing the movie Inception.',
        prompt: 'Write a scene between two actors discussing movie Inception', context: '',
        category: 'creative_writing', likes: 95, copies: 812, comments: [{user:'Jawad A.', text:'The output is amazing!', time:'3h ago'},{user:'Sadia A.', text:'Perfect creative writing sample', time:'8h ago'},{user:'Hina T.', text:'Used this as reference', time:'1d ago'}],
        author: 'Sadia Abbasi', authorImg: 'sadia-14', time: '1 day ago', userId: null, saved: false
    },
    {
        id: 15, title: 'REST API explanation',
        desc: 'General QA providing a comprehensive explanation of REST API architecture.',
        prompt: 'What is REST API?', context: '',
        category: 'general_qa', likes: 82, copies: 689, comments: [{user:'Khadija A.', text:'Helped me understand REST!', time:'4h ago'}],
        author: 'Jawad Ahmad', authorImg: 'jawad-15', time: '3 days ago', userId: null, saved: false
    },
    {
        id: 16, title: 'Dinosaur lips research summary',
        desc: 'General QA about whether dinosaurs had lips, referencing recent scientific research.',
        prompt: 'Did dinosaurs have lips?', context: '',
        category: 'general_qa', likes: 54, copies: 423, comments: [],
        author: 'Zoya Fatima', authorImg: 'zoya-16', time: '5 days ago', userId: null, saved: false
    },
    {
        id: 17, title: 'Lamborghini owner & Huracan models extraction',
        desc: 'Complex information extraction: identify owner and list all Huracan motorsport variants.',
        prompt: 'Extract the owner of Lamborghini and a listing of the different types of Huracan cars that Lamborghini has produced for its Motorsport division.', context: 'Automobili Lamborghini S.p.A. is an Italian manufacturer of luxury sports cars... Lamborghini Motorsport Division Squadra Corse produces GT3 cars...',
        category: 'information_extraction', likes: 31, copies: 201, comments: [],
        author: 'Khadija Ahmad', authorImg: 'khadija-17', time: '1 week ago', userId: null, saved: false
    },
    {
        id: 18, title: 'Slavery reparations summary with costs',
        desc: 'Summarize arguments for slavery reparations and anticipated costs from a detailed text.',
        prompt: 'Using examples taken from the text give me a summary of the main arguments in favour of slavery reparations in the United States and the anticipated cost of enacting such reparations', context: 'Slavery ended in the United States in 1865...',
        category: 'summarization', likes: 26, copies: 178, comments: [],
        author: 'Ayesha Saeed', authorImg: 'ayesha-18', time: '6 days ago', userId: null, saved: false
    },
    {
        id: 19, title: 'Why Syd Barrett left Pink Floyd',
        desc: 'Open QA about the reasons behind Syd Barrett leaving the band Pink Floyd.',
        prompt: 'Why did Syd Barrett leave Pink Floyd?', context: '',
        category: 'open_qa', likes: 44, copies: 334, comments: [{user:'Sadia A.', text:'Sad story, well explained', time:'2d ago'}],
        author: 'Sadia Abbasi', authorImg: 'sadia-19', time: '4 days ago', userId: null, saved: false
    },
    {
        id: 20, title: 'Pet cat and pet bird warning',
        desc: 'Creative writing prompt generating a paragraph about why having both cats and birds is problematic.',
        prompt: 'Write a short paragraph about why you should not have both a pet cat and a pet bird.', context: '',
        category: 'creative_writing', likes: 37, copies: 267, comments: [],
        author: 'Jawad Ahmad', authorImg: 'jawad-20', time: '5 days ago', userId: null, saved: false
    },
    {
        id: 21, title: 'Transportation items classification',
        desc: 'Classify which items from a mixed list are useful for transportation.',
        prompt: 'Which of the following is useful for transportation: a glass of wine, a lamp, a train, an iced cube tray, a plane, a bicycle, an apple and a scooter.', context: '',
        category: 'classification', likes: 18, copies: 123, comments: [],
        author: 'Zoya Fatima', authorImg: 'zoya-21', time: '1 week ago', userId: null, saved: false
    },
    {
        id: 22, title: 'How to start running guide',
        desc: 'General QA providing practical advice for beginners wanting to start running.',
        prompt: 'How do I start running?', context: '',
        category: 'general_qa', likes: 61, copies: 489, comments: [{user:'Khadija A.', text:'Started running because of this!', time:'1d ago'}],
        author: 'Khadija Ahmad', authorImg: 'khadija-22', time: '3 days ago', userId: null, saved: false
    },
    {
        id: 23, title: 'Rock climbing harness types summary',
        desc: 'Summarize different types of harnesses used in rock climbing from detailed text.',
        prompt: 'Provide me a list of the different types of harnesses used in rock climbing', context: 'Different types of climbing warrant particular features for harnesses...',
        category: 'summarization', likes: 14, copies: 87, comments: [],
        author: 'Ayesha Saeed', authorImg: 'ayesha-23', time: '1 week ago', userId: null, saved: false
    },
    {
        id: 24, title: 'Family rules for healthy relationships',
        desc: 'Brainstorming prompt to generate family rules that promote healthy relationships.',
        prompt: 'Think of some family rules to promote a healthy family relationship', context: '',
        category: 'brainstorming', likes: 49, copies: 378, comments: [{user:'Sadia A.', text:'Printed this for my family!', time:'2d ago'}],
        author: 'Sadia Abbasi', authorImg: 'sadia-24', time: '4 days ago', userId: null, saved: false
    },
];

// ========== STATE ==========
let currentUser = null;
let registeredUsers = [
    { name: 'Jawad Ahmad', email: 'jawad@szabist.edu', password: '123456' },
    { name: 'Zoya Fatima', email: 'zoya@szabist.edu', password: '123456' },
    { name: 'Ayesha Saeed', email: 'ayesha@szabist.edu', password: '123456' },
    { name: 'Khadija Ahmad', email: 'khadija@szabist.edu', password: '123456' },
    { name: 'Sadia Abbasi', email: 'sadia@szabist.edu', password: '123456' },
];
let activeCategory = null;
let visibleCount = 9;
let likedPrompts = new Set();
let savedPrompts = new Set();
let commentTargetId = null;
let currentPage = 'home';

// ========== ML CLASSIFICATION (Khadija's Module) ==========
function classifyPrompt(text) {
    const t = text.toLowerCase();
    const scores = {};
    mlCategories.forEach(c => scores[c.slug] = 0);

    // Keyword-based classification heuristic (simulates trained ML model)
    const keywords = {
        open_qa: ['who', 'what', 'when', 'where', 'why', 'how', 'did', 'does', 'is', 'are', 'can', 'which'],
        closed_qa: ['according to', 'from the text', 'given', 'based on', 'reference', 'passage', 'context says'],
        classification: ['which is', 'classify', 'identify which', 'category', 'type of', 'sort', 'group'],
        information_extraction: ['extract', 'list', 'find', 'name', 'owner', 'who was', 'when was', 'where does'],
        brainstorming: ['list', 'ideas', 'some', 'give me', 'think of', 'suggest', 'recommend', 'examples'],
        general_qa: ['what is', 'explain', 'definition', 'rest api', 'process', 'concept', 'understanding'],
        summarization: ['summarize', 'summary', 'main points', 'brief', 'condensed', 'key arguments', 'overview'],
        creative_writing: ['write a', 'scene', 'story', 'paragraph', 'dialogue', 'creative', 'imagine', 'fiction'],
    };

    for (const [cat, kws] of Object.entries(keywords)) {
        kws.forEach(kw => {
            if (t.includes(kw)) scores[cat] += kw.split(' ').length;
        });
    }

    // Context presence boosts closed_qa and information_extraction
    if (t.length > 200 || document.getElementById('prompt-context')?.value?.trim()) {
        scores.closed_qa += 2;
        scores.information_extraction += 2;
        scores.summarization += 1;
    }

    // Question mark boosts QA types
    if (t.includes('?')) {
        scores.open_qa += 2;
        scores.closed_qa += 1;
    }

    // Pick highest score
    let best = 'open_qa';
    let bestScore = 0;
    for (const [cat, score] of Object.entries(scores)) {
        if (score > bestScore) { bestScore = score; best = cat; }
    }
    return best;
}

function getCategoryInfo(slug) {
    return mlCategories.find(c => c.slug === slug) || mlCategories[0];
}

// ========== NAVIGATION ==========
function navigateTo(page) {
    document.querySelectorAll('[id^="page-"]').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById('page-' + page);
    if (target) {
        target.classList.remove('hidden');
        currentPage = page;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (page === 'browse') { filterPrompts(); renderBrowseCatFilters(); }
    if (page === 'categories') { renderCategories(); }
    if (page === 'trending') { renderTrending(); }
    if (page === 'saved') { renderSaved(); }
    if (page === 'my-prompts') { renderMyPrompts(); }
}

// ========== RENDER: CATEGORIES (Khadija's Module) ==========
let selectedCategoryPage = null;

function renderCategories() {
    const grid = document.getElementById('category-grid');
    grid.innerHTML = mlCategories.map(c => {
        const count = prompts.filter(p => p.category === c.slug).length;
        const isActive = selectedCategoryPage === c.slug;
        return `
        <button onclick="selectCategoryPage('${c.slug}')" class="group flex flex-col items-start gap-2 p-5 rounded-xl border transition-all text-left ${
            isActive
                ? 'border-stone-900 bg-stone-900 text-white shadow-lg shadow-stone-900/10'
                : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm text-stone-600'
        }">
            <div class="flex items-center justify-between w-full">
                <div class="w-10 h-10 ${isActive ? 'bg-white/10' : c.color.split(' ').slice(0,2).join(' ')} rounded-lg flex items-center justify-center">
                    <iconify-icon icon="${c.icon}" class="text-lg ${isActive ? 'text-white' : ''}"></iconify-icon>
                </div>
                <span class="text-lg font-semibold ${isActive ? 'text-white' : 'text-stone-300'}">${count}</span>
            </div>
            <div>
                <div class="text-sm font-semibold">${c.name}</div>
                <div class="text-xs ${isActive ? 'text-stone-300' : 'text-stone-400'}">${c.desc}</div>
            </div>
        </button>`;
    }).join('');

    if (selectedCategoryPage) {
        const filtered = prompts.filter(p => p.category === selectedCategoryPage);
        const cat = getCategoryInfo(selectedCategoryPage);
        document.getElementById('category-prompts-title').textContent = `${cat.name} Prompts (${filtered.length})`;
        document.getElementById('category-prompts-grid').innerHTML = filtered.map(p => renderPromptCard(p)).join('');
        document.getElementById('category-prompts-section').classList.remove('hidden');
    } else {
        document.getElementById('category-prompts-section').classList.add('hidden');
    }
}

function selectCategoryPage(slug) {
    selectedCategoryPage = selectedCategoryPage === slug ? null : slug;
    renderCategories();
}

function clearCategorySelection() {
    selectedCategoryPage = null;
    renderCategories();
}

// ========== RENDER: PROMPT CARD ==========
function renderPromptCard(p) {
    const cat = getCategoryInfo(p.category);
    const isLiked = likedPrompts.has(p.id);
    const isSaved = savedPrompts.has(p.id);
    return `
    <div class="group bg-white border border-stone-200 rounded-2xl p-5 hover:shadow-md hover:border-stone-300 transition-all cursor-pointer" onclick="openDetail(${p.id})">
        <div class="flex items-start justify-between mb-3">
            <span class="inline-flex items-center gap-1 ${cat.color} border text-[11px] font-medium px-2 py-0.5 rounded-md">
                <iconify-icon icon="${cat.icon}" class="text-[10px]"></iconify-icon>
                ${cat.name}
            </span>
            <button onclick="event.stopPropagation(); toggleSave(${p.id})" class="w-7 h-7 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-colors">
                <iconify-icon icon="${isSaved ? 'lucide:bookmark-check' : 'lucide:bookmark'}" class="text-sm ${isSaved ? 'text-orange-500' : 'text-stone-300'}"></iconify-icon>
            </button>
        </div>
        <h3 class="text-sm font-semibold tracking-tight mb-1.5 group-hover:text-orange-600 transition-colors line-clamp-2">${escapeHtml(p.title)}</h3>
        <p class="text-xs text-stone-500 leading-relaxed line-clamp-2 mb-4">${escapeHtml(p.desc)}</p>
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 min-w-0">
                <img src="https://picsum.photos/seed/${p.authorImg}/32/32.jpg" class="w-5 h-5 rounded-full object-cover shrink-0" alt="">
                <span class="text-xs text-stone-400 truncate">${p.author}</span>
                <span class="text-xs text-stone-300 shrink-0">·</span>
                <span class="text-xs text-stone-400 shrink-0">${p.time}</span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <button onclick="event.stopPropagation(); toggleLike(${p.id})" class="flex items-center gap-1 text-xs ${isLiked ? 'text-orange-500' : 'text-stone-400'} hover:text-orange-500 transition-colors">
                    <iconify-icon icon="lucide:heart" class="text-xs" style="${isLiked ? 'fill:currentColor;' : ''}"></iconify-icon>
                    ${p.likes + (isLiked ? 1 : 0)}
                </button>
                <button onclick="event.stopPropagation(); openComments(${p.id})" class="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors">
                    <iconify-icon icon="lucide:message-square" class="text-xs"></iconify-icon>
                    ${p.comments.length}
                </button>
            </div>
        </div>
    </div>`;
}

// ========== RENDER: BROWSE (Jawad's Module) ==========
function renderBrowseCatFilters() {
    const div = document.getElementById('browse-cat-filters');
    div.innerHTML = `
        <button onclick="toggleCategoryFilter(null)" class="text-xs font-medium px-3 py-1.5 rounded-full transition-all ${!activeCategory ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}">All</button>
        ${mlCategories.map(c => `
            <button onclick="toggleCategoryFilter('${c.slug}')" class="text-xs font-medium px-3 py-1.5 rounded-full transition-all ${activeCategory === c.slug ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}">
                ${c.name}
            </button>
        `).join('')}
    `;
}

function toggleCategoryFilter(slug) {
    activeCategory = activeCategory === slug ? null : slug;
    visibleCount = 9;
    filterPrompts();
    renderBrowseCatFilters();
}

function filterPrompts() {
    const grid = document.getElementById('prompt-grid');
    const empty = document.getElementById('empty-state');
    const loadMore = document.getElementById('load-more-container');
    const search = document.getElementById('search-input')?.value?.toLowerCase() || '';
    const sort = document.getElementById('sort-select')?.value || 'popular';

    let filtered = prompts.filter(p => {
        const matchSearch = !search || p.title.toLowerCase().includes(search) || p.desc.toLowerCase().includes(search) || p.prompt.toLowerCase().includes(search);
        const matchCat = !activeCategory || p.category === activeCategory;
        return matchSearch && matchCat;
    });

    if (sort === 'popular') filtered.sort((a, b) => b.likes - a.likes);
    else if (sort === 'newest') filtered.sort((a, b) => b.id - a.id);
    else if (sort === 'most-copied') filtered.sort((a, b) => b.copies - a.copies);
    else if (sort === 'most-commented') filtered.sort((a, b) => b.comments.length - a.comments.length);

    const visible = filtered.slice(0, visibleCount);

    if (filtered.length === 0) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
        loadMore.classList.add('hidden');
        return;
    }

    empty.classList.add('hidden');
    loadMore.classList.toggle('hidden', visible.length >= filtered.length);
    grid.innerHTML = visible.map(p => renderPromptCard(p)).join('');

    // Active filters display
    const filtersDiv = document.getElementById('active-filters');
    if (activeCategory || search) {
        filtersDiv.classList.remove('hidden');
        let html = '';
        if (activeCategory) {
            const cat = getCategoryInfo(activeCategory);
            html += `<button onclick="toggleCategoryFilter('${activeCategory}')" class="inline-flex items-center gap-1 bg-stone-900 text-white text-xs font-medium px-3 py-1 rounded-full">${cat.name}<iconify-icon icon="lucide:x" class="text-[10px]"></iconify-icon></button>`;
        }
        if (search) {
            html += `<button onclick="document.getElementById('search-input').value=''; filterPrompts();" class="inline-flex items-center gap-1 bg-stone-100 text-stone-600 text-xs font-medium px-3 py-1 rounded-full">"${search}"<iconify-icon icon="lucide:x" class="text-[10px]"></iconify-icon></button>`;
        }
        html += `<button onclick="clearFilters()" class="text-xs text-stone-400 hover:text-stone-600 transition-colors underline">Clear all</button>`;
        filtersDiv.innerHTML = html;
    } else {
        filtersDiv.classList.add('hidden');
    }
}

function clearFilters() {
    activeCategory = null;
    if (document.getElementById('search-input')) document.getElementById('search-input').value = '';
    visibleCount = 9;
    filterPrompts();
    renderBrowseCatFilters();
}

function loadMore() {
    visibleCount += 6;
    filterPrompts();
}

// ========== RENDER: TRENDING (Jawad's Module) ==========
function renderTrending() {
    const list = document.getElementById('trending-list');
    const trending = [...prompts].sort((a, b) => (b.likes + b.copies * 0.1 + b.comments.length * 5) - (a.likes + a.copies * 0.1 + a.comments.length * 5)).slice(0, 10);
    list.innerHTML = trending.map((p, i) => {
        const cat = getCategoryInfo(p.category);
        return `
        <button onclick="openDetail(${p.id})" class="flex items-center gap-4 p-4 bg-white border border-stone-200 rounded-xl hover:shadow-md hover:border-stone-300 transition-all text-left group">
            <span class="text-lg font-bold ${i < 3 ? 'text-orange-500' : 'text-stone-300'} w-6 text-center shrink-0">${i + 1}</span>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                    <span class="inline-flex items-center ${cat.color} border text-[10px] font-medium px-1.5 py-0.5 rounded">${cat.name}</span>
                </div>
                <h4 class="text-sm font-medium tracking-tight truncate group-hover:text-orange-600 transition-colors">${escapeHtml(p.title)}</h4>
                <div class="flex items-center gap-3 mt-1">
                    <span class="text-[10px] text-stone-400">${p.author}</span>
                    <span class="flex items-center gap-1 text-[10px] text-stone-400"><iconify-icon icon="lucide:heart" class="text-[10px]"></iconify-icon>${p.likes}</span>
                    <span class="flex items-center gap-1 text-[10px] text-stone-400"><iconify-icon icon="lucide:message-square" class="text-[10px]"></iconify-icon>${p.comments.length}</span>
                    <span class="flex items-center gap-1 text-[10px] text-stone-400"><iconify-icon icon="lucide:copy" class="text-[10px]"></iconify-icon>${p.copies}</span>
                </div>
            </div>
            <iconify-icon icon="lucide:arrow-right" class="text-stone-300 group-hover:text-stone-500 transition-colors shrink-0"></iconify-icon>
        </button>`;
    }).join('');
}

// ========== RENDER: SAVED (Sadia's Module) ==========
function renderSaved() {
    const grid = document.getElementById('saved-grid');
    const empty = document.getElementById('saved-empty');
    const saved = prompts.filter(p => savedPrompts.has(p.id));
    if (saved.length === 0) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
    } else {
        empty.classList.add('hidden');
        grid.innerHTML = saved.map(p => renderPromptCard(p)).join('');
    }
}

// ========== RENDER: MY PROMPTS (Ayesha's Module) ==========
function renderMyPrompts() {
    const grid = document.getElementById('my-prompts-grid');
    const empty = document.getElementById('my-prompts-empty');
    if (!currentUser) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }
    const mine = prompts.filter(p => p.userId === currentUser.email);
    if (mine.length === 0) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
    } else {
        empty.classList.add('hidden');
        grid.innerHTML = mine.map(p => renderPromptCard(p)).join('');
    }
}

// ========== INTERACTIONS (Sadia's Module) ==========

function toggleLike(id) {
    if (!currentUser) { openModal('login-modal'); showToast('Please sign in to like prompts', 'lucide:log-in'); return; }
    if (likedPrompts.has(id)) likedPrompts.delete(id);
    else { likedPrompts.add(id); showToast('Prompt liked!', 'lucide:heart'); }
    refreshCurrentPage();
}

function toggleSave(id) {
    if (!currentUser) { openModal('login-modal'); showToast('Please sign in to save prompts', 'lucide:log-in'); return; }
    if (savedPrompts.has(id)) {
        savedPrompts.delete(id);
        showToast('Removed from saved', 'lucide:bookmark-minus');
    } else {
        savedPrompts.add(id);
        showToast('Saved to bookmarks!', 'lucide:bookmark-check');
    }
    updateSavedBadge();
    refreshCurrentPage();
}

function updateSavedBadge() {
    const badge = document.getElementById('saved-badge');
    const count = savedPrompts.size;
    if (count > 0) {
        badge.classList.remove('hidden');
        badge.classList.add('flex');
        badge.textContent = count;
    } else {
        badge.classList.add('hidden');
        badge.classList.remove('flex');
    }
}

function openComments(id) {
    if (!currentUser) { openModal('login-modal'); showToast('Please sign in to comment', 'lucide:log-in'); return; }
    commentTargetId = id;
    renderComments();
    openModal('comment-modal');
}

function renderComments() {
    const p = prompts.find(x => x.id === commentTargetId);
    if (!p) return;
    const list = document.getElementById('comments-list');
    if (p.comments.length === 0) {
        list.innerHTML = '<div class="text-center py-8"><iconify-icon icon="lucide:message-square" class="text-3xl text-stone-200 mb-2"></iconify-icon><p class="text-sm text-stone-400">No comments yet. Be the first!</p></div>';
    } else {
        list.innerHTML = p.comments.map(c => `
            <div class="flex gap-3">
                <div class="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                    <span class="text-[10px] font-semibold text-stone-500">${c.user.charAt(0)}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-medium">${escapeHtml(c.user)}</span>
                        <span class="text-[10px] text-stone-400">${c.time}</span>
                    </div>
                    <p class="text-sm text-stone-600 mt-0.5">${escapeHtml(c.text)}</p>
                </div>
            </div>
        `).join('');
    }
}

function handleAddComment(e) {
    e.preventDefault();
    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    if (!text || !commentTargetId) return;
    const p = prompts.find(x => x.id === commentTargetId);
    if (!p) return;
    p.comments.push({ user: currentUser.name, text: text, time: 'Just now' });
    input.value = '';
    renderComments();
    showToast('Comment posted!', 'lucide:message-circle');
    refreshCurrentPage();
}

function copyPrompt(id) {
    const p = prompts.find(x => x.id === id);
    if (!p) return;
    const fullText = p.context ? `${p.prompt}\n\nContext: ${p.context}` : p.prompt;
    navigator.clipboard.writeText(fullText).then(() => {
        p.copies++;
        showToast('Prompt copied to clipboard!', 'lucide:check');
        refreshCurrentPage();
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = fullText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        p.copies++;
        showToast('Prompt copied!', 'lucide:check');
        refreshCurrentPage();
    });
}

function refreshCurrentPage() {
    if (currentPage === 'browse') filterPrompts();
    if (currentPage === 'categories') renderCategories();
    if (currentPage === 'trending') renderTrending();
    if (currentPage === 'saved') renderSaved();
    if (currentPage === 'my-prompts') renderMyPrompts();
}

// ========== PROMPT DETAIL ==========
function openDetail(id) {
    const p = prompts.find(x => x.id === id);
    if (!p) return;
    const cat = getCategoryInfo(p.category);
    const isLiked = likedPrompts.has(p.id);
    const isSaved = savedPrompts.has(p.id);
    document.getElementById('detail-content').innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <span class="inline-flex items-center gap-1 ${cat.color} border text-[11px] font-medium px-2 py-0.5 rounded-md">
                <iconify-icon icon="${cat.icon}" class="text-[10px]"></iconify-icon>
                ${cat.name}
            </span>
            <button onclick="closeModal('detail-modal')" class="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-colors">
                <iconify-icon icon="lucide:x" class="text-stone-400"></iconify-icon>
            </button>
        </div>
        <h3 class="text-xl font-semibold tracking-tight mb-2">${escapeHtml(p.title)}</h3>
        <p class="text-sm text-stone-500 leading-relaxed mb-4">${escapeHtml(p.desc)}</p>
        <div class="flex items-center gap-3 mb-5">
            <img src="https://picsum.photos/seed/${p.authorImg}/40/40.jpg" class="w-8 h-8 rounded-full object-cover" alt="">
            <div>
                <div class="text-sm font-medium">${p.author}</div>
                <div class="text-xs text-stone-400">${p.time}</div>
            </div>
            <div class="ml-auto flex items-center gap-3">
                <button onclick="toggleLike(${p.id}); openDetail(${p.id});" class="flex items-center gap-1 text-sm ${isLiked ? 'text-orange-500' : 'text-stone-400'} hover:text-orange-500 transition-colors">
                    <iconify-icon icon="lucide:heart" style="${isLiked ? 'fill:currentColor;' : ''}"></iconify-icon>
                    ${p.likes + (isLiked ? 1 : 0)}
                </button>
                <button onclick="openComments(${p.id})" class="flex items-center gap-1 text-sm text-stone-400 hover:text-stone-600 transition-colors">
                    <iconify-icon icon="lucide:message-square"></iconify-icon>
                    ${p.comments.length}
                </button>
                <span class="flex items-center gap-1 text-sm text-stone-400">
                    <iconify-icon icon="lucide:copy"></iconify-icon>
                    ${p.copies.toLocaleString()}
                </span>
            </div>
        </div>
        <div class="mb-2 flex items-center gap-2">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Prompt</span>
            <span class="text-[10px] text-stone-300">|</span>
            <span class="text-[10px] text-purple-500 font-medium">ML Classified: ${cat.name}</span>
        </div>
        <div class="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-4">
            <pre class="text-xs text-stone-700 leading-relaxed whitespace-pre-wrap font-mono">${escapeHtml(p.prompt)}</pre>
        </div>
        ${p.context ? `
        <div class="mb-4">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2 block">Context</span>
            <div class="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <pre class="text-xs text-stone-600 leading-relaxed whitespace-pre-wrap font-mono">${escapeHtml(p.context)}</pre>
            </div>
        </div>` : ''}
        <div class="flex items-center gap-3">
            <button onclick="copyPrompt(${p.id})" class="flex-1 flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium py-2.5 rounded-lg transition-all">
                <iconify-icon icon="lucide:copy"></iconify-icon>
                Copy Prompt
            </button>
            <button onclick="toggleSave(${p.id}); openDetail(${p.id});" class="px-4 border border-stone-200 hover:border-stone-300 text-stone-600 text-sm font-medium py-2.5 rounded-lg transition-all" title="Save">
                <iconify-icon icon="${isSaved ? 'lucide:bookmark-check' : 'lucide:bookmark'}" class="${isSaved ? 'text-orange-500' : ''}"></iconify-icon>
            </button>
            <button onclick="openComments(${p.id})" class="px-4 border border-stone-200 hover:border-stone-300 text-stone-600 text-sm font-medium py-2.5 rounded-lg transition-all" title="Comments">
                <iconify-icon icon="lucide:message-square"></iconify-icon>
            </button>
        </div>
    `;
    openModal('detail-modal');
}

// ========== AUTH (Zoya's Module) ==========
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errDiv = document.getElementById('login-error');

    const user = registeredUsers.find(u => u.email === email && u.password === password);
    if (!user) {
        errDiv.textContent = 'Invalid email or password. Try: jawad@szabist.edu / 123456';
        errDiv.classList.remove('hidden');
        return;
    }

    errDiv.classList.add('hidden');
    currentUser = user;
    updateAuthUI();
    closeModal('login-modal');
    showToast(`Welcome back, ${user.name}!`, 'lucide:log-in');
    e.target.reset();
    refreshCurrentPage();
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    const errDiv = document.getElementById('signup-error');

    if (password !== confirm) {
        errDiv.textContent = 'Passwords do not match.';
        errDiv.classList.remove('hidden');
        return;
    }
    if (registeredUsers.find(u => u.email === email)) {
        errDiv.textContent = 'An account with this email already exists.';
        errDiv.classList.remove('hidden');
        return;
    }

    errDiv.classList.add('hidden');
    const newUser = { name, email, password };
    registeredUsers.push(newUser);
    currentUser = newUser;
    updateAuthUI();
    closeModal('signup-modal');
    showToast(`Account created! Welcome, ${name}!`, 'lucide:user-plus');
    e.target.reset();
    refreshCurrentPage();
}

function handleLogout() {
    currentUser = null;
    likedPrompts.clear();
    savedPrompts.clear();
    updateAuthUI();
    updateSavedBadge();
    navigateTo('home');
    showToast('Signed out successfully', 'lucide:log-out');
}

function updateAuthUI() {
    const guestNav = document.getElementById('nav-guest');
    const userNav = document.getElementById('nav-user');
    if (currentUser) {
        guestNav.classList.add('hidden');
        userNav.classList.remove('hidden');
        userNav.classList.add('flex');
        document.getElementById('nav-username').textContent = currentUser.name;
        document.getElementById('nav-email').textContent = currentUser.email;
        document.getElementById('nav-avatar').innerHTML = `<span class="text-xs font-semibold text-orange-600">${currentUser.name.charAt(0)}</span>`;
    } else {
        guestNav.classList.remove('hidden');
        userNav.classList.add('hidden');
        userNav.classList.remove('flex');
    }
}

// ========== PROMPT SUBMISSION (Ayesha's Module) ==========
function previewClassification() {
    const text = document.getElementById('prompt-text').value.trim();
    const context = document.getElementById('prompt-context').value.trim();
    if (!text) {
        showToast('Enter a prompt text first', 'lucide:alert-circle');
        return;
    }
    const fullText = context ? text + ' ' + context : text;
    const predicted = classifyPrompt(fullText);
    const cat = getCategoryInfo(predicted);
    const preview = document.getElementById('classify-preview');
    const result = document.getElementById('classify-result');
    preview.classList.remove('hidden');
    result.innerHTML = `<span class="inline-flex items-center gap-1 ${cat.color} border text-xs font-medium px-2 py-0.5 rounded-md"><iconify-icon icon="${cat.icon}" class="text-[10px]"></iconify-icon>${cat.name}</span><span class="text-xs text-emerald-600 ml-2">— ${cat.desc}</span>`;
}

function handleSubmitPrompt(e) {
    e.preventDefault();
    if (!currentUser) {
        closeModal('submit-modal');
        openModal('login-modal');
        showToast('Please sign in to submit prompts', 'lucide:log-in');
        return;
    }

    const title = document.getElementById('prompt-title').value.trim();
    const text = document.getElementById('prompt-text').value.trim();
    const context = document.getElementById('prompt-context').value.trim();
    const desc = document.getElementById('prompt-desc').value.trim();

    // ML Classification (Khadija's module integration)
    const fullText = context ? text + ' ' + context : text;
    const predictedCategory = classifyPrompt(fullText);

    const newPrompt = {
        id: Date.now(),
        title, prompt: text, context: context || '',
        category: predictedCategory,
        desc: desc || 'A community-shared prompt.',
        likes: 0, copies: 0,
        comments: [],
        author: currentUser.name,
        authorImg: 'user-' + Math.random().toString(36).slice(2, 6),
        time: 'Just now',
        userId: { email: currentUser.email }
    };

    prompts.unshift(newPrompt);
    closeModal('submit-modal');
    e.target.reset();
    document.getElementById('classify-preview').classList.add('hidden');

    const cat = getCategoryInfo(predictedCategory);
    showToast(`Prompt submitted! Classified as: ${cat.name}`, 'lucide:check-circle');
    refreshCurrentPage();
}

// ========== UTILS ==========
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
    // Only restore scroll if no other modals are open
    const anyOpen = ['submit-modal','login-modal','signup-modal','detail-modal','comment-modal'].some(
        m => !document.getElementById(m).classList.contains('hidden')
    );
    if (!anyOpen) document.body.style.overflow = '';
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
    document.body.style.overflow = menu.classList.contains('hidden') ? '' : 'hidden';
}

function handleNewsletter(e) {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value;
    document.getElementById('newsletter-email').value = '';
    showToast(`Subscribed with ${email}!`, 'lucide:mail-check');
}

function showToast(message, icon = 'lucide:info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast-in flex items-center gap-2.5 bg-white border border-stone-200 shadow-lg rounded-xl px-4 py-3 min-w-[240px] max-w-sm';
    toast.innerHTML = `
        <iconify-icon icon="${icon}" class="text-orange-500 text-base shrink-0"></iconify-icon>
        <span class="text-sm text-stone-700">${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.className = toast.className.replace('toast-in', 'toast-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========== KEYBOARD ==========
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        ['submit-modal','login-modal','signup-modal','detail-modal','comment-modal'].forEach(id => {
            if (!document.getElementById(id).classList.contains('hidden')) closeModal(id);
        });
        if (!document.getElementById('mobile-menu').classList.contains('hidden')) toggleMobileMenu();
    }
});

// ========== ANIMATE STATS ==========
function animateStats() {
    const totalPrompts = prompts.length;
    const totalCats = mlCategories.length;
    const totalLikes = prompts.reduce((s, p) => s + p.likes, 0);
    const totalCopies = prompts.reduce((s, p) => s + p.copies, 0);
    animateNumber('stat-prompts', totalPrompts);
    animateNumber('stat-categories', totalCats);
    animateNumber('stat-likes', totalLikes);
    animateNumber('stat-copies', totalCopies);
}

function animateNumber(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    let current = 0;
    const step = Math.ceil(target / 40);
    const interval = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(interval); }
        el.textContent = current >= 1000 ? (current / 1000).toFixed(1) + 'k' : current;
    }, 30);
}

// ========== INIT ==========
updateAuthUI();
animateStats();