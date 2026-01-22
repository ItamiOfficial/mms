import { createGraph , mockData} from "./graph";


window.addEventListener("DOMContentLoaded", () => {
    createGraph('#chart-revenue', mockData);
    createGraph('#chart-users', mockData);
});