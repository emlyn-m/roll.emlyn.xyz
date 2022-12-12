// <begin math funcs>
function add(x,y) { return Number(x)+Number(y); }
function sub(x,y) { return Number(x)-Number(y); }
function mul(x,y) { return Number(x)*Number(y); }
function div(x,y) { return Math.floor(Number(x)/Number(y)); }

function maxKey(obj) {
    currMax = -Infinity;
    Object.keys(obj).forEach((x) => {
        if (Number(x) > currMax) { currMax = Number(x);}
    });
    return currMax;
}

function maxVal(obj) {
    currMax = -Infinity;
    Object.values(obj).forEach((x) => {
        if (Number(x) > currMax) { currMax = Number(x); }
    });
    return currMax;
}

function minKey(obj) {
    currMin = Infinity;
    Object.keys(obj).forEach((x) => {
        if (Number(x) < currMin) { currMin = Number(x); }
    });
    return currMin;
}

async function combine(pmf1, pmf2, operation) {    
    
    if (pmf2 == null) { pmf2 = {0:1}; }


    if (typeof(pmf1) == "number") { x = Number(pmf1); pmf1 = {}; pmf1[x] = 1; }
    if (typeof(pmf2) == "number") { x = Number(pmf2); pmf2 = {}; pmf2[x] = 1; }
    if (operation == null) { operation = add; }
    
    console.log(pmf1)
    console.log(pmf2)

    // initialize and populate probability object
    probs = {}
    await Object.keys(pmf1).forEach(async (cv1) => {
        await Object.keys(pmf2).forEach(async (cv2) => {
            console.log(cv1)
            idx = await operation(Number(cv1), Number(cv2))
            if (probs[idx] == null) { probs[idx] = 0; } /* initialize if not already exists */
            probs[idx] += pmf1[cv1] * pmf2[cv2];
        })
    });
    

    return probs
    
}

function generateDiePmf(dieSides) {
    probs = {};
    for (i=0; i < dieSides; i++) {
        probs[i+1] = 1/dieSides;
    }
    return probs
}

function generateAdvantagePmf(dieSides) {
    advProbs = {};
    for (i=1; i<=dieSides; i++) {
        advProbs[i] = (2*i - 1) / (dieSides**2)
    }
    return advProbs;
}

function generateDisadvantagePmf(dieSides) {
    disadvProbs = {};
    for (i=1; i<=dieSides; i++) {
        disadvProbs[i] = (2*(dieSides-i) + 1) / (dieSides**2)
    }
    return disadvProbs;
}



async function ndx(n, X) {

    console.log('ndx');
    console.log(n + ' ' + X);

    onedXPmf = generateDiePmf(X);
    pastPmf = generateDiePmf(X);
    for (i=0; i<n-1; i++) {
        pastPmf = (await combine(onedXPmf, pastPmf, add));
    }
    return pastPmf;
}

async function ndxAdv(n, X) {
    oneDiePmf = generateAdvantagePmf(X);
    pastPmf = generateAdvantagePmf(X);
    for (i=0; i<n-1; i++) {
        pastPmf = (await combine(oneDiePmf, pastPmf, add))
    }
    return pastPmf;
}

async function ndxDis(n, X) {
    oneDiePmf = generateDisadvantagePmf(X);
    pastPmf = generateDisadvantagePmf(X);
    for (i=0; i<n-1; i++) {
        pastPmf = (await combine(oneDiePmf, pastPmf, add));
    }
    return pastPmf;
}


async function pmf2cdf(pmf) { /* note that this gives 1-cdf, as we are interested in the probability of meeting or exceeding a given role */
    cdf = {};
    Object.keys(pmf).forEach((cv) => {
        if (cdf[cv-1]) {
            cdf[cv] = cdf[cv-1] - pmf[cv];
        } else { /* first element - special case */
            cdf[cv] = 1;
        }
    });
    return cdf;
}

// <end math funcs>
// <begin draw funcs>

async function drawOntoCanvas(canvas, probs, keyOrder) {
    
    pxCorrectionFactor = Math.max(1, canvas.height / canvas.offsetHeight);
    
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.clearRect(0, 0, canvas.width, canvas.height);


    ctx.fillStyle = "#fff";
    
    xRange = maxKey(probs) - minKey(probs) + 1;
    yRange = maxVal(probs);
    
    barWidth = canvas.width / xRange;
    maxBarHeight = canvas.height;
    
    keyOrder.forEach(async (cv, idx) => {
        barHeight = Math.max(maxBarHeight * probs[cv] / yRange, pxCorrectionFactor); /* ensure all probabilities get at least 1px */
        await ctx.fillRect(barWidth * idx, maxBarHeight - barHeight, barWidth, barHeight);
        
    });
}

