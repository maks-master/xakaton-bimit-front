export default config => selection => {
  let {
    timeScale,
    height,
    onEventClick
  } = config

  let events = selection.selectAll('g.event').data(selection.data()[0][0])
  
//   .attr('transform', d => `translate(${timeScale(d.start)} ${d.position*22})`)

  let g = events
    .enter()
    .append('g')
    .classed('event', true)
    .attr('transform', d => `translate(${timeScale(d.start)} 0)`)
    .on('click', onEventClick)
  
    // .attr('height', 20)
  g.append('rect')
    .attr('width', d => d.end ? timeScale(d.end)-timeScale(d.start) : 10)
    .attr('height', height)
    .attr('fill', 'rgba(85, 187, 238, 0.2)')
    // .attr('ry', 6)

  g.append('text')
    .attr('dy', '1em')
    .style('pointer-events', 'none')
    .text(d => d.name)


    // .attr('transform', d => `translate(${timeScale(d.start)} ${d.position*22})`)

  events
    .attr('transform', d => `translate(${timeScale(d.start)} 0)`)
    .selectAll('rect')
    .attr('width', d => d.end ? timeScale(d.end)-timeScale(d.start) : 10)
  
  // events
  //     .exit()
  //     .on('click', null)
  //     .remove()


}