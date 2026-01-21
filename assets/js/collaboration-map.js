// Static SVG Collaboration Map with Curved Lines - US-focused projection
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
            // US-focused projection: more space for US
            // US gets about 60% of the width
            const usWidth = svgWidth * 0.6;
            const usStartX = svgWidth * 0.1; // Start at 10% from left
            const x = usStartX + ((lng + 125) / 60) * usWidth; // -125 to -65 maps to usWidth
            const y = ((50 - lat) / 25) * (svgHeight * 0.7) + (svgHeight * 0.1); // 25-50 lat maps to 70% of height
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
        { name: 'Iran', lat: 35.6892, lng: 51.3890, type: 'international' },
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
        { name: 'Arizona', lat: 33.4484, lng: -112.0740, type: 'national' }
    ];
    
    const svg = document.getElementById('collaborationMap');
    if (!svg) {
        console.error('SVG element not found');
        return;
    }
    
    const worldMapGroup = document.getElementById('world-map-background');
    const connectionsGroup = document.getElementById('connections');
    const markersGroup = document.getElementById('markers');
    
    if (!connectionsGroup || !markersGroup || !worldMapGroup) {
        console.error('SVG groups not found');
        return;
    }
    
    // Draw world map background with more accurate continent shapes
    // Using a helper function to create smooth paths
    function createContinentPath(points, fillColor, strokeColor) {
        if (points.length < 3) return;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let pathData = '';
        
        points.forEach(([lat, lng], index) => {
            const pt = latLngToSVG(lat, lng);
            if (index === 0) {
                pathData = `M ${pt.x} ${pt.y}`;
            } else {
                pathData += ` L ${pt.x} ${pt.y}`;
            }
        });
        pathData += ' Z';
        
        path.setAttribute('d', pathData);
        path.setAttribute('fill', fillColor);
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', '1');
        path.setAttribute('opacity', '0.35');
        worldMapGroup.appendChild(path);
    }
    
    // North America - United States (detailed outline)
    createContinentPath([
        [49, -125], [48.5, -124], [48, -123], [47.5, -122], [47, -121],
        [46.5, -120], [46, -119], [45.5, -118], [45, -117], [44.5, -116],
        [44, -115], [43.5, -114], [43, -113], [42.5, -112], [42, -111],
        [41.5, -110], [41, -109], [40.5, -108], [40, -107], [39.5, -106],
        [39, -105], [38.5, -104], [38, -103], [37.5, -102], [37, -101],
        [36.5, -100], [36, -99], [35.5, -98], [35, -97], [34.5, -96],
        [34, -95], [33.5, -94], [33, -93], [32.5, -92], [32, -91],
        [31.5, -90], [31, -89], [30.5, -88], [30, -87], [30.5, -88],
        [31, -89], [31.5, -90], [32, -91], [32.5, -92], [33, -93],
        [33.5, -94], [34, -95], [34.5, -96], [35, -97], [35.5, -98],
        [36, -99], [36.5, -100], [37, -101], [37.5, -102], [38, -103],
        [38.5, -104], [39, -105], [39.5, -106], [40, -107], [40.5, -108],
        [41, -109], [41.5, -110], [42, -111], [42.5, -112], [43, -113],
        [43.5, -114], [44, -115], [44.5, -116], [45, -117], [45.5, -118],
        [46, -119], [46.5, -120], [47, -121], [47.5, -122], [48, -123],
        [48.5, -124]
    ], '#b8d4f0', '#6ba3d6');
    
    // Canada region
    createContinentPath([
        [70, -140], [69, -135], [68, -130], [67, -125], [66, -120],
        [65, -115], [64, -110], [63, -105], [62, -100], [61, -95],
        [60, -90], [59, -95], [58, -100], [57, -105], [56, -110],
        [55, -115], [56, -120], [57, -125], [58, -130], [59, -135],
        [60, -140], [61, -135], [62, -130], [63, -125], [64, -130],
        [65, -135], [66, -140], [67, -135], [68, -140]
    ], '#b8d4f0', '#6ba3d6');
    
    // South America
    createContinentPath([
        [12, -80], [10, -78], [8, -76], [6, -74], [4, -72],
        [2, -70], [0, -68], [-2, -66], [-4, -64], [-6, -62],
        [-8, -60], [-10, -58], [-12, -56], [-14, -54], [-16, -52],
        [-18, -50], [-20, -48], [-22, -46], [-24, -44], [-26, -42],
        [-28, -40], [-26, -38], [-24, -40], [-22, -42], [-20, -44],
        [-18, -46], [-16, -48], [-14, -50], [-12, -52], [-10, -54],
        [-8, -56], [-6, -58], [-4, -60], [-2, -62], [0, -64],
        [2, -66], [4, -68], [6, -70], [8, -72], [10, -74]
    ], '#b8d4f0', '#6ba3d6');
    
    // Europe
    createContinentPath([
        [71, -10], [70, -8], [69, -6], [68, -4], [67, -2],
        [66, 0], [65, 2], [64, 4], [63, 6], [62, 8],
        [61, 10], [60, 12], [59, 10], [58, 8], [57, 6],
        [56, 4], [55, 2], [54, 0], [53, -2], [52, -4],
        [51, -6], [52, -8], [53, -10], [54, -8], [55, -6],
        [56, -4], [57, -2], [58, 0], [59, 2], [60, 4],
        [61, 6], [62, 4], [63, 2], [64, 0], [65, -2],
        [66, -4], [67, -6], [68, -8]
    ], '#d4c5a9', '#b8a082');
    
    // Asia - China Mainland
    createContinentPath([
        [50, 75], [49, 80], [48, 85], [47, 90], [46, 95],
        [45, 100], [44, 105], [43, 110], [42, 115], [41, 120],
        [40, 125], [39, 120], [38, 115], [37, 110], [36, 105],
        [35, 100], [36, 95], [37, 90], [38, 85], [39, 80],
        [40, 75], [41, 78], [42, 80], [43, 82], [44, 84],
        [45, 86], [46, 88], [47, 90], [48, 88], [49, 86]
    ], '#d4c5a9', '#b8a082');
    
    // Middle East / Iran
    createContinentPath([
        [42, 44], [41, 46], [40, 48], [39, 50], [38, 52],
        [37, 50], [36, 48], [35, 46], [34, 44], [33, 42],
        [34, 40], [35, 42], [36, 44], [37, 46], [38, 48],
        [39, 46], [40, 44]
    ], '#d4c5a9', '#b8a082');
    
    // Taiwan / Hong Kong region
    createContinentPath([
        [25, 118], [24, 120], [23, 122], [22, 124], [21, 126],
        [22, 128], [23, 126], [24, 124]
    ], '#d4c5a9', '#b8a082');
    
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
        
        // Add location label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', targetSVG.x);
        text.setAttribute('y', targetSVG.y - 15);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '11');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', color);
        text.setAttribute('font-family', 'Arial, sans-serif');
        text.textContent = collab.name;
        markersGroup.appendChild(text);
    });
    
    // Add Minneapolis marker (larger, different style)
    const minneapolisCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    minneapolisCircle.setAttribute('cx', minneapolisSVG.x);
    minneapolisCircle.setAttribute('cy', minneapolisSVG.y);
    minneapolisCircle.setAttribute('r', '10');
    minneapolisCircle.setAttribute('fill', '#8C1D40');
    minneapolisCircle.setAttribute('stroke', '#FFD700');
    minneapolisCircle.setAttribute('stroke-width', '4');
    markersGroup.appendChild(minneapolisCircle);
    
    // Add inner circle for Minneapolis
    const minneapolisInner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    minneapolisInner.setAttribute('cx', minneapolisSVG.x);
    minneapolisInner.setAttribute('cy', minneapolisSVG.y);
    minneapolisInner.setAttribute('r', '5');
    minneapolisInner.setAttribute('fill', '#FFD700');
    markersGroup.appendChild(minneapolisInner);
    
    // Add Minneapolis label
    const minneapolisText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    minneapolisText.setAttribute('x', minneapolisSVG.x);
    minneapolisText.setAttribute('y', minneapolisSVG.y - 20);
    minneapolisText.setAttribute('text-anchor', 'middle');
    minneapolisText.setAttribute('font-size', '14');
    minneapolisText.setAttribute('font-weight', 'bold');
    minneapolisText.setAttribute('fill', '#8C1D40');
    minneapolisText.setAttribute('font-family', 'Arial, sans-serif');
    minneapolisText.textContent = 'Minneapolis, MN';
    markersGroup.appendChild(minneapolisText);
});
