const audienceTabs = [...document.querySelectorAll('.audience-tab')];
const audiencePanels = [...document.querySelectorAll('.audience-content')];
const audienceTabsTrack = document.querySelector('.audience-tabs');
let audienceSwitchTimer = null;
let audienceSwitching = false;

function setAudienceIndicator(index) {
  audienceTabsTrack?.style.setProperty('--tab-index', String(index));
}

function activateAudience(tab, index) {
  if (!tab || audienceSwitching || tab.classList.contains('is-active')) return;

  const target = tab.dataset.audience;
  const currentPanel = audiencePanels.find((panel) => panel.classList.contains('is-active'));
  const nextPanel = audiencePanels.find((panel) => panel.dataset.panel === target);
  if (!nextPanel) return;

  audienceSwitching = true;
  setAudienceIndicator(index);

  audienceTabs.forEach((item) => {
    const active = item === tab;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-selected', String(active));
  });

  if (audienceSwitchTimer) clearTimeout(audienceSwitchTimer);

  if (currentPanel && currentPanel !== nextPanel) {
    currentPanel.classList.add('is-leaving');
    currentPanel.classList.remove('is-active');
  }

  audienceSwitchTimer = setTimeout(() => {
    if (currentPanel && currentPanel !== nextPanel) {
      currentPanel.hidden = true;
      currentPanel.classList.remove('is-leaving');
    }

    nextPanel.hidden = false;
    nextPanel.classList.remove('is-leaving');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        nextPanel.classList.add('is-active');
        setTimeout(() => { audienceSwitching = false; }, 850);
      });
    });
  }, currentPanel && currentPanel !== nextPanel ? 290 : 0);
}

audienceTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateAudience(tab, index));
});

const initiallyActiveTab = audienceTabs.findIndex((tab) => tab.classList.contains('is-active'));
setAudienceIndicator(Math.max(initiallyActiveTab, 0));



/* V37 — раскрытие команды только через мягкое появление из размытия. */
const teamToggle = document.getElementById('teamToggle');
const extraTeamCards = [...document.querySelectorAll('.team-card--extra')];
let teamExpanded = false;
let teamCloseTimer = null;

function updateTeamToggleCopy() {
  if (!teamToggle) return;
  const label = teamExpanded
    ? (currentLanguage === 'en' ? 'Collapse team' : currentLanguage === 'zh' ? '收起团队' : 'Свернуть команду')
    : (currentLanguage === 'en' ? 'View full team' : currentLanguage === 'zh' ? '查看完整团队' : 'Посмотреть всю команду');
  teamToggle.innerHTML = `${label} <span>${teamExpanded ? '−' : '＋'}</span>`;
  teamToggle.setAttribute('aria-expanded', String(teamExpanded));
}

teamToggle?.addEventListener('click', () => {
  if (teamCloseTimer) {
    clearTimeout(teamCloseTimer);
    teamCloseTimer = null;
  }

  teamExpanded = !teamExpanded;

  if (teamExpanded) {
    extraTeamCards.forEach((card) => {
      card.hidden = false;
      card.classList.remove('is-visible', 'is-closing', 'team-extra-enter', 'team-extra-leave');
    });

    // Сначала браузер рисует исходное blur-состояние, затем карточки спокойно проявляются одновременно.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        extraTeamCards.forEach((card) => card.classList.add('is-visible'));
      });
    });
  } else {
    extraTeamCards.forEach((card) => {
      card.classList.remove('is-visible');
      card.classList.add('is-closing');
    });

    teamCloseTimer = setTimeout(() => {
      extraTeamCards.forEach((card) => {
        card.hidden = true;
        card.classList.remove('is-closing', 'team-extra-enter', 'team-extra-leave');
      });
      teamCloseTimer = null;
    }, 410);
  }

  updateTeamToggleCopy();
});

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!contactForm.checkValidity()) {
    formStatus.textContent = currentLanguage === 'en' ? 'Please check the required fields.' : currentLanguage === 'zh' ? '请检查必填字段。' : 'Проверьте обязательные поля.';
    contactForm.reportValidity();
    return;
  }
  formStatus.textContent = currentLanguage === 'en' ? 'The form is complete. Submission will be connected during integration.' : currentLanguage === 'zh' ? '表单已填写完成。提交功能将在集成阶段接入。' : 'Форма заполнена корректно. Подключение отправки добавим на этапе интеграции.';
});

const newsletterForm = document.getElementById('newsletterForm');
newsletterForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!newsletterForm.checkValidity()) {
    newsletterForm.reportValidity();
    return;
  }
  const button = newsletterForm.querySelector('button');
  if (button) {
    button.textContent = currentLanguage === 'en' ? 'Done ✓' : currentLanguage === 'zh' ? '完成 ✓' : 'Готово ✓';
    button.disabled = true;
  }
});

const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!open));
  siteNav?.classList.toggle('is-mobile-open', !open);
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hero = document.querySelector('.hero');
const header = document.querySelector('.site-header');
const headerCta = document.querySelector('.header-cta');

/* CTA в шапке появляется только после выхода с первого экрана.
   Элемент всегда занимает своё место в layout, меняется только визуальное состояние. */
const updateHeaderCtaVisibility = () => {
  if (!hero || !headerCta) return;
  const headerHeight = header?.offsetHeight || 0;
  const heroBottom = hero.getBoundingClientRect().bottom;
  headerCta.classList.toggle('is-visible', heroBottom <= headerHeight + 6);
};

let headerCtaTicking = false;
const requestHeaderCtaUpdate = () => {
  if (headerCtaTicking) return;
  headerCtaTicking = true;
  requestAnimationFrame(() => {
    updateHeaderCtaVisibility();
    headerCtaTicking = false;
  });
};
window.addEventListener('scroll', requestHeaderCtaUpdate, { passive: true });
window.addEventListener('resize', requestHeaderCtaUpdate);
requestHeaderCtaUpdate();

if (reduceMotion) {
  header?.classList.add('header-loaded');
  hero?.classList.add('hero-loaded');
} else {
  requestAnimationFrame(() => {
    setTimeout(() => header?.classList.add('header-loaded'), 380);
    /* Первый экран стартует чуть позже, чтобы раскрытие реально считывалось. */
    setTimeout(() => hero?.classList.add('hero-loaded'), 980);
  });
}

/* HERO повторяет веер при возвращении снизу вверх.
   Вход — только когда примерно треть экрана уже видна; сброс — лишь после полного выхода. */
if (!reduceMotion && hero && 'IntersectionObserver' in window) {
  let heroEnteredOnce = true;
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        hero.classList.remove('hero-loaded');
        heroEnteredOnce = false;
        return;
      }
      if (entry.intersectionRatio >= 0.44 && !hero.classList.contains('hero-loaded')) {
        window.setTimeout(() => hero.classList.add('hero-loaded'), heroEnteredOnce ? 300 : 380);
        heroEnteredOnce = true;
      }
    });
  }, { threshold: [0, 0.44] });
  heroObserver.observe(hero);
}

/* Единая reveal-система v26: секция управляет всеми своими элементами.
   Это устраняет конкурирующие Observer-события и делает движение плавным
   как сверху вниз, так и снизу вверх. */
