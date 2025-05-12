import networkx as nx
import statistics
import csv
from collections import defaultdict
import matplotlib.pyplot as plt

# Specify Input Parameter
fileNames=[515, 629, 661, 670, 616, 545, 519, 583, 516, 518, 584, 551]
highlightIDs={
	515: [], 
	629: [], 
	661: [], 
	670: ["4F"], 
	616: [], 
	545: [],
	519: [], 
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

        # Import Data and Calculate All Common Neighbors
        G = nx.read_graphml(path="datasets/Network_" + str(fileName) + ".graphml")
        commonNeighbors=defaultdict(int)
        for source, targets in G.adjacency():
            for target in targets:
                if source == target:
                    continue
                commonNeighbors[(source, target)] += len(list(nx.common_neighbors(G, source, target)))
        
        # Print Number of Common Neighbors and Frequency (Sorted by Number of Common Neighbors)
        print(f"Dataset {fileName}:")
        neighbor_counts = defaultdict(int)
        for value in commonNeighbors.values():
            neighbor_counts[value] += 1

        median_neighbors = statistics.median_low(neighbor_counts.keys())
        print(f"Median number of common neighbors (rounded down): {median_neighbors}")
        # for count, occurrences in sorted(neighbor_counts.items()):
        #     print(f"{count} common neighbors: {occurrences} occurrences")

        # Plot Histogram
        plt.figure()
        plt.bar(neighbor_counts.keys(), neighbor_counts.values())
        plt.xlabel("Number of Common Neighbors")
        plt.ylabel("Frequency")
        plt.xlim(min(neighbor_counts.keys()), max(neighbor_counts.keys()))
        plt.savefig("output/figures/" + str(fileName) + "common_neighbors.histogram.png")

        # Save Common Neighbors to File
        with open('output/common_neighbors.csv', 'w') as csv_file:  
            writer = csv.writer(csv_file)
            for key, value in commonNeighbors.items():
                writer.writerow([key[0], key[1], value])


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