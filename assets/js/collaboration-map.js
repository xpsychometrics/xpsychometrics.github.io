// Interactive Network Graph for Collaborations
document.addEventListener('DOMContentLoaded', function() {
    const svg = d3.select('#collaborationMap');
    if (svg.empty()) {
        console.error('SVG element not found');
        return;
    }
    
    // Get container dimensions
    const container = document.querySelector('.collaboration-map-container');
    const width = container ? container.clientWidth - 40 : 1200;
    const height = 500;
    
    // Set SVG dimensions
    svg.attr('width', width)
       .attr('height', height)
       .attr('viewBox', `0 0 ${width} ${height}`);
    
    // Collaboration data with weights, institutions, and countries
    const collaborations = [
        { weight: 4, institution: 'Jiangxi Normal University', country: 'China Mainland' },
        { weight: 1, institution: 'Zhejiang Normal University', country: 'China Mainland' },
        { weight: 3, institution: 'Peking University', country: 'China Mainland' },
        { weight: 1, institution: 'Tsinghua University', country: 'China Mainland' },
        { weight: 1, institution: 'Hefei University of Technology', country: 'China Mainland' },
        { weight: 1, institution: 'Beijing Normal University', country: 'China Mainland' },
        { weight: 1, institution: 'TU Dortmund University', country: 'Germany' },
        { weight: 1, institution: 'Leibniz Institute for Science and Mathematics Education', country: 'Germany' },
        { weight: 1, institution: 'Centre for International Student Assessment', country: 'Germany' },
        { weight: 10, institution: 'The University of Hong Kong', country: 'Hong Kong' },
        { weight: 1, institution: 'The Islamic Azad University', country: 'Iran' },
        { weight: 3, institution: 'Universidad Autónoma de Madrid', country: 'Spain' },
        { weight: 2, institution: 'Universidad Pontificia Comillas', country: 'Spain' },
        { weight: 1, institution: 'National University of Tainan', country: 'Taiwan' },
        { weight: 1, institution: 'Harran University', country: 'Turkey' },
        { weight: 3, institution: 'University of Michigan', country: 'United States' },
        { weight: 2, institution: 'University of Arkansas', country: 'United States' },
        { weight: 5, institution: 'University of Georgia', country: 'United States' },
        { weight: 1, institution: 'American Institutes for Research (AIR)', country: 'United States' },
        { weight: 1, institution: 'Columbia University', country: 'United States' },
        { weight: 1, institution: 'National Board of Osteopathic Medical Examiners', country: 'United States' },
        { weight: 10, institution: 'University of Alabama', country: 'United States' },
        { weight: 1, institution: 'Athens State University', country: 'United States' },
        { weight: 1, institution: 'University of New Mexico', country: 'United States' },
        { weight: 1, institution: 'College Board', country: 'United States' },
        { weight: 1, institution: 'University of Virginia', country: 'United States' },
        { weight: 1, institution: 'University of North Texas Health Science', country: 'United States' },
        { weight: 1, institution: 'University of Washington', country: 'United States' },
        { weight: 1, institution: 'Michigan State University', country: 'United States' },
        { weight: 1, institution: 'University of Illinois at Urbana-Champaign', country: 'United States' },
        { weight: 1, institution: 'University of South Carolina', country: 'United States' },
        { weight: 1, institution: 'University of California Merced', country: 'United States' },
        { weight: 1, institution: 'University of Maryland', country: 'United States' },
        { weight: 1, institution: 'Pearson', country: 'United States' },
        { weight: 1, institution: 'Rutgers University', country: 'United States' },
        { weight: 1, institution: 'Texas State University', country: 'United States' },
        { weight: 2, institution: 'Georgetown University', country: 'United States' },
        { weight: 2, institution: 'University of Illinois at Chicago', country: 'United States' },
        { weight: 1, institution: 'Washington State University', country: 'United States' },
        { weight: 1, institution: 'Florida Atlantic University', country: 'United States' }
    ];
    
    // Determine type (international vs national) based on country
    collaborations.forEach(collab => {
        collab.type = collab.country === 'United States' ? 'national' : 'international';
        collab.id = collab.institution.replace(/\s+/g, '_'); // Create unique ID
    });
    
    // Create nodes: Minneapolis (center) + all collaborations
    const nodes = [
        { id: 'Minneapolis', name: 'Minneapolis, MN', institution: 'University of Minnesota', country: 'United States', type: 'center', x: 0, y: 0, fixed: true, fx: 0, fy: 0 }
    ];
    
    collaborations.forEach(collab => {
        // Initialize nodes in a circle around center
        const angle = (Math.random() * 2 * Math.PI);
        const radius = Math.min(width, height) * 0.25 + Math.random() * 50;
        nodes.push({
            id: collab.id,
            name: collab.institution,
            institution: collab.institution,
            country: collab.country,
            type: collab.type,
            weight: collab.weight,
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        });
    });
    
    // Create links: all connections from Minneapolis with weights
    const links = collaborations.map(collab => ({
        source: 'Minneapolis',
        target: collab.id,
        type: collab.type,
        weight: collab.weight
    }));
    
    // Create D3 force simulation (centered at 0,0 since we're using centered transform)
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(d => 100 + d.weight * 10))
        .force('charge', d3.forceManyBody().strength(-400))
        .force('center', d3.forceCenter(0, 0))
        .force('collision', d3.forceCollide().radius(40));
    
    // Create SVG container - center the graph
    const g = d3.select('#collaborationMap')
        .append('g')
        .attr('transform', `translate(${width/2},${height/2})`);
    
    // Create tooltip
    const tooltip = d3.select('body').append('div')
        .attr('class', 'network-tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.85)')
        .style('color', 'white')
        .style('padding', '10px 14px')
        .style('border-radius', '6px')
        .style('font-size', '13px')
        .style('pointer-events', 'none')
        .style('z-index', '1000')
        .style('max-width', '300px')
        .style('line-height', '1.5');
    
    // Draw links with weight-based line width
    const link = g.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke', d => d.type === 'international' ? '#FFD700' : '#8C1D40')
        .attr('stroke-width', d => Math.max(1, Math.min(8, d.weight * 0.8))) // Scale weight to line width
        .attr('stroke-opacity', 0.6)
        .attr('stroke-dasharray', '5,5');
    
    // Draw nodes - separate center node (panda) from other nodes
    const nodeGroup = g.append('g')
        .attr('class', 'nodes');
    
    // Draw panda image for Minneapolis (center node)
    const centerNode = nodes.find(n => n.type === 'center');
    const pandaImage = nodeGroup.append('g')
        .attr('class', 'panda-node')
        .datum(centerNode)
        .attr('transform', `translate(${centerNode.x},${centerNode.y})`);
    
    // Add a subtle glow/shadow circle behind panda
    pandaImage.append('circle')
        .attr('r', 22)
        .attr('fill', '#FFD700')
        .attr('opacity', 0.3);
    
    const pandaImg = pandaImage.append('image')
        .attr('href', 'assets/images/panda-logo.svg')
        .attr('x', -20)
        .attr('y', -20)
        .attr('width', 40)
        .attr('height', 40)
        .style('cursor', 'pointer')
        .style('transition', 'transform 0.2s ease');
    
    // Draw other nodes as circles
    const otherNodes = nodes.filter(n => n.type !== 'center');
    const node = nodeGroup.selectAll('circle.node')
        .data(otherNodes)
        .enter().append('circle')
        .attr('class', 'node')
        .attr('r', d => {
            // Scale node size based on weight
            return d.weight ? Math.max(6, Math.min(14, 6 + d.weight * 0.6)) : (d.type === 'international' ? 10 : 8);
        })
        .attr('fill', d => d.type === 'international' ? '#FFD700' : '#8C1D40')
        .attr('stroke', 'white')
        .attr('stroke-width', 2.5)
        .style('cursor', 'pointer')
        .call(drag(simulation));
    
    // Make panda draggable (but it will stay fixed)
    pandaImage.call(drag(simulation));
    
    // Add labels showing institution and country
    const labelGroup = g.append('g')
        .attr('class', 'labels')
        .selectAll('g')
        .data(nodes)
        .enter().append('g')
        .attr('transform', d => `translate(${d.x},${d.y})`);
    
    // Institution name (first line) - skip center node (panda replaces it)
    labelGroup.filter(d => d.type !== 'center')
        .append('text')
        .attr('dx', 0)
        .attr('dy', -18)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10')
        .attr('font-weight', 'bold')
        .attr('fill', d => d.type === 'international' ? '#FFD700' : '#8C1D40')
        .attr('font-family', 'Arial, sans-serif')
        .text(d => {
            // Truncate long institution names
            const name = d.institution.length > 30 ? d.institution.substring(0, 27) + '...' : d.institution;
            return name;
        })
        .style('pointer-events', 'none')
        .style('text-shadow', '1px 1px 2px rgba(255, 255, 255, 0.9)');
    
    // Country name (second line, only for collaboration nodes)
    labelGroup.filter(d => d.type !== 'center')
        .append('text')
        .attr('dx', 0)
        .attr('dy', -5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9')
        .attr('font-weight', 'normal')
        .attr('fill', d => d.type === 'international' ? '#FFD700' : '#8C1D40')
        .attr('font-family', 'Arial, sans-serif')
        .attr('opacity', 0.8)
        .text(d => d.country)
        .style('pointer-events', 'none')
        .style('text-shadow', '1px 1px 2px rgba(255, 255, 255, 0.9)');
    
    // Mouse position tracking for interactive movement
    let mouseX = 0;
    let mouseY = 0;
    
    // Add mouse move interaction to the SVG
    svg.on('mousemove', function(event) {
        const [x, y] = d3.pointer(event, g.node());
        mouseX = x;
        mouseY = y;
        
        // Add repulsion force from mouse position
        nodes.forEach(n => {
            if (n.type !== 'center') {
                const dx = n.x - mouseX;
                const dy = n.y - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = 80;
                
                if (distance < minDistance) {
                    const force = (minDistance - distance) / minDistance * 5;
                    n.vx = (n.vx || 0) + (dx / distance) * force;
                    n.vy = (n.vy || 0) + (dy / distance) * force;
                }
            }
        });
        
        simulation.alpha(0.3).restart();
    });
    
    // Add hover effects for regular nodes
    node.on('mouseover', function(event, d) {
        tooltip.transition()
            .duration(200)
            .style('opacity', 1);
        
        const tooltipContent = `<strong>${d.institution}</strong><br>${d.country}`;
        
        tooltip.html(tooltipContent)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        
        // Highlight connected nodes
        const connectedIds = new Set([d.id]);
        links.forEach(l => {
            if (l.source.id === d.id || l.target.id === d.id) {
                connectedIds.add(l.source.id === d.id ? l.target.id : l.source.id);
            }
        });
        
        node.style('opacity', n => connectedIds.has(n.id) ? 1 : 0.2);
        link.style('opacity', l => 
            (l.source.id === d.id || l.target.id === d.id) ? 0.9 : 0.1
        );
        labelGroup.style('opacity', n => connectedIds.has(n.id) ? 1 : 0.2);
        pandaImage.style('opacity', connectedIds.has('Minneapolis') ? 1 : 0.2);
        pandaImg.style('transform', connectedIds.has('Minneapolis') ? 'scale(1.1)' : 'scale(1)');
    })
    .on('mouseout', function() {
        tooltip.transition()
            .duration(200)
            .style('opacity', 0);
        
        node.style('opacity', 1);
        link.style('opacity', 0.6);
        labelGroup.style('opacity', 1);
        pandaImage.style('opacity', 1);
    });
    
    // Add hover effects for panda
    pandaImage.on('mouseover', function(event, d) {
        tooltip.transition()
            .duration(200)
            .style('opacity', 1);
        
        const tooltipContent = `<strong>${d.institution}</strong><br>${d.country}`;
        
        tooltip.html(tooltipContent)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        
        // Highlight all connected nodes (all nodes are connected to Minneapolis)
        node.style('opacity', 1);
        link.style('opacity', 0.9);
        labelGroup.style('opacity', 1);
        pandaImg.style('transform', 'scale(1.1)');
    })
    .on('mouseout', function() {
        tooltip.transition()
            .duration(200)
            .style('opacity', 0);
        
        node.style('opacity', 1);
        link.style('opacity', 0.6);
        labelGroup.style('opacity', 1);
        pandaImg.style('transform', 'scale(1)');
    });
    
    // Update positions on simulation tick
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
        
        // Update panda position
        pandaImage.attr('transform', d => `translate(${d.x},${d.y})`);
        
        labelGroup
            .attr('transform', d => `translate(${d.x},${d.y})`);
    });
    
    // Drag function
    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            if (event.subject.type !== 'center') {
                event.subject.fx = null;
                event.subject.fy = null;
            }
        }
        
        return d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended);
    }
});
