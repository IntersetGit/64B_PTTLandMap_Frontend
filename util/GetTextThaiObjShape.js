import ShapeTextObj from './obj/ShapeText'

export default (text) => {
    const item = ShapeTextObj.find(e => e.key.toLowerCase() === text.toLowerCase())
    return item ? item.value : text.toUpperCase()
}
