// external import
import NodeCache from "node-cache";

// create cache instance
const cache = new NodeCache({ stdTTL: 2 * 24 * 3600, checkperiod: 10 * 60 });

// export
export default cache;
