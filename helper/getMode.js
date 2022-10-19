const { getDB } = require("../lib/firebase");

module.exports = async function Helper_getMode() {
  try {
    return await getDB("mode");
  } catch (err) {
    console.log(`Error: ${err}`);
    return null;
  }
};
