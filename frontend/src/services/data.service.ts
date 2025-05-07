import { Injectable } from '@angular/core';
export type Node = {
    id: string | number,
    label: string,
    index: number,
};
export type Edge = { source: string | number, target: string | number };
export type Graph = { nodes: Array<Node>, edges: Array<Edge> };

@Injectable({
    providedIn: 'root'
})

export class DataService {
    private dataDir = '../assets/datasets/';
    private dataFiles = [
        'high_1.json',
        'high_2.json',
        'high_3.json',
        'high_4.json',
        'high_5.json',
        'high_6.json',
        'low_1.json',
        'low_2.json',
        'low_3.json',
        'low_4.json',
        'low_5.json',
        'low_6.json',
    ];

    private parsedData: Map<string, { nodes: Array<Node>, edges: Array<Edge> }>;

    constructor() {
        this.parsedData = new Map<string, { nodes: Array<Node>, edges: Array<Edge> }>();
    }

    async loadAllData(complexity: string = 'low'): Promise<void> {
        await Promise.all(this.dataFiles.map((dataset: string) => {
            if (!dataset.includes(complexity)) {
                return Promise.resolve();
            }
            const fileName = this.dataDir + dataset;
        
            return fetch(fileName)
                .then(response => response.json())
                .then(data => {
                    const nodes = this.parseNodes(data.graph.nodes);
                    const edges = this.parseEdges(data.graph.edges);

                    this.parsedData.set(dataset, {
                        nodes: nodes.nodes,
                        edges: edges.edges,
                    });
                });
        }));
    }

    getGraph(dataset: string): { nodes: Array<Node>, edges: Array<Edge> } {
        const graph = this.parsedData.get(dataset);
        if (!graph) {
            throw new Error(`Dataset not found: ${dataset}`);
        }
        return graph;
    }

    getDatasetNames(): Array<string> {
        return Array.from(this.dataFiles);
    }

    parseNodes(data: any): { nodes: Array<Node> } {
        const nodes = data;
        const parsedNodes = new Array<Node>();

        nodes.forEach((node: { id: string | number, mean: number, var: number }, i: number) => {
            parsedNodes.push({
                id: node.id,
                label: `${node.id}`,
                index: i
            });
        });

        return {
            nodes: parsedNodes
        };
    }

    parseEdges(data: any): { edges: Array<Edge> } {
        const edges = data;
        const parsedEdges = new Array<Edge>();

        let edgeHash = new Map<string, Edge>();
        edges.forEach((edge: { source: string | number, target: string | number, weight: number }, i: number) => {
            let idA: string, idB: string = '';
            if (edge.source === edge.target) return;

            idA = `${edge.source}-${edge.target}`;
            idB = `${edge.target}-${edge.source}`;

            edgeHash.set(idA, edge);
            edgeHash.set(idB, edge);

            parsedEdges.push({
                source: edge.source,
                target: edge.target
            });
        });

        return {
            edges: parsedEdges
        };
    }
}