import { INode, Dictionary } from './types';

export class Utils {
    private static id = 0;
    static createNode(parentId = 0, isFile = false, data?: any): INode {
        const id = ++this.id;
        return {
            id,
            parentId,
            data,
            isFile,
            children: []
        };
    }
    static buildBreadcrumbs(flatPointers: Dictionary<INode>, node: INode) {
        const pieces = [] as INode[];
        let currentNode = node;
        while (true) {
            pieces.unshift(currentNode);
            if (currentNode.parentId) {
                currentNode = flatPointers[currentNode.parentId];
            } else {
                break;
            }
        }
        return pieces;
    }
    static compareObjects(a: any, b: any) {
        return JSON.stringify(a) === JSON.stringify(b);
    }
    static formatBytes(bytes: any, decimals = 2): string {
        if (!+bytes) return '0 Bytes'
        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }
    static getDateTimeFormat(date: Date) {
        return (
            date.getFullYear() +
            "/" +
            (date.getMonth() + 1 < 10
                ? "0" + (date.getMonth() + 1)
                : date.getMonth() + 1) +
            "/" +
            (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) +
            " " +
            (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) +
            ":" +
            (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) +
            ":" +
            (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds())
        );
    }
    static getFileType(typeString: string): string {
        if (typeString.indexOf('excel') > -1 || typeString.indexOf('sheet') > -1)
            return 'Excel File'
        if (typeString.indexOf('word') > -1)
            return 'Word File'
        if (typeString.indexOf('presentation') > -1)
            return 'PowerPoint File'
        if (typeString.indexOf('image') > -1)
            return 'Image File'
        if (typeString.indexOf('video') > -1)
            return 'Video File'
        return 'Other File'
    }
}