async function populateTable(table, probs, keyOrder) {

    if (table.children[0]) { table.children[0].remove(); }
    
    keyOrder.forEach(async (cv) => {
        var latestRow = (await table.insertRow());
        var lCell = (await latestRow.insertCell(0));
        var rCell = (await latestRow.insertCell(1));
        
        lCell.innerHTML = cv;
        rCell.innerHTML = (probs[cv]*(10**2)).toFixed(2) + "%";
    });
    
    nRow = (await table.insertRow()); //add null row
    (await nRow.insertCell(0)).innerHTML = "<br />";
        (await nRow.insertCell(0)).innerHTML = "<br />";

    
    //add cdf/pdf selector
    fRow = (await table.insertRow());
    pmfBtn = (await fRow.insertCell(0));
    cdfBtn = (await fRow.insertCell(1));
    
    pmfBtn.innerHTML = "PMF";
    pmfBtn.onclick = () => { populateTable(table, CURR_PROBS, keyOrder); }
    cdfBtn.innerHTML = "CDF";
    cdfBtn.onclick = async () => { populateTable(table, await pmf2cdf(CURR_PROBS), keyOrder); }

    if (Number(probs[Object.keys(probs)[0]]) == 1) {
        // cdf mode
        pmfBtn.style.textDecoration = "";
        cdfBtn.style.textDecoration = "underline";
    } else {
        // pmf mode
        cdfBtn.style.textDecoration = "";
        pmfBtn.style.textDecoration = "underline";
    }
}

function setupCanvas() {    
    let pcw = document.getElementById("pdf-container").offsetWidth / 2;
    let ccw = document.getElementById("cdf-container").offsetWidth / 2;
    
    
    if (pcw == ccw) { return; }
    document.getElementById("pdf-container").style.width = ((pcw + ccw) / 2) + "px";
    document.getElementById("cdf-container").style.width = ((pcw + ccw) / 2) + "px";
        
    
    
}

// <end draw funcs>

// <scrolling stuff>

// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = {37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
  e.preventDefault();
}

function preventDefaultForScrollKeys(e) {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

// modern Chrome requires { passive: false } when adding event
var supportsPassive = false;
try {
  window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
    get: function () { supportsPassive = true; } 
  }));
} catch(e) {}

var wheelOpt = supportsPassive ? { passive: false } : false;
var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

// call this to Disable
function disableScroll() {
  window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
  window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
  window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
  window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

// call this to Enable
function enableScroll() {
  window.removeEventListener('DOMMouseScroll', preventDefault, false);
  window.removeEventListener(wheelEvent, preventDefault, wheelOpt); 
  window.removeEventListener('touchmove', preventDefault, wheelOpt);
  window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}

// <end scrolling stuff>

function toggleInfoModal(forceValue) {
    
    if (forceValue != false && ["", "none"].includes(document.getElementById("info-modal").style.display)) {
        document.getElementById("info-modal").style.top = window.scrollY + "px";
        document.getElementById("info-modal").style.display = "block";
        disableScroll();
    } else {
        document.getElementById("info-modal").style.display = "none";
        enableScroll();
    }
}

document.onkeydown = function(evt) {
    evt = evt || window.event;
    var isEscape = false;
    if ("key" in evt) {
        isEscape = (evt.key === "Escape" || evt.key === "Esc");
    } else {
        isEscape = (evt.keyCode === 27);
    }
    if (isEscape) {
        toggleInfoModal(false);
    }
    
    if (evt.key == "h") {
        toggleInfoModal();
    }
};

document.getElementById("roll-form").onkeydown = function(evt_) { evt_.stopPropagation(); }

function main() {
    document.getElementsByTagName("html")[0].style.overflowY = "auto";
    document.body.style.overflowY = "none";
    setTimeout(
        function() { document.getElementById("no-js-modal").remove() }, 10)
}


async function promptOnSubmit() {
    inputElem = document.getElementById("roll-form").children[0];
    mPrompt = inputElem.value;
    
    CURR_PROBS = (await parsePrompt(mPrompt))[0];

    // some weird sorting since -X must be a string

    keyOrder = [];
    probsCpy = Object.assign({}, CURR_PROBS);
    cMin = Infinity;

    while (Object.keys(probsCpy).length > 0) {
        Object.keys(probsCpy).forEach((x) => {
            if (Number(x) < cMin) { cMin = Number(x); }
        });
        keyOrder.push(String(cMin));
        delete probsCpy[cMin];
        cMin = Infinity;
    }

    pmfCanv = document.getElementById("pdf-container").children[1];
    cdfCanv = document.getElementById("cdf-container").children[1];
    mTable = document.getElementById("table-container").children[1];

    cdf = (await pmf2cdf(CURR_PROBS));
    drawOntoCanvas(pmfCanv, CURR_PROBS, keyOrder);
    drawOntoCanvas(cdfCanv, cdf, keyOrder);
    populateTable(mTable, CURR_PROBS, keyOrder);

}

CURR_PROBS = null;

main();

setTimeout(
    function() { setupCanvas(); }, 15
);