const sectionNodes = [...document.querySelectorAll('.section')];
sectionNodes.forEach((section) => section.classList.add('reveal-section'));

const groupSelectors = [
  ['.section-heading', ''],
  ['.president-card', ''],
  ['.value-card', ''],
  ['.medium-card', 'motion-from-right'],
  ['.markets-panel', ''],
  ['.markets-panel__chips span', ''],
  ['.direction-card', ''],
  ['.directions-footer', ''],
  ['.audience-shell', ''],
  ['.benefit-card', ''],
  ['.founder-card', ''],
  ['.partners-cloud', ''],
  ['.support-strip', ''],
  ['.support-logo', ''],
  ['.support-logo-card', ''],
  ['.team-card', ''],
  ['.news-card', ''],
  ['.hq-card', ''],
  ['.map-card', ''],
  ['.contact-list', ''],
  ['.contact-form', ''],
];

const sectionMotionMap = new Map();
sectionNodes.forEach((section) => {
  const items = [];
  groupSelectors.forEach(([selector, extraClass]) => {
    section.querySelectorAll(selector).forEach((item) => {
      if (!items.includes(item)) {
        item.classList.add('motion-item');
        if (extraClass) item.classList.add(extraClass);
        items.push(item);
      }
    });
  });
  items.forEach((item, index) => {
    /* Задержка считается внутри секции, поэтому большие страницы не получают
       случайно длинный stagger из-за глобального индекса. */
    item.style.setProperty('--motion-delay', `${260 + Math.min(index, 7) * 150}ms`);
  });
  sectionMotionMap.set(section, items);
});

/* v31 — отдельный поздний триггер для 04.
   Карточки появляются короткой читаемой волной, а не успевают завершить
   анимацию до того, как пользователь реально увидит секцию. */
const applicationsSection = document.querySelector('.section--applications');
const applicationCards = [...document.querySelectorAll('.section--applications .application-card')];
/* 04 — три короткие волны по пять карточек.
   Внутри каждой волны элементы специально выбраны из разных строк и колонок,
   поэтому заполнение экрана выглядит спонтанным, но контролируемым. */
const applicationWaveOne   = [0, 5, 7, 9, 14];
const applicationWaveTwo   = [2, 3, 8, 10, 13];
const applicationWaveThree = [1, 4, 6, 11, 12];
const applicationDelayPattern = Array(applicationCards.length).fill(0);
[applicationWaveOne, applicationWaveTwo, applicationWaveThree].forEach((wave, waveIndex) => {
  const waveBase = 120 + waveIndex * 250;
  wave.forEach((cardIndex, positionInWave) => {
    /* Минимальный разброс внутри волны не превращает её в последовательный ряд. */
    applicationDelayPattern[cardIndex] = waveBase + [0, 38, 16, 54, 28][positionInWave];
  });
});
applicationCards.forEach((card, index) => {
  card.classList.add('motion-item', 'application-motion-item');
  card.style.setProperty('--motion-delay', `${applicationDelayPattern[index]}ms`);
});

const setApplicationsMotion = (visible) => {
  applicationCards.forEach((card) => card.classList.toggle('motion-visible', visible));
};

/* Подписка получает свой поздний trigger — блок появляется только когда
   пользователь уже действительно дошёл до него. */
const newsletter = document.querySelector('.newsletter');
if (newsletter) {
  newsletter.classList.add('motion-item', 'newsletter-motion-item');
  newsletter.style.setProperty('--motion-delay', '80ms');
}

if (reduceMotion || !('IntersectionObserver' in window)) {
  setApplicationsMotion(true);
  newsletter?.classList.add('motion-visible');
} else {
  if (applicationsSection) {
    let applicationsVisible = false;
    const applicationsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!applicationsVisible && entry.intersectionRatio >= 0.68) {
          applicationsVisible = true;
          setApplicationsMotion(true);
        } else if (applicationsVisible && entry.intersectionRatio <= 0.07) {
          applicationsVisible = false;
          setApplicationsMotion(false);
        }
      });
    }, { threshold: [0, 0.07, 0.68, 0.82] });
    applicationsObserver.observe(applicationsSection);
  }

  if (newsletter) {
    let newsletterVisible = false;
    const newsletterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!newsletterVisible && entry.intersectionRatio >= 0.78) {
          newsletterVisible = true;
          newsletter.classList.add('motion-visible');
        } else if (newsletterVisible && entry.intersectionRatio <= 0.08) {
          newsletterVisible = false;
          newsletter.classList.remove('motion-visible');
        }
      });
    }, { threshold: [0, 0.08, 0.78, 0.92] });
    newsletterObserver.observe(newsletter);
  }
}

const setSectionMotion = (section, visible) => {
  section.classList.toggle('section-inview', visible);
  const items = sectionMotionMap.get(section) || [];
  items.forEach((item) => item.classList.toggle('motion-visible', visible));
};

if (reduceMotion || !('IntersectionObserver' in window)) {
  sectionNodes.forEach((section) => setSectionMotion(section, true));
} else {
  /* Центральная зона viewport. Класс включается, когда секция доходит до неё,
     а сбрасывается лишь после выхода из этой зоны. Это убирает дрожание на
     границе threshold и позволяет анимации повторяться в обратную сторону. */
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      setSectionMotion(entry.target, entry.isIntersecting);
    });
  }, {
    threshold: 0,
    rootMargin: '-34% 0px -38% 0px'
  });

  sectionNodes.forEach((section) => sectionObserver.observe(section));
}

/* Плавная навигация по якорям шапки — чуть медленнее стандартного smooth. */
const headerAnchorLinks = [...document.querySelectorAll('.site-nav a[href^="#"], .site-brand[href^="#"], .header-cta[href^="#"]')];
const smoothScrollTo = (targetY, duration = 980) => {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();
  const ease = (t) => 1 - Math.pow(1 - t, 4);
  const frame = (now) => {
    const t = Math.min(1, (now - startTime) / duration);
    window.scrollTo(0, startY + distance * ease(t));
    if (t < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};
headerAnchorLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const selector = link.getAttribute('href');
    if (!selector || selector === '#') return;
    const target = document.querySelector(selector);
    if (!target) return;
    event.preventDefault();
    const headerOffset = (header?.offsetHeight || 0) + 12;
    const targetY = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset);
    smoothScrollTo(targetY, 1050);
    if (siteNav?.classList.contains('is-mobile-open')) {
      siteNav.classList.remove('is-mobile-open');
      menuToggle?.setAttribute('aria-expanded', 'false');
    }
  });
});

/* Очень медленный поворот условной Земли на первом экране. */
const heroGlobe = document.getElementById('heroGlobe');
if (!reduceMotion && heroGlobe && window.innerWidth > 760) {
  let ticking = false;
  const updateGlobe = () => {
    const rect = hero?.getBoundingClientRect();
    if (!rect) return;
    const progress = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, 1)));
    const rotation = -3 + progress * 6;
    heroGlobe.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateGlobe);
    }
  }, { passive: true });
}

