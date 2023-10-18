export const base_uri = "http://127.0.0.1:8000/api/"

export async function postSelection(selection) {
    const api_uri = "http://127.0.0.1:8000/api/parking_spaces/"
    const polygons = selection.map((pol) => pol.map((point) => [point.x, point.y]))
    const response = await fetch(api_uri, {
        method: "PUT",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "camera_id": 1,
            "polygons": polygons
        }),
    });
    return response.json();
}

export async function getSelection(callback) {
    const api_uri = base_uri + "cams/1/"
    const response = await fetch(api_uri)
    const camera = await response.json()
    const polygons = camera.parking_spaces[0].polygons
    callback(polygons)
}