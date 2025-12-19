# 🇵🇭 HIV/AIDS Demographics Dashboard (Philippines)

An interactive data visualization dashboard designed to analyze and display demographic trends regarding HIV/AIDS cases in the Philippines from **2010 to 2024**, with a specific focus on the rising cases among the **Youth Demographic (15-24)**.

This project provides a user interface to explore data across various categories such as Region, Age Group, Mode of Transmission, and Risk Category.

## 🚀 Features

* **Advanced Filtering System (Tri-State Logic):**
    * **Include (✓):** Select specific categories to focus on.
    * **Exclude (✕):** Explicitly remove specific data points (e.g., exclude "Unknown" risks).
    * **Reset:** Quickly clear all filters to see the full dataset.
* **Smart Summary Cards (KPIs):**
    * **Annual Growth:** Calculates year-over-year percentage change (Red = Increase, Green = Decrease).
    * **Youth Share:** Displays the percentage of cases belonging to the 15-24 age group.
    * **Primary Driver:** Identifies the top mode of transmission dynamically based on filtered data.
    * **Total Cases:** Live counter of active records.
* **Interactive Visualizations (Chart.js):**
    * 📈 **Yearly Trend:** Line chart showing the rise of cases over time.
    * 📊 **Regional Distribution:** Bar chart ranking cases by region.
    * 🍩 **Sex Ratio:** Doughnut chart comparing Male vs. Female cases.
    * 🥧 **Risk Category:** Pie chart (MSM, Heterosexual, Bisexual, Unknown).
    * 📉 **Transmission & Age Group:** Horizontal bar charts utilizing **Logarithmic Scales** to visualize vast differences in data magnitudes.
* **Modern UI/UX:**
    * **Dark Mode** design (`#1E1E2C` background).
    * **Sticky Header** for easy access to controls.
    * **Responsive Grid** layout that adapts to mobile and desktop screens.

## 🛠️ Technologies Used

* **HTML5:** Semantic structure.
* **CSS3:** CSS Variables, Flexbox, Grid, Sticky Positioning, Scroll Snapping, and Tri-state checkbox styling.
* **JavaScript (ES6+):** Async/Await for data fetching, advanced array filtering (Include/Exclude logic), and DOM manipulation.
* **Chart.js (v4.x):** Rendering canvas-based charts.
* **Python:** Used for generating the simulated dataset (`generateData.py`).

## 📂 Project Structure

```text
├── datasets/
│   └── data.csv         # The raw CSV data file
├── index.html           # Main dashboard structure
├── style.css            # Styling, Dark Theme, and Responsive rules
├── script.js            # Data parsing, Chart.js config, and Filter logic
├── generateData.py      # Data Generation Script
└── README.md            # Project documentation