/* v18 — прогресс-линия под шапкой, как на исходном сайте: чем ниже скролл, тем длиннее линия. */
const scrollProgress = document.getElementById('scrollProgress');
if (scrollProgress) {
  let progressTicking = false;

  const updateScrollProgress = () => {
    const doc = document.documentElement;
    const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    scrollProgress.style.setProperty('--scroll-progress', `${(progress * 100).toFixed(3)}%`);
    progressTicking = false;
  };

  const requestProgressUpdate = () => {
    if (progressTicking) return;
    progressTicking = true;
    requestAnimationFrame(updateScrollProgress);
  };

  updateScrollProgress();
  window.addEventListener('scroll', requestProgressUpdate, { passive: true });
  window.addEventListener('resize', requestProgressUpdate, { passive: true });
}

/* v20 — RU / EN. Текстовые узлы переводятся без перестройки DOM,
   поэтому сетка, карточки и размеры секций остаются прежними. */
const i18nEn = new Map(Object.entries({
  'Ассоциация':'Association',
  'Среды':'Environments',
  'Направления':'Directions',
  'Применение':'Applications',
  'Команда':'Team',
  'Новости':'News',
  'Контакты':'Contacts',
  'Вступить в Ассоциацию':'Join the Association',
  'Автономные системы для':'Autonomous systems for',
  'неба':'sky',
  'земли':'land',
  'воды':'water',
  'космоса':'space',
  'и цифры':'and digital',
  'и':'and',
  'цифры':'digital',
  'Объединяем разработчиков, производителей, заказчиков и экспертов для развития гражданских автономных технологий во всех пяти средах.':'We unite developers, manufacturers, customers and experts to advance civil autonomous technologies across all five environments.',
  'Учреждена 6 апреля':'Founded on April 6',
  'Москва':'Moscow',
  'ОГРН 1267700132853':'Registration No. 1267700132853',
  'Вода':'Water',
  'Безэкипажные надводные и подводные суда':'Uncrewed surface and underwater vessels',
  'Земля':'Land',
  'Робототехника и автономный транспорт':'Robotics and autonomous transport',
  'Небо':'Sky',
  'Беспилотные авиационные системы':'Uncrewed aerial systems',
  'Космос':'Space',
  'Спутниковые сервисы и космические технологии':'Satellite services and space technologies',
  'Цифровая':'Digital',
  'среда':'environment',
  'Искусственный интеллект, данные и связь':'Artificial intelligence, data and communications',
  'Об Ассоциации':'About the Association',
  'Ассоциация —':'The Association —',
  'партнёр государства':'a partner to the state',
  'в развитии автономных систем':'in advancing autonomous systems',
  'Консолидируем отрасль, формируем зрелый рынок и участвуем в создании условий для технологического суверенитета.':'We consolidate the industry, build a mature market and help create the conditions for technological sovereignty.',
  'Поручение Президента':'Presidential directive',
  'Правительству Российской Федерации разработать при участии Ассоциации эксплуатантов и производителей автономных систем «Национальные автономные системы» и представить национальный план развития автономных систем на период до 2036 года.':'The Government of the Russian Federation is to develop, with the participation of the National Autonomous Systems Association, a national plan for autonomous systems development through 2036.',
  'Поручение В. В. Путина по итогам ПМЭФ-2026':'Directive following SPIEF 2026',
  'Пр-1758, п. 1а':'Pr-1758, cl. 1a',
  'Видение':'Vision',
  'Россия — мировой лидер по производительности труда и технологическому суверенитету за счёт применения автономных систем во всех средах: в воздухе, на земле, на воде, в космосе и цифровой среде.':'Russia as a global leader in productivity and technological sovereignty through autonomous systems across air, land, water, space and the digital environment.',
  'Роль':'Role',
  'НАС — центр консолидации отрасли автономных систем России, обеспечивающий взаимодействие государства, бизнеса, науки и регионов для формирования единой и ускоренно внедряемой экосистемы.':'NAS is a consolidation center for Russia’s autonomous systems industry, connecting government, business, science and regions to build a unified, rapidly deployed ecosystem.',
  'Миссия':'Mission',
  'Обеспечивать рост производительности труда и технологического суверенитета за счёт формирования зрелого рынка гражданских автономных систем России во всех средах.':'To increase productivity and technological sovereignty by building a mature Russian market for civil autonomous systems across all environments.',
  'Цель к 2030':'Goal for 2030',
  'Создать устойчивую экосистему, обеспечивающую массовое внедрение, серийное производство и экспорт автономных систем.':'Build a sustainable ecosystem enabling mass adoption, serial production and export of autonomous systems.',
  'Пять сред':'Five environments',
  'Пять сред —':'Five environments —',
  'единая экосистема':'one ecosystem',
  'Пять равноправных сред применения автономных систем — вода, земля, воздух, космос и цифровая среда.':'Five equal environments for autonomous systems: water, land, air, space and digital.',
  'Безэкипажные надводные и подводные суда.':'Uncrewed surface and underwater vessels.',
  'Высокоавтоматизированные транспортные средства, автономный транспорт и робототехника.':'Highly automated vehicles, autonomous transport and robotics.',
  'Воздух':'Air',
  'Беспилотные авиационные системы.':'Uncrewed aerial systems.',
  'Спутниковые системы связи и наблюдения.':'Satellite communication and observation systems.',
  'Цифровая среда':'Digital environment',
  'Программное обеспечение для управления и искусственный интеллект.':'Control software and artificial intelligence.',
  'Рынки применения':'Application markets',
  'Сельское хозяйство':'Agriculture',
  'Логистика':'Logistics',
  'Экология':'Environment',
  'Строительство и ЖКХ':'Construction & utilities',
  'МЧС и безопасность':'Emergency & safety',
  'Робототехника и ИИ':'Robotics & AI',
  'Контрольно-надзорная деятельность':'Regulatory oversight',
  'Образование':'Education',
  'Шоу-индустрия':'Entertainment',
  'Энергетика':'Energy',
  'Добыча полезных ископаемых':'Mining',
  'Медицина':'Healthcare',
  'Ключевые направления':'Key directions',
  'Ключевые':'Key',
  'направления':'directions',
  'Развиваем технологии, формируем стандарты, объединяем усилия для внедрения автономных систем во всех сферах.':'We advance technologies, shape standards and unite efforts to deploy autonomous systems across industries.',
  'От исследований и нормативной базы до реальных решений в экономике, социальной сфере и государственном управлении.':'From research and regulation to real solutions in the economy, social sphere and public administration.',
  'Сообщество и сервисы для членов':'Community and member services',
  'Платформа сотрудничества, обмена опытом и развития отрасли.':'A platform for cooperation, knowledge exchange and industry development.',
  'компаний':'companies',
  'и экспертов':'and experts',
  'Спрос, внедрение и доступ к рынку':'Demand, deployment and market access',
  'Содействуем выводу решений на рынок и масштабированию применения.':'We help bring solutions to market and scale their adoption.',
  'пилотных':'pilot',
  'проектов':'projects',
  'Партнёрства: государство и корпорации':'Partnerships: government and corporations',
  'Объединяем усилия бизнеса, государства и науки для достижения национальных целей.':'We unite business, government and science to achieve national goals.',
  'стратегических':'strategic',
  'соглашений':'agreements',
  'Аналитика и законотворчество':'Analytics and regulation',
  'Формируем экспертную базу и предлагаем решения для развития нормативной среды.':'We build an expert base and propose solutions for regulatory development.',
  'аналитических':'analytical',
  'исследований':'studies',
  'Технологии и наука':'Technology and science',
  'Поддерживаем исследования, разработку и внедрение передовых технологий.':'We support research, development and adoption of advanced technologies.',
  'научных':'research',
  'Кадры и компетенции':'People and competencies',
  'Развиваем человеческий капитал и формируем новый рынок профессий.':'We develop human capital and shape a new professional market.',
  'образовательных':'educational',
  'программ':'programs',
  'Все направления':'All directions',
  'Посмотреть подробное описание':'View details',
  'Технологии':'Technology',
  'Партнёрство':'Partnership',
  'Новые рынки':'New markets',
  'Кадры':'Talent',
  'Стандарты':'Standards',
  'Исследования':'Research',
  'Развитие':'Development',
  'Вместе формируем будущее автономных систем':'Together we shape the future of autonomous systems',
  'Сферы применения':'Applications',
  'Сферы, где автономные системы':'Where autonomous systems',
  'создают эффект':'create impact',
  'Автономные технологии уже работают в ключевых секторах экономики — от агропромышленности и логистики до космоса, медицины и городской инфраструктуры.':'Autonomous technologies already operate across key sectors — from agriculture and logistics to space, healthcare and urban infrastructure.',
  'Строительство':'Construction',
  'ЖКХ':'Utilities',
  'Связь и космос':'Communications & space',
  'Шоу-индустрия и выставочная деятельность':'Entertainment & exhibitions',
  'Медицина и здравоохранение':'Medicine & healthcare',
  'Культура и медиа':'Culture & media',
  'Ассоциация в интересах':'Association for stakeholders',
  'Одна экосистема —':'One ecosystem —',
  'три сценария взаимодействия':'three interaction scenarios',
  'Ассоциация объединяет интересы участников рынка, государства и заказчиков. Контент сохранён, но представлен в более ясной интерактивной структуре.':'The Association aligns the interests of market participants, government and customers in a clear interactive structure.',
  'Участникам':'Members',
  'Государству':'Government',
  'Заказчикам':'Customers',
  'Эксплуатантам и производителям':'Operators and manufacturers',
  'Ускоряем путь от технологии до устойчивого рынка':'Accelerating the path from technology to a sustainable market',
  'Доступ к рынку и спрос':'Market access and demand',
  'Формируем спрос, объединяем участников и помогаем войти в кооперационные цепочки крупных заказчиков.':'We build demand, connect participants and help enter major customers’ supply chains.',
  'Меры поддержки':'Support measures',
  'Помогаем подобрать и получить гранты, статусы, программы поддержки и сопровождение заявок.':'We help identify and obtain grants, statuses, support programs and application assistance.',
  'Финансы':'Finance',
  'Содействуем привлечению инвестиций, льготного кредитования и выходу на фондовый рынок.':'We facilitate investment, preferential financing and access to capital markets.',
  'Формируем кадровый резерв, содействуем подготовке операторов и созданию базовых кафедр.':'We build a talent pool, support operator training and university departments.',
  'Продвижение и GR':'Promotion and GR',
  'Выстраиваем прямой диалог с государством и представляем участников на отраслевых площадках.':'We build direct dialogue with government and represent members at industry platforms.',
  'Инфраструктура и развитие':'Infrastructure and development',
  'Обеспечиваем доступ к испытательной инфраструктуре, сертификации и центрам коллективного пользования.':'We provide access to testing infrastructure, certification and shared-use centers.',
  'Сообщество':'Community',
  'Объединяем лидеров отрасли, развиваем нетворкинг, менторство и международные партнёрства.':'We unite industry leaders and develop networking, mentoring and international partnerships.',
  'Экспорт':'Export',
  'Сопровождаем международную деятельность и выход на рынки БРИКС и СНГ.':'We support international operations and entry into BRICS and CIS markets.',
  'Партнёр государства':'Government partner',
  'Единое окно входа в отрасль автономных систем':'A single gateway to the autonomous systems industry',
  'Узнать лучшие практики':'Explore best practices',
  'НАС — единое окно входа в отрасль':'NAS is a single gateway to the industry',
  'Консолидируем предложения бизнеса, инвесторов, науки и институтов развития.':'We consolidate proposals from business, investors, science and development institutions.',
  'Технологический суверенитет':'Technological sovereignty',
  'Содействуем локализации производства, компонентной базы и отечественного ПО.':'We support localization of production, components and domestic software.',
  'Эффективность мер поддержки':'Effective support measures',
  'Помогаем компаниям готовить заявки, а органам власти — получать обратную связь о барьерах.':'We help companies prepare applications and authorities receive feedback on barriers.',
  'Рост экономики':'Economic growth',
  'Связываем технологические среды и способствуем масштабированию компаний и производительности труда.':'We connect technology environments and help companies and productivity scale.',
  'Законотворческие инициативы':'Legislative initiatives',
  'Участвуем в создании стратегических документов и устранении регуляторных барьеров.':'We contribute to strategic documents and removal of regulatory barriers.',
  'Развитие всех сред':'Development across all environments',
  'Распространяем практики и меры поддержки на воздушные, наземные, водные, космические и цифровые системы.':'We extend best practices and support measures to air, land, water, space and digital systems.',
  'Стратегическим партнёрам':'Strategic partners',
  'Помогаем найти, проверить и внедрить автономное решение':'We help find, validate and deploy an autonomous solution',
  'Найти автономные решения':'Find autonomous solutions',
  'Единое окно входа':'Single gateway',
  'Один доверенный партнёр для заказчиков и крупного бизнеса.':'One trusted partner for customers and major business.',
  'Национальная витрина решений':'National solutions showcase',
  'Верифицированный каталог отечественных автономных систем и успешных кейсов.':'A verified catalog of domestic autonomous systems and successful cases.',
  '«Биржа заказов»':'Order exchange',
  'Разбираем задачу и подбираем готовые решения и команды под внедрение.':'We analyze the task and match ready solutions and teams for deployment.',
  'Автономность как сервис':'Autonomy as a service',
  'Результат как услуга без необходимости владеть парком, операторами и обслуживанием.':'Outcome as a service without owning fleets, operators or maintenance.',
  'Кадры для отрасли':'Industry talent',
  'Помогаем повышать производительность за счёт автоматизации и роботизации процессов.':'We improve productivity through automation and robotics.',
  'Кооперационные цепочки':'Supply chains',
  'Встраиваем продукты участников в производственные и закупочные циклы крупного бизнеса.':'We integrate members’ products into major companies’ production and procurement cycles.',
  'Учредители':'Founders',
  'Кто стоит у истоков':'Who founded the',
  'Ассоциации':'Association',
  'Три ключевых учредителя — производственные и торговые компании, представляющие интересы индустрии автономных систем.':'Three key founders — manufacturing and trading companies representing the autonomous systems industry.',
  'Интегратор технологий':'Technology integrator',
  'Эксплуатант и интегратор технологических решений. Координирует внедрение автономных систем в ключевые отрасли.':'Operator and technology solutions integrator coordinating autonomous systems deployment in key sectors.',
  'Серийное производство':'Serial production',
  'Производственная компания. Индустриальный участник Ассоциации, ответственный за серийное производство автономных систем.':'Manufacturing company and industrial Association member responsible for serial production of autonomous systems.',
  'Торговый дом':'Trading company',
  'Торговый дом, представляющий интересы поставщиков и эксплуатантов БПС на российском и зарубежном рынках.':'Trading company representing suppliers and operators of unmanned systems in Russian and international markets.',
  'Партнёры':'Partners',
  'Партнёры':'Partners',
  'Ассоциации':'Association',
  'Партнёры Ассоциации':'Association partners',
  
  'Организации, с которыми Ассоциация НАС выстраивает отраслевое взаимодействие в сфере автономных систем.':'Organizations with which NAS builds industry cooperation in autonomous systems.',
  'При поддержке':'Supported by',
  'Создана':'Created',
  'при поддержке':'with support',
  'Минпромторг России':'Ministry of Industry and Trade of Russia',
  'Минтранс России':'Ministry of Transport of Russia',
  'Фонд НТИ':'NTI Foundation',
  'Создана и развивается при поддержке федеральных органов власти и институтов развития.':'Created and developed with support from federal authorities and development institutions.',
  'Люди, которые':'People who',
  'двигают отрасль':'move the industry forward',
  'Руководители Ассоциации координируют работу с государственными ведомствами, эксплуатантами и индустрией автономных систем.':'Association leaders coordinate work with government agencies, operators and the autonomous systems industry.',
  'Председатель Правления Ассоциации НАС':'Chairman of the NAS Board',
  'Директор Ассоциации НАС':'Director of NAS',
  'Исполнительный директор Ассоциации НАС':'Executive Director of NAS',
  'Руководитель управления по работе с государственными органами':'Head of Government Relations',
  'Руководитель управления по развитию образовательных проектов':'Head of Educational Projects Development',
  'Руководитель управления по развитию кадрового потенциала и компетенций':'Head of Human Capital and Competency Development',
  'Советник Председателя Правления Ассоциации НАС':'Advisor to the Chairman of the NAS Board',
  'Руководитель аппарата Председателя Правления':'Head of the Chairman’s Office',
  'Руководитель управления по проектной деятельности':'Head of Project Management',
  'Руководитель управления по научной деятельности':'Head of Research',
  'Руководитель управления по работе с участниками':'Head of Member Relations',
  'Заместитель руководителя управления по работе с государственными органами':'Deputy Head of Government Relations',
  'Заместитель руководителя корпоративного управления':'Deputy Head of Corporate Governance',
  'Заместитель руководителя управления аналитики':'Deputy Head of Analytics',
  'Главный бухгалтер':'Chief Accountant',
  'Посмотреть всю команду':'View full team',
  'Свернуть команду':'Collapse team',
  'Что происходит':'What is happening',
  'в отрасли сейчас':'in the industry now',
  'Соглашения':'Agreements',
  'Читать ↗':'Read ↗',
  'События':'Events',
  'Отрасль':'Industry',
  'Связаться с':'Contact the',
  'Ассоциацией':'Association',
  'Для участия, партнёрства, подбора автономного решения или получения экспертной поддержки.':'For membership, partnerships, autonomous solution selection or expert support.',
  'Кластер НАС':'NAS Cluster',
  'Раменский бульвар, д. 1':'1 Ramensky Boulevard',
  'Открыть на карте ↗':'Open map ↗',
  'На карте':'Map',
  'Яндекс Карты ↗':'Yandex Maps ↗',
  'Контактная информация':'Contact information',
  'Телефон':'Phone',
  'Адрес':'Address',
  'г. Москва, Раменский бульвар, д. 1':'Moscow, 1 Ramensky Boulevard',
  'Обратная связь':'Feedback',
  'Написать сообщение':'Send a message',
  'ФИО *':'Full name *',
  'Организация':'Organization',
  'Категория':'Category',
  'Участие в Ассоциации':'Association membership',
  'Подбор решения':'Solution selection',
  'Экспертная поддержка':'Expert support',
  'Сообщение *':'Message *',
  'Я даю согласие на обработку персональных данных в соответствии с Политикой конфиденциальности.':'I consent to personal data processing in accordance with the Privacy Policy.',
  'Отправить сообщение':'Send message',
  'Открытое участие':'Open participation',
  'Будьте в курсе развития автономной экономики России':'Stay informed about Russia’s autonomous economy',
  'Стратегические обновления, новости индустрии и приглашения на встречи Ассоциации — прямо на ваш email.':'Strategic updates, industry news and invitations to Association meetings — directly to your email.',
  'Подписаться ↗':'Subscribe ↗',
  'Первая в России отраслевая ассоциация эксплуатантов и производителей автономных систем во всех средах применения.':'Russia’s first industry association of autonomous systems operators and manufacturers across all environments.',
  'Об ассоциации':'About',
  'Документы':'Documents',
  'Деятельность':'Activities',
  'Раменский бульвар, д. 1 · Москва':'1 Ramensky Boulevard · Moscow',
  '© 2026 Ассоциация «Национальные автономные системы»':'© 2026 National Autonomous Systems Association',
  'Политика конфиденциальности':'Privacy Policy',
  'Условия использования':'Terms of Use',
  'Ассоциация НАС и компания «Транстелематика» подписали соглашение о развитии автономных систем для пассажирского транспорта':'NAS Association and Transtelematics signed an agreement to develop autonomous systems for passenger transport',
  'Ассоциация НАС провела круглый стол по национальной стратегии развития автономных систем до 2036 года':'NAS Association held a round table on the national autonomous systems development strategy through 2036',
  'Дмитрий Афанасьев принял участие в дискуссии Форума ИКС о подготовке кадров для отрасли БАС':'Dmitry Afanasyev took part in an ICS Forum discussion on workforce development for the unmanned aviation industry',
  'Ассоциация НАС провела стратегическую сессию «Развитие автономных систем на Дальнем Востоке»':'NAS Association held a strategic session on autonomous systems development in the Russian Far East',
}));

