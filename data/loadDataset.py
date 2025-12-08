 import kagglehub
import os
import pandas as pd

# Download latest version
print("Downloading YouTube Trending Video Dataset from Kaggle...")
path = kagglehub.dataset_download("datasnaek/youtube-new")
print("Path to dataset files:", path)

# List available files
print("\nAvailable files in dataset:")
csv_files = []
for root, dirs, files in os.walk(path):
    for file in files:
        if file.endswith('.csv'):
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, path)
            csv_files.append(file_path)
            print(f"  - {rel_path}")

# Load and display info about the first CSV file found
if csv_files:
    first_file = csv_files[0]
    print(f"\nLoading file: {os.path.basename(first_file)}")
    df = pd.read_csv(first_file)
    print(f"\nDataset shape: {df.shape}")
    print("\nFirst 5 records:")
    print(df.head())
    print("\nColumn names:")
    print(df.columns.tolist())
    print(f"\nTotal files found: {len(csv_files)}")
else:
    print("\nNo CSV files found in dataset!")