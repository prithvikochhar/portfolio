import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import scrollama from 'https://cdn.jsdelivr.net/npm/scrollama@3.2.0/+esm';

let xScale = d3.scaleTime();  // empty scale, will set domain later
// let yScale = d3.scaleLinear().domain([0, 24]);  // fixed domain
const yScale = d3.scaleLinear().domain([0, 24]).range([600 - 30, 10]); // Use your actual chart height/margin



async function loadData() {
    const data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
  
    return data;
  }
  
  function processCommits(data) {
    return d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url: 'https://github.com/vis-society/lab-7/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };
  
        Object.defineProperty(ret, 'lines', {
          value: lines,
          writable: false,
          enumerable: false,
          configurable: false
          // What other options do we need to set?
          // Hint: look up configurable, writable, and enumerable
        });
  
        return ret;
      });
  }
  
// let commits = d3.groups(data, (d) => d.commit);
// console.log(commits)
// console.log(data)

function renderCommitInfo(data, commits) {
    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
    // Add total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);
  
    // Add total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);
  
    // Add more stats as needed...
    // Total files
  const numFiles = d3.groups(data, d => d.file).length;
  dl.append('dt').text('Number of files');
  dl.append('dd').text(numFiles);

  // Longest file
  const fileLengths = d3.rollups(data, v => d3.max(v, d => d.line), d => d.file);
  const longestFile = d3.greatest(fileLengths, d => d[1])?.[0];
  dl.append('dt').text('Longest file');
  dl.append('dd').text(longestFile);

  // Average line length (in characters)
  const avgLineLength = d3.mean(data, d => d.length).toFixed(1);
  dl.append('dt').text('Avg. line length (chars)');
  dl.append('dd').text(avgLineLength);
  }
  let data = await loadData();
let commits = processCommits(data);
commits.sort((a, b) => a.datetime - b.datetime);

  renderCommitInfo(data, commits);

  function renderScatterPlot(data, commits) {
    // Put all the JS code of Steps inside this function
    const width = 1000;
    const height = 600;
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };
    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
      };

    //   const xScale = d3
    // .scaleTime()
    // .domain(d3.extent(commits, (d) => d.datetime))
    // .range([usableArea.left, usableArea.right])
    // .nice();

    xScale.domain(d3.extent(commits, (d) => d.datetime)).range([usableArea.left, usableArea.right]).nice();


    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);

    const yScale = d3.scaleLinear().domain([0, 24]).range([usableArea.bottom, usableArea.top]);


    const rScale = d3
    .scaleSqrt() // Change only this line
    .domain([minLines, maxLines])
    .range([2, 30]);

    const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

    // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

    // Add gridlines BEFORE the axes
    const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

    // Create gridlines as an axis with no labels and full-width ticks
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    // Add X axis
    svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .attr('class', 'x-axis') // new line to mark the g tag
    .call(xAxis);

    // Add Y axis
    svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .attr('class', 'y-axis') // just for consistency
    .call(yAxis);

    const dots = svg.append('g').attr('class', 'dots');

    
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

    dots
    .selectAll('circle')
    // .data(sortedCommits)
    .data(sortedCommits, (d) => d.id) // change this line
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    // .attr('r', 5)
    .attr('fill', 'steelblue')
    
    .style('fill-opacity', 0.7) // Add transparency for overlapping dots
    .on('mouseenter', (event, commit) => {
        d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
        renderTooltipContent(commit);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
    })
    .on('mouseleave', () => {
        d3.select(event.currentTarget).style('fill-opacity', 0.7);
        updateTooltipVisibility(false);
    });

    // Create brush
    svg.call(d3.brush().on('start brush end', brushed));

    // Raise dots and everything after overlay
    svg.selectAll('.dots, .overlay ~ *').raise();

    function isCommitSelected(selection, commit) {
        if (!selection) { return false; } 
        const [x0, x1] = selection.map((d) => d[0]); 
        const [y0, y1] = selection.map((d) => d[1]); 
        const x = xScale(commit.datetime); 
        const y = yScale(commit.hourFrac); 
        return x >= x0 && x <= x1 && y >= y0 && y <= y1;
        // TODO: return true if commit is within brushSelection
        // and fa
    }

    function renderSelectionCount(selection) {
        const selectedCommits = selection
          ? commits.filter((d) => isCommitSelected(selection, d))
          : [];
      
        const countElement = document.querySelector('#selection-count');
        countElement.textContent = `${
          selectedCommits.length || 'No'
        } commits selected`;
      
        return selectedCommits;
      }

      function renderLanguageBreakdown(selection) {
        const selectedCommits = selection
          ? commits.filter((d) => isCommitSelected(selection, d))
          : [];
        const container = document.getElementById('language-breakdown');
      
        if (selectedCommits.length === 0) {
          container.innerHTML = '';
          return;
        }
        const requiredCommits = selectedCommits.length ? selectedCommits : commits;
        const lines = requiredCommits.flatMap((d) => d.lines);
      
        // Use d3.rollup to count lines per language
        const breakdown = d3.rollup(
          lines,
          (v) => v.length,
          (d) => d.type,
        );
      
        // Update DOM with breakdown
        container.innerHTML = '';
      
        for (const [language, count] of breakdown) {
          const proportion = count / lines.length;
          const formatted = d3.format('.1~%')(proportion);
      
          container.innerHTML += `
                  <dt>${language}</dt>
                  <dd>${count} lines (${formatted})</dd>
              `;
        }
      }

    function brushed(event) {
        const selection = event.selection;
        d3.selectAll('circle').classed('selected', (d) =>
          isCommitSelected(selection, d),
        );

        renderSelectionCount(selection);
  renderLanguageBreakdown(selection);
      }



      
    

    
    

    
  }

