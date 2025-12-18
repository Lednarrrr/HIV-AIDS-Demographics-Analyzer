import csv
import random
import os
from datetime import datetime, timedelta

# --- CONFIGURATION ---
FOLDER_NAME = "datasets"
FILENAME = "data.csv" 

# 1. FIX: Adjusted Regional Weights to match DOH (NCR is now dominant)
REGIONS = ['NCR', 'Region 4A', 'Region 3', 'Region 7', 'Region 11', 'Region 6', 'Region 12', 'Region 1']
REGION_WEIGHTS = [45, 20, 15, 8, 5, 4, 2, 1] 

MODES = ['Sexual Contact', 'Sharing of Infected Needles', 'Mother-to-Child']

def get_random_date(year):
    start = datetime(year, 1, 1)
    end = datetime(year, 12, 31)
    delta = end - start
    days = random.randrange(delta.days + 1)
    return (start + timedelta(days=days)).strftime("%Y-%m-%d")

def get_age_group(age):
    if age < 15: return '<15'
    if 15 <= age <= 24: return '15-24'
    if 25 <= age <= 34: return '25-34'
    if 35 <= age <= 49: return '35-49'
    return '50+'

years_dist = {
    2010: 50, 2011: 60, 2012: 70, 2013: 100, 2014: 120,
    2015: 150, 2016: 180, 2017: 200, 2018: 220, 2019: 250,
    2020: 190, 2021: 280, 2022: 320, 2023: 380, 2024: 430
}

data = []
case_id = 10000

print("Generating 3,000 corrected rows...")

for year, count in years_dist.items():
    female_weight = 15 if year <= 2012 else 4
    male_weight = 100 - female_weight
    
    for _ in range(count):
        region = random.choices(REGIONS, weights=REGION_WEIGHTS)[0]
        sex = random.choices(['Male', 'Female'], weights=[male_weight, female_weight])[0]
        
        age = -1
        while age < 15 or age > 70:
            age = int(random.normalvariate(27, 7))
        
        age_group = get_age_group(age)
        
        if sex == 'Female':
            risk = 'Heterosexual'
            mode = 'Sexual Contact'
            if random.random() < 0.05: mode = 'Mother-to-Child'
        else:
            mode = 'Sexual Contact'
            risk = random.choices(['MSM', 'Bisexual', 'Heterosexual', 'Unknown'], weights=[81, 10, 5, 4])[0]
            if random.random() < 0.02: mode = 'Sharing of Infected Needles'

        data.append([
            case_id, get_random_date(year), region, sex, 
            age_group, mode, risk
        ])
        case_id += 1

# --- FIX: ROBUST PATH HANDLING ---
# Get the folder where THIS python script is located
script_dir = os.path.dirname(os.path.abspath(__file__))

# Build the full path to the 'datasets' folder inside the script's directory
dataset_folder_path = os.path.join(script_dir, FOLDER_NAME)

# Create the folder if it doesn't exist
if not os.path.exists(dataset_folder_path):
    print(f"Folder '{FOLDER_NAME}' not found. Creating it...")
    os.makedirs(dataset_folder_path)

# Build the full path for the CSV file
full_csv_path = os.path.join(dataset_folder_path, FILENAME)

# Write the CSV
header = ["Case_ID", "Diagnosis_Date", "Region", "Sex", "Age_Group", "Mode_of_Transmission", "Risk_Category"]

with open(full_csv_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(header)
    writer.writerows(data)

print(f"Success! Created: {full_csv_path}")
print(f"Rows generated: {len(data)}")