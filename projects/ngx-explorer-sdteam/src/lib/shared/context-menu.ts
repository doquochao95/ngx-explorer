export class ContextMenu {
    label: string;
    icon: string;
    action: () => void;
    submenu: ContextMenu[];
    disabled: boolean;
    visible: boolean; // only used to hide or show sub menu
    active: boolean;
    isSeperate: boolean;
    constructor(
        label: string,
        icon: string,
        action: () => void | null,
        submenu: ContextMenu[] = null,
        disabled = false,
        visible = false,
        active = false,
        isSeperate = false
    ) {
        this.label = label;
        this.icon = icon;
        this.action = action;
        this.submenu = submenu;
        this.disabled = disabled;
        this.visible = visible;
        this.active = active;
        this.isSeperate = isSeperate;
    }
}
