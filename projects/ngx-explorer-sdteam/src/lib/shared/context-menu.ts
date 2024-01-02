export class ContextMenu {
    label: string;
    icon: string;
    action: () => void;
    submenu: ContextMenu[];
    isSeperate: boolean;
    isHided: boolean;
    isDisabled: boolean;
    isVisibled: boolean
    isActived: boolean;
    constructor(
        label: string,
        icon: string,
        action: () => void | null,
        submenu: ContextMenu[] = null,
        isSeperate = false,
        isHided = false,
        isDisabled = false,
        isVisibled = false,
        isActived = false
    ) {
        this.label = label;
        this.icon = icon;
        this.action = action;
        this.submenu = submenu;
        this.isSeperate = isSeperate;
        this.isHided = isHided;
        this.isDisabled = isDisabled;
        this.isVisibled = isVisibled
        this.isActived = isActived
    }
}
