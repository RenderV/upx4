import { useLoaderData } from "react-router-dom"

function Test(){
    const id = useLoaderData()
    return(<p class="test-class">{id}</p>)
}

function loader( { params } ){
    const { id } = params
    return id
}

export {Test, loader}