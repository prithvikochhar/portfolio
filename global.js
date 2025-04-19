console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// let navLinks = $$("nav a");

// let currentLink = navLinks.find(
//   (a) => a.host === location.host && a.pathname === location.pathname
// );

// currentLink?.classList.add("current");

// const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
//   ? "/"                  // Local server
//   : "/portfolio/";         // GitHub Pages repo name

// let pages = [
//     { url: "", title: "Home" },
//     { url: "projects/", title: "Projects" },
//     { url: "contact/", title: "Contact" },
//     { url: "resume/", title: "Resume" },
//     { url: "https://github.com/YOUR_USERNAME", title: "GitHub" },
//   ];
// let nav = document.createElement('nav');
// document.body.prepend(nav);

// for (let p of pages) {
//     let url = !url.startsWith('http') ? BASE_PATH + url : url;
//     let title = p.title;
//     // next step: create link and add it to nav
//     nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
//   }

// const BASE_PATH =
//   location.hostname === "localhost" || location.hostname === "127.0.0.1"
//     ? "/"
//     : "/portfolio/"; // replace with your actual GitHub repo name if different
// let pages = [
//   { url: "", title: "Home" },
//   { url: "projects/", title: "Projects" },
//   { url: "contact/", title: "Contact" },
//   { url: "resume/", title: "Resume" },
//   { url: "https://github.com/YOUR_USERNAME", title: "GitHub" },
// ];

// let nav = document.createElement("nav");
// document.body.prepend(nav);

// for (let p of pages) {
//     let url = !url.startsWith('http') ? BASE_PATH + url : url;
//     let title = p.title;
//     nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
//   }

// STEP 3: Add an empty <nav> to the top of the body


let pages = [
  { url: "", title: "Home" },
  { url: "projects/", title: "Projects" },
  { url: "contact/", title: "Contact" },
  { url: "Resume/", title: "Resume" },
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
      



//   a.href = url;
//   a.textContent = p.title;

//   // Highlight current page
//   a.classList.toggle(
//     "current",
//     a.host === location.host && a.pathname === location.pathname
//   );

//   // External links open in new tab
//   if (a.host !== location.host) {
//     a.target = "_blank";
//   }

//   nav.append(a);
// }
