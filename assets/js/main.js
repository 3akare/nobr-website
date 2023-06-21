document.body.previousElementSibling.insertAdjacentHTML('beforeend', 
    `
    <link href="/images/header/light-logo.png" rel="icon" media="(prefers-color-scheme: light)"/>
    <link href="/images/header/dark-logo.png" rel="icon" media="(prefers-color-scheme: dark)"/>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/font/WEB/css/satoshi.css">
    `)
document.body.prepend(document.querySelector('header'));
document.body.append(document.querySelector('footer'));

const darkModeToggle = document.querySelector('#dark-mode-toggle');
const htmlBody = document.querySelector('html');

darkModeToggle.addEventListener('click', () => {
  if (htmlBody.classList.contains('dark')) {
    darkModeToggle.style.backgroundImage = 'url("../../images/theme/moon.svg")';
    localStorage.theme = 'light';
  } else {
    darkModeToggle.style.backgroundImage = 'url("../../images/theme/sun.svg")';
    localStorage.theme = 'dark';
  }
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    htmlBody.classList.add('dark');
  } else {
    htmlBody.classList.remove('dark');
  }
});

darkModeToggle.style.backgroundSize = '30px 30px';

window.addEventListener('load', () => {
  if (localStorage.theme === 'dark') {
    darkModeToggle.style.backgroundImage = 'url("../../images/theme/sun.svg")';
    htmlBody.classList.add('dark');
  } else {
    darkModeToggle.style.backgroundImage = 'url("../../images/theme/moon.svg")';
    htmlBody.classList.remove('dark');
  }
});

function adjustTextareaHeight(event) {
  const textarea = event.target;
  textarea.style.height = ""; // Reset the height to auto

  const computedStyle = window.getComputedStyle(textarea);
  const paddingTop = parseInt(computedStyle.getPropertyValue("padding-top"));
  const paddingBottom = parseInt(computedStyle.getPropertyValue("padding-bottom"));
  const lineHeight = parseInt(computedStyle.getPropertyValue("line-height"));

  const scrollHeight = textarea.scrollHeight;
  const rows = Math.min(Math.floor((scrollHeight - paddingTop - paddingBottom) / lineHeight), 5);
  textarea.style.height = `${rows * lineHeight + paddingTop + paddingBottom}px`;
}