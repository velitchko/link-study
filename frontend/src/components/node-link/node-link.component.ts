import { AfterViewInit, Component, ChangeDetectorRef } from '@angular/core';
import * as d3 from 'd3';
import { Node, Edge, DataService } from '../../services/data.service';
import { GlobalErrorHandler } from '../../services/error.service';
import { ResultsService } from '../../services/results.service';

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
    private width = 0;
    private height = 0;

    private nodes: d3.Selection<SVGCircleElement, NodeExt, SVGGElement, any>;
    private edges: d3.Selection<SVGLineElement, EdgeExt, SVGGElement, any>;
    private buffer: d3.Selection<SVGCircleElement, NodeExt, SVGGElement, any>;
    private labels: d3.Selection<SVGGElement, NodeExt, SVGGElement, any>;
    private simulation: d3.Simulation<NodeExt, EdgeExt>;

    private graph: { nodes: NodeExt[], edges: EdgeExt[] };
    private lassoStart = false;
    private lassoPoints: [number, number][] = [];
    private lassoPath: d3.Selection<SVGPathElement, unknown, HTMLElement, undefined>;
    private lassoLayer: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private config = {
        encoding: '',
        complexity: '',
        dataset: '',
        task: '',
    };

    answerSet: (string | number)[] = [];

    constructor(private dataService: DataService, private errorHandler: GlobalErrorHandler, private resultsService: ResultsService, private cdr: ChangeDetectorRef) {
    }

    async ngAfterViewInit(): Promise<void> {
        const meta = d3.select('#metadata').text().trim();
        this.config.encoding = meta.split('-')[0]; // nodelink, nolink, or interactive
        this.config.complexity = meta.split('-')[1]; // complexity level (low, high)
        this.config.dataset = meta.split('-')[2]; // dataset name
        this.config.task = meta.split('-')[3]; // task code t1, t2, t3, t4, t5, t6

        // grab container width & height
        const container = d3.select('#dthree');
        this.width = parseInt(container.style('width')) - this.margin.left - this.margin.right;
        const containerNode = container.node() as HTMLElement;
        const containerRect = containerNode.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        this.height = viewportHeight - containerRect.top - this.margin.top - this.margin.bottom;

        const data = this.dataService.getGraph(this.config.dataset);
        if (!data) {
            console.error('🚒 Error: no data found for dataset', this.config.dataset);
            return;
        }


        this.graph = { nodes: data.nodes as NodeExt[], edges: data.edges as EdgeExt[] };
        this.drawGraph(this.graph);
    }

    drawGraph(graph: { nodes: NodeExt[], edges: EdgeExt[] }): void {
        const svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any> = d3.select<SVGSVGElement, unknown>('#node-link-container')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);

        const container = svg
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        if(this.config.task === 't6') {
            container.append('rect')
                .attr('class', 'lasso-rect')
                .attr('width', 1920)
                .attr('height', 1080)
                .attr('fill', 'transparent')
                .style('cursor', 'crosshair')
                .lower();
            
        
            this.lassoLayer = container.append('g').attr('class', 'lasso-layer');
    
            container
                .on('mousedown', (event: MouseEvent) => {
                    if (event.button !== 0 || !(event.ctrlKey || event.metaKey)) return; // only allow left click with control key
    
                    this.lassoStart = true;
                    this.lassoPoints = [];
                    if (this.lassoPath) this.lassoPath.remove();
    
                    this.lassoPath = this.lassoLayer.append('path')
                        .attr('fill', 'rgba(0,0,255,0.1)')
                        .attr('stroke', 'blue')
                        .attr('stroke-width', 1);
    
                    // Disable zoom during lasso interaction
                    svg.on('.zoom', null);
                })
                .on('mousemove', (event: MouseEvent) => {
                    if (!this.lassoStart) return;
    
                    const [x, y] = d3.pointer(event);
                    this.lassoPoints.push([x, y]);
    
                    const pathData = `M${this.lassoPoints.map(p => p.join(',')).join('L')}Z`;
                    this.lassoPath.attr('d', pathData);
                })
                .on('mouseup', () => {
                    if (!this.lassoStart) return;
                    this.lassoStart = false;
    
                    const polygon = this.lassoPoints;
                    if (polygon.length < 3) return;
    
                    this.nodes.classed('selected', d => d3.polygonContains(polygon, [d.x, d.y]))
                        .classed('unselected', d => !d3.polygonContains(polygon, [d.x, d.y]));
    
                    this.labels.classed('selected', d => d3.polygonContains(polygon, [d.x, d.y]))
                        .classed('unselected', d => !d3.polygonContains(polygon, [d.x, d.y]));
    
                    this.buffer.classed('selected', d => d3.polygonContains(polygon, [d.x, d.y]))
                        .classed('unselected', d => !d3.polygonContains(polygon, [d.x, d.y]));
    
                    // add selected nodes to answer set
                    const selectedNodes = this.nodes.filter(function () {
                        return d3.select(this).classed('selected');
                    }).data() as NodeExt[];
                    const selectedNodeIds = selectedNodes.map(node => node.id);
    
                    // replace the answer set with the selected nodes
                    this.answerSet = selectedNodeIds;
                    this.cdr.detectChanges(); // Manually trigger change detection

                    this.resultsService.setAnswers(this.config.task, this.answerSet);
    
                    this.lassoPath.remove();
    
                    // Re-enable zoom after lasso interaction
                    svg.call(zoom);
                });
        }

        const graphContainer = container.append('g');

        // Add zoom and pan functionality
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 5]) // Set zoom scale limits
            .filter((event) => {
            // Disable zoom on double click
            return !(event.type === 'dblclick');
            })
            .on('zoom', (event) => {
            container.attr('transform', event.transform);
            });

        svg.call(zoom); // Apply zoom to the svg element

        // initialize links
        this.edges = graphContainer.append('g')
            .attr('class', 'edges')
            .selectAll('line')
            .data(graph.edges)
            .enter()
            .append('line')
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
            .attr('stroke-opacity', 0.5)
            .style('pointer-events', 'none')
            .style('opacity', () => {
                if (this.config.encoding === 'nodelink') {
                    return 1;
                }
                return 0;
            });

        // initialize buffer
        this.buffer = graphContainer.append('g')
            .attr('class', 'buffers')
            .selectAll('circle.buffer')
            .data(graph.nodes)
            .enter()
            .append('circle')
            .attr('class', 'buffer')
            .attr('r', (d: NodeExt) => 5)
            .attr('fill', 'white')
            // .style('opacity', 0);

        // initialize nodes
        this.nodes = graphContainer.append('g')
            .attr('class', 'nodes')
            .selectAll('circle.node')
            .data(graph.nodes)
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', (d: NodeExt) => 4)
            .attr('fill', (d: NodeExt) => 'black')
            // .style('opacity', 0)
            .on('click', (event: MouseEvent, d: NodeExt) => {
                if(this.config.task !== 't1' && this.config.task !== 't2') return; // only allow ctrl+click for t2 and t3 tasks
                if (event.ctrlKey || event.metaKey) {
                    // Set the selected nodes based on the clicked node
                    const selectedNodes = this.nodes.filter(function () {
                        return d3.select(this).classed('selected');
                    }).data() as NodeExt[];

                    const selectedNodeIds = selectedNodes.map(node => node.id);


                    this.nodes.classed('selected', node => node.id === d.id || selectedNodeIds.includes(node.id));
                    this.labels.classed('selected', label => label.id === d.id || selectedNodeIds.includes(label.id));
                    this.buffer.classed('selected', buffer => buffer.id === d.id || selectedNodeIds.includes(buffer.id));
                } else {
                    // Check if the clicked node is already selected
                    const isSelected = d3.select(event.currentTarget as SVGCircleElement).classed('selected');
                    if (isSelected) {
                            // Add selected class to clicked node, label, and buffer
                            this.nodes.classed('selected', false).classed('unselected', node => node.id === d.id);
                            this.labels.classed('selected', false).classed('unselected', label => label.id === d.id);
                            this.buffer.classed('selected', false).classed('unselected', buffer => buffer.id === d.id);
                               // Add selected class to clicked node, label, and buffer
                    } else {
                        // Reset selection for normal click
                        this.nodes.classed('selected', false).classed('unselected', false);
                        this.labels.classed('selected', false).classed('unselected', false);
                        this.buffer.classed('selected', false).classed('unselected', false);

                        // Add selected class to clicked node, label, and buffer
                        this.nodes.classed('selected', node => node.id === d.id);
                        this.labels.classed('selected', label => label.id === d.id);
                        this.buffer.classed('selected', buffer => buffer.id === d.id);
                    }
                }

                // Update the answer set
                const selectedNodes = this.nodes.filter(function () {
                    return d3.select(this).classed('selected');
                }).data() as NodeExt[];

                const selectedNodeIds = selectedNodes.map(node => node.id);

                // Replace the answer set with the selected nodes
                this.answerSet = selectedNodeIds;
                this.cdr.detectChanges(); // Manually trigger change detection
                this.resultsService.setAnswers(this.config.task, this.answerSet);
            })
            .on('mouseover', (event: MouseEvent, d: NodeExt) => {
                d3.selectAll<SVGCircleElement, NodeExt>('.nodes circle')
                    .filter((node: NodeExt) => node.id === d.id)
                    .attr('fill', 'red')
                    .attr('r', 10);

                d3.selectAll<SVGTextElement, NodeExt>('.labels text.label')
                    .filter((label: NodeExt) => label.id === d.id)
                    .style('stroke', 'red')
                    .style('fill', 'red')
                    .style('opacity', 1);                    

                d3.selectAll<SVGRectElement, NodeExt>('.labels rect.label-bg')
                    .filter((label: NodeExt) => label.id === d.id)
                    .attr('stroke', 'red')
                    .style('opacity', 1);     
                    
                if (this.config.encoding !== 'interactive') return;
                
                d3.selectAll<SVGCircleElement, NodeExt>('.nodes circle')
                .filter((node: NodeExt) => graph.edges.some(edge => (edge.source.id === d.id && edge.target.id === node.id) || (edge.target.id === d.id && edge.source.id === node.id)))
                .attr('fill', 'red');
                
                d3.selectAll<SVGTextElement, NodeExt>('.labels text.label').filter((label: NodeExt) => label.id === d.id).attr('stroke', 'red').attr('fill', 'red');

                d3.select(event.currentTarget as SVGCircleElement).attr('r', 15).attr('fill', 'red');
                d3.selectAll<SVGLineElement, EdgeExt>('.edges line')
                    .filter((edge: EdgeExt) => edge.source.id === d.id || edge.target.id === d.id)
                    .attr('stroke', 'red')
                    .attr('stroke-width', 4)
                    .style('opacity', 1);

            })
            .on('mouseout', (event: MouseEvent, d: NodeExt) => {
                d3.selectAll<SVGCircleElement, NodeExt>('.nodes circle')
                    .attr('fill', 'black')
                    .attr('r', 4);

                d3.selectAll<SVGTextElement, NodeExt>('.labels text.label')
                    .style('stroke', 'black')
                    .style('fill', 'black');

                d3.selectAll<SVGRectElement, NodeExt>('.labels rect.label-bg')
                    .attr('stroke', 'black')
                    .style('opacity', 0.75);

                if (this.config.encoding !== 'interactive') return;
                
                // d3.select(event.currentTarget as SVGCircleElement).attr('r', 10).attr('fill', 'black');
                d3.selectAll<SVGLineElement, EdgeExt>('.edges line')
                    .attr('stroke', 'black')
                    .attr('stroke-width', 2)
                    .style('opacity', 0);

            });
            // initialize labels
            this.labels = graphContainer.append('g')
                .attr('class', 'labels')
                .selectAll('g.label-group')
                .data(graph.nodes)
                .enter()
                .append('g')
                .attr('class', 'label-group');

            // Append a rectangle as a background for the text
            this.labels.append('rect')
                .attr('class', 'label-bg')
                .attr('width', 24) // Adjust width based on text length
                .attr('height', 14) // Fixed height for the background
                .attr('fill', 'white')
                .attr('rx', 4) // Rounded corners
                .attr('ry', 4) // Rounded corners
                // .style('opacity', 0);

            // Append the text on top of the rectangle
            this.labels.append('text')
                .attr('class', 'label')
                .text((d: NodeExt) => `${d.id}`)
                .attr('dy', '0.25em')
                .attr('text-anchor', 'middle')
                .attr('pointer-events', 'none')
                .style('font-family', '\'Fira Mono\', monospace')
                .style('font-size', '12px')
                .style('text-transform', 'uppercase')
                .style('fill', 'black')
                .style('stroke', 'black')

                // .style('opacity', 0);

        this.simulation = d3.forceSimulation(graph.nodes)
            .force('link', d3.forceLink(graph.edges).id((d: any) => (d as NodeExt).id).links(graph.edges))
            .force('collide', d3.forceCollide().radius(4).iterations(16))
            .force('x', d3.forceX().x(this.width / 2).strength(0.1))
            .force('y', d3.forceY().y(this.height / 2).strength(0.1))
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
                .select('rect.label-bg')
                .attr('x', (d: NodeExt) => d.x - 12)
                .attr('y', (d: NodeExt) => d.y + 8)
                .style('opacity', 0.75);
            this.labels
                .select('text.label')
                .attr('x', (d: NodeExt) => d.x)
                .attr('y', (d: NodeExt) => d.y + 16)
                .style('opacity', 1);
            })
            .on('end', () => {
            if (this.config.encoding === 'nodelink') {
                this.edges.style('opacity', 1);
            }
            this.nodes.style('opacity', 1);
            this.buffer.style('opacity', 1);
            this.labels.style('opacity', 1);

            const graphBounds = graphContainer.node()?.getBBox();
            if (graphBounds) {
                console.log('Graph bounds:', graphBounds);
                const margin = 100; // Add margin on both sides
                container.select('.lasso-rect')
                    .attr('width', graphBounds.width + margin * 2)
                    .attr('height', graphBounds.height + margin * 2)
                    .attr('x', graphBounds.x - margin)
                    .attr('y', graphBounds.y - margin);
            }

            // // Zoom to fit all nodes and edges
            // const bounds = svg.node()?.getBBox() || { x: 0, y: 0, width: this.width, height: this.height };
            // const fullWidth = bounds.width;
            // const fullHeight = bounds.height;
            // const centerX = bounds.x + fullWidth / 2;
            // const centerY = bounds.y + fullHeight / 2;            

            // const scale = Math.min(this.width / fullWidth, this.height / fullHeight) * 0.9; // Add padding
            // const transform = d3.zoomIdentity
            //     .translate(this.width / 2, this.height / 2)
            //     .scale(scale)
            //     .translate(-centerX, -centerY);

            // svg.transition()
            //     .duration(750)
            //     .call(zoom.transform, transform);
            });
    }
}
