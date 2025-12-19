Chart.defaults.color = '#e0e0e0';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

let GLOBAL_DATA = [];

async function fetchAndRenderCSV() {

    try {
        const res = await fetch('datasets/data.csv');
        
        const csvText = await res.text();
        const data = parseCsvToObjects(csvText);
        
        GLOBAL_DATA = data;
        if (data.error) throw new Error(data.error);
        
        initFilters(data);
        renderSummaryCards(data);
        renderBarChart(data);
        renderLineChart(data);
        renderSexRatioChart(data);
        renderRiskChart(data);
        renderTransmissionChart(data);
        renderAgeGroupChart(data);

    } catch (err) {
        console.error(err);
        document.getElementById('error').textContent = err.message;
    }
}

function parseCsvToObjects(csvText) {
    const lines = csvText.split(/\r?\n/);
    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const currentLine = line.split(',');
        if (currentLine.length === headers.length) {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = currentLine[index].trim();
            });
            result.push(obj);
        }
    }
    return result;
}

function renderBarChart(rawData) {
    const accumulator = {};
    rawData.forEach(row => {
        const region = row.Region || row.region; 
        const cases = 1; 
        if (accumulator[region]) accumulator[region] += cases;
        else accumulator[region] = cases;
    });

    let aggregatedData = Object.keys(accumulator).map(regionName => {
        return { Region: regionName, TotalCases: accumulator[regionName] };
    });
    aggregatedData.sort((a, b) => b.TotalCases - a.TotalCases);

    const labels = aggregatedData.map(item => item.Region);
    const values = aggregatedData.map(item => item.TotalCases);

    const ctx = document.getElementById('myChart').getContext('2d');
    if (window.myBarChart) window.myBarChart.destroy();

    window.myBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Cases by Region',
                data: values,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}

function renderLineChart(rawData) {
    const yearCounts = {};
    rawData.forEach(row => {
        const dateStr = row.Diagnosis_Date || row.diagnosis_date;
        if (dateStr) {
            const year = dateStr.substring(0, 4);
            yearCounts[year] = (yearCounts[year] || 0) + 1;
        }
    });
    const years = Object.keys(yearCounts).sort();
    const counts = years.map(year => yearCounts[year]);

    Chart.Interaction.modes.nearestXbelow = function(chart, e, options, useFinalPosition) {
        const items = Chart.Interaction.modes.index(chart, e, options, useFinalPosition);
        return items.filter(item => {
            return e.y >= (item.element.y - 10); 
        });
    };

    const ctx = document.getElementById('lineChart').getContext('2d');
    if (window.myLineChart) window.myLineChart.destroy();

    window.myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Cases per Year (The Rise)',
                data: counts,
                borderColor: '#FF6384',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.3,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#FF6384',
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#FF6384',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearestXbelow', 
                intersect: false,      
            },
            hover: { animationDuration: 0 },
            animation: { duration: 0 },
            plugins: {
                title: { 
                    display: true, 
                    text: 'Annual HIV Case Trend (2010-2024)',
                    font: { size: 14 }
                },
                tooltip: {
                    animation: false,
                    backgroundColor: 'rgba(30, 30, 44, 0.9)',
                    titleColor: '#F29F67',
                    padding: 10,
                    displayColors: false,
                }
            },
            scales: { 
                y: { beginAtZero: true },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderSexRatioChart(rawData) {
    let maleCount = 0;
    let femaleCount = 0;
    rawData.forEach(row => {
        const sex = row.Sex || row.sex;
        if (sex === 'Male') maleCount++;
        else if (sex === 'Female') femaleCount++;
    });
    const total = maleCount + femaleCount;
    const malePercent = ((maleCount / total) * 100).toFixed(1) + '%';
    const femalePercent = ((femaleCount / total) * 100).toFixed(1) + '%';
    const maleLabel = `Male: ${maleCount} (${malePercent})`;
    const femaleLabel = `Female: ${femaleCount} (${femalePercent})`;

    const ctx = document.getElementById('sexRatioChart').getContext('2d');
    if (window.mySexChartInstance) window.mySexChartInstance.destroy();

    window.mySexChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [maleLabel, femaleLabel], 
            datasets: [{
                data: [maleCount, femaleCount],
                backgroundColor: ['#36A2EB', '#FF6384'],
                borderColor: '#252535', 
                borderWidth: 2, 
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Sex Distribution (Total: ' + total + ')',
                    font: { size: 16 }
                },
                legend: {
                    position: 'bottom',
                    labels: { 
                        font: { size: 14, weight: 'bold' }, 
                        padding: 20,
                        color: '#e0e0e0'
                    }
                }
            }
        }
    });
}

