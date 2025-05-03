import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const title = document.querySelector('.projects-title');
if (title) {
  title.textContent = `${projects.length} Projects `;
}
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

// let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
// let arc = arcGenerator({
//   startAngle: 0,
//   endAngle: 2 * Math.PI,
// });
// d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');

// let data = [1, 2];
// let data = [1, 2];
// let data = [1, 2, 3, 4, 5, 5];
// let data = [
//   { value: 1, label: 'apples' },
//   { value: 2, label: 'oranges' },
//   { value: 3, label: 'mangos' },
//   { value: 4, label: 'pears' },
//   { value: 5, label: 'limes' },
//   { value: 5, label: 'cherries' },
// ];
// let rolledData = d3.rollups(
//   projects,
//   (v) => v.length,
//   (d) => d.year,
// );
// let data = rolledData.map(([year, count]) => {
//   return { value: count, label: year };
// });

// let colors = d3.scaleOrdinal(d3.schemeTableau10);
// let sliceGenerator = d3.pie().value((d) => d.value);
// // let sliceGenerator = d3.pie();
// let arcData = sliceGenerator(data);
// let arcs = arcData.map((d) => arcGenerator(d));
// let total = 0;

// for (let d of data) {
//   total += d;
// }
// let angle = 0;
// // let arcData = [];

// for (let d of data) {
//   let endAngle = angle + (d / total) * 2 * Math.PI;
//   arcData.push({ startAngle: angle, endAngle });
//   angle = endAngle;
// }
// // let arcs = arcData.map((d) => arcGenerator(d));
// // arcs.forEach((arc) => {
// //   // TODO, fill in step for appending path to svg using D3
// // })

// // let colors = ['gold', 'purple'];

// arcs.forEach((arc, idx) => {
//   d3.select('svg')
//     .append('path')
//     .attr('d', arc)
//     .attr('fill', colors(idx)) // Fill in the attribute for fill color via indexing the colors variable
// })

// let legend = d3.select('.legend');
// data.forEach((d, idx) => {
//   legend
//     .append('li')
//     .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
//     .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
    
// });

// let query = '';

// let searchInput = document.querySelector('.searchBar');

// searchInput.addEventListener('change', (event) => {
//   // update query value
//   query = event.target.value;
//   // TODO: filter the projects
//   let filteredProjects = projects.filter((project) => {
//     let values = Object.values(project).join('\n').toLowerCase();
//     return values.includes(query.toLowerCase());
//   });
  
//   // TODO: render updated projects!
//   renderProjects(filteredProjects, projectsContainer, 'h2');
// });

// Refactor all plotting into one function
// function renderPieChart(projectsGiven) {
//   // re-calculate rolled data
//   let newRolledData = d3.rollups(
//     projectsGiven,
//     (v) => v.length,
//     (d) => d.year,
//   );
//   // re-calculate data
//   let newData = newRolledData.map(([year, count]) => {
//     return { value: count ,label: year
//       }; // TODO
//   });
//   // re-calculate slice generator, arc data, arc, etc.
//   let newSliceGenerator = d3.pie().value((d) => d.value);
//   let newArcData = newSliceGenerator(newData);
//   let newArcs = newArcData.map(newArcData.map((d) => arcGenerator(d)));
//   // TODO: clear up paths and legends
//   let newSVG = d3.select('svg');
//   newSVG.selectAll('path').remove();
//   let legend = d3.select('.legend');
//   legend.selectAll('li').remove();
//   // update paths and legends, refer to steps 1.4 and 2.2
//   let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
//   let colors = d3.scaleOrdinal(d3.schemeTableau10);

//   // Draw arcs
//   newArcData.map((d, i) => {
//     svg
//       .append('path')
//       .attr('d', arcGenerator(d))
//       .attr('fill', colors(i));
//   });

//   // Draw legend
//   data.forEach((d, i) => {
//     legend
//       .append('li')
//       .attr('style', `--color:${colors(i)}`)
//       .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
//   });
// }

// // Call this function on page load
// renderPieChart(projects);

// searchInput.addEventListener('change', (event) => {
//   let filteredProjects = setQuery(event.target.value);
//   // re-render legends and pie chart when event triggers
//   renderProjects(filteredProjects, projectsContainer, 'h2');
//   renderPieChart(filteredProjects);
// });
function renderPieChart(projectsToPlot) {
  // Clear old paths and legend
  let svg = d3.select('svg');
  svg.selectAll('path').remove();

  let legend = d3.select('.legend');
  legend.selectAll('li').remove();

  let selectedIndex = -1;

  // Re-group by year
  let rolledData = d3.rollups(
    projectsToPlot,
    (v) => v.length,
    (d) => d.year
  );

  let data = rolledData.map(([year, count]) => ({
    label: year,
    value: count
  }));

  // Generate arcs
  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  // Draw arcs
  arcData.map((d, i) => {
    svg
  .append('path')
  .attr('d', arcGenerator(d))
  .attr('fill', colors(i))
  .on('click', () => {
    selectedIndex = selectedIndex === i ? -1 : i;

    // Highlight only selected path
    svg.selectAll('path').attr('class', (_, idx) =>
      idx === selectedIndex ? 'selected' : null
    );

    // Highlight matching legend item
    legend.selectAll('li').attr('class', (_, idx) =>
      idx === selectedIndex ? 'selected' : null
    );

    // Filter projects
    if (selectedIndex === -1) {
      renderProjects(projects, projectsContainer, 'h2');
    } else {
      const year = data[selectedIndex].label;
      const filtered = projects.filter((p) => p.year === year);
      renderProjects(filtered, projectsContainer, 'h2');
    }
  });

  });

  // Draw legend
  data.forEach((d, i) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(i)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}
renderPieChart(projects);

let query = '';

let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
  query = event.target.value;

  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join(' ').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  // Re-render projects and pie chart
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});



