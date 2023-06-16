const darkModeToggle = document.querySelector('#dark-mode-toggle');
const htmlBody = document.querySelector('#dark-mode-master');

darkModeToggle.addEventListener('click', () => {
  if (htmlBody.classList.contains('dark')) {
    darkModeToggle.style.backgroundImage = 'url("../images/moon-svgrepo-com.svg")';
    localStorage.theme = 'light';
  } else {
    darkModeToggle.style.backgroundImage = 'url("../images/sun-svgrepo-com.svg")';
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
    darkModeToggle.style.backgroundImage = 'url("../images/sun-svgrepo-com.svg")';
    htmlBody.classList.add('dark');
  } else {
    darkModeToggle.style.backgroundImage = 'url("../images/moon-svgrepo-com.svg")';
    htmlBody.classList.remove('dark');
  }
});

// const textMessageArea = document.querySelector('#text-message-area');
// textMessageArea.insertAdjacentHTML('beforeend', `<div class="text-left block h-fit p-2 w-fit max-w-[80%] bg-slate-500/100 mb-2 rounded-sm text-secondary-white font-thin">
//     Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste praesentium dolore voluptatem optio pariatur ullam ex impedit vero aut voluptate sint, assumenda alias facilis maiores saepe! Provident ut sed expedita totam libero dignissimos consequuntur, nobis illo porro iste maiores dolores inventore ea ipsam quam architecto minima quidem aspernatur reprehenderit facere incidunt accusamus autem ipsa! Recusandae labore nisi, nemo autem cupiditate quisquam aliquam dolore, tempora earum consequatur, explicabo deleniti dolores quod.
// </div>
// </div>
// <div class="h-[100px] w-full">

//                 </div>`);
