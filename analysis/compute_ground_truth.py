import csv
import json
import os
import ast

# Paths
csv_path = 'network_analysis_results_remapped.csv'
datasets_dir = 'datasets'
output_csv_path = 'network_analysis_results_with_new_ids.csv'

# Load all JSON files and build a mapping: dataset filename -> {oldID -> newID}
id_maps = {}
for fname in os.listdir(datasets_dir):
    if fname.endswith('.json'):
        with open(os.path.join(datasets_dir, fname), 'r') as f:
            data = json.load(f)
            # Assume nodes are in a list under 'nodes'
            id_map = {str(node['oldID']): str(node['id']) for node in data['graph']['nodes']}
            id_maps[fname] = id_map  # Use the full filename as the dataset key


# Read CSV, replace IDs, and write new CSV
with open(csv_path, newline='') as infile, open(output_csv_path, 'w', newline='') as outfile:
    reader = csv.DictReader(infile)
    fieldnames = reader.fieldnames
    if fieldnames is None:
        raise ValueError("Input CSV file is missing header row (fieldnames).")
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    for row in reader:
        filename = row['File ID']
        node_map = id_maps[filename + '.json']  # Get the mapping for this dataset
        
        # Parse and replace IDs for T1 (array of IDs as string)
        # For T1, just split by comma and strip spaces, no JSON decode
        # Parse T1 as a JSON array of strings (e.g., "['ID', 'ID', ...]"), but single quotes are not valid JSON
        t1_ids = ast.literal_eval(row['T1'])
        new_t1_ids = []
        for old_id in t1_ids:
            old_id_str = str(old_id)
            if old_id_str in node_map:
                new_t1_ids.append(node_map[old_id_str])
            else:
                raise KeyError(f"Old ID {old_id_str} not found in node map for {filename}")
        row['T1'] = ','.join(new_t1_ids)

        # For T2, also treat as comma-separated IDs (if that's the format)
        t2_ids = ast.literal_eval(row['T2'])
        t2_ids_only = [item[0] for item in t2_ids]

        new_t2_ids = []
        for old_id in t2_ids_only:
            old_id_str = str(old_id)
            if old_id_str in node_map:
                new_t2_ids.append(node_map[old_id_str])
            else:
                raise KeyError(f"Old ID {old_id_str} not found in node map for {filename}")
        row['T2'] = ','.join(new_t2_ids)

        writer.writerow(row)