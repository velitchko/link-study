import { AfterViewInit, Component } from '@angular/core';
import * as d3 from 'd3';
import { Node, Edge, Aesth, DataService } from '../../services/data.service';
import { GlobalErrorHandler } from '../../services/error.service';
import { ResultsService } from '../../services/results.service';
import { lesMis } from '../../assets/datasets/test.js';
import seedrandom from 'seedrandom';
import { UMAP } from 'umap-js';

type NodeExt = Node & { x: number, y: number };
type EdgeExt = Edge & { source: NodeExt, target: NodeExt };

@Component({
    selector: 'app-no-link',
    templateUrl: './no-link.component.html',
    styleUrls: ['./no-link.component.scss']
})

export class NoLinkComponent implements AfterViewInit {
    private margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    };
    private width = 1400 - this.margin.left - this.margin.right;
    private height = 1200 - this.margin.top - this.margin.bottom;

    private nodes: d3.Selection<SVGCircleElement, NodeExt, SVGGElement, any>;
    private edges: d3.Selection<SVGLineElement, EdgeExt, SVGGElement, any>;
    private buffer: d3.Selection<SVGCircleElement, NodeExt, SVGGElement, any>;
    private labels: d3.Selection<SVGTextElement, NodeExt, SVGGElement, any>;
    private simulation: d3.Simulation<NodeExt, EdgeExt>;
    private aesthetics: Aesth;
    private graph: { nodes: NodeExt[], edges: EdgeExt[] };

    constructor(private dataService: DataService, private errorHandler: GlobalErrorHandler, private resultsService: ResultsService) {
        // parse the lesMis dataset
    }

    async ngAfterViewInit(): Promise<void> {
        // const meta = d3.select('#metadata').text().trim();
        // const dataset = meta.split('-')[0];
        // const variant = meta.split('-')[1];
        // const level = meta.split('-')[2];
        // const task = meta.split('-')[3];
        const rng = seedrandom('les-miserables'); // your seed

        this.graph = lesMis as { nodes: NodeExt[], edges: EdgeExt[] };
        const embed = this.createEmbedding(rng);
        
        this.graph.nodes.forEach((node, i) => {
            const [x, y] = embed[i];
            node.x = x;
            node.y = y;
        });

        this.drawGraph(this.graph);
    }

    private createEmbedding(seed?: (seed?: string) => number): number[][] {
        const nodes = this.graph.nodes;
        const edges = this.graph.edges;

        const idToIndex = new Map(nodes.map((node, i) => [node.id, i]));
        const n = nodes.length;
        const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

        for (const edge of edges) {
            const i = idToIndex.get(edge.source)!;
            const j = idToIndex.get(edge.target)!;
            matrix[i][j] = 1;
            matrix[j][i] = 1;
        }

        const umap = new UMAP({
            nComponents: 5,
            nNeighbors: 15,
            minDist: 1,
            spread: 5.0,
            random: seed || Math.random,
        });
        const embedding = umap.fit(matrix);
        return embedding;
    }


    drawGraph(graph: { nodes: NodeExt[], edges: EdgeExt[] }): void {
        const [minX, maxX] = d3.extent(graph.nodes, d => d.x);
        const [minY, maxY] = d3.extent(graph.nodes, d => d.y)!;

        const xScale = d3.scaleLinear().domain([minX!, maxX!]).range([0, this.width  - (this.margin.left + this.margin.right)]);
        const yScale = d3.scaleLinear().domain([minY!, maxY!]).range([0, this.height - (this.margin.top + this.margin.bottom)]);

        graph.nodes.forEach(node => {
            node.x = xScale(node.x);
            node.y = yScale(node.y);
        });

        const svg = d3.select('#nolink')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        // initialize links
        // this.edges = svg.append('g')
        //     .attr('class', 'edges')
        //     .selectAll('line')
        //     .data(graph.edges)
        //     .enter()
        //     .append('line')
        //     .attr('stroke', 'black')
        //     .attr('stroke-width', 2)
        //     .attr('stroke-opacity', 0.5);

        // initialize buffer
        this.buffer = svg.append('g')
            .attr('class', 'buffers')
            .selectAll('circle.buffer')
            .data(graph.nodes)
            .enter()
            .append('circle')
            .attr('class', 'buffer')
            .attr('r', (d: NodeExt) => 12)
            .attr('cx', (d: NodeExt) => d.x)
            .attr('cy', (d: NodeExt) => d.y)
            .attr('fill', 'white');

        // initialize nodes
        this.nodes = svg.append('g')
            .attr('class', 'nodes')
            .selectAll('circle.node')
            .data(graph.nodes)
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', (d: NodeExt) => 10)
            .attr('cx', (d: NodeExt) => d.x)
            .attr('cy', (d: NodeExt) => d.y)
            .attr('fill', (d: NodeExt) => 'black');

        // initialize labels
        this.labels = svg.append('g')
            .attr('class', 'labels')
            .selectAll('text.label')
            .data(graph.nodes)
            .enter()
            .append('text')
            .attr('class', 'label')
            .text((d: NodeExt) => `${d.id}`)
            .attr('x', (d: NodeExt) => d.x)
            .attr('y', (d: NodeExt) => d.y)
            .attr('stroke', 'black')
            .attr('fill', 'black')
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .style('font-family', '\'Fira Mono\', monospace');
    }
}
