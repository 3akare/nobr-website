document.body.previousElementSibling.insertAdjacentHTML('beforeend', 
    `
    <link rel="shortcut icon" href="/images/header/logo.png">
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