function startWebSocket(el){
    let url = `ws://localhost:8000/ws/socket-server/`

    const socket = new WebSocket(url)

    socket.onmessage = function(e){
        let data = JSON.parse(e.data)
        if(data.pos !== undefined){
            console.log('changing to '+data.pos.x+' '+data.pos.y)
            el.style.left = `${data.pos.x}px`
            el.style.top = `${data.pos.y}px`
        }
    }

    var observer = new MutationObserver(function(mutations) {
        var box = el.getBoundingClientRect()
        socket.send(JSON.stringify({'pos': {'x': box.x, 'y': box.y}}))
    });
    
    observer.observe(el, {attributes: true, attributeFilter: ['style']})
}

export default startWebSocket