function renderRiskChart(rawData) {
    const counts = { 'MSM': 0, 'Heterosexual': 0, 'Bisexual': 0, 'Unknown': 0 };
    rawData.forEach(row => {
        const risk = row.Risk_Category || row.risk_category;
        if (counts[risk] !== undefined) counts[risk]++;
        else counts['Unknown']++; 
    });

    const ctx = document.getElementById('riskChart').getContext('2d');
    if (window.myRiskChartInstance) window.myRiskChartInstance.destroy();

    window.myRiskChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['MSM', 'Heterosexual', 'Bisexual', 'Unknown'],
            datasets: [{
                data: [counts['MSM'], counts['Heterosexual'], counts['Bisexual'], counts['Unknown']],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#C9CBCF'],
                borderColor: '#252535',
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribution by Risk Category',
                    font: { size: 16 }
                },
                legend: {
                    position: 'right',
                    labels: {
                        color: '#e0e0e0',
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map(function(label, i) {
                                    const value = data.datasets[0].data[i];
                                    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1) + "%";
                                    const fill = data.datasets[0].backgroundColor[i];
                                    return {
                                        text: `${label}: ${value} (${percentage})`,
                                        fillStyle: fill,
                                        hidden: isNaN(data.datasets[0].data[i]) || chart.getDatasetMeta(0).data[i].hidden,
                                        index: i,
                                        fontColor: '#e0e0e0' 
                                    };
                                });
                            }
                            return [];
                        }
                    }
                }
            }
        }
    });
}

function renderTransmissionChart(rawData) {
    const counts = { 'Sexual Contact': 0, 'Sharing of Infected Needles': 0, 'Mother-to-Child': 0 };
    rawData.forEach(row => {
        const mode = row.Mode_of_Transmission || row.mode_of_transmission;
        if (counts[mode] !== undefined) counts[mode]++;
    });

    const ctx = document.getElementById('transmissionChart').getContext('2d');
    if (window.myTransmissionChart) window.myTransmissionChart.destroy();

    window.myTransmissionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Sexual Contact', 'Sharing of Infected Needles', 'Mother-to-Child'],
            datasets: [{
                label: 'Mode of Transmission',
                data: [counts['Sexual Contact'], counts['Sharing of Infected Needles'], counts['Mother-to-Child']],
                backgroundColor: ['#9966FF', '#FF9F40', '#4BC0C0'],
                borderColor: ['#9966FF', '#FF9F40', '#4BC0C0'],
                borderWidth: 1,
                minBarLength: 5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false, 
            plugins: {
                title: { display: true, text: 'Mode of Transmission', font: { size: 16 } },
                legend: { display: false }
            },
            scales: { 
                x: { 
                    type: 'logarithmic',
                    beginAtZero: true 
                } 
            }
        }
    });
}

function renderAgeGroupChart(rawData) {
    const counts = {};
    rawData.forEach(row => {
        const group = row.Age_Group || row.age_group;
        if (group) counts[group] = (counts[group] || 0) + 1;
    });

    const order = ['<15', '15-24', '25-34', '35-49', '50+'];
    const sortedLabels = order.filter(label => counts[label] !== undefined);
    const sortedData = sortedLabels.map(label => counts[label]);

    const ctx = document.getElementById('ageGroupChart').getContext('2d');
    if (window.myAgeGroupChart) window.myAgeGroupChart.destroy();

    window.myAgeGroupChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedLabels,
            datasets: [{
                label: 'Cases by Age Group',
                data: sortedData,
                backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
                borderWidth: 1,
                minBarLength: 5 
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            plugins: {
                title: { display: true, text: 'Age Group Distribution', font: { size: 16 } },
                legend: { display: false }
            },
            scales: {
                y: { 
                    type: 'logarithmic', 
                    beginAtZero: true, 
                    title: { display: true, text: 'Number of Cases (Log Scale)' } 
                },
                x: { title: { display: true, text: 'Age Group' } }
            }
        }
    });
}

const filterBtn = document.getElementById('filter-btn');
const dropdown = document.getElementById('filter-dropdown');
const closeBtn = document.getElementById('close-dropdown');
const resetBtn = document.getElementById('reset-btn');

filterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('active');
});

closeBtn.addEventListener('click', () => {
    dropdown.classList.remove('active');
});

resetBtn.addEventListener('click', () => {
    document.querySelectorAll('#filters-container input').forEach(box => box.checked = false);
    applyFilters(); 
});

window.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !filterBtn.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});
dropdown.addEventListener('click', (e) => e.stopPropagation());

function initFilters(data) {
    const container = document.getElementById('filters-container');
    container.innerHTML = ''; 

    const categories = [
        { label: 'Year', key: 'Diagnosis_Date', isYear: true },
        { label: 'Age Group', key: 'Age_Group' },
        { label: 'Region', key: 'Region' },
        { label: 'Sex', key: 'Sex' },
        { label: 'Risk Category', key: 'Risk_Category' },
        { label: 'Transmission', key: 'Mode_of_Transmission' }
    ];

    categories.forEach(cat => {
        const uniqueValues = new Set();
        data.forEach(row => {
            let val = row[cat.key] || row[cat.key.toLowerCase()];
            if (cat.isYear && val) val = val.substring(0, 4); 
            if (val) uniqueValues.add(val);
        });

        const sortedValues = Array.from(uniqueValues).sort();

        const section = document.createElement('div');
        section.className = 'filter-section';
        
        const title = document.createElement('h4');
        title.textContent = cat.label;
        section.appendChild(title);

        const list = document.createElement('div');
        list.className = 'checkbox-group';

        sortedValues.forEach(val => {
            const label = document.createElement('label');
            label.className = 'checkbox-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = val;
            checkbox.dataset.category = cat.key;
            checkbox.dataset.isYear = cat.isYear || false;
            
            checkbox.addEventListener('change', applyFilters);

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(` ${val}`));
            list.appendChild(label);
        });

        section.appendChild(list);
        container.appendChild(section);
    });
}

