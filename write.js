// =========================================================
// write.js: makes the Write page work like a typewriter.
//
// The idea: an invisible <textarea> catches your typing.
// Every time it changes, we:
//   1. split the text into lines that fit the paper
//   2. draw each letter onto the paper
//   3. move the paper so the next letter lands on the red mark
//   4. jolt the screen a little
// =========================================================

// ---------- Settings you can play with ----------
const COLUMNS = 46;   // how many letters fit on one line of paper

// ---------- Grab the parts of the page we need ----------
const typewriter = document.getElementById('typewriter');
const sheet      = document.getElementById('sheet');
const sheetText  = document.getElementById('sheet-text');
const input      = document.getElementById('typing-input');
const hint       = document.getElementById('type-hint');

// Tell the CSS how wide the paper is
sheet.style.setProperty('--cols', COLUMNS);

// Remember the last state, so we know what changed
let previousCharCount = 0;
let previousLine = 0;


// ---------- 1. Split text into lines that fit the paper ----------
// Words that don't fit move to the next line (word wrap).
function wrapText(text) {
  const lines = [];

  for (const paragraph of text.split('\n')) {       // Enter = new paragraph
    let line = '';
    for (const word of paragraph.split(' ')) {
      const candidate = line === '' ? word : line + ' ' + word;

      if (candidate.length <= COLUMNS) {
        line = candidate;                          // the word fits
      } else if (line !== '') {
        lines.push(line);                          // start a new line
        line = word;
      } else {
        line = word;                               // one very long word
      }

      // A single word longer than the whole line: chop it
      while (line.length > COLUMNS) {
        lines.push(line.slice(0, COLUMNS));
        line = line.slice(COLUMNS);
      }
    }
    lines.push(line);
  }

  return lines;
}


// ---------- A "random" number that's always the same for the same spot ----------
// So a letter doesn't change its look every time we redraw.
function seededRandom(a, b) {
  const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return x - Math.floor(x);                        // a number from 0 to 1
}


// ---------- 2. Draw the letters onto the paper ----------
function drawPaper(lines) {
  sheetText.innerHTML = '';                        // clear the paper
  let charCount = 0;

  lines.forEach((lineText, lineIndex) => {
    const lineDiv = document.createElement('div');
    lineDiv.className = 'sheet-line';

    for (let col = 0; col < lineText.length; col++) {
      const span = document.createElement('span');
      span.className = 'ch';
      span.textContent = lineText[col];

      // Every letter gets slightly different ink darkness, height and tilt
      const r1 = seededRandom(lineIndex, col);
      const r2 = seededRandom(col, lineIndex + 7);
      const r3 = seededRandom(lineIndex + col, 3);
      span.style.setProperty('--o',  (0.72 + r1 * 0.28).toFixed(2));
      span.style.setProperty('--dy', ((r2 - 0.5) * 2.4).toFixed(1) + 'px');
      span.style.setProperty('--r',  ((r3 - 0.5) * 2.5).toFixed(1) + 'deg');

      // Only brand-new letters play the "strike" animation
      if (charCount >= previousCharCount) span.classList.add('fresh');

      lineDiv.appendChild(span);
      charCount++;
    }
    sheetText.appendChild(lineDiv);
  });

  return charCount;
}


// ---------- 3 & 4. Move the paper and jolt the screen ----------
function update() {
  const lines = wrapText(input.value);
  const line  = lines.length - 1;                  // the line we're on
  const col   = lines[line].length;                // letters on that line

  const charCount = drawPaper(lines);

  // New line? Let the paper glide back like a carriage return.
  if (line !== previousLine) {
    sheet.classList.add('returning');
    setTimeout(() => sheet.classList.remove('returning'), 350);
  }

  // Move the paper (the CSS does the maths with these two numbers)
  sheet.style.setProperty('--col',  col);
  sheet.style.setProperty('--line', line);

  // Jolt: remove the class, force the browser to notice, add it back
  typewriter.classList.remove('strike');
  void typewriter.offsetWidth;
  typewriter.classList.add('strike');

  previousCharCount = charCount;
  previousLine = line;
}


// ---------- Keep the typing at the end, like a real typewriter ----------
function keepCursorAtEnd() {
  const end = input.value.length;
  input.setSelectionRange(end, end);
}


// ---------- Connect everything ----------
input.addEventListener('input', () => {
  keepCursorAtEnd();
  update();
});

input.addEventListener('keydown', (event) => {
  // Arrow keys would move the hidden cursor around; a typewriter can't
  if (event.key.startsWith('Arrow')) event.preventDefault();
});

// Tapping anywhere on the typewriter starts typing
typewriter.addEventListener('click', () => {
  input.focus();
  keepCursorAtEnd();
});

input.addEventListener('focus', () => { hint.style.visibility = 'hidden'; });
input.addEventListener('blur',  () => { hint.style.visibility = 'visible'; });

// Set the paper to the starting position when the page loads
sheet.style.setProperty('--col', 0);
sheet.style.setProperty('--line', 0);
