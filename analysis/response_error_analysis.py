import pandas as pd
import ast
import os

# Paths
quantitative_path = os.path.join('results', 'parsed', 'quantitative.csv')
ground_truth_path = 'network_analysis_results_with_new_ids.csv'

# Load data
quant_df = pd.read_csv(quantitative_path)
gt_df = pd.read_csv(ground_truth_path)

# Helper: get correct answer for a task/dataset
def get_correct_answer(task, dataset):
    print(f"Retrieving correct answer for task {task} on dataset {dataset}")
    row = gt_df[(gt_df['dataset'] == dataset)]
    if str(task) in gt_df.columns:
        row = row[[str(task)]].rename(columns={str(task): 'answer'})
    else:
        row = pd.DataFrame()
    if row.empty:
        return None
    return row.iloc[0]['answer']

# Tagging function
def tag_row(row):
    dataset = row[2]
    task = row[4]
    answer = row[5]
    correct = False

    print(f"Processing dataset: {dataset}, task: {task}, answer: {answer}")

    gt_answer = get_correct_answer(task, dataset)

    try:
        if task in [1, 2]:
            # Any selected ID matches ground truth
            user_ids = set(ast.literal_eval(answer))
            if gt_answer is not None:
                gt_ids = set(ast.literal_eval(gt_answer))
                correct = not user_ids.isdisjoint(gt_ids)
            else:
                correct = False
        elif task == 3:
            correct = str(answer).strip().lower() == 'yes'
        elif task == 4:
            expected = 4 if 'high' in dataset else 2
            correct = int(answer) == expected
        elif task == 5:
            if answer is not None and gt_answer is not None:
                correct = float(answer) == float(gt_answer)
            else:
                correct = False
        elif task == 6:
            user_list = ast.literal_eval(answer)
            if gt_answer is not None:
                correct = len(user_list) == int(gt_answer)
            else:
                correct = False
    except Exception:
        correct = False

    return 'correct' if correct else 'incorrect'

# Create a new DataFrame with the same data and add the 'tag' column
quant_df_tagged = quant_df.copy()
quant_df_tagged['tag'] = quant_df_tagged.apply(tag_row, axis=1)

# Save or print
quant_df_tagged.to_csv(os.path.join('results', 'parsed', 'quantitative_tagged.csv'), index=False)
print("Tagging complete. Output saved to results/parsed/quantitative_tagged.csv")