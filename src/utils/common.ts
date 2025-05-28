class Utils {
    static isEmpty(value:any) {
        if (value === undefined || value === null) return true;
        if (typeof value === 'string' && value.trim() === '') return true;
        if (Array.isArray(value) && value.length === 0) return true;
        if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return true;
        return false;
    }

    static isUndefined(value:any) {
        return value === undefined;
    }
}



export default Utils;