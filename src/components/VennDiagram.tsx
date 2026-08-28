import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface VennDiagramProps {
  currentUserInterests: string[];
  targetUserInterests: string[];
  currentUserName: string;
  targetUserName: string;
}

export const VennDiagram: React.FC<VennDiagramProps> = ({
  currentUserInterests = [],
  targetUserInterests = [],
  currentUserName = 'You',
  targetUserName = 'Match'
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 320;
    const height = 220;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const container = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g');

    // Calculate sets
    const setA = new Set(currentUserInterests);
    const setB = new Set(targetUserInterests);
    const intersection = currentUserInterests.filter(i => setB.has(i));
    const onlyA = currentUserInterests.filter(i => !setB.has(i));
    const onlyB = targetUserInterests.filter(i => !setB.has(i) && !setA.has(i)); // or just target not in intersection

    // Circles
    const r = 75;
    const cx1 = 105;
    const cx2 = 215;
    const cy = 110;

    // Gradient defs
    const defs = svg.append('defs');

    const gradA = defs.append('radialGradient').attr('id', 'gradA');
    gradA.append('stop').attr('offset', '0%').attr('stop-color', '#3B82F6').attr('stop-opacity', '0.4');
    gradA.append('stop').attr('offset', '100%').attr('stop-color', '#1D4ED8').attr('stop-opacity', '0.2');

    const gradB = defs.append('radialGradient').attr('id', 'gradB');
    gradB.append('stop').attr('offset', '0%').attr('stop-color', '#EC4899').attr('stop-opacity', '0.4');
    gradB.append('stop').attr('offset', '100%').attr('stop-color', '#BE185D').attr('stop-opacity', '0.2');

    // Circle 1 (You)
    container.append('circle')
      .attr('cx', cx1)
      .attr('cy', cy)
      .attr('r', r)
      .attr('fill', 'url(#gradA)')
      .attr('stroke', '#3B82F6')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,2');

    // Circle 2 (Target)
    container.append('circle')
      .attr('cx', cx2)
      .attr('cy', cy)
      .attr('r', r)
      .attr('fill', 'url(#gradB)')
      .attr('stroke', '#EC4899')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,2');

    // Labels for circles
    container.append('text')
      .attr('x', cx1 - 30)
      .attr('y', cy - r - 8)
      .attr('fill', '#93C5FD')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text(currentUserName);

    container.append('text')
      .attr('x', cx2 - 10)
      .attr('y', cy - r - 8)
      .attr('fill', '#F472B6')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text(targetUserName);

    // Render items unique to A
    const maxDisplay = 3;
    const displayOnlyA = onlyA.slice(0, maxDisplay);
    displayOnlyA.forEach((tag, idx) => {
      const angle = -0.5 + idx * 0.4;
      const tx = cx1 - 35 + Math.cos(angle) * 25;
      const ty = cy + (idx - 1) * 22;

      container.append('rect')
        .attr('x', tx - 25)
        .attr('y', ty - 10)
        .attr('width', 52)
        .attr('height', 20)
        .attr('rx', 10)
        .attr('fill', '#1E3A8A')
        .attr('opacity', 0.8);

      container.append('text')
        .attr('x', tx)
        .attr('y', ty + 4)
        .attr('fill', '#93C5FD')
        .attr('font-size', '9px')
        .attr('text-anchor', 'middle')
        .text(tag.length > 7 ? tag.substring(0, 6) + '..' : tag);
    });

    // Render items unique to B
    const displayOnlyB = targetUserInterests.filter(i => !setA.has(i)).slice(0, maxDisplay);
    displayOnlyB.forEach((tag, idx) => {
      const ty = cy + (idx - 1) * 22;
      const tx = cx2 + 25;

      container.append('rect')
        .attr('x', tx - 25)
        .attr('y', ty - 10)
        .attr('width', 52)
        .attr('height', 20)
        .attr('rx', 10)
        .attr('fill', '#831843')
        .attr('opacity', 0.8);

      container.append('text')
        .attr('x', tx)
        .attr('y', ty + 4)
        .attr('fill', '#F472B6')
        .attr('font-size', '9px')
        .attr('text-anchor', 'middle')
        .text(tag.length > 7 ? tag.substring(0, 6) + '..' : tag);
    });

    // Render Intersection (Shared)
    const displayIntersection = intersection.slice(0, 3);
    displayIntersection.forEach((tag, idx) => {
      const ty = cy + (idx - 1) * 18;

      container.append('rect')
        .attr('x', 145)
        .attr('y', ty - 9)
        .attr('width', 30)
        .attr('height', 18)
        .attr('rx', 6)
        .attr('fill', '#F59E0B')
        .attr('stroke', '#FEF3C7')
        .attr('stroke-width', 1);

      container.append('text')
        .attr('x', 160)
        .attr('y', ty + 3)
        .attr('fill', '#000000')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .text(tag.length > 6 ? tag.substring(0, 5) + '..' : tag);
    });

    if (displayIntersection.length === 0) {
      container.append('text')
        .attr('x', 160)
        .attr('y', cy + 4)
        .attr('fill', '#FBBF24')
        .attr('font-size', '9px')
        .attr('font-style', 'italic')
        .attr('text-anchor', 'middle')
        .text('No overlap yet');
    }

  }, [currentUserInterests, targetUserInterests, currentUserName, targetUserName]);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 shadow-inner flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-1">
        <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
          <span>🟣🔵</span> Shared Interest Venn Diagram
        </span>
        <span className="text-[9px] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full font-semibold border border-amber-500/30">
          D3.js Live
        </span>
      </div>
      <svg ref={svgRef} className="w-full h-48" />
      <p className="text-[10px] text-neutral-400 text-center mt-1">
        Overlapping region highlights shared interest tags between you and {targetUserName}.
      </p>
    </div>
  );
};
