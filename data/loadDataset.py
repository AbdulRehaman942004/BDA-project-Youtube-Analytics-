import kagglehub
import os
import pandas as pd
import shutil

# Get the script directory and create target directory
script_dir = os.path.dirname(os.path.abspath(__file__))
target_dir = os.path.join(script_dir, 'kaggle')

# Create target directory if it doesn't exist
os.makedirs(target_dir, exist_ok=True)
print(f"Target directory: {target_dir}")

# Download latest version
print("\n📥 Downloading YouTube Trending Video Dataset from Kaggle...")
path = kagglehub.dataset_download("datasnaek/youtube-new")
print(f"📂 Kaggle cache path: {path}")

# Find all CSV files in the downloaded dataset
print("\n🔍 Scanning for CSV files...")
csv_files = []
for root, dirs, files in os.walk(path):
    for file in files:
        if file.endswith('.csv'):
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, path)
            csv_files.append((file_path, file))
            print(f"  ✓ Found: {rel_path}")

if not csv_files:
    print("\n❌ No CSV files found in dataset!")
    exit(1)

# Copy CSV files to target directory
print(f"\n📋 Copying {len(csv_files)} CSV file(s) to {target_dir}...")
copied_count = 0
for source_path, filename in csv_files:
    target_path = os.path.join(target_dir, filename)
    try:
        shutil.copy2(source_path, target_path)
        print(f"  ✓ Copied: {filename}")
        copied_count += 1
    except Exception as e:
        print(f"  ❌ Failed to copy {filename}: {e}")

if copied_count == 0:
    print("\n❌ Failed to copy any files!")
    exit(1)

print(f"\n✅ Successfully copied {copied_count} file(s) to {target_dir}")

# Load and display info about the first CSV file found
first_file = os.path.join(target_dir, csv_files[0][1])
print(f"\n📊 Preview of first file: {os.path.basename(first_file)}")
try:
    df = pd.read_csv(first_file)
    print(f"  Shape: {df.shape[0]} rows × {df.shape[1]} columns")
    print(f"\n  Column names:")
    for col in df.columns.tolist():
        print(f"    - {col}")
    print(f"\n  First few rows:")
    print(df.head(3).to_string())
except Exception as e:
    print(f"  ⚠️  Could not preview file: {e}")

print(f"\n🎉 Dataset ready for import!")
print(f"💡 Next step: Run 'node data/importDataset.js' to import into MongoDB")