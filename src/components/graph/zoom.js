import * as d3 from 'd3'

export default (config) => {
  let {
    timeScale,
    view,
    draw,
  } = config

  return d3.zoom()
    .on('zoom', () => {
      let { k, x, y } = d3.event.transform

      let scale = d3.zoomIdentity
        .translate(x,y)
        .scale(k)
        .rescaleX(timeScale)

      view.call(draw(scale))
    })
}