import pandas as pd
import ast
import os
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)

# Paths
quantitative_path = os.path.join('results', 'parsed', 'quantitative.csv')
ground_truth_path = 'network_analysis_results_with_new_ids.csv'

# Load data
quant_df = pd.read_csv(quantitative_path)
gt_df = pd.read_csv(ground_truth_path)

# Helper: get correct answer for a task/dataset
def get_correct_answer(task, dataset):
    if dataset.endswith('.json'):
        dataset = dataset[:-5]
    return gt_df[gt_df["dataset"] == dataset][f"T{task}"].values

# Tagging function
def tag_row(row):
    dataset = row[2]
    task = row[4]
    answer = row[5]
    correct = False


    gt_answer_raw = get_correct_answer(task, dataset)
    if task in [1, 2]:
        gt_answer = gt_answer_raw[0].split(',')
        gt_answer = [x.strip().upper() for x in gt_answer]
        answer = ast.literal_eval(answer)
        answer = [x.strip().upper() for x in answer]
        correct = len(set(gt_answer) & set(answer)) >= 1
    elif task == 3:
        correct = str(answer).strip().lower() == 'yes'
    elif task == 4:
        expected = 4 if 'high' in dataset else 2
        correct = int(answer) == expected
    elif task == 5:
        correct = int(answer) == int(gt_answer_raw[0])
    elif task == 6:
        user_list = ast.literal_eval(answer)
        correct = len(user_list) == int(gt_answer_raw[0])

    return 'correct' if correct else 'incorrect'

# Create a new DataFrame with the same data and add the 'tag' column
quant_df_tagged = quant_df.copy()
quant_df_tagged['tag'] = quant_df_tagged.apply(tag_row, axis=1)

# Save or print
quant_df_tagged.to_csv(os.path.join('results', 'parsed', 'quantitative_tagged.csv'), index=False)
print("Tagging complete. Output saved to results/parsed/quantitative_tagged.csv")