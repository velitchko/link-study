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
    private dataDir = 'assets/datasets/';
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
    private unprocessedData: Map<string, { file: string }>;

    constructor() {
        this.parsedData = new Map<string, { nodes: Array<Node>, edges: Array<Edge> }>();
        this.unprocessedData = new Map<string, { file: string }>();
        this.loadAllData();
    }

    private loadDataForDataset(dataset: string): void {
        const fileName = this.dataDir + dataset + '.json';
        fetch(fileName)
            .then(response => response.json())
            .then(data => {
                const nodes = this.parseNodes(data.nodes);
                const edges = this.parseEdges(data.edges);

                this.parsedData.set(dataset, {
                    nodes: nodes.nodes,
                    edges: edges.edges,
                });
            })
            .catch(error => console.error('Error loading data:', error));
    }

    loadAllData(): void {
        for (const dataset of this.dataFiles) {
            this.loadDataForDataset(dataset);
        }
    }

    getDatasetNames(): Array<string> {
        return Array.from(this.unprocessedData.keys());
    }

    getGraph(key: string): Promise<{ nodes: Array<Node>, edges: Array<Edge> }> {
        return new Promise((resolve, reject) => {
            if (this.parsedData.has(key)) {
                resolve({
                    nodes: this.getDatasetNodes(key) || [],
                    edges: this.getDatasetEdges(key) || []
                });
            } else {
                reject('No data found for key: ' + key);
            }
        });
    }

    // get data per task type
    getDatasetNodes(key: string): Array<Node> {
        return this.parsedData.get(key)?.nodes.slice() || [];
    }

    getDatasetEdges(key: string): Array<Edge> {
        return this.parsedData.get(key)?.edges.slice() || [];
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