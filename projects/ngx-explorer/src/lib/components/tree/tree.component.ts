import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ExplorerService } from '../../services/explorer.service';
import { filter } from 'rxjs/operators';
import { HelperService } from '../../services/helper.service';
import { Subscription } from 'rxjs';
import { INode, ItemModel } from '../../shared/types';

interface TreeNode extends INode {
    children: TreeNode[];
    expanded: boolean;
}

@Component({
    selector: 'nxe-tree',
    templateUrl: './tree.component.html',
    styleUrls: ['./tree.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TreeComponent implements OnDestroy {
    public treeNodes: TreeNode[] = [];
    private expandedIds: number[] = [];
    private sub = new Subscription();
    constructor(private explorerService: ExplorerService, private helperService: HelperService) {
        this.sub.add(this.explorerService.tree.pipe(filter(x => !!x)).subscribe(node => {
            this.addExpandedNode(node.id); // always expand root
            this.treeNodes = this.buildTree(node).children;
        }));
    }

    onClick(node: TreeNode) {
        let allItem: number[] = this.getAllItem(this.treeNodes)
        let sameLayerItems: INode[] = this.getSameLayerItem(node, this.treeNodes)
        sameLayerItems.map(x => {
            if (this.expandedIds.indexOf(x.id) != -1)
                this.removeExpandedNode(x.id)
        })
        this.expandedIds = this.expandedIds.filter(x => allItem.indexOf(x) != -1 || x == 1)
        this.addExpandedNode(node.id);
        this.explorerService.openNode(node.id);
        this.explorerService.expandNode(node.id);
    }
    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }
    private getSameLayerItem(node: TreeNode, treeNodes: TreeNode[]): TreeNode[] {
        for (let item of treeNodes) {
            if (node.id == item.id)
                return treeNodes
            else {
                if (item.children.length > 0)
                    return this.getSameLayerItem(node, item.children)
            }
        }
    }
    private getAllItem(treeNodes: TreeNode[]): number[] {
        let result: number[] = []
        for (let item of treeNodes) {
            result.push(item.id)
            if (item.children.length > 0)
                result.push(...this.getAllItem(item.children))
        }
        return result
    }
    private buildTree(node: INode): TreeNode {
        const treeNode = {
            id: node.id,
            parentId: node.parentId,
            data: node.data,
            isFile: node.isFile,
            children: [],
            expanded: false
        } as TreeNode;

        treeNode.expanded = this.expandedIds.indexOf(node.id) > -1;
        if (treeNode.expanded) {
            treeNode.children = node.children.filter(x => !x.isFile).map(x => this.buildTree(x));
        }
        return treeNode;
    }

    private addExpandedNode(id: number) {
        const index = this.expandedIds.indexOf(id);
        if (index === -1) {
            this.expandedIds.push(id);
        }
    }

    private removeExpandedNode(id: number) {
        const index = this.expandedIds.indexOf(id);
        this.expandedIds.splice(index, 1);
    }

}