function applyFilters() {
    const checkboxes = document.querySelectorAll('#filters-container input[type="checkbox"]');
    const selected = {};
    let hasSelection = false;

    checkboxes.forEach(box => {
        if (box.checked) {
            hasSelection = true;
            const cat = box.dataset.category;
            if (!selected[cat]) selected[cat] = [];
            selected[cat].push(box.value);
        }
    });

    const filteredData = GLOBAL_DATA.filter(row => {
        let match = true;
        for (const category in selected) {
            const allowedValues = selected[category];
            let rowValue = row[category] || row[category.toLowerCase()];
            const referenceBox = document.querySelector(`input[data-category="${category}"]`);
            if (referenceBox && referenceBox.dataset.isYear === 'true' && rowValue) {
                rowValue = rowValue.substring(0, 4);
            }
            if (!allowedValues.includes(rowValue)) {
                match = false;
                break;
            }
        }
        return match;
    });

    const count = filteredData.length;

    
    renderSummaryCards(filteredData);
    renderBarChart(filteredData);
    renderLineChart(filteredData);
    renderSexRatioChart(filteredData);
    renderRiskChart(filteredData);
    renderTransmissionChart(filteredData);
    renderAgeGroupChart(filteredData);
}

function renderSummaryCards(data) {
    const total = data.length;
    const totalEl = document.getElementById('kpi-total');
    const totalTextEl = document.getElementById('kpi-total-text');
    
    if (totalEl) {
        totalEl.textContent = total.toLocaleString();
        totalTextEl.textContent = (total === GLOBAL_DATA.length) 
            ? "Total Loaded Rows" 
            : "Filtered Records";
    }

    const yearCounts = {};
    data.forEach(row => {
        const dateStr = row.Diagnosis_Date || row.diagnosis_date;
        if (dateStr) {
            const y = dateStr.substring(0, 4);
            yearCounts[y] = (yearCounts[y] || 0) + 1;
        }
    });

    const sortedYears = Object.keys(yearCounts).sort();
    const growthEl = document.getElementById('kpi-growth');
    const growthText = document.getElementById('kpi-growth-text');

    if (sortedYears.length >= 2) {
        const latestYear = sortedYears[sortedYears.length - 1];
        const prevYear = sortedYears[sortedYears.length - 2];
        const latestCount = yearCounts[latestYear];
        const prevCount = yearCounts[prevYear];

        const growthRate = ((latestCount - prevCount) / prevCount) * 100;
        const formattedGrowth = growthRate.toFixed(1) + '%';

        growthEl.textContent = (growthRate > 0 ? '+' : '') + formattedGrowth;
        growthText.textContent = `Cases in ${latestYear} vs ${prevYear}`;

        if (growthRate > 0) growthEl.style.color = '#FF6384';
        else growthEl.style.color = '#4BC0C0';
    } else {
        growthEl.textContent = "N/A";
        growthText.textContent = "Select >1 Year";
        growthEl.style.color = "#fff";
    }

    const youthCount = data.filter(r => {
        const group = r.Age_Group || r.age_group;
        return group === '15-24';
    }).length;

    const percent = total > 0 ? ((youthCount / total) * 100).toFixed(1) + '%' : '0%';
    
    const shareEl = document.getElementById('kpi-youth-share');
    const shareTextEl = document.getElementById('kpi-youth-text');
    
    if (shareEl) {
        shareEl.textContent = percent;
        shareEl.style.color = '#F29F67';
    }
    if (shareTextEl) {
        shareTextEl.textContent = `${youthCount.toLocaleString()} Youth Cases`;
    }

    const modes = {};
    data.forEach(r => {
        const m = r.Mode_of_Transmission || r.mode_of_transmission;
        if (m) {
            modes[m] = (modes[m] || 0) + 1;
        }
    });

    const topMode = Object.keys(modes).sort((a,b) => modes[b] - modes[a])[0];
    
    const modeEl = document.getElementById('kpi-mode');
    const modeTextEl = document.getElementById('kpi-mode-text');

    if (modeEl) {
        modeEl.textContent = topMode || '-';
        if (topMode && topMode.length > 15) {
            modeEl.style.fontSize = "1.1rem";
        } else {
            modeEl.style.fontSize = "1.5rem";
        }
    }
    
    if (modeTextEl && topMode) {
        const count = modes[topMode];
        modeTextEl.textContent = `${count.toLocaleString()} cases recorded`;
    }
}

document.addEventListener('DOMContentLoaded', fetchAndRenderCSV);