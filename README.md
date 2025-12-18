# 🇵🇭 HIV/AIDS Demographics Dashboard (Philippines)

An interactive data visualization dashboard designed to analyze and display demographic trends regarding HIV/AIDS cases in the Philippines from **2010 to 2024**.

This project provides an interface to explore data across various categories such as Region, Age Group, Mode of Transmission, and Risk Category.

## 🚀 Features

* **Interactive Visualizations:** Powered by **Chart.js** to render dynamic charts:
    * 📈 **Yearly Trend:** Line chart showing the rise of cases over time.
    * 📊 **Regional Distribution:** Bar chart ranking cases by region.
    * 🍩 **Sex Ratio:** Doughnut chart comparing Male vs. Female cases.
    * 🥧 **Risk Category:** Pie chart (MSM, Heterosexual, Bisexual, Unknown).
    * 📉 **Transmission & Age Group:** Horizontal bar charts utilizing **Logarithmic Scales** to visualize vast differences in data magnitudes.
* **Dynamic Filtering System:**
    * Filter data by Year, Region, Sex, Risk Category, and Mode of Transmission.
    * Real-time chart updates upon selecting filters.
    * Snap-scrolling dropdown menu for easy navigation.
* **Modern UI/UX:**
    * **Dark Mode** design by default (`#1E1E2C` & `#252535`).
    * **Sticky Header** for easy access to controls.
    * **Responsive Grid** layout that adapts to mobile and desktop screens.
* **Data Handling:**
    * Parses raw CSV data directly in the browser.
    * Includes safety checks for missing or malformed data.

## 🛠️ Technologies Used

* **HTML5:** Semantic structure.
* **CSS3:** CSS Variables, Flexbox, Grid, Sticky Positioning, and Scroll Snapping.
* **JavaScript (ES6+):** Async/Await for data fetching, DOM manipulation, and filtering logic.
* **Chart.js (v4.x):** Rendering canvas-based charts.

## 📂 Project Structure

```text
├── datasets/
│   └── data.csv         # The raw CSV data file
├── index.html           # Main dashboard structure
├── style.css            # Styling, Dark Theme, and Responsive rules
├── script.js            # Data parsing, Chart.js config, and Filter logic
├── generateData.py      # Data Generation
└── README.md            # Project documentation