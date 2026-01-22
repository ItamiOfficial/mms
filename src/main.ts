import { createGraph , mockData} from "./graph/graph";
import '../styling/custom.scss';

createGraph('#chart-revenue', mockData);
createGraph('#chart-users', mockData);

/*
window.addEventListener("DOMContentLoaded", () => {
    createGraph('#chart-revenue', mockData);
    createGraph('#chart-users', mockData);
});
*/