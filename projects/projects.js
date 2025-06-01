import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const title = document.querySelector('.projects-title');
if (title) {
  title.textContent = `${projects.length} Projects `;
}
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');
function renderPieChart(projectsToPlot) {
  // Clear old paths and legend
  let svg = d3.select('svg');
  svg.selectAll('path').remove();

  let legend = d3.select('.legend');
  legend.selectAll('li').remove();
  let query = ''
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
let query = ''
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

