const config = require(`./dev`);
// edit to ./prod on production mode
// edit to ./dev on develop mode

export default Object.freeze(Object.assign({}, config.default));