const i18nZh = new Map(Object.entries({
  'Ассоциация':'协会',
  'Среды':'应用环境',
  'Направления':'重点方向',
  'Применение':'应用领域',
  'Команда':'团队',
  'Новости':'新闻',
  'Контакты':'联系我们',
  'Вступить в Ассоциацию':'加入协会',
  'Автономные системы для':'自主系统服务于',
  'неба':'天空',
  'земли':'陆地',
  'воды':'水域',
  'космоса':'太空',
  'и цифры':'数字世界',
  'и':'',
  'цифры':'数字世界',
  'Объединяем разработчиков, производителей, заказчиков и экспертов для развития гражданских автономных технологий во всех пяти средах.':'我们汇聚开发者、制造商、客户和专家，共同推动五大环境中的民用自主技术发展。',
  'Учреждена 6 апреля':'成立于4月6日',
  'Москва':'莫斯科',
  'ОГРН 1267700132853':'注册号 1267700132853',
  'Вода':'水域',
  'Безэкипажные надводные и подводные суда':'无人水面与水下船舶',
  'Земля':'陆地',
  'Робототехника и автономный транспорт':'机器人技术与自主交通',
  'Небо':'天空',
  'Беспилотные авиационные системы':'无人航空系统',
  'Космос':'太空',
  'Спутниковые сервисы и космические технологии':'卫星服务与航天技术',
  'Цифровая':'数字',
  'среда':'环境',
  'Искусственный интеллект, данные и связь':'人工智能、数据与通信',
  'Об Ассоциации':'关于协会',
  'Ассоциация —':'协会——',
  'партнёр государства':'国家的合作伙伴',
  'в развитии автономных систем':'推动自主系统发展',
  'Консолидируем отрасль, формируем зрелый рынок и участвуем в создании условий для технологического суверенитета.':'我们整合行业力量，培育成熟市场，并参与构建技术主权所需的条件。',
  'Поручение Президента':'总统指示',
  'Правительству Российской Федерации разработать при участии Ассоциации эксплуатантов и производителей автономных систем «Национальные автономные системы» и представить национальный план развития автономных систем на период до 2036 года.':'俄罗斯联邦政府应在“国家自主系统”协会参与下制定并提交2036年前国家自主系统发展计划。',
  'Поручение В. В. Путина по итогам ПМЭФ-2026':'2026年圣彼得堡国际经济论坛后续指示',
  'Пр-1758, п. 1а':'Pr-1758，第1a项',
  'Видение':'愿景',
  'Россия — мировой лидер по производительности труда и технологическому суверенитету за счёт применения автономных систем во всех средах: в воздухе, на земле, на воде, в космосе и цифровой среде.':'通过在空中、陆地、水域、太空和数字环境中应用自主系统，使俄罗斯成为劳动生产率和技术主权方面的世界领先者。',
  'Роль':'角色',
  'НАС — центр консолидации отрасли автономных систем России, обеспечивающий взаимодействие государства, бизнеса, науки и регионов для формирования единой и ускоренно внедряемой экосистемы.':'NAS 是俄罗斯自主系统行业的协同中心，连接政府、企业、科研机构和地区，共建统一且快速落地的生态体系。',
  'Миссия':'使命',
  'Обеспечивать рост производительности труда и технологического суверенитета за счёт формирования зрелого рынка гражданских автономных систем России во всех средах.':'通过建设覆盖所有环境的成熟民用自主系统市场，提高劳动生产率并增强技术主权。',
  'Цель к 2030':'2030年目标',
  'Создать устойчивую экосистему, обеспечивающую массовое внедрение, серийное производство и экспорт автономных систем.':'建立可持续生态体系，实现自主系统的大规模应用、批量生产与出口。',
  'Пять сред':'五大环境',
  'Пять сред —':'五大环境——',
  'единая экосистема':'一个生态体系',
  'Пять равноправных сред применения автономных систем — вода, земля, воздух, космос и цифровая среда.':'自主系统拥有五个平等的应用环境：水域、陆地、空中、太空和数字环境。',
  'Безэкипажные надводные и подводные суда.':'无人水面与水下船舶。',
  'Высокоавтоматизированные транспортные средства, автономный транспорт и робототехника.':'高度自动化车辆、自主交通和机器人技术。',
  'Воздух':'空中',
  'Беспилотные авиационные системы.':'无人航空系统。',
  'Спутниковые системы связи и наблюдения.':'卫星通信与观测系统。',
  'Цифровая среда':'数字环境',
  'Программное обеспечение для управления и искусственный интеллект.':'控制软件与人工智能。',
  'Рынки применения':'应用市场',
  'Сельское хозяйство':'农业',
  'Логистика':'物流',
  'Экология':'生态环保',
  'Строительство и ЖКХ':'建筑与公用事业',
  'МЧС и безопасность':'应急与安全',
  'Робототехника и ИИ':'机器人与人工智能',
  'Контрольно-надзорная деятельность':'监管与监督',
  'Образование':'教育',
  'Шоу-индустрия':'演艺行业',
  'Энергетика':'能源',
  'Добыча полезных ископаемых':'矿业',
  'Медицина':'医疗健康',
  'Ключевые направления':'重点方向',
  'Ключевые':'重点',
  'направления':'方向',
  'Развиваем технологии, формируем стандарты, объединяем усилия для внедрения автономных систем во всех сферах.':'我们发展技术、建立标准、汇聚力量，推动自主系统在各行业落地。',
  'От исследований и нормативной базы до реальных решений в экономике, социальной сфере и государственном управлении.':'从科研与法规体系到经济、社会和公共治理中的实际解决方案。',
  'Сообщество и сервисы для членов':'会员社区与服务',
  'Платформа сотрудничества, обмена опытом и развития отрасли.':'合作、经验交流与行业发展的平台。',
  'компаний':'企业',
  'и экспертов':'与专家',
  'Спрос, внедрение и доступ к рынку':'需求、落地与市场准入',
  'Содействуем выводу решений на рынок и масштабированию применения.':'帮助解决方案进入市场并扩大应用规模。',
  'пилотных':'试点',
  'проектов':'项目',
  'Партнёрства: государство и корпорации':'伙伴关系：政府与企业',
  'Объединяем усилия бизнеса, государства и науки для достижения национальных целей.':'汇聚企业、政府与科研力量，共同实现国家目标。',
  'стратегических':'战略',
  'соглашений':'协议',
  'Аналитика и законотворчество':'分析与法规建设',
  'Формируем экспертную базу и предлагаем решения для развития нормативной среды.':'建立专家知识基础，为监管环境发展提出解决方案。',
  'аналитических':'分析',
  'исследований':'研究',
  'Технологии и наука':'技术与科学',
  'Поддерживаем исследования, разработку и внедрение передовых технологий.':'支持前沿技术的研究、开发和应用。',
  'научных':'科研',
  'Кадры и компетенции':'人才与能力',
  'Развиваем человеческий капитал и формируем новый рынок профессий.':'发展人力资本，形成新的职业市场。',
  'образовательных':'教育',
  'программ':'项目',
  'Все направления':'全部方向',
  'Посмотреть подробное описание':'查看详细说明',
  'Технологии':'技术',
  'Партнёрство':'合作',
  'Новые рынки':'新市场',
  'Кадры':'人才',
  'Стандарты':'标准',
  'Исследования':'研究',
  'Развитие':'发展',
  'Вместе формируем будущее автономных систем':'共同塑造自主系统的未来',
  'Сферы применения':'应用领域',
  'Сферы, где автономные системы':'自主系统正在',
  'создают эффект':'创造价值的领域',
  'Автономные технологии уже работают в ключевых секторах экономики — от агропромышленности и логистики до космоса, медицины и городской инфраструктуры.':'自主技术已应用于关键经济领域——从农业与物流到太空、医疗和城市基础设施。',
  'Строительство':'建筑',
  'ЖКХ':'公用事业',
  'Связь и космос':'通信与太空',
  'Шоу-индустрия и выставочная деятельность':'演艺与展览',
  'Медицина и здравоохранение':'医疗与健康',
  'Культура и медиа':'文化与媒体',
  'Ассоциация в интересах':'协会服务对象',
  'Одна экосистема —':'一个生态体系——',
  'три сценария взаимодействия':'三种互动场景',
  'Ассоциация объединяет интересы участников рынка, государства и заказчиков. Контент сохранён, но представлен в более ясной интерактивной структуре.':'协会在清晰的交互结构中协调市场参与者、政府与客户的利益。',
  'Участникам':'会员',
  'Государству':'政府',
  'Заказчикам':'客户',
  'Эксплуатантам и производителям':'运营商与制造商',
  'Ускоряем путь от технологии до устойчивого рынка':'加速技术走向可持续市场',
  'Доступ к рынку и спрос':'市场准入与需求',
  'Формируем спрос, объединяем участников и помогаем войти в кооперационные цепочки крупных заказчиков.':'培育需求、连接参与者，并帮助进入大型客户的协作链。',
  'Меры поддержки':'支持措施',
  'Помогаем подобрать и получить гранты, статусы, программы поддержки и сопровождение заявок.':'帮助选择并获得资助、资格、支持计划及申请辅导。',
  'Финансы':'融资',
  'Содействуем привлечению инвестиций, льготного кредитования и выходу на фондовый рынок.':'协助吸引投资、优惠融资并进入资本市场。',
  'Формируем кадровый резерв, содействуем подготовке операторов и созданию базовых кафедр.':'建设人才储备，支持运营人员培训和高校专业基地建设。',
  'Продвижение и GR':'推广与政府关系',
  'Выстраиваем прямой диалог с государством и представляем участников на отраслевых площадках.':'建立与政府的直接沟通，并代表会员参与行业平台。',
  'Инфраструктура и развитие':'基础设施与发展',
  'Обеспечиваем доступ к испытательной инфраструктуре, сертификации и центрам коллективного пользования.':'提供测试基础设施、认证及共享中心的使用机会。',
  'Сообщество':'社区',
  'Объединяем лидеров отрасли, развиваем нетворкинг, менторство и международные партнёрства.':'汇聚行业领军者，发展交流、导师机制与国际合作。',
  'Экспорт':'出口',
  'Сопровождаем международную деятельность и выход на рынки БРИКС и СНГ.':'支持国际业务并进入金砖国家与独联体市场。',
  'Партнёр государства':'政府合作伙伴',
  'Единое окно входа в отрасль автономных систем':'自主系统行业的统一入口',
  'Узнать лучшие практики':'了解最佳实践',
  'НАС — единое окно входа в отрасль':'NAS——行业统一入口',
  'Консолидируем предложения бизнеса, инвесторов, науки и институтов развития.':'整合企业、投资者、科研机构和发展机构的建议。',
  'Технологический суверенитет':'技术主权',
  'Содействуем локализации производства, компонентной базы и отечественного ПО.':'推动生产、本地零部件和国产软件的本地化。',
  'Эффективность мер поддержки':'支持措施成效',
  'Помогаем компаниям готовить заявки, а органам власти — получать обратную связь о барьерах.':'帮助企业准备申请，也帮助政府获得有关障碍的反馈。',
  'Рост экономики':'经济增长',
  'Связываем технологические среды и способствуем масштабированию компаний и производительности труда.':'连接技术环境，促进企业规模化与劳动生产率提升。',
  'Законотворческие инициативы':'立法倡议',
  'Участвуем в создании стратегических документов и устранении регуляторных барьеров.':'参与制定战略文件并消除监管障碍。',
  'Развитие всех сред':'全环境发展',
  'Распространяем практики и меры поддержки на воздушные, наземные, водные, космические и цифровые системы.':'将最佳实践和支持措施扩展至空中、陆地、水域、太空与数字系统。',
  'Стратегическим партнёрам':'战略合作伙伴',
  'Помогаем найти, проверить и внедрить автономное решение':'帮助寻找、验证并部署自主解决方案',
  'Найти автономные решения':'寻找自主解决方案',
  'Единое окно входа':'统一入口',
  'Один доверенный партнёр для заказчиков и крупного бизнеса.':'为客户和大型企业提供一个可信赖的合作伙伴。',
  'Национальная витрина решений':'国家解决方案展厅',
  'Верифицированный каталог отечественных автономных систем и успешных кейсов.':'经验证的国产自主系统与成功案例目录。',
  '«Биржа заказов»':'“订单交易所”',
  'Разбираем задачу и подбираем готовые решения и команды под внедрение.':'分析需求并匹配可直接部署的解决方案与团队。',
  'Автономность как сервис':'自主能力即服务',
  'Результат как услуга без необходимости владеть парком, операторами и обслуживанием.':'无需自有设备、运营人员和维护体系，即可按服务获得结果。',
  'Кадры для отрасли':'行业人才',
  'Помогаем повышать производительность за счёт автоматизации и роботизации процессов.':'通过流程自动化与机器人化提升生产率。',
  'Кооперационные цепочки':'协作链',
  'Встраиваем продукты участников в производственные и закупочные циклы крупного бизнеса.':'将会员产品嵌入大型企业的生产与采购流程。',
  'Учредители':'创始成员',
  'Кто стоит у истоков':'谁共同创立',
  'Ассоциации':'协会',
  'Три ключевых учредителя — производственные и торговые компании, представляющие интересы индустрии автономных систем.':'三家核心创始成员——代表自主系统产业利益的制造与贸易企业。',
  'Интегратор технологий':'技术集成商',
  'Эксплуатант и интегратор технологических решений. Координирует внедрение автономных систем в ключевые отрасли.':'技术解决方案运营商与集成商，协调自主系统在重点行业的落地。',
  'Серийное производство':'批量生产',
  'Производственная компания. Индустриальный участник Ассоциации, ответственный за серийное производство автономных систем.':'制造企业，负责自主系统批量生产的协会产业成员。',
  'Торговый дом':'贸易公司',
  'Торговый дом, представляющий интересы поставщиков и эксплуатантов БПС на российском и зарубежном рынках.':'代表无人系统供应商与运营商在俄罗斯及海外市场开展业务的贸易公司。',
  'Партнёры':'合作伙伴',
  'Партнёры':'合作伙伴',
  'Ассоциации':'协会',
  'Партнёры Ассоциации':'协会合作伙伴',
  'по всей стране':'合作网络',
  'Организации, с которыми Ассоциация НАС выстраивает отраслевое взаимодействие в сфере автономных систем.':'NAS 协会在自主系统领域开展行业合作的组织。',
  'При поддержке':'支持单位',
  'Создана':'在支持下成立',
  'при поддержке':'支持',
  'Минпромторг России':'俄罗斯工业和贸易部',
  'Минтранс России':'俄罗斯交通部',
  'Фонд НТИ':'NTI 基金会',
  'Создана и развивается при поддержке федеральных органов власти и институтов развития.':'协会在联邦政府机构和发展机构支持下成立并持续发展。',
  'Люди, которые':'推动行业发展的',
  'двигают отрасль':'核心团队',
  'Руководители Ассоциации координируют работу с государственными ведомствами, эксплуатантами и индустрией автономных систем.':'协会管理团队协调政府部门、运营商与自主系统产业之间的合作。',
  'Председатель Правления Ассоциации НАС':'NAS 协会董事会主席',
  'Директор Ассоциации НАС':'NAS 协会主任',
  'Исполнительный директор Ассоциации НАС':'NAS 协会执行主任',
  'Руководитель управления по работе с государственными органами':'政府关系部门负责人',
  'Руководитель управления по развитию образовательных проектов':'教育项目发展部负责人',
  'Руководитель управления по развитию кадрового потенциала и компетенций':'人才与能力发展部负责人',
  'Советник Председателя Правления Ассоциации НАС':'NAS协会董事会主席顾问',
  'Руководитель аппарата Председателя Правления':'董事会主席办公室主任',
  'Руководитель управления по проектной деятельности':'项目管理部负责人',
  'Руководитель управления по научной деятельности':'科研部负责人',
  'Руководитель управления по работе с участниками':'会员关系部负责人',
  'Заместитель руководителя управления по работе с государственными органами':'政府关系部副负责人',
  'Заместитель руководителя корпоративного управления':'公司治理副负责人',
  'Заместитель руководителя управления аналитики':'分析部副负责人',
  'Главный бухгалтер':'总会计师',
  'Посмотреть всю команду':'查看完整团队',
  'Свернуть команду':'收起团队',
  'Что происходит':'行业正在发生',
  'в отрасли сейчас':'什么',
  'Соглашения':'协议',
  'Читать ↗':'阅读 ↗',
  'События':'活动',
  'Отрасль':'行业',
  'Связаться с':'联系',
  'Ассоциацией':'协会',
  'Для участия, партнёрства, подбора автономного решения или получения экспертной поддержки.':'如需加入协会、开展合作、选择自主解决方案或获得专家支持，请联系我们。',
  'Кластер НАС':'NAS 集群',
  'Раменский бульвар, д. 1':'拉缅斯基大道1号',
  'Открыть на карте ↗':'在地图中打开 ↗',
  'На карте':'地图',
  'Яндекс Карты ↗':'Yandex 地图 ↗',
  'Контактная информация':'联系信息',
  'Телефон':'电话',
  'Адрес':'地址',
  'г. Москва, Раменский бульвар, д. 1':'莫斯科，拉缅斯基大道1号',
  'Обратная связь':'反馈',
  'Написать сообщение':'发送消息',
  'ФИО *':'姓名 *',
  'Организация':'机构',
  'Категория':'类别',
  'Участие в Ассоциации':'加入协会',
  'Подбор решения':'解决方案匹配',
  'Экспертная поддержка':'专家支持',
  'Сообщение *':'消息 *',
  'Я даю согласие на обработку персональных данных в соответствии с Политикой конфиденциальности.':'我同意根据《隐私政策》处理个人数据。',
  'Отправить сообщение':'发送消息',
  'Открытое участие':'开放参与',
  'Будьте в курсе развития автономной экономики России':'关注俄罗斯自主经济的发展',
  'Стратегические обновления, новости индустрии и приглашения на встречи Ассоциации — прямо на ваш email.':'战略动态、行业新闻和协会活动邀请将直接发送到您的邮箱。',
  'Подписаться ↗':'订阅 ↗',
  'Первая в России отраслевая ассоциация эксплуатантов и производителей автономных систем во всех средах применения.':'俄罗斯首个覆盖所有应用环境的自主系统运营商与制造商行业协会。',
  'Об ассоциации':'关于协会',
  'Документы':'文件',
  'Деятельность':'活动',
  'Раменский бульвар, д. 1 · Москва':'拉缅斯基大道1号 · 莫斯科',
  '© 2026 Ассоциация «Национальные автономные системы»':'© 2026 国家自主系统协会',
  'Политика конфиденциальности':'隐私政策',
  'Условия использования':'使用条款',
  'Ассоциация НАС и компания «Транстелематика» подписали соглашение о развитии автономных систем для пассажирского транспорта':'NAS 协会与 Transtelematics 签署客运自主系统发展合作协议',
  'Ассоциация НАС провела круглый стол по национальной стратегии развития автономных систем до 2036 года':'NAS 协会举办国家自主系统发展战略（至2036年）圆桌会议',
  'Дмитрий Афанасьев принял участие в дискуссии Форума ИКС о подготовке кадров для отрасли БАС':'德米特里·阿法纳西耶夫参加 ICS 论坛关于无人航空系统行业人才培养的讨论',
  'Ассоциация НАС провела стратегическую сессию «Развитие автономных систем на Дальнем Востоке»':'NAS 协会举办“远东地区自主系统发展”战略会议',
}));;

