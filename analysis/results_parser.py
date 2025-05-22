import os
import json
import re
import pandas as pd
import csv


qualitativeIDs = [4 ,6, 8, 10, 12, 14];
quantativeIDS = [3, 5, 7, 9, 11, 13];
endQuestionFeedback = 15
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
    # answers.append({
    #     "userID": userID,
    #     "encoding": userJSON[0]["encoding"],
    #     "dataset": userJSON[0]["dataset"],
    #     "complexity": userJSON[0]["complexity"],
    #     "task": 9,
    #     "answer": userJSON[21]["answer"]["comments"]
    # })
    return pd.DataFrame(answers)

def load_end_question_feedback(userJSON, userID):
    answers = []
    taskData = userJSON[endQuestionFeedback]

    answers.append({
        "userID": userID,
        "encoding": taskData["encoding"],
        "dataset": "End Question Feedback",
        "complexity": taskData["complexity"],
        "task": "overall",
        "answer": str(taskData["overall"]),
    })

    answers.append({
        "userID": userID,
        "encoding": taskData["encoding"],
        "dataset": "End Question Feedback",
        "complexity": taskData["complexity"],
        "task": "effective",
        "answer": str(taskData["effective"]),
    })

    answers.append({
        "userID": userID,
        "encoding": taskData["encoding"],
        "dataset": "End Question Feedback",
        "complexity": taskData["complexity"],
        "task": "suitable",
        "answer": str(taskData["suitable"]),
    })

    answers.append({
        "userID": userID,
        "encoding": taskData["encoding"],
        "dataset": "End Question Feedback",
        "complexity": taskData["complexity"],
        "task": "alternativeDisplay",
        "answer": str(taskData["alternativeDisplay"]),
    })

    answers.append({
        "userID": userID,
        "encoding": taskData["encoding"],
        "dataset": "End Question Feedback",
        "complexity": taskData["complexity"],
        "task": "preference",
        "answer": str(taskData["preference"]),
    })

    comments = taskData["comments"] if "comments" in taskData else ""

    answers.append({
        "userID": userID,
        "encoding": taskData["encoding"],
        "dataset": "End Question Feedback",
        "complexity": taskData["complexity"],
        "task": "comments",
        "answer": str(comments) ,
    })
    
    return pd.DataFrame(answers)
# Main Execution --------------------------------------------------------------

rootDir = "./results"
outDir = "./results/parsed"
pattern = r"(nodelink|nolink|interactive)_(low|high)#(.+).json"

quantitatives = pd.DataFrame()
qualitatives = pd.DataFrame()
correctCount, inCorrectCount = 0, 0

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

        qual = load_qualitative(userJSON, userID)
        quant = load_quantitative(userJSON, userID)
        endFeedback = load_end_question_feedback(userJSON, userID)

        quantitatives = pd.concat([quantitatives, quant], ignore_index=True)
        qualitatives = pd.concat([qualitatives, qual], ignore_index=True)
        qualitatives = pd.concat([qualitatives, endFeedback], ignore_index=True)
    else:
        print(f"User {userID} has an incorrect number of questions: {len(userJSON)}")
        print(f"File: {file}")
        print(f"Expected: 16, Found: {len(userJSON)}")
        inCorrectCount += 1
        continue
        
print(f"Correct count: {correctCount}; Incorrect count: {inCorrectCount}")
quantitatives.to_csv(os.path.join(outDir, "quantitative.csv"), index=False)
qualitatives.to_csv(os.path.join(outDir, "qualitatives.csv"), index=False)

    
