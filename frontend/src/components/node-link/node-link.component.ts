import { AfterViewInit, Component } from '@angular/core';
import * as d3 from 'd3';
import { Node, Edge, Aesth, DataService } from '../../services/data.service';
import { GlobalErrorHandler } from '../../services/error.service';
import { ResultsService } from '../../services/results.service';
import { lesMis } from '../../assets/datasets/test.js';

type NodeExt = Node & { x: number, y: number };
type EdgeExt = Edge & { source: NodeExt, target: NodeExt };

@Component({
    selector: 'app-node-link',
    templateUrl: './node-link.component.html',
    styleUrls: ['./node-link.component.scss']
})

export class NodeLinkComponent implements AfterViewInit {
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
    private config = {
        dataset: '',
        variant: '',
        level: '',
        task: '',
    };

    constructor(private dataService: DataService, private errorHandler: GlobalErrorHandler, private resultsService: ResultsService) { 
    }

    async ngAfterViewInit(): Promise<void> {
        const meta = d3.select('#metadata').text().trim();
        this.config.dataset = meta.split('-')[0]; // dataset name
        this.config.variant = meta.split('-')[1]; // link, nolink, or interaction
        this.config.level = meta.split('-')[2]; // complexity level (low, high)
        this.config.task = meta.split('-')[3]; // task code t1, t2, t3, t4, t5, t6


        // this.aesthetics = graph.aesthetics;
        this.graph = lesMis as { nodes: NodeExt[], edges: EdgeExt[] };

        this.drawGraph(this.graph);
    }

    private layoutEnd(): void {
        console.log('Layout ended');
        
        this.edges
            .attr('x1', (d: EdgeExt) => d.source.x)
            .attr('y1', (d: EdgeExt) => d.source.y)
            .attr('x2', (d: EdgeExt) => d.target.x)
            .attr('y2', (d: EdgeExt) => d.target.y);

        this.buffer
            .attr('cx', (d: NodeExt) => d.x)
            .attr('cy', (d: NodeExt) => d.y);

        this.nodes
            .attr('cx', (d: NodeExt) => d.x)
            .attr('cy', (d: NodeExt) => d.y);

        this.labels
            .attr('x', (d: NodeExt) => d.x)
            .attr('y', (d: NodeExt) => d.y);
    }

    drawGraph(graph: { nodes: NodeExt[], edges: EdgeExt[] }): void {
        const svg = d3.select('#node-link-container')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        // initialize links
        this.edges = svg.append('g')
            .attr('class', 'edges')
            .selectAll('line')
            .data(graph.edges)
            .enter()
            .append('line')
                .attr('stroke', 'black')
                .attr('stroke-width', 2)
                .attr('stroke-opacity', 0.5)
                .style('opacity', 0);

        // initialize buffer
        this.buffer = svg.append('g')
            .attr('class', 'buffers')
            .selectAll('circle.buffer')
            .data(graph.nodes)
            .enter()
            .append('circle')
                .attr('class', 'buffer')
                .attr('r', (d: NodeExt) => 12)
                .attr('fill', 'white')
                .style('opacity', 0);

        // initialize nodes
        this.nodes = svg.append('g')
            .attr('class', 'nodes')
            .selectAll('circle.node')
            .data(graph.nodes)
            .enter()
            .append('circle')
                .attr('class', 'node')
                .attr('r', (d: NodeExt) => 10)
                .attr('fill', (d: NodeExt) => 'black')
                .style('opacity', 0)
                .on('mouseover', (event: MouseEvent, d: NodeExt) => {
                    if(this.config.variant !== 'interaction') return;
                    d3.select(event.currentTarget as SVGCircleElement).attr('r', 15).attr('fill', 'red');
                    d3.selectAll<SVGLineElement, EdgeExt>('.edges line')
                        .filter((edge: EdgeExt) => edge.source.id === d.id || edge.target.id === d.id)
                        .attr('stroke', 'red')
                        .attr('stroke-width', 4)
                        .style('opacity', 1);

                    d3.selectAll<SVGCircleElement, NodeExt>('.nodes circle')
                        .filter((node: NodeExt) => graph.edges.some(edge => (edge.source.id === d.id && edge.target.id === node.id) || (edge.target.id === d.id && edge.source.id === node.id)))
                        .attr('fill', 'red');
                    d3.selectAll<SVGTextElement, NodeExt>('.labels text.label').filter((label: NodeExt) => label.id === d.id).attr('stroke', 'red').attr('fill', 'red');
                }
                )
                .on('mouseout', (event: MouseEvent, d: NodeExt) => {
                    if(this.config.variant !== 'interaction') return;
                    d3.select(event.currentTarget as SVGCircleElement).attr('r', 10).attr('fill', 'black');
                    d3.selectAll<SVGLineElement, EdgeExt>('.edges line')
                        .attr('stroke', 'black')
                        .attr('stroke-width', 2)
                        .style('opacity', 0);

                    d3.selectAll<SVGCircleElement, NodeExt>('.nodes circle')
                        .attr('fill', 'black');

                    d3.selectAll<SVGTextElement, NodeExt>('.labels text.label')
                        .attr('stroke', 'black')
                        .attr('fill', 'black');
                }
                );

        // initialize labels
        this.labels = svg.append('g')
            .attr('class', 'labels')
            .selectAll('text.label')
            .data(graph.nodes)
            .enter()
            .append('text')
                .attr('class', 'label')
                .text((d: NodeExt) => `${d.id}`)
                .attr('stroke', 'black')
                .attr('fill', 'black')
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .attr('pointer-events', 'none')
                .style('font-family', '\'Fira Mono\', monospace')
                .style('opacity', 0);

        this.simulation = d3.forceSimulation(graph.nodes)
            .force('link', d3.forceLink(graph.edges).id((d: any) => (d as NodeExt).id).links(graph.edges))
            .force('charge', d3.forceManyBody().strength(-600))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .on('tick', () => {
                this.edges
                    .attr('x1', (d: EdgeExt) => d.source.x)
                    .attr('y1', (d: EdgeExt) => d.source.y)
                    .attr('x2', (d: EdgeExt) => d.target.x)
                    .attr('y2', (d: EdgeExt) => d.target.y);

                this.buffer
                    .attr('cx', (d: NodeExt) => d.x)
                    .attr('cy', (d: NodeExt) => d.y);

                this.nodes
                    .attr('cx', (d: NodeExt) => d.x)
                    .attr('cy', (d: NodeExt) => d.y);

                this.labels
                    .attr('x', (d: NodeExt) => d.x)
                    .attr('y', (d: NodeExt) => d.y + 16);
            })
            .on('end', () => {
                if(this.config.variant === 'nodelink') {
                    this.edges.style('opacity', 1);
                }
                this.nodes.style('opacity', 1);
                this.buffer.style('opacity', 1);
                this.labels.style('opacity', 1);
            });
    }
}