const translatableNodes = [];
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
  acceptNode(node) {
    if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
    if (node.parentElement?.closest('script,style')) return NodeFilter.FILTER_REJECT;
    const ru = node.nodeValue.trim();
    return (i18nEn.has(ru) || i18nZh.has(ru)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
  }
});
let textNode;
while ((textNode = walker.nextNode())) {
  translatableNodes.push({ node: textNode, ru: textNode.nodeValue.trim(), prefix: textNode.nodeValue.match(/^\s*/)?.[0] || '', suffix: textNode.nodeValue.match(/\s*$/)?.[0] || '' });
}

const placeholderPairsEn = new Map([
  ['Иванов Иван Иванович','Ivan Ivanov'],
  ['ООО «Компания»','Company LLC'],
  ['Кратко опишите ваш запрос','Briefly describe your request']
]);
const placeholderPairsZh = new Map([
  ['Иванов Иван Иванович','伊万·伊万诺夫'],
  ['ООО «Компания»','公司名称'],
  ['Кратко опишите ваш запрос','请简要描述您的需求']
]);
const placeholderElements = [...document.querySelectorAll('input[placeholder], textarea[placeholder]')].map((el) => ({ el, ru: el.getAttribute('placeholder') }));

const langSwitch = document.querySelector('.language-switch');
const langButtons = [...document.querySelectorAll('.language-switch button[data-lang]')];
let currentLanguage = 'ru';

