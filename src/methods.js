import { assign } from './lib.js';
export default {

    /**
     * set Options
     * @param {Obj} options 
     */
    setOptions(options = {}) {
        this.options = assign({}, this.options, $.isPlainObject(options) && options);
        this.init(this.options);
    },

    select(id) {
        try {
            let root = this.t.getNode(0);
            let node = this.findNode(root, id);
            this.selectThisNode(node);

            this.pushSelected();

            // 更新return item list
            this.returnItem = this.selectItem;


            if (this.returnItem.length > 0) {

                // 宣告回傳字串
                let str = "";
                this.returnItem.forEach((item) => {
                    str += `${item.text}, `;
                });

                // 更新回傳字串(移除string後面的', ')
                $(`${this.elem}ModalBtn > p`).text(str.slice(0, -2));

            } else {

                // 若沒有tags要回傳，設回傳字串為default
                $(`${this.elem}ModalBtn > p`).text(this.options.texts.selectText);

            }
        } catch (error) {
            console.log(error);
        }
    },
    unselect(id) {
        try {
            let root = this.t.getNode(0);
            let node = this.findNode(root, id);
            this.unSelectThisNode(node);

            this.pushSelected();

            // 更新return item list
            this.returnItem = this.selectItem;


            if (this.returnItem.length > 0) {

                // 宣告回傳字串
                let str = "";
                this.returnItem.forEach((item) => {
                    str += `${item.text}, `;
                });

                // 更新回傳字串(移除string後面的', ')
                $(`${this.elem}ModalBtn > p`).text(str.slice(0, -2));

            } else {

                // 若沒有tags要回傳，設回傳字串為default
                $(`${this.elem}ModalBtn > p`).text(this.options.texts.selectText);

            }
        } catch (error) {
            console.log(error);
        }
    },




    /**
     * get node
     * @param {String} id 
     * @returns {Obj} node obj
     */
    getNode(id) {
        let ele = this.treeElem;
        let root = this.t.getNode(0);
        let node = this.findNode(root, id);
        if (node) return node;
        else return -1;
    },

    /**
     * get Parent
     * @param {String} id
     * @return {Obj} node Obj
     */
    getParent(id) {
        let node = this.getNode(id);
        if (node.parentId >= 0) {
            let ele = this.treeElem;
            let parent = this.t.getParent(node);
            return parent;
        } else {
            return -1;
        }
    },

    /**
     * get Siblings
     * @param {String} id
     * @return {Array} an array of node Obj
     */
    getSiblings(id) {
        let node = this.getNode(id);
        let ele = this.treeElem;
        let siblings = this.t.getSiblings(node);
        return siblings;
    },

    /**
     * get Childs
     * @param {String} id
     * @return {Array} an array of node Obj
     */
    getChilds(id) {
        let node = this.getNode(id);
        return node.nodes;
    },

    /**
     * get Selected Tags
     * @param {String} id
     * @return {Array} an array of node Obj
     */
    getSelectedTags() {
        let arr = [];
        this.returnItem.forEach((item) => {
            arr.push(item.id);
        });
        return this.returnItem;
    },

    /**
     * get All Selected Nodes
     * @param {String} id
     * @return {Array} an array of node Obj
     */
    getSelected() {
        let ele = this.treeElem;
        let selected = this.t.getSelected();
        return selected;
    },

    /**
     * get All Unselected Nodes
     * @param {String} id
     * @return {Array} an array of node Obj
     */
    getUnselected() {
        let ele = this.treeElem;
        let selected = this.t.getUnselected();
        return selected;
    },

    /**
     * open edit dialog
     * @param {Object} options 
     */
    openEditDialog(options = {}) {
        this.showEditDialog(options);
    },

    /**
     * open delete dialog
     * @param {Object} options 
     */
    openDeleteDialog(options = {}) {
        this.showDeleteDialog(options);
    },

    /**
     * Update Node
     * @param {Object} node 
     * @returns {Boolean} if this update is successful or not
     */
    updateNode(node) {
        try {

            // 指向DOM
            let ele = this.treeElem;

            // 更新node
            let tmp = this.getNode(node.id);
            tmp.text = node.text;

            // 更新 selected tag
            $(`[nodeid="${node.nodeId}"]`).text(tmp.text);

            // 重新渲染
            this.t.render();

            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    },

    /**
     * AddNode
     * @param {Object} node 
     * @returns {Boolean} if this addition is successful or not
     */
    addNode(parent, newNode) {

        // 指向DOM
        let ele = this.treeElem;

        try {

            // push node
            // - return -1 : this id has already exist
            // - return node obj : successfully pushed
            let node = this.t.pushNode({ p: parent, n: newNode });

            if (node == -1) {
                return false;
            } else {
                // 重新渲染
                this.t.render();
                // 展開
                this.t.expandNode(parent.nodeId, { levels: 1, silent: true });

                // 如果parent是selected，新增的node也要select起來
                if (parent.state.selected) {
                    this.t.selectNode(node.nodeId, { silent: true });
                    this.t.checkNode(node.nodeId, { silent: true });
                }
                return true;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
    },

    /**
     * Delete Node
     * @param {Object} node 
     * @returns {Boolean} if this deletion is successful or not
     */
    deleteNode(node) {

        // 指向DOM
        let ele = this.treeElem;
        try {

            if (node.nodeId) {
                let parent = this.t.getNode(node.parentId);
                // pop node
                this.t.popNode({ p: parent, n: node });
                // 重新渲染
                this.t.render();
                this.pushSelected();
            } else {
                alert("無法刪除root!");
            }
        } catch (error) {
            console.log(error);
            return false;
        }
        return true;
    }
};