renderScatterPlot(data,commits);

function renderTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const lines = document.getElementById('commit-lines');
  
    if (Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
      dateStyle: 'full',
    });
    time.textContent = commit.time;
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
  }
// function renderTooltipContent(commit) {
//     const link = document.getElementById('commit-link');
//     const date = document.getElementById('commit-date');
//     const time = document.getElementById('commit-time');
//     const author = document.getElementById('commit-author');
//     const lines = document.getElementById('commit-lines');
  
//     if (!commit) return;
  
//     link.href = commit.url;
//     link.textContent = commit.id.slice(0, 7); // shorten hash
//     date.textContent = commit.date;
//     time.textContent = commit.time;
//     author.textContent = commit.author;
//     lines.textContent = commit.totalLines;
//   }
  

  function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
  }

  function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }
  

      let filteredCommits = commits;

//       let commitProgress = 100;
//       let timeScale = d3
//   .scaleTime()
//   .domain([
//     d3.min(commits, (d) => d.datetime),
//     d3.max(commits, (d) => d.datetime),
//   ])
//   .range([0, 100]);
// let commitMaxTime = timeScale.invert(commitProgress);

// function onTimeSliderChange() {
//   const slider = document.getElementById("commit-progress");
//   commitProgress = +slider.value;
//   commitMaxTime = timeScale.invert(commitProgress);

//   document.getElementById("commit-time").textContent = commitMaxTime.toLocaleString("en", {
//     dateStyle: "long",
//     timeStyle: "short",
//   });

//   filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
  
//   // renderScatterPlot(data, filteredCommits);

//   // Call visual update functions (to be defined later)
//   updateScatterPlot(data, filteredCommits);
//   updateFileDisplay(filteredCommits);
// }

// document.getElementById("commit-progress").addEventListener("input", onTimeSliderChange);
// onTimeSliderChange();

function updateScatterPlot(data, commits) {
  const width = 1000;
  const height = 600;
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const svg = d3.select('#chart').select('svg');

  xScale = xScale.domain(d3.extent(commits, (d) => d.datetime));

  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);

  const xAxis = d3.axisBottom(xScale);

  // CHANGE: we should clear out the existing xAxis and then create a new one.
  // svg
  //   .append('g')
  //   .attr('transform', `translate(0, ${usableArea.bottom})`)
  //   .call(xAxis);

  const xAxisGroup = svg.select('g.x-axis');
  xAxisGroup.selectAll('*').remove();
  xAxisGroup.call(xAxis);

  const dots = svg.select('g.dots');

  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
  dots
    .selectAll('circle')
    // .data(sortedCommits)
    .data(sortedCommits, (d) => d.id) // change this line
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7) // Add transparency for overlapping dots
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', (event) => {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipVisibility(false);
    });
}



