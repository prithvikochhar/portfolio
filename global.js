console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// let navLinks = $$("nav a");

// let currentLink = navLinks.find(
//   (a) => a.host === location.host && a.pathname === location.pathname
// );

// currentLink?.classList.add("current");
let pages = [
  { url: "", title: "Home" },
  { url: "projects/", title: "Projects" },
  { url: "contact/", title: "Contact" },
  { url: "resume/", title: "Resume" },
  {url : "meta/", title: "Meta"},
  { url: "https://github.com/prithvikochhar", title: "GitHub" }
];

let nav = document.createElement("nav");
document.body.prepend(nav);

const BASE_PATH =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "/"                  // Local dev
    : "/portfolio/";       // Replace with your GitHub repo name if different


    for (let p of pages) {
        let a = document.createElement("a");
        let url = p.url;
      
        if (!url.startsWith("http")) {
          url = BASE_PATH + url;
        }
      
        a.href = url;
        a.textContent = p.title;
      
        a.classList.toggle(
          "current",
          a.host === location.host && a.pathname === location.pathname
        );
      
        if (a.host !== location.host) {
          a.target = "_blank";
        }
      
        nav.append(a);
      }
      document.body.insertAdjacentHTML(
        "afterbegin",
        `
        <label class="color-scheme">
          Theme:
          <select>
            <option value="light dark">Automatic</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      `
      );

      let select = document.querySelector(".color-scheme select");

    //   select.addEventListener('input', function (event) {
    //     console.log('color scheme changed to', event.target.value);
    //     document.documentElement.style.setProperty('color-scheme', event.target.value);
    //     localStorage.colorScheme = event.target.value
    //   });

      function setColorScheme(scheme) {
        document.documentElement.style.setProperty("color-scheme", scheme);
        localStorage.colorScheme = scheme;
        select.value = scheme;
      }
      
      select.addEventListener("input", (e) => {
        setColorScheme(e.target.value);
      });
      
      if ("colorScheme" in localStorage) {
        setColorScheme(localStorage.colorScheme);
      }
      export async function fetchJSON(url) {
        try {
          // Fetch the JSON file from the given URL
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
          }
          const data = await response.json();
          return data;
          }
         catch (error) {
          console.error('Error fetching or parsing JSON data:', error);
        }
      }
      export function renderProjects(projects, containerElement, headingLevel = 'h2') {
        // Your code will go here
        containerElement.innerHTML = '';
        for (let project of projects){
          const article = document.createElement('article');
          article.innerHTML = `<${headingLevel}>${project.title}</${headingLevel}>
          <img src="${project.image}" alt="${project.title}">
          <div>
            <p>${project.description}</p>
            <p class="project-year">${project.year}</p>
          </div>
          `;
          containerElement.appendChild(article);
        }
      }
      export async function fetchGitHubData(username) {
        // return statement here
        return fetchJSON(`https://api.github.com/users/${username}`);
      }
      
      