# Install dependencies as needed:
# pip install kagglehub[pandas-datasets]
import kagglehub
from kagglehub import KaggleDatasetAdapter
import os

# Dataset handle
dataset_handle = "datasnaek/youtube-new"

print("Downloading dataset...")
# Download the dataset first to see available files
dataset_path = kagglehub.dataset_download(dataset_handle)
print(f"Dataset downloaded to: {dataset_path}")

# List available files
print("\nAvailable files in dataset:")
for root, dirs, files in os.walk(dataset_path):
    for file in files:
        if file.endswith('.csv'):
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, dataset_path)
            print(f"  - {rel_path}")

# Try to load a specific file (US data is usually available)
# The dataset typically has files like: USvideos.csv, GBvideos.csv, etc.
us_file = None
for root, dirs, files in os.walk(dataset_path):
    for file in files:
        if 'US' in file.upper() and file.endswith('.csv'):
            us_file = os.path.join(root, file)
            break
    if us_file:
        break

if us_file:
    print(f"\nLoading file: {os.path.basename(us_file)}")
    import pandas as pd
    df = pd.read_csv(us_file)
    print(f"\nDataset shape: {df.shape}")
    print("\nFirst 5 records:")
    print(df.head())
    print("\nColumn names:")
    print(df.columns.tolist())
else:
    print("\nNo US file found. Available CSV files:")
    for root, dirs, files in os.walk(dataset_path):
        for file in files:
            if file.endswith('.csv'):
                print(f"  - {os.path.join(root, file)}")