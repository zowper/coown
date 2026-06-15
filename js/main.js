document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Menu & Sliding Indicator Setup
    const hamburger = document.getElementById('hamburger');
    const navContainer = document.getElementById('nav-container');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Create and append sliding indicator background (only on desktop layout)
    const indicator = document.createElement('div');
    indicator.className = 'nav-indicator';
    if (navMenu) {
        navMenu.appendChild(indicator);
    }

    let isScrollingFromClick = false;
    let scrollTimeout = null;

    // Update indicator size and position
    function updateNavIndicator() {
        const activeLink = navMenu ? navMenu.querySelector('.nav-link.active') : null;
        // Check if desktop nav is active (nav-indicator is visible)
        const isDesktop = window.innerWidth > 1024;
        
        if (activeLink && indicator && isDesktop) {
            const linkRect = activeLink.getBoundingClientRect();
            const menuRect = navMenu.getBoundingClientRect();
            
            // Position coordinates relative to parent navMenu
            const x = linkRect.left - menuRect.left + navMenu.scrollLeft;
            const y = linkRect.top - menuRect.top + navMenu.scrollTop;
            
            indicator.style.width = `${linkRect.width}px`;
            indicator.style.height = `${linkRect.height}px`;
            indicator.style.transform = `translate(${x}px, ${y}px)`;
            indicator.style.opacity = '1';
        } else if (indicator) {
            indicator.style.opacity = '0';
        }
    }

    // Toggle Mobile Navigation
    if (hamburger && navContainer) {
        hamburger.addEventListener('click', () => {
            const isActive = navContainer.classList.toggle('active');
            hamburger.classList.toggle('active', isActive);
            hamburger.setAttribute('aria-expanded', isActive);
            document.body.classList.toggle('nav-active', isActive);
        });
    }

    // Navigation Link Click Handlers
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Close mobile menu if open
            if (hamburger) {
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
            if (navContainer) {
                navContainer.classList.remove('active');
            }
            document.body.classList.remove('nav-active');
            
            // Set active class on clicked link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Instantly update the indicator position
            updateNavIndicator();
            
            // Pause scroll-spy updates temporarily during smooth scrolling
            isScrollingFromClick = true;
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrollingFromClick = false;
            }, 850);
        });
    });

    // Map the main links to their corresponding section elements for Scroll Spy
    const sectionsToWatch = [];
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
            const section = document.querySelector(href);
            if (section) {
                sectionsToWatch.push({
                    link: link,
                    section: section
                });
            }
        }
    });

    function spyScroll() {
        if (isScrollingFromClick) return;

        const scrollPosition = window.scrollY + 120; // offset for header height and safety margin
        const isAtBottom = (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 15;
        
        let currentActive = null;

        if (isAtBottom && sectionsToWatch.length > 0) {
            currentActive = sectionsToWatch[sectionsToWatch.length - 1];
        } else {
            for (let i = 0; i < sectionsToWatch.length; i++) {
                const item = sectionsToWatch[i];
                if (item.section.offsetTop <= scrollPosition) {
                    currentActive = item;
                } else {
                    break;
                }
            }
        }

        // Default to the first section if none matched yet
        if (!currentActive && sectionsToWatch.length > 0) {
            currentActive = sectionsToWatch[0];
        }

        if (currentActive) {
            let changed = false;
            const activeLink = currentActive.link;

            navLinks.forEach(link => {
                if (link === activeLink) {
                    if (!link.classList.contains('active')) {
                        link.classList.add('active');
                        changed = true;
                    }
                } else {
                    if (link.classList.contains('active')) {
                        link.classList.remove('active');
                        changed = true;
                    }
                }
            });

            if (changed) {
                updateNavIndicator();
            }
        }
    }

    // Add scrolled class to top header on scroll
    const topHeader = document.getElementById('top-header');
    function handleHeaderScroll() {
        if (topHeader) {
            if (window.scrollY > 10) {
                topHeader.classList.add('scrolled');
            } else {
                topHeader.classList.remove('scrolled');
            }
        }
    }

    // Scroll, Resize, and Transition listeners
    window.addEventListener('scroll', () => {
        window.requestAnimationFrame(spyScroll);
        handleHeaderScroll();
    });

    window.addEventListener('resize', () => {
        window.requestAnimationFrame(updateNavIndicator);
    });

    if (navContainer) {
        navContainer.addEventListener('transitionend', () => {
            updateNavIndicator();
        });
    }

    // Initialize position on page load
    setTimeout(() => {
        spyScroll();
        handleHeaderScroll();
        updateNavIndicator();
    }, 100);

    // 2. FAQ Accordion Toggles
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-question-btn');
        const answer = item.querySelector('.faq-answer');

        if (btn && answer) {
            btn.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    if (otherAnswer) {
                        otherAnswer.style.maxHeight = null;
                    }
                });

                if (!isActive) {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        }
    });

    // 3. Rent Equalization Calculator
    const homePriceInput = document.getElementById('home-price');
    const downPaymentInput = document.getElementById('down-payment');
    const interestRateInput = document.getElementById('interest-rate');
    const loanTermInput = document.getElementById('loan-term');
    const expensesInput = document.getElementById('monthly-expenses');
    
    const rentMainInput = document.getElementById('rent-main');
    const rentAduInput = document.getElementById('rent-downstairs');

    const partnerANameInput = null;
    const partnerBNameInput = null;
    const appreciationRateInput = document.getElementById('appreciation-rate');
    const splitSlider = document.getElementById('split-slider');
    
    // 5-Year Exit & Refinance inputs
    const timelineHomeValueInput = document.getElementById('timeline-home-value');
    const timelineDownPaymentInput = document.getElementById('timeline-down-payment');
    const timelineInterestRateInput = document.getElementById('timeline-interest-rate');
    const timelineAppreciationInput = document.getElementById('timeline-appreciation');
    const timelineSplitSlider = document.getElementById('timeline-split-slider');
    const timelineSplitLabelA = document.getElementById('timeline-split-label-a');
    const timelineSplitLabelB = document.getElementById('timeline-split-label-b');
    
    const splitLabelA = document.getElementById('split-label-a');
    const splitLabelB = document.getElementById('split-label-b');
    
    const mainBaseLabel = document.getElementById('main-base-label');
    const aduBaseLabel = document.getElementById('downstairs-base-label');

    const totalMonthlyOutput = document.getElementById('total-monthly-payment');
    const mainBaseOutput = document.getElementById('main-base-payment');
    const aduBaseOutput = document.getElementById('downstairs-base-payment');
    const equalizationAmountOutput = document.getElementById('equalization-amount');
    const equalizationDirectionOutput = document.getElementById('equalization-direction');
    const mainNetOutput = document.getElementById('main-net-payment');
    const downstairsNetOutput = document.getElementById('downstairs-net-payment');

    // Global timeline data array calculated dynamically
    let dynamicTimelineData = [];
    let globalMonthlyExpenses = 800;

    function calculateEqualization() {
        const partnerAName = 'Upstairs Family';
        const partnerBName = 'Downstairs Family';
        
        const splitA = splitSlider ? (parseInt(splitSlider.value) || 50) : 50;
        const splitB = 100 - splitA;

        // Update slider labels
        if (splitLabelA) splitLabelA.textContent = `${partnerAName}: ${splitA}%`;
        if (splitLabelB) splitLabelB.textContent = `${partnerBName}: ${splitB}%`;

        // Update list labels
        if (mainBaseLabel) mainBaseLabel.textContent = `${partnerAName} Base Share`;
        if (aduBaseLabel) aduBaseLabel.textContent = `${partnerBName} Base Share`;

        const homePrice = timelineHomeValueInput ? (parseFloat(timelineHomeValueInput.value) || 0) : 750000;
        const downPaymentPercent = timelineDownPaymentInput ? (parseFloat(timelineDownPaymentInput.value) || 0) : 20;
        const interestRate = timelineInterestRateInput ? (parseFloat(timelineInterestRateInput.value) || 0) : 6.25;
        const loanTerm = 30;
        const monthlyExpenses = globalMonthlyExpenses;

        const appraisalMain = rentMainInput ? (parseFloat(rentMainInput.value) || 0) : 0;
        const appraisalDownstairs = rentAduInput ? (parseFloat(rentAduInput.value) || 0) : 0;

        // Calculate Monthly Mortgage
        const downPaymentAmount = homePrice * (downPaymentPercent / 100);
        const loanAmount = homePrice - downPaymentAmount;

        let monthlyMortgage = 0;
        if (loanAmount > 0) {
            const monthlyRate = (interestRate / 100) / 12;
            const totalPayments = loanTerm * 12;
            if (monthlyRate === 0) {
                monthlyMortgage = loanAmount / totalPayments;
            } else {
                monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
            }
        }

        const totalMonthlyCost = monthlyMortgage + monthlyExpenses;

        // Determine splits
        const shareMain = splitA / 100;
        const shareDownstairs = splitB / 100;

        const mainBaseShare = totalMonthlyCost * shareMain;
        const downstairsBaseShare = totalMonthlyCost * shareDownstairs;

        // Rent Equalization Calculation:
        const totalUtility = appraisalMain + appraisalDownstairs;
        const entitledMain = totalUtility * shareMain;
        
        const equalizationPayment = entitledMain - appraisalMain; 
        
        let displayEqualization = 0;
        let directionText = "Balanced split:";
        let mainNet = mainBaseShare;
        let downstairsNet = downstairsBaseShare;

        if (equalizationPayment < 0) {
            // Main consumed more than entitled. Main pays Downstairs.
            displayEqualization = Math.abs(equalizationPayment);
            directionText = `${partnerAName} pays ${partnerBName}:`;
            mainNet = mainBaseShare + displayEqualization;
            downstairsNet = downstairsBaseShare - displayEqualization;
        } else if (equalizationPayment > 0) {
            // Downstairs consumed more than entitled. Downstairs pays Main.
            displayEqualization = Math.abs(equalizationPayment);
            directionText = `${partnerBName} pays ${partnerAName}:`;
            mainNet = mainBaseShare - displayEqualization;
            downstairsNet = downstairsBaseShare + displayEqualization;
        }

        // Render Outputs
        if (totalMonthlyOutput) totalMonthlyOutput.textContent = '$' + Math.round(totalMonthlyCost).toLocaleString();
        if (mainBaseOutput) mainBaseOutput.textContent = '$' + Math.round(mainBaseShare).toLocaleString();
        if (aduBaseOutput) aduBaseOutput.textContent = '$' + Math.round(downstairsBaseShare).toLocaleString();
        if (equalizationAmountOutput) equalizationAmountOutput.textContent = '$' + Math.round(displayEqualization).toLocaleString() + ' / mo';
        if (equalizationDirectionOutput) equalizationDirectionOutput.textContent = directionText;
        if (mainNetOutput) mainNetOutput.textContent = '$' + Math.round(mainNet).toLocaleString();
        if (downstairsNetOutput) downstairsNetOutput.textContent = '$' + Math.round(downstairsNet).toLocaleString();

        // Dynamic output labels for final shares
        const mainNameLabel = document.getElementById('main-name-label');
        if (mainNameLabel) mainNameLabel.textContent = `${partnerAName} Net Out-of-Pocket`;
        const downstairsNameLabel = document.getElementById('downstairs-name-label');
        if (downstairsNameLabel) downstairsNameLabel.textContent = `${partnerBName} Net Out-of-Pocket`;

        // Update Share Bar Visuals
        const mainBar = document.getElementById('segment-main-bar');
        const downstairsBar = document.getElementById('segment-downstairs-bar');
        const mainPct = document.getElementById('pct-main-label');
        const downstairsPct = document.getElementById('pct-downstairs-label');

        if (mainBar && downstairsBar && mainPct && downstairsPct) {
            const mainPctVal = totalMonthlyCost > 0 ? Math.round((mainNet / totalMonthlyCost) * 100) : 50;
            const downstairsPctVal = 100 - mainPctVal;

            mainBar.style.width = mainPctVal + '%';
            downstairsBar.style.width = downstairsPctVal + '%';

            mainPct.textContent = mainPctVal + '%';
            downstairsPct.textContent = downstairsPctVal + '%';

            mainPct.style.display = mainPctVal < 12 ? 'none' : 'block';
            downstairsPct.style.display = downstairsPctVal < 12 ? 'none' : 'block';
        }

        // Sync with Local Storage for dynamic contract hydration
        localStorage.setItem('coown_partner_a_name', partnerAName);
        localStorage.setItem('coown_partner_b_name', partnerBName);
        localStorage.setItem('coown_home_price', homePrice);
        localStorage.setItem('coown_down_payment_pct', downPaymentPercent);
        localStorage.setItem('coown_down_payment_amt', downPaymentAmount);
        localStorage.setItem('coown_interest_rate', interestRate);
        localStorage.setItem('coown_loan_term', loanTerm);
        localStorage.setItem('coown_monthly_expenses', monthlyExpenses);
        localStorage.setItem('coown_appraisal_main', appraisalMain);
        localStorage.setItem('coown_appraisal_downstairs', appraisalDownstairs);
        localStorage.setItem('coown_split_a', splitA);
        localStorage.setItem('coown_split_b', splitB);
        localStorage.setItem('coown_total_monthly_cost', totalMonthlyCost);
        localStorage.setItem('coown_main_base_share', mainBaseShare);
        localStorage.setItem('coown_downstairs_base_share', downstairsBaseShare);
        localStorage.setItem('coown_equalization_payment', displayEqualization);
        localStorage.setItem('coown_equalization_direction', directionText);
        localStorage.setItem('coown_main_net', mainNet);
        localStorage.setItem('coown_downstairs_net', downstairsNet);
        // Generate and update exit timeline math dynamically
        let appreciationRate = 5.0;
        if (timelineAppreciationInput && timelineAppreciationInput.value !== '') {
            const parsedApp = parseFloat(timelineAppreciationInput.value);
            if (!isNaN(parsedApp)) {
                appreciationRate = parsedApp;
            }
        }
        
        const timelineSplitA = timelineSplitSlider ? (parseInt(timelineSplitSlider.value) || 50) : 50;
        const timelineSplitB = 100 - timelineSplitA;

        if (timelineSplitLabelA) timelineSplitLabelA.textContent = `${timelineSplitA}%`;
        if (timelineSplitLabelB) timelineSplitLabelB.textContent = `${timelineSplitB}%`;

        generateTimelineData(homePrice, downPaymentPercent, interestRate, loanTerm, timelineSplitA, appreciationRate);
        
        let currentYearVal = 5;
        if (tlRange && tlRange.value !== '') {
            const parsedYear = parseInt(tlRange.value);
            if (!isNaN(parsedYear)) {
                currentYearVal = parsedYear;
            }
        }
        updateTimeline(currentYearVal);
    }

    function generateTimelineData(homePrice, downPaymentPercent, interestRate, loanTerm, splitA, appreciationRate) {
        dynamicTimelineData = [];
        const downPaymentAmount = homePrice * (downPaymentPercent / 100);
        const loanAmount = homePrice - downPaymentAmount;
        const shareA = splitA / 100;
        const shareB = (100 - splitA) / 100;
        
        const r_m = (interestRate / 100) / 12;
        const N = loanTerm * 12;

        for (let year = 0; year <= 10; year++) {
            // Home Value appreciation
            const val = homePrice * Math.pow(1 + (appreciationRate / 100), year);
            
            // Remaining Mortgage Balance
            let loan = 0;
            if (loanAmount > 0) {
                const n = year * 12;
                if (r_m === 0) {
                    loan = loanAmount * (1 - n / N);
                } else {
                    loan = loanAmount * (Math.pow(1 + r_m, N) - Math.pow(1 + r_m, n)) / (Math.pow(1 + r_m, N) - 1);
                }
                loan = Math.max(0, loan);
            }
            
            const equity = val - loan;
            
            // Buyout Needed for leaving family (Family A vs Family B)
            const buyoutA = (downPaymentAmount * shareA) + ((val - homePrice) * shareA) + ((loanAmount - loan) * shareA);
            const buyoutB = (downPaymentAmount * shareB) + ((val - homePrice) * shareB) + ((loanAmount - loan) * shareB);

            // Refinance limits
            const l90 = (0.90 * val) - loan;
            const l80 = (0.80 * val) - loan;

            // Helper to determine checkmarks based on LTV feasibility
            const getCheckmarkHtml = (buyoutAmt, l80Val, l90Val) => {
                if (l80Val >= buyoutAmt) {
                    return '<span class="buyout-checkmark" title="80% LTV loan is sufficient to buy out this owner">✓✓</span>';
                } else if (l90Val >= buyoutAmt) {
                    return '<span class="buyout-checkmark" title="90% LTV loan is sufficient to buy out this owner">✓</span>';
                }
                return '';
            };

            let buyoutText = "";
            let buyoutHtml = "";
            let buyoutVal = 0;

            if (splitA === 50) {
                const formattedVal = '$' + Math.round(buyoutB).toLocaleString();
                buyoutText = formattedVal;
                buyoutHtml = formattedVal + getCheckmarkHtml(buyoutB, l80, l90);
                buyoutVal = buyoutB;
            } else {
                const higher = Math.max(buyoutA, buyoutB);
                const lower = Math.min(buyoutA, buyoutB);

                const formattedHigher = '$' + Math.round(higher).toLocaleString();
                const formattedLower = '$' + Math.round(lower).toLocaleString();

                buyoutText = formattedHigher + ' or ' + formattedLower;
                
                const htmlHigher = formattedHigher + getCheckmarkHtml(higher, l80, l90);
                const htmlLower = formattedLower + getCheckmarkHtml(lower, l80, l90);

                buyoutHtml = `${htmlHigher} <span style="font-size: 0.9rem; color: var(--color-text-muted); font-weight: normal;">or</span> ${htmlLower}`;
                buyoutVal = higher;
            }

            const a90 = l90 >= buyoutVal;
            const a80 = l80 >= buyoutVal;

            dynamicTimelineData.push({
                year: year,
                val: val,
                loan: loan,
                equity: equity,
                buyoutA: buyoutA,
                buyoutB: buyoutB,
                splitA: splitA,
                splitB: 100 - splitA,
                buyout: buyoutVal,
                buyoutText: buyoutText,
                buyoutHtml: buyoutHtml,
                l90: l90,
                a90: a90,
                l80: l80,
                a80: a80
            });
        }
    }

    [homePriceInput, downPaymentInput, interestRateInput, loanTermInput, expensesInput, rentMainInput, rentAduInput, partnerANameInput, partnerBNameInput, appreciationRateInput, splitSlider].forEach(input => {
        if (input) {
            input.addEventListener('input', calculateEqualization);
        }
    });

    if (timelineHomeValueInput) {
        timelineHomeValueInput.addEventListener('input', (e) => {
            calculateEqualization();
        });
    }
    if (timelineDownPaymentInput) {
        timelineDownPaymentInput.addEventListener('input', (e) => {
            calculateEqualization();
        });
    }
    if (timelineInterestRateInput) {
        timelineInterestRateInput.addEventListener('input', (e) => {
            calculateEqualization();
        });
    }
    if (timelineAppreciationInput) {
        timelineAppreciationInput.addEventListener('input', (e) => {
            calculateEqualization();
        });
    }

    const tlRange = document.getElementById('timeline-range');
    const tlYearBadge = document.getElementById('timeline-year-badge');
    const tlHomeValue = document.getElementById('tl-home-value');
    const tlMortgageLeft = document.getElementById('tl-mortgage-left');
    const tlJointEquity = document.getElementById('tl-joint-equity');
    const tlBuyoutNeeded = document.getElementById('tl-buyout-needed');
    const tlLtv90 = document.getElementById('tl-ltv-90');
    const tlLtv80 = document.getElementById('tl-ltv-80');
    const tlStatusDesc = document.getElementById('tl-status-desc');
    
    


    function getLtvBuyoutStatus(ltvLabel, ltvLimit, buyoutA, buyoutB, splitA) {
        const splitB = 100 - splitA;
        if (splitA === 50) {
            if (ltvLimit >= buyoutA) {
                return `${ltvLabel} can buy out either owner.`;
            } else {
                return `${ltvLabel} cannot buy out either owner.`;
            }
        } else {
            const buyoutSmall = Math.min(buyoutA, buyoutB);
            const buyoutLarge = Math.max(buyoutA, buyoutB);
            const pctSmall = Math.min(splitA, splitB);
            const pctLarge = Math.max(splitA, splitB);

            if (ltvLimit >= buyoutLarge) {
                return `${ltvLabel} can buy out either owner.`;
            } else if (ltvLimit >= buyoutSmall) {
                return `${ltvLabel} can buy out the ${pctSmall}% owner but not the ${pctLarge}% owner.`;
            } else {
                return `${ltvLabel} cannot buy out either owner.`;
            }
        }
    }

    function updateTimeline(yearIdx) {
        const data = dynamicTimelineData[yearIdx];
        if (!data) return;

        const partnerBName = 'Downstairs Family';

        if (tlYearBadge) {
            tlYearBadge.textContent = "Year " + data.year + ".0";
        }
        
        // Update active class on ticks
        const ticks = document.querySelectorAll('.timeline-axis-ticks .timeline-tick');
        ticks.forEach((tick, idx) => {
            if (idx === parseInt(yearIdx)) {
                tick.classList.add('active');
            } else {
                tick.classList.remove('active');
            }
        });

        if (tlHomeValue) tlHomeValue.textContent = '$' + Math.round(data.val).toLocaleString();
        if (tlMortgageLeft) tlMortgageLeft.textContent = '$' + Math.round(data.loan).toLocaleString();
        if (tlJointEquity) tlJointEquity.textContent = '$' + Math.round(data.equity).toLocaleString();
        if (tlBuyoutNeeded) tlBuyoutNeeded.innerHTML = data.buyoutHtml;
        if (tlLtv90) {
            tlLtv90.textContent = '$' + Math.max(0, Math.round(data.l90)).toLocaleString();
        }
        if (tlLtv80) {
            tlLtv80.textContent = '$' + Math.max(0, Math.round(data.l80)).toLocaleString();
        }

        // Description text updates
        const line1 = getLtvBuyoutStatus("A 90% LTV loan", data.l90, data.buyoutA, data.buyoutB, data.splitA);
        const line2 = getLtvBuyoutStatus("An 80% LTV loan", data.l80, data.buyoutA, data.buyoutB, data.splitA);
        const note = "Note: A single green checkmark appears once a 90% LTV loan is feasible and two green checkmarks appear when an 80% LTV loan is feasible.";
        
        const statusHtml = `${line1}<br><br>${line2}<br><br><span style="font-style: italic;">${note}</span>`;
        if (tlStatusDesc) tlStatusDesc.innerHTML = statusHtml;
    }

    if (tlRange) {
        tlRange.addEventListener('input', (e) => {
            updateTimeline(parseInt(e.target.value));
        });
    }

    if (timelineSplitSlider) {
        timelineSplitSlider.addEventListener('input', (e) => {
            calculateEqualization();
        });
    }

    // Run first calculation on load
    calculateEqualization();

    // Check if there is a pending property to load into the calculator from another page
    const pendingMls = localStorage.getItem('coown_load_mls');
    if (pendingMls) {
        localStorage.removeItem('coown_load_mls');
        const prop = PROPERTIES_DATA.find(p => p.mls === pendingMls);
        if (prop) {
            if (timelineHomeValueInput) {
                timelineHomeValueInput.value = prop.price;
            }
            const estMainRatio = 0.00293;
            const estAduRatio = prop.downstairs === 'Yes' ? 0.00187 : 0.0015;
            
            const estMain = Math.round(prop.price * estMainRatio);
            const estAdu = Math.round(prop.price * estAduRatio);
            
            if (rentMainInput) rentMainInput.value = estMain;
            if (rentAduInput) rentAduInput.value = estAdu;

            const hoaVal = prop.hoa_fee || 0;
            globalMonthlyExpenses = 800 + hoaVal;
            if (expensesInput) {
                expensesInput.value = 800 + hoaVal;
            }
            
            // Re-run calculation with loaded property values
            calculateEqualization();
            
            // Highlight flash animation on the calculator panel
            const calcPanel = document.querySelector('.calc-panel-left');
            if (calcPanel) {
                calcPanel.classList.add('highlight-flash');
                setTimeout(() => {
                    calcPanel.classList.remove('highlight-flash');
                }, 1000);
            }
        }
    }

    // 5. Dynamic Property Showcase Controller
    const searchInput = document.getElementById('search-input');
    const cityFilter = document.getElementById('city-filter');
    const sortBy = document.getElementById('sort-by');
    
    const toggleDownstairs = document.getElementById('toggle-downstairs');
    const toggleEntrance = document.getElementById('toggle-entrance');
    const toggleNoHoa = document.getElementById('toggle-no-hoa');
    const toggleBasement = document.getElementById('toggle-basement');
    
    const propGrid = document.getElementById('prop-grid');
    const resultsCount = document.getElementById('results-count');
    const btnShowMore = document.getElementById('btn-show-more');
    const showMoreContainer = document.getElementById('show-more-container');

    let currentPage = 1;
    const pageSize = 6;
    let filteredProperties = [];
    let selectedCompareMls = [];

    function createPropertyCard(prop) {
        const formattedPrice = '$' + prop.price.toLocaleString();
        const formattedLot = prop.lot_size.toFixed(2) + ' Acres';
        const formattedHoa = prop.hoa_fee > 0 ? `📝 HOA: $${prop.hoa_fee}/mo` : '🚫 HOA: $0';
        
        let badgesHtml = '';
        if (prop.downstairs === 'Yes') {
            badgesHtml += `<span class="prop-badge prop-badge-adu">Downstairs</span>`;
        }
        if (prop.private_entrance === 'Yes') {
            badgesHtml += `<span class="prop-badge prop-badge-entrance">Private Entry</span>`;
        }
        if (prop.finished_basement === 'Yes') {
            badgesHtml += `<span class="prop-badge prop-badge-basement">Downstairs</span>`;
        }
        if (prop.hoa_fee === 0) {
            badgesHtml += `<span class="prop-badge prop-badge-nohoa">No HOA</span>`;
        }

        const utahRealEstateUrl = `https://www.utahrealestate.com/report/public.single.report/report/detailed/listno/${prop.mls}`;

        return `
            <div class="prop-card">
                <div class="prop-img-wrapper">
                    <img src="${prop.photo_url || prop['Photo URL']}" alt="${prop.street}, ${prop.city}, UT" loading="lazy">
                    <span class="prop-rating-tag" title="Jared: ${prop.jared_rating || 'N/A'}★, Gemini: ${prop.gemini_rating || 'N/A'}★">★ ${prop.avg_rating || 'N/A'}</span>
                </div>
                <div class="prop-details">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs);">
                        <div class="prop-price" style="margin-bottom: 0;">${formattedPrice}</div>
                        <label class="compare-checkbox-label">
                            <input type="checkbox" class="prop-compare-check" data-mls="${prop.mls}" ${selectedCompareMls.includes(prop.mls) ? 'checked' : ''}>
                            <span class="compare-custom-check"></span>
                            <span>Compare</span>
                        </label>
                    </div>
                    <div class="prop-address">${prop.street}<br>${prop.city}, UT</div>
                    
                    <div class="rating-breakdown-details" style="font-size: 0.78rem; color: var(--color-text-muted); margin-top: 4px; margin-bottom: 8px; background: rgba(90, 122, 104, 0.05); padding: 4px 8px; border-radius: 4px; display: flex; justify-content: space-between;">
                        <span>👤 Jared: <strong>${prop.jared_rating || 'N/A'}★</strong></span>
                        <span>🤖 Gemini: <strong>${prop.gemini_rating || 'N/A'}★</strong></span>
                        <span>⭐ Avg: <strong>${prop.avg_rating || 'N/A'}★</strong></span>
                    </div>

                    <div class="prop-badge-container">
                        ${badgesHtml}
                    </div>
                    
                    <div class="prop-meta-grid">
                        <span>📐 ${prop.sq_ft.toLocaleString()} Sq. Ft.</span>
                        <span>🌳 ${formattedLot}</span>
                        <span>🏠 Built in ${prop.year_built}</span>
                        <span>${formattedHoa}</span>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 6px; margin-top: var(--space-sm);">
                        <a href="${utahRealEstateUrl}" target="_blank" rel="noopener" class="prop-action-btn" style="margin-top: 0;">
                            View on UtahRealEstate.com
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                            </svg>
                        </a>
                        <button type="button" class="prop-calc-load-btn" data-mls="${prop.mls}">
                            <span>Load into Calculator</span>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 14h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm-4 8H7v-2h4v2zm0-4H7v-2h4v2zm0-4H7V7h4v2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function renderProperties() {
        if (currentPage === 1) {
            propGrid.innerHTML = '';
        }

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const pageSlice = filteredProperties.slice(startIndex, endIndex);

        let html = '';
        pageSlice.forEach(prop => {
            html += createPropertyCard(prop);
        });

        propGrid.insertAdjacentHTML('beforeend', html);

        // Update count text
        const displayedCount = Math.min(currentPage * pageSize, filteredProperties.length);
        resultsCount.textContent = `Showing ${displayedCount} of ${filteredProperties.length} properties`;

        // Update show more button visibility
        if (displayedCount < filteredProperties.length) {
            showMoreContainer.style.display = 'flex';
        } else {
            showMoreContainer.style.display = 'none';
        }

        attachCompareListeners();
        attachPropertyLoaderListeners();
    }

    function attachPropertyLoaderListeners() {
        const loadBtns = document.querySelectorAll('.prop-calc-load-btn');
        loadBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mls = btn.getAttribute('data-mls');
                
                // Redirect if calculator elements are not on the current page
                if (!timelineHomeValueInput) {
                    localStorage.setItem('coown_load_mls', mls);
                    window.location.href = 'numbers.html';
                    return;
                }

                const prop = PROPERTIES_DATA.find(p => p.mls === mls);
                if (prop) {
                    // Populate Price
                    if (timelineHomeValueInput) {
                        timelineHomeValueInput.value = prop.price;
                    }
                    
                    // Estimate rental appraisals
                    // Main house is estimated at ~0.293% of property price
                    // Downstairs apartment is estimated at ~0.187% of property price
                    // If no downstairs, basement appraisal is lower (~0.15% of property price)
                    const estMainRatio = 0.00293;
                    const estAduRatio = prop.downstairs === 'Yes' ? 0.00187 : 0.0015;
                    
                    const estMain = Math.round(prop.price * estMainRatio);
                    const estAdu = Math.round(prop.price * estAduRatio);
                    
                    if (rentMainInput) rentMainInput.value = estMain;
                    if (rentAduInput) rentAduInput.value = estAdu;

                    // Add HOA fee to monthly reserve if there is one
                    const hoaVal = prop.hoa_fee || 0;
                    globalMonthlyExpenses = 800 + hoaVal;
                    if (expensesInput) {
                        expensesInput.value = 800 + hoaVal;
                    }
                    
                    // Trigger calculation
                    calculateEqualization();
                    
                    // Smooth scroll to calculator section
                    const calcSection = document.getElementById('calculator');
                    if (calcSection) {
                        calcSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                    
                    // Highlight flash animation on the calculator panel
                    const calcPanel = document.querySelector('.calc-panel-left');
                    if (calcPanel) {
                        calcPanel.classList.add('highlight-flash');
                        setTimeout(() => {
                            calcPanel.classList.remove('highlight-flash');
                        }, 1000);
                    }
                }
            });
        });
    }

    function filterAndSortProperties() {
        currentPage = 1;
        
        const searchQuery = searchInput.value.toLowerCase().trim();
        const cityValue = cityFilter.value;
        
        const filterAdu = toggleDownstairs.checked;
        const filterEntrance = toggleEntrance.checked;
        const filterNoHoa = toggleNoHoa.checked;
        const filterBasement = toggleBasement.checked;
        
        const sortValue = sortBy.value;

        // Apply filters
        filteredProperties = PROPERTIES_DATA.filter(prop => {
            // Search Query Filter
            if (searchQuery) {
                const streetMatch = prop.street ? prop.street.toLowerCase().includes(searchQuery) : false;
                const cityMatch = prop.city ? prop.city.toLowerCase().includes(searchQuery) : false;
                if (!streetMatch && !cityMatch) return false;
            }

            // City Filter
            if (cityValue !== 'all') {
                if (prop.city !== cityValue) return false;
            }

            // Toggles
            if (filterAdu && prop.downstairs !== 'Yes') return false;
            if (filterEntrance && prop.private_entrance !== 'Yes') return false;
            if (filterNoHoa && prop.hoa_fee > 0) return false;
            if (filterBasement && prop.finished_basement !== 'Yes') return false;

            return true;
        });

        // Apply sorting
        filteredProperties.sort((a, b) => {
            if (sortValue === 'rating-desc') {
                const ratingA = a.avg_rating || 0;
                const ratingB = b.avg_rating || 0;
                return ratingB - ratingA;
            } else if (sortValue === 'price-asc') {
                return a.price - b.price;
            } else if (sortValue === 'price-desc') {
                return b.price - a.price;
            } else if (sortValue === 'sqft-desc') {
                return b.sq_ft - a.sq_ft;
            }
            return 0;
        });

        renderProperties();
    }

    // Attach listeners
    if (searchInput) searchInput.addEventListener('input', filterAndSortProperties);
    if (cityFilter) cityFilter.addEventListener('change', filterAndSortProperties);
    if (sortBy) sortBy.addEventListener('change', filterAndSortProperties);
    
    [toggleDownstairs, toggleEntrance, toggleNoHoa, toggleBasement].forEach(toggle => {
        if (toggle) toggle.addEventListener('change', filterAndSortProperties);
    });

    if (btnShowMore) {
        btnShowMore.addEventListener('click', () => {
            currentPage++;
            renderProperties();
        });
    }

    // Property Comparison UI Operations
    const compareTray = document.getElementById('compare-tray');
    const compareCount = document.getElementById('compare-count');
    const compareThumbnails = document.getElementById('compare-thumbnails');
    const btnCompareNow = document.getElementById('btn-compare-now');
    const btnCompareClear = document.getElementById('btn-compare-clear');

    const compareModalOverlay = document.getElementById('compare-modal-overlay');
    const compareModalClose = document.getElementById('compare-modal-close');
    const compareModalBody = document.getElementById('compare-modal-body');

    function attachCompareListeners() {
        const checks = document.querySelectorAll('.prop-compare-check');
        checks.forEach(check => {
            // Remove existing listener to avoid duplication
            const newCheck = check.cloneNode(true);
            check.parentNode.replaceChild(newCheck, check);
            
            newCheck.addEventListener('change', (e) => {
                const mls = e.target.getAttribute('data-mls');
                if (e.target.checked) {
                    if (selectedCompareMls.length >= 3) {
                        e.target.checked = false;
                        alert("You can compare up to 3 properties at a time.");
                        return;
                    }
                    if (!selectedCompareMls.includes(mls)) {
                        selectedCompareMls.push(mls);
                    }
                } else {
                    selectedCompareMls = selectedCompareMls.filter(id => id !== mls);
                }
                updateCompareTray();
            });
        });
    }

    function updateCompareTray() {
        if (!compareTray) return;
        
        if (selectedCompareMls.length > 0) {
            compareTray.classList.add('active');
        } else {
            compareTray.classList.remove('active');
        }

        if (compareCount) compareCount.textContent = selectedCompareMls.length;

        if (btnCompareNow) btnCompareNow.disabled = selectedCompareMls.length < 2;

        if (compareThumbnails) {
            compareThumbnails.innerHTML = '';
            selectedCompareMls.forEach(mls => {
                const prop = PROPERTIES_DATA.find(p => p.mls === mls);
                if (prop) {
                    const img = document.createElement('img');
                    img.src = prop.photo_url || prop['Photo URL'];
                    img.className = 'compare-thumb-img';
                    img.alt = prop.street;
                    img.title = prop.street + ' - Click to remove';
                    img.addEventListener('click', () => {
                        selectedCompareMls = selectedCompareMls.filter(id => id !== mls);
                        updateCompareTray();
                        const checkbox = document.querySelector(`.prop-compare-check[data-mls="${mls}"]`);
                        if (checkbox) checkbox.checked = false;
                    });
                    compareThumbnails.appendChild(img);
                }
            });
        }
    }

    if (btnCompareClear) {
        btnCompareClear.addEventListener('click', () => {
            selectedCompareMls = [];
            updateCompareTray();
            document.querySelectorAll('.prop-compare-check').forEach(chk => chk.checked = false);
        });
    }

    if (btnCompareNow) {
        btnCompareNow.addEventListener('click', () => {
            openCompareModal();
        });
    }

    if (compareModalClose) {
        compareModalClose.addEventListener('click', () => {
            if (compareModalOverlay) compareModalOverlay.classList.remove('active');
        });
    }

    if (compareModalOverlay) {
        compareModalOverlay.addEventListener('click', (e) => {
            if (e.target === compareModalOverlay) {
                compareModalOverlay.classList.remove('active');
            }
        });
    }

    function openCompareModal() {
        if (selectedCompareMls.length < 2) return;
        
        const props = selectedCompareMls.map(mls => PROPERTIES_DATA.find(p => p.mls === mls)).filter(Boolean);
        
        let headerRowHtml = '<th>Field</th>';
        let imgRowHtml = '<td>Photo</td>';
        let priceRowHtml = '<td>Price</td>';
        let addressRowHtml = '<td>Address</td>';
        let sqftRowHtml = '<td>Sq. Ft.</td>';
        let lotRowHtml = '<td>Lot Size</td>';
        let yearRowHtml = '<td>Year Built</td>';
        let bedBathRowHtml = '<td>Bed/Bath</td>';
        let basementRowHtml = '<td>Finished Basement</td>';
        let aduRowHtml = '<td>Downstairs</td>';
        let entranceRowHtml = '<td>Private Entrance</td>';
        let hoaRowHtml = '<td>HOA Fee</td>';
        let ratingRowHtml = '<td>Average Rating</td>';
        let linkRowHtml = '<td>Action</td>';

        props.forEach(prop => {
            headerRowHtml += `<th>MLS #${prop.mls}</th>`;
            imgRowHtml += `<td><img src="${prop.photo_url || prop['Photo URL']}" class="compare-table-img" alt="${prop.street}"></td>`;
            priceRowHtml += `<td style="font-weight: 700; color: var(--color-accent);">$${prop.price.toLocaleString()}</td>`;
            addressRowHtml += `<td>${prop.street}, ${prop.city}</td>`;
            sqftRowHtml += `<td>${prop.sq_ft.toLocaleString()} sq ft</td>`;
            lotRowHtml += `<td>${prop.lot_size.toFixed(2)} Acres</td>`;
            yearRowHtml += `<td>${prop.year_built}</td>`;
            bedBathRowHtml += `<td>${prop.bedrooms} Bed / ${prop.bathrooms} Bath</td>`;
            basementRowHtml += `<td>${prop.finished_basement}</td>`;
            aduRowHtml += `<td>${prop.downstairs}</td>`;
            entranceRowHtml += `<td>${prop.private_entrance}</td>`;
            hoaRowHtml += `<td>$${prop.hoa_fee}/mo</td>`;
            ratingRowHtml += `<td style="font-weight: 600;">${prop.avg_rating || 'N/A'} / 5</td>`;
            
            const utahRealEstateUrl = `https://www.utahrealestate.com/report/public.single.report/report/detailed/listno/${prop.mls}`;
            linkRowHtml += `<td><a href="${utahRealEstateUrl}" target="_blank" rel="noopener" class="btn btn-primary" style="padding: 0.35rem 0.75rem; font-size: 0.75rem; border-radius: var(--radius-sm);">View Details</a></td>`;
        });

        const tableHtml = `
            <div class="compare-table-container">
                <table class="compare-table">
                    <thead>
                        <tr>${headerRowHtml}</tr>
                    </thead>
                    <tbody>
                        <tr>${imgRowHtml}</tr>
                        <tr>${priceRowHtml}</tr>
                        <tr>${addressRowHtml}</tr>
                        <tr>${sqftRowHtml}</tr>
                        <tr>${lotRowHtml}</tr>
                        <tr>${yearRowHtml}</tr>
                        <tr>${bedBathRowHtml}</tr>
                        <tr>${basementRowHtml}</tr>
                        <tr>${aduRowHtml}</tr>
                        <tr>${entranceRowHtml}</tr>
                        <tr>${hoaRowHtml}</tr>
                        <tr>${ratingRowHtml}</tr>
                        <tr>${linkRowHtml}</tr>
                    </tbody>
                </table>
            </div>
        `;

        if (compareModalBody) compareModalBody.innerHTML = tableHtml;
        if (compareModalOverlay) compareModalOverlay.classList.add('active');
    }

    // 6. Scroll-Reveal Animation Logic
    const revealSections = document.querySelectorAll('.reveal-on-scroll');
    const revealObserverOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -55px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // keep revealed
            }
        });
    }, revealObserverOptions);

    revealSections.forEach(section => {
        revealObserver.observe(section);
    });

    // Initial load
    if (propGrid) {
        filterAndSortProperties();
    }
});
