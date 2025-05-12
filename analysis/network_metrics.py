import networkx as nx
import statistics
import csv
from collections import defaultdict
import matplotlib.pyplot as plt
from collections import Counter
from itertools import combinations
# Specify Input Parameter
fileNames= [515, 629, 1086, 670, 616, 545, 1012, 583, 516, 518, 584, 551]
highlightIDs={
	515: [], 
	629: [], 
	670: [], 
    1086: [],
	616: [], 
	545: [],
	1012: [], 
	583: [], 
	516: [], 
	518: [], 
	584: [], 
	551: []
}

# Outputs
medians={}


def getAllCommonNeighbors() -> None:
    # Iteratve over all files
    for fileName in fileNames:
        print("datasets/Network_" + str(fileName) + ".graphml")
        G = nx.read_graphml(path="datasets/Network_" + str(fileName) + ".graphml")

        # Dictionary to count common neighbors for each node pair
        pair_common = Counter()

        # For each node, process all pairs of its neighbors
        for u in G:
            neighbors = list(G[u])  # neighbors of u
            for v, w in combinations(sorted(neighbors), 2):  # sort to avoid duplicate unordered pairs
                pair_common[(v, w)] += 1

        # Build histogram: number of pairs with k common neighbors
        histogram = Counter(pair_common.values())

        # Exclude 0 common neighbors
        # histogram = {k: v for k, v in histogram.items() if k > 0}
        # Sort histogram
        # histogram = dict(sorted(histogram.items()))
        # Calculate Median
        common_neighbors = []
        for key, item in histogram.items():
            for index in range(0, item):
                common_neighbors.append(key)
        medians[fileName] = statistics.median(common_neighbors)
        # Save Medians to File
        with open('output/medians.common_neighbors.csv', 'w') as csv_file:  
            writer = csv.writer(csv_file)
            for key, value in medians.items():
                writer.writerow([key, value])

        # Plot Histogram
        plt.figure()
        plt.bar(histogram.keys(), histogram.values())
        plt.xlabel("Number of Common Neighbors")
        plt.ylabel("Frequency")
        plt.xlim(min(histogram.keys()), max(histogram.keys()))
        plt.savefig("output/figures/" + str(fileName) + "common_neighbors.histogram.png")
        plt.close()

        # Write to CSV
        with open('output/common_neighbors.csv', 'w') as csv_file:  
            writer = csv.writer(csv_file)
            for key, value in histogram.items():
                writer.writerow([key, value])


def getAllPathLengths() -> None: 
    # Iteratve over all files
    for fileName in fileNames:

        # Import Data and Calculate All Shortest Paths
        G = nx.read_graphml(path="datasets/Network_" + str(fileName) + ".graphml")
        shortestPathLengths=dict(nx.all_pairs_shortest_path_length(G))

        # Extract All Shortest Paths
        pathLengths=defaultdict(int)
        for source, targets in shortestPathLengths.items():
            for target, pathLength in targets.items():
                if pathLength == 0:
                    continue
                pathLengths[pathLength] += 1

        # Plot Histogram
        plt.figure()
        plt.bar(pathLengths.keys(), pathLengths.values())
        plt.xlabel("Path Length")
        plt.ylabel("Frequency")
        plt.xlim(min(pathLengths.keys()), max(pathLengths.keys()))
        plt.savefig("output/figures/" + str(fileName) + "paths.histogram.png")
        plt.close()
        plt.close()
        
        # Plot Graph Drawing
        positions=nx.spring_layout(G)
        nodeColors = ["red" if nodeID in highlightIDs[fileName] else "blue" for nodeID in sorted(G.nodes())]
        plt.figure()
        drawing=nx.draw(G, positions, node_size=10, node_color=nodeColors)
        plt.draw()
        plt.savefig("output/figures/" + str(fileName) + ".graph.png")
        plt.close()

        # Calculcate Median Path Length
        paths=[]
        for key, item in pathLengths.items():
            for index in range(0, item):
                paths.append(key)
        medians[fileName] = statistics.median(paths)

    # Save Medians to File
    with open('output/medians.csv', 'w') as csv_file:  
        writer = csv.writer(csv_file)
        for key, value in medians.items():
            writer.writerow([key, value])


if __name__ == "__main__":
    getAllCommonNeighbors()
    getAllPathLengths()