function getTranslatedText(ru, lang) {
  if (lang === 'en') return i18nEn.get(ru) || ru;
  if (lang === 'zh') return i18nZh.get(ru) || ru;
  return ru;
}

function setLanguage(lang) {
  if (!['ru','en','zh'].includes(lang)) return;
  currentLanguage = lang;
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
  const langIndex = lang === 'ru' ? 0 : lang === 'en' ? 1 : 2;
  langSwitch?.style.setProperty('--lang-index', String(langIndex));
  langButtons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.lang === lang));

  translatableNodes.forEach(({node, ru, prefix, suffix}) => {
    node.nodeValue = prefix + getTranslatedText(ru, lang) + suffix;
  });
  placeholderElements.forEach(({el, ru}) => {
    const value = lang === 'en'
      ? (placeholderPairsEn.get(ru) || ru)
      : lang === 'zh'
        ? (placeholderPairsZh.get(ru) || ru)
        : ru;
    el.setAttribute('placeholder', value);
  });

  const title = document.querySelector('title');
  if (title) {
    title.textContent = lang === 'en'
      ? 'NAS — National Autonomous Systems'
      : lang === 'zh'
        ? 'NAS — 国家自主系统协会'
        : 'НАС — Национальные автономные системы';
  }

  updateTeamToggleCopy();
  localStorage.setItem('nas-language', lang);
}

langButtons.forEach((btn) => {
  btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});

const savedLanguage = localStorage.getItem('nas-language');
setLanguage(['ru','en','zh'].includes(savedLanguage) ? savedLanguage : 'ru');
