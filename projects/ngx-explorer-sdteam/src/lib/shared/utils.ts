import { filter } from 'rxjs/operators';
import { INode, Dictionary } from './types';

export class Utils {
    private static id = 0;
    private static filter : RegExp = /[/:*?"<>|\\]+/
    static checkSpecialChar(str: string) {
        return this.filter.test(str) ? false : true
    }
    static createNode(parentId = 0, isFolder = true, data?: any): INode {
        const id = ++this.id;
        return {
            id,
            parentId,
            data,
            isFolder,
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
}
