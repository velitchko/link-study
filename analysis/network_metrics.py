import networkx as nx
import statistics
import csv
from collections import defaultdict
import matplotlib.pyplot as plt
from collections import Counter
from itertools import combinations
# Specify Input Parameter
fileNames= [515, 629, 1086, 670, 616, 545, 1012, 583, 516, 518, 584, 551]
pathExistsIds={
	629: ["096376795", "096371032"],  # low_1
    1086: ["079626113", "079776038"], # low_2
	670: ["61F", "62F"],              # low_3
	616: ["053616858", "062298895"],  # low_4
	515: ["055542033", "052866845"],  # low_5
	545: ["055804021", "047030601"],  # low_6
	1012: ["nina", "pippa"],          # high_1
	583: ["053359026", "052543127"],  # high_2
	516: ["053370622", "053344784"],  # high_3 
	518: ["062361330", "052782574"],  # high_4
	584: ["052864516", "053560558"],  # high_5
	551: ["062104553", "062336070"]  # high_6
}

commonNeighborIds={
    629: ["096376795", "096371032"],  # low_1
    1086: ["079626113", "079776038"], # low_2
	670: ["61F", "62F"],              # low_3
	616: ["053616858", "062298895"],  # low_4
	515: ["055542033", "052866845"],  # low_5
	545: ["055804021", "047030601"],  # low_6
	1012: ["nina", "pippa"],          # high_1
	583: ["053359026", "052543127"],  # high_2
	516: ["053370622", "053344784"],  # high_3 
	518: ["062333624", "062322357"],  # high_4
	584: ["052864516", "053560558"],  # high_5
	551: ["062104553", "062336070"]  # high_6
}


# Outputs
medians={}

def checkIfExactCommonNeighborsExists(target_common_neighbors: int):
    for fileName in fileNames:
        G = nx.read_graphml(path="datasets/Network_" + str(fileName) + ".graphml")
        sources_targets = commonNeighborIds.get(fileName, [])
        for source, target in combinations(sources_targets, 2):
            try:
                common_neighbors = list(nx.common_neighbors(G, source, target))
                if len(common_neighbors) == target_common_neighbors:
                    print(f"Exact number of common neighbors ({target_common_neighbors}) exists between {source} and {target} in file {fileName}: {common_neighbors}")
                else:
                    print(f"Number of common neighbors between {source} and {target} in file {fileName} is {len(common_neighbors)}, not {target_common_neighbors}")
            except nx.NodeNotFound as e:
                print(f"Node not found: {e} in file {fileName}")

def checkCommonNeightbors() -> bool:
    for fileName in fileNames:
        G = nx.read_graphml(path="datasets/Network_" + str(fileName) + ".graphml")
        sources_targets = commonNeighborIds.get(fileName, [])
        for source, target in combinations(sources_targets, 2):
            try:
                common_neighbors = list(nx.common_neighbors(G, source, target))
                if common_neighbors:
                    print(f"Common neighbors exist between {source} and {target} in file {fileName}: {common_neighbors}")
                else:
                    print(f"No common neighbors between {source} and {target} in file {fileName}")
            except nx.NodeNotFound as e:
                print(f"Node not found: {e} in file {fileName}")

def checkIfExactLengthPathExists(target_length: int):
    for fileName in fileNames:
        G = nx.read_graphml(path="datasets/Network_" + str(fileName) + ".graphml")
        sources_targets = pathExistsIds.get(fileName, [])
        for source, target in combinations(sources_targets, 2):
            try:
                found = False
                # The max path length is the number of edges (i.e., length = number of nodes - 1)
                for path in nx.all_simple_paths(G, source=source, target=target, cutoff=target_length):
                    if len(path) - 1 == target_length:
                        print(f"Exact path of length {target_length} exists between {source} and {target} in file {fileName}: {path}")
                        found = True
                        break  # remove this if you want *all* such paths
                if not found:
                    print(f"No exact path of length {target_length} between {source} and {target} in file {fileName}")
            except nx.NodeNotFound as e:
                print(f"Node not found: {e} in file {fileName}")

def checkIfPathExists() -> bool:
    for fileName in fileNames:
        G = nx.read_graphml(path="datasets/Network_" + str(fileName) + ".graphml")
        sources_targets = pathExistsIds.get(fileName, [])
        for source, target in combinations(sources_targets, 2):
            try:
                path_length = nx.shortest_path_length(G, source=source, target=target)
                print(f"Path exists between {source} and {target} in file {fileName} with length {path_length}")
            except nx.NetworkXNoPath:
                print(f"No path exists between {source} and {target} in file {fileName}")
            except nx.NodeNotFound as e:
                print(f"Node not found: {e} in file {fileName}")


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
        
        # Plot Graph Drawing
        positions=nx.forceatlas2_layout(G)
        nodeColors = ["red" if nodeID in pathExistsIds[fileName] else "blue" for nodeID in sorted(G.nodes())]
        plt.figure()
        drawing=nx.draw(G, positions, node_size=10, node_color=nodeColors)
        plt.draw()
        # plt.savefig("output/figures/" + str(fileName) + ".graph.png")
        # plt.close()

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
    # Path Analysis
    checkIfPathExists()
    checkIfExactLengthPathExists(4)
    # Common Neighbors Analysis
    checkCommonNeightbors()
    checkIfExactCommonNeighborsExists(4)
    