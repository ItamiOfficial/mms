export type Table = {
    //headers: Array<{name: string, type: 'number' | 'assignment'}>,
    headers: string[],
    entries: any[],
};

export const parseCSV = (csvText: string): Table => {
    // split lines 
    // '\r?\n' makes it work on windows(\r\n) and mac/linus(\r)
    // filter removes empty space
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== "");
    
    // extract headers, only split by ',' if they are not within ""
    // map removes empty space and " symbols
    const headers = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => h.replace(/"/g, '').trim());
    let entries: any[] = [];

    lines.slice(1).map(line => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        entries.push(values);
    });

    return {
        headers: headers,
        entries: entries,
    }
};