function updateFileDisplay(filteredCommits) {

  let lines = filteredCommits.flatMap((d) => d.lines);
let files = d3
  .groups(lines, (d) => d.file)
  .map(([name, lines]) => {
    return { name, lines };
  })
  .sort((a, b) => b.lines.length - a.lines.length);;

  let filesContainer = d3
  .select('#files')
  .selectAll('div')
  .data(files, (d) => d.name)
  .join(
    // This code only runs when the div is initially rendered
    (enter) =>
      enter.append('div').call((div) => {
        div.append('dt').append('code');
        div.append('dd');
      }),
  );
  let colors = d3.scaleOrdinal(d3.schemeTableau10);

// This code updates the div info
filesContainer.select('dt > code').text((d) => d.name);
// filesContainer.select('dd').text((d) => `${d.lines.length} lines`);
filesContainer
  .select('dd')
  .selectAll('div')
  .data((d) => d.lines)
  .join('div')
  .attr('class', 'loc')
  // .style('--color', (d) => colors(d.type))
  // .style('background-color', (d) => colors(d.type)); // Directly set bg color
  .attr('style', (d) => `--color: ${colors(d.type)}`);
  // .style('background-color', (d) => colors(d.type)); // <-- Key line!
  // .each(function (d) {
  //   this.style.setProperty('--color', colors(d.type)); // ✅ Apply to each .loc directly
  // });
  filesContainer.select('dt > code').html(d => `${d.name}<br><small>${d.lines.length} lines</small>`);


}

d3.select('#scatter-story')
  .selectAll('.step')
  .data(commits)
  .join('div')
  .attr('class', 'step')
  .html(
    (d, i) => `
		On ${d.datetime.toLocaleString('en', {
      dateStyle: 'full',
      timeStyle: 'short',
    })},
		I made <a href="${d.url}" target="_blank">${
      i > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'
    }</a>.
		I edited ${d.totalLines} lines across ${
      d3.rollups(
        d.lines,
        (D) => D.length,
        (d) => d.file,
      ).length
    } files.
		Then I looked over all I had made, and I saw that it was very good.
	`,
  );

//   function onStepEnter(response) {
//   console.log(response.element.__data__.datetime);
// }

// function onStepEnter(response) {
//   const commit = response.element.__data__; // get data bound to .step
//   const index = commits.findIndex((d) => d.id === commit.id);

//   // Update slider state (optional)
//   commitProgress = timeScale(commit.datetime);
//   document.getElementById("commit-progress").value = commitProgress;

//   // Update visualizations
//   commitMaxTime = commit.datetime;
//   filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);

//   document.getElementById("commit-time").textContent = commitMaxTime.toLocaleString("en", {
//     dateStyle: "long",
//     timeStyle: "short",
//   });

//   updateScatterPlot(data, filteredCommits);
//   updateFileDisplay(filteredCommits);
// }
function onStepEnter(response) {
  const commit = response.element.__data__; // get data bound to .step
  const commitMaxTime = commit.datetime;
  const filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);

  updateScatterPlot(data, filteredCommits);
  updateFileDisplay(filteredCommits);
}


// Create Scrollama instance
const scroller = scrollama();

scroller
  .setup({
    container: '#scrolly-1',
    step: '#scatter-story .step',
    offset: 0.5, // triggers when step crosses mid-viewport
  })
  .onStepEnter(onStepEnter);


// const scroller = scrollama();
// scroller
//   .setup({
//     container: '#scrolly-1',
//     step: '#scrolly-1 .step',
//   })
//   .onStepEnter(onStepEnter);

d3.select('#file-story')
  .selectAll('.step')
  .data(commits)
  .join('div')
  .attr('class', 'step')
  .html(
    (d, i) => `
      On ${d.datetime.toLocaleString('en', {
        dateStyle: 'full',
        timeStyle: 'short',
      })}, I changed ${d.totalLines} lines in ${
        d3.rollups(d.lines, v => v.length, d => d.file).length
      } files.
    `
  );

function onFileStepEnter(response) {
  const commit = response.element.__data__;
  commitMaxTime = commit.datetime;

  filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);

  updateFileDisplay(filteredCommits);
}

scrollama()
  .setup({
    container: '#file-story',
    step: '#file-story .step',
    offset: 0.5,
  })
  .onStepEnter(onFileStepEnter);
