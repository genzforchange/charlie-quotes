let quotes = []; 
const maxQuoteLength = 100;    
const previewMaxLength = 200;     
const snapDuration = 2000;       

// ----------------------
// Fetch quotes JSON
// ----------------------
async function fetchJsonData() {
  try {
    const response = await fetch('quotes.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    quotes = await response.json();

    // Clean quotes of existing quotation marks
    quotes = quotes.map(q => ({
      ...q,
      quote: q.quote.replace(/["“”]/g, "").trim()
    }));

    console.log("Quotes loaded:", quotes);

    // Shuffle quotes
    let currentIndex = quotes.length;
    while (currentIndex !== 0) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [quotes[currentIndex], quotes[randomIndex]] = [quotes[randomIndex], quotes[currentIndex]];
    }

    // ----------------------
    // Original preview container (length-limited)
    // ----------------------
    const previewQuotes = quotes.filter(q => q.quote.length <= previewMaxLength);
    const container = $("#quote-preview-container");
    container.empty();

    for (let i = 0; i < Math.min(4, previewQuotes.length); i++) {
      const q = previewQuotes[i];
      const copyData = `&#8220;${q.quote}&#8221; -Charlie Kirk CharlieQuotes.com`;

      container.append(`
        <div class="quote-preview">
          <div class="top">
            <div class="quote-preview-text">
              <h4>"${q.quote}"</h4>
            </div>
            <button class="copy" id="preview-${i}" value="${copyData}" onclick="copyInputValue('preview-${i}')">
              <img src="copy.png" alt="copy icon" class="copy-icon">
            </button>
          </div>
          <div class="bottom">
            <p>-Charlie Kirk</p>
            <a href="${q.source}" class="source" target="_blank">SOURCE</a>
          </div>
        </div>
      `);
    }

    container.append(`<a href="quotes.html"><button class="see-more">See More Quotes</button></a>`);

    const allContainer = $("#quote-preview-container-all");
    allContainer.empty();

    quotes.forEach((q, i) => {
      const copyData = `&#8220;${q.quote}&#8221; -Charlie Kirk CharlieQuotes.com`;

      allContainer.append(`
        <div class="quote-preview">
          <div class="top">
            <div class="quote-preview-text">
              <h4>"${q.quote}"</h4>
            </div>
            <button class="copy" id="all-${i}" value="${copyData}" onclick="copyAllQuotesValue('all-${i}')">
              <img src="copy.png" alt="copy icon" class="copy-icon">
            </button>
          </div>
          <div class="bottom">
            <p>-Charlie Kirk</p>
            <a href="${q.source}" class="source" target="_blank">SOURCE</a>
          </div>
        </div>
      `);
    });

    startCarousel();

  } catch (error) {
    console.error('Error fetching JSON:', error);
  }
}


function copyInputValue(id) {
  const copyText = $(`#${id}`).val();
  if (copyText) {
    navigator.clipboard.writeText(copyText);
    alert("Copied the text: " + copyText);
  }
}


function copyAllQuotesValue(id) {
  const copyText = $(`#${id}`).val();
  if (copyText) {
    navigator.clipboard.writeText(copyText);
    alert("Copied the text: " + copyText);
  }
}


function startCarousel() {
  const $carousel = $("#carousel img");
  let currentIndex = 0;

  $carousel.hide().eq(0).show().css("left", "50%");

  const shortQuotes = quotes.filter(q => q.quote.length <= maxQuoteLength);
  if (shortQuotes.length > 0) {
    const firstQuote = shortQuotes[Math.floor(Math.random() * shortQuotes.length)];
    $("#quote").text(`"${firstQuote.quote}"`);
    $("#author").text(`CHARLIE KIRK`);
  }

  function cycleContent() {
    const nextIndex = (currentIndex + 1) % $carousel.length;
    const randLeft = Math.floor(Math.random() * 70) + 10;

    $carousel.eq(currentIndex).fadeOut(800);
    $("#quote, #author").fadeOut(800);

    setTimeout(() => {
      if (shortQuotes.length > 0) {
        const randQuote = shortQuotes[Math.floor(Math.random() * shortQuotes.length)];
        $("#quote").text(`"${randQuote.quote}"`);
        $("#author").text(`CHARLIE KIRK`);
      }

      $carousel.eq(nextIndex).css("left", randLeft + "%").fadeIn(800);
      $("#quote, #author").fadeIn(800);

      currentIndex = nextIndex;
    }, 800);
  }

  setInterval(cycleContent, 6000);
}

function setupPageFadeIn() {
  const pages = document.querySelectorAll(".page:not(#landing)");

  const observerOptions = { threshold: 0.1 };
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  pages.forEach(page => observer.observe(page));
}

function setupSnapScroll() {
  const snapPages = Array.from(document.querySelectorAll(".page:not(#landing)"));
  const pagePositions = snapPages.map(p => p.offsetTop);
  let isScrolling = false;

  window.addEventListener("wheel", (e) => {
    if (isScrolling) return;

    const delta = e.deltaY;
    const currentScroll = window.scrollY;

    let target = null;
    if (delta > 0) {
      for (let pos of pagePositions) {
        if (pos > currentScroll + 10) {
          target = pos;
          break;
        }
      }
    } else {
      for (let i = pagePositions.length - 1; i >= 0; i--) {
        if (pagePositions[i] < currentScroll - 10) {
          target = pagePositions[i];
          break;
        }
      }
    }

    if (target !== null) {
      isScrolling = true;
      window.scrollTo({ top: target, behavior: 'smooth' });
      setTimeout(() => { isScrolling = false; }, snapDuration);
      e.preventDefault();
    }
  }, { passive: false });
}

$(document).ready(function() {
  fetchJsonData();
  setupPageFadeIn();
  setupSnapScroll();
});


function updateQuoteColumns() {
  var $container = $("#quote-preview-container-all");
  if (!$container.length) return;

  var width = $(window).width();
  var columns = 4; // default

  if (width < 700) {
    columns = 1;
  } else if (width < 1000) {
    columns = 2;
  } else if (width < 1300) {
    columns = 3;
  } else {
    columns = 4;
  }

  $container.css("column-count", columns);
}

// Run on load
$(window).on("load", updateQuoteColumns);

// Run on resize
$(window).on("resize", updateQuoteColumns);