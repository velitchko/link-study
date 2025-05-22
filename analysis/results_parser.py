import os
import json
import re
import pandas as pd


qualitativeIDs = [];
quantativeIDS = [];

# Custom Functions ------------------------------------------------------------
def load_quantitative(userJSON, userID):
    answers = []
    for index in quantativeIDS:
        taskData = userJSON[index]
        answer = {
            "userID": userID,
            "encoding": taskData["encoding"],
            "dataset": taskData["dataset"],
            "complexity": taskData["complexity"],
            "task": int(re.search(r"\d+", taskData["task"]).group()),
            "answer": str(taskData["answer"]),
            "time": taskData["time"]
        }
        answers.append(answer)
    return pd.DataFrame(answers)

def load_qualitative(userJSON, userID):
    answers = []
    for index in qualitativeIDs:
        taskData = userJSON[index]
        answers.append({
            "userID": userID,
            "encoding": taskData["encoding"],
            "dataset": taskData["dataset"],
            "complexity": taskData["complexity"],
            "task": int(re.search(r"\d+", taskData["task"]).group()),
            "answer": str(taskData["answer"])
        })
    # Final comment
    answers.append({
        "userID": userID,
        "encoding": userJSON[0]["encoding"],
        "dataset": userJSON[0]["dataset"],
        "complexity": userJSON[0]["complexity"],
        "task": 9,
        "answer": userJSON[21]["answer"]["comments"]
    })
    return pd.DataFrame(answers)

# Main Execution --------------------------------------------------------------

rootDir = "./results"
outDir = "./results/parsed"
pattern = r"(nodelink|nolink|interactive)_(low|high)#(.+).json"

quantitatives = []
qualitatives = []
correctCount = 0

for file in os.listdir(rootDir):
    if not re.match(pattern, file):
        continue

    userID_match = re.match(pattern, file)
    if userID_match:
        userID = userID_match.group(3)
    else:
        continue

    with open(os.path.join(rootDir, file), "r") as f:
        userJSON = json.load(f)

    if len(userJSON) == 16:
        correctCount += 1
        print(f"{file}: {len(userJSON)} items")
    # quantitatives.append(load_quantitative(userJSON, userID))
    # qualitatives.append(load_qualitative(userJSON, userID))
print(f"Correct count: {correctCount}")
# # Combine dataframes if needed:
# df_quantitatives = pd.concat(quantitatives, ignore_index=True)
# df_qualitatives = pd.concat(qualitatives, ignore_index=True)
