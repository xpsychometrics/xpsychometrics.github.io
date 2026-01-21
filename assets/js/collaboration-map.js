// Static SVG Collaboration Map with Curved Lines - Using D3.js for accurate world map
document.addEventListener('DOMContentLoaded', function() {
    // SVG viewBox dimensions
    const svgWidth = 1200;
    const svgHeight = 600;
    
    // Custom projection that gives higher resolution to the US
    function latLngToSVG(lat, lng) {
        // For US locations, use a more detailed projection
        // US roughly spans: lat 25-50, lng -125 to -65
        
        // Check if location is in US (rough bounds)
        const isUS = lng >= -125 && lng <= -65 && lat >= 25 && lat <= 50;
        
        if (isUS) {
            // US-focused projection: more space for US with better spread
            // US gets about 70% of the width for better spacing
            const usWidth = svgWidth * 0.70;
            const usStartX = svgWidth * 0.05; // Start at 5% from left
            // Add more spread by using a wider range
            const lngRange = 60; // -125 to -65
            const lngOffset = lng + 125; // Normalize to 0-60
            // Use a non-linear scaling to spread out clustered areas more
            // Apply a slight expansion for better readability
            const x = usStartX + (lngOffset / lngRange) * usWidth;
            // For Y, use more of the height and add more vertical spread
            const latRange = 25; // 25 to 50
            const latOffset = lat - 25; // Normalize to 0-25
            // Use more vertical space (75% of height) for better spread
            const y = (svgHeight * 0.12) + ((latRange - latOffset) / latRange) * (svgHeight * 0.75);
            return { x, y };
        } else {
            // International locations: use remaining space
            // International gets 30% of width (right side)
            const intWidth = svgWidth * 0.3;
            const intStartX = svgWidth * 0.7;
            
            // Map international locations to the right side
            // Europe/Asia: roughly lng -10 to 140
            let x;
            if (lng < 0) {
                // Europe/Western locations
                x = intStartX + ((lng + 10) / 10) * (intWidth * 0.3); // -10 to 0
            } else {
                // Asia/Eastern locations
                x = intStartX + (intWidth * 0.3) + ((lng) / 140) * (intWidth * 0.7); // 0 to 140
            }
            
            const y = ((90 - lat) / 180) * svgHeight;
            return { x, y };
        }
    }
    
    // Minneapolis coordinates
    const minneapolis = { lat: 44.9778, lng: -93.2650 };
    const minneapolisSVG = latLngToSVG(minneapolis.lat, minneapolis.lng);
    
    // Collaboration locations
    const collaborations = [
        { name: 'China Mainland', lat: 39.9042, lng: 116.4074, type: 'international' },
        { name: 'Taiwan', lat: 25.0330, lng: 121.5654, type: 'international' },
        { name: 'Spain', lat: 40.4168, lng: -3.7038, type: 'international' },
        { name: 'Germany', lat: 52.5200, lng: 13.4050, type: 'international' },
        { name: 'Hong Kong', lat: 22.3193, lng: 114.1694, type: 'international' },
        { name: 'Arkansas', lat: 34.7465, lng: -92.2896, type: 'national' },
        { name: 'Indiana', lat: 39.7684, lng: -86.1581, type: 'national' },
        { name: 'Washington DC', lat: 38.9072, lng: -77.0369, type: 'national' },
        { name: 'Alabama', lat: 32.3617, lng: -86.2791, type: 'national' },
        { name: 'North Carolina', lat: 35.7796, lng: -78.6382, type: 'national' },
        { name: 'New York', lat: 40.7128, lng: -74.0060, type: 'national' },
        { name: 'Georgia', lat: 33.7490, lng: -84.3880, type: 'national' },
        { name: 'Texas', lat: 30.2672, lng: -97.7431, type: 'national' },
        { name: 'Washington', lat: 47.6062, lng: -122.3321, type: 'national' },
        { name: 'Michigan', lat: 42.3314, lng: -83.0458, type: 'national' },
        { name: 'New Jersey', lat: 40.2206, lng: -74.7597, type: 'national' },
        { name: 'Arizona', lat: 33.4484, lng: -112.0740, type: 'national' },
        { name: 'Maryland', lat: 39.0458, lng: -76.6413, type: 'national' },
        { name: 'Virginia', lat: 37.5407, lng: -77.4360, type: 'national' },
        { name: 'Illinois', lat: 39.7983, lng: -89.6441, type: 'national' }
    ];
    
    const svg = document.getElementById('collaborationMap');
    const connectionsGroup = document.getElementById('connections');
    const markersGroup = document.getElementById('markers');
    
    if (!svg || !connectionsGroup || !markersGroup) {
        console.error('SVG elements not found');
        return;
    }
    
    // Draw curved lines from Minneapolis to each location
    collaborations.forEach(collab => {
        const targetSVG = latLngToSVG(collab.lat, collab.lng);
        const color = collab.type === 'international' ? '#FFD700' : '#8C1D40';
        const strokeWidth = collab.type === 'international' ? 2.5 : 2;
        
        // Calculate control point for curved line (bezier curve)
        const midX = (minneapolisSVG.x + targetSVG.x) / 2;
        const midY = (minneapolisSVG.y + targetSVG.y) / 2;
        
        // Create a curved arc by offsetting the midpoint
        const distance = Math.sqrt(
            Math.pow(targetSVG.x - minneapolisSVG.x, 2) + 
            Math.pow(targetSVG.y - minneapolisSVG.y, 2)
        );
        const curvature = distance * 0.4; // Adjust curvature amount
        
        // Determine curve direction based on relative positions
        const dx = targetSVG.x - minneapolisSVG.x;
        const direction = dx > 0 ? -1 : 1;
        const controlY = midY + (direction * curvature);
        
        // Create curved path using quadratic bezier
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const pathData = `M ${minneapolisSVG.x} ${minneapolisSVG.y} Q ${midX} ${controlY} ${targetSVG.x} ${targetSVG.y}`;
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('fill', 'none');
        path.setAttribute('opacity', '0.7');
        path.setAttribute('stroke-dasharray', '6,4');
        connectionsGroup.appendChild(path);
        
        // Add marker circle at destination
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', targetSVG.x);
        circle.setAttribute('cy', targetSVG.y);
        circle.setAttribute('r', collab.type === 'international' ? '7' : '6');
        circle.setAttribute('fill', color);
        circle.setAttribute('stroke', 'white');
        circle.setAttribute('stroke-width', '2.5');
        markersGroup.appendChild(circle);
        
        // Store position for overlap detection
        collab.svgX = targetSVG.x;
        collab.svgY = targetSVG.y;
        
        // Add hover effects to circle
        circle.setAttribute('class', 'collaboration-marker');
        circle.setAttribute('data-location', collab.name);
        circle.style.cursor = 'pointer';
        
        // Hover effect - slightly enlarge marker
        circle.addEventListener('mouseenter', function() {
            circle.setAttribute('r', (collab.type === 'international' ? '9' : '8'));
        });
        
        circle.addEventListener('mouseleave', function() {
            circle.setAttribute('r', (collab.type === 'international' ? '7' : '6'));
        });
    });
    
    // Function to find optimal label position to avoid overlaps
    function findLabelPosition(x, y, existingLabels, labelText) {
        const minDistance = 50; // Minimum distance between labels
        const offsets = [
            { x: 0, y: -20, anchor: 'middle' },  // Above
            { x: 25, y: 0, anchor: 'start' },     // Right
            { x: -25, y: 0, anchor: 'end' },     // Left
            { x: 0, y: 20, anchor: 'middle' },   // Below
            { x: 30, y: -15, anchor: 'start' },  // Top-right
            { x: -30, y: -15, anchor: 'end' },    // Top-left
            { x: 30, y: 15, anchor: 'start' },   // Bottom-right
            { x: -30, y: 15, anchor: 'end' }     // Bottom-left
        ];
        
        for (let offset of offsets) {
            const testX = x + offset.x;
            const testY = y + offset.y;
            let tooClose = false;
            
            // Check distance from existing labels
            for (let existing of existingLabels) {
                const distance = Math.sqrt(
                    Math.pow(testX - existing.x, 2) + Math.pow(testY - existing.y, 2)
                );
                if (distance < minDistance) {
                    tooClose = true;
                    break;
                }
            }
            
            if (!tooClose) {
                return { x: testX, y: testY, anchor: offset.anchor };
            }
        }
        
        // If all positions are too close, use the first offset anyway
        return { x: x + offsets[0].x, y: y + offsets[0].y, anchor: offsets[0].anchor };
    }
    
    // Store all label positions
    const labelPositions = [];
    
    // Add Minneapolis marker (larger, different style)
    const minneapolisCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    minneapolisCircle.setAttribute('cx', minneapolisSVG.x);
    minneapolisCircle.setAttribute('cy', minneapolisSVG.y);
    minneapolisCircle.setAttribute('r', '10');
    minneapolisCircle.setAttribute('fill', '#8C1D40');
    minneapolisCircle.setAttribute('stroke', '#FFD700');
    minneapolisCircle.setAttribute('stroke-width', '4');
    minneapolisCircle.setAttribute('class', 'collaboration-marker');
    minneapolisCircle.style.cursor = 'pointer';
    markersGroup.appendChild(minneapolisCircle);
    
    // Add inner circle for Minneapolis
    const minneapolisInner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    minneapolisInner.setAttribute('cx', minneapolisSVG.x);
    minneapolisInner.setAttribute('cy', minneapolisSVG.y);
    minneapolisInner.setAttribute('r', '5');
    minneapolisInner.setAttribute('fill', '#FFD700');
    markersGroup.appendChild(minneapolisInner);
    
    // Add Minneapolis label with smart positioning
    const minneapolisLabelPos = findLabelPosition(minneapolisSVG.x, minneapolisSVG.y, labelPositions, 'Minneapolis, MN');
    labelPositions.push({ x: minneapolisLabelPos.x, y: minneapolisLabelPos.y });
    
    const minneapolisText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    minneapolisText.setAttribute('x', minneapolisLabelPos.x);
    minneapolisText.setAttribute('y', minneapolisLabelPos.y);
    minneapolisText.setAttribute('text-anchor', minneapolisLabelPos.anchor);
    minneapolisText.setAttribute('font-size', '13');
    minneapolisText.setAttribute('font-weight', 'bold');
    minneapolisText.setAttribute('fill', '#8C1D40');
    minneapolisText.setAttribute('font-family', 'Arial, sans-serif');
    minneapolisText.setAttribute('class', 'location-label');
    minneapolisText.textContent = 'Minneapolis, MN';
    markersGroup.appendChild(minneapolisText);
    
    // Hover effect for Minneapolis
    minneapolisCircle.addEventListener('mouseenter', function() {
        minneapolisCircle.setAttribute('r', '12');
    });
    
    minneapolisCircle.addEventListener('mouseleave', function() {
        minneapolisCircle.setAttribute('r', '10');
    });
    
    // Now add labels for all collaboration locations
    collaborations.forEach(collab => {
        const targetSVG = { x: collab.svgX, y: collab.svgY };
        const color = collab.type === 'international' ? '#FFD700' : '#8C1D40';
        
        // Find optimal label position
        const labelPos = findLabelPosition(targetSVG.x, targetSVG.y, labelPositions, collab.name);
        labelPositions.push({ x: labelPos.x, y: labelPos.y });
        
        // Add location label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelPos.x);
        text.setAttribute('y', labelPos.y);
        text.setAttribute('text-anchor', labelPos.anchor);
        text.setAttribute('font-size', '11');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', color);
        text.setAttribute('font-family', 'Arial, sans-serif');
        text.setAttribute('class', 'location-label');
        text.textContent = collab.name;
        markersGroup.appendChild(text);
    });
});
