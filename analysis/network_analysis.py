import networkx as nx
import statistics
import csv
import matplotlib.pyplot as plt
from collections import defaultdict, Counter
from itertools import combinations
import pandas as pd

# Input Parameters
fileNames = [515, 629, 1086, 670, 616, 545, 1012, 583, 516, 518, 584, 551]

low = [629, 1086, 670, 616, 515, 545]
high = [1012, 583, 516, 518, 584, 551];

# Helper to load a graph
def load_graph(file_id):
    path = "datasets/Network_" + str(file_id) + ".graphml"
    try:
        G = nx.read_graphml(path)
        return G
    except Exception as e:
        print(f"Error loading graph {file_id}: {e}")
        return None

# Task 1: Articulation Points (Bridge Nodes)
def get_articulation_points(G):
    return list(nx.articulation_points(G))

# Task 2: Hub Nodes (Degree Centrality)
def get_hub_nodes(G, top_n=5):
    degree_dict = dict(G.degree())
    sorted_nodes = sorted(degree_dict.items(), key=lambda x: x[1], reverse=True)
    return sorted_nodes[:top_n]

# Task 3: Number of Connected Components (Clusters)
def get_number_of_clusters(G):
    return nx.number_connected_components(G.to_undirected())

# Task 4: Nodes in Largest Connected Component
def get_largest_cluster_nodes(G):
    components = list(nx.connected_components(G.to_undirected()))
    largest = max(components, key=len)
    return list(largest)

# Run analysis on all files
if __name__ == "__main__":
    results_df = pd.DataFrame(columns=['File ID', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6'])

    for file_id in fileNames:
        G = load_graph(file_id)
        if G is None:
            continue

        # ['t1', 'Which nodes (if removed) would break the network into separate parts?'], // Node / Topology Task
        # ['t2', 'Which nodes have the most links to other nodes?'], // Node / Topology Task
        # ['t3', 'Does a path of length 4 exist between ${A} and ${B}?'], // Link / Browsing Task
        # ['t4', 'How many common neighbors are there between ${A} and ${B}?'], // Link / Browsing Task
        # ['t5', 'How many groups can you see?'], // Cluster / Overview Task
        # ['t6', 'Which nodes belong to the biggest connected group?'],
        
        t1 = get_articulation_points(G)
        t2 = get_hub_nodes(G)
        t3 = True

        if file_id in low:
            t4 = 2
        elif file_id in high:
            t4 = 4
        else:
            t4 = None

        t5 = get_number_of_clusters(G)
        t6 = len(get_largest_cluster_nodes(G))

        print(f"Analysis for Network {file_id}:")
        print("Articulation Points (Bridge Nodes):", t1)
        print("Hub Nodes (Top 5 by Degree Centrality):", t2)
        print("Path of length X exists:", t3)
        print("Common Neighbors X/Y:", t4)
        print("Number of Connected Components (Clusters):", t5)
        print("Nodes in Largest Connected Component:", t6)
        print("\n")

        results_df = pd.concat([
            results_df,
            pd.DataFrame([{
            'File ID': file_id,
            'T1': t1,
            'T2': t2,
            'T3': t3,
            'T4': t4,
            'T5': t5,
            'T6': t6
            }])
        ], ignore_index=True)

    # After the loop, save the DataFrame to CSV
    results_df.to_csv("network_analysis_summary.csv", index=False)
